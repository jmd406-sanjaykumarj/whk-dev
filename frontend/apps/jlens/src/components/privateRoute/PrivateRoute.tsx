// src/components/PrivateRoute.tsx
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = sessionStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
