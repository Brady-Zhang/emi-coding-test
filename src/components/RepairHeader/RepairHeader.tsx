import { useState, useEffect } from 'react';
import type { RepairEvent, RepairStatus } from '../../lib/types';
import styles from './RepairHeader.module.css';

type Props = {
  event: RepairEvent;
};

const PILL_CLASS: Record<RepairStatus, string> = {
  Active:    styles.pillActive    ?? '',
  Completed: styles.pillCompleted ?? '',
  Stopped:   styles.pillStopped   ?? '',
};

function computeElapsed(event: RepairEvent): string {
  const m1 = event.entries.find(e => e.type === 'milestone' && e.kind === 'StartBreakdown');
  if (!m1) return '00:00';
  const m6 = event.entries.find(e => e.type === 'milestone' && e.kind === 'ReturnToService');
  if (m6) {
    const mins = Math.round((new Date(m6.at).getTime() - new Date(m1.at).getTime()) / 60000);
    return `${mins} min`;
  }
  const diffMs = Date.now() - new Date(m1.at).getTime();
  const total = Math.floor(diffMs / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function RepairHeader({ event }: Props) {
  const [elapsed, setElapsed] = useState(() => computeElapsed(event));

  useEffect(() => {
    setElapsed(computeElapsed(event));
    if (event.status !== 'Active') return;
    const id = setInterval(() => setElapsed(computeElapsed(event)), 10_000);
    return () => clearInterval(id);
  }, [event]);

  return (
    <div className={styles.header}>
      <div>
        <div className={styles.title}>
          {event.status === 'Completed' ? 'Repair complete' : 'Active repair'}
          <span className={`${styles.pill} ${PILL_CLASS[event.status]}`}>
            {event.status}
          </span>
        </div>
        <div className={styles.sub}>
          {event.asset} · {event.system} · Registered by {event.registeredBy}
        </div>
      </div>
      <div className={styles.elapsed}>
        <span className={styles.elapsedLabel}>
          {event.status === 'Completed' ? 'Total downtime' : 'Elapsed'}
        </span>
        <span className={styles.elapsedValue}>{elapsed}</span>
      </div>
    </div>
  );
}
