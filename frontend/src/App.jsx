import { useState, useRef } from 'react';
import MonacoEditor from './Components/MonacoEditor';
import OutputConsole from './Components/OutputConsole';
import useWebSocket from './hooks/useWebSocket';
import { languageConfigs} from './config/languageConfigs';

const App = () => {
  // State management
  const [code, setCode] = useState(languageConfigs.python.defaultCode);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [stdinInput, setStdinInput] = useState('');
  const [executionTime, setExecutionTime] = useState('');
  const [runtimeStatus, setRuntimeStatus] = useState('Ready');

  // Refs
  const startTimeRef = useRef(null);

  // WebSocket URL
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.hostname || "localhost";
  const port = "3000"; // Assuming your WebSocket server runs on port 3000
  const wsUrl = `${protocol}://${host}:${port}`;

  // Handle messages from the server via custom hook
  const handleServerMessage = (data) => {
    switch (data.type) {
      case "stdout":
        appendToOutput(data.data, "stdout");
        break;

      case "stderr":
        appendToOutput(data.data, "stderr");
        break;

      case "error":
        appendToOutput("Error: " + data.message, "stderr");
        setIsRunning(false);
        setRuntimeStatus("Ready");
        break;

      case "system":
        appendToOutput(data.data, "system");
        break;

      case "exit":
        let executionDuration = ((Date.now() - startTimeRef.current) / 1000).toFixed(2);
        appendToOutput(`Program exited with code ${data.code}`, "system");
        setExecutionTime(`Execution time: ${executionDuration}s`);
        setIsRunning(false);
        setRuntimeStatus("Ready");
        break;

      default:
        console.warn("Unknown message type:", data.type);
    }
  };

  const { isConnected, sendMessage } = useWebSocket(wsUrl, handleServerMessage);

  // Append text to the output console
  const appendToOutput = (text, type) => {
    setOutput(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
  };

  // Send code to server
  const runCode = () => {
    if (!isConnected) {
      appendToOutput("Not connected to server", "system");
      return;
    }

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      appendToOutput("Please enter some code", "system");
      return;
    }

    setOutput([]);
    setExecutionTime('');
    setIsRunning(true);
    setRuntimeStatus("Running...");
    startTimeRef.current = Date.now();

    const message = {
      type: "code",
      code: trimmedCode,
      language: language,
    };

    sendMessage(message);
    appendToOutput("Running code...", "system");
  };

  // Send input to the running program
  const sendInput = (input) => {
    if (!isConnected) {
      appendToOutput("Not connected to server", "system");
      return;
    }

    const message = {
      type: "stdin",
      input: input,
    };

    sendMessage(message);
    appendToOutput(`> ${input}`, "user-input"); // Optional: show user input in console
  };



  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (languageConfigs[newLanguage]) {
      setCode(languageConfigs[newLanguage].defaultCode);
    }
    clearOutput();
  };

  // Clear output
  const clearOutput = () => {
    setOutput([]);
    setExecutionTime('');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700">
      <div className="max-w-7xl mx-auto p-5">
        {/* Header */}
        <header className="flex justify-between items-center mb-5 pb-2.5 border-b border-gray-300">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl text-blue-600">⚡</span>
            <h1 className="text-3xl font-bold text-blue-600 m-0">Online-IDE</h1>
          </div>
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Code Editor Panel */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-gray-200">
              <h2 className="text-lg font-semibold m-0 flex items-center gap-2">
                <span>📝</span>
                Code Editor
              </h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Language:</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="p-2 border border-gray-300 rounded bg-white font-medium"
                >
                  <option value="python">🐍 Python</option>
                  <option value="javascript">🟨 JavaScript</option>
                </select>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {/* Monaco Editor */}
              <div className="mb-4">
                <MonacoEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  height="400px"
                />
              </div>

              {/* Button Group */}
              <div className="flex gap-3">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isRunning
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  } relative`}
                >
                  {isRunning && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {!isRunning && <span>▶️</span>}
                  <span className={isRunning ? 'opacity-0' : 'opacity-100'}>
                    Run Code
                  </span>
                </button>
                <button
                  onClick={clearOutput}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <OutputConsole
            output={output}
            isRunning={isRunning}
            stdinInput={stdinInput}
            setStdinInput={setStdinInput}
            sendInput={sendInput}
            runtimeStatus={runtimeStatus}
            executionTime={executionTime}
          />
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center py-5 border-t border-gray-300 text-sm text-gray-500">
          <p>&copy; 2025 CodeRunner - Secure Container-based Code Execution Platform</p>
          <p className="mt-1">Powered by Monaco Editor • Real-time execution • Multi-language support</p>
        </footer>
      </div>
    </div>
  );
};

export default App;