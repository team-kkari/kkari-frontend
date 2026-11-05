/**
 * 클립보드에 복사한다. http 로 접속하면 Clipboard API(navigator.clipboard)가 없어서
 * 숨은 textarea 를 선택해 execCommand 로 대신한다. 둘 다 안 되면 false.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.append(textarea)
    textarea.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      textarea.remove()
    }
  }
}
