const express = require('express');
const cors = require('cors');
const executeRouter = require('./routes/executeRoute');
const e = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/execute', executeRouter);

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


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
