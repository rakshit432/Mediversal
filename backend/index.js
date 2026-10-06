// Load .env from backend/ folder. Note: dotenv v17 "dotenv/config" auto-loads env but logs
// a "injecting env" progress line. The 14 vars DO load despite the "(0)" side message from
// duplicate submodule "import dotenv/config" elsewhere in the codebase.
import "dotenv/config";

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import triageRouter from "./routes/triageRoute.js";
import reportRouter from "./routes/reportRoute.js";
import doctorReportRouter from "./routes/doctorReportRoute.js";

import rateLimit from 'express-rate-limit';

// 🚨 FAIL FAST IF ENV IS MISSING
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing in .env file");
  process.exit(1);
}

// app config
const app = express();
const port = process.env.PORT || 4000;

// Configurable CORS for production security
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    // In dev or if no ALLOWED_ORIGINS specified, allow all.
    // In production, check if origin is in the allowed list or absent (e.g. server-to-server/Postman)
    if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'atoken', 'dtoken'],
  credentials: true
}));

// Handle preflight OPTIONS requests for all routes (Express 5 compatible)
app.options(/.*/, cors());

// Helmet — disable crossOriginResourcePolicy so it doesn't block CORS fetches
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

// Rate limiting: general API limiter to protect against flood/DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
});
app.use('/api', apiLimiter);

// Stricter rate limiter for AI triage to prevent quota exhaustion
const triageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 triage requests per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI symptom triage queries. Please wait a few minutes before trying again." },
});
app.use('/api/triage', triageLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads for local fallback storage (serves /uploads/<file> URLs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), { maxAge: '1d' }));

// routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/triage', triageRouter);
app.use('/api/reports', reportRouter);
app.use('/api/doctor/patients', doctorReportRouter);

app.get('/', (req, res) => {
  res.send('API is running....');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// startup
(async () => {
  await connectDB();
  await connectCloudinary();

  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`JWT_SECRET loaded ✔`);
  });
})().catch((err) => {
  console.error("❌ Server failed to start:", err.message);
  process.exit(1);
});
