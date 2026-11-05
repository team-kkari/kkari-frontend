import type { ReactNode } from 'react'
import { checkCircleIcon } from '@/shared/ui'
import styles from './AuthLayout.module.css'

interface BrandContent {
  title: ReactNode
  description: string
  features: string[]
}

const DEFAULT_BRAND: BrandContent = {
  title: (
    <>
      고객사 인프라,
      <br />
      AI가 설계해 드려요
    </>
  ),
  description: 'MSP·클라우드 엔지니어를 위한 아키텍처 설계 도구',
  features: [
    '대화하듯 요구사항과 인프라 정보를 모아요',
    'AWS Best Practice로 아키텍처 후보를 추천해요',
    '비용·성능·안정성 점수로 한눈에 비교해요',
  ],
}

interface AuthLayoutProps {
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
  brand?: BrandContent
  beforeHeader?: ReactNode
}

export function AuthLayout({
  title,
  description,
  footer,
  children,
  brand = DEFAULT_BRAND,
  beforeHeader,
}: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brand}>
        <p className={styles.logo}>Wayco</p>
        <div className={styles.intro}>
          <div className={styles.headline}>
            <h2 className={styles.headlineTitle}>{brand.title}</h2>
            <p className={styles.headlineDescription}>{brand.description}</p>
          </div>
          <ul className={styles.features}>
            {brand.features.map((feature) => (
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
          {beforeHeader}
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
