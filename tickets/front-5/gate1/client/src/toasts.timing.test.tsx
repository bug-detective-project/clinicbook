import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockApi } from './test/mockApi.ts';
import { renderApp } from './test/renderApp.tsx';

afterEach(() => {
  vi.useRealTimers();
});

describe('the time of a toast', () => {
  it('is its own: another toast that comes does not start it again', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockApi();
    await renderApp('/');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(await screen.findByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' }));
    await screen.findByText('The appointment of Bruno Carvalho at 08:30 was confirmed.');
    await act(() => vi.advanceTimersByTimeAsync(3000));
    await user.click(screen.getByRole('button', { name: 'Confirm Camila Duarte at 09:00' }));
    await screen.findByText('The appointment of Camila Duarte at 09:00 was confirmed.');
    await act(() => vi.advanceTimersByTimeAsync(1500));

    // The first one is over its 4 seconds; the second one still has time.
    expect(screen.queryByText('The appointment of Bruno Carvalho at 08:30 was confirmed.')).not.toBeInTheDocument();
    expect(screen.getByText('The appointment of Camila Duarte at 09:00 was confirmed.')).toBeInTheDocument();
  });

  it('goes away on its own after a few seconds, even when the screen changes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockApi();
    await renderApp('/');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(await screen.findByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' }));
    await screen.findByText('The appointment of Bruno Carvalho at 08:30 was confirmed.');
    await user.click(screen.getByRole('button', { name: 'Confirm Camila Duarte at 09:00' }));
    await screen.findByText('The appointment of Camila Duarte at 09:00 was confirmed.');
    await act(() => vi.advanceTimersByTimeAsync(4500));

    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });
});
