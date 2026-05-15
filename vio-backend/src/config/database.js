const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vioapp';
      const conn = await mongoose.connect(uri);

      console.log(`📦 MongoDB connected successfully: ${conn.connection.host}`);
      return conn; // Exit function on success
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection failed (Attempt ${retries}/${maxRetries}):`, error.message);

      if (retries >= maxRetries) {
        console.error('Max connection retries reached. Exiting process.');
        process.exit(1);
      }

      // Wait for 5 seconds before retrying
      console.log('Retrying in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
