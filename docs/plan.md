# EMI Repair Event — Implementation Plan

## Context

Building a two-view single-page app for tracking heavy-equipment repair events. Technicians tap six sequential milestone buttons on a tablet; supervisors watch a live admin timeline. Both views share one in-memory state. The goal is a clean, brand-consistent React app that demonstrates small-component design, functional patterns, and disciplined CSS.

---

## High-level Architecture

```
App (state owner)
├── AppHeader          (logo + view toggle)
├── TabletView         (light theme, technician UX)
│   ├── RepairHeader   (asset info, status pill, elapsed)
│   ├── MilestoneGrid  (row of 6 MilestoneButton)
│   ├── AnnotationButtons (4 enabled + 2 disabled add-buttons)
│   ├── RecentEntries  (annotations only)
│   └── AnnotationModal (overlay, textarea, save/cancel)
└── AdminView          (dark theme, supervisor UX)
    ├── BreakdownsList (horizontal scroll of BreakdownCard)
    └── EventDetail
        ├── TimelineTable  (milestones + annotations interleaved)
        └── MetricsPanel   (4 computed metrics with colour coding)
```

App holds all state and passes data + callbacks down. No context, no external state library — the app is small enough that prop drilling stays manageable.

---

## State Shape

**App.tsx** — only what crosses the view boundary:

```typescript
const [events, setEvents] = useState<RepairEvent[]>(loadEvents())
const [activeView, setActiveView] = useState<'tablet' | 'admin'>('tablet')
const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
```

- **`events`** — single source of truth for all repair events (seed + user-created).
- **`activeView`** — drives the header toggle; switching never loses state.
- **`selectedEventId`** — drives admin panel; defaults to active event, else most recent.

**`openModal` lives in `TabletView`**, not App. It's a purely local UI concern — admin view never needs to know about it.

```typescript
// TabletView.tsx
const [openModal, setOpenModal] = useState<AnnotationKind | null>(null)
```

Persisted via `useEffect(() => saveEvents(events), [events])`. The `storage.ts` helper is already wired — this costs nothing and makes dev and demo nicer.

The "current tablet event" = `events.find(e => e.status === 'Active') ?? null`. If none, the tablet shows a "Start a new repair" prompt.

---

## Suggested Folder Structure

One folder per extracted component — keeps the `.tsx` and `.module.css` for each component together without mixing unrelated files.

```
src/
├── components/
│   ├── AppHeader/
│   │   ├── AppHeader.tsx
│   │   └── AppHeader.module.css
│   ├── TabletView/
│   │   ├── TabletView.tsx
│   │   └── TabletView.module.css
│   ├── MilestoneButton/
│   │   ├── MilestoneButton.tsx
│   │   └── MilestoneButton.module.css
│   ├── AnnotationModal/
│   │   ├── AnnotationModal.tsx
│   │   └── AnnotationModal.module.css
│   ├── AdminView/
│   │   ├── AdminView.tsx
│   │   └── AdminView.module.css
│   ├── BreakdownCard/
│   │   ├── BreakdownCard.tsx
│   │   └── BreakdownCard.module.css
│   ├── TimelineTable/
│   │   ├── TimelineTable.tsx
│   │   └── TimelineTable.module.css
│   └── MetricsPanel/
│       ├── MetricsPanel.tsx
│       └── MetricsPanel.module.css
├── lib/
│   ├── types.ts       (existing — extend only if needed)
│   ├── seed.ts        (existing — leave as-is)
│   ├── storage.ts     (existing — use as-is)
│   └── metrics.ts     (new — pure functions for metric calculation)
├── App.tsx
├── App.module.css
├── index.css          (CSS variables + reset)
└── main.tsx
```

**What stays inline (no extracted file):**

| Inline in... | Why not extract |
|---|---|
| `RepairHeader` → inline in `TabletView` | ~10 lines of JSX; extracting adds a file with no reuse benefit |
| `AnnotationButtons` row → inline in `TabletView` | Just 6 `<button>` elements; no logic beyond disabled state |
| `RecentEntries` list → inline in `TabletView` | Simple `<ul>` with a `.filter()` and `.map()`; single-use |
| `BreakdownsList` wrapper → inline in `AdminView` | Just a scrollable `<div>` wrapping `BreakdownCard` items |
| `EventDetail` wrapper → inline in `AdminView` | Thin layout wrapper; no props/logic of its own |

Extract a component only when it has its own non-trivial logic or is reused. `MilestoneButton`, `AnnotationModal`, `BreakdownCard`, `TimelineTable`, and `MetricsPanel` all clear that bar.

---

## Component Responsibilities

### AppHeader
Logo, title "REPAIR EVENT", two pill toggle buttons. Props: `activeView`, `onViewChange`. ~30 lines.

