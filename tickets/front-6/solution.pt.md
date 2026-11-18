# Solução: O seletor de horário do formulário de marcação

**O que faltava.** O formulário (`client/src/pages/BookingPage.tsx`) pedia o horário em um campo de texto e nunca perguntava ao servidor quais horários estão livres. O componente que os mostra não existia.

## Passo a passo

1. **Escreva o componente**, `client/src/components/TimeSlotPicker.tsx`:

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

   Os rádios compartilham `name="time"`, então são um grupo só. Os estilos (`TimeSlotPicker.module.css`) põem os rótulos lado a lado, mantêm o rádio na página com `opacity: 0` e colorem o `span` do que está marcado.
2. **Carregue os horários livres no formulário.** No `BookingPage`, um estado `slots` (`string[] | null`, `null` enquanto carrega) e um efeito:

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

3. **Mostre o seletor no lugar do campo de texto**: um texto curto enquanto não há médico ou dia escolhido, outro enquanto `slots` é `null`, e, fora isso, `<TimeSlotPicker slots={slots} value={time} onChange={setTime} />`. O formulário já envia `time`, então nada mais muda, e o formulário de remarcar ganha o seletor junto.

A referência também adiciona um teste de regressão, `client/src/components/TimeSlotPicker.test.tsx`, para o componente sozinho e dentro do formulário.

Depois rode `npm test`, marque e remarque uma consulta no navegador, teste o teclado e mova o card para **Em QA**.
