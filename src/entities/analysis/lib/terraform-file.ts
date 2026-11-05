/** 서버 제한(5MB)과 같다. 넘으면 올리기 전에 막는다 */
export const TERRAFORM_MAX_BYTES = 5 * 1024 * 1024

/** 파일 선택 창에서 보여줄 확장자 */
export const TERRAFORM_ACCEPT = '.tfstate,.json'

const EXTENSION_PATTERN = /\.(tfstate|json)$/i

/** 올릴 수 없는 파일이면 이유를, 괜찮으면 null 을 돌려준다 */
export function validateTerraformFile(file: File): string | null {
  if (!EXTENSION_PATTERN.test(file.name)) {
    return 'terraform.tfstate 같은 .tfstate 또는 .json 파일만 올릴 수 있어요.'
  }
  if (file.size === 0) return '빈 파일이에요. 내용이 있는 state 파일을 골라 주세요.'
  if (file.size > TERRAFORM_MAX_BYTES) {
    const megabytes = (file.size / 1024 ** 2).toFixed(1)
    return `파일이 너무 커요. 5MB 이하만 올릴 수 있어요. (현재 ${megabytes}MB)`
  }
  return null
}
