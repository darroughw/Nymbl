// One visual grammar for "how full is this person," reused everywhere a load
// shows up: the candidate table, compare, the assign-impact preview. If the
// bar looked different in each place, an RM would have to re-learn what
// full means every time, the opposite of "speed as a feature."
export function LoadBar({
  pct,
  secondaryPct,
  label,
}: {
  /** Primary fill, usually the confirmed plan load. */
  pct: number
  /** Optional second marker, e.g. "including this new role" or "actual logged." */
  secondaryPct?: number
  label?: string
}) {
  const clampedPct = Math.max(0, Math.min(pct, 100))
  const overflow = Math.max(0, pct - 100)
  const tone = pct >= 100 ? 'danger' : pct >= 85 ? 'warning' : 'success'

  return (
    <div className="load-bar" aria-hidden="true">
      <div className="load-bar__track">
        <div className={`load-bar__fill load-bar__fill--${tone}`} style={{ width: `${clampedPct}%` }} />
        {overflow > 0 && <div className="load-bar__overflow" style={{ width: `${Math.min(overflow, 40)}%` }} />}
        {secondaryPct !== undefined && (
          <div className="load-bar__marker" style={{ left: `${Math.min(secondaryPct, 100)}%` }} />
        )}
      </div>
      {label && <span className="load-bar__label">{label}</span>}
    </div>
  )
}
