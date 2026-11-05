import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { projectQueries, type ProjectStage } from '@/entities/project'
import { formatDate } from '@/shared/lib'
import { cx } from '../lib/cx'
import { errorMessage } from '../lib/error-message'
import { formatUsd } from '../lib/format'
import { STAGE_FILTERS, STAGE_LABEL } from '../model/stage'
import { stepPath } from '../model/steps'
import styles from './MspProjectsPage.module.css'
import { StateMessage } from './StateMessage'

const STAGE_CLASS: Record<ProjectStage, string> = {
  RECEIVED: styles.stageReceived,
  ANALYZED: styles.stageAnalyzed,
  RECOMMENDED: styles.stageRecommended,
}

export function ProjectList() {
  const [stage, setStage] = useState<ProjectStage | undefined>(undefined)
  // 필터를 바꿔도 새 목록이 올 때까지 이전 목록을 보여줘서 화면이 깜빡이지 않게 한다
  const projects = useQuery({ ...projectQueries.list(stage), placeholderData: keepPreviousData })
  const filterLabel = STAGE_FILTERS.find((filter) => filter.stage === stage)?.label

  return (
    <main className={styles.listMain}>
      <header className={styles.listHeader}>
        <div>
          <h1>프로젝트</h1>
          <p>고객이 등록한 서비스와 직접 만든 의뢰가 함께 보여요</p>
        </div>
        <Link to="/" className={styles.footerButton}>
          새 의뢰 시작
        </Link>
      </header>
      <div className={styles.filters} role="group" aria-label="진행 단계 필터">
        {STAGE_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            className={cx(filter.stage === stage && styles.selected)}
            aria-pressed={filter.stage === stage}
            onClick={() => setStage(filter.stage)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {projects.isPending && <StateMessage>프로젝트를 불러오는 중…</StateMessage>}
      {projects.isError && !projects.data && (
        <StateMessage error onRetry={() => void projects.refetch()}>
          {errorMessage(projects.error)}
        </StateMessage>
      )}
      {projects.data?.length === 0 && (
        <StateMessage>
          {stage
            ? `'${filterLabel}' 단계의 프로젝트가 없어요.`
            : '아직 프로젝트가 없어요. 새 의뢰를 시작하거나 고객이 서비스를 등록하면 여기에 보여요.'}
        </StateMessage>
      )}
      {projects.data && projects.data.length > 0 && (
        <div
          className={cx(styles.table, projects.isPlaceholderData && styles.tableBusy)}
          role="table"
          aria-busy={projects.isPlaceholderData}
        >
          <div className={styles.tableHeader}>
            <span>고객사</span>
            <span>담당자</span>
            <span>진행 단계</span>
            <span>월 비용</span>
            <span>최근 수정</span>
          </div>
          {projects.data.map((project) => (
            <Link
              to={stepPath(project.projectId, 'answers')}
              className={styles.tableRow}
              key={project.projectId}
            >
              <b>{project.companyName}</b>
              <span>{project.contactName}</span>
              <span>
                <i className={STAGE_CLASS[project.stage]}>{STAGE_LABEL[project.stage]}</i>
              </span>
              <span>{formatUsd(project.monthlyCost)}</span>
              <span>{formatDate(project.updatedAt)}</span>
            </Link>
          ))}
        </div>
      )}
      {projects.isError && projects.data && (
        <StateMessage error onRetry={() => void projects.refetch()}>
          {errorMessage(projects.error)}
        </StateMessage>
      )}
    </main>
  )
}
