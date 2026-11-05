import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { PRIORITY_LABEL, type Priority } from '@/entities/chat'
import type { ProjectDetail } from '@/entities/project'
import { requirementQueries, type SavedRequirements } from '@/entities/requirement'
import { cx } from '../../lib/cx'
import { errorMessage } from '../../lib/error-message'
import {
  CONTENT_MAX_LENGTH,
  CURRENCY_OPTIONS,
  DESIRED_ARCHITECTURE_MAX_LENGTH,
  PRIORITY_OPTIONS,
  toFormState,
  validateRequirements,
  type RequirementsErrors,
  type RequirementsField,
  type RequirementsFormState,
} from '../../model/requirements-form'
import { stepPath } from '../../model/steps'
import { useSaveRequirements } from '../../model/useSaveRequirements'
import { Field } from '../Field'
import styles from '../MspProjectsPage.module.css'
import { PageTitle } from '../PageTitle'
import { StateMessage } from '../StateMessage'
import { StepFooter } from '../StepFooter'

interface RequirementsStepProps {
  project: ProjectDetail
}

const TITLE = '요구사항 입력'
const SUB = '고객 답변을 참고해 새 추천에 쓸 요구사항을 정리해요'

/** 요구사항 입력: 저장된 요구사항을 불러와 폼을 채우고, 저장하면 서버의 요구사항을 통째로 교체한다 */
export function RequirementsStep({ project }: RequirementsStepProps) {
  const query = useQuery(requirementQueries.detail(project.projectId))

  if (query.isError) {
    return (
      <>
        <PageTitle title={TITLE} sub={SUB} />
        <StateMessage error onRetry={() => void query.refetch()}>
          {errorMessage(query.error)}
        </StateMessage>
        <StepFooter projectId={project.projectId} step="requirements" />
      </>
    )
  }

  // 상담 화면에서 저장했을 수 있어서, 캐시에 남은 값이 아니라 지금 서버 값으로 폼을 채운다
  if (!query.isFetchedAfterMount) {
    return (
      <>
        <PageTitle title={TITLE} sub={SUB} />
        <StateMessage>요구사항을 불러오는 중…</StateMessage>
        <StepFooter projectId={project.projectId} step="requirements" />
      </>
    )
  }

  return <RequirementsForm projectId={project.projectId} initial={query.data} />
}

interface RequirementsFormProps {
  projectId: number
  /** 저장된 요구사항. 아직 입력 전이면 null */
  initial: SavedRequirements | null | undefined
}

