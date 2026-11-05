import { Link } from 'react-router'
import { chatIcon, defaultAvatar, plusIcon, waycoLogo } from '@/shared/ui'
import styles from './CustomerSidebar.module.css'

export type CustomerServiceStatus = 'submitted' | 'analyzed' | 'recommended'

export interface CustomerService {
  id: string
  name: string
  status: CustomerServiceStatus
}

interface CustomerSidebarProps {
  services: CustomerService[]
  /** 보고 있는 서비스 */
  activeServiceId?: string
  userName: string
  onNewService?: () => void
  /** 로고 · 고객 창구: 대화 화면으로 */
  onOpenDesk?: () => void
  onSelectService?: (id: string) => void
}

const SERVICE_STATUS_LABEL: Record<CustomerServiceStatus, string> = {
  submitted: '접수됨',
  analyzed: '분석 완료',
  recommended: '추천 완료',
}

/** 고객(서비스 담당자)용 사이드바: 새 서비스 등록 · 고객 창구 · 내 서비스 목록 */
export function CustomerSidebar({
  services,
  activeServiceId,
  userName,
  onNewService,
  onOpenDesk,
  onSelectService,
}: CustomerSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <Link to="/desk" className={styles.logo} aria-label="Wayco 홈으로" onClick={onOpenDesk}>
        <img src={waycoLogo} alt="Wayco" width={106.558} height={30} />
      </Link>

      <div className={styles.group}>
        <button type="button" className={styles.newButton} onClick={onNewService}>
          <img src={plusIcon} alt="" width={22} height={22} />새 서비스 등록
        </button>
        <hr className={styles.divider} />
        <nav aria-label="고객 메뉴">
          <Link
            to="/desk"
            className={styles.navItem}
            aria-current={activeServiceId ? undefined : 'page'}
            onClick={onOpenDesk}
          >
            <img src={chatIcon} alt="" width={22} height={22} />
            고객 창구
          </Link>
        </nav>
        <p className={styles.sectionLabel}>내 서비스</p>
        <ul className={styles.list} aria-label="내 서비스">
          {services.map((service) => (
            <li key={service.id}>
              <button
                type="button"
                className={styles.service}
                aria-current={service.id === activeServiceId ? 'page' : undefined}
                onClick={() => onSelectService?.(service.id)}
              >
                <span className={styles.serviceName}>{service.name}</span>
                <span
                  className={[styles.status, service.status === 'submitted' && styles.submitted]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {SERVICE_STATUS_LABEL[service.status]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.user}>
        <img className={styles.avatar} src={defaultAvatar} alt="" width={30} height={30} />
        <span className={styles.userName}>{userName}</span>
      </div>
    </aside>
  )
}
