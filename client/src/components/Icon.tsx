import type { ReactNode } from 'react';

/** The line icons of the buttons, by name, on a 24×24 grid. */
const ICONS = {
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  calendarPlus: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4m8-4v4M12 13v5m-2.5-2.5h5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11m0-11-11 11" />,
  edit: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zm9.5-13.5 4 4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

/**
 * A line icon on a 24×24 grid, in the color of the text beside it; that text alone names what it marks.
 * It draws a named icon, or the paths given as children.
 */
export function Icon({ name, children, size = 16 }: { name?: IconName; children?: ReactNode; size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {name === undefined ? children : ICONS[name]}
    </svg>
  );
}
