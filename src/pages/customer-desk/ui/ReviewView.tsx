import { useState, type KeyboardEvent } from 'react'
import { checkIcon, editIcon, infoNoticeIcon } from '@/shared/ui'
import { REVIEW_FIELDS, REVIEW_GROUPS } from '../model/script'
import type { Answers, Engineer, FieldKey } from '../model/types'
import { EngineerPicker } from './EngineerPicker'
import { EngineerProfile } from './EngineerProfile'
import styles from './ReviewView.module.css'

interface ReviewViewProps {
  answers: Answers
  engineer?: Engineer
  /** 제출을 마쳤으면 더 고칠 수 없다 */
  submitted: boolean
  onEdit: (field: FieldKey, value: string) => void
  onChangeEngineer: (engineer: Engineer) => void
  onBack: () => void
  onSubmit: () => void
}

export function ReviewView({
  answers,
  engineer,
  submitted,
  onEdit,
  onChangeEngineer,
  onBack,
  onSubmit,
}: ReviewViewProps) {
  const [editing, setEditing] = useState<FieldKey>()
  const [draft, setDraft] = useState('')
  const [isPickingEngineer, setIsPickingEngineer] = useState(false)

  const answeredCount = REVIEW_FIELDS.filter((field) => answers[field]).length
  const total = REVIEW_FIELDS.length

  const startEdit = (field: FieldKey) => {
    if (submitted) return
    setEditing(field)
    setDraft(answers[field] ?? '')
  }

  const finishEdit = () => {
    if (!editing) return
    const value = draft.trim()
    // 지우기만 하고 끝내면 원래 답을 남긴다
    if (value) onEdit(editing, value)
    setEditing(undefined)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') finishEdit()
    if (event.key === 'Escape') setEditing(undefined)
  }

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>새 서비스 등록 · {submitted ? '제출 완료' : '마지막 단계'}</p>
        <h1 className={styles.title}>
          {submitted ? '담당 엔지니어에게 제출했어요' : '제출 전에 확인해 주세요'}
        </h1>
        <p className={styles.description}>
          {submitted
            ? '검토가 끝나면 내 서비스에서 결과를 확인할 수 있어요'
            : '고칠 내용이 있으면 답변을 눌러 바로 고칠 수 있어요'}
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.answers}>
          {REVIEW_GROUPS.map((group, groupIndex) => (
            <section key={group.title} className={styles.group}>
              <h2 className={styles.groupTitle}>
                <span className={styles.groupNumber}>
                  {String(groupIndex + 1).padStart(2, '0')}
                </span>
                {group.title}
              </h2>
              <dl className={styles.rows}>
                {group.rows.map(({ field, label }) => {
                  const value = answers[field]
                  return (
                    <div key={field} className={styles.row}>
                      <dt className={styles.rowLabel}>{label}</dt>
                      <dd className={styles.rowValue}>
                        {editing === field ? (
                          <input
                            className={styles.editInput}
                            value={draft}
                            aria-label={`${label} 고치기`}
                            autoFocus
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={finishEdit}
                          />
                        ) : value ? (
                          <>
                            <button
                              type="button"
                              className={styles.answer}
                              disabled={submitted}
                              onClick={() => startEdit(field)}
                            >
                              {value}
                            </button>
                            {!submitted && (
                              <button
                                type="button"
                                className={styles.editButton}
                                aria-label={`${label} 고치기`}
                                onClick={() => startEdit(field)}
                              >
                                <img src={editIcon} alt="" width={16} height={16} />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <span className={styles.unanswered}>아직 답하지 않았어요</span>
                            {!submitted && (
                              <button
                                type="button"
                                className={styles.addButton}
                                onClick={() => startEdit(field)}
                              >
                                답변 추가
                              </button>
                            )}
                          </>
                        )}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </section>
          ))}
        </div>

        <div className={styles.submitColumn}>
          <div className={styles.submitCard}>
            <div className={styles.status}>
              <div className={styles.statusRow}>
                <span className={styles.ready}>
                  <img src={checkIcon} alt="" width={14} height={14} />
                  {submitted ? '제출했어요' : '제출할 준비가 됐어요'}
                </span>
                <span className={styles.count}>
                  {answeredCount} / {total}
                </span>
              </div>
              <div
                className={styles.progress}
                role="progressbar"
                aria-label="답변한 항목"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={answeredCount}
              >
                <div
                  className={styles.bar}
                  style={{ width: `${(answeredCount / total) * 100}%` }}
                />
              </div>
            </div>

            <hr className={styles.divider} />

            {isPickingEngineer ? (
              <EngineerPicker
                initial={engineer}
                onSubmit={(picked) => {
                  onChangeEngineer(picked)
                  setIsPickingEngineer(false)
                }}
                onClose={() => setIsPickingEngineer(false)}
              />
            ) : (
              <div className={styles.engineer}>
                <p className={styles.engineerLabel}>담당 엔지니어</p>
                <div className={styles.engineerRow}>
                  {engineer ? (
                    <EngineerProfile engineer={engineer} />
                  ) : (
                    <span className={styles.unanswered}>아직 고르지 않았어요</span>
                  )}
                  {!submitted && (
                    <button
                      type="button"
                      className={styles.changeButton}
                      onClick={() => setIsPickingEngineer(true)}
                    >
                      {engineer ? '변경' : '선택'}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={styles.actions}>
              {!submitted && (
                <button type="button" className={styles.backButton} onClick={onBack}>
                  이전
                </button>
              )}
              <button
                type="button"
                className={styles.submitButton}
                disabled={submitted || !engineer || isPickingEngineer}
                onClick={onSubmit}
              >
                {submitted ? '제출 완료' : '담당 엔지니어에게 제출'}
              </button>
            </div>
          </div>

          <p className={styles.notice}>
            <img src={infoNoticeIcon} alt="" width={16} height={16} />
            제출한 뒤에는 답변과 담당 엔지니어를 바꿀 수 없어요
          </p>
        </div>
      </div>
    </section>
  )
}
