import { ApiError } from '@/shared/api'

/** 백엔드 오류는 그 메시지를, 네트워크 오류 등은 일반 안내 문구를 돌려준다 */
export const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'

/** 서버가 알려준 오류 코드인지 */
export const hasErrorCode = (error: unknown, code: string) =>
  error instanceof ApiError && error.code === code
