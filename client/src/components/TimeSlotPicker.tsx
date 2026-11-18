import styles from './TimeSlotPicker.module.css';

export interface TimeSlotPickerProps {
  /** The free times, as HH:MM, in the order they are shown. */
  slots: string[];
  /** The chosen time, or an empty text while none is chosen. */
  value: string;
  onChange: (time: string) => void;
}

/** The free times of a day as a group of options, of which one can be chosen. */
export function TimeSlotPicker({ slots, value, onChange }: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return <p className={styles.empty}>No free times on this day.</p>;
  }

  return (
    <div role="radiogroup" aria-label="Time" className={styles.picker}>
      {slots.map((time) => (
        <label key={time} className={styles.slot}>
          <input type="radio" name="time" value={time} checked={value === time} onChange={() => onChange(time)} />
          <span>{time}</span>
        </label>
      ))}
    </div>
  );
}
