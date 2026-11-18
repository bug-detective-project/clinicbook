import { screen, within } from '@testing-library/react';
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
