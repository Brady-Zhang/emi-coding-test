import type { RepairEvent, MilestoneKind } from './types';

export type Metrics = {
  responseTime:  number | null;  // milestone 2 − milestone 1
  diagnosisTime: number | null;  // milestone 3 − milestone 2
  repairTime:    number | null;  // milestone 5 − milestone 4
  totalDowntime: number | null;  // milestone 6 − milestone 1
};

export type MetricRating = 'good' | 'ok' | 'bad';

function getMilestoneAt(event: RepairEvent, kind: MilestoneKind): string | null {
  return event.entries.find(e => e.type === 'milestone' && e.kind === kind)?.at ?? null;
}

function calcMinutes(from: string | null, to: string | null): number | null {
  if (!from || !to) return null;
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
}

export function calcMetrics(event: RepairEvent): Metrics {
  const m1 = getMilestoneAt(event, 'StartBreakdown');
  const m2 = getMilestoneAt(event, 'ArrivedAtMachine');
  const m3 = getMilestoneAt(event, 'ProblemIdentified');
  const m4 = getMilestoneAt(event, 'StartRepair');
  const m5 = getMilestoneAt(event, 'RepairComplete');
  const m6 = getMilestoneAt(event, 'ReturnToService');
  return {
    responseTime:  calcMinutes(m1, m2),
    diagnosisTime: calcMinutes(m2, m3),
    repairTime:    calcMinutes(m4, m5),
    totalDowntime: calcMinutes(m1, m6),
  };
}

// Thresholds (minutes) — heavy-equipment industrial defaults, documented in docs/plan.md
export function rateMetric(metric: keyof Metrics, minutes: number): MetricRating {
  if (metric === 'responseTime')  return minutes < 15 ? 'good' : minutes <= 30  ? 'ok' : 'bad';
  if (metric === 'diagnosisTime') return minutes < 20 ? 'good' : minutes <= 45  ? 'ok' : 'bad';
  if (metric === 'repairTime')    return minutes < 60 ? 'good' : minutes <= 120 ? 'ok' : 'bad';
  return                                 minutes < 90 ? 'good' : minutes <= 180 ? 'ok' : 'bad';
}
