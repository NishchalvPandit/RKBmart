# Rastriya Khadya Bank Mart (RKB Mart)

A full-stack e-commerce web application for **Rastriya Khadya Bank Limited**, operated from Bhaktapur, Pepsicola.
RKB Mart allows customers to browse grocery products, manage carts, place orders, track deliveries, and get support through a built-in chatbot — along with a full-featured admin dashboard.

---

## About the Project

RKB Mart is a modern online marketplace built for Rastriya Khadya Bank’s retail operations in Nepal.
The platform supports English and Nepali, is mobile-responsive, and includes secure authentication, order management, product reviews, and an AI-style chatbot assistant.

### Architecture

* **Frontend** — React + Vite SPA (`rastriyaKhadyaBank/`)
* **Backend** — Express.js REST API with MongoDB (`backend/`)

---

## Features

### Customer-facing

* Home page with banners and navigation
* Product catalog with search and category filters
* Product detail pages with reviews
* Shopping cart with stock validation
* Checkout system with Cash on Delivery (COD)
* User authentication (register/login/profile)
* Email verification & password reset flow
* Order history & cancellation
* Product reviews (ratings & comments)
* Contact form for inquiries
* Bilingual support (English / Nepali via i18next)
* SEO optimization (meta tags, sitemap, robots.txt)
* Floating chatbot for FAQs, search, and order tracking

---

### Admin Panel (`/admin`)

* Dashboard with statistics (products, users, orders)
* Product management (create, edit, delete)
* Order management (status updates: pending → delivered)
* User management (roles & permissions)
* Contact message inbox
* Role-based access control (`admin`, `super_admin`)

---

### Chatbot Features

* FAQs (delivery, refunds, payments, shipping)
* Product search (name/category/price)
* Order tracking (authenticated users only)
* Quick suggestions & prompts

---

## Security & Production Readiness

* JWT authentication via httpOnly cookies
* Helmet security headers
* NoSQL injection protection
* Rate limiting on sensitive routes
* CORS with credential support
* Input validation & sanitization
* Secure cookie handling in production
* Stock validation during cart & order creation
* MongoDB transaction support for orders

---

## Tech Stack

### Frontend

| Technology         | Purpose              |
| ------------------ | -------------------- |
| React 19           | UI framework         |
| Vite 7             | Build tool           |
| React Router 7     | Routing              |
| Tailwind CSS 4     | Styling              |
| Axios              | API calls            |
| i18next            | Internationalization |
| Framer Motion      | Animations           |
| react-helmet-async | SEO                  |

### Backend

| Technology             | Purpose          |
| ---------------------- | ---------------- |
| Node.js + Express 4    | REST API         |
| MongoDB + Mongoose 8   | Database         |
| JWT + bcryptjs         | Authentication   |
| Nodemailer             | Emails           |
| Cloudinary + Multer    | Image uploads    |
| Helmet                 | Security headers |
| express-rate-limit     | Rate limiting    |
| express-mongo-sanitize | Security         |

---

## Project Structure

```
rastriya-khadya-bank/
├── backend/
│   ├── index.js
│   ├── scripts/
│   │   ├── makeAdmin.js
│   │   └── seedProducts.js
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
│
└── rastriyaKhadyaBank/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── i18n/
    │   ├── config/
    │   └── data/
    ├── vercel.json
    └── vite.config.js
```

---

## Prerequisites

* Node.js 18+ (recommended 20+)
* MongoDB (local or Atlas)
* npm or yarn
* SMTP credentials (for email features)
* Cloudinary account (for image uploads)

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/rastriya-khadya-bank.git
cd rastriya-khadya-bank
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure `.env`:

```
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/rastriya-khadya-bank
JWT_SECRET=your-strong-secret
JWT_ACCESS_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5175
```

Run backend:

```bash
npm run dev
```

(Optional)

```bash
npm run seed:products
```

---

### 3. Frontend Setup

```bash
cd rastriyaKhadyaBank
npm install
cp .env.example .env
```

Configure `.env`:

```
VITE_API_URL=http://localhost:8080
VITE_SITE_URL=http://localhost:5175
```

Run frontend:

```bash
npm run dev
```

---

## Admin Access

After registering a user:

```bash
cd backend
node scripts/makeAdmin.js user@example.com
```

### Roles

* `user` — customer
* `admin` — product/order management
* `super_admin` — full control + admin promotion

---

## API Overview

Base URL: `http://localhost:8080/api`

| Route                 | Description     |
| --------------------- | --------------- |
| POST /auth/register   | Register user   |
| POST /auth/login      | Login           |
| GET /auth/me          | Current user    |
| GET /products         | Get products    |
| GET /products/:id     | Product details |
| POST /cart/*          | Cart operations |
| POST /orders          | Place order     |
| GET /orders/my-orders | User orders     |
| POST /contact         | Contact form    |
| POST /chat            | Chatbot         |
| GET /admin/stats      | Admin dashboard |
| GET /health           | Health check    |

---

## Available Scripts

### Frontend

* `npm run dev` — Start dev server
* `npm run build` — Production build
* `npm run preview` — Preview build
* `npm run lint` — Lint code

### Backend

* `npm run dev` — Start server
* `npm start` — Production server
* `npm run seed:products` — Seed database

---

