// models/Container.js
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const os = require('os');

class Container {
  constructor() {
    this.docker = new Docker();
    this.activeContainers = new Map();
  }

  async ensureImageExists(imageName) {
    try {
      await this.docker.getImage(imageName).inspect();
      return { exists: true };
    } catch (error) {
      return { exists: false };
    }
  }

  async pullImage(imageName) {
    const stream = await this.docker.pull(imageName);
    return new Promise((resolve, reject) => {
      this.docker.modem.followProgress(stream, (err, res) => 
        err ? reject(err) : resolve(res)
      );
    });
  }

  createTempDirectory(timestamp) {
    const tempDirPath = os.tmpdir();
    const tempDirName = `code-${timestamp}`;
    const tempDir = path.join(tempDirPath, tempDirName);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    return tempDir;
  }

  writeCodeToFile(tempDir, filename, code) {
    const codeFilePath = path.join(tempDir, filename);
    fs.writeFileSync(codeFilePath, code);
    return codeFilePath;
  }

  getDockerPath(tempDir) {
    if (process.platform === 'win32') {
      return tempDir
        .replace(/^([A-Z]):\\/, '/$1/')
        .replace(/\\/g, '/');
    }
    return tempDir;
  }

  async createContainer(imageName, filename, dockerPath) {
    return await this.docker.createContainer({
      Image: imageName,
      Cmd: ['python', `/code/${filename}`],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      OpenStdin: true,
      StdinOnce: false,
      HostConfig: {
        Binds: [`${dockerPath}:/code`]
      }
    });
  }

  async attachToContainer(container) {
    return await container.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
      hijack: true
    });
  }

  storeContainer(containerId, container, stream) {
    this.activeContainers.set(containerId, { 
      container, 
      stdin: stream 
    });
  }

  getContainer(containerId) {
    return this.activeContainers.get(containerId);
  }

  async cleanupContainer(containerId, tempDir) {
    try {
      const containerData = this.activeContainers.get(containerId);
      if (containerData) {
        await containerData.container.remove();
        this.activeContainers.delete(containerId);
      }
      
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      throw error;
    }
  }

  async stopAndRemoveContainer(containerId) {
    try {
      const containerData = this.activeContainers.get(containerId);
      if (containerData) {
        await containerData.container.stop();
        await containerData.container.remove();
        this.activeContainers.delete(containerId);
      }
    } catch (error) {
      console.error('Error stopping container:', error);
      throw error;
    }
  }

  sendInputToContainer(containerId, input) {
    const containerData = this.activeContainers.get(containerId);
    if (containerData && containerData.stdin) {
      containerData.stdin.write(input + '\n');
      return true;
    }
    return false;
  }
}

module.exports = Container;