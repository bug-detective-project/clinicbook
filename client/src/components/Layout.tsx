import { NavLink, Outlet } from 'react-router';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.name}>ClinicBook</h1>
        <nav aria-label="Main" className={styles.nav}>
          <NavLink to="/" end>
            Agenda
          </NavLink>
          <NavLink to="/patients">Patients</NavLink>
          <NavLink to="/reminders">Reminders</NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
