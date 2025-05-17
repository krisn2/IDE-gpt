// Secure Code Execution Backend
// A Node.js application that safely runs user code in Docker containers
// with malicious code detection

const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuration
const PORT = process.env.PORT || 3000;
const CODE_EXECUTION_TIMEOUT = 10000; // 10 seconds
const MAX_CONTAINER_LIFETIME = 20000; // 20 seconds
const TEMP_CODE_DIR = path.join(__dirname, 'temp_code');

// Initialize temp directory
async function initTempDirectory() {
  try {
    await fs.mkdir(TEMP_CODE_DIR, { recursive: true });
    console.log('Temporary code directory initialized');
  } catch (error) {
    console.error('Failed to create temp directory:', error);
    process.exit(1);
  }
}

// Define supported languages and their Docker configurations
const SUPPORTED_LANGUAGES = {
  javascript: {
    extension: 'js',
    image: 'node:16-alpine',
    command: 'node',
    memoryLimit: '100m',
    cpuLimit: '0.5'
  },
  python: {
    extension: 'py',
    image: 'python:3.9-alpine',
    command: 'python',
    memoryLimit: '100m',
    cpuLimit: '0.5'
  },
  // Add more languages as needed
};

// Add a new endpoint to analyze code without executing it
app.post('/analyze', async (req, res) => {
  const { code, language } = req.body;
  
  // Validate input
  if (!code || !language) {
    return res.status(400).json({ 
      status: 'error',
      error: 'Code and language are required' 
    });
  }
  
  if (!SUPPORTED_LANGUAGES[language]) {
    return res.status(400).json({ 
      status: 'error',
      error: 'Unsupported language' 
    });
  }
  
  // Analyze the code
  const securityCheck = detectSuspiciousCode(code, language);
  
  // Return the analysis results
  res.json({
    status: 'success',
    language,
    suspicious: securityCheck.suspicious,
    reasons: securityCheck.reasons || [],
    estimatedSafe: !securityCheck.suspicious
  });
});

