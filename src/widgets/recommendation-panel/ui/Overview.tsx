import type { Recommendation } from '@/entities/recommendation'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function Overview({ recommendation }: { recommendation: Recommendation }) {
  const { cost, vsCurrent, easyExplanation, rankReason } = recommendation

  return (
    <div className="flex w-full flex-col gap-4 leading-normal">
      <section className="flex flex-col gap-1 rounded-small bg-main-10 px-3.5 py-3">
        <span className="text-xs font-medium text-gray-50">월 예상 비용</span>
        <p className="m-0 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-gray-100">
            {usd.format(cost.monthlyTotalUsd)}
          </span>
          <span className="text-sm font-medium text-main-60">
            현재 대비 {vsCurrent.pct}% ({usd.format(vsCurrent.usd)})
          </span>
        </p>
        {cost.unpriced.length > 0 && (
          <span className="text-xs text-gray-50">
            추정 불가 항목 제외: {cost.unpriced.join(', ')}
          </span>
        )}
      </section>

      <section className="flex flex-col gap-1">
        <h3 className="m-0 text-sm font-medium text-gray-50">쉽게 말하면</h3>
        <p className="m-0 text-sm break-keep text-gray-100">{easyExplanation}</p>
      </section>

      <section className="flex flex-col gap-1">
        <h3 className="m-0 text-sm font-medium text-gray-50">이 순위인 이유</h3>
        <p className="m-0 text-sm break-keep text-gray-100">{rankReason}</p>
      </section>
    </div>
  )
}
