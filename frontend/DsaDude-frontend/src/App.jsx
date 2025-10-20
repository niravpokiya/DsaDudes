import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './Layout/layout';
import Home from './Templates/Home';
import ProblemsPage from './Templates/problem-page';
import ProblemsList from './Templates/problemset';
import ProtectedRoute from './Security/ProtectedRoute';
import Profile from './Templates/profile';


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={ <Home /> }></Route>
            <Route path="/problems" element={
                    <ProblemsList />
          } />

          <Route path="/problems/:slug" element={
              <ProtectedRoute>
                <ProblemsPage />
              </ProtectedRoute>
            } />
            
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
