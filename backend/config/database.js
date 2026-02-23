'use strict';

const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

const connectionOptions = {
  maxPoolSize: 50,          // Handle 10k+ concurrent reads
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,                // IPv4 only
};

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    retryCount = 0;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔄 Retrying MongoDB connection (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      console.error('💀 Max MongoDB retries reached. Exiting.');
      process.exit(1);
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
  // Mongoose will auto-reconnect via reconnectTries by default
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB runtime error: ${err.message}`);
});

module.exports = connectDB;
