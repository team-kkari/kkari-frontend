import { Fragment, useMemo } from 'react'
import { segmentText } from '../lib/segment'
import { TermTooltip } from './TermTooltip'

/** 문장 속 전문 용어에 밑줄 + 호버 설명을 붙여서 렌더링 */
export function GlossaryText({ text }: { text: string }) {
  const segments = useMemo(() => segmentText(text), [text])
  return (
    <>
      {segments.map((seg, i) =>
        seg.term ? (
          <TermTooltip key={i} term={seg.term}>
            {seg.text}
          </TermTooltip>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        ),
      )}
    </>
  )
}
