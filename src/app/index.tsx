import { QueryProvider } from './query'
import { AppRouter } from './router'
import './styles/index.css'

export function App() {
  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  )
}
