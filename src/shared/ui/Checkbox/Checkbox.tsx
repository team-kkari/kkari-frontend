import type { ReactNode } from 'react'
import checkboxIcon from '../icons/checkbox.svg'
import checkboxCheckedIcon from '../icons/checkbox-checked.svg'
import styles from './Checkbox.module.css'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  invalid?: boolean
  /** 에러·설명 문구 요소의 id. 스크린리더가 체크박스와 함께 읽는다 */
  describedBy?: string
}

export function Checkbox({ checked, onChange, children, invalid, describedBy }: CheckboxProps) {
  return (
    <label className={styles.root}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.checked)}
      />
      <img
        src={checked ? checkboxCheckedIcon : checkboxIcon}
        alt=""
        width={18}
        height={18}
        className={[styles.box, invalid && !checked && styles.invalid].filter(Boolean).join(' ')}
      />
      <span className={styles.label}>{children}</span>
    </label>
  )
}
