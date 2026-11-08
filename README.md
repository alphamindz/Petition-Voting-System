# Petition Pulse - Petition & Civic Voting Platform

A full-stack **MERN (MongoDB, Express, React, Node.js)** platform empowering citizens and communities to start petitions, gather verified signatures, drive social change, and record transparent community votes.

---

## 📁 Project Structure

```text
petition-voting-system/
├── .gitignore                     # Root gitignore (protects secrets & node_modules)
├── package.json                   # Root orchestrator scripts
├── README.md                      # Documentation & instructions
│
├── server/                        # Backend Node.js / Express API
│   ├── .env.example               # Backend environment variables template
│   ├── .gitignore                 # Backend gitignore
│   ├── server.js                  # Express entry point
│   ├── config/
│   │   └── db.js                  # Mongoose MongoDB connection
│   ├── models/                    # Mongoose Data Models
│   │   ├── User.js                # User accounts & roles
│   │   ├── Verification.js        # Email/Mobile/Aadhaar OTP verification logs
│   │   ├── Protest.js             # Petitions / civic protests with text indexes
│   │   ├── Vote.js                # Unique votes (user + protest compound index)
│   │   ├── AdminActivity.js       # Admin audit trails
│   │   ├── Notification.js        # Notification delivery logs
│   │   ├── Petition.js            # Extended petition campaign data
│   │   └── index.js               # Barrel export
│   ├── controllers/               # API route controllers
│   ├── routes/                    # API endpoints
│   ├── middleware/                # JWT auth, rate limiting, error handling
│   └── utils/                     # Email notifications (Nodemailer), seeder
│
└── client/                        # Frontend React + Vite SPA
    ├── .env.example               # Frontend environment variables template
    ├── .gitignore                 # Frontend gitignore
    ├── vite.config.js             # Vite configuration with API proxy
    ├── index.html                 # HTML shell
    └── src/
        ├── App.jsx                # Router & layout
        ├── main.jsx               # React DOM entry
        ├── context/               # Global Authentication context
        ├── services/              # Axios API service instances
        ├── components/            # Reusable UI components
        └── pages/                 # Full pages (Home, Petitions, Detail, Dashboard, Auth)
```

---

## ⚙️ Environment Variables Setup

### 1. Server Environment (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Fill in the values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/petition_system
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
ADMIN_EMAIL=admin@petitionsystem.org
CLIENT_URL=http://localhost:5173
```

### 2. Client Environment (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
Fill in the values:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Seed Sample Database (Optional but Recommended)
Populates demo users, protests, and sample campaigns:
```bash
cd server
npm run seed
```

### 3. Start Development Servers

**Option A: Using two terminals**
- **Terminal 1 (Backend):**
  ```bash
  cd server
  npm run dev
  ```
  API runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

- **Terminal 2 (Frontend):**
  ```bash
  cd client
  npm run dev
  ```
  Web app runs at `http://localhost:5173`

**Option B: From root folder**
```bash
npm run server   # Starts backend
npm run client   # Starts frontend
```

---

## 🔒 Security & Privacy Measures
- **No Raw OTPs**: OTP values are hashed (`otpHash`) using `bcryptjs` before storage with `select: false`.
- **No Raw Aadhaar Numbers**: Only masked reference identifiers / eKYC transaction tokens (`referenceId`) are recorded.
- **Duplicate Vote Prevention**: Mongoose enforces a `unique` compound index on `(user, protest)` in the `Vote` model.
- **Password Protection**: Passwords are saved with bcrypt hashes (`passwordHash`) and stripped from all JSON responses.
- **Git Security**: `.env` and `.env.local` files containing secrets are completely excluded via `.gitignore`.
