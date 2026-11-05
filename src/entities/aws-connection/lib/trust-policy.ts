/** 신뢰 정책 JSON 을 사람이 읽기 쉽게 들여쓴다. JSON 이 아니면 받은 그대로 돌려준다 */
export function formatTrustPolicy(trustPolicy: string) {
  try {
    return JSON.stringify(JSON.parse(trustPolicy), null, 2)
  } catch {
    return trustPolicy
  }
}
