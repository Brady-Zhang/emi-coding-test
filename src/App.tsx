import { useState, useEffect } from 'react';
import { SEED_EVENTS } from './lib/seed';
import { loadEvents, saveEvents } from './lib/storage';

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
      <header style={{ padding: '12px 24px', display: 'flex', gap: '8px', background: 'var(--emi-dark)' }}>
        <span style={{ color: 'var(--emi-off-white)', marginRight: 'auto', fontWeight: 700 }}>
          REPAIR EVENT
        </span>
        <button onClick={() => setActiveView('tablet')} disabled={activeView === 'tablet'}>
          Tablet
        </button>
        <button onClick={() => setActiveView('admin')} disabled={activeView === 'admin'}>
          Admin
        </button>
      </header>
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
