import { useState } from 'react'
import { closeIcon, radioOnIcon } from '@/shared/ui'
import { ENGINEERS } from '../model/script'
import type { Engineer } from '../model/types'
import { EngineerProfile } from './EngineerProfile'
import card from './PromptCard.module.css'
import styles from './EngineerPicker.module.css'

interface EngineerPickerProps {
  /** 처음에 골라져 있는 엔지니어 (제출 전 확인에서 '변경'으로 돌아왔을 때) */
  initial?: Engineer
  onSubmit: (engineer: Engineer) => void
  onClose?: () => void
}

export function EngineerPicker({ initial, onSubmit, onClose }: EngineerPickerProps) {
  const [query, setQuery] = useState('')
  const [pickedId, setPickedId] = useState(initial?.id)

  const keyword = query.trim()
  const filtered = keyword
    ? ENGINEERS.filter((e) => e.name.includes(keyword) || e.company.includes(keyword))
    : ENGINEERS
  const picked = ENGINEERS.find((e) => e.id === pickedId)

  return (
    <div className={card.card} role="group" aria-labelledby="engineer-picker-title">
      <div className={card.header}>
        <p id="engineer-picker-title" className={card.title}>
          담당 엔지니어를 선택해 주세요
        </p>
        {onClose && (
          <button type="button" className={card.close} aria-label="닫기" onClick={onClose}>
            <img src={closeIcon} alt="" width={12} height={12} />
          </button>
        )}
      </div>

      <input
        className={styles.search}
        type="search"
        value={query}
        placeholder="회사명이나 이름으로 검색"
        aria-label="담당 엔지니어 검색"
        onChange={(event) => setQuery(event.target.value)}
      />

      <ul className={styles.list}>
        {filtered.map((engineer) => {
          const selected = engineer.id === pickedId
          return (
            <li key={engineer.id}>
              <label className={styles.option}>
                <input
                  type="radio"
                  className={styles.radioInput}
                  name="engineer"
                  value={engineer.id}
                  checked={selected}
                  onChange={() => setPickedId(engineer.id)}
                />
                <EngineerProfile engineer={engineer} />
                {selected ? (
                  <img src={radioOnIcon} alt="" width={20} height={20} />
                ) : (
                  <span className={styles.radioOff} aria-hidden="true" />
                )}
              </label>
            </li>
          )
        })}
        {filtered.length === 0 && <li className={styles.empty}>찾는 엔지니어가 없어요</li>}
      </ul>

      <button
        type="button"
        className={card.submit}
        disabled={!picked}
        onClick={() => picked && onSubmit(picked)}
      >
        선택 완료
      </button>
    </div>
  )
}
