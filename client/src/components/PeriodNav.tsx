import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from './Icon.tsx';
import styles from './PeriodNav.module.css';

/** One step of the navigation: a link to another address, or a button for a page that keeps the period in its state. */
export interface PeriodStep {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface PeriodNavProps {
  /** What the steps walk through, for a screen reader: "Days", "Weeks", "Months". */
  label: string;
  previous: PeriodStep;
  current: PeriodStep;
  next: PeriodStep;
  /** Whether the period on the screen is the current one (today, this week, this month): its step shows as selected. */
  showingCurrent: boolean;
}

function Step({ step, className, selected, children }: { step: PeriodStep; className: string; selected?: boolean; children: ReactNode }) {
  const current = selected ? 'true' : undefined;
  return step.to === undefined
    ? (
        <button type="button" className={className} aria-current={current} onClick={step.onClick}>
          {children}
        </button>
      )
    : (
        <Link to={step.to} className={className} aria-current={current}>
          {children}
        </Link>
      );
}

/** Previous, current and next period, as one control; the same on the day, the week and the month. */
export function PeriodNav({ label, previous, current, next, showingCurrent }: PeriodNavProps) {
  return (
    <nav aria-label={label} className={styles.nav}>
      <Step step={previous} className={styles.step}>
        <Icon>
          <path d="M15 6l-6 6 6 6" />
        </Icon>
        {previous.label}
      </Step>
      <Step step={current} className={`${styles.step} ${showingCurrent ? styles.selected : ''}`} selected={showingCurrent}>
        {current.label}
      </Step>
      <Step step={next} className={styles.step}>
        {next.label}
        <Icon>
          <path d="M9 6l6 6-6 6" />
        </Icon>
      </Step>
    </nav>
  );
}
