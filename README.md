# 🏥 MedDirect - AI-Powered Medical Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://cloud.mongodb.com/)

> A comprehensive medical platform connecting patients with healthcare providers, featuring AI-powered medicine search, location-based hospital finder, and integrated payment solutions.

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Project Structure](#️-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [🔧 Detailed Setup](#-detailed-setup)
- [🚀 Running the Application](#-running-the-application)
- [📱 Application Flow](#-application-flow)
- [🔐 Authentication](#-authentication)
- [💳 Payment Integration](#-payment-integration)
- [🗃️ Database Schema](#️-database-schema)
- [🔌 API Endpoints](#-api-endpoints)
- [🌍 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📞 Support](#-support)

## 🌟 Features

### 👥 User Features

- **🔐 Secure Authentication** - JWT-based auth with Google OAuth integration
- **👨‍⚕️ Doctor Discovery** - Browse doctors by specialty, location, and availability
- **📅 Appointment Booking** - Real-time appointment scheduling with calendar integration
- **💊 Medicine Information** - AI-powered medicine search using OpenFDA database
- **🏥 Hospital Locator** - GPS-based hospital search with directions
- **💳 Multi-Payment Support** - Stripe, Razorpay, Instamojo, and UPI integration
- **📱 Responsive Design** - Mobile-first responsive interface
- **🌍 Multi-Currency** - Automatic currency detection and conversion

### 👨‍⚕️ Doctor Features

- **📊 Doctor Dashboard** - Comprehensive appointment and patient management
- **👤 Profile Management** - Complete profile with specializations and availability
- **💰 Fee Management** - Dynamic fee setting with currency support
- **📈 Analytics** - Patient statistics and appointment analytics
- **📋 Patient Records** - Secure patient information management

### 🏥 Admin Features

- **🎛️ Admin Dashboard** - Complete platform management
- **👨‍⚕️ Doctor Management** - Add, edit, and manage doctor profiles
- **📊 Analytics** - Platform-wide statistics and reporting
- **⚙️ System Configuration** - Platform settings and configurations

## 🏗️ Project Structure

```
MedDirect/
├── 📁 backend/                 # Node.js Express Server
│   ├── 📁 controllers/         # Route controllers
│   ├── 📁 models/              # MongoDB schemas
│   ├── 📁 routes/              # API routes
│   ├── 📁 middlewares/         # Auth & validation middlewares
│   ├── 📁 services/            # External API services
│   ├── 📁 config/              # Database & service configs
│   ├── 📁 data/                # Static data & fallbacks
│   ├── 📁 utils/               # Utility functions
│   └── 📄 server.js            # Main server file
│
├── 📁 clientside/              # React Frontend (Users)
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 context/         # React context providers
│   │   ├── 📁 services/        # API service functions
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📁 assets/          # Static assets
│   └── 📄 package.json
│
├── 📁 admin/                   # React Admin Panel
│   ├── 📁 src/
│   │   ├── 📁 components/      # Admin components
│   │   ├── 📁 pages/           # Admin pages
│   │   ├── 📁 context/         # Admin context
│   │   └── 📁 assets/          # Admin assets
│   └── 📄 package.json
│
├── 📄 README.md                # This file
├── 📄 ENVIRONMENT_SETUP.md     # Environment setup guide
└── 📄 LICENSE                  # MIT License
```

## 🛠️ Tech Stack

### Frontend

- **⚛️ React 18** - Modern React with hooks
- **⚡ Vite** - Fast build tool and dev server
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🌐 React Router** - Client-side routing
- **📡 Axios** - HTTP client for API calls
- **🔔 React Toastify** - Notification system
- **🗓️ Date utilities** - Date manipulation and formatting

### Backend

- **🟢 Node.js** - JavaScript runtime
- **🚀 Express.js** - Web application framework
- **🍃 MongoDB** - NoSQL database with Mongoose ODM
- **🔐 JWT** - JSON Web Token authentication
- **☁️ Cloudinary** - Image storage and optimization
- **📧 Nodemailer** - Email service integration
- **🔒 Bcrypt** - Password hashing

### External APIs & Services

- **🏛️ OpenFDA API** - Medicine information database
- **🗺️ Google Places API** - Hospital and location services
- **🌍 OpenStreetMap** - Alternative mapping service
- **💳 Stripe** - Global payment processing
- **💰 Razorpay** - Indian payment gateway
- **📱 Instamojo** - Indian payment solutions
- **🔍 Google OAuth** - Social authentication

### Development Tools

- **📦 npm/yarn** - Package management
- **🔧 ESLint** - Code linting
- **💨 Prettier** - Code formatting
- **🐛 Nodemon** - Development server
- **🔄 Concurrently** - Run multiple commands

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+** installed
- **MongoDB Atlas** account
- **Git** installed
- **Code editor** (VS Code recommended)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/Meddirect-project.git
cd Meddirect-project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../clientside
npm install

# Install admin dependencies
cd ../admin
npm install
```

### 2. Environment Setup

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your credentials

# Frontend environment
cd ../clientside
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (from backend folder)
npm run dev

# Terminal 2 - Frontend (from clientside folder)
npm run dev

# Terminal 3 - Admin Panel (from admin folder)
npm run dev
```

### 4. Access Applications

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://localhost:4001

## 🔧 Detailed Setup

### MongoDB Setup

1. **Create MongoDB Atlas Account**

   ```
   Visit: https://cloud.mongodb.com/
   Create account → Create cluster → Get connection string
   ```

2. **Database Configuration**

   ```javascript
   // Replace in backend/.env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meddirect
   ```

3. **Initialize Sample Data**
   ```bash
   cd backend
   npm run seed  # Adds sample doctors and data
   ```

### API Keys Configuration

#### OpenFDA API (Medicine Information)

```bash
# Register at: https://open.fda.gov/apis/authentication/
# Add to both backend/.env and clientside/.env
OPENFDA_API_KEY=your_api_key_here
```

#### Cloudinary (Image Upload)

```bash
# Register at: https://cloudinary.com/
# Add to backend/.env
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Payment Gateways

**Stripe (Global)**

```bash
# Get keys from: https://dashboard.stripe.com/
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

**Razorpay (India)**

```bash
# Get keys from: https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

**Instamojo (India)**

```bash
# Get keys from: https://www.instamojo.com/
INSTAMOJO_CLIENT_ID=your_client_id
INSTAMOJO_CLIENT_SECRET=your_client_secret
```

#### Google Services (Optional)

```bash
# Google Cloud Console: https://console.cloud.google.com/
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:4001
   ```

2. **Start Frontend Application**

   ```bash
   cd clientside
   npm run dev
   # App runs on http://localhost:5173
   ```

3. **Start Admin Panel**
   ```bash
   cd admin
   npm run dev
   # Admin panel runs on http://localhost:5174
   ```

### Production Mode

1. **Build Applications**

   ```bash
   # Build frontend
   cd clientside
   npm run build

   # Build admin panel
   cd ../admin
   npm run build
   ```

2. **Start Production Server**
   ```bash
   cd backend
   npm start
   ```

### Available Scripts

#### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm test` - Run backend tests

#### Frontend/Admin

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Application Flow

### User Journey

1. **🏠 Home Page**

   - View platform overview
   - Browse featured doctors
   - Access quick services

2. **🔐 Authentication**

   - Register/Login with email
   - Google OAuth option
   - JWT token management

3. **👨‍⚕️ Doctor Discovery**

   - Browse by specialty
   - Filter by location
   - View doctor profiles

4. **📅 Appointment Booking**

   - Select available time slots
   - Fill appointment details
   - Confirm booking

5. **💳 Payment Processing**

   - Choose payment method
   - Secure payment processing
   - Confirmation & receipt

6. **💊 Medicine Search**

   - Search FDA database
   - View medicine details
   - Check interactions

7. **🏥 Hospital Finder**
   - GPS location detection
   - Search nearby hospitals
   - Get directions

### Admin Workflow

1. **🎛️ Dashboard Access**

   - Admin login
   - Overview statistics
   - System monitoring

2. **👨‍⚕️ Doctor Management**

   - Add new doctors
   - Edit profiles
   - Manage specializations

3. **📊 Analytics & Reporting**
   - Appointment statistics
   - Revenue tracking
   - User analytics

## 🔐 Authentication

### JWT Implementation

```javascript
// Token generation (backend)
const token = jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
  expiresIn: "24h",
});

// Token verification middleware
const authUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

### Google OAuth Flow

```javascript
// Frontend - Google sign-in
import { signInWithGooglePopup } from "../services/firebase";

const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithGooglePopup();
    // Send to backend for verification
    const response = await axios.post("/api/auth/google", {
      idToken: result.user.accessToken,
    });
  } catch (error) {
    console.error("Google sign-in failed:", error);
  }
};
```

## 💳 Payment Integration

### Multi-Gateway Support

```javascript
// Payment processing flow
const processPayment = async (paymentData) => {
  const { method, amount, currency } = paymentData;

  switch (method) {
    case "stripe":
      return await createStripePayment(amount, currency);
    case "razorpay":
      return await createRazorpayPayment(amount);
    case "instamojo":
      return await createInstamojoPayment(amount);
    default:
      throw new Error("Unsupported payment method");
  }
};
```

### Currency Handling

```javascript
// Automatic currency detection
const detectUserCountry = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.country_code;
  } catch (error) {
    return "IN"; // Default to India
  }
};

// Currency conversion
const getLocalizedPricing = (baseAmount, targetCurrency) => {
  const rates = {
    USD: 1,
    INR: 83.5,
    EUR: 0.85,
    GBP: 0.73,
  };
  return baseAmount * rates[targetCurrency];
};
```

## 🗃️ Database Schema

### User Model

```javascript
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    image: { type: String },
    address: { type: Object },
    gender: { type: String },
    dob: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);
```

### Doctor Model

```javascript
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    fees: { type: Number, required: true },
    address: { type: Object },
    available: { type: Boolean, default: true },
    slots_booked: { type: Object, default: {} },
  },
  { timestamps: true }
);
```

### Appointment Model

```javascript
const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    paymentMethod: { type: String },
    paymentId: { type: String },
  },
  { timestamps: true }
);
```

## 🔌 API Endpoints

### Authentication Endpoints

```
POST /api/user/register       # User registration
POST /api/user/login          # User login
POST /api/user/google-auth    # Google OAuth
GET  /api/user/profile        # Get user profile
PUT  /api/user/profile        # Update profile
```

### Doctor Endpoints

```
GET  /api/user/doctors        # Get all doctors
GET  /api/user/doctors/:id    # Get doctor by ID
POST /api/doctor/login        # Doctor login
GET  /api/doctor/profile      # Doctor profile
PUT  /api/doctor/profile      # Update doctor profile
GET  /api/doctor/appointments # Doctor appointments
```

### Appointment Endpoints

```
POST /api/user/book-appointment    # Book appointment
GET  /api/user/appointments        # User appointments
POST /api/user/cancel-appointment  # Cancel appointment
PUT  /api/user/payment-confirm     # Confirm payment
```

### Medicine Endpoints

```
GET  /api/medicine/search/:query      # Search medicines
GET  /api/medicine/info/:name         # Get medicine info
GET  /api/medicine/interactions/:id   # Drug interactions
POST /api/medicine/search-symptoms    # Symptom-based search
```

### Payment Endpoints

```
POST /api/payment/create       # Create payment intent
POST /api/payment/verify       # Verify payment
GET  /api/payment/methods      # Available payment methods
POST /api/payment/webhook      # Payment webhooks
```

## 🌍 Deployment

### 🚀 Render Platform Deployment (Recommended)

Render is a modern cloud platform that makes deploying full-stack applications simple and cost-effective. This guide covers deploying all three parts of MedDirect (Backend API, Frontend, and Admin Panel) on Render.

#### Prerequisites for Render Deployment

1. **Render Account**: Create account at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Set up database cluster
4. **API Keys**: Gather all required API keys (see Environment Setup section)

#### 📋 Step-by-Step Render Deployment

##### 1. Prepare Your Repository

```bash
# Ensure all changes are committed and pushed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

