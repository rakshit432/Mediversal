import "dotenv/config"; // ✅ MUST BE FIRST

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import triageRouter from "./routes/triageRoute.js";

// 🚨 FAIL FAST IF ENV IS MISSING
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing in .env file");
  process.exit(1);
}

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares — CORS must come FIRST before helmet
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins (mirrors request origin)
    callback(null, true);
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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/triage', triageRouter);

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
})();
