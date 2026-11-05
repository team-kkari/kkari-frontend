import type { AwsConnectionStatus } from './types'

export type AwsConnectionTone = 'neutral' | 'success' | 'error'

export interface AwsConnectionGuide {
  tone: AwsConnectionTone
  title: string
  /** 사용자가 다음에 무엇을 하면 되는지 */
  message: string
}

/** 연결 상태별 안내 문구 */
export const AWS_CONNECTION_STATUS_GUIDE: Record<AwsConnectionStatus, AwsConnectionGuide> = {
  NOT_CONNECTED: {
    tone: 'neutral',
    title: '아직 연결 전이에요',
    message: 'Role ARN을 입력하고 연결 테스트를 눌러 주세요.',
  },
  UNTESTED: {
    tone: 'neutral',
    title: 'Role ARN만 등록된 상태예요',
    message: '연결 테스트를 눌러 Role을 맡을 수 있는지 확인해 주세요.',
  },
  CONNECTED: {
    tone: 'success',
    title: 'AWS 계정에 연결됐어요',
    message: 'Role을 맡아 읽기 권한까지 확인했어요.',
  },
  TRUST_POLICY_ERROR: {
    tone: 'error',
    title: '신뢰 정책을 확인해 주세요',
    message:
      'Role을 맡지 못했어요. 고객사 Role의 신뢰 정책에 위의 계정 ID와 External ID가 그대로 들어 있는지 확인한 뒤 다시 테스트해 주세요.',
  },
  PERMISSION_DENIED: {
    tone: 'error',
    title: '읽기 권한이 부족해요',
    message:
      'Role은 맡았지만 리소스를 조회할 권한이 없어요. Role에 조회 권한 정책(예: ReadOnlyAccess)을 연결한 뒤 다시 테스트해 주세요.',
  },
}
