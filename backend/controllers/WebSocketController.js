// controllers/WebSocketController.js
const WebSocketConnection = require('../models/WebSocketConnection');
const CodeExecutionController = require('./CodeExecutionController');

class WebSocketController {
  constructor() {
    this.wsConnectionModel = new WebSocketConnection();
    this.codeExecutionController = new CodeExecutionController();
  }

  handleConnection(ws) {
    const connectionId = this.wsConnectionModel.addConnection(ws);
    console.log(`Client connected with ID: ${connectionId}`);

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        await this.handleMessage(data, connectionId);
      } catch (error) {
        console.error('Error processing message:', error);
        this.wsConnectionModel.sendMessage(connectionId, {
          type: 'error',
          message: error.message
        });
      }
    });

    // Handle client disconnect
    ws.on('close', async () => {
      console.log(`Client disconnected: ${connectionId}`);
      await this.handleDisconnection(connectionId);
    });

    return connectionId;
  }

  async handleMessage(data, connectionId) {
    console.log('Received message:', data.type);

    switch (data.type) {
      case 'code':
        console.log('Executing code');
        await this.codeExecutionController.executeCode(
          data.code, 
          connectionId, 
          this.wsConnectionModel
        );
        break;

      case 'stdin':
        console.log('Sending stdin to container');
        const containerId = this.wsConnectionModel.getContainerId(connectionId);
        await this.codeExecutionController.sendInputToContainer(
          containerId,
          data.input,
          connectionId,
          this.wsConnectionModel
        );
        break;

      default:
        this.wsConnectionModel.sendMessage(connectionId, {
          type: 'error',
          message: 'Unknown message type'
        });
    }
  }

  async handleDisconnection(connectionId) {
    const containerId = this.wsConnectionModel.getContainerId(connectionId);
    
    if (containerId) {
      await this.codeExecutionController.cleanupContainerForConnection(containerId);
    }
    
    this.wsConnectionModel.removeConnection(connectionId);
  }
}

module.exports = WebSocketController;