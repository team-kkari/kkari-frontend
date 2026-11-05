import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { ConsultationPage } from '@/pages/consultation'
import { LoginPage } from '@/pages/login'
import { RecommendationResultPage } from '@/pages/recommendation-result'
import { SignUpPage } from '@/pages/signup'
import { RequireAuth } from './RequireAuth'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  {
    // 로그인한 사용자만 들어갈 수 있는 화면
    element: <RequireAuth />,
    children: [
      { path: '/', element: <ConsultationPage /> },
      { path: '/projects/:projectId', element: <ConsultationPage /> },
      { path: '/projects/:projectId/result', element: <RecommendationResultPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
