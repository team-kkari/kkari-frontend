import type { ReactNode } from 'react'
import { checkCircleIcon } from '@/shared/ui'
import styles from './AuthLayout.module.css'

const FEATURES = [
  '대화하듯 요구사항과 인프라 정보를 모아요',
  'AWS Best Practice로 아키텍처 후보를 추천해요',
  '비용·성능·안정성 점수로 한눈에 비교해요',
]

interface AuthLayoutProps {
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brand}>
        <p className={styles.logo}>Wayco</p>
        <div className={styles.intro}>
          <div className={styles.headline}>
            <h2 className={styles.headlineTitle}>
              고객사 인프라,
              <br />
              AI가 설계해 드려요
            </h2>
            <p className={styles.headlineDescription}>
              MSP·클라우드 엔지니어를 위한 아키텍처 설계 도구
            </p>
          </div>
          <ul className={styles.features}>
            {FEATURES.map((feature) => (
              <li key={feature} className={styles.feature}>
                <img src={checkCircleIcon} alt="" width={18} height={18} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.copyright}>© 2026 Wayco</p>
      </aside>
      <main className={styles.content}>
        <div className={styles.column}>
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
          </header>
          {children}
          <div className={styles.footer}>{footer}</div>
        </div>
      </main>
    </div>
  )
}
