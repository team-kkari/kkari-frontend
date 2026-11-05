import type { ReactNode } from 'react'
import checkboxIcon from '../icons/checkbox.svg'
import checkboxCheckedIcon from '../icons/checkbox-checked.svg'
import styles from './Checkbox.module.css'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  invalid?: boolean
}

export function Checkbox({ checked, onChange, children, invalid }: CheckboxProps) {
  return (
    <label className={styles.root}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        aria-invalid={invalid ? true : undefined}
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
