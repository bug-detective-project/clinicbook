import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { json, mockApi, TOMORROW } from './test/mockApi.ts';
import { renderApp, row } from './test/renderApp.tsx';

describe('the agenda', () => {
  it('shows the appointments of today, the earliest first', async () => {
    mockApi();
    await renderApp();

    expect(await screen.findByRole('heading', { level: 2, name: 'Monday, March 9' })).toBeInTheDocument();
    const rows = within(await screen.findByRole('list', { name: 'Appointments' })).getAllByRole('listitem');
    expect(rows.map((item) => item.textContent)).toEqual([
      expect.stringContaining('08:00Ana Beatriz Costa'),
      expect.stringContaining('08:30Bruno Carvalho'),
      expect.stringContaining('09:00Camila Duarte'),
      expect.stringContaining('09:30Bruno Carvalho'),
    ]);
    expect(within(row(3)).getByText('Dr. Helena Prado · Back pain')).toBeInTheDocument();
    expect(within(row(3)).getByText('Scheduled')).toBeInTheDocument();
  });

  it('counts the appointments of the day without the cancelled ones', async () => {
    mockApi();
    await renderApp();

    expect(await screen.findByTestId('day-total')).toHaveTextContent('3 appointments');
  });

  it('goes to the next day and back to today', async () => {
    mockApi();
    await renderApp();

    await userEvent.click(await screen.findByRole('link', { name: 'Next day' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' })).toBeInTheDocument();
    expect(await screen.findByTestId('day-total')).toHaveTextContent('1 appointment');

    await userEvent.click(screen.getByRole('link', { name: 'Today' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Monday, March 9' })).toBeInTheDocument();
  });

  it('confirms a scheduled appointment', async () => {
    const api = mockApi();
    await renderApp();

    await userEvent.click(await screen.findByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' }));

    expect(await within(row(3)).findByText('Confirmed')).toBeInTheDocument();
    expect(api.calls('POST', '/api/appointments/3/confirm')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' })).not.toBeInTheDocument();
  });

  it('cancels an appointment and keeps it on the list', async () => {
    mockApi();
    await renderApp();

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel Camila Duarte at 09:00' }));

    expect(await within(row(4)).findByText('Cancelled')).toBeInTheDocument();
    expect(within(row(4)).queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows what the server answered when a change is refused, and loads the list again', async () => {
    const api = mockApi({
      respond: ({ method, path }) =>
        method === 'POST' && path === '/api/appointments/3/confirm'
          ? json({ error: 'A cancelled appointment cannot be confirmed' }, 409)
          : undefined,
    });
    await renderApp();

    await userEvent.click(await screen.findByRole('button', { name: 'Confirm Bruno Carvalho at 08:30' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A cancelled appointment cannot be confirmed');
    await waitFor(() => expect(api.calls('GET', '/api/appointments')).toHaveLength(2));
  });
});

describe('booking an appointment', () => {
  it('books what the address brought and goes to the agenda of that day', async () => {
    const api = mockApi();
    await renderApp(`/appointments/new?patient=4&doctor=1&day=${TOMORROW}&time=10:30`);

    await userEvent.click(await screen.findByRole('button', { name: 'Book' }));

    expect(await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' })).toBeInTheDocument();
    expect(await screen.findByText('Davi Fernandes')).toBeInTheDocument();
    expect(api.calls('POST', '/api/appointments')[0].body).toEqual({
      patientId: 4,
      doctorId: 1,
      day: TOMORROW,
      time: '10:30',
      reason: '',
    });
  });

  it('asks for what is missing before it sends anything', async () => {
    const api = mockApi();
    await renderApp('/appointments/new');
    await screen.findByRole('option', { name: 'Ana Beatriz Costa' });

    await userEvent.click(screen.getByRole('button', { name: 'Book' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose the patient, the doctor, the day and the time.');
    expect(api.calls('POST', '/api/appointments')).toHaveLength(0);
  });

  it('shows what the server answered when it refuses the booking', async () => {
    mockApi({
      respond: ({ method, path }) =>
        method === 'POST' && path === '/api/appointments'
          ? json({ error: 'The doctor does not see patients at this time' }, 400)
          : undefined,
    });
    await renderApp(`/appointments/new?patient=4&doctor=1&day=${TOMORROW}&time=10:30`);

    await userEvent.click(await screen.findByRole('button', { name: 'Book' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The doctor does not see patients at this time');
    expect(screen.getByRole('button', { name: 'Book' })).toBeEnabled();
  });

  it('reschedules an appointment of the agenda', async () => {
    const api = mockApi();
    await renderApp('/appointments/3/reschedule?time=11:00');
    expect(await screen.findByText(/Bruno Carvalho with Dr. Helena Prado, now on 2026-03-09 at 08:30/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reschedule' }));

    expect(await screen.findByRole('heading', { level: 2, name: 'Monday, March 9' })).toBeInTheDocument();
    expect(api.calls('PATCH', '/api/appointments/3')[0].body).toEqual({ day: '2026-03-09', time: '11:00' });
    expect(await within(row(3)).findByText('11:00')).toBeInTheDocument();
  });
});

describe('patients', () => {
  it('lists the patients by name', async () => {
    mockApi();
    await renderApp('/patients');

    const rows = within(await screen.findByRole('list', { name: 'Patients' })).getAllByRole('listitem');
    expect(rows.map((item) => within(item).getByRole('strong').textContent)).toEqual([
      'Ana Beatriz Costa',
      'Bruno Carvalho',
      'Camila Duarte',
      'Davi Fernandes',
    ]);
    expect(within(rows[2]).getByText('No e-mail')).toBeInTheDocument();
  });

  it('registers a patient and puts it on the list', async () => {
    const api = mockApi();
    await renderApp('/patients');
    await userEvent.click(await screen.findByRole('button', { name: 'New patient' }));
    const form = screen.getByRole('form', { name: 'New patient' });

    await userEvent.type(within(form).getByLabelText('Name'), 'Bianca Rocha');
    // The CPF and the phone take digits only, and show them with their mask.
    await userEvent.type(within(form).getByLabelText('CPF'), '12345678909');
    expect(within(form).getByLabelText('CPF')).toHaveValue('123.456.789-09');
    await userEvent.type(within(form).getByLabelText('Phone'), '11911119009');
    expect(within(form).getByLabelText('Phone')).toHaveValue('(11) 91111-9009');
    await userEvent.type(within(form).getByLabelText('Health plan'), 'Amparo Vida');
    await userEvent.click(within(form).getByRole('button', { name: 'Register' }));

    const list = screen.getByRole('list', { name: 'Patients' });
    expect(await within(list).findByText('Bianca Rocha')).toBeInTheDocument();
    expect(api.calls('POST', '/api/patients')[0].body).toEqual({
      name: 'Bianca Rocha',
      phone: '(11) 91111-9009',
      email: null,
      birthDate: null,
      cpf: '123.456.789-09',
      healthPlan: 'Amparo Vida',
    });
    // The dialog closes, and the focus goes back to the button that opened it.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'New patient' })).toHaveFocus();
  });

  it('opens the form of a new patient in a dialog, with the focus on its first field', async () => {
    mockApi();
    await renderApp('/patients');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: 'New patient' }));

    const dialog = screen.getByRole('dialog', { name: 'New patient' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByLabelText('Name')).toHaveFocus();
  });

  it.each([
    ['Escape', () => userEvent.keyboard('{Escape}')],
    ['Cancel', () => userEvent.click(screen.getByRole('button', { name: 'Cancel' }))],
    ['the close button', () => userEvent.click(screen.getByRole('button', { name: 'Close' }))],
  ])('closes the dialog with %s, registers nobody and starts empty the next time', async (_name, close) => {
    const api = mockApi();
    await renderApp('/patients');
    await userEvent.click(await screen.findByRole('button', { name: 'New patient' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Half Typed');

    await close();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(api.calls('POST', '/api/patients')).toEqual([]);
    expect(screen.getByRole('button', { name: 'New patient' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'New patient' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows next to each field what the server refused', async () => {
    mockApi({
      respond: ({ method, path }) =>
        method === 'POST' && path === '/api/patients'
          ? json({ error: 'Some fields are not valid', fields: { phone: 'Use only digits, spaces, dashes and parentheses' } }, 400)
          : undefined,
    });
    await renderApp('/patients');
    await userEvent.click(await screen.findByRole('button', { name: 'New patient' }));
    const form = screen.getByRole('form', { name: 'New patient' });

    await userEvent.type(within(form).getByLabelText('Name'), 'Bianca Rocha');
    await userEvent.type(within(form).getByLabelText('Phone'), '12');
    await userEvent.click(within(form).getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Some fields are not valid');
    expect(within(form).getByText('Use only digits, spaces, dashes and parentheses')).toBeInTheDocument();
    expect(within(form).getByLabelText('Phone')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the CPF, with its mask, and the health plan in the record of a patient', async () => {
    mockApi();
    await renderApp('/patients/1');

    expect(await screen.findByText('390.533.447-05')).toBeInTheDocument();
    expect(screen.getByText('Horizonte Saúde')).toBeInTheDocument();
  });

  it('edits the data of a patient from the record, in a dialog filled with them', async () => {
    const api = mockApi();
    await renderApp('/patients/1');

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const form = screen.getByRole('form', { name: 'Edit patient' });
    expect(within(form).getByLabelText('Name')).toHaveValue('Ana Beatriz Costa');
    expect(within(form).getByLabelText('CPF')).toHaveValue('390.533.447-05');
    expect(within(form).getByLabelText('Health plan')).toHaveValue('Horizonte Saúde');

    await userEvent.clear(within(form).getByLabelText('Health plan'));
    await userEvent.type(within(form).getByLabelText('Health plan'), 'Amparo Vida');
    await userEvent.click(within(form).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Amparo Vida')).toBeInTheDocument();
    expect(api.calls('PATCH', '/api/patients/1')[0].body).toMatchObject({ name: 'Ana Beatriz Costa', cpf: '390.533.447-05', healthPlan: 'Amparo Vida' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
  });

  it('keeps the data of a patient when the edit is cancelled', async () => {
    const api = mockApi();
    await renderApp('/patients/1');
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    await userEvent.type(screen.getByLabelText('Name'), ' Changed');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ana Beatriz Costa' })).toBeInTheDocument();
    expect(api.calls('PATCH', '/api/patients/1')).toHaveLength(0);
  });

  it('opens the menu of a patient, with a link to the record and one to book', async () => {
    mockApi();
    await renderApp('/patients');

    const toggle = await screen.findByRole('button', { name: 'Actions for Davi Fernandes' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);

    const menu = screen.getByRole('menu', { name: 'Actions for Davi Fernandes' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('menuitem', { name: 'Open record' })).toHaveAttribute('href', '/patients/4');
    expect(within(menu).getByRole('menuitem', { name: 'Book appointment' })).toHaveAttribute('href', '/appointments/new?patient=4');

    await userEvent.click(toggle);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('removes a patient who has no appointments', async () => {
    mockApi();
    await renderApp('/patients');

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for Davi Fernandes' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Remove patient' }));

    await waitFor(() => expect(screen.queryByTestId('patient-4')).not.toBeInTheDocument());
    expect(screen.getByTestId('patient-1')).toBeInTheDocument();
  });

  it('says why a patient with appointments stays', async () => {
    mockApi();
    await renderApp('/patients');

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for Ana Beatriz Costa' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Remove patient' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ana Beatriz Costa: This record is in use and cannot be removed');
    expect(screen.getByTestId('patient-1')).toBeInTheDocument();
  });
});

describe('reminders', () => {
  it('sends the reminders of tomorrow and lists them', async () => {
    mockApi();
    await renderApp('/reminders');
    expect(await screen.findByText('No reminder was sent yet.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Send the reminders of tomorrow' }));

    expect(await screen.findByRole('status')).toHaveTextContent('1 reminder sent.');
    const sent = within(screen.getByRole('list', { name: 'Sent reminders' })).getAllByRole('listitem');
    expect(sent).toHaveLength(1);
    expect(sent[0]).toHaveTextContent('Camila Duarte');
  });

  it('says that the reminders are off, and offers nothing to send', async () => {
    mockApi({ remindersEnabled: false });
    await renderApp('/reminders');

    expect(await screen.findByTestId('reminders-off')).toHaveTextContent('Reminders are turned off for this clinic.');
    expect(screen.queryByRole('button', { name: 'Send the reminders of tomorrow' })).not.toBeInTheDocument();
  });
});

describe('addresses', () => {
  it('shows a page for an address the app does not have', async () => {
    mockApi();
    await renderApp('/nowhere');

    expect(await screen.findByRole('heading', { level: 2, name: 'Page not found' })).toBeInTheDocument();
  });
});
