import type { Assignment, HoursLogged, Person, TimeOff } from '../types'
import { overlaps } from './dates'

export interface LoadResult {
  /** Sum of allocation_pct across Confirmed assignments overlapping the window. */
  confirmedPct: number
  /** Same, but Confirmed + Tentative. Shown separately, never merged silently,
   * a Tentative assignment is a bet on a Proposed project closing, not a fact. */
  confirmedAndTentativePct: number
}

// Allocation during a date window, not "right now." A role rarely starts
// today, so the question that matters is "what does this person's plate
// look like during the weeks this role actually runs," which means summing
// every assignment whose range overlaps the role's range, not just the
// ones active on a single as-of date.
export function planLoadDuringWindow(
  personId: string,
  windowStart: string,
  windowEnd: string,
  assignments: Assignment[],
): LoadResult {
  const relevant = assignments.filter(
    (a) => a.person_id === personId && overlaps(a.start_date, a.end_date, windowStart, windowEnd),
  )
  const confirmedPct = relevant
    .filter((a) => a.status === 'Confirmed')
    .reduce((sum, a) => sum + a.allocation_pct, 0)
  const confirmedAndTentativePct = relevant.reduce((sum, a) => sum + a.allocation_pct, 0)
  return { confirmedPct, confirmedAndTentativePct }
}

export interface ActualLoad {
  avgWeeklyHours: number
  avgLoadPct: number
  weeksOfData: number
}

// What someone actually logged, last four weeks, averaged. This is the
// other half of the story planLoadDuringWindow can't tell: a person can be
// booked at 60% on paper and still be the one person visibly drowning.
// Returns null when there's nothing logged for them at all, that's a
// distinct state from "logged zero," and the UI needs to say so plainly
// instead of quietly rendering a 0% bar.
export function actualLoad(personId: string, person: Person, hoursLogged: HoursLogged[]): ActualLoad | null {
  const rows = hoursLogged.filter((h) => h.person_id === personId)
  if (rows.length === 0) return null

  const weeks = new Map<string, number>()
  for (const row of rows) {
    weeks.set(row.week_start, (weeks.get(row.week_start) ?? 0) + row.hours)
  }
  const totalHours = [...weeks.values()].reduce((sum, h) => sum + h, 0)
  const weeksOfData = weeks.size
  const avgWeeklyHours = totalHours / weeksOfData
  const avgLoadPct = (avgWeeklyHours / person.weekly_capacity_hours) * 100

  return { avgWeeklyHours, avgLoadPct, weeksOfData }
}

// Approved time off is a hard conflict for a window; Requested is a flag,
// not a block, it hasn't happened yet and might not. Collapsing those two
// into one "unavailable" bucket would hide a decision the RM still gets to
// make.
export function timeOffDuring(
  personId: string,
  windowStart: string,
  windowEnd: string,
  timeOff: TimeOff[],
): TimeOff[] {
  return timeOff.filter(
    (t) => t.person_id === personId && overlaps(t.start_date, t.end_date, windowStart, windowEnd),
  )
}
