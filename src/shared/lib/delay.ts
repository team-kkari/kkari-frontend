/** 목(mock) API 응답 지연용. 백엔드 연결 후 제거 */
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
