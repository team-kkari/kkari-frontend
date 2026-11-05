import { ApiError, getAccessToken, useSessionStore } from '@/shared/api'
import { env } from '@/shared/config'
import type { LatestArchitectureJob } from '../model/types'
import type { ArchitectureResponseDto, LatestJobDto } from './dto'
import { toLatestJob } from './mapper'

/** 성공한 추천 결과가 아직 없을 때의 404(AR002). 가장 최근 설계 작업(latestJob)을 함께 담는다 */
export class ArchitectureNotFoundError extends ApiError {
  /** 진행 중이거나 실패한 설계 작업. 시작한 적이 없거나 옛 서버면 null */
  latestJob: LatestArchitectureJob | null

  constructor(message: string, latestJob: LatestArchitectureJob | null) {
    super(404, 'AR002', message)
    this.name = 'ArchitectureNotFoundError'
    this.latestJob = latestJob
  }
}

interface ErrorBody {
  status?: number
  code?: string
  message?: string
  latestJob?: LatestJobDto | null
}

function parseJson(text: string): unknown {
  try {
    return text ? JSON.parse(text) : undefined
  } catch {
    return undefined
  }
}

/**
 * `GET /v1/projects/{projectId}/architectures`.
 *
 * 공통 `request` 는 오류 본문에서 상태·코드·메시지만 남기는데, AR002 의 latestJob 은 본문에만 있다.
 * 그래서 이 호출만 직접 fetch 해서 AR002 를 latestJob 이 담긴 ArchitectureNotFoundError 로 던진다
 * (ApiError 이므로 기존 `isArchitectureNotFound` 판정은 그대로 맞는다). 인증·401 처리와 그 밖의 오류는 `request` 와 같다.
 */
export async function requestArchitectures(projectId: number): Promise<ArchitectureResponseDto> {
  const token = getAccessToken()
  const res = await fetch(`${env.API_BASE_URL}/v1/projects/${projectId}/architectures`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const body = parseJson(await res.text())

  if (res.ok) {
    if (typeof body !== 'object' || body === null) {
      throw new ApiError(502, 'INVALID_ARCHITECTURE_RESULT', '추천 결과의 형식을 읽지 못했어요.')
    }
    return body as ArchitectureResponseDto
  }

  if (res.status === 401 && token) useSessionStore.getState().clearSession()
  const error = (typeof body === 'object' && body !== null ? body : {}) as ErrorBody
  const message = error.message ?? (res.statusText || '요청을 처리하지 못했어요.')
  if (res.status === 404 && error.code === 'AR002') {
    throw new ArchitectureNotFoundError(message, toLatestJob(error.latestJob))
  }
  throw new ApiError(error.status ?? res.status, error.code ?? `HTTP_${res.status}`, message)
}