##### 2. Deploy Backend API (Web Service)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository and branch (`main`)

2. **Configure Backend Service**
   ```
   Name: meddirect-backend
   Runtime: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```

3. **Set Environment Variables**
   ```bash
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meddirect
   
   # Authentication
   JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
   ADMIN_EMAIL=admin@meddirect.com
   ADMIN_PASSWORD=your_secure_admin_password
   
   # Cloudinary
   CLOUDINARY_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   
   # Razorpay
   RAZORPAY_KEY_ID=rzp_live_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   
   # Instamojo
   INSTAMOJO_CLIENT_ID=your_instamojo_client_id
   INSTAMOJO_CLIENT_SECRET=your_instamojo_client_secret
   
   # OpenFDA
   OPENFDA_API_KEY=your_openfda_api_key
   
   # Frontend URLs (for CORS)
   FRONTEND_URL=https://meddirect-frontend.onrender.com
   ADMIN_URL=https://meddirect-admin.onrender.com
   
   # Production settings
   NODE_ENV=production
   PORT=4001
   ```

4. **Advanced Settings**
   ```
   Health Check Path: /api/health
   Auto-Deploy: Yes
   ```

##### 3. Deploy Frontend (Static Site)

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Frontend Service**
   ```
   Name: meddirect-frontend
   Build Command: cd clientside && npm install && npm run build
   Publish Directory: ./clientside/dist
   ```