### TabletView
Owns `openModal` state. Receives `event: RepairEvent | null`, `onTapMilestone`, `onSaveAnnotation`, `onStartNewRepair`. Renders inline: repair header block, milestone grid, annotation button row, recent entries list. Renders extracted: `MilestoneButton`, `AnnotationModal`. ~80–100 lines.

**Inline repair header block** — asset/system string, status pill, elapsed time. Elapsed = `now − milestone-1 timestamp`, updated every 10 s via a single `useEffect`/`setInterval` in `TabletView`. No separate component needed.

**Inline annotation buttons** — six `<button>` elements, `disabled` prop derived from event state. Photo and Audio hardcoded `disabled` with `title="Not in v1"`.

**Inline recent entries** — `event.entries.filter(e => e.type === 'annotation').reverse().map(...)`. Hidden when empty.

### MilestoneButton *(extracted)*
Props: `kind`, `milestoneState: 'stamped' | 'next' | 'locked'`, `stampedAt?: string`, `stampedBy?: string`, `onClick`. Has its own visual logic (phase colour, gold ring, stamped info) that would bloat TabletView. ~40 lines.

Phase colours:

| # | Colour |
|---|---|
| 1 | `--emi-red` |
| 2 | `--emi-orange` |
| 3 | `--emi-gold` (dark text) |
| 4 | `--emi-orange` |
| 5 | `--emi-green` |
| 6 | `--emi-green` |
| locked | `--emi-light-grey`, `cursor: not-allowed` |

"Next" button: `box-shadow: 0 0 0 3px var(--emi-gold)`.

**Milestone progression** (computed in TabletView, passed as props):

```typescript
const tappedKinds = event.entries
  .filter(e => e.type === 'milestone')
  .map(e => e.kind)
const nextMilestone = MILESTONE_SEQUENCE.find(k => !tappedKinds.includes(k)) ?? null
```

### AnnotationModal *(extracted)*
Fixed-position overlay, semi-transparent backdrop. Props: `kind: AnnotationKind`, `onSave(text: string)`, `onCancel`. Save disabled while textarea empty. Escape key fires `onCancel`. Only the header label changes per kind — same component for all four. ~50 lines.

### AdminView *(extracted)*
Dark background (`--emi-dark`), off-white text, gold accents. Props: `events`, `selectedId`, `onSelectId`. Renders inline: horizontal breakdowns list, selected-event sub-header. Renders extracted: `BreakdownCard`, `TimelineTable`, `MetricsPanel`. ~60 lines.

### BreakdownCard *(extracted)*
Props: `event`, `isSelected`, `onClick`. Shows ID, asset, system, status pill, key metric (completed → `<n> min total`; active/stopped → `last tap HH:MM`). Active event gets `[ACTIVE]` pill + gold border; selected card gets gold border. ~40 lines.

### TimelineTable *(extracted)*
Props: `entries: Entry[]`. All entries sorted by `at`, milestones and annotations interleaved. Columns: **Time** | **Event** | **Detail**. Detail = annotation text or milestone operator summary. ~40 lines.

### MetricsPanel *(extracted)*
Props: `event: RepairEvent`. Calls `calcMetrics(event)`. Four rows: label, value (`"—"` if incomplete), colour class (`good` / `ok` / `bad`). ~40 lines.

---

## Metrics Calculation (`src/lib/metrics.ts`)

Pure functions only — no side effects, fully testable in isolation.

```typescript
// Minutes between two ISO strings, or null if either is missing
calcMinutes(from: string | null, to: string | null): number | null

// All four metrics for an event
calcMetrics(event: RepairEvent): {
  responseTime: number | null   // milestone 2 − milestone 1
  diagnosisTime: number | null  // milestone 3 − milestone 2
  repairTime: number | null     // milestone 5 − milestone 4
  totalDowntime: number | null  // milestone 6 − milestone 1
}

// Colour rating for a metric value
rateMetric(metric: keyof Metrics, minutes: number): 'good' | 'ok' | 'bad'
```

**Thresholds (defensible for heavy-equipment industrial context):**

| Metric | Good (green) | OK (gold) | Bad (red) |
|---|---|---|---|
| Response time | < 15 min | 15–30 | > 30 |
| Diagnosis time | < 20 min | 20–45 | > 45 |
| Repair time | < 60 min | 60–120 | > 120 |
| Total downtime | < 90 min | 90–180 | > 180 |

---

## Styling Approach

**`index.css`**: CSS custom properties for the full palette (8 roles from `design-system.html`), global box-sizing reset, body font stack (Roboto). No component styles here.

**CSS Modules per component** (`*.module.css`): scoped class names prevent collisions. No Tailwind, no component libraries.

