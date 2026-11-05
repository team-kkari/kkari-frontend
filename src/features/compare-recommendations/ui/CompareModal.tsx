import { useEffect } from 'react'
import { SCORE_KEYS, SCORE_LABEL, ScoreDots, type Recommendation } from '@/entities/recommendation'
import { icons } from '@/shared/ui'

interface CompareModalProps {
  open: boolean
  recommendations: Recommendation[]
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
}

// 피그마 Table 컬럼 폭: 순위 64 / 아키텍처 240 / 점수 90×5 / 버튼 112
const COLS = 'grid grid-cols-[64px_240px_repeat(5,90px)_112px] items-center px-3'

export function CompareModal({
  open,
  recommendations,
  selectedId,
  onSelect,
  onClose,
}: CompareModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,18,20,0.45)]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
        className="flex flex-col gap-5 rounded-xlarge bg-white px-8 py-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5 leading-normal">
            <h2 id="compare-modal-title" className="m-0 text-xl font-semibold text-gray-100">
              추천 후보 비교
            </h2>
            <p className="m-0 text-sm text-gray-50">점수는 1~5점, 높을수록 좋아요</p>
          </div>
          <button
            type="button"
            aria-label="닫기"
            className="flex size-5 items-center justify-center border-0 bg-transparent p-0"
            onClick={onClose}
          >
            <img src={icons.close} alt="" width={20} height={20} />
          </button>
        </div>

        <div className="flex w-[878px] flex-col" role="table">
          <div role="row" className={`${COLS} rounded-small bg-gray-0 py-2.5`}>
            {['순위', '아키텍처', ...SCORE_KEYS.map((k) => SCORE_LABEL[k])].map((label) => (
              <span
                key={label}
                role="columnheader"
                className="text-[13px] font-medium text-gray-50"
              >
                {label}
              </span>
            ))}
            <span role="columnheader" />
          </div>

          {recommendations.map((rec) => {
            const selected = rec.id === selectedId
            return (
              <div
                key={rec.id}
                role="row"
                className={`${COLS} border-b border-gray-10 py-3.5 ${selected ? 'bg-main-10' : ''}`}
              >
                <span role="cell" className="text-sm text-gray-50">
                  {rec.rank}위
                </span>
                <span role="cell" className="text-sm font-medium text-gray-100">
                  {rec.title}
                </span>
                {SCORE_KEYS.map((key) => (
                  <span role="cell" key={key}>
                    <ScoreDots score={rec.scores[key]} />
                  </span>
                ))}
                <span role="cell">
                  {selected ? (
                    <span className="inline-flex h-9 items-center rounded-full bg-main-60 px-4 text-sm font-medium text-white">
                      보는 중
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex h-9 items-center rounded-full border border-gray-20 bg-white px-3.5 text-sm font-medium text-black hover:bg-gray-0"
                      onClick={() => onSelect(rec.id)}
                    >
                      보기
                    </button>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
