const mongoose = require('mongoose');

const connectDB = async () => {
  const defaultAtlasUri = 'mongodb+srv://NarasimhaDB:Mongodb%40123@cluster0.fxfjmby.mongodb.net/workspace?appName=Cluster0';
  const primaryUri = process.env.MONGO_URI || defaultAtlasUri;
  const isProduction = process.env.NODE_ENV === 'production';

  // Mask password for safe logging
  const maskedUri = primaryUri.replace(/:([^:@]+)@/, ':****@');
  console.log(`🔄 Connecting to MongoDB: ${maskedUri}...`);

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`\n❌ Primary MongoDB Connection Failed: ${error.message}`);
    console.warn(`💡 MongoDB Atlas Tip: Make sure 0.0.0.0/0 is added under Network Access in MongoDB Atlas Dashboard.`);

    if (!isProduction) {
      try {
        const localUri = 'mongodb://127.0.0.1:27017/ai-workspace';
        console.log(`🔄 Dev Mode: Attempting fallback to local MongoDB (${localUri})...`);
        const fallbackConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`✅ Local Fallback MongoDB Connected: ${fallbackConn.connection.host}`);
      } catch (fallbackError) {
        console.error(`❌ Local Fallback Database Connection Failed: ${fallbackError.message}`);
      }
    } else {
      console.warn(`⚠️ Production Notice: Server running without active DB. Verify MONGO_URI and Atlas Network Access.\n`);
    }
  }
};

module.exports = connectDB;
