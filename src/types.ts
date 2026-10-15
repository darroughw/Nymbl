// Shape of staffing_data.json, as provided by Nymbl (Harbor & Pine sample data).
// These are the raw records. Derived values (load %, conflicts, match scores)
// live in src/lib, not here, because the raw data is the one thing in this
// app I'm not allowed to make up.

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contractor'

export interface Person {
  person_id: string
  name: string
  role: string
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead'
  employment_type: EmploymentType
  weekly_capacity_hours: number
  location: string
  timezone: string
  start_date: string
  contract_end_date: string | null
  skills: string[]
}

export type ProjectStatus =
  | 'Active'
  | 'Starting soon'
  | 'Wrapping up'
  | 'Proposed'
  | 'Internal'

export interface Project {
  project_id: string
  name: string
  client: string
  status: ProjectStatus
  priority: 'High' | 'Medium' | 'Low'
  start_date: string
  end_date: string
  win_probability_pct: number | null
  notes: string | null
}

export type AssignmentStatus = 'Confirmed' | 'Tentative'

export interface Assignment {
  assignment_id: string
  person_id: string
  project_id: string
  role_on_project: string
  allocation_pct: number
  start_date: string
  // Null in the source data for at least one row (A038). Treated as "no end
  // date on file," not "runs forever": see lib/capacity.ts.
  end_date: string | null
  status: AssignmentStatus
}

export type OpenRolePriority = 'Must fill' | 'Nice to fill' | 'If won'

export interface OpenRole {
  open_role_id: string
  project_id: string
  role_needed: string
  level: Person['level']
  skills_required: string[]
  allocation_pct: number
  start_date: string
  end_date: string
  priority: OpenRolePriority
  status: 'Open' | 'Filled'
}

export interface TimeOff {
  time_off_id: string
  person_id: string
  start_date: string
  end_date: string
  type: string
  status: 'Approved' | 'Requested'
}

export interface Holiday {
  date: string
  name: string
}

export interface HoursLogged {
  person_id: string
  project_id: string
  week_start: string
  hours: number
}

export interface StaffingData {
  as_of: string
  company: string
  people: Person[]
  projects: Project[]
  assignments: Assignment[]
  open_roles: OpenRole[]
  time_off: TimeOff[]
  holidays: Holiday[]
  hours_logged: HoursLogged[]
}
