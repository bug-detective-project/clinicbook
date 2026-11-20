import type { ReactNode } from 'react';

/** The line icons of the buttons, by name, on a 24×24 grid. */
const ICONS = {
  cake: <path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M5 16c1.5 1.3 3 1.3 4.500 0s3 -1.300 4.500 0 3 1.300 4.500 0M12 12V8m0-5c1 1.200 1 2.200 0 3-1-.8-1-1.800 0-3z" />,
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  calendarPlus: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4m8-4v4M12 13v5m-2.5-2.5h5" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16a3 3 0 0 1 6 0M14.5 10h3.5M14.5 13.5h3.5" />
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
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.500 6 8.500-6" />
    </>
  ),
  phone: <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  send: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z" />,
  shield: <path d="M12 3l7.500 3v5.500c0 4.500-3.200 8.300-7.500 9.500-4.300-1.200-7.500-5-7.500-9.500V6zm0 6v6m-3-3h6" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />,
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
