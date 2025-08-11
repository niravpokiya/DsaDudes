import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import Editor from "@monaco-editor/react";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Editor
        height="400px"
        width="400px"
        defaultLanguage="javascript"
        defaultValue="// Write your code here"
        theme="vs-dark"
      />
    </>
  )
}

export default App
