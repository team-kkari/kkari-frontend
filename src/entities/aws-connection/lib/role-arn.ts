/** 백엔드 RegisterAwsConnectionRequest.roleArn 과 같은 규칙 */
const ROLE_ARN_PATTERN = /^arn:aws:iam::\d{12}:role\/[\w+=,.@/-]{1,512}$/

export const ROLE_ARN_ERROR =
  'Role ARN 형식이 올바르지 않아요. 예: arn:aws:iam::123456789012:role/WaycoRole'

export const isRoleArn = (value: string) => ROLE_ARN_PATTERN.test(value)
