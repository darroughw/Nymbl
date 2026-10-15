import type { Candidate } from '../lib/matching'
import type { OpenRoleWithFill } from '../data/useStaffingStore'
import { Badge } from './Badge'
import { LoadBar } from './LoadBar'

export function CompareDrawer({
  role,
  candidates,
  onRemove,
  onAssign,
}: {
  role: OpenRoleWithFill
  candidates: Candidate[]
  onRemove: (personId: string) => void
  onAssign: (candidate: Candidate) => void
}) {
  if (candidates.length === 0) return null

  return (
    <section className="compare-drawer" aria-label="Compare candidates">
      <h3>Comparing {candidates.length}</h3>
      <div className="compare-drawer__cards">
        {candidates.map((c) => {
          const projectedPct = c.planLoad.confirmedPct + role.allocation_pct
          return (
            <article key={c.person.person_id} className="compare-card">
              <div className="compare-card__header">
                <h4>{c.person.name}</h4>
                <button
                  type="button"
                  className="button button--icon"
                  onClick={() => onRemove(c.person.person_id)}
                  aria-label={`Remove ${c.person.name} from comparison`}
                >
                  ×
                </button>
              </div>
              <p className="compare-card__role">
                {c.person.role}, {c.person.level}
              </p>

              <dl className="compare-card__facts">
                <div>
                  <dt>Skills matched</dt>
                  <dd>
                    {c.matchedSkills.length} / {c.matchedSkills.length + c.missingSkills.length}
                  </dd>
                </div>
                <div>
                  <dt>Load now → if assigned</dt>
                  <dd>
                    {c.planLoad.confirmedPct}% → {projectedPct}%
                  </dd>
                </div>
                <div>
                  <dt>Actually logging</dt>
                  <dd>{c.actual ? `${Math.round(c.actual.avgLoadPct)}%` : 'No data'}</dd>
                </div>
              </dl>

              <LoadBar pct={c.planLoad.confirmedPct} secondaryPct={projectedPct} />

              {c.conflicts.length > 0 && (
                <div className="candidate-row__flags">
                  {c.conflicts.map((f) => (
                    <Badge key={f.kind} tone={f.kind === 'time-off' ? 'warning' : 'danger'}>
                      {f.label}
                    </Badge>
                  ))}
                </div>
              )}

              <button type="button" className="button button--primary" onClick={() => onAssign(c)}>
                Assign {c.person.name.split(' ')[0]}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
