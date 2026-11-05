/** 백엔드 오류 응답 `{ timestamp, status, code, message }` 를 담는 예외 */
export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface ErrorBody {
  status?: number
  code?: string
  message?: string
}

/** 응답 본문이 JSON 오류 형식이 아니어도 ApiError 로 만든다 (nginx 502 등) */
export async function toApiError(res: Response): Promise<ApiError> {
  let body: ErrorBody = {}
  try {
    body = (await res.json()) as ErrorBody
  } catch {
    // JSON 이 아닌 본문은 상태 코드만 쓴다
  }
  return new ApiError(
    body.status ?? res.status,
    body.code ?? `HTTP_${res.status}`,
    body.message ?? (res.statusText || '요청을 처리하지 못했어요.'),
  )
}
