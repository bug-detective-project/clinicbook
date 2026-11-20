import { describe, expect, it } from 'vitest';
import { testApi } from './test/api.ts';

interface Failure {
  error: string;
  fields?: Record<string, string>;
}

const patient = { name: 'Someone New', phone: '11 90000-0000', healthPlan: 'Private' };

describe('the check digits of a CPF', () => {
  it.each([
    ['the first check digit is wrong', '123.456.789-19'],
    ['the second check digit is wrong', '123.456.789-00'],
    ['both check digits are wrong', '52998224700'],
    ['all the digits are the same', '111.111.111-11'],
    ['all the digits are zero', '00000000000'],
  ])('refuses a new patient when %s', async (_what, cpf) => {
    const { get, post } = await testApi();

    const { status, body } = await post<Failure>('/api/patients', { ...patient, cpf });

    expect(status).toBe(400);
    expect(Object.keys(body.fields ?? {})).toEqual(['cpf']);
    expect((await get<unknown[]>('/api/patients')).body).toHaveLength(8);
  });

  it('accepts a real CPF, with or without the dots and the dash', async () => {
    const { post } = await testApi();

    expect((await post('/api/patients', { ...patient, cpf: '529.982.247-25' })).status).toBe(201);
    expect((await post('/api/patients', { ...patient, cpf: '11144477735' })).status).toBe(201);
  });

  it('refuses to change a patient to a CPF whose check digits do not match', async () => {
    const { get, patch } = await testApi();
    const before = (await get<{ cpf: string }>('/api/patients/1')).body;

    const { status, body } = await patch<Failure>('/api/patients/1', { cpf: '529.982.247-26' });

    expect(status).toBe(400);
    expect(Object.keys(body.fields ?? {})).toEqual(['cpf']);
    expect((await get<{ cpf: string }>('/api/patients/1')).body.cpf).toBe(before.cpf);
  });
});
