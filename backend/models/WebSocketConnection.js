// models/WebSocketConnection.js
class WebSocketConnection {
  constructor() {
    this.connections = new Map();
  }

  addConnection(ws, id = null) {
    const connectionId = id || this.generateId();
    this.connections.set(connectionId, {
      ws,
      containerId: null,
      createdAt: new Date()
    });
    return connectionId;
  }

  removeConnection(connectionId) {
    return this.connections.delete(connectionId);
  }

  getConnection(connectionId) {
    return this.connections.get(connectionId);
  }

  setContainerId(connectionId, containerId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.containerId = containerId;
    }
  }

  getContainerId(connectionId) {
    const connection = this.connections.get(connectionId);
    return connection ? connection.containerId : null;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  sendMessage(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (connection && connection.ws.readyState === 1) {
      connection.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
}

module.exports = WebSocketConnection;
