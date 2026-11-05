import { GlossaryText } from '@/entities/glossary'
import type { Recommendation } from '@/entities/recommendation'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** 현재 월 비용을 모르거나 이 안의 비용을 계산하지 못해 비교할 수 없을 때, 월 비용만 보여주는 블럭 */
export function CostOnly({ recommendation }: { recommendation: Recommendation }) {
  const { cost } = recommendation

  return (
    <section className="flex w-full shrink-0 flex-col gap-1 rounded-small bg-[rgba(33,95,188,0.1)] px-3 py-2.5 text-[13px] leading-normal text-gray-100">
      <p className="m-0 text-sm font-medium">월 {usd.format(cost.monthlyTotalUsd)}</p>
      <p className="m-0 text-gray-50">
        현재 월 비용을 알 수 없거나 비용을 계산하지 못해 현재와 비교하지 못했어요.
      </p>
      {cost.unpriced.length > 0 && (
        <p className="m-0 text-gray-50">
          가격표에 없어 빠진 항목: <GlossaryText text={cost.unpriced.join(', ')} />
        </p>
      )}
    </section>
  )
}
