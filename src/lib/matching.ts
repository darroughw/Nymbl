import type { Assignment, HoursLogged, OpenRole, Person, TimeOff } from '../types'
import { actualLoad, planLoadDuringWindow, timeOffDuring } from './capacity'

const LEVEL_ORDER: Record<Person['level'], number> = {
  Junior: 0,
  Mid: 1,
  Senior: 2,
  Lead: 3,
}

export type LevelFit = 'exact' | 'above' | 'below'

export interface ConflictFlag {
  kind: 'not-started' | 'contract-ends-early' | 'time-off' | 'no-skills-on-file' | 'already-overallocated'
  label: string
}

export interface Candidate {
  person: Person
  matchedSkills: string[]
  missingSkills: string[]
  levelFit: LevelFit
  planLoad: { confirmedPct: number; confirmedAndTentativePct: number }
  actual: ReturnType<typeof actualLoad>
  availableConfirmedPct: number // headroom before this role, 100 - confirmedPct. Can go negative.
  conflicts: ConflictFlag[]
}

// Same-discipline only. A Resource Manager staffing a "Software Engineer"
// role isn't choosing between a designer and an engineer, that comparison
// doesn't exist in practice, and including it would just be noise standing
// between the RM and the seven people who actually qualify.
export function candidatesForRole(
  role: OpenRole,
  people: Person[],
  assignments: Assignment[],
  timeOff: TimeOff[],
  hoursLogged: HoursLogged[],
): Candidate[] {
  const pool = people.filter((p) => p.role === role.role_needed)

  const candidates = pool.map((person): Candidate => {
    const matchedSkills = role.skills_required.filter((s) => person.skills.includes(s))
    const missingSkills = role.skills_required.filter((s) => !person.skills.includes(s))

    const personLevel = LEVEL_ORDER[person.level]
    const roleLevel = LEVEL_ORDER[role.level]
    const levelFit: LevelFit = personLevel === roleLevel ? 'exact' : personLevel > roleLevel ? 'above' : 'below'

    const planLoad = planLoadDuringWindow(person.person_id, role.start_date, role.end_date, assignments)
    const actual = actualLoad(person.person_id, person, hoursLogged)
    const conflictTimeOff = timeOffDuring(person.person_id, role.start_date, role.end_date, timeOff)

    const conflicts: ConflictFlag[] = []
    if (person.start_date > role.start_date) {
      conflicts.push({ kind: 'not-started', label: `Starts ${person.start_date}, after this role begins` })
    }
    if (person.contract_end_date && person.contract_end_date < role.end_date) {
      conflicts.push({
        kind: 'contract-ends-early',
        label: `Contract ends ${person.contract_end_date}, before this role ends`,
      })
    }
    const approvedTimeOff = conflictTimeOff.filter((t) => t.status === 'Approved')
    if (approvedTimeOff.length > 0) {
      conflicts.push({
        kind: 'time-off',
        label: `Approved ${approvedTimeOff[0].type.toLowerCase()} ${approvedTimeOff[0].start_date} to ${approvedTimeOff[0].end_date}`,
      })
    }
    if (person.skills.length === 0) {
      conflicts.push({ kind: 'no-skills-on-file', label: 'No skills on file: match is unverified' })
    }
    if (planLoad.confirmedPct > 100) {
      conflicts.push({ kind: 'already-overallocated', label: `Already at ${planLoad.confirmedPct}% before this role` })
    }

    return {
      person,
      matchedSkills,
      missingSkills,
      levelFit,
      planLoad,
      actual,
      availableConfirmedPct: 100 - planLoad.confirmedPct,
      conflicts,
    }
  })

  // Sort by what actually determines fitness, in the order an RM would
  // reason about it: can they do the work, do they have room, is the level
  // right. No single blended score, a score would hide which of those
  // three is doing the work in any given ranking, and that's exactly the
  // kind of guessing this screen exists to remove.
  return candidates.sort((a, b) => {
    if (a.matchedSkills.length !== b.matchedSkills.length) {
      return b.matchedSkills.length - a.matchedSkills.length
    }
    if (a.availableConfirmedPct !== b.availableConfirmedPct) {
      return b.availableConfirmedPct - a.availableConfirmedPct
    }
    const fitRank: Record<LevelFit, number> = { exact: 0, above: 1, below: 2 }
    return fitRank[a.levelFit] - fitRank[b.levelFit]
  })
}
