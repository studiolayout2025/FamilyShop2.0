import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { authenticateToken, requireRole, generateToken, AuthRequest } from "./middleware/auth";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertDonationSchema } from "@shared/schema";

// Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Usuário já existe" });
      }
      
      const user = await storage.createUser(userData);
      const token = generateToken(user.id);
      
      // Store session token
      await storage.updateUserSession(user.id, token);
      
      res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.isBlocked) {
        return res.status(401).json({ message: "Invalid credentials or blocked account" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = generateToken(user.id);
      await storage.updateUserSession(user.id, token);
      
      res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.updateUserSession(req.user.id, "");
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, maxPrice, search } = req.query;
      const products = await storage.getProducts({
        category: category as string,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        searchTerm: search as string
      });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...productData,
        sellerId: req.user.id
      });
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireRole(['developer']), async (req: AuthRequest, res) => {
    try {
      const updates = req.body;
      const product = await storage.updateProduct(req.params.id, updates);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireRole(['developer']), async (req: AuthRequest, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products/:id/block", authenticateToken, requireRole(['developer']), async (req: AuthRequest, res) => {
    try {
      await storage.blockProduct(req.params.id);
      res.json({ message: "Product blocked successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products/reset", authenticateToken, requireRole(['developer']), async (req: AuthRequest, res) => {
    try {
      await storage.resetAllProducts();
      res.json({ message: "All products reset successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Order routes
  app.get("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const product = await storage.getProduct(orderData.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const order = await storage.createOrder({
        ...orderData,
        buyerId: req.user.id,
        sellerId: product.sellerId
      });
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { amount, orderId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "brl",
        metadata: {
          orderId: orderId || "",
          userId: req.user.id
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/create-donation-payment", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      
      const donation = await storage.createDonation({
        ...donationData,
        userId: req.user.id
      });
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(donationData.amount) * 100),
        currency: "brl",
        metadata: {
          donationId: donation.id,
          userId: req.user.id
        }
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        donationId: donation.id 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating donation payment: " + error.message });
    }
  });

  // Webhook for Stripe events
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body, 
        sig!, 
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { orderId, donationId, userId } = paymentIntent.metadata;
        
        if (orderId) {
          await storage.updateOrderStatus(orderId, 'completed', paymentIntent.id);
          
          // Create notification for developer
          await storage.createNotification({
            type: 'sale',
            title: 'Nova Venda Realizada',
            message: `Venda completada - Order ID: ${orderId}`,
            data: { orderId, amount: paymentIntent.amount }
          });
        }
        
        if (donationId) {
          await storage.updateDonationStatus(donationId, 'completed', paymentIntent.id);
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/notifications", authenticateToken, requireRole(['developer', 'analyst']), async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/block", authenticateToken, requireRole(['developer']), async (req: AuthRequest, res) => {
    try {
      await storage.blockUser(req.params.id);
      res.json({ message: "User blocked successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/notifications/:id/read", authenticateToken, requireRole(['developer', 'analyst']), async (req: AuthRequest, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
