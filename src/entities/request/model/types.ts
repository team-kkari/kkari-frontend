export type RequestStatus = 'in_progress' | 'done'

/** 사이드바에 보이는 아키텍처 의뢰 한 건 */
export interface ArchitectureRequest {
  id: string
  title: string
  status: RequestStatus
}

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  in_progress: '진행 중',
  done: '완료',
}
