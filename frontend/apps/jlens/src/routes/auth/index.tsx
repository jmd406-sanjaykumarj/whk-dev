import  { lazy } from 'react'
import { Navigate } from 'react-router-dom'


const Home = lazy(() => import('@/pages/home'))

export const authRoutes = [
  {
    path: '/',
    element: <Navigate to="/login" />
  },
  {
    path: '/login',
    element: <Home />
  }
]
