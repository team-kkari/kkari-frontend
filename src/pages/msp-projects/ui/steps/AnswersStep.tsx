import { Link } from 'react-router'
import type { ProjectDetail } from '@/entities/project'
import { formatDate } from '@/shared/lib'
import { groupAnswers } from '../../model/answers'
import { STAGE_LABEL } from '../../model/stage'
import { stepPath } from '../../model/steps'
import styles from '../MspProjectsPage.module.css'
import { Notice } from '../Notice'
import { PageTitle } from '../PageTitle'
import { StepFooter } from '../StepFooter'

interface AnswersStepProps {
  project: ProjectDetail
}

/** 고객 답변 확인: 고객이 서비스를 등록할 때 답한 내용을 읽기 전용으로 보여준다 */
export function AnswersStep({ project }: AnswersStepProps) {
  const sections = groupAnswers(project.answers)
  // 직접 만든 프로젝트는 answers 가 null 이다
  const isDirect = project.answers == null
  const title = project.serviceName
    ? `${project.companyName} · ${project.serviceName}`
    : project.companyName

  return (
    <>
      <PageTitle
        title={title}
        sub={`담당자 ${project.contactName} · 최근 수정일 ${formatDate(project.updatedAt)}`}
        badge={STAGE_LABEL[project.stage]}
      />
      {sections.length === 0 && (
        <Notice title={isDirect ? '고객 답변이 없는 프로젝트예요' : '아직 고객 답변이 비어 있어요'}>
          {isDirect
            ? '직접 만든 의뢰는 고객이 입력한 답변이 없어요. 상담에서 들은 내용을 바탕으로 요구사항 입력부터 진행해 주세요.'
            : '고객이 답변을 입력하지 않았어요. 요구사항 입력에서 필요한 내용을 직접 정리할 수 있어요.'}
        </Notice>
      )}
      {sections.map((section) => (
        <section className={styles.answerSection} key={section.title}>
          <h3>
            <em>{section.number}</em>
            {section.title}
          </h3>
          {section.rows.map((row) => (
            <div className={styles.answerRow} key={row.question}>
              <span>{row.question}</span>
              {row.answer ? (
                <b>{row.answer}</b>
              ) : (
                <b className={styles.muted}>아직 답하지 않았어요</b>
              )}
            </div>
          ))}
        </section>
      ))}
      <StepFooter projectId={project.projectId} step="answers">
        <Link className={styles.footerButton} to={stepPath(project.projectId, 'requirements')}>
          요구사항 입력
        </Link>
      </StepFooter>
    </>
  )
}
