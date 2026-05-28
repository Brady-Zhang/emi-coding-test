import type { Entry, MilestoneKind } from '../../lib/types';
import styles from './TimelineTable.module.css';

type Props = {
  entries: Entry[];
};

const MILESTONE_LABEL: Record<MilestoneKind, string> = {
  StartBreakdown:    'Breakdown reported',
  ArrivedAtMachine:  'Technician arrived',
  ProblemIdentified: 'Problem identified',
  StartRepair:       'Repair started',
  RepairComplete:    'Repair complete',
  ReturnToService:   'Return to service',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function TimelineTable({ entries }: Props) {
  const sorted = [...entries].sort((a, b) =>
    new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.colTime}>Time</th>
          <th className={styles.colEvent}>Event</th>
          <th className={styles.colDetail}>Detail</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(entry => (
          <tr key={`${entry.at}-${entry.kind}`}>
            <td className={styles.colTime}>{formatTime(entry.at)}</td>
            <td className={styles.colEvent}>
              {entry.type === 'milestone'
                ? MILESTONE_LABEL[entry.kind]
                : entry.kind}
            </td>
            <td className={styles.colDetail}>
              {entry.type === 'milestone' ? entry.by : entry.text}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
