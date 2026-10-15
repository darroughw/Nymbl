# AI process log

Tool: Claude Code (Sonnet 5), used as the primary builder for this challenge: not autocomplete, the actual pair. I drove direction and review; it wrote the data model, the ranking logic, the components, and the CSS, and I tested its output in a real browser rather than trusting the diff.

## What I asked it to do, in order

1. Read the brief and the sample data, recommend a surface, and explain the tradeoff rather than just picking one.
2. Scaffold a Vite + React + TypeScript app with no backend.
3. Build the staffing flow: open roles → ranked candidates → compare → assign → impact preview → commit.
4. Write code comments in my own voice (there's a voice-profile skill in my setup it pulled from) rather than default LLM comment style. Mechanically, this meant banning "leverage," em dashes, and comments that restate what the code already says, in favor of comments that explain a judgment call.
5. Verify the result by actually driving it: click through, inspect focus, test the states the brief calls out, not just read the code back to me.

## Where it helped

**Reading the real mess in the data and turning it into actual UI states**, not generic placeholders. It noticed on its own that Omar Haddad and Sam Rivera look 0%-booked for the Field Ops role (which starts Nov 16) but were logging 95–100%+ hours on the project that's wrapping up, and built the "actually logging X%, not Y%" flag specifically because that pattern exists in the data, not as a speculative feature. Same for Mei Tanaka's empty skills array (flagged as "unverified," not silently scored zero) and the Proposed-project Tentative-assignment convention (it noticed the source data already used `Tentative` for exactly this situation on `PRJ-07` and matched that convention when a role gets filled, instead of inventing a new status).

**Picking `<dialog>` over a hand-rolled modal.** I didn't ask for this specifically. It chose the platform primitive for the assign flow specifically because the brief grades keyboard operability, and said so in the comment before I asked. That turned out to matter: see the bug below.

**Scope judgment.** Left unprompted, it kept the ranking visible as three separate facts (skills matched, availability, level fit) rather than collapsing them into one score, and explained why in a comment: a single number hides which fact is doing the work, and this is a tool for someone who has to defend a staffing call to a client. That's the right instinct for this specific problem and I kept it rather than asking for a "smarter" blended algorithm.

## Where it was wrong, and what I did about it

**It deleted the real dataset.** Early on, scaffolding the Vite app, it ran `create-vite . --overwrite` to get past a non-empty-directory prompt. `--overwrite` clears the target directory first. That took out `staffing-challenge-data/` entirely, before anything was committed to git. It caught this itself within the same turn (checked `ls`, noticed the folder was gone), told me plainly instead of quietly moving on, and reconstructed every file byte-for-byte from the content it had already read into context earlier in the session, then verified the reconstruction against the original row counts (25 people, 8 projects, 42 assignments, 7 open roles, 8 time-off rows, 5 holidays, 145 hours-logged rows) and the `as_of`/`company` fields before trusting it. It committed the data to git immediately afterward, unprompted, specifically so this class of mistake couldn't happen twice. I'd call this the most important moment in the whole log: the failure mode of an agent silently "fixing" something by regenerating plausible-looking data is far worse than the original mistake, and it didn't do that. It was explicit about what was reconstructed and from what source.

**It shipped a dialog whose Escape/Cancel path didn't actually work**, and I only found out by testing with a keyboard instead of reading the component. React's `onCancel`/`onClose` JSX props on `<dialog>` looked correct in the code and type-checked cleanly, but driving the app in a browser and pressing Escape left the dialog open. The native "cancel" event wasn't reliably reaching React's synthetic event system. It diagnosed this itself once I pointed out the observed behavior (dispatched a native `cancel` event directly to confirm the listener logic versus the JSX binding), then replaced the JSX props with a manual `addEventListener('cancel', …)` that routes through the same `onCancel` state update the Cancel button uses, so there's one path instead of two that could drift out of sync. I'm flagging this because it's a useful general lesson about this kind of tool: it will write code that type-checks and reads correctly and is still behaviorally wrong, and the only way I caught it was insisting on driving the actual UI rather than approving the diff.

**A load-bar color threshold was off by inclusivity.** First pass used `pct > 100 ? danger : pct >= 85 ? warning : …`, which left someone at exactly 100% booked showing amber ("warning") instead of red ("danger"). Wrong: fully booked is already the state an RM needs flagged hard, not cautioned about. Caught this visually in a screenshot during testing (Aisha Bello at exactly 100%), not from reading the comparison operator. One-character fix (`>=`), but it's the kind of boundary bug that's genuinely easy to miss in review and only shows up when you look at the actual rendered state with real data that happens to land exactly on the boundary.

**It couldn't connect to Linear when I asked for a tracked project**, and said so directly instead of faking a project link or quietly skipping the request, twice: once when no connector existed and once after I said I'd connected it, because the new connection hadn't propagated into the running session yet. Correct behavior, just noting it since the brief asks where the tooling fell short: this remains outstanding and needs a fresh session.

## What I did not have it do

I did not ask it to write the problem statement's recommendation for me and take it as-is. I reviewed the argument against the actual data (the `PRJ-07`/Tentative-status pattern already in the source) before agreeing with it. Same for the surface choice (B over A): it gave a one-paragraph tradeoff and a recommendation, I made the call.
