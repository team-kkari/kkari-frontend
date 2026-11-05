import type { Recommendation } from '@/entities/recommendation'
import { ProConItem } from './ProConItem'

export function ProsCons({ recommendation }: { recommendation: Recommendation }) {
  const sections = [
    { kind: 'pro' as const, label: '장점', items: recommendation.pros },
    { kind: 'con' as const, label: '단점·주의점', items: recommendation.cons },
  ]

  return (
    <div className="flex w-full flex-col gap-4">
      {sections.map(({ kind, label, items }) => (
        <section key={kind} className="flex flex-col gap-2">
          <p className="m-0 flex items-center gap-1.5 leading-normal">
            <span className="text-sm font-medium text-gray-50">{label}</span>
            <span className="text-[13px] text-gray-40">{items.length}</span>
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {items.map((text) => (
              <ProConItem key={text} text={text} kind={kind} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
