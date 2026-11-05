import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { GlossaryText } from '@/entities/glossary'
import { projectPath, projectQueries } from '@/entities/project'
import {
  isArchitectureNotFound,
  recommendationQueries,
  type RecommendationResult,
} from '@/entities/recommendation'
import { CompareModal } from '@/features/compare-recommendations'
import { useLogout } from '@/features/logout'
import { ApiError, useSessionStore } from '@/shared/api'
import { icons } from '@/shared/ui'
import { AppSidebar } from '@/widgets/app-sidebar'
import { ArchitectureCanvas } from '@/widgets/architecture-canvas'
import { CostSummary } from '@/widgets/cost-summary'
import { RecommendationPanel } from '@/widgets/recommendation-panel'
import { CostOnly } from './CostOnly'
import { Notice } from './Notice'

export function RecommendationResultPage() {
  const { projectId: param = '' } = useParams()
  const projectId = /^\d+$/.test(param) ? Number(param) : null
  const navigate = useNavigate()
  const logout = useLogout()
  const role = useSessionStore((state) => state.session?.role)

  return (
    <div className="flex h-screen min-w-[1280px] gap-[30px] bg-canvas p-5">
      <AppSidebar
        activeId={projectId ?? undefined}
        userName={role === 'CUSTOMER' ? '고객' : 'MSP 엔지니어'}
        onNewConsultation={() => navigate('/')}
        onSelect={(id) => navigate(projectPath(id))}
        onLogout={logout}
      />
      {projectId === null ? (
        <Notice
          tone="error"
          title="잘못된 주소예요"
          description="의뢰 번호를 확인할 수 없어요. 왼쪽 목록에서 의뢰를 다시 골라 주세요."
        />
      ) : (
        // 의뢰가 바뀌면 조회 상태와 보고 있던 후보를 처음부터 시작
        <ProjectResult key={projectId} projectId={projectId} />
      )}
    </div>
  )
}

function ProjectResult({ projectId }: { projectId: number }) {
  const result = useQuery(recommendationQueries.result(projectId))
  const project = useQuery(projectQueries.detail(projectId))
  const priority = useQuery(recommendationQueries.priority(projectId))

  if (result.isPending) {
    return <Notice title="추천 결과를 불러오는 중…" />
  }

  if (result.isError) {
    if (isArchitectureNotFound(result.error)) {
      return (
        <Notice
          title="아직 추천 아키텍처가 없어요"
          description="상담에서 인프라 분석을 마치고 아키텍처 설계를 요청하면 여기에 결과가 나와요."
        />
      )
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
    <ResultView
      key={result.data.jobId}
      result={result.data}
      title={project.data?.companyName ?? '추천 아키텍처'}
      priority={priority.data ?? ''}
    />
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
