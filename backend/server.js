const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuid } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// POST /execute
app.post('/execute', async (req, res) => {
  const { language, content } = req.body;
  console.log(language)

  if (language !== 'python') {
    return res.status(400).json({ error: 'Only Python is supported at this time.' });
  }

  // Create a temp folder
  const folderPath = path.join(__dirname, 'temp', uuid());
  fs.mkdirSync(folderPath, { recursive: true });

  const codeFilePath = path.join(folderPath, 'code.py');
  fs.writeFileSync(codeFilePath, content);

  // Run code using Docker
  const dockerCommand = `docker run --rm -v "${folderPath}:/app" python:3.10-alpine python /app/code.py`;

  exec(dockerCommand, { timeout: 5000 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }
    return res.json({ output: stdout });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
