import { icons } from '@/shared/ui'
import { MAX_SCORE } from '../model/types'

interface ScoreDotsProps {
  score: number
}

/** 비교 표의 점수 표시: 점 5개 + 숫자 */
export function ScoreDots({ score }: ScoreDotsProps) {
  return (
    <div className="flex items-center gap-1" aria-label={`${score}점`}>
      {Array.from({ length: MAX_SCORE }, (_, i) => (
        <img key={i} src={i < score ? icons.dotOn : icons.dotOff} alt="" width={8} height={8} />
      ))}
      <span className="text-[13px] font-medium text-gray-100">{score}</span>
    </div>
  )
}
