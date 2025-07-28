import { users, products, orders, donations, notifications, type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type Donation, type InsertDonation, type Notification } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSession(id: string, sessionToken: string): Promise<void>;
  blockUser(id: string): Promise<void>;
  
  // Product operations
  getProducts(filters?: { category?: string; maxPrice?: number; searchTerm?: string }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { sellerId: string }): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  blockProduct(id: string): Promise<void>;
  resetAllProducts(): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder & { buyerId: string; sellerId: string }): Promise<Order>;
  getOrders(userId?: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: string, paymentIntentId?: string): Promise<void>;
  
  // Donation operations
  createDonation(donation: InsertDonation & { userId: string }): Promise<Donation>;
  updateDonationStatus(id: string, status: string, paymentIntentId?: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification>;
  getNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser & { accessCode?: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    // Check for special accounts with access codes
    let role = "user";
    if (insertUser.email === "lopesbiel2024@gmail.com" && insertUser.accessCode === "VNK353@") {
      role = "developer";
    } else if (insertUser.email === "exocore81@gmail.com" && insertUser.accessCode === "GBN3030@") {
      role = "analyst";
    } else if ((insertUser.email === "lopesbiel2024@gmail.com" || insertUser.email === "exocore81@gmail.com") && !insertUser.accessCode) {
      throw new Error("Código de acesso obrigatório para esta conta especial");
    } else if (insertUser.email === "lopesbiel2024@gmail.com" && insertUser.accessCode && insertUser.accessCode !== "VNK353@") {
      throw new Error("Código de acesso inválido");
    } else if (insertUser.email === "exocore81@gmail.com" && insertUser.accessCode && insertUser.accessCode !== "GBN3030@") {
      throw new Error("Código de acesso inválido");
    }
    
    const [user] = await db
      .insert(users)
      .values({
        email: insertUser.email,
        password: hashedPassword,
        name: insertUser.name,
        role,
      })
      .returning();
    return user;
  }

  async updateUserSession(id: string, sessionToken: string): Promise<void> {
    await db
      .update(users)
      .set({ sessionToken, lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async blockUser(id: string): Promise<void> {
    await db
      .update(users)
      .set({ isBlocked: true })
      .where(eq(users.id, id));
  }

  async getProducts(filters?: { category?: string; maxPrice?: number; searchTerm?: string }): Promise<Product[]> {
    let conditions = [eq(products.isBlocked, false)];
    
    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }
    
    if (filters?.searchTerm) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.searchTerm}%`),
          ilike(products.description, `%${filters.searchTerm}%`)
        )!
      );
    }
    
    return await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(productData: InsertProduct & { sellerId: string }): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async blockProduct(id: string): Promise<void> {
    await db
      .update(products)
      .set({ isBlocked: true })
      .where(eq(products.id, id));
  }

  async resetAllProducts(): Promise<void> {
    await db.delete(products);
  }

  async createOrder(orderData: InsertOrder & { buyerId: string; sellerId: string }): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db
        .select()
        .from(orders)
        .where(or(eq(orders.buyerId, userId), eq(orders.sellerId, userId)))
        .orderBy(desc(orders.createdAt));
    }
    
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string, paymentIntentId?: string): Promise<void> {
    const updates: any = { status };
    if (paymentIntentId) {
      updates.stripePaymentIntentId = paymentIntentId;
    }
    
    await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id));
  }

  async createDonation(donationData: InsertDonation & { userId: string }): Promise<Donation> {
    const [donation] = await db
      .insert(donations)
      .values(donationData)
      .returning();
    return donation;
  }

  async updateDonationStatus(id: string, status: string, paymentIntentId?: string): Promise<void> {
    const updates: any = { status };
    if (paymentIntentId) {
      updates.stripePaymentIntentId = paymentIntentId;
    }
    
    await db
      .update(donations)
      .set(updates)
      .where(eq(donations.id, id));
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
