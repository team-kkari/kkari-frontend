import { queryOptions } from '@tanstack/react-query'
import { request, requestJson } from '@/shared/api'
import type { ChatState, Requirements, SendChatResponse } from '../model/types'

export const chatQueries = {
  all: () => ['chat'] as const,
  history: (projectId: number) =>
    queryOptions({
      queryKey: [...chatQueries.all(), projectId],
      queryFn: () => request<ChatState>(`/v1/projects/${projectId}/chat/messages`),
      staleTime: 0,
    }),
}

/**
 * 메시지를 보내고 AI 응답을 받는다.
 * content 를 비우면 상담 시작이거나, 직전 AI 응답이 실패했을 때 응답만 다시 요청한다.
 * clientMessageId 는 같은 전송을 두 번 저장하지 않게 하는 값이다.
 */
export function sendChatMessage(projectId: number, content?: string) {
  const clientMessageId = crypto.randomUUID()
  return requestJson<SendChatResponse>(
    `/v1/projects/${projectId}/chat/messages`,
    'POST',
    content ? { content, clientMessageId } : { clientMessageId },
  )
}

/** 요구사항 전체를 교체해서 저장한다 */
export function saveRequirements(projectId: number, requirements: Requirements) {
  return requestJson<Requirements>(`/v1/projects/${projectId}/requirements`, 'PUT', requirements)
}
