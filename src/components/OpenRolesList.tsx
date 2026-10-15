import type { Project } from '../types'
import type { OpenRoleWithFill } from '../data/useStaffingStore'
import { Badge } from './Badge'

const PRIORITY_ORDER = { 'Must fill': 0, 'Nice to fill': 1, 'If won': 2 } as const

const PRIORITY_TONE = {
  'Must fill': 'danger',
  'Nice to fill': 'info',
  'If won': 'neutral',
} as const

export function OpenRolesList({
  roles,
  projects,
  selectedId,
  onSelect,
}: {
  roles: OpenRoleWithFill[]
  projects: Project[]
  selectedId: string | null
  onSelect: (roleId: string) => void
}) {
  const projectById = new Map(projects.map((p) => [p.project_id, p]))

  // Must-fill work comes first on purpose — it's the work with no backup
  // plan if it stays empty. Filled roles stay in the list instead of
  // disappearing: a role that was just filled is still a fact worth seeing,
  // and yanking it out from under the RM the moment they act on it is how
  // you lose someone's place in the list.
  const sorted = [...roles].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  if (sorted.length === 0) {
    return <p className="empty-state">No open roles right now. Every seat on every active project is filled.</p>
  }

  return (
    <ul className="role-list" aria-label="Open roles">
      {sorted.map((role) => {
        const project = projectById.get(role.project_id)
        const isSelected = role.open_role_id === selectedId
        return (
          <li key={role.open_role_id}>
            <button
              type="button"
              className={`role-list__item${isSelected ? ' role-list__item--selected' : ''}${role.fill ? ' role-list__item--filled' : ''}`}
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => onSelect(role.open_role_id)}
            >
              <div className="role-list__item-top">
                <span className="role-list__role">{role.role_needed}</span>
                <Badge tone={role.fill ? 'success' : PRIORITY_TONE[role.priority]}>
                  {role.fill ? 'Filled' : role.priority}
                </Badge>
              </div>
              <div className="role-list__project">{project?.name ?? role.project_id}</div>
              <div className="role-list__meta">
                {role.level} · {role.allocation_pct}% · starts {role.start_date}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
