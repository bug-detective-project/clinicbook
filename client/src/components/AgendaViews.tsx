import { Link, useNavigate } from 'react-router';
import { agendaAddress, AGENDA_VIEWS } from '../agenda.ts';
import type { AgendaView } from '../agenda.ts';
import { useToday } from '../useToday.ts';
import { DatePicker } from './DatePicker.tsx';
import styles from './AgendaViews.module.css';

/** The views of the agenda (a day, a week, a month) and a date to jump to, on top of each of them. */
export function AgendaViews({ view, day, doctor }: { view: AgendaView; day: string; doctor?: string }) {
  const today = useToday();
  const navigate = useNavigate();

  return (
    <div className={styles.bar}>
      <nav aria-label="Agenda views" className={styles.tabs}>
        {AGENDA_VIEWS.map(([key, label]) => (
          <Link key={key} to={agendaAddress(key, day, doctor)} aria-current={key === view ? 'page' : undefined} className={key === view ? `${styles.tab} ${styles.current}` : styles.tab}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.jump}>
        <DatePicker label="Go to a day" value={day} today={today} onChange={(picked) => void navigate(agendaAddress(view, picked, doctor))} />
      </div>
    </div>
  );
}
