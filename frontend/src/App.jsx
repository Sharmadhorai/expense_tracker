import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories   from './pages/Categories'
import Budget       from './pages/Budget'
import Reports      from './pages/Reports'
import Profile      from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          }/>
          <Route path="/transactions" element={
            <ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>
          }/>
          <Route path="/categories" element={
            <ProtectedRoute><Layout><Categories /></Layout></ProtectedRoute>
          }/>
          <Route path="/budget" element={
            <ProtectedRoute><Layout><Budget /></Layout></ProtectedRoute>
          }/>
          <Route path="/reports" element={
            <ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
          }/>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
