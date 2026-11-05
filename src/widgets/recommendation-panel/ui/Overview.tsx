import { GlossaryText } from '@/entities/glossary'
import type { Recommendation } from '@/entities/recommendation'

export function Overview({ recommendation }: { recommendation: Recommendation }) {
  const { easyExplanation, rankReason } = recommendation

  return (
    <div className="flex w-full flex-col gap-4 leading-normal">
      <section className="flex flex-col gap-1">
        <h3 className="m-0 text-sm font-medium text-gray-50">쉽게 말하면</h3>
        <p className="m-0 text-sm break-keep text-gray-100">
          <GlossaryText text={easyExplanation} />
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h3 className="m-0 text-sm font-medium text-gray-50">이 순위인 이유</h3>
        <p className="m-0 text-sm break-keep text-gray-100">
          <GlossaryText text={rankReason} />
        </p>
      </section>
    </div>
  )
}
