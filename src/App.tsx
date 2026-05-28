import { useState, useEffect } from 'react';
import type { MilestoneKind, AnnotationKind, RepairEvent } from './lib/types';
import { SEED_EVENTS } from './lib/seed';
import { loadEvents, saveEvents } from './lib/storage';
import { AppHeader } from './components/AppHeader/AppHeader';
import { TabletView } from './components/TabletView/TabletView';

const CURRENT_USER = 'J Smith';

export function App() {
  const [events, setEvents] = useState<RepairEvent[]>(() => loadEvents(SEED_EVENTS));
  const [activeView, setActiveView] = useState<'tablet' | 'admin'>('tablet');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => {
    const initial = loadEvents(SEED_EVENTS);
    return (initial.find(e => e.status === 'Active') ?? initial.at(-1))?.id ?? null;
  });

  useEffect(() => { saveEvents(events); }, [events]);

  const tabletEvent = events.find(e => e.status === 'Active') ?? events[0] ?? null;

  const tapMilestone = (kind: MilestoneKind) => {
    if (!tabletEvent) return;
    setEvents(prev => prev.map(e =>
      e.id !== tabletEvent.id ? e : {
        ...e,
        status: kind === 'ReturnToService' ? 'Completed' : 'Active',
        entries: [...e.entries, { type: 'milestone', kind, at: new Date().toISOString(), by: CURRENT_USER }],
      }
    ));
  };

  const saveAnnotation = (kind: AnnotationKind, text: string) => {
    if (!tabletEvent) return;
    setEvents(prev => prev.map(e =>
      e.id !== tabletEvent.id ? e : {
        ...e,
        entries: [...e.entries, { type: 'annotation', kind, at: new Date().toISOString(), by: CURRENT_USER, text }],
      }
    ));
  };

  const startNewRepair = () => {
    const newEvent: RepairEvent = {
      id: `RE-${Date.now()}`,
      asset: 'CAT 793F #12',
      system: 'Hydraulic',
      registeredBy: CURRENT_USER,
      registeredAt: new Date().toISOString(),
      status: 'Active',
      entries: [],
    };
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
  };

  return (
    <div>
      <AppHeader activeView={activeView} onViewChange={setActiveView} />
      {activeView === 'tablet' ? (
        <TabletView
          event={tabletEvent}
          onTapMilestone={tapMilestone}
          onSaveAnnotation={saveAnnotation}
          onStartNewRepair={startNewRepair}
        />
      ) : (
        <main style={{ padding: 24 }}>
          <p>Admin view — step 6 · {events.length} events · selected: {selectedEventId}</p>
        </main>
      )}
    </div>
  );
}
