import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { mockApi, TOMORROW } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';
import { TimeSlotPicker } from './TimeSlotPicker.tsx';

const SLOTS = ['08:00', '08:30', '10:00', '14:00'];

describe('TimeSlotPicker', () => {
  it('shows one option per free time, in the order given, inside a group named Time', () => {
    render(<TimeSlotPicker slots={SLOTS} value="" onChange={() => {}} />);

    const group = screen.getByRole('radiogroup', { name: 'Time' });
    const options = within(group).getAllByRole('radio');

    expect(options.map((option) => option.getAttribute('value'))).toEqual(SLOTS);
    expect(within(group).getByRole('radio', { name: '10:00' })).toBeInTheDocument();
    expect(options.every((option) => !(option as HTMLInputElement).checked)).toBe(true);
  });

  it('marks the chosen time', () => {
    render(<TimeSlotPicker slots={SLOTS} value="10:00" onChange={() => {}} />);

    expect(screen.getByRole('radio', { name: '10:00' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '08:00' })).not.toBeChecked();
  });

  it('tells which time the user chose', async () => {
    const onChange = vi.fn();
    render(<TimeSlotPicker slots={SLOTS} value="08:00" onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: '14:00' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('14:00');
  });

  it('says that the day has no free time instead of showing an empty group', () => {
    render(<TimeSlotPicker slots={[]} value="" onChange={() => {}} />);

    expect(screen.getByText('No free times on this day.')).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});

describe('the booking form with the TimeSlotPicker', () => {
  it('offers the free times of the doctor on the day, and books the chosen one', async () => {
    const api = mockApi();
    await renderApp(`/appointments/new?patient=4&doctor=1&day=${TOMORROW}`);

    const group = await screen.findByRole('radiogroup', { name: 'Time' });
    // Dr. Helena Prado already has an appointment at 09:00 on that day.
    expect(within(group).queryByRole('radio', { name: '09:00' })).not.toBeInTheDocument();
    await userEvent.click(within(group).getByRole('radio', { name: '09:30' }));
    await userEvent.click(screen.getByRole('button', { name: 'Book' }));

    await screen.findByRole('heading', { level: 2, name: 'Tuesday, March 10' });
    expect(api.calls('POST', '/api/appointments')[0].body).toMatchObject({ doctorId: 1, day: TOMORROW, time: '09:30' });
  });

  it('asks for the free times again when the doctor changes, and keeps a chosen time that is still free', async () => {
    const api = mockApi();
    await renderApp(`/appointments/new?patient=4&doctor=1&day=${TOMORROW}&time=10:30`);
    expect(await screen.findByRole('radio', { name: '10:30' })).toBeChecked();

    await userEvent.selectOptions(screen.getByLabelText('Doctor'), '2');

    expect(await screen.findByRole('radio', { name: '09:00' })).toBeInTheDocument();
    expect(api.calls('GET', '/api/doctors/2/slots')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: '10:30' })).toBeChecked();
  });
});
