import type { ProjectDetail } from '@/entities/project'
import { stepIndex, type StepKey } from './steps'

export type StepDone = Record<StepKey, boolean>

/**
 * 단계별 완료 여부를 실제 상태로 판단한다.
 * - 요구사항: 서버에 저장돼 있는지
 * - AWS 연결: 연결 테스트에 성공(CONNECTED)했는지
 * - 인프라 분석 / 추천 생성: 프로젝트 진행 단계(stage)
 * - 고객 답변 확인: 서버가 알 수 없어서, 다음 단계로 넘어갔거나 이후 단계가 끝났으면 완료로 본다
 */
export function getStepDone(
  project: ProjectDetail | undefined,
  requirementsSaved: boolean,
  current: StepKey,
): StepDone {
  const later = {
    requirements: requirementsSaved,
    aws: project?.awsConnectionStatus === 'CONNECTED',
    analysis: project !== undefined && project.stage !== 'RECEIVED',
    recommendation: project?.stage === 'RECOMMENDED',
  }
  return {
    answers: stepIndex(current) > 0 || Object.values(later).some(Boolean),
    ...later,
  }
}
