# Meetha Pani Restaurant — Production Ordering Platform

A modern, full-stack, responsive restaurant web application and real-time operations portal built for **Meetha Pani** restaurant.

Featuring a customer-facing portal, dynamic menu management, WhatsApp-based order checkout, real-time live order status tracking via Socket.IO, and a secure administrator backoffice.

---

## 🚀 Key Features

### 1. Customer Experience

- **Hero & Branding**: Visuals with theme colors (Deep Forest Green `#12372A`, Warm Gold `#D4AF37`, and Cream `#FDFBF7`).
- **Dynamic Menu & Filtering**: Category tabs, keyword search, Veg / Non-Veg badge indicators, price sorting, and in-stock toggles.
- **Shopping Cart**: Authoritative subtotal calculations, promo code discounts, and delivery fee calculation.
- **WhatsApp Ordering**: Customer fills in delivery details, and the platform saves the order ticket into MongoDB and immediately opens the official **WhatsApp Click-to-Chat API** (`wa.me`) with a prefilled, formatted order summary.
- **Real-Time Order Tracking**: Live status updates powered by **Socket.IO** rooms (`order:<orderNumber>`) with visual progress steps (`Pending` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Out for Delivery` ➔ `Delivered`).
- **Patron Accounts**: Register, sign in with JWT authentication, and view previous order histories.
- **Guest Order Privacy**: Guest orders generate an encrypted tracking token; access without the token redacts sensitive personal contact details.
- **Gallery & Reviews**: Curated photo gallery with lightbox modal and review submission.

### 2. Admin Operations Portal (`/admin`)

- **Live Kitchen & Sales Dashboard**: Real-time KPI counters (today's revenue, active kitchen orders, pending orders, popular dishes) with audio chime alerts on incoming orders.
- **Order Management**: Search by order ID/customer, filter by status, change kitchen status with live Socket.IO broadcast to customers, print thermal receipts, and directly message customers on WhatsApp.
- **Menu & Food Management**: Full CRUD for food dishes, category selection, price adjustments, and image upload.
- **Category Management**: Create, edit, reorder, and delete categories with integrity checks preventing deletion when items exist.
- **Promo Deals & Offers**: Manage coupon codes, percentage/flat discounts, and minimum order thresholds.
- **Gallery Manager**: Upload restaurant photography with category tags and captions.
- **Review Moderation**: Approve, hide, feature, or delete customer reviews.
- **Customer Directory**: View customer profiles, order counts, and total spend.
- **Website Settings**: Configure restaurant name, logo, WhatsApp phone number, address, Google Maps link, and announcements without touching code.

---

## 🛠️ Technology Stack

| Layer            | Technologies                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Frontend**     | React 19, Vite, Tailwind CSS, React Router DOM, Framer Motion, Lucide React, Axios, Socket.IO Client, React Hot Toast |
| **Backend**      | Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, Multer, Helmet, Express Rate Limit, Morgan          |
| **Integrations** | WhatsApp Click-to-Chat API, Cloudinary (optional) / Local Static Upload Fallback, Web Audio API                       |

---

## 📂 Project Structure

```text
meetha-pani/
├── client/                     # Vite React Frontend
│   ├── public/
│   │   └── favicon.svg         # Brand favicon
│   ├── src/
│   │   ├── admin/              # Admin pages (Dashboard, Orders, Foods, Settings, etc.)
│   │   ├── components/         # Navbar, Footer, FoodCard, VegBadge, Banner
│   │   ├── context/            # AuthContext, CartContext, SettingsContext, SocketContext
│   │   ├── layouts/            # CustomerLayout, AdminLayout
│   │   ├── pages/              # Home, Menu, Cart, Checkout, Tracking, Reviews, Gallery
│   │   ├── services/           # Axios API instance with token interceptor
│   │   ├── App.jsx             # React router configuration
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS & theme definitions
│   ├── vite.config.js          # Vite config with API & WebSocket proxy
│   └── package.json
├── server/                     # Node.js Express Backend
│   ├── config/                 # MongoDB & Cloudinary configuration
│   ├── controllers/            # REST controllers (orders, foods, categories, auth, settings)
│   ├── middleware/             # JWT auth, Multer upload, Rate limiting, Error handling
│   ├── models/                 # Mongoose schemas (Order, Food, Category, Settings, Admin, Customer)
│   ├── routes/                 # Express API routes
│   ├── scripts/                # Database seed script & E2E test suite
│   ├── services/               # WhatsApp formatting & price snapshotting
│   ├── sockets/                # Socket.IO rooms and real-time broadcasters
│   ├── server.js               # Main Express & Socket.IO server
│   ├── .env                    # Environment variables
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Atlas or Local)
MONGO_URI=mongodb://127.0.0.1:27017/meetha_pani

# JWT Secret
JWT_SECRET=meetha_pani_super_secret_jwt_key_2026_production
JWT_EXPIRE=7d

# Default Restaurant WhatsApp Number (format: Country code without +)
DEFAULT_WHATSAPP_PHONE=918853260723

# Optional Cloudinary (if left blank, local storage will be used)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🏃 Running the Application

### 1. Start MongoDB

Ensure MongoDB is running locally on port 27017 or provide a MongoDB Atlas URI in `server/.env`.

### 2. Seed the Database

Populate initial categories, menu dishes, restaurant settings, offers, and the administrator account:

```powershell
cd server
npm run seed
```

Default administrator credentials:

- **Username**: `admin`
- **Password**: `AdminPassword123!`

### 3. Start Backend Server

```powershell
cd server
npm start
```

API runs on `http://localhost:5000`.

### 4. Start Frontend Client

```powershell
cd client
npm run dev
```

Client runs on `http://localhost:5173`.

---

## 🧪 Automated Testing

Run the automated end-to-end integration test suite:

```powershell
cd server
node scripts/test-e2e.js
```

Verifies health, dynamic menus, admin authentication, rate limiting, WhatsApp ticket generation, Socket.IO order synchronization, and customer isolation.
