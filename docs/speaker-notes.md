# Speaker notes: Rounders walkthrough

Talk track for the deck at [figma.com/slides/5lbawUAgE5OUBQ6APvf1nF](https://www.figma.com/slides/5lbawUAgE5OUBQ6APvf1nF). Each section matches a slide. These go deeper than the slide text on purpose, the slide says what, this says how and why, including the parts that went wrong before they went right.

## 1. Title

Nothing to defend here. If anyone asks about the name before you get to it: Rounders is the poker movie about reading people and making calculated bets under incomplete information, which is close to what the tool actually asks a Resource Manager to do. Judge a Tentative assignment on a 60%-win-probability project, or a candidate whose logged hours disagree with the plan.

## 2. The problem

This is the brief's framing, not an invented one. Three spreadsheets, Monday morning, who's open, who's overloaded, where the next project goes. Worth saying out loud: the whole design argument downstream is built from the actual sample data, not a generic "staffing is hard" narrative.

## 3. Two surfaces, one choice

Why B over the Monday view (A): the brief itself says "what ships is what matters, not the mockups." B is a stateful decision with a real before/after, closer to what a Resource Manager is actually judged on day to day. A is a real need too, I sketched it as a wireframe (it's in `docs/wireframes/`), but on a five-hour budget, going deep on one flow beats going shallow on two. If pushed: this was a scope call, not a quality call, A isn't lower-value, it's just not what got built.

## 4. Discover: what the data said

The numbers on this slide are real rows, not invented examples:
- **Omar Haddad**: 0% planned load for a role starting Nov 16, because his current project is recorded as ending Nov 13. His actual logged hours over the last four weeks: 98%. Sam Rivera, same pattern, 101%.
- **Mei Tanaka**: empty `skills` array in the source data. The design choice was to never silently score that as 0% match, since "no skills on file" and "genuinely has none of the required skills" are different facts an RM needs to tell apart.
- **PRJ-07 / Tentative**: the source data already used `Tentative` status for two people on a Proposed project before I touched anything. That's not my invention, it's an existing convention I matched rather than building a new status on top of it.

Worth saying: I didn't go looking for a narrative and then find data to support it. The AI read the CSVs early and surfaced these patterns unprompted, before any UI existed. That ordering matters for the pitch, it's evidence the design responds to real mess, not polished placeholder data.

## 5. Checked the market first

Six products, sized against Harbor & Pine's scale specifically (25-person practice inside a 100-person firm), not generic "best staffing tools" research. Full comparison is in `docs/competitive-analysis.md`.

What's table stakes, not a novel idea: Tentative-vs-Confirmed as a separate state (Runn, Productive already do this), real-time overallocation flagging (Resource Guru, Runn). Good, it means the design isn't guessing.

What's the actual differentiation: no blended match score anywhere in the category (Float's Smart Assign and Forecast's AI scheduler both move toward auto-picking a candidate), plan-vs-actual divergence shown inline at the moment of a staffing decision (the category treats logged time as a separate timesheet concern), and the scale fit itself (Kantata is built for Harbor & Pine's *parent* org, not a 25-person practice making one Monday call).

## 6. Define: the problem statement

The core risk, stated plainly: an RM assigns someone based on the plan, and the plan is stale. The design's answer is never letting the plan number stand alone when logged reality disagrees by a meaningful margin.

The 15-point divergence threshold is a judgment call, not something derived from the data. Be upfront about that if asked: it's defensible (big enough to filter noise, small enough to catch Omar's 0%-vs-98% gap and Sam's 0%-vs-101% gap), but it's a design decision, not a statistical finding. I'd want real usage data before trusting that exact number in production.

## 7. The Double Diamond

This slide answers Martyn's actual question: where does design sit in the process. The honest answer: present at every phase, but doing different work. Discover/Define is where design finds the real problem (reading the data, not a brief). Develop/Deliver is where design keeps veto power over engineering shortcuts, the `<dialog>`-vs-custom-modal call and the three-facts-not-one-score call were both enforced *during* build, not applied as polish after. If design only shows up at Deliver, you get a flow that works and defends nothing.

## 8. Develop: two prototypes

Built it twice on purpose, not as redundant effort. The React/TypeScript build is the real artifact, the thing actually tested with a keyboard and a browser. The Figma version uses real Material 3 Design Kit component instances, not flat rectangles standing in for buttons, specifically to show the design-to-dev bridge: these aren't two disconnected deliverables, they're the same decisions expressed in two systems.

## 9–12. The walkthrough slides (Triage, Compare, Assign, Result)

This is where the engineering nitty-gritty lives. Go screen by screen:

**Triage (role list + candidate ranking).** Sort order is `Must fill → Nice to fill → If won`, hardcoded priority, not alphabetical, because the role with no backup plan if it stays empty needs to be first, unscrolled. The candidate ranking (`candidatesForRole()` in `lib/matching.ts`) filters to the same job title first (an RM staffing a Software Engineer role isn't choosing between a designer and an engineer), then sorts by three separate comparisons in sequence, skills matched, then available capacity, then level fit, never collapsed into one weighted score. That's a deliberate `sort()` with three tiebreakers in code, not a blended formula with hidden weights.

**Compare.** Same three facts, just laid side by side for the close calls. No new logic here, it reuses the same candidate data, this screen is about reducing re-scanning, not adding a new decision method.

**Assign (the dialog).** This is the best engineering story in the whole build. I used a native `<dialog>` with `showModal()` specifically because the brief grades keyboard operability, and the browser's built-in focus trap and Escape handling are more trustworthy than anything hand-rolled in five hours. Then I actually tested it with a keyboard instead of just reading the component, and found that React's `onCancel` JSX prop doesn't reliably bind to the native `cancel` event. The dialog's own code looked correct and type-checked clean. Pressing Escape left it open. Fixed by adding a manual `addEventListener('cancel', ...)` that routes through the same handler the Cancel button uses, so there's one path instead of two that could drift out of sync. The lesson worth saying out loud: AI-generated code can type-check and read correctly while still being behaviorally wrong, and the only way I caught it was driving the real UI, not approving a diff.

Second bug worth mentioning if there's time: the load-bar color threshold was originally `pct > 100` for the danger state, which left someone at exactly 100% booked showing amber instead of red. Caught it visually in a screenshot, not in code review. One-character fix (`>=`), but it's the kind of boundary condition that's genuinely easy to miss and only shows up when real data happens to land exactly on it.

**Result (filled state).** The hardest accessibility detail in the build. When an assignment commits, the candidate table and its Assign buttons unmount, replaced by the Filled panel. Native "return focus to the trigger" has nothing to return to at that point, the trigger is gone. So `App.tsx` explicitly moves focus to the new panel's heading via a ref and `tabIndex={-1}`, and announces the change through an `aria-live="polite"` region. Same pattern runs in reverse on Undo. This is the kind of thing that's invisible if you only read the code, it only shows up if you're tabbing through with a screen reader or keyboard and paying attention to where focus actually lands.

## 13. Live demo cue

Transition line into the actual click-through. If something breaks live, the screenshots in the deck are the fallback, say so plainly rather than stalling.

## 14. Three decisions that mattered

This slide is the thesis, the walkthrough slides were the evidence. Each one maps to a specific piece of code if someone wants the receipts:
- **No blended score**: `candidatesForRole()`'s three-tiebreaker sort, described above.
- **Tentative never merges**: `assignPerson()` in `useStaffingStore.ts` checks `role.priority === 'If won'` and sets status to `Tentative` instead of `Confirmed`, matching the existing `A007`/`A012` convention in the source data rather than inventing a new one.
- **Plan vs. actual inline**: `actualLoad()` in `lib/capacity.ts` returns `null`, not `0`, when a person has no rows in `hours_logged`. That's a type-level distinction between "no data" and "logged zero," and the UI renders them differently ("No hours logged yet" vs. a 0% bar) specifically because conflating them would be a false claim about someone's actual work.

## 15. What's honest about this build

Say these plainly, don't undersell them:
- **No backend** is a real scope decision for a five-hour build, not an oversight, session state via React hooks, explicit tradeoff.
- **No dark mode, unfinished Carbon-vs-Material evaluation**: I actually started in Carbon, switched to Material mid-project once it was clear which fit the brief's visual direction better. That's logged, not hidden.
- **The data-deletion incident** is worth telling live if the room seems receptive to an AI-process story: early on, scaffolding the Vite app, a `create-vite . --overwrite` command cleared the `staffing-challenge-data/` folder before anything was committed to git. It caught itself in the same turn, told me plainly instead of quietly moving on, and reconstructed every file byte-for-byte from content already read into context, then verified the reconstruction against the original row counts (25 people, 8 projects, 42 assignments, etc.) before trusting it. Immediately committed the data to git afterward, unprompted, so the failure mode couldn't repeat. Full writeup in `docs/ai-process-log.md`. The point to land: the dangerous failure mode for an AI collaborator isn't making a mistake, it's silently "fixing" one by regenerating plausible-looking data. That didn't happen here.

## 16. Closing

Open the floor. If nobody has questions yet, the Three Decisions slide (14) is the thing worth re-anchoring on, it's the one argument the whole build defends.

---

## If asked about things not on any slide

**Why the monochrome visual pass, after the deck already had an original color system?** Wanted the deck, the Figma wireframes, and the coded app to read as one identity once the Rounders name and mark existed, and wanted severity (overloaded vs. fine) to read through value alone rather than hue, both as a style choice and because it's a genuine color-blindness win. Re-ran the full WCAG contrast audit after the change and it caught a real regression, `text-faint` dropped to 4.23:1 against the new gray backgrounds, fixed by darkening the token. Worth mentioning if anyone asks "did you just eyeball the new colors," the answer is no, there's a script.

**Why playing cards?** The name is Rounders. Once that was set, the candidate list becoming a literal grid of card-shaped objects with corner pips wasn't decoration bolted on after, it's the same metaphor the name already promised. Scoped deliberately: the full card treatment (corner index, inset frame) only went on the compare cards and candidate grid, not the dense role list sidebar, because a literal card mark on every single row would compete with the real data an RM needs to scan.
