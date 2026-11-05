import { Link, Navigate, useParams } from 'react-router'
import { isStepKey, MSP_PROJECTS_PATH, parseProjectId, stepPath } from '../model/steps'
import styles from './MspProjectsPage.module.css'
import { MspSidebar } from './MspSidebar'
import { ProjectList } from './ProjectList'
import { ProjectWorkspace } from './ProjectWorkspace'
import { StateMessage } from './StateMessage'

/** MSP 엔지니어의 프로젝트 목록(/msp/projects)과 단계별 워크플로(/msp/projects/:projectId/:step) */
export function MspProjectsPage() {
  const { projectId: projectIdParam, step = 'answers' } = useParams()
  const projectId = parseProjectId(projectIdParam)

  const renderContent = () => {
    if (projectIdParam === undefined) return <ProjectList />
    if (projectId === undefined) {
      return (
        <main className={styles.detailMain}>
          <StateMessage
            error
            action={
              <Link to={MSP_PROJECTS_PATH} className={styles.textLink}>
                프로젝트 목록으로
              </Link>
            }
          >
            올바르지 않은 프로젝트 주소예요.
          </StateMessage>
        </main>
      )
    }
    // 모르는 단계 이름이면 첫 단계로 보낸다
    if (!isStepKey(step)) return <Navigate to={stepPath(projectId, 'answers')} replace />
    return <ProjectWorkspace key={projectId} projectId={projectId} step={step} />
  }

  return (
    <div className={styles.page}>
      <MspSidebar activeProjectId={projectId} />
      {renderContent()}
    </div>
  )
}
