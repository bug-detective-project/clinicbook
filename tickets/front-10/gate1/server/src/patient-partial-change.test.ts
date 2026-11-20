import { describe, expect, it } from 'vitest';
import type { Patient } from './repository.ts';
import { testApi } from './test/api.ts';

describe('changing some data of a patient', () => {
  it('keeps the e-mail and the birth date when only the health plan is sent', async () => {
    const { get, patch } = await testApi();

    const { status, body } = await patch<Patient>('/api/patients/1', { healthPlan: 'Amparo Vida' });

    expect(status).toBe(200);
    expect(body).toMatchObject({ name: 'Ana Beatriz Costa', email: 'ana.costa@example.com', birthDate: '1988-04-12', healthPlan: 'Amparo Vida' });
    expect((await get<Patient>('/api/patients/1')).body).toMatchObject({ email: 'ana.costa@example.com', birthDate: '1988-04-12' });
  });

  it('keeps the birth date when only the phone is sent', async () => {
    const { patch } = await testApi();

    const { body } = await patch<Patient>('/api/patients/2', { phone: '11 97777-2003' });

    expect(body).toMatchObject({ phone: '11 97777-2003', email: 'bruno.carvalho@example.com', birthDate: '1975-11-03' });
  });

  it('clears a field sent as null, and keeps the others', async () => {
    const { patch } = await testApi();

    const { body } = await patch<Patient>('/api/patients/1', { birthDate: null });

    expect(body).toMatchObject({ email: 'ana.costa@example.com', birthDate: null, healthPlan: 'Horizonte Saúde' });
  });
});
