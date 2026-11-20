import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockApi } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';

/** Lets the given time pass for the timers of the page, and the requests they start finish. */
async function wait(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('the agenda refreshing itself', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('asks the server again every 15 seconds while it is open', async () => {
    const api = mockApi();
    await renderApp();
    await screen.findByTestId('day-total');
    const loaded = api.calls('GET', '/api/appointments').length;

    await wait(31_000);

    expect(api.calls('GET', '/api/appointments').length - loaded).toBe(2);
  });

  it('stops asking once the user leaves the agenda', async () => {
    const api = mockApi();
    await renderApp();
    await screen.findByTestId('day-total');

    await userEvent.click(screen.getByRole('link', { name: 'Patients' }));
    await screen.findByRole('list', { name: 'Patients' });
    const left = api.calls('GET', '/api/appointments').length;
    await wait(60_000);

    expect(api.calls('GET', '/api/appointments').length - left).toBe(0);
  });

  it('keeps one refresh, of the day on the screen, after the day changes', async () => {
    const api = mockApi();
    await renderApp();
    await screen.findByTestId('day-total');

    await userEvent.click(screen.getByRole('link', { name: 'Next day' }));
    await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' });
    await userEvent.click(screen.getByRole('link', { name: 'Next day' }));
    await screen.findByRole('heading', { level: 2, name: 'Wednesday, March 11' });
    await screen.findByTestId('day-total');
    const before = api.calls('GET', '/api/appointments').length;
    await wait(16_000);

    const refreshes = api.calls('GET', '/api/appointments').slice(before);
    expect(refreshes.map((request) => request.query.get('day'))).toEqual(['2026-03-11']);
  });
});
