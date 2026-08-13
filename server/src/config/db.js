const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/ai-workspace';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️ Primary MongoDB Connection Failed: ${error.message}`);
    
    if (primaryUri.includes('mongodb.net')) {
      console.warn(`💡 Tip: If using MongoDB Atlas, make sure your IP address is whitelisted (Network Access -> 0.0.0.0/0) in Atlas Dashboard.`);
    }

    try {
      console.log(`🔄 Attempting fallback to local MongoDB (${localUri})...`);
      const fallbackConn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Fallback MongoDB Connected: ${fallbackConn.connection.host}`);
    } catch (fallbackError) {
      console.error(`❌ Fallback Database Connection Failed: ${fallbackError.message}`);
      console.warn(`⚠️ Running server without active database connection. API endpoints requiring DB will return error responses until DB connection is available.\n`);
    }
  }
};

module.exports = connectDB;
