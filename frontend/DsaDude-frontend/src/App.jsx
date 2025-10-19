import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './Layout/layout';
import Home from './Templates/Home';
import ProblemsPage from './Templates/problem-page';
import ProblemsList from './Templates/problemset';


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
