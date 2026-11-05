import { requestJson } from '@/shared/api'
import type { CreateProjectBody } from '../model/types'

/**
 * 프로젝트를 만든다. 호출한 쪽에서 성공 뒤에 `projectQueries.all()` 키를 무효화해
 * 사이드바 목록을 다시 불러오게 한다.
 */
export function createProject(body: CreateProjectBody) {
  return requestJson<{ projectId: number }>('/v1/projects', 'POST', body)
}
