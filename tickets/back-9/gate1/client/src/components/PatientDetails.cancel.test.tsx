import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Patient } from '../api/types.ts';
import { ToastProvider } from '../ToastContext.tsx';
import { TodayContext } from '../useToday.ts';
import { PatientDetails } from './PatientDetails.tsx';

const ANA: Patient = { id: 1, name: 'Ana Beatriz Costa', phone: '11988881001', email: 'ana.costa@example.com', birthDate: '1988-04-12', cpf: '39053344705', healthPlan: 'Horizonte Saúde' };
const CAMILA: Patient = { id: 3, name: 'Camila Duarte', phone: '+55 11 96666-3003', email: null, birthDate: null, cpf: '71349801623', healthPlan: 'Private' };

/** The Details tab of the record of `patient`, on its own. */
function renderDetails(patient: Patient) {
  render(
    <MemoryRouter>
      <TodayContext value="2026-03-09">
        <ToastProvider>
          <PatientDetails patient={patient} onChange={() => undefined} />
        </ToastProvider>
      </TodayContext>
    </MemoryRouter>,
  );
}

describe('cancelling the edit of a patient', () => {
  it('leaves the patient as it was, even after typing in the form', async () => {
    const patient = { ...ANA };
    renderDetails(patient);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.type(screen.getByLabelText('Name'), ' Changed');
    await userEvent.clear(screen.getByLabelText('Health plan'));
    await userEvent.type(screen.getByLabelText('Health plan'), 'Amparo Vida');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(patient).toEqual(ANA);
    expect(screen.getByText('Horizonte Saúde')).toBeInTheDocument();
    expect(screen.getByText('390.533.447-05')).toBeInTheDocument();
  });

  it('still says that a patient has no e-mail and no birth date', async () => {
    const patient = { ...CAMILA };
    renderDetails(patient);

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(patient).toEqual(CAMILA);
    expect(screen.getByText('No e-mail')).toBeInTheDocument();
    expect(screen.getByText('Not informed')).toBeInTheDocument();
  });

  it('opens the form again with the data of the patient', async () => {
    renderDetails({ ...ANA });

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.type(screen.getByLabelText('Name'), ' Changed');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByLabelText('Name')).toHaveValue('Ana Beatriz Costa');
  });
});