Key patterns:
- Milestone phases via modifier classes: `.m1 … .m6`, `.locked`, `.next`
- Dark theme applied at `AdminView` root: `background: var(--emi-dark); color: var(--emi-off-white)` — child components inherit text colour without extra props
- Status pill colours via `.active`, `.stopped`, `.completed` modifier classes
- Metric rating colours via `.good`, `.ok`, `.bad` modifier classes

---

## Admin View Default Selection

```typescript
// In App.tsx, deriving initial selectedEventId:
const activeEvent = initialEvents.find(e => e.status === 'Active')
const defaultSelected = activeEvent ?? initialEvents.at(-1) ?? null
const [selectedEventId, setSelectedEventId] = useState(defaultSelected?.id ?? null)
```

---

## Annotation Modal Flow

1. User taps an "Add X" button → `setOpenModal('Finding')` (or Action / Part / Note)
2. `AnnotationModal` renders as a fixed-position overlay with a backdrop
3. User types in textarea; Save enabled only when text is non-empty
4. Save → `onSaveAnnotation(kind, text)` in App → new annotation entry appended to event → `setOpenModal(null)`
5. Cancel or Escape → `setOpenModal(null)`
6. Backdrop click → same as Cancel

No React portal needed for this exercise; a `position: fixed` overlay with high `z-index` is sufficient.

---

## Implementation Order

Build in this sequence — each step is runnable and visually testable before moving on.

1. **CSS variables + global reset** — `index.css`; `App.tsx` wired to `loadEvents()`; header toggle working
2. **`AppHeader`** — logo, title, view toggle pills
3. **`MilestoneButton`** — phase colours, locked / next / stamped states + gold ring
4. **`TabletView`** — full tablet view in one pass: repair header, milestone grid, annotation buttons, `AnnotationModal`, recent entries, new-repair button. Elapsed timer included here.
5. **`src/lib/metrics.ts`** — `calcMinutes`, `calcMetrics`, `rateMetric` as pure functions
6. **`AdminView` + `BreakdownCard`** — dark shell, horizontal card list, selection state
7. **`TimelineTable` + `MetricsPanel`** — timeline rows; colour-rated metrics

Steps 4 and 6–7 are the bulk of the work. Steps 1–3 are fast foundations (~15 min total).

---

## Suggested Commit Breakdown

Seven commits, one per meaningful increment — mirrors the implementation order above.

```
feat: add CSS variables, global reset, App state, view toggle
feat: add AppHeader with logo and view-toggle pills
feat: add MilestoneButton with phase colours and stamped/next/locked states
feat: add TabletView — milestones, annotations, modal, recent entries, new-repair
feat: add metrics.ts pure functions with colour thresholds
feat: add AdminView with dark theme, BreakdownCard list, and selection
feat: add TimelineTable and MetricsPanel; complete admin view
```

---

## Assumptions and Trade-offs

| Decision | Rationale |
|---|---|
| No context / no reducer | 3 `useState` hooks in App; `openModal` local to TabletView. Prop drilling is explicit and easy to trace in an interview. |
| Some UI sections stay inline | `RepairHeader`, annotation buttons, recent entries, and breakdowns list are single-use and small. Extracting them would add files with no payoff. |
| Current user hardcoded to "J Smith" | No auth system in scope; documented in README |
| `localStorage` persistence enabled | `storage.ts` already wired; costs nothing; makes dev and demo nicer |
| Elapsed timer at 10 s interval | Smooth enough for a repair dashboard; 1 s would be wasteful |
| "Start new repair" uses hardcoded asset / system defaults | Brief doesn't specify a creation form; listed as a `NEXT_STEPS.md` item |
| Stopped status is display-only | Seed data includes a Stopped event; brief doesn't describe a stop flow; tablet only creates Active → Completed |
| Metric thresholds are engineering judgement | Defensible for heavy-equipment industrial context; documented in table above and in README |
| Named exports everywhere | Per EMI conventions; no default exports |
| Modal as fixed overlay, no portal | Sufficient for this exercise; a real app would portal to avoid stacking-context issues |

## Future Improvements (out of scope for 2 h)

- Asset / system selection form when starting a new repair
- Stop repair flow (sets status to `Stopped`)
- Elapsed timer live-updates in real time (currently every 10 s)
- Keyboard navigation and ARIA roles on milestone buttons
- Multi-user support / real auth instead of hardcoded "J Smith"
- React portal for modal to avoid z-index / stacking-context edge cases

---

## Verification Checklist

- `npm run dev` — blank placeholder replaced by header + tablet view with seed state
- Tab through all 6 milestones in order; each unlocks the next
- Add a Finding annotation; it appears in Recent entries
- Switch to Admin view; breakdowns list and timeline render correctly for the seeded completed event
- Complete all 6 milestones; status flips to Completed and "Start a new repair" appears
- Start a new repair; it becomes the active event and appears first in Admin breakdowns list
- `npm run build` — clean TypeScript compile with no errors
