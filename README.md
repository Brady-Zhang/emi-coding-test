# EMI Repair Event

A two-view single-page app for capturing unplanned breakdown repairs in real time.

## How to run

```
npm install && npm run dev
```

App runs at http://localhost:5173.

## What's built

**Tablet view** — technician interface. Six sequential milestone buttons stamp a timestamp and current user as the repair progresses. Four annotation types (Finding, Action, Part, Note) open a modal for free-text entry. A recent-entries list shows annotations below the milestone row. Completing milestone 6 flips the event to Completed and surfaces a "Start a new repair" button.

**Admin view** — supervisor interface, dark-themed. A horizontal card list shows all repair events, active-first. Selecting a card loads the full chronological timeline (milestones and annotations interleaved) and an auto-calculated metrics panel with colour-coded response, diagnosis, repair, and downtime figures.

Both views read from the same in-memory state. Switching views never loses state.

## Trade-offs

**`localStorage` persistence enabled.** `storage.ts` was already wired in the template — enabling it costs nothing and makes the demo nicer across refreshes. To disable, remove the `useEffect` on line 19 of `App.tsx`.

**Current user hardcoded to `"J Smith"`.** No auth system is in scope. All milestone stamps and annotations use the `CURRENT_USER` constant in `App.tsx:9`. A real app would pull this from an auth context.

**New repair hardcodes asset and system.** `startNewRepair` in `App.tsx:44` defaults to `CAT 793F #12 / Hydraulic` because the brief doesn't specify a creation form. The next step would be an asset/system picker.

**Elapsed timer at 10 s interval.** Smooth enough for a repair dashboard without being wasteful. A 1 s interval would be unnecessary for this use case.

**`AnnotationModal` as a fixed overlay, not a React portal.** Sufficient for the exercise. A production app should use a portal to avoid stacking-context issues when other high-z-index layers are present.

**Metric thresholds are engineering judgement.** Chosen to be defensible for heavy-equipment industrial context and documented in `docs/plan.md`:

| Metric         | Good     | OK      | Bad    |
|----------------|----------|---------|--------|
| Response time  | < 15 min | 15–30   | > 30   |
| Diagnosis time | < 20 min | 20–45   | > 45   |
| Repair time    | < 60 min | 60–120  | > 120  |
| Total downtime | < 90 min | 90–180  | > 180  |

**No unit tests written.** The pure functions in `src/lib/metrics.ts` are the natural test target, but given the 2-hour scope the effort went into feature completeness and code readability instead.

## What I'd change with more time

- **React portal for `AnnotationModal`** to avoid potential stacking-context conflicts in a larger app.
- **Unit tests for `metrics.ts`** — `calcMetrics` and `rateMetric` are pure functions that test trivially.
- **Asset/system picker on new-repair creation** instead of hardcoded defaults.
- **Responsive layout** for smaller screens; the current layout assumes ≥ iPad landscape.
