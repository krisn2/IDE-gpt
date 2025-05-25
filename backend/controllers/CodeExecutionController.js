// controllers/CodeExecutionController.js
const Container = require('../models/Container');

class CodeExecutionController {
  constructor() {
    this.containerModel = new Container();
  }

  async executeCode(code, connectionId, wsConnectionModel) {
    const timestamp = Date.now();
    const filename = `code_${timestamp}.py`;
    const imageName = 'python:3.10-alpine';
    let tempDir = null;

    try {
      // Check if image exists
      const imageStatus = await this.containerModel.ensureImageExists(imageName);
      
      if (!imageStatus.exists) {
        wsConnectionModel.sendMessage(connectionId, {
          type: 'stdout',
          data: `Pulling Docker image ${imageName}, please wait...`
        });
        
        await this.containerModel.pullImage(imageName);
        
        wsConnectionModel.sendMessage(connectionId, {
          type: 'stdout',
          data: `Docker image ${imageName} pulled successfully`
        });
      }

      // Create temporary directory and file
      tempDir = this.containerModel.createTempDirectory(timestamp);
      this.containerModel.writeCodeToFile(tempDir, filename, code);
      
      const dockerPath = this.containerModel.getDockerPath(tempDir);

      // Create and start container
      const container = await this.containerModel.createContainer(imageName, filename, dockerPath);
      await container.start();
      
      const containerId = container.id;
      wsConnectionModel.setContainerId(connectionId, containerId);

      // Attach to container streams
      const stream = await this.containerModel.attachToContainer(container);
      this.containerModel.storeContainer(containerId, container, stream);

      // Handle container output
      this.setupStreamHandlers(stream, containerId, connectionId, wsConnectionModel, container, tempDir);

      return containerId;

    } catch (error) {
      console.error('Error in executeCode:', error);
      wsConnectionModel.sendMessage(connectionId, {
        type: 'error',
        message: error.message
      });
      
      if (tempDir) {
        try {
          await this.containerModel.cleanupContainer(null, tempDir);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      
      throw error;
    }
  }

  setupStreamHandlers(stream, containerId, connectionId, wsConnectionModel, container, tempDir) {
    // Handle stdout and stderr
    this.containerModel.docker.modem.demuxStream(stream, {
      write: (data) => {
        const output = data.toString();
        wsConnectionModel.sendMessage(connectionId, {
          type: 'stdout',
          data: output
        });
      }
    }, {
      write: (data) => {
        const output = data.toString();
        wsConnectionModel.sendMessage(connectionId, {
          type: 'stderr',
          data: output
        });
      }
    });

    // Handle stream errors
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      wsConnectionModel.sendMessage(connectionId, {
        type: 'error',
        message: error.message
      });
    });

    // Handle container exit
    container.wait((err, data) => {
      if (err) {
        console.error('Container wait error:', err);
        wsConnectionModel.sendMessage(connectionId, {
          type: 'error',
          message: err.message
        });
      } else {
        wsConnectionModel.sendMessage(connectionId, {
          type: 'exit',
          code: data.StatusCode,
          message: 'Container execution completed'
        });

        // Clean up after a delay
        setTimeout(async () => {
          try {
            await this.containerModel.cleanupContainer(containerId, tempDir);
          } catch (cleanupErr) {
            console.error('Cleanup error:', cleanupErr);
          }
        }, 1000);
      }
    });
  }

  async sendInputToContainer(containerId, input, connectionId, wsConnectionModel) {
    const success = this.containerModel.sendInputToContainer(containerId, input);
    
    if (!success) {
      wsConnectionModel.sendMessage(connectionId, {
        type: 'error',
        message: 'No active container'
      });
      return false;
    }
    
    return true;
  }

  async cleanupContainerForConnection(containerId) {
    try {
      await this.containerModel.stopAndRemoveContainer(containerId);
    } catch (error) {
      console.error('Error cleaning up container:', error);
    }
  }
}

module.exports = CodeExecutionController;