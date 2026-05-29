# Next Steps

Five things I'd prioritise if this were a real project.

## 1. Authentication and multi-user

Replace the hardcoded `CURRENT_USER = 'J Smith'` constant with a real auth context. Milestone stamps and annotations need to carry the authenticated technician's identity so the timeline is auditable. This also unlocks role-based access — technicians see the tablet view, supervisors see the admin view, and the toggle is driven by role rather than a manual switch.

## 2. Real-time sync

Both views currently share in-memory state within a single browser tab. A production system needs the admin view to update live when a technician stamps a milestone from a different device. WebSockets or Server-Sent Events from a backend would push event mutations to all connected supervisors without polling.

## 3. Asset/system catalogue

The "Start a new repair" flow hardcodes `CAT 793F #12 / Hydraulic` as defaults. A real technician needs to select the machine they're standing in front of. A searchable asset catalogue (backed by the existing asset register in a production EMI system) would replace the hardcoded values and tie repair events to the correct maintenance history.

## 4. Offline-first / service worker

Technicians work at remote mine sites with intermittent or no connectivity. A service worker with background sync would queue milestone taps and annotations locally and flush them to the server when the connection returns — without data loss or the technician needing to know the network dropped.

## 5. CI/CD pipeline

Add a CI pipeline that runs lint, type-check, and tests on every PR. The project already has a strict TypeScript config (`noUncheckedIndexedAccess`, `noUnusedLocals`, etc.) and pure functions in `metrics.ts` that are natural unit-test targets — a pipeline enforces these automatically rather than relying on developer discipline. A deploy step to a staging URL would also let reviewers verify PRs without pulling the branch locally.
