// views/WebSocketView.js
class WebSocketView {
  constructor() {
    // This class can be extended to handle different response formats
    // or add additional presentation logic
  }

  formatSuccessResponse(type, data) {
    return {
      type,
      data,
      timestamp: new Date().toISOString()
    };
  }

  formatErrorResponse(message, code = null) {
    return {
      type: 'error',
      message,
      code,
      timestamp: new Date().toISOString()
    };
  }

  formatExecutionResponse(type, data, exitCode = null) {
    const response = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    if (exitCode !== null) {
      response.exitCode = exitCode;
    }

    return response;
  }
}

module.exports = WebSocketView;