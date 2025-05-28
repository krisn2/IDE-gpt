const express = require('express');
const http = require('http');
const WebSocketRouter = require('./routes/websocket');
const serverConfig = require('./config/server');

class Application {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    // Add any Express middleware here
    this.app.use(express.json());
    
    // Basic health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
      });
    });
  }

  setupRoutes() {
    // Add any HTTP routes here
    this.app.get('/', (req, res) => {
      res.json({ 
        message: 'Docker Code Execution Server',
        version: '1.0.0',
        endpoints: {
          websocket: 'ws://localhost:' + serverConfig.port,
          health: '/health'
        }
      });
    });
  }

  setupWebSocket() {
    this.wsRouter = new WebSocketRouter(this.server);
  }

  start() {
    this.server.listen(serverConfig.port, () => {
      console.log(`Server running on port ${serverConfig.port}`);
      console.log(`Environment: ${serverConfig.environment}`);
      console.log(`WebSocket endpoint: ws://localhost:${serverConfig.port}`);
    });
  }
}

// Start the application
const app = new Application();
app.start();

// module.exports = Application;