import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi } from '../test/mockApi.ts';
import { renderApp } from '../test/renderApp.tsx';

function tab(name: string): HTMLElement {
  return within(screen.getByRole('navigation', { name: 'Patient record' })).getByRole('link', { name });
}

describe('the record of a patient', () => {
  it('opens on the Details tab, with the name of the patient as the title', async () => {
    mockApi();
    await renderApp('/patients/1');

    expect(await screen.findByRole('heading', { level: 2, name: 'Ana Beatriz Costa' })).toBeInTheDocument();
    expect(screen.getByText('(11) 98888-1001')).toBeInTheDocument();
    expect(screen.getByText('ana.costa@example.com')).toBeInTheDocument();
    expect(tab('Details')).toHaveAttribute('aria-current', 'page');
    expect(tab('Appointments')).not.toHaveAttribute('aria-current');
  });

  it('has an address for each tab', async () => {
    mockApi();
    await renderApp('/patients/1');
    await screen.findByRole('heading', { level: 2, name: 'Ana Beatriz Costa' });

    expect(tab('Details')).toHaveAttribute('href', '/patients/1');
    expect(tab('Appointments')).toHaveAttribute('href', '/patients/1/appointments');
  });

  it('shows the appointments of the patient on the Appointments tab', async () => {
    mockApi();
    await renderApp('/patients/1');
    await screen.findByRole('heading', { level: 2, name: 'Ana Beatriz Costa' });

    await userEvent.click(tab('Appointments'));

    const list = await screen.findByRole('list', { name: 'Appointments of Ana Beatriz Costa' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(tab('Appointments')).toHaveAttribute('aria-current', 'page');
    expect(tab('Details')).not.toHaveAttribute('aria-current');
    expect(screen.queryByText('ana.costa@example.com')).not.toBeInTheDocument();
  });

  it('opens straight on the Appointments tab from its address', async () => {
    mockApi();
    await renderApp('/patients/2/appointments');

    expect(await screen.findByRole('heading', { level: 2, name: 'Bruno Carvalho' })).toBeInTheDocument();
    expect(await screen.findByRole('list', { name: 'Appointments of Bruno Carvalho' })).toBeInTheDocument();
    expect(tab('Appointments')).toHaveAttribute('aria-current', 'page');
  });

  it('goes back to Details from the Appointments tab', async () => {
    mockApi();
    await renderApp('/patients/2/appointments');
    await screen.findByRole('list', { name: 'Appointments of Bruno Carvalho' });

    await userEvent.click(tab('Details'));

    expect(await screen.findByText('bruno.carvalho@example.com')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Appointments of Bruno Carvalho' })).not.toBeInTheDocument();
  });

  it('says so when the patient does not exist, on either tab', async () => {
    mockApi();
    const view = await renderApp('/patients/999');

    expect(await screen.findByRole('heading', { level: 2, name: 'Patient not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the patients' })).toHaveAttribute('href', '/patients');
    expect(screen.queryByRole('navigation', { name: 'Patient record' })).not.toBeInTheDocument();

    view.unmount();
    await renderApp('/patients/999/appointments');
    expect(await screen.findByRole('heading', { level: 2, name: 'Patient not found' })).toBeInTheDocument();
  });

  it('is where "Open record" of the list of patients leads', async () => {
    mockApi();
    await renderApp('/patients');

    await userEvent.click(await screen.findByRole('button', { name: 'Actions for Camila Duarte' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Open record' }));

    expect(await screen.findByRole('heading', { level: 2, name: 'Camila Duarte' })).toBeInTheDocument();
    expect(screen.getByText('No e-mail')).toBeInTheDocument();
  });
});

describe('what the record of a patient does', () => {
  it('shows the CPF, with its mask, and the health plan in the record of a patient', async () => {
    mockApi();
    await renderApp('/patients/1');

    expect(await screen.findByText('390.533.447-05')).toBeInTheDocument();
    expect(screen.getByText('Horizonte Saúde')).toBeInTheDocument();
  });

  it('books an appointment of a patient from the Appointments tab of the record, not from Details', async () => {
    mockApi();
    await renderApp('/patients/1');
    expect(await screen.findByText('390.533.447-05')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Book appointment' })).not.toBeInTheDocument();

    await userEvent.click(within(screen.getByRole('navigation', { name: 'Patient record' })).getByRole('link', { name: 'Appointments' }));

    expect(await screen.findByRole('link', { name: 'Book appointment' })).toHaveAttribute('href', '/appointments/new?patient=1');
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

  it('removes a patient from the record, after a confirmation, and goes back to the list', async () => {
    mockApi();
    await renderApp('/patients/4');

    await userEvent.click(await screen.findByRole('button', { name: 'Remove' }));
    await userEvent.click(within(screen.getByRole('alertdialog', { name: 'Remove patient' })).getByRole('button', { name: 'Remove' }));

    expect(await screen.findByRole('heading', { level: 2, name: 'Patients' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Davi Fernandes was removed.');
    await waitFor(() => expect(screen.queryByTestId('patient-4')).not.toBeInTheDocument());
  });

  it('says that the data of a patient were saved', async () => {
    mockApi();
    await renderApp('/patients/1');
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('status')).toHaveTextContent('The data of Ana Beatriz Costa were saved.');
  });
});
