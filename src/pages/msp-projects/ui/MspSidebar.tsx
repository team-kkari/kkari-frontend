import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { projectQueries } from '@/entities/project'
import { userQueries } from '@/entities/user'
import { useLogout } from '@/features/logout'
import { defaultAvatar, logoutIcon, plusIcon } from '@/shared/ui'
import { cx } from '../lib/cx'
import { STAGE_LABEL } from '../model/stage'
import { MSP_PROJECTS_PATH, stepPath } from '../model/steps'
import styles from './MspProjectsPage.module.css'

const RECENT_COUNT = 3
const FALLBACK_NAME = 'MSP 엔지니어'

interface MspSidebarProps {
  /** 지금 열어 둔 프로젝트 */
  activeProjectId?: number
}

export function MspSidebar({ activeProjectId }: MspSidebarProps) {
  const navigate = useNavigate()
  const logout = useLogout()
  // 이름을 못 가져와도(옛 서버 등) 화면은 그대로 쓸 수 있어야 해서 대체 문구를 쓴다
  const me = useQuery(userQueries.me())
  const projects = useQuery(projectQueries.list())
  const recent = projects.data?.slice(0, RECENT_COUNT)

  return (
    <aside className={styles.sidebar}>
      <Link to={MSP_PROJECTS_PATH} className={styles.logo}>
        Wayco
      </Link>
      <button type="button" className={styles.newRequest} onClick={() => navigate('/')}>
        <img src={plusIcon} alt="" />새 의뢰 시작
      </button>
      <div className={styles.divider} />
      <Link className={styles.projectNav} to={MSP_PROJECTS_PATH}>
        <span>▣</span>프로젝트
      </Link>
      <span className={styles.recentLabel}>최근 프로젝트</span>
      {projects.isPending && <p className={styles.sidebarMessage}>불러오는 중…</p>}
      {projects.isError && (
        <div className={styles.sidebarMessage} role="alert">
          <p>목록을 불러오지 못했어요.</p>
          <button
            type="button"
            className={styles.sidebarRetry}
            onClick={() => void projects.refetch()}
          >
            다시 시도
          </button>
        </div>
      )}
      {recent?.length === 0 && <p className={styles.sidebarMessage}>아직 프로젝트가 없어요.</p>}
      {recent?.map((project) => (
        <Link
          key={project.projectId}
          className={cx(
            styles.recentProject,
            project.projectId === activeProjectId && styles.recentActive,
          )}
          to={stepPath(project.projectId, 'answers')}
        >
          <span className={styles.recentName}>{project.companyName}</span>
          <small>{STAGE_LABEL[project.stage]}</small>
        </Link>
      ))}
      <div className={styles.user}>
        <img src={defaultAvatar} alt="" />
        <b className={styles.userName}>{me.data?.name?.trim() || FALLBACK_NAME}</b>
        <button
          type="button"
          className={styles.logoutButton}
          aria-label="로그아웃"
          title="로그아웃"
          onClick={logout}
        >
          <img src={logoutIcon} alt="" width={17} height={15} />
        </button>
      </div>
    </aside>
  )
}
