import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { json, mockApi } from './test/mockApi.ts';
import { renderApp } from './test/renderApp.tsx';

const toast = () => screen.findByTestId('toast');

afterEach(() => {
  vi.useRealTimers();
});

describe('the toasts', () => {
  it('say that a patient was registered', async () => {
    mockApi();
    await renderApp('/patients');
    await userEvent.click(await screen.findByRole('button', { name: 'New patient' }));
    const form = screen.getByRole('form', { name: 'New patient' });
    await userEvent.type(within(form).getByLabelText('Name'), 'Bianca Rocha');
    await userEvent.type(within(form).getByLabelText('CPF'), '12345678909');
    await userEvent.type(within(form).getByLabelText('Phone'), '11911119009');
    await userEvent.type(within(form).getByLabelText('Health plan'), 'Private');

    await userEvent.click(within(form).getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Bianca Rocha was registered.');
  });

  it('say that the data of a patient were saved', async () => {
    mockApi();
    await renderApp('/patients/1');
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('status')).toHaveTextContent('The data of Ana Beatriz Costa were saved.');
  });

  it('say that a patient was removed, or why not', async () => {
    mockApi();
    await renderApp('/patients');

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for Davi Fernandes' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Remove patient' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Davi Fernandes was removed.');

    await userEvent.click(screen.getByRole('button', { name: 'Actions for Bruno Carvalho' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Remove patient' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Bruno Carvalho: This record is in use and cannot be removed');
  });

  it('say that an appointment of the agenda was confirmed, or why not', async () => {
    mockApi({
      respond: (request) =>
        request.method === 'POST' && request.path === '/api/appointments/4/confirm' ? json({ error: 'A cancelled appointment cannot be confirmed' }, 409) : undefined,
    });
    await renderApp('/');

    await userEvent.click(await screen.findByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' }));
    expect(await screen.findByRole('status')).toHaveTextContent('The appointment of Bruno Carvalho at 08:30 was confirmed.');

    await userEvent.click(screen.getByRole('button', { name: 'Confirm Camila Duarte at 09:00' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('A cancelled appointment cannot be confirmed');
  });

  it('go away by themselves, and with their button', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockApi();
    await renderApp('/');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(await screen.findByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' }));
    expect(await toast()).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(4500));
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm Camila Duarte at 09:00' }));
    await user.click(within(await toast()).getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('keep their own time when another toast comes', async () => {
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
});
