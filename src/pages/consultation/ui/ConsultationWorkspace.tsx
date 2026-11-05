import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import {
  groupAnswers,
  projectAnswersPath,
  projectQueries,
  projectResultPath,
  type ProjectDetail,
} from '@/entities/project'
import {
  latestJobOf,
  recommendationQueries,
  type LatestArchitectureJob,
} from '@/entities/recommendation'
import { useConsultation } from '../model/useConsultation'
import { ChatView } from './ChatView'
import { DesigningView } from './DesigningView'
import { InfoPanel } from './InfoPanel'
import styles from './ConsultationWorkspace.module.css'

interface ConsultationWorkspaceProps {
  projectId: number
  /** 시작 화면에서 입력한 첫 메시지 */
  firstMessage?: string
}

/** 프로젝트 하나의 작업 영역(대화 + 수집한 정보). 프로젝트 정보를 받은 뒤에 상담을 연다 */
export function ConsultationWorkspace({ projectId, firstMessage }: ConsultationWorkspaceProps) {
  const project = useQuery(projectQueries.detail(projectId))
  // 백엔드가 추천 뒤에도 단계를 ANALYZED 로 두므로(RECOMMENDED 로 올리는 곳이 없음), 이미 만든 결과가 있는지 직접 본다.
  // 결과가 없으면 AR002 로 실패하고 그대로 상담을 이어간다
  const analyzed = project.data?.stage === 'ANALYZED'
  const existingResult = useQuery({ ...recommendationQueries.exists(projectId), enabled: analyzed })

  // 처음 불러올 때만 상태 화면을 보여준다. 이후 재조회(분석 직후 단계 변경 등)로 방이 다시 만들어지면
  // 카드·입력 상태가 모두 사라지기 때문에, 한 번 열린 방은 유지한다
  const [opened, setOpened] = useState(false)
  const loading = project.isPending || (analyzed && existingResult.isPending)
  if (!loading && !opened) setOpened(true)

  if (loading && !opened) return <Status message="의뢰를 불러오는 중…" />
  if (project.isError && !project.data) {
    return (
      <Status
        message="의뢰를 불러오지 못했어요. 왼쪽 목록에서 다시 골라 주세요."
        onRetry={() => void project.refetch()}
      />
    )
  }
  if (!project.data) return <Status message="의뢰를 불러오는 중…" />
  // 추천이 끝난 의뢰는 대화 대신 결과를 보여준다
  if (project.data.stage === 'RECOMMENDED' || existingResult.isSuccess) {
    return <Navigate to={projectResultPath(projectId)} replace />
  }
  return (
    <ConsultationRoom
      project={project.data}
      firstMessage={firstMessage}
      // 아직 추천 결과가 없을 때(AR002)도 가장 최근 설계 작업이 함께 온다. 방이 열릴 때 한 번만 본다
      designJob={latestJobOf(existingResult.data, existingResult.error)}
    />
  )
}

function ConsultationRoom({
  project,
  firstMessage,
  designJob,
}: {
  project: ProjectDetail
  firstMessage?: string
  designJob: LatestArchitectureJob | null
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const consultation = useConsultation({ project, firstMessage, designJob })

  const handleDesignDone = () => {
    void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
    navigate(projectResultPath(project.projectId), { replace: true })
  }

  if (consultation.loading) return <Status message="대화를 불러오는 중…" />

  const answerSections = groupAnswers(project.answers)

  return (
    <div className={styles.workspace}>
      <main className={styles.main}>
        {consultation.designing ? (
          <DesigningView
            projectId={project.projectId}
            resumeJobId={consultation.resumeJobId}
            onDone={handleDesignDone}
          />
        ) : (
          <ChatView
            title={project.companyName}
            answersHref={
              answerSections.length > 0 ? projectAnswersPath(project.projectId) : undefined
            }
            serviceName={project.serviceName}
            answerSections={answerSections}
            projectId={project.projectId}
            messages={consultation.messages}
            info={consultation.info}
            isAiTyping={consultation.isAiTyping}
            canType={consultation.canType}
            error={consultation.error}
            onRetry={consultation.retry}
            onSend={consultation.sendMessage}
            onConfirmChoice={consultation.confirmChoice}
            onCompleteConnect={consultation.completeConnect}
            onSkipConnect={consultation.skipConnect}
            onConfirmDesign={consultation.confirmDesign}
          />
        )}
      </main>
      {!consultation.designing && (
        <InfoPanel info={consultation.info} missing={consultation.missingLabels} />
      )}
    </div>
  )
}

function Status({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.workspace}>
      <main className={styles.main}>
        <p role="status" className={styles.status}>
          {message}
          {onRetry && (
            <button type="button" className={styles.retryButton} onClick={onRetry}>
              다시 시도
            </button>
          )}
        </p>
      </main>
    </div>
  )
}
