import { defaultAvatar, logoutIcon, plusIcon, waycoLogo } from '@/shared/ui'
import styles from './AppSidebar.module.css'

export interface SidebarConsultation {
  id: string
  name: string
  status: 'in-progress' | 'done'
}

interface AppSidebarProps {
  consultations: SidebarConsultation[]
  activeId?: string
  userName: string
  onNewConsultation?: () => void
  onSelect?: (id: string) => void
  onLogout?: () => void
}

const STATUS_LABEL: Record<SidebarConsultation['status'], string> = {
  'in-progress': '진행 중',
  done: '완료',
}

export function AppSidebar({
  consultations,
  activeId,
  userName,
  onNewConsultation,
  onSelect,
  onLogout,
}: AppSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <img className={styles.logo} src={waycoLogo} alt="Wayco" />
      <div className={styles.group}>
        <button type="button" className={styles.newButton} onClick={onNewConsultation}>
          <img src={plusIcon} alt="" width={22} height={22} />새 의뢰 시작
        </button>
        <hr className={styles.divider} />
        <nav aria-label="의뢰 목록">
          <ul className={styles.list}>
            {consultations.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={[styles.item, item.id === activeId && styles.active]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={item.id === activeId ? 'page' : undefined}
                  onClick={() => onSelect?.(item.id)}
                >
                  <span className={styles.itemName}>{item.name}</span>
                  <span
                    className={[styles.status, item.status === 'in-progress' && styles.inProgress]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
