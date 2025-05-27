import React, { useRef, useEffect } from 'react';

const OutputConsole = ({ output, isRunning, stdinInput, setStdinInput, sendInput, runtimeStatus, executionTime }) => {
  const outputRef = useRef(null);

  // Scroll to bottom of output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-gray-200">
        <h2 className="text-lg font-semibold m-0 flex items-center gap-2">
          <span>📺</span>
          Console Output
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-orange-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">{isRunning ? 'Running' : 'Idle'}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Output Display */}
        <div
          ref={outputRef}
          className="flex-1 min-h-80 max-h-96 overflow-y-auto bg-gray-900 text-white font-mono p-4 rounded-lg mb-4 whitespace-pre-wrap shadow-inner"
          style={{
            background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
          }}
        >
          {output.length === 0 ? (
            <div className="text-gray-500 italic text-center py-8">
              Run your code to see output here...
            </div>
          ) : (
            output.map((line) => (
              <div
                key={line.id}
                className={`mb-1 ${
                  line.type === 'stdout' ? 'text-green-300' :
                  line.type === 'stderr' ? 'text-red-300' :
                  line.type === 'system' ? 'text-blue-300 italic' : 'text-gray-300'
                }`}
              >
                {line.text}
              </div>
            ))
          )}
        </div>

        {/* Stdin Input */}
        <div className="mb-4">
          <div className="flex rounded-lg overflow-hidden shadow-sm">
            <input
              type="text"
              value={stdinInput}
              onChange={(e) => setStdinInput(e.target.value)}
              placeholder={isRunning ? "Enter program input..." : "Program input (disabled)"}
              disabled={!isRunning}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (stdinInput.trim()) {
                    sendInput(stdinInput);
                    setStdinInput('');
                  }
                }
              }}
              className="flex-1 p-3 border border-gray-300 rounded-l-lg font-mono text-sm disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                if (stdinInput.trim()) {
                  sendInput(stdinInput);
                  setStdinInput('');
                }
              }}
              disabled={!isRunning || !stdinInput.trim()}
              className="px-4 py-3 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Send ↵
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg text-sm border">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              runtimeStatus === 'Running...'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {runtimeStatus}
            </span>
          </div>
          <div className="font-mono text-gray-600">
            {executionTime || 'Ready to execute'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputConsole;