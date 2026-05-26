import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Resources from './pages/Resources'
import Problems from './pages/Problems'
import Jobs from './pages/Jobs'
import Discussions from './pages/Discussions'
import Profile from './pages/Profile'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return <div className="spinner" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Feed />} />
        <Route path="resources" element={<Resources />} />
        <Route path="problems" element={<Problems />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="discussions" element={<Discussions />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
