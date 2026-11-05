import { request, requestJson } from '@/shared/api'
import type { AwsConnection } from '../model/types'

const base = (projectId: number) => `/v1/projects/${projectId}/aws-connection`

export const getAwsConnection = (projectId: number) => request<AwsConnection>(base(projectId))

/** Role ARN 을 등록한다. 등록하면 상태가 UNTESTED 가 된다 */
export const registerRoleArn = (projectId: number, roleArn: string) =>
  requestJson<AwsConnection>(base(projectId), 'POST', { roleArn })

/** AssumeRole 후 읽기 권한을 확인한다. CONNECTED / TRUST_POLICY_ERROR / PERMISSION_DENIED */
export const testAwsConnection = (projectId: number) =>
  request<AwsConnection>(`${base(projectId)}/test`, { method: 'POST' })
