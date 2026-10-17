import { useMemo, useRef, useState } from 'react'
import { useStaffingStore } from './data/useStaffingStore'
import { candidatesForRole, type Candidate } from './lib/matching'
import { OpenRolesList } from './components/OpenRolesList'
import { RoleDetail } from './components/RoleDetail'
import { CandidateTable } from './components/CandidateTable'
import { CompareDrawer } from './components/CompareDrawer'
import { AssignDialog, type OverlapRow } from './components/AssignDialog'
import { RoleFilledPanel } from './components/RoleFilledPanel'
import { SpadeIcon } from './components/SpadeIcon'
import { ThemeToggle } from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'

function App() {
  const store = useStaffingStore()
  const { people, projects, assignments, timeOff, hoursLogged, openRoles, assignPerson, unassign } = store
  const { theme, toggle: toggleTheme } = useTheme()

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(openRoles[0]?.open_role_id ?? null)
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set())
  const [assignTarget, setAssignTarget] = useState<Candidate | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const filledHeadingRef = useRef<HTMLHeadingElement>(null)

  const selectedRole = openRoles.find((r) => r.open_role_id === selectedRoleId) ?? null
  const selectedProject = projects.find((p) => p.project_id === selectedRole?.project_id)

  const candidates = useMemo(() => {
    if (!selectedRole || selectedRole.fill) return []
    return candidatesForRole(selectedRole, people, assignments, timeOff, hoursLogged)
  }, [selectedRole, people, assignments, timeOff, hoursLogged])

  const compareList = candidates.filter((c) => compareIds.has(c.person.person_id))

  function handleSelectRole(roleId: string) {
    setSelectedRoleId(roleId)
    setCompareIds(new Set())
  }

  function toggleCompare(personId: string) {
    setCompareIds((prev) => {
      const next = new Set(prev)
      if (next.has(personId)) next.delete(personId)
      else if (next.size < 3) next.add(personId)
      return next
    })
  }

  function openAssignDialog(candidate: Candidate) {
    setAssignTarget(candidate)
  }

  function closeAssignDialog() {
    setAssignTarget(null)
  }

  function confirmAssign() {
    if (!selectedRole || !assignTarget) return
    assignPerson(selectedRole, assignTarget.person)
    setLiveMessage(`${assignTarget.person.name} assigned to ${selectedRole.role_needed} on ${selectedProject?.name}.`)
    setAssignTarget(null)
    setCompareIds(new Set())
    // The row that triggered this dialog is about to disappear: the role
    // just became "filled," and that panel replaces the candidate table.
    // Native focus-return-to-trigger has nothing to return to once that
    // happens, so this moves focus explicitly instead of leaving it to fall
    // back to <body>.
    requestAnimationFrame(() => filledHeadingRef.current?.focus())
  }

  function handleUnassign() {
    if (!selectedRole) return
    const personName = people.find((p) => p.person_id === selectedRole.fill?.personId)?.name
    unassign(selectedRole)
    setLiveMessage(`${personName ?? 'Assignment'} removed. ${selectedRole.role_needed} is open again.`)
  }

  const overlapRows: OverlapRow[] = useMemo(() => {
    if (!assignTarget || !selectedRole) return []
    return assignments
      .filter((a) => a.person_id === assignTarget.person.person_id)
      .filter((a) => {
        const overlapsStart = a.end_date === null || a.end_date >= selectedRole.start_date
        const overlapsEnd = a.start_date <= selectedRole.end_date
        return overlapsStart && overlapsEnd
      })
      .map((a) => ({
        projectName: projects.find((p) => p.project_id === a.project_id)?.name ?? a.project_id,
        allocationPct: a.allocation_pct,
        status: a.status,
      }))
  }, [assignTarget, selectedRole, assignments, projects])

  const filledByPerson = selectedRole?.fill ? people.find((p) => p.person_id === selectedRole.fill!.personId) : null

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-brand" aria-hidden="true">
            <SpadeIcon className="app-brand__mark" width={14} height={17} />
            <span>Rounders</span>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <h1>{store.company}</h1>
        <p>Staffing a new role · today is {store.asOf}</p>
      </header>

      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <main className="app-layout">
        <nav className="app-layout__roles" aria-label="Open roles navigation">
          <OpenRolesList roles={openRoles} projects={projects} selectedId={selectedRoleId} onSelect={handleSelectRole} />
        </nav>

        <section className="app-layout__workspace">
          {!selectedRole ? (
            <p className="empty-state">Select an open role to see who could fill it.</p>
          ) : (
            <>
              <RoleDetail role={selectedRole} project={selectedProject} />

              {filledByPerson ? (
                <RoleFilledPanel ref={filledHeadingRef} person={filledByPerson} onUnassign={handleUnassign} />
              ) : (
                <>
                  <CandidateTable
                    role={selectedRole}
                    candidates={candidates}
                    compareIds={compareIds}
                    onToggleCompare={toggleCompare}
                    onAssign={openAssignDialog}
                  />
                  <CompareDrawer
                    role={selectedRole}
                    candidates={compareList}
                    onRemove={toggleCompare}
                    onAssign={openAssignDialog}
                  />
                </>
              )}
            </>
          )}
        </section>
      </main>

      <AssignDialog
        open={assignTarget !== null}
        candidate={assignTarget}
        role={selectedRole}
        project={selectedProject}
        overlaps={overlapRows}
        onConfirm={confirmAssign}
        onCancel={closeAssignDialog}
      />
    </div>
  )
}

export default App
