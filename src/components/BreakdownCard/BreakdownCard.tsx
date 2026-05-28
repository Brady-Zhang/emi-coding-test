import type { RepairEvent, RepairStatus } from '../../lib/types';
import { calcMetrics } from '../../lib/metrics';
import styles from './BreakdownCard.module.css';

type Props = {
  event: RepairEvent;
  isSelected: boolean;
  onClick: () => void;
};

const PILL_CLASS: Record<RepairStatus, string> = {
  Active:    styles.pillActive    ?? '',
  Completed: styles.pillCompleted ?? '',
  Stopped:   styles.pillStopped   ?? '',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function keyMetric(event: RepairEvent): string {
  if (event.status === 'Completed') {
    const { totalDowntime } = calcMetrics(event);
    return totalDowntime !== null ? `${totalDowntime} min total` : '–';
  }
  const last = event.entries.at(-1);
  return last ? `last tap ${formatTime(last.at)}` : '–';
}

export function BreakdownCard({ event, isSelected, onClick }: Props) {
  const highlighted = isSelected || event.status === 'Active';

  return (
    <div
      className={`${styles.card} ${highlighted ? styles.highlighted : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className={styles.eventId}>{event.id}</div>
      <div className={styles.asset}>{event.asset}</div>
      <div className={styles.system}>{event.system}</div>
      <span className={`${styles.pill} ${PILL_CLASS[event.status]}`}>
        {event.status}
      </span>
      <div className={styles.metric}>{keyMetric(event)}</div>
    </div>
  );
}
