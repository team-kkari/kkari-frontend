import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { HomePage } from '@/pages/home'
import { RecommendationResultPage } from '@/pages/recommendation-result'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
