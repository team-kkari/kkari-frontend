import type { ProjectStage } from '@/entities/project'

/** 진행 단계 표시 이름 */
export const STAGE_LABEL: Record<ProjectStage, string> = {
  RECEIVED: '접수됨',
  ANALYZED: '분석 완료',
  RECOMMENDED: '추천 완료',
}

/** 목록 필터. stage 가 없으면 전체 */
export const STAGE_FILTERS: { label: string; stage?: ProjectStage }[] = [
  { label: '전체' },
  { label: STAGE_LABEL.RECEIVED, stage: 'RECEIVED' },
  { label: STAGE_LABEL.ANALYZED, stage: 'ANALYZED' },
  { label: STAGE_LABEL.RECOMMENDED, stage: 'RECOMMENDED' },
]