// Functions to detect potentially malicious code
function detectSuspiciousJSCode(code) {
  const suspiciousPatterns = [
    { pattern: /\beval\s*\(/i, description: 'Potential eval() usage' },
    { pattern: /\bchild_process\b/i, description: 'Potential child_process module usage' },
    { pattern: /\bprocess\.binding\b/i, description: 'Low-level Node.js bindings usage' },
    { pattern: /\brequire\s*\(\s*['"]fs['"]\)/i, description: 'File system access attempt' },
    { pattern: /while\s*\(\s*true\s*\)/i, description: 'Potential infinite loop' },
    { pattern: /for\s*\(\s*;;\s*\)/i, description: 'Potential infinite loop' },
    { pattern: /\bprocess\.exit\b/i, description: 'Process termination attempt' },
    { pattern: /\bglobal\.\w+\s*=/i, description: 'Global object modification' },
    { pattern: /\bprocess\.env\b/i, description: 'Environment variables access' },
    { pattern: /\bcrypto\.generateKeyPair/i, description: 'CPU-intensive crypto operations' }
  ];
  
  const findings = suspiciousPatterns
    .filter(item => item.pattern.test(code))
    .map(item => item.description);
  
  return findings.length > 0 ? 
    { suspicious: true, reasons: findings } : 
    { suspicious: false };
}

function detectSuspiciousPythonCode(code) {
  const suspiciousPatterns = [
    { pattern: /\bimport\s+os\b/i, description: 'OS module import' },
    { pattern: /\bimport\s+sys\b/i, description: 'System module import' },
    { pattern: /\bimport\s+subprocess\b/i, description: 'Subprocess module import' },
    { pattern: /\bopen\s*\(/i, description: 'File system access attempt' },
    { pattern: /\bwhile\s+True\b/i, description: 'Potential infinite loop' },
    { pattern: /\bfor\s+.*\s+in\s+iter\(int, 1\)/i, description: 'Potential infinite loop' },
    { pattern: /\bimport\s+socket\b/i, description: 'Network access attempt' },
    { pattern: /\bimport\s+requests\b/i, description: 'HTTP request attempt' },
    { pattern: /\bexec\s*\(/i, description: 'Code execution attempt' },
    { pattern: /\beval\s*\(/i, description: 'Code evaluation attempt' }
  ];
  
  const findings = suspiciousPatterns
    .filter(item => item.pattern.test(code))
    .map(item => item.description);
  
  return findings.length > 0 ? 
    { suspicious: true, reasons: findings } : 
    { suspicious: false };
}

// Detect suspicious code based on language
function detectSuspiciousCode(code, language) {
  switch(language) {
    case 'javascript':
      return detectSuspiciousJSCode(code);
    case 'python':
      return detectSuspiciousPythonCode(code);
    default:
      return { suspicious: false };
  }
}

// Endpoint for code execution
app.post('/execute', async (req, res) => {
  const { code, language } = req.body;
  console.log(language)
  
  // Validate input
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }
  
  if (!SUPPORTED_LANGUAGES[language]) {
    return res.status(400).json({ error: 'Unsupported language' });
  }
  
  // Detect potential malicious code
  const securityCheck = detectSuspiciousCode(code, language);
  
  // Log suspicious activity for monitoring
  if (securityCheck.suspicious) {
    console.warn(`Suspicious code detected (${language}):`, {
      reasons: securityCheck.reasons,
      codePreview: code.substring(0, 100) + (code.length > 100 ? '...' : '')
    });
    
    // Optional: add stricter handling for suspicious code
    // Uncomment the following to block execution of suspicious code
    /*
    if (process.env.BLOCK_SUSPICIOUS_CODE === 'true') {
      return res.status(403).json({ 
        error: 'Code execution blocked', 
        details: 'Potentially harmful patterns detected',
        suspiciousPatterns: securityCheck.reasons
      });
    }
    */
  }
  
  const executionId = uuidv4();
  
  try {
    // Create execution result
    const result = await executeCode(code, language, executionId);
    
    // Add a warning flag if code was suspicious but allowed to run
    if (securityCheck.suspicious) {
      result.warning = 'Code contained potentially suspicious patterns';
      result.suspiciousPatterns = securityCheck.reasons;
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Execution error for ${executionId}:`, error);
    res.status(500).json({ error: 'Execution failed', details: error.message });
  } finally {
    // Clean up resources
    cleanupExecution(executionId).catch(err => 
      console.error(`Cleanup error for ${executionId}:`, err));
  }
});

// Function to execute code in Docker container
async function executeCode(code, language, executionId) {
  const langConfig = SUPPORTED_LANGUAGES[language];
  const { extension, image, command, memoryLimit, cpuLimit } = langConfig;
  
  // Create a unique directory for this execution
  const executionDir = path.join(TEMP_CODE_DIR, executionId);
  await fs.mkdir(executionDir, { recursive: true });
  
  // Write code to file
  const filename = `code.${extension}`;
  const filepath = path.join(executionDir, filename);
  await fs.writeFile(filepath, code);
  
  // Prepare Docker command with security constraints
  const dockerCommand = `docker run --rm \
    --name code_exec_${executionId} \
    --memory=${memoryLimit} \
    --cpus=${cpuLimit} \
    --memory-swap=${memoryLimit} \
    --network=none \
    --cap-drop=ALL \
    --security-opt=no-new-privileges \
    -v ${executionDir}:/code \
    -w /code \
    ${image} ${command} ${filename}`;
  
  // Execute code with timeout
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const process = exec(dockerCommand, { timeout: CODE_EXECUTION_TIMEOUT }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;
      
      if (error && error.killed) {
        return reject(new Error('Execution timed out'));
      }
      
      resolve({
        output: stdout,
        error: stderr,
        executionTime,
        language
      });
    });
    
    // Set an additional timeout to force-kill the container if it somehow survives
    setTimeout(() => {
      exec(`docker kill code_exec_${executionId}`).catch(err => 
        console.error(`Failed to kill container ${executionId}:`, err));
    }, MAX_CONTAINER_LIFETIME);
  });
}

// Function to clean up after execution
async function cleanupExecution(executionId) {
  const executionDir = path.join(TEMP_CODE_DIR, executionId);
  
  // Ensure container is removed (if still running)
  try {
    await new Promise((resolve, reject) => {
      exec(`docker kill code_exec_${executionId}`, () => {
        // Ignore errors - container might not exist
        resolve();
      });
    });
  } catch (error) {
    // Ignore - just a safety measure
  }
  
  // Remove temporary files
  try {
    await fs.rm(executionDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to remove directory ${executionDir}:`, error);
  }
}

// Route for health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
async function startServer() {
  await initTempDirectory();
  app.listen(PORT, () => {
    console.log(`Code execution server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});