import { BrowserRouter, Route, Routes } from 'react-router-dom'; 
import './App.css';
import Layout from './Layout/layout';
import Home from './Templates/Home';
import ProblemsPage from './Templates/problem-page';
import ProblemsList from './Templates/problemset';
import ProtectedRoute from './Security/ProtectedRoute';
import Profile from './Templates/profile';
import SubmissionsList from './Templates/submissions';
import SubmissionDetail from './Templates/submissionDetail';


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

          <Route path="/submissions" element={
            <ProtectedRoute>
              <SubmissionsList />
            </ProtectedRoute>
          } />

          <Route path="/submissions/:submissionId" element={
            <ProtectedRoute>
              <SubmissionDetail />
            </ProtectedRoute>
          } />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
