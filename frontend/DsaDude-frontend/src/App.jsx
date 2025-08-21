import { useState } from 'react' 
import './App.css'
import Editor from "@monaco-editor/react";
import NavBar from './Templates/navigation';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout/layout';
import Home from './Templates/Home';
import ProblemsList from './Templates/problemset';
import ProblemsPage from './Templates/problem-page';


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={Home}></Route>
            <Route path="/problems" element={<ProblemsList />} />
            <Route path="/problems/:slug" element={<ProblemsPage />} />
            {/* <Route path="/problemset" element={<ProblemsList />} />
            <Route path="/profile" element={<Profile />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
