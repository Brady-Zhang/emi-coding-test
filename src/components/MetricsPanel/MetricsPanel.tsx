import type { RepairEvent } from '../../lib/types';
import { calcMetrics, rateMetric } from '../../lib/metrics';
import type { Metrics, MetricRating } from '../../lib/metrics';
import styles from './MetricsPanel.module.css';

type Props = {
  event: RepairEvent;
};

const METRIC_KEYS: (keyof Metrics)[] = [
  'responseTime', 'diagnosisTime', 'repairTime', 'totalDowntime',
];

const METRIC_LABEL: Record<keyof Metrics, string> = {
  responseTime:  'Response time',
  diagnosisTime: 'Diagnosis time',
  repairTime:    'Repair time',
  totalDowntime: 'Total downtime',
};

const RATING_CLASS: Record<MetricRating, string> = {
  good: styles.good ?? '',
  ok:   styles.ok   ?? '',
  bad:  styles.bad  ?? '',
};

export function MetricsPanel({ event }: Props) {
  const metrics = calcMetrics(event);

  return (
    <aside className={styles.panel}>
      <p className={styles.heading}>Auto-calculated</p>
      {METRIC_KEYS.map(key => {
        const minutes = metrics[key];
        const valueClass = minutes !== null
          ? RATING_CLASS[rateMetric(key, minutes)]
          : styles.pending;

        return (
          <div key={key} className={styles.row}>
            <div className={styles.label}>{METRIC_LABEL[key]}</div>
            <div className={`${styles.value} ${valueClass ?? ''}`}>
              {minutes !== null ? `${minutes} min` : '—'}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
