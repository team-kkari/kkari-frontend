import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { projectPath, projectQueries } from '@/entities/project'
import { recommendationQueries } from '@/entities/recommendation'
import { useLogout } from '@/features/logout'
import { AppSidebar } from '@/widgets/app-sidebar'
import { Notice } from './Notice'
import { ResultContent } from './ResultContent'

export function RecommendationResultPage() {
  const { projectId: param = '' } = useParams()
  const projectId = /^\d+$/.test(param) ? Number(param) : null
  const navigate = useNavigate()
  const logout = useLogout()

  return (
    <div className="flex h-screen min-w-[1280px] gap-[30px] bg-canvas p-5">
      <AppSidebar
        activeId={projectId ?? undefined}
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

  return (
    <ResultContent
      result={result}
      notFound={{
        title: '아직 추천 아키텍처가 없어요',
        description: '상담에서 인프라 분석을 마치고 아키텍처 설계를 요청하면 여기에 결과가 나와요.',
      }}
      empty={{
        title: '추천 아키텍처가 비어 있어요',
        description: '생성은 끝났지만 보여줄 후보가 없어요. 설계를 다시 요청해 주세요.',
      }}
      title={project.data?.companyName ?? '추천 아키텍처'}
      priority={priority.data ?? ''}
    />
  )
}
