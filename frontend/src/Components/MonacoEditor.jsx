import React, { useEffect, useRef } from 'react';

const MonacoEditor = ({ value, onChange, language, theme = 'vs-dark', height = '400px' }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Simulate Monaco Editor initialization
    // In a real application, you would use @monaco-editor/react or monaco-editor directly.
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector('textarea');
      if (textarea) {
        textarea.value = value;
        // The onChange prop from the parent App component will handle updates
        textarea.addEventListener('input', (e) => onChange(e.target.value));
      }
    }
  }, []);

  useEffect(() => {
    const textarea = editorRef.current?.querySelector('textarea');
    if (textarea && textarea.value !== value) {
      textarea.value = value;
    }
  }, [value]);

  const getLanguageMode = (lang) => {
    const modes = {
      python: 'python',
      javascript: 'javascript',
      java: 'java',
      cpp: 'cpp',
    };
    return modes[lang] || 'text';
  };

  return (
    <div
      ref={editorRef}
      className="relative border border-gray-300 rounded overflow-hidden"
      style={{ height }}
    >
      <div className="absolute top-0 right-0 z-10 bg-gray-800 text-white px-2 py-1 text-xs rounded-bl">
        {language.toUpperCase()}
      </div>
      <textarea
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 border-none resize-none outline-none"
        style={{
          background: theme === 'vs-dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'vs-dark' ? '#d4d4d4' : '#000000',
          fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
          fontSize: '14px',
          lineHeight: '1.5',
          tabSize: 4,
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        data-language={getLanguageMode(language)}
      />
      {/* Inline style for placeholder is not standard React, but can be done via global CSS or styled-components */}
      <style jsx>{`
        textarea::placeholder {
          color: ${theme === 'vs-dark' ? '#6a6a6a' : '#999999'};
        }
        textarea:focus {
          box-shadow: inset 0 0 0 1px #007acc;
        }
      `}</style>
    </div>
  );
};

export default MonacoEditor;