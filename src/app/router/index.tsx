import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { ConsultationPage } from '@/pages/consultation'
import { LoginPage } from '@/pages/login'
import { RecommendationResultPage } from '@/pages/recommendation-result'
import { SignUpPage } from '@/pages/signup'
import { MspProjectsPage } from '@/pages/msp-projects'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ConsultationPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/requests',
    element: <Navigate to="/requests/a-shop" replace />,
  },
  {
    path: '/requests/:requestId',
    element: <RecommendationResultPage />,
  },
  {
    path: '/msp/projects',
    element: <MspProjectsPage />,
  },
  {
    path: '/msp/projects/:projectId/:step?',
    element: <MspProjectsPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
