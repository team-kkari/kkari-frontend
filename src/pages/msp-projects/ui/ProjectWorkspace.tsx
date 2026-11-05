import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { projectQueries } from '@/entities/project'
import { requirementQueries } from '@/entities/requirement'
import { ApiError } from '@/shared/api'
import { errorMessage } from '../lib/error-message'
import { getStepDone } from '../model/progress'
import { MSP_PROJECTS_PATH, type StepKey } from '../model/steps'
import { AnalysisStep } from './steps/AnalysisStep'
import { AnswersStep } from './steps/AnswersStep'
import { AwsStep } from './steps/AwsStep'
import { RecommendationStep } from './steps/RecommendationStep'
import { RequirementsStep } from './steps/RequirementsStep'
import styles from './MspProjectsPage.module.css'
import { ProgressPanel } from './ProgressPanel'
import { StateMessage } from './StateMessage'

interface ProjectWorkspaceProps {
  projectId: number
  step: StepKey
}

/** 프로젝트 한 건의 단계 화면. 프로젝트 상세를 불러온 뒤 단계별 화면을 보여준다 */
export function ProjectWorkspace({ projectId, step }: ProjectWorkspaceProps) {
  const project = useQuery(projectQueries.detail(projectId))
  // 요구사항을 저장했는지는 진행 순서 표시에 필요해서 여기서도 본다
  const requirements = useQuery(requirementQueries.detail(projectId))
  const done = getStepDone(project.data, !!requirements.data, step)
  const notFound = project.error instanceof ApiError && project.error.status === 404

  return (
    <>
      <main className={styles.detailMain}>
        {project.isPending && <StateMessage>프로젝트를 불러오는 중…</StateMessage>}
        {project.isError && (
          <StateMessage
            error
            onRetry={notFound ? undefined : () => void project.refetch()}
            action={
              <Link to={MSP_PROJECTS_PATH} className={styles.textLink}>
                프로젝트 목록으로
              </Link>
            }
          >
            {notFound
              ? '프로젝트를 찾을 수 없거나 볼 수 있는 권한이 없어요.'
              : errorMessage(project.error)}
          </StateMessage>
        )}
        {project.data && (
          <>
            {step === 'answers' && <AnswersStep project={project.data} />}
            {step === 'requirements' && <RequirementsStep project={project.data} />}
            {step === 'aws' && <AwsStep project={project.data} />}
            {step === 'analysis' && <AnalysisStep project={project.data} />}
            {step === 'recommendation' && <RecommendationStep project={project.data} />}
          </>
        )}
      </main>
      <ProgressPanel projectId={projectId} active={step} done={done} />
    </>
  )
}
