import { useEffect, useState } from 'react';
import { ApiError } from '../api/http.ts';
import { getOutbox, sendReminders } from '../api/reminders.ts';
import type { Outbox } from '../api/reminders.ts';
import { InfoTip } from '../components/InfoTip.tsx';
import ui from '../components/ui.module.css';
import { formatDay } from '../dates.ts';
import { formatPhone } from '../masks.ts';
import { useToast } from '../useToast.ts';
import styles from './RemindersPage.module.css';
import { Icon } from '../components/Icon.tsx';

/** When a reminder went out, in the clinic's own clock: "Mar 9, 2026, 6:02 PM". */
const SENT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

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
        <div className={styles.title}>
          <h2>Reminders</h2>
          <InfoTip label="About reminders">
            The day before an appointment, the patient gets a text message with the doctor, the day and the time, and can reply C to
            confirm. Click <strong>Send the reminders of tomorrow</strong> once a day, at the end of the day: each appointment of tomorrow
            that is not cancelled gets one reminder, and only one.
          </InfoTip>
        </div>
        {outbox?.enabled && (
          <button type="button" className={ui.primary} onClick={() => void send()}>
            <Icon name="send" />
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

          {outbox.enabled && (
            <div className={styles.block}>
              <h3 className={styles.heading}>Due tomorrow, {formatDay(outbox.day)}</h3>
              {outbox.due.length === 0 ? (
                <p className={ui.muted}>No appointment of tomorrow is waiting for a reminder.</p>
              ) : (
                <ul aria-label="Due reminders" className={ui.list}>
                  {outbox.due.map((item) => (
                    <li key={item.appointmentId} data-testid={`due-${item.appointmentId}`} className={`${ui.card} ${styles.due}`}>
                      <span className={styles.time}>{item.time}</span>
                      <strong>{item.patientName}</strong>
                      <span className={ui.muted}>{item.doctorName}</span>
                      <span className={ui.muted}>{formatPhone(item.phone)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className={styles.block}>
            <h3 className={styles.heading}>Sent</h3>
            {outbox.reminders.length === 0 ? (
              <p className={ui.muted}>No reminder was sent yet.</p>
            ) : (
              <ul aria-label="Sent reminders" className={ui.list}>
                {outbox.reminders.map((reminder) => (
                  <li key={reminder.id} className={`${ui.card} ${styles.row}`}>
                    <div>
                      <strong>{reminder.patientName}</strong>
                      <span className={ui.muted}>{formatPhone(reminder.phone)}</span>
                    </div>
                    <span>{reminder.message}</span>
                    <time className={styles.sent} dateTime={reminder.createdAt}>
                      Sent {SENT.format(new Date(reminder.createdAt))}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
