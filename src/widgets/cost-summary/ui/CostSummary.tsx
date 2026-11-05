import { useState } from 'react'
import { GlossaryText } from '@/entities/glossary'
import type { Recommendation } from '@/entities/recommendation'
import { icons } from '@/shared/ui'

interface CostSummaryProps {
  recommendation: Recommendation
  currentMonthlyUsd: number
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** 피그마 79:924 — 가운데 상단의 접고 펼치는 비용 블럭 */
export function CostSummary({ recommendation, currentMonthlyUsd }: CostSummaryProps) {
  const [open, setOpen] = useState(true)
  const { cost, vsCurrent } = recommendation
  const saving = Math.abs(vsCurrent.usd)
  const isSaving = vsCurrent.usd <= 0

  return (
    <section
      className={`flex w-full shrink-0 flex-col gap-2 rounded-small px-3 py-2.5 ${
        open ? 'bg-[rgba(33,95,188,0.1)]' : 'border border-gray-10 bg-white'
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 border-0 bg-transparent p-0 text-left"
      >
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-main-60 text-[13px] font-bold text-white"
        >
          +
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-gray-100">
          월 {usd.format(cost.monthlyTotalUsd)} · 현재 대비 {Math.abs(vsCurrent.pct)}%{' '}
          {isSaving ? '절감' : '증가'}
        </span>
        <img src={open ? icons.chevronUp : icons.chevronDown} alt="" width={16} height={16} />
      </button>

      {open && (
        <div className="flex flex-col gap-1 pl-[30px] text-[13px] leading-normal text-gray-100">
          <p className="m-0">
            현재 월 <strong className="font-semibold">{usd.format(currentMonthlyUsd)}</strong>에서{' '}
            <strong className="font-semibold">{usd.format(cost.monthlyTotalUsd)}</strong>로 약{' '}
            <strong className="font-semibold">{usd.format(saving)}</strong>이{' '}
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
