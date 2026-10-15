import type { Candidate } from '../lib/matching'
import type { OpenRoleWithFill } from '../data/useStaffingStore'
import { Badge } from './Badge'
import { LoadBar } from './LoadBar'

const LEVEL_FIT_LABEL = { exact: 'Right level', above: 'More senior than asked', below: 'Less senior than asked' }

export function CandidateTable({
  role,
  candidates,
  compareIds,
  onToggleCompare,
  onAssign,
}: {
  role: OpenRoleWithFill
  candidates: Candidate[]
  compareIds: Set<string>
  onToggleCompare: (personId: string) => void
  onAssign: (candidate: Candidate) => void
}) {
  if (candidates.length === 0) {
    // Nobody with this job title exists in the practice at all. That's a
    // different problem than "nobody's available," and it needs a
    // different next step — the RM should go recruit or borrow from
    // another practice, not keep staring at an empty table waiting for an
    // option to appear.
    return (
      <p className="empty-state">
        No one in this practice holds the "{role.role_needed}" title. This role needs a hire or a loan from
        another practice — there's no one here to compare.
      </p>
    )
  }

  return (
    <ul className="candidate-list" aria-label={`Candidates for ${role.role_needed}`}>
      {candidates.map((c) => {
        const projectedPct = c.planLoad.confirmedPct + role.allocation_pct
        const hasHardConflict = c.conflicts.some(
          (f) => f.kind === 'not-started' || f.kind === 'contract-ends-early',
        )
        const actualDivergesALot =
          c.actual !== null && Math.abs(c.actual.avgLoadPct - c.planLoad.confirmedPct) >= 15
        const isSelected = compareIds.has(c.person.person_id)
        const isAtCompareCap = !isSelected && compareIds.size >= 3

        return (
          <li key={c.person.person_id} className="candidate-row">
            <label className="candidate-row__select">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isAtCompareCap}
                onChange={() => onToggleCompare(c.person.person_id)}
                aria-label={isSelected ? `Remove ${c.person.name} from comparison` : `Add ${c.person.name} to comparison`}
                title={isAtCompareCap ? 'Compare holds up to 3 — remove one to add another' : undefined}
              />
            </label>

            <div className="candidate-row__main">
              <div className="candidate-row__name-line">
                <span className="candidate-row__name">{c.person.name}</span>
                <Badge tone={c.levelFit === 'exact' ? 'success' : 'neutral'}>{c.person.level}</Badge>
                {c.levelFit !== 'exact' && (
                  <span className="candidate-row__level-note">{LEVEL_FIT_LABEL[c.levelFit]}</span>
                )}
              </div>

              {role.skills_required.length > 0 && (
                <div className="chip-row">
                  {c.matchedSkills.map((s) => (
                    <span key={s} className="chip chip--match">
                      {s}
                    </span>
                  ))}
                  {c.missingSkills.map((s) => (
                    <span key={s} className="chip chip--missing">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="candidate-row__load">
                <LoadBar pct={c.planLoad.confirmedPct} secondaryPct={projectedPct} />
                <span className="candidate-row__load-label">
                  {c.planLoad.confirmedPct}% booked during this window
                  {c.planLoad.confirmedAndTentativePct > c.planLoad.confirmedPct &&
                    ` (+${c.planLoad.confirmedAndTentativePct - c.planLoad.confirmedPct}% tentative)`}
                  {' · '}
                  {projectedPct}% if assigned here
                </span>
                {c.actual === null ? (
                  <span className="candidate-row__actual candidate-row__actual--muted">No hours logged yet</span>
                ) : actualDivergesALot ? (
                  <span className="candidate-row__actual candidate-row__actual--warning">
                    Actually logging {Math.round(c.actual.avgLoadPct)}% lately, not {c.planLoad.confirmedPct}%
                  </span>
                ) : null}
              </div>

              {c.conflicts.length > 0 && (
                <div className="candidate-row__flags">
                  {c.conflicts.map((f) => (
                    <Badge key={f.kind} tone={f.kind === 'time-off' ? 'warning' : 'danger'}>
                      {f.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="button button--secondary"
              onClick={() => onAssign(c)}
              disabled={hasHardConflict}
              title={hasHardConflict ? 'Resolve the conflict above before assigning' : undefined}
            >
              Assign
            </button>
          </li>
        )
      })}
    </ul>
  )
}
