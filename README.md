
# Smart Inventory & Order Management System - Backend API

A robust RESTful API backend for inventory management, order processing, stock tracking, and automated restocking workflows. Built with Express.js, Prisma ORM, and PostgreSQL.

## 🚀 Live API

[API Base URL](https://invio-server.vercel.app)

## 📋 Features

### 🔐 Authentication & Authorization
- Email/Password authentication with better-auth
- Role-based access control (Admin, Manager, Staff)
- Session management with secure cookies
- Email verification support
- Social login (Google) ready

### 📦 Product Management
- CRUD operations for products
- Automatic stock tracking
- Minimum stock threshold configuration
- Auto status update (ACTIVE/OUT_OF_STOCK)
- Search and filter products
- Pagination support
- Category association

### 📁 Category Management
- CRUD operations for categories
- Delete protection (prevents deletion of categories with products)
- Product categorization

### 🛒 Order Management
- Create orders with multiple products
- Automatic stock deduction
- Real-time stock validation
- Order status workflow (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- Order cancellation with stock restoration
- Duplicate product prevention
- Inactive product ordering prevention
- Search and filter orders
- Pagination support

### 📊 Restock Queue (Auto-management)
- Automatic queue addition when stock falls below threshold
- Priority-based sorting (HIGH/MEDIUM/LOW)
- Manual restock endpoint
- Auto-removal when stock meets threshold
- Activity logging for stock updates

### 📝 Activity Logging
- Track all system actions
- Filter by entity type (ORDER, PRODUCT, CATEGORY, RESTOCK, USER)
- Filter by action type
- Pagination support
- User association for each activity

### 👥 User Management
- User CRUD operations
- Role assignment (Admin, Manager, Staff)
- Account activation/deactivation
- Search and filter users
- Pagination support

### 🖼️ File Upload
- Image upload to ImgBB
- Avatar upload for users
- Public and authenticated upload endpoints

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Express.js 5** | Web framework |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database access |
| **PostgreSQL** | Database |
| **better-auth** | Authentication |
| **Multer** | File upload handling |
| **Nodemailer** | Email sending |
| **Axios** | HTTP requests |
| **bcryptjs** | Password hashing |

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── products/       # Product management
│   ├── categories/     # Category management
│   ├── orders/         # Order management
│   ├── customers/      # Customer management
│   ├── restock/        # Restock queue
│   ├── activity/       # Activity logging
│   └── upload/         # File upload
├── middleware/
│   ├── auth.ts         # Authentication middleware
│   ├── errorHandler.ts # Global error handler
│   └── notFound.ts     # 404 handler
├── lib/
│   ├── auth.ts         # better-auth config
│   └── prisma.ts       # Prisma client
├── helpers/
│   └── paginationSortingHelper.ts
├── app.ts              # Express app config
├── server.ts           # Server entry point
└── index.ts            # Vercel export
```

## 🗄️ Database Schema

### Core Models
- **User** - Authentication and user management
- **Product** - Product catalog with stock tracking
- **Category** - Product categorization
- **Order** - Customer orders
- **OrderItem** - Order line items
- **Customer** - Customer information
- **RestockQueue** - Low stock tracking
- **Activity** - System activity log

### Enums
- `Role` - ADMIN, MANAGER, STAFF
- `OrderStatus` - PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- `ProductStatus` - ACTIVE, OUT_OF_STOCK, INACTIVE
- `Priority` - HIGH, MEDIUM, LOW
- `EntityType` - ORDER, PRODUCT, CATEGORY, RESTOCK, USER

## 🚦 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn or pnpm
- ImgBB API key (for image uploads)
- SMTP credentials (for email)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/tanvirislamakash2002/Invio-server-side.git
cd Invio-server-side
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"

# Server
PORT=5000
APP_URL=http://localhost:3000
NODE_ENV=development

# Authentication
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_secret_key

# Email
APP_USER=your_email@gmail.com
APP_PASSWORD=your_app_password

# ImgBB
IMGBB_API_KEY=your_imgbb_api_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. **Setup Database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run seed:admin
npm run seed:sellers
```

5. **Run development server**
```bash
npm run dev
# Server runs on http://localhost:5000
```

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | User registration |
| POST | `/api/auth/sign-in/email` | User login |
| POST | `/api/auth/sign-out` | User logout |
| GET | `/api/auth/get-session` | Get current session |

### Categories
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/categories` | Public | Get all categories |
| GET | `/api/v1/categories/:id` | Public | Get category by ID |
| POST | `/api/v1/categories` | Admin/Manager | Create category |
| PATCH | `/api/v1/categories/:id` | Admin/Manager | Update category |
| DELETE | `/api/v1/categories/:id` | Admin/Manager | Delete category |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/products` | Public | Get all products (with filters) |
| GET | `/api/v1/products/:id` | Public | Get product by ID |
| POST | `/api/v1/products` | Admin/Manager | Create product |
| PATCH | `/api/v1/products/:id/edit` | Admin/Manager | Update product |
| DELETE | `/api/v1/products/:id` | Admin/Manager | Delete product |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/order` | Admin/Manager/Staff | Get all orders |
| POST | `/api/v1/order` | Admin/Manager/Staff | Create order |
| GET | `/api/v1/order/:id` | Admin/Manager/Staff | Get order by ID |
| PATCH | `/api/v1/order/:id/status` | Admin/Manager | Update order status |
| PATCH | `/api/v1/order/:id` | Admin/Manager | Update order |
| DELETE | `/api/v1/order/:id/cancel` | Admin/Manager | Cancel order |

### Restock Queue
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/restock` | Admin/Manager | Get restock queue |
| PATCH | `/api/v1/restock/:productId/restock` | Admin/Manager | Restock product |
| DELETE | `/api/v1/restock/:productId` | Admin/Manager | Remove from queue |

### Activity Log
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/activity` | All roles | Get recent activities |
| GET | `/api/v1/activity/all` | Admin/Manager | Get all activities (paginated) |

### Customers
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/customer` | All roles | Get customers |
| POST | `/api/v1/customer` | All roles | Create/find customer |

### Upload
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/upload/avatar/public` | Public | Upload avatar (no auth) |
| POST | `/api/v1/upload/avatar` | Authenticated | Upload avatar (auth) |

## 🔒 Role-Based Access Matrix

| Endpoint | Admin | Manager | Staff |
|----------|-------|---------|-------|
| GET `/products` | ✅ | ✅ | ✅ |
| POST `/products` | ✅ | ✅ | ❌ |
| PATCH `/products/:id` | ✅ | ✅ | ❌ |
| DELETE `/products/:id` | ✅ | ✅ | ❌ |
| GET `/order` | ✅ | ✅ | ✅ |
| POST `/order` | ✅ | ✅ | ✅ |
| PATCH `/order/:id/status` | ✅ | ✅ | ❌ |
| DELETE `/order/:id/cancel` | ✅ | ✅ | ❌ |
| GET `/restock` | ✅ | ✅ | ❌ |
| PATCH `/restock/:id/restock` | ✅ | ✅ | ❌ |
| GET `/activity` | ✅ | ✅ | ✅ |
| GET `/activity/all` | ✅ | ✅ | ❌ |

## 📊 Database ERD

```
User ────┐
         ├── Order ──── OrderItem ──── Product
Customer ┘                              │
                                        │
Category ───────────────────────────────┘

RestockQueue ──── Product
Activity ──────── User & Order
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

```bash
# Build for production
npm run build

# The output will be in the `api` directory
```

### Deploy to Railway/Render

```bash
# Set up PostgreSQL database
# Add environment variables
# Deploy from GitHub
```

## 🧪 Testing

```bash
# Run seed scripts for test data
npm run seed:admin
npm run seed:sellers
```

## 📄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}
```

## 🔄 Stock Management Workflow

1. **Order Creation** → Stock deducted automatically
2. **Stock < Threshold** → Auto-add to Restock Queue
3. **Stock = 0** → Product status becomes OUT_OF_STOCK
4. **Restock** → Stock increased, removed from queue if ≥ threshold
5. **Order Cancellation** → Stock restored

## 📧 Contact

Tanvir Islam Akash - [tanvirislamakash2002@gmail.com](mailto:tanvirislamakash2002@gmail.com)

Project Link: [https://github.com/tanvirislamakash2002/Invio-server-side](https://github.com/tanvirislamakash2002/Invio-server-side)

## 📄 License

MIT © [Tanvir Islam Akash]

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Prisma](https://prisma.io/)
- [better-auth](https://better-auth.com/)
- [PostgreSQL](https://www.postgresql.org/)
