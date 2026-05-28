import { useState, useEffect } from 'react';
import { SEED_EVENTS } from './lib/seed';
import { loadEvents, saveEvents } from './lib/storage';
import { AppHeader } from './components/AppHeader/AppHeader';

export function App() {
  const [events] = useState(() => loadEvents(SEED_EVENTS));
  const [activeView, setActiveView] = useState<'tablet' | 'admin'>('tablet');
  const [selectedEventId] = useState(() => {
    const initial = loadEvents(SEED_EVENTS);
    return (initial.find(e => e.status === 'Active') ?? initial.at(-1))?.id ?? null;
  });

  useEffect(() => { saveEvents(events); }, [events]);

  return (
    <div>
      <AppHeader activeView={activeView} onViewChange={setActiveView} />
      <main style={{ padding: 24 }}>
        {activeView === 'tablet' ? (
          <p>Tablet view — step 4</p>
        ) : (
          <p>Admin view — step 6 · {events.length} events · selected: {selectedEventId}</p>
        )}
      </main>
    </div>
  );
}
