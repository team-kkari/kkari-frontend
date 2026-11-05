/**
 * 서버 날짜 문자열을 Date 로 바꾼다.
 * 백엔드 새 버전은 오프셋이 붙은 ISO-8601(`Z`, `+09:00`)을 주지만, 이전 버전은 오프셋 없는 UTC
 * (`2026-11-05T08:45:55.171028`)를 준다. 오프셋이 없으면 UTC 로 해석해서 KST 에서 9시간 어긋나지 않게 한다.
 */
export function parseServerDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i.test(value)
  const date = new Date(hasOffset ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** 2026.11.05 형식. 날짜가 없거나 잘못되면 '-' */
export function formatDate(value: string | null | undefined): string {
  const date = parseServerDate(value)
  if (!date) return '-'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}
