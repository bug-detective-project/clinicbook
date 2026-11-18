# Solution: The time slot picker of the booking form

**What was missing.** The form (`client/src/pages/BookingPage.tsx`) asked for the time in a text field and never asked the server which times are free. The component that shows them did not exist.

## Step by step

1. **Write the component**, `client/src/components/TimeSlotPicker.tsx`:

   ```tsx
   import styles from './TimeSlotPicker.module.css';

   export interface TimeSlotPickerProps {
     slots: string[];
     value: string;
     onChange: (time: string) => void;
   }

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
   ```

   The radios share `name="time"`, so they are one group. The styles (`TimeSlotPicker.module.css`) lay the labels side by side, keep the radio in the page with `opacity: 0` and color the `span` of the checked one.
2. **Load the free times in the form.** In `BookingPage`, a `slots` state (`string[] | null`, `null` while loading) and an effect:

   ```tsx
   useEffect(() => {
     if (doctorId === '' || day === '') {
       setSlots(null);
       return;
     }
     let current = true;
     setSlots(null);
     listSlots(Number(doctorId), day)
       .then((list) => {
         if (current) {
           setSlots(list);
           setTime((chosen) => (list.includes(chosen) ? chosen : ''));
         }
       })
       .catch(() => {
         if (current) {
           setSlots([]);
           setError('The free times could not be loaded.');
         }
       });
     return () => {
       current = false;
     };
   }, [doctorId, day]);
   ```

3. **Show the picker in place of the text field**: a short text while no doctor or day is chosen, another while `slots` is `null`, and otherwise `<TimeSlotPicker slots={slots} value={time} onChange={setTime} />`. The form already sends `time`, so nothing else changes, and the reschedule form gets the picker with it.

The reference also adds a regression test, `client/src/components/TimeSlotPicker.test.tsx`, for the component alone and inside the form.

Then run `npm test`, book and reschedule an appointment in the browser, try the keyboard, and move the card to **In QA**.
