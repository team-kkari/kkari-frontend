import { useState } from 'react'
import { circleEmptyIcon, radioCheckedIcon } from '@/shared/ui'
import type { ChoiceCard } from '../model/types'
import card from './ActionCard.module.css'
import styles from './ChoiceCardView.module.css'

interface ChoiceCardViewProps {
  choice: ChoiceCard
  onConfirm: (optionId: string) => void
}

export function ChoiceCardView({ choice, onConfirm }: ChoiceCardViewProps) {
  const [pickedId, setPickedId] = useState(choice.defaultId ?? choice.options[0]?.id)
  const confirmed = !!choice.selectedId
  const currentId = choice.selectedId ?? pickedId

  return (
    <fieldset className={card.card} disabled={confirmed}>
      <legend className={card.title}>{choice.question}</legend>
      {choice.options.map((option) => {
        const selected = option.id === currentId
        return (
          <label
            key={option.id}
            className={[styles.option, selected && styles.selected].filter(Boolean).join(' ')}
          >
            <input
              type="radio"
              className={styles.radioInput}
              name={choice.question}
              value={option.id}
              checked={selected}
              onChange={() => setPickedId(option.id)}
            />
            <img
              src={selected ? radioCheckedIcon : circleEmptyIcon}
              alt=""
              width={22}
              height={22}
            />
            <span className={styles.text}>
              <span className={styles.label}>{option.label}</span>
              <span className={styles.description}>{option.description}</span>
            </span>
          </label>
        )
      })}
      <button
        type="button"
        className={[card.primaryButton, confirmed && card.completed].filter(Boolean).join(' ')}
        disabled={!currentId}
        onClick={() => currentId && onConfirm(currentId)}
      >
        확인
      </button>
    </fieldset>
  )
}
