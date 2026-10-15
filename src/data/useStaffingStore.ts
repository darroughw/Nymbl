import { useCallback, useMemo, useState } from 'react'
import { staffingData } from './loadData'
import type { Assignment, OpenRole, Person } from '../types'

interface RoleFill {
  assignmentId: string
  personId: string
  filledAt: number
}

export interface OpenRoleWithFill extends OpenRole {
  fill: RoleFill | null
}

// Everything here is session-only. There's no backend, which the brief says
// is fine, but it means a page refresh forgets every assignment made. That
// trade is explicit, not an oversight — see the AI log.
export function useStaffingStore() {
  const [addedAssignments, setAddedAssignments] = useState<Assignment[]>([])
  const [fills, setFills] = useState<Record<string, RoleFill>>({})

  const assignments = useMemo(
    () => [...staffingData.assignments, ...addedAssignments],
    [addedAssignments],
  )

  const openRoles = useMemo<OpenRoleWithFill[]>(
    () => staffingData.open_roles.map((role) => ({ ...role, fill: fills[role.open_role_id] ?? null })),
    [fills],
  )

  // A role tied to a Proposed project only becomes real work if the project
  // closes. Filling it should produce a Tentative assignment, same status
  // the existing data already uses for exactly this situation (A007, A012
  // against the same PRJ-07) — not a Confirmed one that overstates what's
  // actually been committed.
  const assignPerson = useCallback(
    (role: OpenRole, person: Person) => {
      const assignmentId = `A-NEW-${addedAssignments.length + 1}`
      const status: Assignment['status'] = role.priority === 'If won' ? 'Tentative' : 'Confirmed'
      const assignment: Assignment = {
        assignment_id: assignmentId,
        person_id: person.person_id,
        project_id: role.project_id,
        role_on_project: role.role_needed,
        allocation_pct: role.allocation_pct,
        start_date: role.start_date,
        end_date: role.end_date,
        status,
      }
      setAddedAssignments((prev) => [...prev, assignment])
      setFills((prev) => ({
        ...prev,
        [role.open_role_id]: { assignmentId, personId: person.person_id, filledAt: Date.now() },
      }))
      return assignment
    },
    [addedAssignments.length],
  )

  const unassign = useCallback((role: OpenRole) => {
    const fill = fills[role.open_role_id]
    if (!fill) return
    setAddedAssignments((prev) => prev.filter((a) => a.assignment_id !== fill.assignmentId))
    setFills((prev) => {
      const next = { ...prev }
      delete next[role.open_role_id]
      return next
    })
  }, [fills])

  return {
    people: staffingData.people,
    projects: staffingData.projects,
    timeOff: staffingData.time_off,
    holidays: staffingData.holidays,
    hoursLogged: staffingData.hours_logged,
    asOf: staffingData.as_of,
    company: staffingData.company,
    assignments,
    openRoles,
    assignPerson,
    unassign,
  }
}
