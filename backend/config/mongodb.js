import mongoose from 'mongoose';

const mongoURL = process.env.MONGODB_URL || process.env.MONGO_URI;

const connectDB = async () => {
  try { 
    if (!mongoURL) {
      throw new Error("MONGODB_URL or MONGO_URI is not defined in environment variables");
    }
    
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    };
    
    await mongoose.connect(mongoURL, options);
    console.log("✅ MongoDB connected successfully");
    
    // Only surface REAL long disconnects (>3 seconds) — transient idle blips are normal
    let disconnectTimer = null;
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message || String(err).slice(0, 200));
    });
    
    mongoose.connection.on('disconnected', () => {
      if (disconnectTimer) return;
      disconnectTimer = setTimeout(() => {
        console.warn('⚠️  MongoDB disconnected (for >3s — check your network/Atlas cluster)');
        disconnectTimer = null;
      }, 3000);
    });

    mongoose.connection.on('reconnected', () => {
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }
    });
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;