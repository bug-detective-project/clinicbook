import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { json, mockApi, TOMORROW } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';

const FILLED = `/appointments/new?patient=4&doctor=1&day=${TOMORROW}&time=10:30`;

describe('sending the booking form', () => {
  it('books one appointment when Book is clicked twice in a row', async () => {
    const api = mockApi();
    await renderApp(FILLED);

    await userEvent.dblClick(await screen.findByRole('button', { name: 'Book' }));

    await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' });
    expect(api.calls('POST', '/api/appointments')).toHaveLength(1);
    expect(api.appointments.filter((item) => item.day === TOMORROW && item.time === '10:30')).toHaveLength(1);
  });

  it('keeps the button off while the server has not answered', async () => {
    let answer: () => void = () => {};
    const waiting = new Promise<void>((resolve) => {
      answer = resolve;
    });
    const api = mockApi({
      respond: async ({ method, path }) => {
        if (method === 'POST' && path === '/api/appointments') {
          await waiting;
        }
        return undefined;
      },
    });
    await renderApp(FILLED);
    const button = await screen.findByRole('button', { name: 'Book' });

    await userEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    await userEvent.click(button);
    answer();

    await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' });
    expect(api.calls('POST', '/api/appointments')).toHaveLength(1);
  });

  it('lets the user try again after the server refused the booking', async () => {
    let refuse = true;
    const api = mockApi({
      respond: ({ method, path }) => {
        if (method === 'POST' && path === '/api/appointments' && refuse) {
          refuse = false;
          return json({ error: 'The doctor does not see patients at this time' }, 400);
        }
        return undefined;
      },
    });
    await renderApp(FILLED);
    const button = await screen.findByRole('button', { name: 'Book' });

    await userEvent.click(button);
    await screen.findByRole('alert');
    expect(button).toBeEnabled();
    await userEvent.click(button);

    await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' });
    expect(api.calls('POST', '/api/appointments')).toHaveLength(2);
  });
});
