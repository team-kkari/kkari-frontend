import { useCounterStore } from '@/entities/counter'
import { Button } from '@/shared/ui'

export function HomePage() {
  const count = useCounterStore((state) => state.count)
  const increase = useCounterStore((state) => state.increase)
  const reset = useCounterStore((state) => state.reset)

  return (
    <main style={{ padding: 24 }}>
      <h1>kkari-frontend</h1>
      <p>count: {count}</p>
      <Button onClick={increase}>+1</Button> <Button onClick={reset}>reset</Button>
    </main>
  )
}
