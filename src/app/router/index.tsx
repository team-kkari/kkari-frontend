import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { ConsultationPage } from '@/pages/consultation'
import { CustomerDeskPage } from '@/pages/customer-desk'
import { LoginPage } from '@/pages/login'
import { MspProjectsPage } from '@/pages/msp-projects'
import {
  CustomerRecommendationResultPage,
  RecommendationResultPage,
} from '@/pages/recommendation-result'
import { SignUpPage } from '@/pages/signup'
import { RequireAuth } from './RequireAuth'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  {
    // 엔지니어(MSP)만 들어갈 수 있는 화면
    element: <RequireAuth role="MSP_ENGINEER" />,
    children: [
      // 새 의뢰 상담과 프로젝트별 상담·추천 결과
      { path: '/', element: <ConsultationPage key="new" /> },
      { path: '/projects/:projectId', element: <ConsultationPage key="project" /> },
      { path: '/projects/:projectId/result', element: <RecommendationResultPage /> },
      // 프로젝트 단계별 워크플로
      { path: '/msp/projects', element: <MspProjectsPage /> },
      { path: '/msp/projects/:projectId/:step?', element: <MspProjectsPage /> },
    ],
  },
  {
    // 고객(서비스 담당자)만 들어갈 수 있는 고객 창구
    element: <RequireAuth role="CUSTOMER" />,
    children: [
      { path: '/desk', element: <CustomerDeskPage /> },
      { path: '/desk/services/:serviceId/result', element: <CustomerRecommendationResultPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
