import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const mongoURL = process.env.MONGODB_URL || process.env.MONGO_URI;

const connectDB = async () => {
  try { 
    if (!mongoURL) {
      throw new Error("MONGODB_URL or MONGO_URI is not defined in environment variables");
    }
    
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(mongoURL, options);
    console.log("✅ MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;