3. **Set Environment Variables**
   ```bash
   VITE_BACKEND_URL=https://meddirect-backend.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_OPENFDA_API_KEY=your_openfda_api_key
   VITE_APP_NAME=MedDirect
   VITE_ENVIRONMENT=production
   ```

##### 4. Deploy Admin Panel (Static Site)

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Admin Service**
   ```
   Name: meddirect-admin
   Build Command: cd admin && npm install && npm run build
   Publish Directory: ./admin/dist
   ```

3. **Set Environment Variables**
   ```bash
   VITE_BACKEND_URL=https://meddirect-backend.onrender.com
   VITE_APP_NAME=MedDirect Admin
   VITE_ENVIRONMENT=production
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

#### 🔧 Render Configuration Files

The repository includes pre-configured files for Render deployment:

- `render.yaml` - Infrastructure as Code configuration
- `backend/build.sh` - Backend build script
- `backend/.env.production` - Production environment template
- `clientside/.env.production` - Frontend environment template
- `admin/.env.production` - Admin environment template

#### 📊 Deployment URLs

After successful deployment, your services will be available at:

- **Backend API**: `https://meddirect-backend.onrender.com`
- **Frontend**: `https://meddirect-frontend.onrender.com`
- **Admin Panel**: `https://meddirect-admin.onrender.com`

