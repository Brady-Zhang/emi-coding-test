import type { MilestoneKind } from '../../lib/types';
import styles from './MilestoneButton.module.css';

type MilestoneState = 'stamped' | 'next' | 'locked';

type Props = {
  kind: MilestoneKind;
  milestoneState: MilestoneState;
  stampedAt?: string;
  stampedBy?: string;
  onClick: () => void;
};

const MILESTONE_META: Record<MilestoneKind, { index: number; label: string }> = {
  StartBreakdown:    { index: 1, label: 'Start\nBreakdown' },
  ArrivedAtMachine:  { index: 2, label: 'Arrived at\nMachine' },
  ProblemIdentified: { index: 3, label: 'Problem\nIdentified' },
  StartRepair:       { index: 4, label: 'Start\nRepair' },
  RepairComplete:    { index: 5, label: 'Repair\nComplete' },
  ReturnToService:   { index: 6, label: 'Return to\nService' },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function MilestoneButton({ kind, milestoneState, stampedAt, stampedBy, onClick }: Props) {
  const { index, label } = MILESTONE_META[kind];

  const phaseClass = milestoneState === 'locked' ? styles.locked : styles[`m${index}` as keyof typeof styles];
  const stateClass = milestoneState === 'next' ? styles.next : milestoneState === 'stamped' ? styles.stamped : '';
  const btnClass = [styles.btn, phaseClass, stateClass].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      <button
        className={btnClass}
        onClick={milestoneState === 'next' ? onClick : undefined}
        aria-disabled={milestoneState !== 'next'}
      >
        <span className={styles.num}>{index}</span>
        {milestoneState === 'stamped' && <span className={styles.check}>✓</span>}
        <span className={styles.lbl}>{label}</span>
      </button>
      {milestoneState === 'stamped' && stampedAt && stampedBy && (
        <div className={styles.stamp}>
          <span className={styles.stampTime}>{formatTime(stampedAt)}</span>
          <span className={styles.stampBy}>{stampedBy}</span>
        </div>
      )}
    </div>
  );
}
