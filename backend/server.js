process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
'use strict';

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
