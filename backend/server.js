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

module.exports = Application;

// app.post('/execute', async (req, res) => {
//   const { language, content } = req.body;

//   if (!['python', 'javascript'].includes(language)) {
//     return res.status(400).json({
//       run: {
//         output: '',
//         stderr: 'Only Python and JavaScript are supported at this time.'
//       }
//     });
//   }

//   const folderPath = path.join(__dirname, 'temp', uuid());
//   fs.mkdirSync(folderPath, { recursive: true });

//   let fileName = '';
//   let dockerImage = '';
//   let runCommand = '';

//   if (language === 'python') {
//     fileName = 'code.py';
//     dockerImage = 'python:3.10-alpine';
//     runCommand = `python /app/${fileName}`;
//   } else if (language === 'javascript') {
//     fileName = 'code.js';
//     dockerImage = 'node:20-alpine';
//     runCommand = `node /app/${fileName}`;
//   }

//   const codeFilePath = path.join(folderPath, fileName);
//   fs.writeFileSync(codeFilePath, content);

//   const dockerCommand = `docker run --rm -v "${folderPath}:/app" ${dockerImage} ${runCommand}`;

//   exec(dockerCommand, { timeout: 5000 }, (err, stdout, stderr) => {
//     return res.json({
//       run: {
//         output: stdout || '',
//         stderr: stderr || ''
//       }
//     });
//   });
// });


// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });
