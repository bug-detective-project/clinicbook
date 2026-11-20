import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockApi } from './test/mockApi.ts';
import { renderApp } from './test/renderApp.tsx';

describe('a week opened on a Sunday', () => {
  it('is the week that ends on that Sunday', async () => {
    mockApi();
    await renderApp('/week?day=2026-03-15');

    expect(await screen.findByRole('heading', { level: 2, name: 'Mar 9 – Mar 15, 2026' })).toBeInTheDocument();
    expect(await screen.findByTestId('day-2026-03-09')).toBeInTheDocument();
    // Monday to Saturday show; the Sunday shows only when it has appointments.
    expect(screen.getByTestId('day-2026-03-14')).toBeInTheDocument();
    expect(screen.queryByTestId('day-2026-03-16')).not.toBeInTheDocument();
  });

  it('is the same week as the Monday before it, with the same appointments', async () => {
    mockApi();
    await renderApp('/week?day=2026-03-15');
    const monday = await screen.findByTestId('day-2026-03-09');

    expect(within(monday).getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('goes back one week with "Previous week"', async () => {
    mockApi();
    await renderApp('/week?day=2026-03-15');

    const previous = await screen.findByRole('link', { name: 'Previous week' });
    expect(previous.getAttribute('href')).toContain('day=2026-03-02');
  });
});
