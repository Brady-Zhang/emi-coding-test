import { useState } from 'react';
import type { RepairEvent, Entry, MilestoneKind, AnnotationKind } from '../../lib/types';
import { MILESTONE_SEQUENCE } from '../../lib/types';
import { RepairHeader } from '../RepairHeader/RepairHeader';
import { MilestoneButton } from '../MilestoneButton/MilestoneButton';
import { AnnotationModal } from '../AnnotationModal/AnnotationModal';
import styles from './TabletView.module.css';

type Props = {
  event: RepairEvent | null;
  onTapMilestone: (kind: MilestoneKind) => void;
  onSaveAnnotation: (kind: AnnotationKind, text: string) => void;
  onStartNewRepair: () => void;
};

type AnnotationEntry = Extract<Entry, { type: 'annotation' }>;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function TabletView({ event, onTapMilestone, onSaveAnnotation, onStartNewRepair }: Props) {
  const [openModal, setOpenModal] = useState<AnnotationKind | null>(null);

  const handleSave = (text: string) => {
    if (!openModal) return;
    onSaveAnnotation(openModal, text);
    setOpenModal(null);
  };

  if (!event) {
    return (
      <main className={styles.view}>
        <div className={styles.newRepairWrapper}>
          <button className={styles.newRepairBtn} onClick={onStartNewRepair}>
            Start a new repair
          </button>
        </div>
      </main>
    );
  }

  const tappedKinds = event.entries
    .filter(e => e.type === 'milestone')
    .map(e => e.kind as MilestoneKind);

  const nextMilestone = MILESTONE_SEQUENCE.find(k => !tappedKinds.includes(k)) ?? null;
  const annotationsEnabled = event.status === 'Active';

  const annotations = event.entries
    .filter((e): e is AnnotationEntry => e.type === 'annotation')
    .reverse();

  return (
    <main className={styles.view}>
      <RepairHeader event={event} />

      {/* Milestone grid */}
      <div className={styles.milestones}>
        {MILESTONE_SEQUENCE.map(kind => {
          const stampEntry = event.entries.find(e => e.type === 'milestone' && e.kind === kind);
          const milestoneState = stampEntry ? 'stamped' : kind === nextMilestone ? 'next' : 'locked';
          return (
            <MilestoneButton
              key={kind}
              kind={kind}
              milestoneState={milestoneState}
              stampedAt={stampEntry?.at}
              stampedBy={stampEntry?.by}
              onClick={() => onTapMilestone(kind)}
            />
          );
        })}
      </div>

      <hr className={styles.divider} />

      {/* Annotation buttons */}
      <div className={styles.annotationButtons}>
        {(['Finding', 'Action', 'Part', 'Note'] as AnnotationKind[]).map(kind => (
          <button
            key={kind}
            className={styles.annotationBtn}
            disabled={!annotationsEnabled}
            onClick={() => setOpenModal(kind)}
          >
            Add {kind}
          </button>
        ))}
        <button className={styles.annotationBtn} disabled title="Not in v1">Add Photo</button>
        <button className={styles.annotationBtn} disabled title="Not in v1">Record Audio</button>
      </div>

      {/* Recent entries */}
      {annotations.length > 0 && (
        <>
          <hr className={styles.divider} />
          <h3 className={styles.entriesHeading}>Recent entries</h3>
          <ul className={styles.entryList}>
            {annotations.map(entry => (
              <li key={`${entry.at}-${entry.kind}`} className={styles.entryRow}>
                <span className={styles.entryTime}>{formatTime(entry.at)}</span>
                <span className={styles.entryKind}>{entry.kind}</span>
                <span className={styles.entryText}>{entry.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* New repair / completed state */}
      {event.status === 'Completed' && (
        <div className={styles.newRepairWrapper}>
          <button className={styles.newRepairBtn} onClick={onStartNewRepair}>
            Start a new repair
          </button>
        </div>
      )}

      {openModal && (
        <AnnotationModal kind={openModal} onSave={handleSave} onCancel={() => setOpenModal(null)} />
      )}
    </main>
  );
}
