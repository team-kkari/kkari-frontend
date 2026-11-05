import { requestJson } from '@/shared/api'
import type { RegisterServiceBody } from '../model/types'

/**
 * 서비스를 등록한다(201 → serviceId). 호출한 쪽에서 성공 뒤에 `customerServiceQueries.all()` 키를
 * 무효화해 사이드바 목록을 다시 불러오게 한다.
 */
export function registerService(body: RegisterServiceBody) {
  return requestJson<{ serviceId: number }>('/v1/customer/services', 'POST', body)
}
