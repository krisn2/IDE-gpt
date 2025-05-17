import{ Box, HStack } from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import { useState, useRef } from 'react'
import LanguageSelector from './LanguageSelector'
import { CODE_SNIPPETS } from '../constants'
import Output from "./Output"

const CodeEditor = () => {
    const editorRef = useRef();
    const [Value, setValue] = useState("");
    const [language, setLanguage] = useState("javascript");

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    const onSelcet = (language) => {
      setLanguage(language);
      setValue(CODE_SNIPPETS[language]);
    }

  return (
    <Box>
        <HStack spacing= {4}>
          <Box w="50%">
        <LanguageSelector language={language} onSelect={onSelcet} />
        <Editor 
        options={{
          minimap:{
            enabled: false
          }
        }}
        height="75vh" 
        theme='vs-dark'
        language={language}
        defaultValue={CODE_SNIPPETS[language]}
        value={Value}
        onChange={
            (value) => setValue(value)
        } 
        onMount={onMount}
        />
        </Box>
        <Output language={language} editorRef={editorRef}/>
        </HStack>
    </Box>
  )
}

export default CodeEditor