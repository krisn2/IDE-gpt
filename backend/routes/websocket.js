// routes/websocket.js
const WebSocket = require('ws');
const WebSocketController = require('../controllers/WebSocketController');

class WebSocketRouter {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.wsController = new WebSocketController();
    this.setupRoutes();
  }

  setupRoutes() {
    this.wss.on('connection', (ws) => {
      this.wsController.handleConnection(ws);
    });
  }

  getWebSocketServer() {
    return this.wss;
  }
}

module.exports = WebSocketRouter;
