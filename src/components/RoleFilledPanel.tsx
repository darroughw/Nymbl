import { forwardRef } from 'react'
import type { Person } from '../types'
import { Badge } from './Badge'

// Filling a role doesn't end the story, it starts a new, smaller one:
// "who's in it, and can I undo this." Keeping that answer on the same
// screen (instead of a toast that vanishes) is what "state always visible"
// means in practice here.
export const RoleFilledPanel = forwardRef<HTMLHeadingElement, { person: Person; onUnassign: () => void }>(
  function RoleFilledPanel({ person, onUnassign }, ref) {
    return (
      <div className="role-filled-panel">
        <h3 ref={ref} tabIndex={-1}>
          <Badge tone="success">Filled</Badge> {person.name}
        </h3>
        <p>
          {person.role}, {person.level}, {person.location}
        </p>
        <button type="button" className="button button--secondary" onClick={onUnassign}>
          Undo, reopen this role
        </button>
      </div>
    )
  },
)
