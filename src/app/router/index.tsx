import { createBrowserRouter, RouterProvider } from 'react-router'
import { ConsultationPage } from '@/pages/consultation'
import { LoginPage } from '@/pages/login'
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
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
