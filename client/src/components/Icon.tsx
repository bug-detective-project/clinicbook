import type { ReactNode } from 'react';

/** A line icon on a 24×24 grid, in the color of the text beside it; that text alone names what it marks. */
export function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
