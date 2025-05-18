const path = require('path');
const {exec} = require('child_process');
const fs = require('fs');
const {v4: uuid} = require('uuid');
async function  execute(req, res) {
    const {language, content} = req.body;

    if(!['python','javascript'].includes(language)){
        return res.status(400).json({
            run: {
                output: '',
                stderr: 'Only Python and JavaScript are supported at this time.'
            }
        });
    }

    const folderPath = path.join(__dirname, 'temp', uuid());
    fs.mkdirSync(folderPath, {recursive: true});

    let fileName = '';
    let dockerImage = '';
    let runCommand = '';

    if (language === 'python') {
        fileName = 'code.py';
        dockerImage = 'python:3.10-alpine';
        runCommand = `python /app/${fileName}`;
    } else if (language === 'javascript') {
        fileName = 'code.js';
        dockerImage = 'node:20-alpine';
        runCommand = `node /app/${fileName}`;
    }

    const codeFilePath = path.join(folderPath, fileName);
    fs.writeFileSync(codeFilePath, content);

    const dockerCommand = `docker run --rm -v ${folderPath}:/app -w /app ${dockerImage} ${runCommand}`;

    try {
        const { stdout, stderr } = await new Promise((resolve, reject) => {
            exec(dockerCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });

        return res.status(200).json({ run: { output: stdout, stderr } });
    } catch (error) {
        return res.status(500).json({ run: { output: '', stderr: error.message } });
    }
}

module.exports = {execute};