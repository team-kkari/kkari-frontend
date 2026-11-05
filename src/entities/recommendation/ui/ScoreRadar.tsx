import { MAX_SCORE, SCORE_KEYS, SCORE_LABEL, type ScoreKey, type Scores } from '../model/types'

interface ScoreRadarProps {
  scores: Scores
  /** 강조할 축 (피그마에선 우선순위 1순위인 '비용') */
  highlight?: ScoreKey
}

// 피그마 Score radar 프레임(180×180, 중심 90,90, 반지름 76) 기준 좌표
const SIZE = 180
const CENTER = SIZE / 2
const RADIUS = 76

function point(axis: number, value: number) {
  const angle = -Math.PI / 2 + (axis * 2 * Math.PI) / SCORE_KEYS.length
  const r = (RADIUS * value) / MAX_SCORE
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) }
}

const toPath = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join('') + 'Z'

// 라벨 위치 (Score radar 프레임 안의 절대 좌표, 피그마 값 그대로)
const LABEL_POSITION: Record<ScoreKey, { left: number; top: number }> = {
  cost: { left: 179, top: 10 },
  performance: { left: 281, top: 72 },
  reliability: { left: 244, top: 183 },
  operations: { left: 109, top: 183 },
  migration: { left: 72, top: 72 },
}

export function ScoreRadar({ scores, highlight = 'cost' }: ScoreRadarProps) {
  const values = SCORE_KEYS.map((key, i) => point(i, scores[key]))

  return (
    <div className="relative mx-auto h-[213px] w-[390px] shrink-0">
      <svg
        className="absolute top-[23px] left-[105px]"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        fill="none"
        role="img"
        aria-label={SCORE_KEYS.map((k) => `${SCORE_LABEL[k]} ${scores[k]}점`).join(', ')}
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <path
            key={level}
            d={toPath(SCORE_KEYS.map((_, i) => point(i, level)))}
            stroke="var(--color-gray-10)"
          />
        ))}
        {SCORE_KEYS.map((_, i) => {
          const p = point(i, MAX_SCORE)
          return (
            <path key={i} d={`M${CENTER} ${CENTER}L${p.x} ${p.y}`} stroke="var(--color-gray-10)" />
          )
        })}
        <path
          d={toPath(values)}
          fill="var(--color-main-50)"
          fillOpacity={0.18}
          stroke="var(--color-main-50)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {values.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--color-main-50)" />
        ))}
      </svg>
      {SCORE_KEYS.map((key) => (
        <span
          key={key}
          className={`absolute text-[13px] leading-none whitespace-nowrap ${
            key === highlight ? 'font-medium text-main-60' : 'text-gray-50'
          }`}
          style={LABEL_POSITION[key]}
        >
          {SCORE_LABEL[key]} {scores[key]}
        </span>
      ))}
    </div>
  )
}
