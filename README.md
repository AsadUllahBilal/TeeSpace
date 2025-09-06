# 🛍️ TeeSpace - Premium T-Shirt E-Commerce Platform

![TeeSpace Banner](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.19.0-green?style=for-the-badge&logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Authentication-purple?style=for-the-badge&logo=clerk&logoColor=white)

> **Discover stylish, high-quality t-shirts designed for comfort and confidence. From casual classics to trendy designs, we've got your perfect fit.**

TeeSpace is a modern, full-featured e-commerce platform specializing in premium t-shirts. Built with Next.js 15 and featuring a comprehensive admin dashboard, secure authentication, and seamless shopping experience.

## ✨ Features

### 🛒 **Customer Experience**
- **Dynamic Homepage** with animated hero section and featured products
- **Advanced Product Search & Filtering** by category, price, color, and more
- **Responsive Product Catalog** with detailed product views
- **Shopping Cart Management** with real-time updates
- **Secure Checkout Process** with order tracking
- **User Account Management** with order history
- **Product Reviews & Ratings** system
- **Mobile-Optimized Design** for all screen sizes

### 👨‍💼 **Admin Dashboard**
- **Product Management** - Add, edit, delete products with image uploads
- **Category Management** - Organize products efficiently
- **Order Management** - Track and update order statuses
- **User Management** - Manage customer accounts
- **Sales Analytics** - Revenue tracking and order statistics
- **Inventory Control** - Stock quantity management
- **Admin-Only Access** with role-based authentication

### 🔧 **Technical Features**
- **Server-Side Rendering (SSR)** for optimal performance
- **API Routes** for secure backend operations
- **Image Optimization** with Cloudinary integration
- **Database Integration** with MongoDB and Mongoose
- **Type Safety** with comprehensive TypeScript implementation
- **Modern UI Components** built with Radix UI and Tailwind CSS
- **State Management** with Zustand for cart functionality

## 🚀 Tech Stack

### **Frontend**
- **[Next.js 15.5.2](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://reactjs.org/)** - UI library
- **[TypeScript 5.9.2](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI components
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management

### **Backend & Database**
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose 8.18.0](https://mongoosejs.com/)** - MongoDB object modeling
- **Next.js API Routes** - Serverless backend functions

### **Authentication & Security**
- **[Clerk](https://clerk.dev/)** - Complete authentication solution
- **Role-based Access Control** - Admin and user roles
- **Secure API Endpoints** with authentication middleware

### **Media & File Handling**
- **[Cloudinary](https://cloudinary.com/)** - Image upload and optimization
- **Next.js Image Component** - Automatic image optimization

### **Developer Experience**
- **[ESLint](https://eslint.org/)** - Code linting
- **[Zod](https://zod.dev/)** - Schema validation
- **TypeScript** - Full type coverage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **MongoDB** database (local or cloud)
- **Cloudinary** account for image storage

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/teespace.git
   cd teespace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   SLUG_SECRET=your_secret_key_for_order_slugs
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
teespace/
├── app/                          # Next.js 13+ App Router
│   ├── (root)/                   # Main application routes
│   │   ├── api/                  # API endpoints
│   │   │   ├── products/         # Product-related APIs
│   │   │   ├── categories/       # Category management APIs
│   │   │   └── orders/          # Order processing APIs
│   │   ├── about/               # About page
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout process
│   │   ├── contact-us/          # Contact page
│   │   ├── profile/             # User profile
│   │   └── shop/                # Product catalog
│   ├── admin/                    # Admin dashboard
│   │   ├── api/                 # Admin-specific APIs
│   │   ├── categories/          # Category management
│   │   ├── orders/              # Order management
│   │   ├── products/            # Product management
│   │   └── users/               # User management
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (Radix UI)
│   ├── admin/                   # Admin-specific components
│   ├── ProductCard.tsx          # Product display component
│   ├── ProductGrid.tsx          # Product grid layout
│   ├── ShopClient.tsx           # Shop page client component
│   └── ...
├── lib/                         # Utility functions
│   ├── mongo.ts                 # MongoDB connection
│   ├── utils.ts                 # General utilities
│   ├── cartStore.ts             # Cart state management
│   └── ...
├── models/                      # Database schemas
│   ├── Product.ts               # Product model
│   ├── Category.ts              # Category model
│   ├── Order.ts                 # Order model
│   └── User.ts                  # User model
├── types/                       # TypeScript type definitions
└── hooks/                       # Custom React hooks
```

## 🎯 Usage

### **Customer Flow**
1. **Browse Products** - View featured products on homepage or browse the shop
2. **Search & Filter** - Use advanced filters to find specific products
3. **Product Details** - View detailed product information and reviews
4. **Add to Cart** - Select size, color, and quantity
5. **Checkout** - Secure checkout process with order confirmation
6. **Track Orders** - View order history and status in profile

### **Admin Dashboard** (Admin Access Required)
1. **Product Management**
   - Navigate to `/admin/products`
   - Add new products with images, categories, and pricing
   - Edit existing products and manage inventory

2. **Order Management**
   - Access `/admin/orders`
   - Update order statuses and tracking information
   - View order details and customer information

3. **Category Management**
   - Go to `/admin/categories`
   - Create and organize product categories
   - Edit category names and descriptions

## 📊 API Endpoints

### **Public APIs**
- `GET /api/products` - Get all products with pagination and filters
- `GET /api/products/[slug]` - Get single product by slug
- `GET /api/categories` - Get all categories
- `POST /api/orders` - Create new order (authenticated)

### **Admin APIs**
- `POST /api/products` - Create new product (admin only)
- `PUT/DELETE /api/products/[id]` - Update/delete product (admin only)
- `GET /admin/api/orders` - Get all orders with advanced filtering
- `PUT /admin/api/orders/[id]` - Update order status (admin only)

## 🔒 Authentication & Authorization

TeeSpace uses **Clerk** for authentication with role-based access control:

- **Public Users** - Can browse products and create accounts
- **Authenticated Users** - Can add to cart, checkout, and view order history
- **Admin Users** - Have access to admin dashboard and management features

### Setting up Admin Access
1. Create a user account through the application
2. In your MongoDB database, find the user document
3. Update the `role` field to `"admin"`
4. The user will now have access to `/admin` routes

## 🎨 Customization

### **Styling**
- The project uses **Tailwind CSS** for styling
- Custom components are built with **Radix UI** for accessibility
- Color scheme and branding can be customized in `tailwind.config.js`

### **Database Schema**
- Models are defined in the `/models` directory using **Mongoose**
- Extend schemas by adding new fields to existing models
- Create new models for additional features

## 🚀 Deployment

### **Vercel Deployment** (Recommended)
1. Push your code to a GitHub repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically with each push

### **Other Platforms**
The application can be deployed on any platform that supports Node.js:
- **Netlify**
- **Railway**
- **Digital Ocean**
- **AWS**

### **Build for Production**
```bash
npm run build
npm run start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - Amazing React framework
- **[Clerk](https://clerk.dev/)** - Authentication made simple
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Cloudinary](https://cloudinary.com/)** - Media management platform

## 📞 Support

If you have any questions or need support, please:
- 📧 Email: your-email@example.com
- 🐛 [Report Issues](https://github.com/yourusername/teespace/issues)
- 💬 [Discussions](https://github.com/yourusername/teespace/discussions)

---

**Made with ❤️ for the love of great t-shirts and clean code**

![TeeSpace Footer](https://img.shields.io/badge/TeeSpace-E--Commerce-brightgreen?style=for-the-badge)
