import { useEffect, useRef, useState } from 'react'
import { cx } from '../lib/cx'
import { copyText } from '../lib/copy-text'
import styles from './MspProjectsPage.module.css'

interface CopyButtonProps {
  /** 무엇을 복사하는지 (스크린리더용) */
  label: string
  value: string
}

/** 값을 클립보드에 복사하는 글자 버튼. 결과를 잠깐 "복사됨" / "복사 실패"로 알려준다 */
export function CopyButton({ label, value }: CopyButtonProps) {
  const [result, setResult] = useState<'copied' | 'failed' | null>(null)
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleCopy = async () => {
    setResult((await copyText(value)) ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setResult(null), 1500)
  }

  return (
    <button
      type="button"
      className={cx(styles.copyButton, result === 'failed' && styles.copyFailed)}
      onClick={handleCopy}
      aria-label={`${label} 복사`}
    >
      {result === 'copied' ? '복사됨' : result === 'failed' ? '복사 실패' : '복사'}
    </button>
  )
}
