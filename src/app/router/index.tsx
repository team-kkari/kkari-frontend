import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { ConsultationPage } from '@/pages/consultation'
import { CustomerDeskPage } from '@/pages/customer-desk'
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
    // 고객(서비스 담당자)용 고객 창구
    path: '/desk',
    element: <CustomerDeskPage />,
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
