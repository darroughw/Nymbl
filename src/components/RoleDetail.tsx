import type { Project } from '../types'
import type { OpenRoleWithFill } from '../data/useStaffingStore'
import { Badge } from './Badge'

export function RoleDetail({ role, project }: { role: OpenRoleWithFill; project: Project | undefined }) {
  // A role on a Proposed project isn't staffing work yet — it's a bet. Say
  // that out loud here instead of letting the RM discover it three clicks
  // later when the "Confirmed" assignment they just made turns out to
  // depend on a client decision that hasn't happened.
  const isContingent = project?.status === 'Proposed'

  return (
    <div className="role-detail">
      <div className="role-detail__header">
        <h2>
          {role.role_needed} <span className="role-detail__level">· {role.level}</span>
        </h2>
        <div className="role-detail__project">
          {project?.name ?? role.project_id} — {project?.client}
        </div>
      </div>

      {isContingent && (
        <div className="callout callout--warning" role="note">
          <strong>{project?.name}</strong> is Proposed, not signed. Win probability{' '}
          {project?.win_probability_pct}%. Decision expected per project notes. Filling this role records a{' '}
          <strong>Tentative</strong> assignment, not a committed one.
        </div>
      )}

      <dl className="role-detail__facts">
        <div>
          <dt>Allocation needed</dt>
          <dd>{role.allocation_pct}%</dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd>
            {role.start_date} to {role.end_date}
          </dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>
            <Badge tone={role.priority === 'Must fill' ? 'danger' : role.priority === 'If won' ? 'neutral' : 'info'}>
              {role.priority}
            </Badge>
          </dd>
        </div>
      </dl>

      {role.skills_required.length > 0 && (
        <div className="role-detail__skills">
          <span className="role-detail__skills-label">Skills needed</span>
          <div className="chip-row">
            {role.skills_required.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
