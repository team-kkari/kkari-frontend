import styles from './MspProjectsPage.module.css'

interface PageTitleProps {
  title: string
  sub: string
  badge?: string
}

/** 단계 화면 맨 위의 제목 줄 */
export function PageTitle({ title, sub, badge }: PageTitleProps) {
  return (
    <header className={styles.pageTitle}>
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {badge && <span>{badge}</span>}
    </header>
  )
}
