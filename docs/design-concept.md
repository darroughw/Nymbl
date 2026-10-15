# Design concept — the staffing flow

Surface B. A Resource Manager picks an open role, sees who could fill it, compares options, assigns someone, and sees the impact before committing.

This doc is the annotated wireframe the brief asks for. I built it as the working prototype instead of a separate static mockup, on purpose: the brief's own framing is "what ships is what matters, not the mockups," and a second artifact that isn't the real component tree would just be a second place for these decisions to drift out of sync with the code. Run it (`npm run dev`) to see every state below live. Screens referenced by component: [src/App.tsx](../src/App.tsx), [src/components/](../src/components/).

Grayscale SVG wireframes for all six flows live in [docs/wireframes/](wireframes/). The three core screens (landing/triage, decision/ranking, commit/impact) are also built in Figma from real **Material 3 Design Kit** component instances — [Figma: Nymbl wireframes](https://www.figma.com/design/6DSWdNL44aREEIR4J9JV0s/dwest?node-id=47-563) — in case a component-backed version is more useful to review than SVG or code.

## Information structure

```
┌─────────────────────────────────────────────────────────────┐
│ Harbor & Pine · Staffing a new role · today is 2026-11-02    │
├───────────────────┬────────────────────────────────────────┤
│ OPEN ROLES (nav)   │ ROLE WORKSPACE                          │
│                    │                                         │
│ Must fill ▸ 5      │  Role detail                            │
│ Nice to fill ▸ 1   │  (title, project, window, skills,       │
│ If won ▸ 2         │   Proposed-project callout if relevant) │
│                    │                                         │
│ [role card]        │  Candidate list (ranked)                │
│ [role card]        │  ├ skill match chips                    │
│ [role card] ◂sel   │  ├ load bar: now → if assigned           │
│ ...                │  ├ actual-vs-plan flag if it diverges   │
│                    │  └ conflict badges                      │
│                    │                                         │
│                    │  Compare drawer (0–3 selected)           │
│                    │                                         │
└───────────────────┴────────────────────────────────────────┘
          ↳ Assign opens a dialog: before/after load, overallocation
            warning, explicit Confirmed/Tentative outcome, Confirm/Cancel
```

Two-pane, not a wizard. The role list stays visible the whole time because the RM's real task is triage across many roles, not a single linear form — jumping from "Must fill" role to "Must fill" role without losing place is the actual job on a Monday.

## The path from spotting a problem to acting on it

1. **Land on priority, not alphabetical order.** Roles are sorted Must fill → Nice to fill → If won ([OpenRolesList.tsx](../src/components/OpenRolesList.tsx)). The thing with no backup plan if it stays empty is first, unscrolled.
2. **Select a role → see the constraint before the people.** Role detail renders first: allocation needed, window, skills, and — critically — a callout if the project hasn't closed yet, so the RM knows the ground they're standing on before they start comparing humans.
3. **Scan the ranked list.** Candidates are filtered to the same job title (an RM staffing a Software Engineer role isn't choosing between a designer and an engineer) and sorted by three separate, visible facts, in the order an RM would actually reason about them: skills matched → availability during the role's window → level fit. I deliberately did not blend these into one opaque "match score" — a single number hides which of the three is doing the work in any given ranking, and this is a tool for someone who needs to defend a staffing call to a client, not trust a black box.
4. **Compare up to three, side by side**, if the top of the list doesn't make the call obvious on its own.
5. **Assign → see the impact before it's real.** The dialog is the one place in the flow that's a true confirmation step: it shows every assignment currently overlapping the role's date window, the resulting total, and an explicit warning if that total exceeds 100%. Nothing commits until "Confirm assignment."
6. **The result stays on screen.** A filled role doesn't vanish from the list or hand back an empty table — it shows who's in it and an "Undo, reopen this role" button, because the RM's next thought after assigning someone is usually "wait, did I mean to do that."

## Key states

**Empty — no one holds this title.** If an open role names a discipline nobody in the practice currently has (not reachable with the sample data, since all 7 open roles are Software Engineer / Product Designer / Delivery Manager / QA Engineer, titles that already exist — but the Field Ops Platform project note says "team not fully staffed yet," and a real firm's open-role list will eventually ask for something it doesn't have), the candidate list says so directly and points at the actual next step — recruit or borrow from another practice — instead of rendering an empty table with no explanation. [CandidateTable.tsx](../src/components/CandidateTable.tsx).

**Overloaded.** The load bar turns red at ≥100%, not just >100% — being exactly fully booked is already the state an RM needs to see as a flag, not a pass. The assign dialog adds an explicit danger callout naming the exact overage in points, and does not block the action — overallocation is sometimes a real, deliberate choice (a two-week crunch before handoff), and the tool's job is to make sure it's never invisible, not to prevent it.

**Conflicting — a bet, not a fact.** `PRJ-07 Enrollment Redesign` is Proposed, not signed, at 60% win probability. Its open roles carry a `callout--warning` the moment you select them, and assigning into one explicitly produces a *Tentative* assignment rather than a *Confirmed* one — matching the status convention already present in the source data (`A007`, `A012`). The dialog says this in plain language before the RM commits, not after.

**Missing data.** Two cases surface directly instead of being silently defaulted:
- Mei Tanaka (P18) has no skills on file. Rather than silently scoring her at 0% match (indistinguishable from "genuinely has none of these skills"), she gets an explicit `NO SKILLS ON FILE — MATCH IS UNVERIFIED` flag. Those are different facts and the RM should be able to tell them apart.
- A person with no rows in `hours_logged` shows "No hours logged yet" instead of a 0% actual-load bar, which would otherwise read as "logging zero hours," a very different and false claim.

**Plan vs. reality, surfaced inline.** Where a candidate's actual logged hours diverge sharply (≥15 points) from their planned allocation during the comparison window, the row says so: e.g. Omar Haddad shows 0% *planned* load for a role starting Nov 16 (his current project ends Nov 13) but "Actually logging 98% lately, not 0%" — he looks free on paper and isn't, in practice, today. See the problem statement for the fuller argument on why this stays a visible flag rather than a silent override of the plan number.

## Keyboard operability

- Every interactive affordance is a native `<button>`, `<input type=checkbox>`, or `<dialog>` — no custom click-handlers on divs, no reimplemented focus logic beyond what's noted below. `:focus-visible` gets a real 2px ring everywhere (`src/index.css`); nothing sets `outline: none` without a replacement.
- **Role list → role detail**: Tab reaches each role card as a button; Enter/Space selects it, same as a click. The list never traps focus — moving from role to role is a flat tab sequence.
- **Candidate rows**: Tab order per row is checkbox → (skill/level content, non-interactive) → Assign button. Checkboxes disable themselves (not hide) once three are selected for compare, so a keyboard user tabbing through still lands on every control and hears/sees *why* it's disabled, rather than finding controls that silently vanish.
- **Assign dialog**: built on `<dialog>` + `showModal()` specifically so focus-trapping, "Escape closes," and "focus returns to the triggering control" all come from the browser's own accessibility implementation rather than a hand-rolled trap — see the AI process log for a real bug this caught (React's `onCancel`/`onClose` JSX props didn't reliably fire; fixed with a manual native listener once I tested it with a keyboard rather than just reading the code).
- **Focus when data changes underneath the user**: the one place the DOM structurally changes out from under a focused control is the moment an assignment commits — the candidate table and its Assign buttons unmount, replaced by the "Filled" panel. Native focus-return has nothing to return *to* at that point, so [App.tsx](../src/App.tsx) explicitly moves focus to the new panel's heading (`tabIndex={-1}`, focused via ref) and announces the change through an `aria-live="polite"` region. The same pattern runs in reverse on Undo. This was the single hardest part of the keyboard story to get right, and the part most AI-assisted scaffolding gets wrong by default — it's covered in the AI log.
- Status is never color-only: every load-bar tone pairs with text ("100% booked," "200% if assigned here"), every conflict badge carries a text label, and the Proposed/Tentative callout is a sentence, not an icon.

## What I'd extend next (optional depth, not pursued at high fidelity)

Time went into correctness and state coverage on one flow rather than a parallel high-fidelity pass, which is the trade I'd defend in the live session: a flow that's right about overallocation, tentative assignments, and missing data is worth more to this specific problem than the same flow in higher-polish pixels. If I extended it, the next components in line would be a shared `<Callout>` primitive (currently three ad hoc `.callout--*` blocks that want to be one component with a `tone` prop, matching `Badge`), and a `MatchFacts` list that `CandidateTable` and `CompareDrawer` both currently duplicate by hand.
