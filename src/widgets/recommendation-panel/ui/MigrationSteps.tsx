interface MigrationStepsProps {
  steps: string[]
}

export function MigrationSteps({ steps }: MigrationStepsProps) {
  return (
    <ol className="m-0 flex w-full list-none flex-col gap-2 p-0">
      {steps.map((step, i) => (
        <li
          key={step}
          className="flex items-start gap-2.5 rounded-small border border-gray-10 bg-white px-3 py-2.5"
        >
          <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-main-10 text-xs font-semibold text-main-60">
            {i + 1}
          </span>
          <span className="text-[13px] leading-normal break-keep text-gray-100">{step}</span>
        </li>
      ))}
    </ol>
  )
}
