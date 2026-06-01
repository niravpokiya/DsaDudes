import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './Layout/layout';
import Home from './Templates/Home';
import ProblemsPage from './Templates/problem-page';
import ProblemsList from './Templates/problemset';
import AdminLayout from './Templates/Admin/AdminLayout';
import AdminDashboard from './Templates/Admin/pages/AdminDashboard';
import AdminContributions from './Templates/Admin/pages/AdminContributions';
import AdminCreateProblem from './Templates/Admin/pages/AdminCreateProblem';
import AdminProblemEditor from './Templates/Admin/pages/AdminProblemEditor';
import LegacyProblemEditRedirect from './Templates/Admin/pages/LegacyProblemEditRedirect';
import AdminUsers from './Templates/Admin/pages/AdminUsers';
import Profile from './Templates/profile';
import SubmissionDetail from './Templates/submissionDetail';
import SubmissionsList from './Templates/submissions';
import Login from './security/Login';
import ProtectedRoute from './security/ProtectedRoute';
import Register from './security/Register'; 


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="contributions" element={<AdminContributions />} />
            <Route path="create" element={<AdminCreateProblem />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="problems/:id" element={<AdminProblemEditor />} />
          </Route>

          <Route path="/problem/edit/:id" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <LegacyProblemEditRedirect />
            </ProtectedRoute>
          } />

          <Route path="/problem/add" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Navigate to="/admin/create" replace />
            </ProtectedRoute>
          } />

          <Route element={<Layout />}>
            <Route path='/' element={ <Home /> } />
            <Route path="/problems" element={<ProblemsList />} />

            <Route path="/problems/:slug" element={
                <ProblemsPage />
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
              <Navigate to="/admin/contributions" replace />
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
