import { useEffect, useRef } from 'react'
import type { Candidate } from '../lib/matching'
import type { OpenRoleWithFill } from '../data/useStaffingStore'
import type { Project } from '../types'
import { LoadBar } from './LoadBar'

export interface OverlapRow {
  projectName: string
  allocationPct: number
  status: 'Confirmed' | 'Tentative'
}

// <dialog> instead of a hand-rolled modal div. It gets focus trapping,
// Escape-to-close, and returning focus to the trigger for free, from the
// browser, correctly, on every platform screen reader combination. That's
// more than I'd trust a bespoke focus trap to get right in this amount of
// time. Use the platform when the platform already does the job.
export function AssignDialog({
  open,
  candidate,
  role,
  project,
  overlaps,
  onConfirm,
  onCancel,
}: {
  open: boolean
  candidate: Candidate | null
  role: OpenRoleWithFill | null
  project: Project | undefined
  overlaps: OverlapRow[]
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // Tested this in the browser: pressing Escape closed the dialog natively,
  // but React's state never heard about it, so the two went out of sync and
  // a second Escape (or any re-render) reopened it. React's JSX onCancel
  // prop doesn't reliably bind to <dialog>'s native "cancel" event. Wiring
  // the listener by hand and routing it through the same onCancel the
  // Cancel button uses is what actually keeps state and DOM in agreement.
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onCancel()
    }
    el.addEventListener('cancel', handleCancel)
    return () => el.removeEventListener('cancel', handleCancel)
  }, [onCancel])

  const before = overlaps.reduce((sum, o) => sum + o.allocationPct, 0)
  const after = before + (role?.allocation_pct ?? 0)
  const willOverallocate = after > 100
  const resultingStatus: 'Confirmed' | 'Tentative' = role?.priority === 'If won' ? 'Tentative' : 'Confirmed'

  return (
    <dialog ref={dialogRef} className="assign-dialog" aria-labelledby="assign-dialog-title">
      {candidate && role && (
        <>
          <h2 id="assign-dialog-title">
            Assign {candidate.person.name} to {role.role_needed}
          </h2>
          <p className="assign-dialog__subtitle">
            {project?.name}, {role.start_date} to {role.end_date}
          </p>

          {resultingStatus === 'Tentative' && (
            <div className="callout callout--warning" role="note">
              {project?.name} hasn't closed. This records a <strong>Tentative</strong> assignment: it shows up as
              load but won't become real work unless the project is won.
            </div>
          )}

          <h3>Load during this window</h3>
          <ul className="assign-dialog__overlap-list">
            {overlaps.map((o, i) => (
              <li key={i}>
                <span>{o.projectName}</span>
                <span>
                  {o.allocationPct}% {o.status === 'Tentative' ? '(Tentative)' : ''}
                </span>
              </li>
            ))}
            <li className="assign-dialog__overlap-new">
              <span>{role.role_needed} (new)</span>
              <span>{role.allocation_pct}%</span>
            </li>
          </ul>

          <div className="assign-dialog__totals">
            <div>
              <span>Before</span>
              <LoadBar pct={before} />
              <span>{before}%</span>
            </div>
            <div>
              <span>After</span>
              <LoadBar pct={after} />
              <span>{after}%</span>
            </div>
          </div>

          {willOverallocate && (
            <div className="callout callout--danger" role="alert">
              This puts {candidate.person.name.split(' ')[0]} at {after}%, {after - 100} points over capacity. You
              can still commit this. Some overallocation is a real, temporary choice, but it won't be invisible.
            </div>
          )}

          <div className="assign-dialog__actions">
            <button type="button" className="button button--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="button button--primary" onClick={onConfirm}>
              Confirm assignment
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}
