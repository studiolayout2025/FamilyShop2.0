# Family Shop - Loja da Família

## Overview

Family Shop is a modern and secure marketplace platform where multiple sellers can register and sell their products. The platform is designed as a full-stack web application with a React frontend, Express.js backend, and PostgreSQL database using a monorepo structure.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Payment Processing**: Stripe integration for payments and donations
- **Session Management**: Token-based sessions stored in database

### Database Architecture
- **Database**: PostgreSQL (using Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Tables**: users, products, orders, donations, notifications
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Authentication System
- JWT token-based authentication
- Role-based access control (user, developer, analyst)
- Special privileged accounts with specific access codes
- Session persistence with automatic login

### User Roles
- **Regular Users**: Can browse and purchase products
- **Developer** (lopesbiel2024@gmail.com): Full admin access, can manage all products, block users, view analytics
- **Analyst** (exocore81@gmail.com): Read-only access to reports and analytics

### Product Management
- CRUD operations for products
- Image upload support
- Category-based filtering
- Search functionality
- Admin controls for blocking inappropriate content

### Payment System
- Stripe integration for secure payments
- Commission-based revenue model (15% default)
- Donation system for platform support
- Payment intent tracking and status management

### Notification System
- Real-time notifications for sales and violations
- Admin notification dashboard
- Read/unread status tracking

### UI/UX Features
- Welcome screen for new visitors
- Responsive design with mobile support
- Sidebar navigation (initially closed)
- Product cards with image fallbacks
- Toast notifications for user feedback

## Data Flow

1. **User Registration/Login**: Users authenticate via email/password, receive JWT token
2. **Product Browsing**: Users can filter, search, and view products from the database
3. **Purchase Flow**: Stripe handles payment processing, orders are tracked in database
4. **Admin Actions**: Privileged users can manage products and view analytics
5. **Notifications**: System generates notifications for sales and violations

## External Dependencies

### Payment Processing
- **Stripe**: Handles all payment transactions and customer management
- Requires STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY environment variables

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- Requires DATABASE_URL environment variable

### UI Components
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **TailwindCSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Development server and build tool
- **Replit**: Development environment with specific plugins
- **TypeScript**: Type safety across frontend and backend

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` directory via Vite
2. Backend builds via esbuild to `dist/index.js`
3. Shared schema accessible to both frontend and backend

### Environment Configuration
- Development: Uses tsx for server execution with hot reload
- Production: Node.js execution of compiled JavaScript
- Database migrations handled via Drizzle Kit

### Security Considerations
- JWT secret key management
- Password hashing with bcrypt
- Role-based access control
- Input validation with Zod schemas
- CORS and security headers