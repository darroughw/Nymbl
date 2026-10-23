import { useEffect, useRef, type ReactNode } from 'react'
import { Badge } from './Badge'
import { LoadBar } from './LoadBar'
import { SpadeIcon } from './SpadeIcon'

// The legend renders the real Badge, LoadBar, and chip components rather
// than pictures of them, so a change to how any of them looks shows up
// here automatically instead of leaving a stale key behind.
function Row({ sample, children }: { sample: ReactNode; children: ReactNode }) {
  return (
    <li className="help-dialog__row">
      <div className="help-dialog__sample">{sample}</div>
      <div className="help-dialog__desc">{children}</div>
    </li>
  )
}

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // Same native-cancel wiring as AssignDialog: without it, Escape closes the
  // <dialog> but React state still thinks it's open.
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    el.addEventListener('cancel', handleCancel)
    return () => el.removeEventListener('cancel', handleCancel)
  }, [onClose])

  return (
    <dialog ref={dialogRef} className="assign-dialog help-dialog" aria-labelledby="help-dialog-title">
      <div className="help-dialog__header">
        <h2 id="help-dialog-title">How to read this screen</h2>
        <button type="button" className="button button--icon" onClick={onClose} aria-label="Close help">
          ×
        </button>
      </div>

      <h3>Load bars</h3>
      <ul className="help-dialog__list">
        <Row sample={<LoadBar pct={50} />}>
          <strong>Under 85%:</strong> booked for confirmed work during this role's window. Room to take more.
        </Row>
        <Row sample={<LoadBar pct={90} />}>
          <strong>85% to 99%:</strong> nearly full.
        </Row>
        <Row sample={<LoadBar pct={115} />}>
          <strong>100% or more:</strong> at or over capacity. The hatched tail past the end shows how far over.
        </Row>
        <Row sample={<LoadBar pct={40} secondaryPct={90} />}>
          <strong>Vertical marker:</strong> where their load lands if you assign them to this role.
        </Row>
      </ul>

      <h3>Skills</h3>
      <ul className="help-dialog__list">
        <Row sample={<span className="chip">React</span>}>A skill the role asks for.</Row>
        <Row sample={<span className="chip chip--match">React</span>}>The candidate has this skill.</Row>
        <Row sample={<span className="chip chip--missing">React</span>}>The candidate is missing this skill.</Row>
      </ul>

      <h3>Badges</h3>
      <ul className="help-dialog__list">
        <Row sample={<Badge tone="success">Senior</Badge>}>
          The candidate's level. When it doesn't match the role, a note under the name says "More senior than asked"
          or "Less senior than asked."
        </Row>
        <Row sample={<Badge tone="danger">Must fill</Badge>}>Priority: no backup plan if this seat stays empty.</Row>
        <Row sample={<Badge tone="info">Nice to fill</Badge>}>Priority: wanted, but the project can run without it.</Row>
        <Row sample={<Badge tone="neutral">If won</Badge>}>
          Priority: only needed if the project is won. Filling it records a Tentative assignment.
        </Row>
        <Row sample={<Badge tone="success">Filled</Badge>}>Someone has been assigned to this role.</Row>
      </ul>

      <h3>Flags</h3>
      <ul className="help-dialog__list">
        <Row sample={<Badge tone="warning">Approved vacation</Badge>}>
          Time off during the window. You can still assign them.
        </Row>
        <Row sample={<Badge tone="danger">Contract ends</Badge>}>
          A start date or contract end falls outside the window. Assign stays disabled until it's resolved. The same
          dark flag also mark people who are already over capacity or have no skills on file.
        </Row>
        <Row sample={<span className="candidate-card__actual candidate-card__actual--warning">Actually logging 70%</span>}>
          Their logged hours differ from their planned load by 15 points or more. Trust the logged number.
        </Row>
      </ul>

      <h3>Card marks</h3>
      <ul className="help-dialog__list">
        <Row
          sample={
            <span className="compare-card__index help-dialog__index">
              <span>S</span>
              <SpadeIcon width={9} height={11} />
            </span>
          }
        >
          On compare cards, the first letter of the candidate's level.
        </Row>
        <Row sample={<SpadeIcon width={13} height={15.6} className="help-dialog__pip" />}>
          Faint spades in card corners are decoration only.
        </Row>
      </ul>

      <div className="assign-dialog__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </dialog>
  )
}
