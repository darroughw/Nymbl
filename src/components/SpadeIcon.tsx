// The Rounders mark, reused as a decorative corner pip across the role
// cards, candidate cards, and the app header badge. Centralized here so a
// future tweak to the shape only has to happen once.
export function SpadeIcon({
  width = 14,
  height,
  className,
}: {
  width?: number
  height?: number
  className?: string
}) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 200 240" width={width} height={height ?? width * 1.2}>
      <path
        fill="currentColor"
        d="M100 16C132 52 184 92 184 132C184 164 156 180 128 168C116 163 106 154 100 160C94 154 84 163 72 168C44 180 16 164 16 132C16 92 68 52 100 16ZM100 160L116 196H84L100 160Z"
      />
    </svg>
  )
}
