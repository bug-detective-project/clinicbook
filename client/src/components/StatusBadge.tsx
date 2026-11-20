import type { AppointmentStatus } from '../api/types.ts';
import styles from './StatusBadge.module.css';

const LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`} data-status={status}>
      {LABELS[status]}
    </span>
  );
}
