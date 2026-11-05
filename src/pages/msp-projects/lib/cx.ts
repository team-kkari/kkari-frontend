/** 참인 클래스 이름만 공백으로 이어 붙인다 */
export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(' ')
