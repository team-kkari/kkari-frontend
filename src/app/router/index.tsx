import { createBrowserRouter, RouterProvider } from 'react-router'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { SignUpPage } from '@/pages/signup'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
