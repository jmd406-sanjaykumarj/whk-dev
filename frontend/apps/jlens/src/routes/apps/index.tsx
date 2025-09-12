import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

import { chatRoutes } from './chat'
import { aiProposalRoutes } from './ai-proposal'
import { selfAnalyticsRoutes } from './self-analytics'
import PrivateRoute from '@/components/privateRoute/PrivateRoute'

const AppShell = lazy(() => import('@/pages/welcome'))

export const appRoutes = [
  {
    path: '/app',
    element: (
      <PrivateRoute>
        <AppShell />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/chat" replace /> },
      ...chatRoutes,
      ...aiProposalRoutes,
      ...selfAnalyticsRoutes,
    ]
  }
]
