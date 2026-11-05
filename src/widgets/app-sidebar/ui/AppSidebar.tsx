import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { MSP_PROJECTS_PATH, PROJECT_STAGE_LABEL, projectQueries } from '@/entities/project'
import { userQueries } from '@/entities/user'
import { useSessionStore } from '@/shared/api'
import { defaultAvatar, logoutIcon, plusIcon, waycoLogo } from '@/shared/ui'
import styles from './AppSidebar.module.css'

const PROJECT_LIST_REFRESH_MS = 30_000

interface AppSidebarProps {
  /** 지금 보고 있는 프로젝트의 projectId */
  activeId?: number
  /**
   * 내 정보(GET /v1/users/me)를 불러오기 전이나 불러오지 못했을 때 보여줄 이름.
   * 비우면 역할에 맞는 기본 문구('MSP 엔지니어', '고객')를 쓴다
   */
  userName?: string
  onNewConsultation?: () => void
  onSelect?: (projectId: number) => void
  onLogout?: () => void
}

export function AppSidebar({
  activeId,
  userName,
  onNewConsultation,
  onSelect,
  onLogout,
}: AppSidebarProps) {
  // 고객이 새로 접수한 서비스가 바로 보이도록 30초마다, 그리고 창으로 돌아올 때 다시 불러온다
  const {
    data: projects,
    isPending,
    isError,
    refetch,
  } = useQuery({
    ...projectQueries.list(),
    refetchInterval: PROJECT_LIST_REFRESH_MS,
    refetchOnWindowFocus: true,
  })
  // 아직 이 API 가 없는 서버에서는 실패하므로, 이름이 없으면 대체 문구로 화면을 유지한다
  const me = useQuery(userQueries.me())
  const role = useSessionStore((state) => state.session?.role)
  const displayName =
    me.data?.name?.trim() || userName || (role === 'CUSTOMER' ? '고객' : 'MSP 엔지니어')

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logo} aria-label="Wayco 홈으로">
        <img className={styles.logoImage} src={waycoLogo} alt="" />
      </Link>
      <div className={styles.group}>
        <button type="button" className={styles.newButton} onClick={onNewConsultation}>
          <img src={plusIcon} alt="" width={22} height={22} />새 의뢰 시작
        </button>
        <Link to={MSP_PROJECTS_PATH} className={styles.projectsLink}>
          프로젝트 · 고객 접수 확인
        </Link>
        <hr className={styles.divider} />
        <nav aria-label="의뢰 목록">
          {isPending && (
            <p role="status" className={styles.message}>
              의뢰 목록을 불러오는 중…
            </p>
          )}
          {isError && (
            <div role="alert" className={styles.errorBox}>
              <p className={styles.errorMessage}>의뢰 목록을 불러오지 못했어요.</p>
              <button type="button" className={styles.retryButton} onClick={() => void refetch()}>
                다시 시도
              </button>
            </div>
          )}
          {projects?.length === 0 && (
            <p role="status" className={styles.message}>
              아직 등록된 의뢰가 없어요.
            </p>
          )}
          {projects && projects.length > 0 && (
            <ul className={styles.list}>
              {projects.map((project) => (
                <li key={project.projectId}>
                  <button
                    type="button"
                    className={[styles.item, project.projectId === activeId && styles.active]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={project.projectId === activeId ? 'page' : undefined}
                    onClick={() => onSelect?.(project.projectId)}
                  >
                    <span className={styles.itemName}>{project.companyName}</span>
                    <span
                      className={[
                        styles.status,
                        project.stage !== 'RECOMMENDED' && styles.inProgress,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {PROJECT_STAGE_LABEL[project.stage]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
      <div className={styles.user}>
        <img className={styles.avatar} src={defaultAvatar} alt="" width={30} height={30} />
        <span className={styles.userName}>{displayName}</span>
        <button
          type="button"
          className={styles.logoutButton}
          aria-label="로그아웃"
          title="로그아웃"
          onClick={onLogout}
        >
          <img src={logoutIcon} alt="" width={17} height={15} />
        </button>
      </div>
    </aside>
  )
}
