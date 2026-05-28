import { useState, useEffect } from 'react';
import type { AnnotationKind } from '../../lib/types';
import styles from './AnnotationModal.module.css';

type Props = {
  kind: AnnotationKind;
  onSave: (text: string) => void;
  onCancel: () => void;
};

const LABEL: Record<AnnotationKind, string> = {
  Finding: 'Add finding',
  Action:  'Add action',
  Part:    'Add part',
  Note:    'Add note',
};

export function AnnotationModal({ kind, onSave, onCancel }: Props) {
  const [text, setText] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.headerLabel}>Annotation</span>
          <h2 className={styles.title}>{LABEL[kind]}</h2>
        </div>
        <div className={styles.body}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter text…"
            autoFocus
            rows={5}
          />
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button
            className={styles.saveBtn}
            onClick={() => onSave(text)}
            disabled={text.trim() === ''}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
