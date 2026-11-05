const wholeUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const centsUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** `$1,850` 형식. 값이 없으면 '-'. 1달러 미만의 양수만 센트까지 보여준다 */
export function formatUsd(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-'
  return (value > 0 && value < 1 ? centsUsd : wholeUsd).format(value)
}

/** 12% 처럼 보여준다. 10 미만은 소수 한 자리까지 */
export function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-'
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)}%`
}

/** 파일 크기 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 ** 2).toFixed(1)}MB`
}
