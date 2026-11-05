import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { engineerQueries, type Engineer } from '@/entities/engineer'
import { closeIcon, radioOnIcon } from '@/shared/ui'
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
  const [pickedId, setPickedId] = useState(initial?.engineerId)
  const { data: engineers, isPending, isError, refetch } = useQuery(engineerQueries.list())

  const keyword = query.trim()
  const filtered = keyword
    ? (engineers ?? []).filter((e) => e.name.includes(keyword) || e.companyName.includes(keyword))
    : (engineers ?? [])
  const picked = engineers?.find((e) => e.engineerId === pickedId)

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
        {isPending && (
          <li role="status" className={styles.empty}>
            엔지니어 목록을 불러오는 중…
          </li>
        )}
        {isError && !engineers && (
          <li role="alert" className={styles.error}>
            <span>엔지니어 목록을 불러오지 못했어요.</span>
            <button type="button" className={styles.retry} onClick={() => void refetch()}>
              다시 시도
            </button>
          </li>
        )}
        {filtered.map((engineer) => {
          const selected = engineer.engineerId === pickedId
          return (
            <li key={engineer.engineerId}>
              <label className={styles.option}>
                <input
                  type="radio"
                  className={styles.radioInput}
                  name="engineer"
                  value={engineer.engineerId}
                  checked={selected}
                  onChange={() => setPickedId(engineer.engineerId)}
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
        {engineers && engineers.length === 0 && (
          <li role="status" className={styles.empty}>
            아직 등록된 엔지니어가 없어요
          </li>
        )}
        {engineers && engineers.length > 0 && filtered.length === 0 && (
          <li className={styles.empty}>찾는 엔지니어가 없어요</li>
        )}
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
