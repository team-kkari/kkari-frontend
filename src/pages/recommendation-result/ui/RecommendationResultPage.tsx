import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { GlossaryText } from '@/entities/glossary'
import { recommendationQueries, type RecommendationResult } from '@/entities/recommendation'
import { requestQueries } from '@/entities/request'
import { CompareModal } from '@/features/compare-recommendations'
import { icons } from '@/shared/ui'
import { AppSidebar, type SidebarConsultation } from '@/widgets/app-sidebar'
import { ArchitectureCanvas } from '@/widgets/architecture-canvas'
import { RecommendationPanel } from '@/widgets/recommendation-panel'

export function RecommendationResultPage() {
  const { requestId = '' } = useParams()
  const navigate = useNavigate()
  const { data, isPending, isError } = useQuery(recommendationQueries.result(requestId))
  const { data: requests = [] } = useQuery(requestQueries.list())

  const consultations: SidebarConsultation[] = requests.map((req) => ({
    id: req.id,
    name: req.title,
    status: req.status === 'in_progress' ? 'in-progress' : 'done',
  }))

  return (
    <div className="flex h-screen min-w-[1280px] gap-[30px] bg-canvas p-5">
      <AppSidebar
        consultations={consultations}
        activeId={requestId}
        userName="testUser"
        onNewConsultation={() => navigate('/')}
        onSelect={(id) => navigate(`/requests/${id}`)}
        onLogout={() => navigate('/login', { replace: true })}
      />
      {isPending && <p className="m-auto text-sm text-gray-50">추천 결과를 불러오는 중…</p>}
      {isError && <p className="m-auto text-sm text-red-20">추천 결과를 불러오지 못했어요.</p>}
      {/* 의뢰가 바뀌면 보고 있던 후보·모달 상태를 초기화 */}
      {data && <ResultView key={requestId} result={data} />}
    </div>
  )
}

function ResultView({ result }: { result: RecommendationResult }) {
  const { recommendations } = result
  const [index, setIndex] = useState(0)
  const [compareOpen, setCompareOpen] = useState(false)
  const current = recommendations[index]
  const total = recommendations.length

  return (
    <>
      <main className="flex h-full min-w-0 flex-1 flex-col gap-[30px] px-14 py-5">
        <header className="flex shrink-0 flex-col gap-1 leading-normal">
          <h1 className="m-0 text-2xl font-semibold text-black">{result.title}</h1>
          <p className="m-0 text-sm text-gray-50">
            추천 아키텍처 {total}개 · 우선순위 {result.priority}
          </p>
        </header>

        <div className="flex w-full shrink-0 gap-2.5 rounded-medium bg-main-10 px-4 py-3">
          <img src={icons.sparkle} alt="" width={16} height={16} className="shrink-0" />
          <p className="m-0 flex-1 text-sm leading-normal text-gray-100">
            <GlossaryText text={result.summary} />
          </p>
        </div>

        <ArchitectureCanvas
          key={current.id}
          layout={current.layout}
          costItems={current.cost.items}
          candidateCount={total}
          onCompare={() => setCompareOpen(true)}
        />
      </main>

      <RecommendationPanel
        key={current.id}
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
