/** 백엔드 AwsConnectionResponse.status */
export type AwsConnectionStatus =
  'NOT_CONNECTED' | 'UNTESTED' | 'CONNECTED' | 'TRUST_POLICY_ERROR' | 'PERMISSION_DENIED'

/**
 * 백엔드 AwsConnectionResponse.
 * 고객사가 Role 신뢰 정책에 넣을 우리 쪽 계정 ID·External ID와 현재 연결 상태다
 */
export interface AwsConnection {
  /** 우리 서비스의 AWS 계정 ID. 신뢰 정책의 Principal 이다 */
  accountId: string
  externalId: string
  /** 등록 전에는 비어 있다 */
  roleArn?: string | null
  status: AwsConnectionStatus
  /** 고객사가 Role 에 그대로 붙여 넣을 신뢰 정책 JSON */
  trustPolicy: string
}
