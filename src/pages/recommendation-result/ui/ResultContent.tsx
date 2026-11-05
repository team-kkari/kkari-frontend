import type { UseQueryResult } from '@tanstack/react-query'
import { useState } from 'react'
import { GlossaryText } from '@/entities/glossary'
import { isArchitectureNotFound, type RecommendationResult } from '@/entities/recommendation'
import { CompareModal } from '@/features/compare-recommendations'
import { ApiError } from '@/shared/api'
import { icons } from '@/shared/ui'
import { ArchitectureCanvas } from '@/widgets/architecture-canvas'
import { CostSummary } from '@/widgets/cost-summary'
import { RecommendationPanel } from '@/widgets/recommendation-panel'
import { CostOnly } from './CostOnly'
import { Notice } from './Notice'

interface ResultContentProps {
  result: UseQueryResult<RecommendationResult>
  /** 아직 추천 아키텍처가 없을(AR002) 때 안내 */
  notFound: { title: string; description: string }
  title: string
  /** "비용 > 성능" 처럼 이은 우선순위. 모르면 빈 문자열 */
  priority: string
}

/** 추천 결과 조회의 로딩·없음·오류 안내, 결과가 있으면 결과 화면 */
export function ResultContent({ result, notFound, title, priority }: ResultContentProps) {
  if (result.isPending) {
    return <Notice title="추천 결과를 불러오는 중…" />
  }

  if (result.isError) {
    if (isArchitectureNotFound(result.error)) {
      return <Notice title={notFound.title} description={notFound.description} />
    }
    return (
      <Notice
        tone="error"
        title="추천 결과를 불러오지 못했어요"
        description={
          result.error instanceof ApiError ? result.error.message : '서버에 연결하지 못했어요.'
        }
        action={
          <button
            type="button"
            onClick={() => void result.refetch()}
            className="mt-2 rounded-small border-0 bg-main-60 px-5 py-2 text-sm font-medium text-white"
          >
            다시 시도
          </button>
        }
      />
    )
  }

  if (result.data.recommendations.length === 0) {
    return (
      <Notice
        title="추천 아키텍처가 비어 있어요"
        description="생성은 끝났지만 보여줄 후보가 없어요. 설계를 다시 요청해 주세요."
      />
    )
  }

  return (
    <ResultView key={result.data.jobId} result={result.data} title={title} priority={priority} />
  )
}

interface ResultViewProps {
  result: RecommendationResult
  title: string
  /** "비용 > 성능" 처럼 이은 우선순위. 모르면 빈 문자열 */
  priority: string
}

function ResultView({ result, title, priority }: ResultViewProps) {
  const { recommendations } = result
  const [index, setIndex] = useState(0)
  const [compareOpen, setCompareOpen] = useState(false)
  const current = recommendations[index]
  const total = recommendations.length

  return (
    <>
      <main className="flex h-full min-w-0 flex-1 flex-col gap-[30px] px-14 py-5">
        <header className="flex shrink-0 flex-col gap-1 leading-normal">
          <h1 className="m-0 text-2xl font-semibold text-black">{title}</h1>
          <p className="m-0 text-sm text-gray-50">
            추천 아키텍처 {total}개{priority && ` · 우선순위 ${priority}`}
          </p>
        </header>

        {current.comparable && result.currentMonthlyUsd !== null ? (
          <CostSummary
            key={`cost-${current.id}`}
            recommendation={current}
            currentMonthlyUsd={result.currentMonthlyUsd}
          />
        ) : (
          <CostOnly key={`cost-${current.id}`} recommendation={current} />
        )}

        {result.summary && (
          <div className="flex w-full shrink-0 gap-2.5 rounded-medium bg-main-10 px-4 py-3">
            <img src={icons.sparkle} alt="" width={16} height={16} className="shrink-0" />
            <p className="m-0 flex-1 text-sm leading-normal text-gray-100">
              <GlossaryText text={result.summary} />
            </p>
          </div>
        )}

        <ArchitectureCanvas
          key={`canvas-${current.id}`}
          layout={current.layout}
          costItems={current.cost.items}
          candidateCount={total}
          onCompare={() => setCompareOpen(true)}
        />
      </main>

      <RecommendationPanel
        key={`panel-${current.id}`}
        recommendation={current}
        total={total}
        onPrev={() => setIndex((i) => (i - 1 + total) % total)}
        onNext={() => setIndex((i) => (i + 1) % total)}
      />

      <CompareModal
        open={compareOpen}
        recommendations={recommendations}
        selectedId={current.id}
        onSelect={(id) => {
          setIndex(recommendations.findIndex((r) => r.id === id))
          setCompareOpen(false)
        }}
        onClose={() => setCompareOpen(false)}
      />
    </>
  )
}
