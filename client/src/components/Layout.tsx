import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router';
import styles from './Layout.module.css';

// Line icons on a 24×24 grid, in the color of the link they sit in.
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function Layout() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span aria-hidden="true" className={styles.mark}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <div>
            <h1 className={styles.name}>ClinicBook</h1>
            <p className={styles.clinic}>Vila Clara Clinic</p>
          </div>
        </div>
        <nav aria-label="Main" className={styles.nav}>
          <NavLink to="/" end>
            <Icon>
              <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
              <path d="M3.5 10h17M8 3v4m8-4v4" />
            </Icon>
            Agenda
          </NavLink>
          <NavLink to="/patients">
            <Icon>
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M17.500 14a6.500 6.500 0 0 1 4 6" />
            </Icon>
            Patients
          </NavLink>
          <NavLink to="/reminders">
            <Icon>
              <path d="M6 16V11a6 6 0 1 1 12 0v5l1.500 2h-15L6 16Zm4 4.500a2 2 0 0 0 4 0" />
            </Icon>
            Reminders
          </NavLink>
        </nav>
        <p className={styles.desk}>
          <span aria-hidden="true" className={styles.avatar}>
            FD
          </span>
          Front desk
        </p>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
