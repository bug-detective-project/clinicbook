// The addresses of the views of the agenda, shared by its pages.

export type AgendaView = 'day' | 'week' | 'month';

export const AGENDA_VIEWS: [AgendaView, string, string][] = [
  ['day', 'Day', '/'],
  ['week', 'Week', '/week'],
  ['month', 'Month', '/month'],
];

/** The address of a view of the agenda on a day (and for one doctor, when there is one). */
export function agendaAddress(view: AgendaView, day: string, doctor?: string): string {
  const query = new URLSearchParams({ day });
  if (doctor !== undefined && view !== 'day') {
    query.set('doctor', doctor);
  }
  return `${AGENDA_VIEWS.find(([key]) => key === view)![2]}?${query.toString()}`;
}
