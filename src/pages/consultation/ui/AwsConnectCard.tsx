import { useEffect, useRef, useState, type FormEvent } from 'react'
import { copyIcon } from '@/shared/ui'
import { MOCK_EXTERNAL_ID } from '../model/script'
import card from './ActionCard.module.css'
import styles from './AwsConnectCard.module.css'

const ROLE_ARN_PATTERN = /^arn:aws:iam::\d{12}:role\/.+$/
/** 목업 연결 테스트 시간 (ms) */
const MOCK_TEST_DELAY = 1200

interface AwsConnectCardProps {
  done: boolean
  /** 완료된 카드에 보여줄, 연결에 쓴 Role ARN */
  savedRoleArn?: string
  onConnected: (roleArn: string) => void
}

export function AwsConnectCard({ done, savedRoleArn, onConnected }: AwsConnectCardProps) {
  const [roleArn, setRoleArn] = useState(savedRoleArn ?? '')
  const [error, setError] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copyExternalId = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_EXTERNAL_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 권한이 없으면 조용히 무시
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = roleArn.trim()
    if (!ROLE_ARN_PATTERN.test(value)) {
      setError('Role ARN 형식이 올바르지 않아요. 예: arn:aws:iam::123456789012:role/WaycoRole')
      return
    }
    setError('')
    setIsTesting(true)
    // TODO: 연결 테스트 API 연결
    timer.current = window.setTimeout(() => {
      setIsTesting(false)
      onConnected(value)
    }, MOCK_TEST_DELAY)
  }

  const locked = done || isTesting

  return (
    <form
      className={[card.card, done && card.done].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
    >
      <ol className={styles.steps}>
        <li className={styles.step}>
          <p className={card.title}>1. 고객사에 이 값을 전달해주세요</p>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>External ID</span>
            <div className={styles.box}>
              <span className={styles.value}>{MOCK_EXTERNAL_ID}</span>
              <button
                type="button"
                className={styles.copy}
                onClick={copyExternalId}
                aria-label={copied ? '복사됨' : 'External ID 복사'}
                title={copied ? '복사됨' : '복사'}
              >
                {copied ? (
                  <span className={styles.copied}>복사됨</span>
                ) : (
                  <img src={copyIcon} alt="" width={20} height={20} />
                )}
              </button>
            </div>
          </div>
        </li>
        <li className={styles.step}>
          <label className={card.title} htmlFor="role-arn">
            2. 고객사가 준 Role ARN을 입력해 주세요
          </label>
          <input
            id="role-arn"
            className={[styles.box, styles.input, error && styles.invalid]
              .filter(Boolean)
              .join(' ')}
            value={roleArn}
            placeholder="arn:aws:iam::123456789012:role/..."
            disabled={locked}
            aria-invalid={!!error}
            aria-describedby={error ? 'role-arn-error' : undefined}
            onChange={(event) => {
              setRoleArn(event.target.value)
              setError('')
            }}
          />
          {error && (
            <p id="role-arn-error" className={card.error}>
              {error}
            </p>
          )}
        </li>
      </ol>
      <button
        type="submit"
        className={[card.primaryButton, done && card.completed].filter(Boolean).join(' ')}
        disabled={locked || !roleArn.trim()}
      >
        {done ? '연결 완료' : isTesting ? '연결 테스트 중...' : '연결 테스트'}
      </button>
    </form>
  )
}
