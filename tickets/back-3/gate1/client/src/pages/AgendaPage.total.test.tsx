import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '../test/mockApi.ts';
import { renderApp, row } from '../test/renderApp.tsx';

describe('the total of the day in the agenda', () => {
  it('goes down as soon as an appointment is cancelled', async () => {
    mockApi();
    await renderApp();
    expect(await screen.findByTestId('day-total')).toHaveTextContent('3 appointments');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel Camila Duarte at 09:00' }));
    await within(row(4)).findByText('Cancelled');

    expect(screen.getByTestId('day-total')).toHaveTextContent('2 appointments');
  });

  it('follows every cancellation, down to the last appointment', async () => {
    mockApi();
    await renderApp();
    await screen.findByTestId('day-total');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel Camila Duarte at 09:00' }));
    await within(row(4)).findByText('Cancelled');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel Bruno Carvalho at 08:30' }));
    await within(row(3)).findByText('Cancelled');
    expect(screen.getByTestId('day-total')).toHaveTextContent('1 appointment');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel Ana Beatriz Costa at 08:00' }));
    await within(row(2)).findByText('Cancelled');
    expect(screen.getByTestId('day-total')).toHaveTextContent('No appointments');
  });

  it('stays the same when an appointment is confirmed', async () => {
    mockApi();
    await renderApp();
    await screen.findByTestId('day-total');

    await userEvent.click(screen.getByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' }));
    await within(row(3)).findByText('Confirmed');

    expect(screen.getByTestId('day-total')).toHaveTextContent('3 appointments');
  });
});
