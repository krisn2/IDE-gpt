// config/server.js
module.exports = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  websocket: {
    heartbeatInterval: 30000, // 30 seconds
    maxConnections: 100
  }
};