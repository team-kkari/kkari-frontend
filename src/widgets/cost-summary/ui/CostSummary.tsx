import { useState } from 'react'
import { GlossaryText } from '@/entities/glossary'
import type { Recommendation } from '@/entities/recommendation'
import { icons } from '@/shared/ui'

interface CostSummaryProps {
  recommendation: Recommendation
  currentMonthlyUsd: number
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** 가운데 상단 비용 블럭: 금액·절감률을 크게 보여주고, 근거는 접어 둘 수 있다 */
export function CostSummary({ recommendation, currentMonthlyUsd }: CostSummaryProps) {
  const [open, setOpen] = useState(false)
  const { cost, vsCurrent } = recommendation
  const diff = Math.abs(vsCurrent.usd)
  const isSaving = vsCurrent.usd <= 0
  const maxUsd = Math.max(currentMonthlyUsd, cost.monthlyTotalUsd)
  const ratio = (value: number) => `${Math.max(2, (value / maxUsd) * 100)}%`

  return (
    <section className="flex w-full shrink-0 flex-col gap-3 rounded-medium border border-main-60/20 bg-[rgba(33,95,188,0.08)] px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-gray-50">월 예상 비용</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="m-0 flex items-baseline gap-1">
              <span className="text-[32px] leading-none font-bold tracking-tight text-main-60">
                {usd.format(cost.monthlyTotalUsd)}
              </span>
              <span className="text-sm font-medium text-gray-50">/ 월</span>
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] leading-none font-semibold text-white ${
                isSaving ? 'bg-main-60' : 'bg-red-20'
              }`}
            >
              {isSaving ? '▼' : '▲'} {Math.abs(vsCurrent.pct)}% {isSaving ? '절감' : '증가'}
            </span>
            <span className="text-sm text-gray-40">
              현재 <span className="line-through">{usd.format(currentMonthlyUsd)}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1 rounded-small border-0 bg-transparent px-1.5 py-1 text-xs font-medium text-gray-50 hover:bg-white/60"
        >
          {open ? '근거 접기' : '계산 근거'}
          <img src={open ? icons.chevronUp : icons.chevronDown} alt="" width={16} height={16} />
        </button>
      </div>

      {/* 현재 vs 추천안 비교 막대 */}
      <div className="grid grid-cols-[44px_1fr_72px] items-center gap-x-2.5 gap-y-1.5 text-xs">
        <span className="text-gray-50">현재</span>
        <div className="h-2 rounded-full bg-gray-10">
          <div
            className="h-full rounded-full bg-gray-40"
            style={{ width: ratio(currentMonthlyUsd) }}
          />
        </div>
        <span className="text-right text-gray-50">{usd.format(currentMonthlyUsd)}</span>

        <span className="font-medium text-main-60">추천안</span>
        <div className="h-2 rounded-full bg-gray-10">
          <div
            className="h-full rounded-full bg-main-60 transition-[width] duration-500"
            style={{ width: ratio(cost.monthlyTotalUsd) }}
          />
        </div>
        <span className="text-right font-semibold text-main-60">
          {usd.format(cost.monthlyTotalUsd)}
        </span>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-main-60/15 pt-3 text-[13px] leading-normal text-gray-100">
          <p className="m-0">
            현재 월 <strong className="font-semibold">{usd.format(currentMonthlyUsd)}</strong>에서{' '}
            <strong className="font-semibold">{usd.format(cost.monthlyTotalUsd)}</strong>로 약{' '}
            <strong className="font-semibold">{usd.format(diff)}</strong>이{' '}
            {isSaving ? '줄어요' : '늘어요'}.
          </p>
          {cost.unpriced.length > 0 && (
            <p className="m-0 text-gray-50">
              가격표에 없어 빠진 항목: <GlossaryText text={cost.unpriced.join(', ')} />
            </p>
          )}
          {cost.assumptions.length > 0 && (
            <p className="m-0 text-gray-50">
              <GlossaryText text={cost.assumptions.join(' · ')} />
            </p>
          )}
        </div>
      )}
    </section>
  )
}
