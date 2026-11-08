# 🗳️ Petition Pulse — Civic Action & Petition Voting Platform

> A full-stack **MERN (MongoDB, Express, React, Node.js)** platform designed for transparent civic participation, grassroots petitions, simulated Aadhaar identity verification, and democratic 1-citizen-1-vote decision making.

---

## 📋 Table of Contents
1. [Overview & Core Features](#-overview--core-features)
2. [Tech Stack](#-tech-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [Prerequisites](#-prerequisites)
5. [Quick Start (3-Minute Setup)](#-quick-start-3-minute-setup)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Pre-configured Demo Accounts](#-pre-configured-demo-accounts)
8. [Simulated Aadhaar Sandbox Identities](#-simulated-aadhaar-sandbox-identities)
9. [Key Application Workflows](#-key-application-workflows)
10. [REST API Documentation](#-rest-api-documentation)
11. [Security & Privacy Architecture](#-security--privacy-architecture)
12. [Troubleshooting Guide](#-troubleshooting-guide)

---

## 🌟 Overview & Core Features

- **4-Step Registration Stepper Wizard**:
  1. **Profile Contact Input**: Full name, unique email, unique mobile.
  2. **Email OTP Verification**: 6-digit one-time password sent via Nodemailer, 10-minute expiry, max 5 attempts, 60-second resend cooldown.
  3. **Simulated Aadhaar eKYC**: Instant identity validation against a mock registry of 10 fictional citizens. Raw Aadhaar numbers and OTPs are **NEVER saved or logged**.
  4. **Strong Password Security**: Enforces 12-round Bcrypt hashing, uppercase/lowercase/numbers/special characters.
- **Civic Protest & Petition Lifecycle**:
  - Citizens submit civic protests (initial status: `pending`).
  - System automatically dispatches an HTML alert to `ADMIN_EMAIL` and logs a delivery record.
  - Public listing is restricted to strictly `published` petitions with full-text search (`?q=`), authority filter, and popularity sort.
- **Democratic 1-Citizen-1-Vote Engine**:
  - Only fully verified citizens can vote.
  - Strict prevention of self-voting (authors cannot vote on their own submission).
  - Database-level duplicate prevention via a `unique` compound index on `(user, protest)` with handled `E11000` status.
  - Real-time atomic increment/decrement (`$inc`) and vote retraction capability.
- **Administrative Control Center (`role: admin`)**:
  - Enforced state machine transitions: `pending` → `approved`/`rejected` → `published` → `closed`.
  - Moderation notes dialog with complete audit trail in `AdminActivity`.
  - Citizen management: directory search, email/Aadhaar verification badges, and 1-click user blocking/unblocking.
  - Analytics dashboard: live counts of registered citizens, fully verified users, votes cast, and top 5 supported causes.

---

## 🛠️ Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Backend** | Node.js, Express.js (v4.21), Mongoose ODM (v8.9) |
| **Authentication** | JWT (`jsonwebtoken`), Password & OTP Hashing (`bcryptjs`), RBAC Middleware |
| **Validation & Security** | `express-validator`, `helmet`, `cors`, `express-rate-limit` |
| **Email Service** | `nodemailer` with custom responsive HTML templates & local sandbox logger |
| **Frontend** | React 18, Vite 6, React Router DOM v6, Axios |
| **Styling & UI** | Custom Responsive CSS Design System, CSS Variables, `lucide-react` icons |
| **Database** | MongoDB (v6.0+) with Text Indexes and Unique Compound Indexes |

---

## 📁 Project Directory Structure

```text
petition-voting-system/
├── .gitignore                      # Root gitignore (protects secrets & node_modules)
├── package.json                    # Root shortcut orchestrator scripts
├── README.md                       # Master client documentation
│
├── server/                         # Backend Express API
│   ├── .env.example                # Backend environment variables template
│   ├── .env                        # Local development variables (never committed)
│   ├── .gitignore                  # Backend gitignore
│   ├── server.js                   # Express application entry point
│   ├── config/
│   │   └── db.js                   # Mongoose connection & lifecycle events
│   ├── models/                     # Mongoose Schemas & Data Layer
│   │   ├── User.js                 # User profile, role, verification flags
│   │   ├── Verification.js         # Email & Aadhaar OTP logs with referenceId
│   │   ├── Protest.js              # Protest details, authority, voteCount, text search
│   │   ├── Vote.js                 # Unique votes (user + protest compound index)
│   │   ├── AdminActivity.js        # Audit trail of administrative decisions
│   │   ├── Notification.js         # Notification dispatch logs
│   │   ├── Petition.js             # Extended signature campaigns
│   │   └── index.js                # Central models export
│   ├── controllers/                # Request handlers
│   │   ├── authController.js       # Register, OTP, Aadhaar, password, login
│   │   ├── protestController.js    # Protests CRUD, voting & retraction
│   │   └── adminController.js      # Moderation, state transitions, user block
│   ├── routes/                     # API Route definitions
│   │   ├── authRoutes.js           # /api/auth routes
│   │   ├── userRoutes.js           # /api/users routes
│   │   ├── protestRoutes.js        # /api/protests routes
│   │   ├── adminRoutes.js          # /api/admin routes
│   │   └── healthRoutes.js         # /api/health check
│   ├── middleware/                 # Middleware pipeline
│   │   ├── auth.js                 # protect, authorize, requireVerified
│   │   ├── rateLimiter.js          # API, auth, OTP, and vote rate limiters
│   │   ├── validators.js           # express-validator rules
│   │   └── errorHandler.js         # Central operational error handler
│   ├── services/
│   │   └── aadhaarService.js       # Mock Aadhaar eKYC sandbox provider
│   └── utils/
│       ├── sendEmail.js            # Nodemailer HTML template engine
│       ├── generateToken.js        # JWT token generator
│       ├── seedAdmin.js            # Standalone initial admin seeder
│       └── seeder.js               # Comprehensive test database seeder
│
└── client/                         # Frontend React + Vite SPA
    ├── .env.example                # Frontend environment template
    ├── .env                        # Local client config
    ├── .gitignore                  # Frontend gitignore
    ├── vite.config.js              # Vite bundler & API reverse proxy
    ├── index.html                  # HTML entry with Plus Jakarta Sans typography
    └── src/
        ├── App.jsx                 # Routing table & layout wrapper
        ├── App.css                 # Application component stylesheet
        ├── index.css               # Design system & CSS variables
        ├── main.jsx                # React root mount
        ├── context/
        │   └── AuthContext.jsx     # Global authentication, token & role state
        ├── services/
        │   ├── api.js              # Axios instance with JWT interceptor
        │   ├── authService.js      # Auth API endpoints
        │   ├── protestService.js   # Protest & voting API endpoints
        │   └── adminService.js     # Admin control API endpoints
        ├── components/             # Reusable UI Components
        │   ├── Navbar.jsx          # Dynamic navigation reflecting user role
        │   ├── Footer.jsx          # Platform footer
        │   ├── ProtectedRoute.jsx  # Route guard for authenticated users
        │   ├── AdminRoute.jsx      # Route guard for administrators
        │   ├── LoadingSpinner.jsx  # Animated spinner
        │   └── AlertMessage.jsx    # Error & success toast banners
        └── pages/                  # Full Application Views
            ├── HomePage.jsx        # Landing hero, platform stats, features
            ├── RegisterWizardPage.jsx # 4-step Stepper Registration Wizard
            ├── LoginPage.jsx       # Login with quick demo buttons
            ├── ProtestsListPage.jsx# Published civic protests & voting
            ├── ProtestDetailPage.jsx# Detailed grievance, demands, vote toggle
            ├── CreateProtestPage.jsx# Protest submission form (pending review)
            ├── AdminDashboardPage.jsx# Admin review, user blocking, metrics, audit
            ├── DashboardPage.jsx   # Citizen personal dashboard & voting history
            └── NotFoundPage.jsx    # 404 handler
```

---

## 💻 Prerequisites

Ensure your environment has the following installed:
1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
2. **MongoDB**: v6.0+ running locally on port 27017 or a remote MongoDB Atlas URI.
3. **npm** (comes bundled with Node.js) or **yarn**.

To check versions:
```bash
node -v
npm -v
```

---

## ⚡ Quick Start (3-Minute Setup)

### Step 1: Clone the Repository
```bash
git clone https://github.com/<YOUR_ORGANIZATION>/<REPO_NAME>.git
cd "Petition Voting System"
```

### Step 2: Set Up Environment Variables

**Backend Environment:**
```bash
# In Linux / macOS / Git Bash:
cp server/.env.example server/.env

# In Windows Command Prompt (CMD):
copy server\.env.example server\.env
```

**Frontend Environment:**
```bash
# In Linux / macOS / Git Bash:
cp client/.env.example client/.env

# In Windows Command Prompt (CMD):
copy client\.env.example client\.env
```

> *Note: Both `.env.example` files are pre-configured with local defaults (`PORT=5000`, `MONGO_URI=mongodb://127.0.0.1:27017/petition_system`, `CLIENT_URL=http://localhost:5173`) so you can run the project immediately.*

---

### Step 3: Install Dependencies
Open your terminal in the root folder and install packages:

```bash
# 1. Install Backend Dependencies
cd server
npm install

# 2. Install Frontend Dependencies
cd ../client
npm install
```

---

### Step 4: Seed the Database (Recommended)
Populate the database with pre-configured admin accounts, verified citizens, sandbox verifications, and sample protests:

```bash
cd server
npm run seed
```

Output:
```text
[Seeder] Connected to MongoDB...
[Seeder] Created 4 users with passwordHash & mobile.
[Seeder] Seeded 3 verifications.
[Seeder] Seeded 3 protests with text search indexes.
[Seeder] Seeded 3 votes with unique user-protest index.
[Seeder] Seeded AdminActivity audit log.
✅ All Mongoose Schemas Seeded & Verified successfully!
```

---

### Step 5: Start the Development Servers

Open **two terminal tabs**:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
```
> Server runs at: **`http://localhost:5000`**  
> Health check: **`http://localhost:5000/api/health`**

**Terminal 2 (Frontend React App):**
```bash
cd client
npm run dev
```
> Web UI runs at: **`http://localhost:5173`**

*(Or from the root directory, simply run `npm run server` in Terminal 1 and `npm run client` in Terminal 2).*

---

## ⚙️ Environment Variables Reference

### Backend (`server/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express server |
| `NODE_ENV` | `development` | `development` or `production` |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/petition_system` | MongoDB connection string |
| `JWT_SECRET` | `super_secret_jwt_key_petition_system_2025` | Secret key used to sign JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `SMTP_HOST` | `smtp.mailtrap.io` | SMTP host for email dispatch |
| `SMTP_PORT` | `2525` | SMTP port (465 for SSL, 587 for TLS) |
| `SMTP_USER` | `test_user` | SMTP username (logs to console in dev) |
| `SMTP_PASS` | `test_pass` | SMTP password |
| `ADMIN_EMAIL` | `admin@petitionsystem.org` | Recipient for protest submission alerts |
| `CLIENT_URL` | `http://localhost:5173` | Allowed origin for CORS headers |

### Frontend (`client/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Base URL for backend API calls |

---

## 👥 Pre-configured Demo Accounts

Use these accounts to test all roles immediately without going through manual setup:

| Account Type | Email | Password | Role | Verification State |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin@petitionsystem.org` | `AdminPassword@2025!` | `admin` | Email & Aadhaar Verified |
| **Verified Citizen** | `elena@example.com` | `password123` | `user` | Email & Aadhaar Verified |
| **Verified Citizen** | `marcus@example.com` | `password123` | `user` | Email & Aadhaar Verified |
| **Unverified Citizen**| `sarah@example.com` | `password123` | `user` | Unverified (Demo) |

*(Quick-fill buttons for these accounts are provided directly on the Login page).*

---

## 🪪 Simulated Aadhaar Sandbox Identities

For the **Simulated Aadhaar Verification** step, use any of the 10 sandbox identities below. The mock provider recognizes these numbers and accepts the fixed demo OTP **`123456`**:

| Sandbox Aadhaar Number | Simulated Citizen Name | State Jurisdiction | Fixed Demo OTP |
| :--- | :--- | :--- | :---: |
| `999911112222` | Rajesh Kumar | Maharashtra | **123456** |
| `999922223333` | Priya Sharma | Delhi | **123456** |
| `999933334444` | Amit Patel | Gujarat | **123456** |
| `999944445555` | Sunita Devi | Uttar Pradesh | **123456** |
| `999955556666` | Vikram Singh | Rajasthan | **123456** |
| `999966667777` | Ananya Rao | Karnataka | **123456** |
| `999977778888` | Mohammed Irfan | Telangana | **123456** |
| `999988889999` | Pooja Verma | Madhya Pradesh | **123456** |
| `999900001111` | Suresh Menon | Kerala | **123456** |
| `999912345678` | Kavita Nair | Tamil Nadu | **123456** |

> [!IMPORTANT]
> **Privacy Architecture**: The platform **NEVER** stores, persists, or logs the raw 12-digit Aadhaar number. Only masked reference tokens (`referenceId`) and verification statuses are stored in the `Verification` collection.

---

## 🔄 Key Application Workflows

### 1. Citizen Registration Stepper Wizard (`/register`)
1. **Step 1 (Profile)**: Input name, email, mobile. Creates user record with `passwordHash: null`.
2. **Step 2 (Email OTP)**: User receives a 6-digit OTP (logged in console in development mode). Entering the code marks `isEmailVerified = true`. Max 5 attempts enforced; 60-second cooldown on resends.
3. **Step 3 (Aadhaar eKYC)**: User inputs one of the 10 sandbox Aadhaar numbers. The backend initiates a session and returns a `referenceId`. User enters fixed demo OTP `123456` to set `isAadhaarVerified = true`.
4. **Step 4 (Password Setup)**: Allowed only when both verifications are complete. User sets a strong password (enforced with 12 Bcrypt rounds). The system automatically activates the account, issues a JWT, and redirects to the dashboard.

### 2. Civic Protest Lifecycle (`/protests`)
1. **Creation**: Any verified citizen can submit a protest at `/protests/create`. The protest is saved with status `pending`.
2. **Notification**: The system automatically dispatches an HTML email alert to `ADMIN_EMAIL` and records an entry in `Notification`.
3. **Admin Moderation (`/admin`)**:
   - An administrator reviews pending submissions in the Admin Control Center.
   - Enforced status transitions: `pending` → `approved` / `rejected`.
   - Once approved, the admin clicks **Publish for Voting** (`approved` → `published`).
   - Every status change logs the admin ID, action, and notes in `AdminActivity`.
4. **Democratic Voting**:
   - Citizens browse published protests at `/protests`.
   - Verified citizens can cast a vote in support.
   - Self-voting is rejected. Duplicate votes are blocked by a unique compound index `(user, protest)`.
   - Citizens can retract their vote at any time.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Validates name, email, mobile; sends 6-digit OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verifies email OTP; marks `isEmailVerified = true` |
| `POST` | `/api/auth/resend-otp` | Public | Resends OTP with 60-second cooldown |
| `GET`  | `/api/auth/aadhaar/test-identities` | Public | Returns the 10 demo Aadhaar numbers |
| `POST` | `/api/auth/aadhaar/initiate` | Public | Validates demo Aadhaar; returns `referenceId` |
| `POST` | `/api/auth/aadhaar/verify` | Public | Verifies demo OTP `123456`; marks `isAadhaarVerified = true` |
| `POST` | `/api/auth/set-password` | Public | Sets password (12 Bcrypt rounds) if email & Aadhaar verified |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns JWT token |

### User Profile (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/users/me` | Private | Returns authenticated user profile |
| `PUT`  | `/api/users/me` | Private | Updates name, bio, or avatar (no role tampering) |
| `GET`  | `/api/users/me/votes` | Private | Returns user's voting history with protest details |

### Protests & Voting (`/api/protests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/protests` | Public | Lists strictly `published` protests (`?q=`, `?authority=`, `?sort=`) |
| `GET`  | `/api/protests/:id` | Public | Single protest view with vote count and `hasVoted` flag |
| `GET`  | `/api/protests/mine` | Private (Verified) | Returns logged-in user's submitted protests |
| `POST` | `/api/protests` | Private (Verified) | Creates protest with status `pending`; notifies admin |
| `POST` | `/api/protests/:id/vote` | Private (Verified) | Casts vote on published protest; prevents duplicates |
| `DELETE`| `/api/protests/:id/vote` | Private (Verified) | Withdraws previously cast vote |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/admin/protests` | Admin Only | Lists protests filtered by `?status=` |
| `PATCH`| `/api/admin/protests/:id/status`| Admin Only | Enforces state transitions (`pending`→`approved`→`published`→`closed`) |
| `GET`  | `/api/admin/users` | Admin Only | Lists all registered users with search |
| `PATCH`| `/api/admin/users/:id/status` | Admin Only | Blocks or unblocks a citizen (`isActive: true/false`) |
| `GET`  | `/api/admin/stats` | Admin Only | Platform statistics and top 5 supported protests |
| `GET`  | `/api/admin/activity` | Admin Only | Chronological administrative audit trail |

### Health Check (`/api/health`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/api/health` | Public | Returns database connection state, uptime, timestamp |

---

## 🔒 Security & Privacy Architecture

1. **Zero Storage of Raw Aadhaar Numbers**:
   - The platform never persists or logs 12-digit Aadhaar numbers in any database, cache, or log file.
   - Verification operations store only an opaque session `referenceId` and a boolean verification flag.
2. **Bcrypt-Hashed OTP Storage**:
   - OTPs are hashed using `bcrypt` before writing to the `Verification` collection with `select: false`.
   - Verification records automatically expire after 10 minutes and lock after 5 failed attempts.
3. **Database-Level Vote Integrity**:
   - A Mongoose unique compound index on `{ user: 1, protest: 1 }` prevents race-condition double-voting.
   - Vote counts are incremented and decremented atomically using MongoDB's `$inc` operator.
4. **Role-Based Access Control (RBAC)**:
   - Routes use layered middlewares: `protect` (verifies JWT token), `requireVerified` (enforces active status, email verification, and Aadhaar verification), and `authorize('admin')` (enforces administrator privileges).
5. **Rate Limiting Protection**:
   - General API limiter: 300 requests / 15 minutes.
   - Authentication limiter: 40 attempts / 15 minutes.
   - Sensitive OTP limiter: 15 requests / 10 minutes to prevent SMS/email bombing.

---

## ❓ Troubleshooting Guide

### 1. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- Ensure your local MongoDB service is running:
  - **Windows**: Press `Win + R`, type `services.msc`, locate **MongoDB Server**, and click **Start**. Alternatively run: `net start MongoDB`.
  - **macOS / Linux**: `sudo systemctl start mongod` or `brew services start mongodb/brew/mongodb-community`.
- If using MongoDB Atlas, update `MONGO_URI` in `server/.env` with your connection string.

### 2. PowerShell Script Execution Blocked on Windows
If running `npm` or `nodemon` outputs:
`File ... npm.ps1 cannot be loaded because running scripts is disabled on this system`
- **Solution A**: Use `npm.cmd` instead (e.g., `npm.cmd run dev`).
- **Solution B**: In VS Code, switch your terminal shell from **PowerShell** to **Command Prompt (CMD)**.

### 3. Port Already in Use (`EADDRINUSE: port 5000` or `5173`)
- Free port 5000 on Windows:
  ```cmd
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```
- Or update `PORT=5001` in `server/.env` and `VITE_API_BASE_URL=http://localhost:5001/api` in `client/.env`.

---

## 📄 License
This project is licensed under the ISC License. All test identities and mock Aadhaar numbers are purely fictional and intended for sandbox evaluation.
