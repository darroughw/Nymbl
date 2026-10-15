# Problem statement

To the Nymbl hiring team, on the staffing flow (Surface B).

## Should work on a project that hasn't closed yet count toward someone's load?

Yes, but as its own visible number, never merged into the committed total.

The sample data already makes the case for this without me arguing it in the abstract. `Enrollment Redesign` (PRJ-07) is Proposed at 60% win probability, and two people — Priya Raman and Sofia Marquez — are already recorded against it with `status: Tentative`, separate from their `Confirmed` work. Harbor & Pine's own planning data treats "committed" and "likely" as different facts. A staffing tool that collapses them into one load number would be less honest than the spreadsheet it's replacing.

So the prototype keeps three numbers, not one: Confirmed load, Confirmed + Tentative load, and actual logged hours. Assigning someone into a role on a Proposed project produces a Tentative assignment, matching the convention the data already uses, with an explicit callout naming the win probability before the RM commits. The reasoning: a Resource Manager who only sees "Priya is at 90%" has no way to tell whether that 90% is real or contingent on a client decision three weeks out — and that distinction is exactly what determines whether she's actually available to backfill something urgent. Showing it separately costs one extra number on screen. Hiding it costs a staffing decision made on a number that might evaporate.

The one place I'd push back on pure transparency is the default *sort order* in the candidate list: it ranks by Confirmed availability, not Confirmed+Tentative, on the theory that an RM scanning for "who can I actually put on this" should see firm capacity first and discover the tentative complication second, not have someone who's nominally "90% full" (mostly on a bet) buried below someone genuinely unavailable.

## The biggest risk to a good staffing call, and how the design reduces it

The risk: an RM assigns someone based on what the plan says, and the plan is wrong — not maliciously, just stale, because the last few weeks didn't go the way the project plan assumed.

This isn't hypothetical in the sample data; it's the normal case. Omar Haddad and Sam Rivera both show 0% *planned* load for the Field Ops Platform role starting November 16, because their current project (Inventory Sync) is recorded as ending November 13. On paper, they're free in three days. In the actual hours they've logged over the last four weeks, they're running at 98% and 101% of capacity, wrapping up the same project that's apparently about to free them. Either the handoff will land exactly on schedule and the plan is right, or it won't and an RM who staffed Omar into a new 100%-allocation role on November 16 just created a collision that won't surface until he's visibly behind on both — which is a worse way to find out than before the assignment happened.

The design's answer is to never let the plan number stand alone when logged reality disagrees with it by a meaningful margin. Every candidate row carries both figures, and when they diverge by 15 points or more, the row says so in plain language next to the load bar — not as a separate report the RM has to go pull. The assign-impact dialog shows the same before/after math using the plan numbers (since that's what's committed going forward), but the candidate was never presented as simply "available" without that caveat already visible one screen earlier.

What I'd add next, past this five-hour scope: the same divergence flag belongs on the Monday view too, as a standing list — "people whose actual hours have disagreed with their plan for two+ consecutive weeks" — so an RM catches a slipping handoff before they're trying to staff around it under time pressure, rather than discovering it candidate-by-candidate while filling a specific role.

## Where this sits against what's already on the market

I checked six resource-planning products before assuming any of this needed inventing from scratch — Float, Runn, Resource Guru, Forecast, Kantata, and Productive.io, sized against Harbor & Pine's scale (full comparison in `docs/competitive-analysis.md`). Two of this prototype's choices turn out to be category-standard, not novel: Tentative-vs-Confirmed as a separate state (Runn, Productive already do this) and real-time overallocation flagging (Resource Guru, Runn). Three are not, and I'd call them the actual differentiation. None of the six build a dedicated "pick an open role → rank and compare candidates → see impact" flow — Float and Resource Guru are schedule-first, built around dragging a known person onto a known slot, and Float's Smart Assign and Forecast's AI scheduler both move toward auto-picking a candidate rather than showing the Resource Manager three legible facts and letting them decide. None surface logged-hours-vs-plan divergence inline at the moment of a staffing decision — the category treats logged time as a separate timesheet concern. And none appear to put a Proposed project's win probability directly in the assignment-confirmation dialog the way this prototype does.

The honest gap: Kantata's algorithmic staffing optimization across dozens of parameters is a real capability this doesn't attempt. If Harbor & Pine ever grows past roughly 50 people, "three visible facts, no algorithm" may need to become "three visible facts, informed by an algorithm." That's a problem worth having, not one worth solving preemptively for a 25-person practice.

Darrough West
