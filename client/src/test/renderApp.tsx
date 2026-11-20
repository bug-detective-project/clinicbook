import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App } from '../App.tsx';

/** Renders the whole app at an address and waits until the server said which day is today. */
export async function renderApp(path = '/') {
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  await screen.findByRole('navigation', { name: 'Main' });
  return view;
}

/** The row of an appointment in the agenda. */
export function row(id: number): HTMLElement {
  return screen.getByTestId(`appointment-${id}`);
}
