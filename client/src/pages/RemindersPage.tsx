import { useEffect, useState } from 'react';
import { ApiError } from '../api/http.ts';
import { getOutbox, sendReminders } from '../api/reminders.ts';
import type { Outbox } from '../api/reminders.ts';
import ui from '../components/ui.module.css';
import { useToast } from '../useToast.ts';
import styles from './RemindersPage.module.css';

export function RemindersPage() {
  const [outbox, setOutbox] = useState<Outbox | null>(null);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    let current = true;
    getOutbox()
      .then((answer) => {
        if (current) {
          setOutbox(answer);
        }
      })
      .catch(() => {
        if (current) {
          setError('The reminders could not be loaded.');
        }
      });
    return () => {
      current = false;
    };
  }, []);

  async function send() {
    try {
      const { sent } = await sendReminders();
      toast.success(sent === 0 ? 'No reminder to send.' : sent === 1 ? '1 reminder sent.' : `${sent} reminders sent.`);
      setOutbox(await getOutbox());
    } catch (failure) {
      toast.error(failure instanceof ApiError ? `The reminders were not sent: ${failure.message}` : 'The reminders were not sent.');
    }
  }

  return (
    <section>
      <div className={ui.titleRow}>
        <h2>Reminders</h2>
        {outbox?.enabled && (
          <button type="button" className={ui.primary} onClick={() => void send()}>
            Send the reminders of tomorrow
          </button>
        )}
      </div>

      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}

      {outbox === null ? (
        error === '' && <p>Loading…</p>
      ) : (
        <>
          {!outbox.enabled && (
            <p data-testid="reminders-off" className={ui.notice}>
              Reminders are turned off for this clinic.
            </p>
          )}
          {outbox.reminders.length === 0 ? (
            <p className={ui.muted}>No reminder was sent yet.</p>
          ) : (
            <ul aria-label="Sent reminders" className={ui.list}>
              {outbox.reminders.map((reminder) => (
                <li key={reminder.id} className={`${ui.card} ${styles.row}`}>
                  <strong>{reminder.patientName}</strong>
                  <span className={ui.muted}>{reminder.phone}</span>
                  <span>{reminder.message}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
