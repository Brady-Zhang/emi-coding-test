import type { RepairEvent, RepairStatus } from '../../lib/types';
import { BreakdownCard } from '../BreakdownCard/BreakdownCard';
import { TimelineTable } from '../TimelineTable/TimelineTable';
import { MetricsPanel } from '../MetricsPanel/MetricsPanel';
import styles from './AdminView.module.css';

type Props = {
  events: RepairEvent[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
};

const PILL_CLASS: Record<RepairStatus, string> = {
  Active:    styles.pillActive    ?? '',
  Completed: styles.pillCompleted ?? '',
  Stopped:   styles.pillStopped   ?? '',
};

export function AdminView({ events, selectedId, onSelectId }: Props) {
  const sorted = [
    ...events.filter(e => e.status === 'Active'),
    ...events.filter(e => e.status !== 'Active'),
  ];

  const selectedEvent = events.find(e => e.id === selectedId) ?? null;

  return (
    <main className={styles.view}>
      <p className={styles.sectionLabel}>Breakdowns</p>
      <div className={styles.cardList}>
        {sorted.map(event => (
          <BreakdownCard
            key={event.id}
            event={event}
            isSelected={event.id === selectedId}
            onClick={() => onSelectId(event.id)}
          />
        ))}
      </div>

      <hr className={styles.divider} />

      {selectedEvent && (
        <>
          <div className={styles.detailHeader}>
            <span className={styles.detailTitle}>
              {selectedEvent.asset} — {selectedEvent.system}
            </span>
            <span className={`${styles.pill} ${PILL_CLASS[selectedEvent.status]}`}>
              {selectedEvent.status}
            </span>
            <span className={styles.detailSub}>
              Auto-generated from milestone taps. No technician typing required.
            </span>
          </div>
          <div className={styles.detailLayout}>
            <TimelineTable entries={selectedEvent.entries} />
            <MetricsPanel event={selectedEvent} />
          </div>
        </>
      )}
    </main>
  );
}
