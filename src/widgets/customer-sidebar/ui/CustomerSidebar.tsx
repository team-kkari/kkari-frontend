import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { CUSTOMER_SERVICE_STAGE_LABEL, customerServiceQueries } from '@/entities/customer-service'
import { chatIcon, defaultAvatar, logoutIcon, plusIcon, waycoLogo } from '@/shared/ui'
import styles from './CustomerSidebar.module.css'

interface CustomerSidebarProps {
  /** 보고 있는 서비스의 serviceId */
  activeServiceId?: number
  userName: string
  onNewService?: () => void
  /** 로고 · 고객 창구: 대화 화면으로 */
  onOpenDesk?: () => void
  onSelectService?: (serviceId: number) => void
  onLogout?: () => void
}

/** 고객(서비스 담당자)용 사이드바: 새 서비스 등록 · 고객 창구 · 내 서비스 목록 */
export function CustomerSidebar({
  activeServiceId,
  userName,
  onNewService,
  onOpenDesk,
  onSelectService,
  onLogout,
}: CustomerSidebarProps) {
  const { data: services, isPending, isError, refetch } = useQuery(customerServiceQueries.list())

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
            aria-current={activeServiceId === undefined ? 'page' : undefined}
            onClick={onOpenDesk}
          >
            <img src={chatIcon} alt="" width={22} height={22} />
            고객 창구
          </Link>
        </nav>
        <p className={styles.sectionLabel}>내 서비스</p>
        {isPending && (
          <p role="status" className={styles.message}>
            서비스 목록을 불러오는 중…
          </p>
        )}
        {isError && !services && (
          <div role="alert" className={styles.errorBox}>
            <p className={styles.errorMessage}>서비스 목록을 불러오지 못했어요.</p>
            <button type="button" className={styles.retryButton} onClick={() => void refetch()}>
              다시 시도
            </button>
          </div>
        )}
        {services?.length === 0 && (
          <p role="status" className={styles.message}>
            아직 등록한 서비스가 없어요.
          </p>
        )}
        {services && services.length > 0 && (
          <ul className={styles.list} aria-label="내 서비스">
            {services.map((service) => (
              <li key={service.serviceId}>
                <button
                  type="button"
                  className={styles.service}
                  aria-current={service.serviceId === activeServiceId ? 'page' : undefined}
                  onClick={() => onSelectService?.(service.serviceId)}
                >
                  <span className={styles.serviceName}>{service.serviceName}</span>
                  <span
                    className={[styles.status, service.stage === 'RECEIVED' && styles.submitted]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {CUSTOMER_SERVICE_STAGE_LABEL[service.stage]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
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
