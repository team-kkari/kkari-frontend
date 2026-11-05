import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import styles from './MspProjectsPage.module.css'

interface FieldProps {
  title: string
  children: ReactNode
  wide?: boolean
}

/** 회색 바탕의 입력·정보 묶음 한 칸 */
export function Field({ title, children, wide = false }: FieldProps) {
  return (
    <section className={cx(styles.field, wide && styles.wide)}>
      <h3>{title}</h3>
      {children}
    </section>
  )
}
