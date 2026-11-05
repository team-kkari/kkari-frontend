import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { PROJECT_STAGE_LABEL, projectQueries } from '@/entities/project'
import { defaultAvatar, logoutIcon, plusIcon, waycoLogo } from '@/shared/ui'
import styles from './AppSidebar.module.css'

interface AppSidebarProps {
  /** 지금 보고 있는 프로젝트의 projectId */
  activeId?: number
  userName: string
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
  const { data: projects, isPending, isError, refetch } = useQuery(projectQueries.list())

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logo} aria-label="Wayco 홈으로">
        <img className={styles.logoImage} src={waycoLogo} alt="" />
      </Link>
      <div className={styles.group}>
        <button type="button" className={styles.newButton} onClick={onNewConsultation}>
          <img src={plusIcon} alt="" width={22} height={22} />새 의뢰 시작
        </button>
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
        <span className={styles.userName}>{userName}</span>
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
