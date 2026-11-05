import type { AnswerSection } from '@/entities/project'
import styles from './CustomerAnswersCard.module.css'

interface CustomerAnswersCardProps {
  serviceName?: string | null
  sections: AnswerSection[]
}

/** 고객이 창구에서 접수한 서비스와 답변. 엔지니어가 이 내용에서 상담을 이어간다 */
export function CustomerAnswersCard({ serviceName, sections }: CustomerAnswersCardProps) {
  return (
    <section className={styles.card} aria-label="고객이 접수한 내용">
      <p className={styles.eyebrow}>고객이 접수한 내용</p>
      {serviceName && <h2 className={styles.serviceName}>{serviceName}</h2>}
      {sections.map((section) => (
        <div key={section.title} className={styles.section}>
          <h3 className={styles.sectionTitle}>{section.title}</h3>
          <dl className={styles.list}>
            {section.rows.map(
              (row) =>
                row.answer && (
                  <div key={row.question} className={styles.row}>
                    <dt className={styles.label}>{row.question}</dt>
                    <dd className={styles.value}>{row.answer}</dd>
                  </div>
                ),
            )}
          </dl>
        </div>
      ))}
    </section>
  )
}
