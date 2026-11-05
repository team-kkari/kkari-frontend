interface ProConItemProps {
  text: string
  kind: 'pro' | 'con'
}

export function ProConItem({ text, kind }: ProConItemProps) {
  const isPro = kind === 'pro'
  return (
    <li className="flex w-full items-start gap-2.5 rounded-small border border-gray-10 bg-white px-3 py-2.5">
      <span
        aria-hidden
        className={`mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${
          isPro ? 'bg-main-60' : 'bg-red-20'
        }`}
      >
        {isPro ? '+' : '−'}
      </span>
      <span className="min-w-0 flex-1 text-[13px] leading-normal break-keep text-gray-100">
        {text}
      </span>
    </li>
  )
}
