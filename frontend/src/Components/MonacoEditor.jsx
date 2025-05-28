import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const MonacoEditor = ({ value, onChange, language, height = '400px' }) => {
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


  return (
    <div
      ref={editorRef}
      className="relative border border-gray-300 rounded overflow-hidden"
      style={{ height }}
    >
      <div className="absolute top-0 right-0 z-10 bg-gray-800 text-white px-2 py-1 text-xs rounded-bl">
        {language.toUpperCase()}
      </div>
      <Editor 
      defaultLanguage={language} 
      theme='vs-dark' value={value} 
      onChange={onChange} 
      options={{ automaticLayout: true,
       minimap: { enabled: false },
       wordWrap: 'on',
       padding: { top: 10, bottom: 10, left: 10, right: 10 },
       height:"70vh"
       }} />

    </div>
  );
};

export default MonacoEditor;




//  <textarea
//         defaultValue={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 border-none resize-none outline-none"
//         style={{
//           background: theme === 'vs-dark' ? '#1e1e1e' : '#ffffff',
//           color: theme === 'vs-dark' ? '#d4d4d4' : '#000000',
//           fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
//           fontSize: '14px',
//           lineHeight: '1.5',
//           tabSize: 4,
//         }}
//         spellCheck={false}
//         autoComplete="off"
//         autoCorrect="off"
//         autoCapitalize="off"
//         data-language={getLanguageMode(language)}
//       />