import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { ConsultationPage } from '@/pages/consultation'
import { LoginPage } from '@/pages/login'
import { RecommendationResultPage } from '@/pages/recommendation-result'
import { SignUpPage } from '@/pages/signup'

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
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