#### 🔍 Monitoring & Troubleshooting

1. **View Logs**
   ```
   Dashboard → Your Service → Logs
   ```

2. **Health Check**
   ```
   GET https://meddirect-backend.onrender.com/api/health
   ```

3. **Common Issues**
   - **Build failures**: Check build logs for missing dependencies
   - **Environment variables**: Ensure all required vars are set
   - **CORS errors**: Verify frontend URLs in backend CORS config
   - **Database connection**: Check MongoDB Atlas IP whitelist (set to 0.0.0.0/0 for Render)

#### 💰 Render Pricing

- **Free Tier**: 750 hours/month per service (sleeps after 15 min inactivity)
- **Starter Plan**: $7/month per service (always on)
- **Pro Plan**: $25/month per service (advanced features)

### 🌐 Alternative Deployment Options

#### Vercel Deployment

**Backend Deployment (Vercel)**

1. **Prepare for deployment**
   ```bash
   # Create vercel.json in backend folder
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   cd backend
   vercel --prod
   ```

**Frontend Deployment (Vercel)**

```bash
cd clientside
npm run build
vercel --prod
```

#### Heroku Deployment

```bash
# Install Heroku CLI
heroku create meddirect-backend
heroku config:set MONGODB_URI=your_uri
git push heroku main
```

#### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 4001
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY clientside/package*.json ./
RUN npm install
COPY clientside/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Railway Deployment

1. **Connect GitHub repository**
2. **Set environment variables**
3. **Deploy with one click**

### 🛡️ Production Security Checklist

- [ ] **Environment Variables**: All secrets properly configured
- [ ] **HTTPS**: SSL certificates enabled (automatic on Render)
- [ ] **CORS**: Properly configured origins
- [ ] **Database**: MongoDB Atlas with IP restrictions
- [ ] **API Keys**: Production keys (not test keys)
- [ ] **Monitoring**: Error tracking and performance monitoring
- [ ] **Backups**: Database backup strategy in place
- [ ] **Updates**: Keep dependencies updated

### 📈 Post-Deployment Steps

1. **Test All Features**
   - User registration/login
   - Doctor booking
   - Payment processing
   - Medicine search
   - Admin functionality

2. **Set Up Monitoring**
   - Configure error tracking (Sentry)
   - Set up uptime monitoring
   - Enable performance tracking

3. **Domain Configuration** (Optional)
   - Purchase custom domain
   - Configure DNS records
   - Set up SSL certificates

4. **SEO Optimization**
   - Add meta tags
   - Configure sitemap
   - Set up Google Analytics

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm install --save-dev jest supertest
npm test
```

### API Testing with Postman

1. Import API collection
2. Set environment variables
3. Test all endpoints
4. Verify responses

### Frontend Testing

```bash
cd clientside
npm install --save-dev @testing-library/react
npm test
```

## 🤝 Contributing

### Development Guidelines

1. **Fork the repository**

   ```bash
   git fork https://github.com/your-username/Meddirect-project.git
   ```

2. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Follow coding standards**

   - Use ESLint and Prettier
   - Write meaningful commit messages
   - Add comments for complex logic
   - Write tests for new features

4. **Submit pull request**
   - Describe changes clearly
   - Include screenshots if UI changes
   - Ensure all tests pass

### Code Style

```javascript
// Use meaningful variable names
const userAppointments = await Appointment.find({ userId });

// Add error handling
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error("API call failed:", error);
  return { success: false, error: error.message };
}

// Use async/await instead of promises
const fetchUserData = async (userId) => {
  const user = await User.findById(userId);
  return user;
};
```

## 📞 Support

### Common Issues & Solutions

#### 1. Environment Variables Not Loading

```bash
# Check file exists and rename correctly
ls -la | grep .env
# Restart development server
npm run dev
```

#### 2. MongoDB Connection Failed

```bash
# Verify connection string
# Check IP whitelist in MongoDB Atlas
# Ensure network access is configured
```

#### 3. Payment Gateway Errors

```bash
# Verify API keys are correct
# Check test/live mode settings
# Confirm webhook URLs are set
```

#### 4. CORS Issues

```javascript
// Backend - ensure CORS is properly configured
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
```

### Getting Help

- **📧 Email**: support@meddirect.com
- **💬 Discord**: [MedDirect Community](https://discord.gg/meddirect)
- **🐛 Issues**: [GitHub Issues](https://github.com/your-username/Meddirect-project/issues)
- **📖 Docs**: [Documentation](https://docs.meddirect.com)

### Feature Requests

Have an idea for a new feature? We'd love to hear it!

1. Check existing issues for similar requests
2. Create a detailed feature request
3. Explain the use case and benefits
4. Consider contributing the implementation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenFDA** for medicine data API
- **MongoDB Atlas** for database hosting
- **Render** for deployment platform
- **React team** for the amazing framework
- **All contributors** who make this project better

---

<div align="center">
  <p>Made with ❤️ for better healthcare access</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
