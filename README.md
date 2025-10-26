# 🚀 Welcome to Z.ai Code Scaffold

A modern, production-ready web application scaffold powered by cutting-edge technologies, designed to accelerate your development with [Z.ai](https://chat.z.ai)'s AI-powered coding assistance.

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Axios** - Promise-based HTTP client

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation Node.js and TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why This Scaffold?

- **🏎️ Fast Development** - Pre-configured tooling and best practices
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Auth Included** - NextAuth.js for secure authentication flows
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## 🤖 Powered by Z.ai

This scaffold is optimized for use with [Z.ai](https://chat.z.ai) - your AI assistant for:

- **💻 Code Generation** - Generate components, pages, and features instantly
- **🎨 UI Development** - Create beautiful interfaces with AI assistance  
- **🔧 Bug Fixing** - Identify and resolve issues with intelligent suggestions
- **📝 Documentation** - Auto-generate comprehensive documentation
- **🚀 Optimization** - Performance improvements and best practices

Ready to build something amazing? Start chatting with Z.ai at [chat.z.ai](https://chat.z.ai) and experience the future of AI-powered development!

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Axios + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🤝 Get Started with Z.ai

1. **Clone this scaffold** to jumpstart your project
2. **Visit [chat.z.ai](https://chat.z.ai)** to access your AI coding assistant
3. **Start building** with intelligent code generation and assistance
4. **Deploy with confidence** using the production-ready setup

---

Built with ❤️ for the developer community. Supercharged by [Z.ai](https://chat.z.ai) 🚀

## 🍽️ SmartDine Restaurant Management System

This project includes a complete Digital Menu & Ordering System for restaurants, cafés, and food outlets.

### 🎯 Core Features

#### Customer Experience
- **QR Code Menu Access**: Scan QR codes to view digital menus by table
- **Digital Menu Display**: Categorized menu items (Starters, Main Course, Desserts, Beverages)
- **Cart & Checkout**: Add items to cart and place orders seamlessly
- **Live Order Status**: Real-time order tracking from Pending → Preparing → Ready
- **Order Success Page**: Beautiful confirmation page with order details

#### Admin Dashboard
- **Secure Authentication**: JWT-based login system for admin and staff
- **Order Management**: View, update, and track all orders in real-time
- **Menu Management**: Add, edit, delete menu items with availability status
- **Analytics Dashboard**: Visual charts showing order statistics and revenue
- **Table Management**: Configure restaurant tables and QR code generation
- **Data Export**: Download order data as CSV files compatible with Google Sheets

### 📊 Export Functionality

The admin dashboard includes a powerful export feature for order data:

#### Features:
- **CSV Format**: Exports data in CSV format compatible with Google Sheets and Excel
- **Comprehensive Data**: Includes order details, customer information, items, and pricing
- **Summary Statistics**: Automatic calculation of total orders, revenue, and averages
- **Timestamped Files**: Files are named with export date for easy organization
- **Smart Button**: Shows order count and is disabled when no orders exist

#### Exported Data Includes:
- Order Number, Customer Name & Phone
- Table Number and Order Status
- Total Amount and Order Date/Time
- Item Details (Names, Quantities, Prices)
- Summary Statistics (Total Orders, Revenue, Average Order Value)

#### Usage:
1. Navigate to `/admin` and log in with credentials
2. Click the "Export (N)" button in the dashboard header
3. CSV file automatically downloads with timestamp
4. Open directly in Google Sheets or Excel for analysis

### 🔐 Admin Access

- **Default Admin Email**: `admin@smartdine.com`
- **Default Password**: `admin123`
- **Secure Areas**: All admin routes require authentication
- **Role-Based Access**: Different permission levels for admin and staff

### 🛠️ Technical Implementation

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express.js, RESTful APIs
- **Database**: Prisma ORM with SQLite
- **Real-time**: Socket.IO for live order updates
- **Authentication**: JWT-based secure authentication
- **UI/UX**: Modern, responsive design with dark/light mode support

### 📱 Responsive Design

- **Mobile-First**: Optimized for all device sizes with dedicated mobile layouts
- **Touch-Friendly**: Large touch targets (minimum 44px) for tablets and phones
- **Adaptive Layouts**: Different layouts for mobile, tablet, and desktop
- **Responsive Tables**: Mobile card view for tables, desktop table view for larger screens
- **Flexible Grids**: Stats cards adapt from 2x2 on mobile to 4x1 on desktop
- **Responsive Charts**: Charts adjust size and labels based on screen width
- **Mobile Dialogs**: Dialogs are optimized for mobile with proper viewport constraints
- **Progressive Enhancement**: Works on all modern browsers with graceful degradation

#### Mobile Features:
- **Header**: Responsive navigation with stacked layout on mobile
- **Stats Cards**: 2x2 grid on mobile, 4x1 on desktop
- **Charts**: Smaller charts with simplified labels on mobile
- **Tables**: Card-based layout on mobile, table view on desktop
- **Buttons**: Compact buttons with icons on mobile, full text on desktop
- **Dialogs**: Full-width dialogs on mobile with proper scrolling
- **Typography**: Responsive text sizes for optimal readability
