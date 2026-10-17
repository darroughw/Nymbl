# Decision log

The sample data's ground rules say it plainly: "You can add fields, derive values or restructure the data. If you do, note it in your decision log." This is that log. It covers changes to the shape or content of the data Nymbl handed over, field by field. For the reasoning behind the design itself, see [design-concept.md](design-concept.md) and [problem-statement.md](problem-statement.md).

## What was not touched

`staffing_data.json` is imported and cast to `StaffingData` as-is ([src/data/loadData.ts](../src/data/loadData.ts)). No field was renamed, no record was reshaped. The only duplication is a mirror of the same file into `src/data/`, required because Vite's dev server needs the JSON inside the project root to type it via `resolveJsonModule`. The root copy at `staffing-challenge-data/` stays the source of truth, the mirror is verified byte-identical, not maintained as a second copy someone edits by hand.

As the comment in [types.ts](../src/types.ts) puts it: the raw data is the one thing in this app that isn't allowed to be made up.

## Fields added

One, and it is session state, not data: `OpenRoleWithFill` ([useStaffingStore.ts](../src/data/useStaffingStore.ts)) extends the source `OpenRole` with a `fill: { assignmentId, personId, filledAt } | null` field. The source `open_roles.csv` is a snapshot as of Nov 2, 2026, before any role in this session has been filled, so there's no concept of "filled" to borrow from the data. This field tracks it in memory, never written back to a file.

New `Assignment` records get created in-session too, when `assignPerson()` fills a role. Their ids follow the pattern `A-NEW-1`, `A-NEW-2`, deliberately distinct from the source `assignment_id` values (`A001`, etc.) so anyone inspecting state can tell at a glance which rows came from Nymbl and which came from this session. They're appended to a React state array and vanish on refresh, by design (see the AI process log on why no backend).

## Values derived, not stored

Everything in [lib/capacity.ts](../src/lib/capacity.ts) and [lib/matching.ts](../src/lib/matching.ts) computes a value from source fields rather than writing a new field onto a person, project, or role. None of these are persisted, they're recalculated from the source records on every render.

- **`confirmedPct` / `confirmedAndTentativePct`** (`planLoadDuringWindow()`): sum of `allocation_pct` across assignments whose date range overlaps a role's window, split by status.
- **`avgWeeklyHours` / `avgLoadPct` / `weeksOfData`** (`actualLoad()`): averaged from `hours_logged` rows for a person. Returns `null`, not `0`, when a person has no `hours_logged` rows at all. That's a type-level choice: "no data" and "logged zero" are different facts, and collapsing them would be a false claim about someone's work.
- **`matchedSkills` / `missingSkills`** (`candidatesForRole()`): the intersection and difference between a person's `skills` and a role's `skills_required`.
- **`levelFit`**: `exact`, `above`, or `below`, from comparing `person.level` against `role.level` on a fixed order, Junior, Mid, Senior, Lead.
- **`availableConfirmedPct`**: `100 - confirmedPct`. Deliberately not clamped at 0, a negative number here is itself informative, it says how far over capacity someone already is before this role even enters the picture.
- **`conflicts`**: an array of flags (`not-started`, `contract-ends-early`, `time-off`, `no-skills-on-file`, `already-overallocated`), each derived by comparing a person's source fields against the role's window at call time.

## Anomalies in the source data, and how they were handled

The brief's other ground rule: decide how the design handles something that looks wrong, don't silently fix it. Three cases showed up in the real data:

- **Mei Tanaka (P18)** has an empty `skills` array. Scored as "No skills on file: match is unverified" rather than a 0% match, those are different facts, and collapsing them would make an unverified candidate look identical to a disqualified one.
- **At least one assignment (A038)** carries `end_date: null`. Typed as `string | null` and treated as "no end date on file," not "runs forever," see the comment in `types.ts` and the overlap check in [lib/dates.ts](../src/lib/dates.ts).
- **Omar Haddad and Sam Rivera** both show 0% planned load for a role starting Nov 16, their current project is recorded as ending Nov 13, while their last four weeks of `hours_logged` put them at 98% and 101% of capacity. Not treated as a data error. Both numbers are real, and the design shows both rather than trusting the plan alone, see `problem-statement.md` for the full argument.
