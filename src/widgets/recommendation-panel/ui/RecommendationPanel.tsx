import { useState } from 'react'
import { GlossaryText } from '@/entities/glossary'
import { ScoreRadar, type Recommendation } from '@/entities/recommendation'
import { icons } from '@/shared/ui'
import { MigrationSteps } from './MigrationSteps'
import { Overview } from './Overview'
import { ProsCons } from './ProsCons'

type Tab = 'overview' | 'proscons' | 'migration'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: '개요' },
  { id: 'proscons', label: '장단점' },
  { id: 'migration', label: '전환 단계' },
]

interface RecommendationPanelProps {
  recommendation: Recommendation
  total: number
  onPrev: () => void
  onNext: () => void
}

export function RecommendationPanel({
  recommendation,
  total,
  onPrev,
  onNext,
}: RecommendationPanelProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const { rank, title, name, bestFor, scores } = recommendation

  return (
    <aside className="flex h-full w-[450px] shrink-0 flex-col gap-5 overflow-y-auto rounded-xlarge bg-white p-[30px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 items-center rounded-full bg-main-60 px-4 py-1.5 text-sm font-medium text-white">
            {rank === 1 ? '1위 · 추천' : `${rank}위`}
          </span>
          <span className="text-lg font-medium text-main-60">
            {rank} / {total}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="이전 후보"
            onClick={onPrev}
            className="border-0 bg-transparent p-0"
          >
            <img src={icons.btnPrev} alt="" width={36} height={36} />
          </button>
          <button
            type="button"
            aria-label="다음 후보"
            onClick={onNext}
            className="border-0 bg-transparent p-0"
          >
            <img src={icons.btnNext} alt="" width={36} height={36} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 leading-normal">
        <h2 className="m-0 text-2xl font-semibold text-black">{title}</h2>
        <p className="m-0 text-sm break-keep text-gray-50">
          <GlossaryText text={name} />
        </p>
      </div>

      <div className="flex flex-col gap-1 rounded-small bg-gray-0 px-3.5 py-3 leading-normal">
        <span className="text-xs font-medium text-gray-50">이럴 때 적합</span>
        <p className="m-0 text-sm text-gray-100">
          <GlossaryText text={bestFor} />
        </p>
      </div>

      <ScoreRadar scores={scores} />

      <div role="tablist" className="flex h-10 w-full shrink-0 rounded-tab bg-gray-20 p-[3px]">
        {TABS.map(({ id, label }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`flex h-full flex-1 items-center justify-center rounded-tab text-base font-medium ${
                active
                  ? 'border-[1.5px] border-main-60 bg-gray-0 text-main-60'
                  : 'border-0 bg-gray-20 text-white'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        {tab === 'overview' && <Overview recommendation={recommendation} />}
        {tab === 'proscons' && <ProsCons recommendation={recommendation} />}
        {tab === 'migration' && <MigrationSteps steps={recommendation.migrationSteps} />}
      </div>
    </aside>
  )
}