function RequirementsForm({ projectId, initial }: RequirementsFormProps) {
  const navigate = useNavigate()
  const save = useSaveRequirements(projectId)
  const [form, setForm] = useState<RequirementsFormState>(() => toFormState(initial))
  const [errors, setErrors] = useState<RequirementsErrors>({})
  const [saved, setSaved] = useState(false)

  /** 값을 바꾸면 그 항목의 오류와 이전 저장·오류 안내를 지운다 */
  const update = (patch: Partial<RequirementsFormState>, field: RequirementsField) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setErrors(({ [field]: _removed, ...rest }) => rest)
    setSaved(false)
    if (save.isError) save.reset()
  }

  const togglePriority = (priority: Priority) =>
    update(
      {
        priorities: form.priorities.includes(priority)
          ? form.priorities.filter((item) => item !== priority)
          : [...form.priorities, priority],
      },
      'priorities',
    )

  const submit = (goNext: boolean) => {
    const result = validateRequirements(form)
    if (!result.ok) {
      setErrors(result.errors)
      setSaved(false)
      return
    }
    setErrors({})
    save.mutate(result.request, {
      onSuccess: () => {
        if (goNext) navigate(stepPath(projectId, 'aws'))
        else setSaved(true)
      },
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit(true)
  }

  const budgetValue = Number(form.budget.replace(/[,\s]/g, ''))
  const hasErrors = Object.keys(errors).length > 0
  const budgetHint =
    form.budget.trim() === ''
      ? '비워 두면 아직 모르는 것으로 저장돼요'
      : budgetValue === 0
        ? '0이면 예산 상한이 없는 것으로 저장돼요'
        : form.currency
          ? ''
          : '금액을 쓰면 통화도 골라 주세요'

  return (
    <>
      <PageTitle title={TITLE} sub={SUB} />
      <form className={styles.stepForm} onSubmit={handleSubmit} noValidate>
        <Field title="요구사항 내용" wide>
          <textarea
            value={form.content}
            maxLength={CONTENT_MAX_LENGTH}
            placeholder="예: 세일 기간 외 유휴 서버 비용을 줄이고, 결제 데이터베이스 장애에 대비해야 해요."
            aria-label="요구사항 내용"
            aria-invalid={!!errors.content}
            onChange={(event) => update({ content: event.target.value }, 'content')}
          />
          {errors.content && <p className={styles.fieldError}>{errors.content}</p>}
        </Field>

        <Field title="우선순위" wide>
          <p>눌러서 중요한 순서대로 골라 주세요. 먼저 고른 것이 더 중요하고, 다시 누르면 빠져요</p>
          <div className={styles.chips} role="group" aria-label="우선순위">
            {PRIORITY_OPTIONS.map((priority) => {
              const rank = form.priorities.indexOf(priority) + 1
              return (
                <button
                  key={priority}
                  type="button"
                  className={cx(styles.chip, rank > 0 && styles.chipOn)}
                  aria-pressed={rank > 0}
                  onClick={() => togglePriority(priority)}
                >
                  {rank > 0 && `${rank} `}
                  {PRIORITY_LABEL[priority]}
                </button>
              )
            })}
          </div>
          {errors.priorities && <p className={styles.fieldError}>{errors.priorities}</p>}
        </Field>

        <div className={styles.fieldGrid}>
          <Field title="월 예산 (선택)">
            <div className={styles.budgetRow}>
              <input
                inputMode="decimal"
                value={form.budget}
                placeholder="금액 입력"
                aria-label="월 예산"
                aria-invalid={!!errors.budget}
                onChange={(event) => update({ budget: event.target.value }, 'budget')}
              />
              <div className={styles.chips} role="group" aria-label="예산 통화">
                {CURRENCY_OPTIONS.map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    className={cx(styles.chip, form.currency === currency && styles.chipOn)}
                    aria-pressed={form.currency === currency}
                    onClick={() =>
                      update({ currency: form.currency === currency ? null : currency }, 'currency')
                    }
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>
            {budgetHint && <p>{budgetHint}</p>}
            {errors.budget && <p className={styles.fieldError}>{errors.budget}</p>}
            {errors.currency && <p className={styles.fieldError}>{errors.currency}</p>}
          </Field>

          <Field title="개인정보 포함 여부">
            <div className={styles.chips} role="group" aria-label="개인정보 포함 여부">
              {[
                { label: '예', value: true },
                { label: '아니오', value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={cx(
                    styles.chip,
                    form.containsPersonalData === option.value && styles.chipOn,
                  )}
                  aria-pressed={form.containsPersonalData === option.value}
                  onClick={() =>
                    update({ containsPersonalData: option.value }, 'containsPersonalData')
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.containsPersonalData && (
              <p className={styles.fieldError}>{errors.containsPersonalData}</p>
            )}
          </Field>
        </div>

        <Field title="변경하면 안 되는 리소스 (선택)" wide>
          <input
            value={form.frozenResources}
            placeholder="예: 결제 시스템, 회원 DB"
            aria-label="변경하면 안 되는 리소스"
            aria-invalid={!!errors.frozenResources}
            onChange={(event) => update({ frozenResources: event.target.value }, 'frozenResources')}
          />
          <p>여러 개면 쉼표(,)로 나눠 적어 주세요</p>
          {errors.frozenResources && <p className={styles.fieldError}>{errors.frozenResources}</p>}
        </Field>

        <Field title="원하는 구조 (선택)" wide>
          <input
            value={form.desiredArchitecture}
            maxLength={DESIRED_ARCHITECTURE_MAX_LENGTH}
            placeholder="특별히 원하는 구조가 있으면 입력"
            aria-label="원하는 구조"
            aria-invalid={!!errors.desiredArchitecture}
            onChange={(event) =>
              update({ desiredArchitecture: event.target.value }, 'desiredArchitecture')
            }
          />
          {errors.desiredArchitecture && (
            <p className={styles.fieldError}>{errors.desiredArchitecture}</p>
          )}
        </Field>

        {hasErrors && (
          <p className={styles.formError} role="alert">
            입력을 다시 확인해 주세요.
          </p>
        )}
        {save.isError && (
          <p className={styles.formError} role="alert">
            {errorMessage(save.error)}
          </p>
        )}
        {saved && (
          <p className={styles.formSuccess} role="status">
            요구사항을 저장했어요.
          </p>
        )}

        <StepFooter projectId={projectId} step="requirements">
          <button type="submit" className={styles.footerButton} disabled={save.isPending}>
            {save.isPending ? '저장하는 중…' : '저장하고 AWS 연결로'}
          </button>
          <button
            type="button"
            className={cx(styles.footerButton, styles.footerGhost)}
            disabled={save.isPending}
            onClick={() => submit(false)}
          >
            저장
          </button>
        </StepFooter>
      </form>
    </>
  )
}
