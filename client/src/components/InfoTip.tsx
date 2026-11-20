import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './InfoTip.module.css';

/**
 * A small "i" button next to a title that opens a short explanation of the screen. A second click,
 * Escape or a click outside close it, and the focus stays on the button.
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  // Where the panel opens: under the button, kept inside the window (null while it is closed).
  const [place, setPlace] = useState<{ top: number; left: number; width: number } | null>(null);
  const open = place !== null;
  const buttonRef = useRef<HTMLButtonElement>(null);

  function toggle() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (open || rect === undefined) {
      setPlace(null);
      return;
    }
    const width = Math.min(340, window.innerWidth - 32);
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 16);
    setPlace({ top: rect.bottom + 8, left, width });
  }
  const panelId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const outside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPlace(null);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPlace(null);
      }
    };
    // The panel stays where it opened, so a scroll or a resize closes it.
    const close = () => setPlace(null);
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={styles.root}>
      <button ref={buttonRef} type="button" className={styles.button} aria-label={label} aria-expanded={open} aria-controls={panelId} onClick={toggle}>
        i
      </button>
      {place !== null && (
        <span id={panelId} role="note" className={styles.panel} style={{ top: place.top, left: place.left, width: place.width }}>
          {children}
        </span>
      )}
    </span>
  );
}
