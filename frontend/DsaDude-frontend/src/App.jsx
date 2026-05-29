import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './Layout/layout';
import Home from './Templates/Home';
import ProblemsPage from './Templates/problem-page';
import ProblemsList from './Templates/problemset';
import Contributions from './Templates/contributions';
import Profile from './Templates/profile';
import SubmissionDetail from './Templates/submissionDetail';
import SubmissionsList from './Templates/submissions';
import Login from './security/Login';
import ProtectedRoute from './security/ProtectedRoute';
import Register from './security/Register'; 
import AddProblem from './Templates/Problem setting/problem-editor';


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route path='/' element={ <Home /> } />
            <Route path="/problems" element={<ProblemsList />} />

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

            <Route path="/contributions" element={
              <ProtectedRoute>
                <Contributions />
              </ProtectedRoute>
            } />

            <Route path="/submissions/:submissionId" element={
              <ProtectedRoute>
                <SubmissionDetail />
              </ProtectedRoute>
            } />
            <Route path="/problem/edit/:id" element={
              <ProtectedRoute>
                <AddProblem />
              </ProtectedRoute>
            } />
            <Route path="/problem/add" element={
              <Navigate to="/problems" replace />
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
