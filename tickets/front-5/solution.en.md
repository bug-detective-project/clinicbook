# Solution: The patient menu closes on a click outside and with Esc

**What was missing.** `PatientMenu` (`client/src/components/PatientMenu.tsx`) had the `open` state and a button that toggles it, and nothing that reacts to what happens outside the menu: no click outside, no Esc, no return of the focus.

## Step by step

1. **Mark the two elements.** One ref for the wrapper (button and menu together) and one for the button:

   ```tsx
   const containerRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   ```

   Pass them as `ref={containerRef}` to the wrapper `div` and `ref={buttonRef}` to the button.
2. **Listen on the document only while the menu is open.**

   ```tsx
   useEffect(() => {
     if (!open) {
       return;
     }
     function onPointerDown(event: PointerEvent) {
       if (!containerRef.current?.contains(event.target as Node)) {
         setOpen(false);
       }
     }
     function onKeyDown(event: KeyboardEvent) {
       if (event.key === 'Escape') {
         setOpen(false);
         buttonRef.current?.focus();
       }
     }
     document.addEventListener('pointerdown', onPointerDown);
     document.addEventListener('keydown', onKeyDown);
     return () => {
       document.removeEventListener('pointerdown', onPointerDown);
       document.removeEventListener('keydown', onKeyDown);
     };
   }, [open]);
   ```

3. **Check the cases of the ticket.** A click on the heading closes the menu; a click on the padding of the menu does not; opening another menu closes this one, because that click is outside it; Esc closes and the "⋯" button has the focus.

The reference also adds a regression test, `client/src/components/PatientMenu.close.test.tsx`, with those cases.

Then run `npm test`, try the menu with the mouse and with the keyboard alone, and move the card to **In QA**.
