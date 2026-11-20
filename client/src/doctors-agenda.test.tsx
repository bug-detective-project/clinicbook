import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from './test/mockApi.ts';
import { renderApp } from './test/renderApp.tsx';

describe('the doctors', () => {
  it('list each doctor with its specialty', async () => {
    mockApi();
    await renderApp('/doctors');

    const prado = await screen.findByTestId('doctor-1');
    expect(prado).toHaveTextContent('Dr. Helena Prado');
    expect(prado).toHaveTextContent('General practice');
    expect(screen.getByTestId('doctor-2')).toHaveTextContent('Pediatrics');
  });

  it('register a new doctor with its hours, on a screen of its own', async () => {
    const api = mockApi();
    await renderApp('/doctors');
    await userEvent.click(await screen.findByRole('link', { name: 'New doctor' }));
    const form = screen.getByRole('form', { name: 'New doctor' });

    await userEvent.type(within(form).getByLabelText('Name'), 'Dr. Ana Ribeiro');
    await userEvent.type(within(form).getByLabelText('Specialty'), 'Cardiology');
    await userEvent.click(within(form).getByRole('button', { name: 'Add a period on Tuesday' }));
    await userEvent.click(within(form).getByRole('button', { name: 'Register' }));

    // Saved, the screen opens the page of the new doctor.
    expect(await screen.findByRole('heading', { level: 2, name: 'Dr. Ana Ribeiro' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Dr. Ana Ribeiro was registered.');
    expect(api.calls('POST', '/api/doctors')[0].body).toEqual({
      name: 'Dr. Ana Ribeiro',
      specialty: 'Cardiology',
      hours: [{ weekday: 2, startsAt: '08:00', endsAt: '12:00' }],
    });
  });

  it('open the page of a doctor with its week of appointments', async () => {
    mockApi();
    await renderApp('/doctors');
    await userEvent.click(await screen.findByRole('link', { name: 'Dr. Helena Prado' }));

    expect(await screen.findByRole('heading', { level: 2, name: 'Dr. Helena Prado' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mar 9 – Mar 15, 2026' })).toBeInTheDocument();
    const monday = await screen.findByTestId('day-2026-03-09');
    expect(monday).toHaveTextContent('08:00–12:00, 14:00–17:00');
    expect(monday).toHaveTextContent('Ana Beatriz Costa');
    expect(monday).toHaveTextContent('Bruno Carvalho');
    // Dr. Prado does not work on weekends and has no appointment then: the week ends on Friday.
    expect(screen.queryByTestId('day-2026-03-14')).not.toBeInTheDocument();
  });

  it('edit the name, the specialty and the hours of a doctor, on a screen of its own', async () => {
    const api = mockApi();
    await renderApp('/doctors/2');
    await userEvent.click(await screen.findByRole('link', { name: 'Edit' }));
    const form = screen.getByRole('form', { name: 'Edit doctor' });
    expect(within(form).getByLabelText('Name')).toHaveValue('Dr. Marcos Oliveira');

    await userEvent.clear(within(form).getByLabelText('Specialty'));
    await userEvent.type(within(form).getByLabelText('Specialty'), 'Pediatrics and allergy');
    await userEvent.click(within(form).getByRole('button', { name: 'Remove Friday, period 1' }));
    await userEvent.click(within(form).getByRole('button', { name: 'Add a period on Saturday' }));
    await userEvent.selectOptions(within(form).getByLabelText('Saturday, period 1, ends at'), '11:00');
    await userEvent.click(within(form).getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('status')).toHaveTextContent('The data of Dr. Marcos Oliveira were saved.');
    // Saved, the screen goes back to the page of the doctor, which loads it again.
    expect(await screen.findByText('Pediatrics and allergy')).toBeInTheDocument();
    expect(screen.getByText(/Mon 09:00–13:00 · Wed 09:00–13:00 · Sat 08:00–11:00/)).toBeInTheDocument();
    expect(api.calls('PATCH', '/api/doctors/2')[0].body).toEqual({
      name: 'Dr. Marcos Oliveira',
      specialty: 'Pediatrics and allergy',
      hours: [
        { weekday: 1, startsAt: '09:00', endsAt: '13:00' },
        { weekday: 3, startsAt: '09:00', endsAt: '13:00' },
        { weekday: 6, startsAt: '08:00', endsAt: '11:00' },
      ],
    });
  });

  it('remove a doctor without appointments from its edit screen, after a confirmation', async () => {
    const api = mockApi({ appointments: [] });
    await renderApp('/doctors/2/edit');

    await userEvent.click(await screen.findByRole('button', { name: 'Remove doctor' }));
    const confirm = screen.getByRole('alertdialog', { name: 'Remove doctor' });
    expect(confirm).toHaveTextContent('Remove Dr. Marcos Oliveira and the working hours from the clinic?');
    await userEvent.click(within(confirm).getByRole('button', { name: 'Remove' }));

    expect(await screen.findByRole('heading', { level: 2, name: 'Doctors' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Dr. Marcos Oliveira was removed.');
    expect(screen.queryByTestId('doctor-2')).not.toBeInTheDocument();
    expect(api.calls('DELETE', '/api/doctors/2')).toHaveLength(1);
  });

  it('say why a doctor with appointments stays, and keep the edit screen', async () => {
    mockApi();
    await renderApp('/doctors/1/edit');

    await userEvent.click(await screen.findByRole('button', { name: 'Remove doctor' }));
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Dr. Helena Prado: This record is in use and cannot be removed');
    expect(screen.getByRole('form', { name: 'Edit doctor' })).toBeInTheDocument();
  });

  it('offer no removal to a doctor being registered', async () => {
    mockApi();
    await renderApp('/doctors/new');

    expect(await screen.findByRole('form', { name: 'New doctor' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove doctor' })).not.toBeInTheDocument();
  });

  it('point out an appointment outside the hours of the doctor', async () => {
    mockApi();
    await renderApp('/doctors/1');
    await userEvent.click(await screen.findByRole('link', { name: 'Edit' }));

    await userEvent.selectOptions(screen.getByLabelText('Monday, period 1, starts at'), '09:00');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Monday at 08:00 and 08:30 now fall before the hours; Tuesday at 09:00 is still inside them.
    await waitFor(() => expect(within(screen.getByTestId('week-appointment-2')).getByText('Outside the working hours')).toBeInTheDocument());
    expect(within(screen.getByTestId('week-appointment-3')).getByText('Outside the working hours')).toBeInTheDocument();
    expect(within(screen.getByTestId('week-appointment-6')).queryByText('Outside the working hours')).not.toBeInTheDocument();
  });
});

describe('the agenda', () => {
  it('shows a week of every doctor, and of one doctor', async () => {
    mockApi();
    await renderApp('/week?day=2026-03-11');

    expect(await screen.findByRole('heading', { level: 2, name: 'Mar 9 – Mar 15, 2026' })).toBeInTheDocument();
    const monday = await screen.findByTestId('day-2026-03-09');
    expect(within(monday).getAllByRole('listitem')).toHaveLength(4);
    expect(monday).toHaveTextContent('Dr. Marcos Oliveira');

    await userEvent.selectOptions(screen.getByLabelText('Doctor'), 'Dr. Marcos Oliveira');

    await waitFor(() => expect(within(screen.getByTestId('day-2026-03-09')).getAllByRole('listitem')).toHaveLength(2));
    expect(screen.getByTestId('day-2026-03-09')).toHaveTextContent('Camila Duarte');
  });

  it('shows a month with how many appointments each day has, and opens a day', async () => {
    mockApi();
    await renderApp('/month?day=2026-03-09');

    expect(await screen.findByRole('heading', { level: 2, name: 'March 2026' })).toBeInTheDocument();
    // The cancelled appointment of the 9th does not count.
    const ninth = await screen.findByTestId('month-2026-03-09');
    expect(ninth).toHaveAccessibleName('2026-03-09: 3 appointments');

    await userEvent.click(ninth);

    expect(await screen.findByRole('heading', { level: 2, name: 'Monday, March 9' })).toBeInTheDocument();
  });

  it('switches between the day, the week and the month, and jumps to any day', async () => {
    mockApi();
    await renderApp('/');
    const views = await screen.findByRole('navigation', { name: 'Agenda views' });
    expect(within(views).getByRole('link', { name: 'Day' })).toHaveAttribute('aria-current', 'page');

    await userEvent.click(screen.getByRole('button', { name: /^Go to a day, / }));
    await userEvent.click(screen.getByRole('button', { name: 'Thursday, March 12, 2026' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Thursday, March 12' })).toBeInTheDocument();

    await userEvent.click(within(screen.getByRole('navigation', { name: 'Agenda views' })).getByRole('link', { name: 'Week' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Mar 9 – Mar 15, 2026' })).toBeInTheDocument();
  });

  it('marks today, this week and this month as selected only while they are on the screen', async () => {
    mockApi();
    await renderApp('/');
    const days = await screen.findByRole('navigation', { name: 'Days' });
    expect(within(days).getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'true');

    await userEvent.click(within(days).getByRole('link', { name: 'Next day' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Days' })).getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current');

    await userEvent.click(within(screen.getByRole('navigation', { name: 'Agenda views' })).getByRole('link', { name: 'Month' }));
    const months = await screen.findByRole('navigation', { name: 'Months' });
    expect(within(months).getByRole('link', { name: 'This month' })).toHaveAttribute('aria-current', 'true');
    await userEvent.click(within(months).getByRole('link', { name: 'Previous month' }));
    expect(await screen.findByRole('heading', { level: 2, name: 'February 2026' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Months' })).getByRole('link', { name: 'This month' })).not.toHaveAttribute('aria-current');
  });
});
