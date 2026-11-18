import { describe, expect, it } from 'vitest';
import { testApi } from './test/api.ts';

interface Failure {
  error: string;
}

/** Words of a query: none of them belongs in what a user reads. */
const SQL = /insert into|delete from|select |update |constraint|query:|"patients"|sqlite/i;

describe('what the user reads when the database refuses a request', () => {
  it('says that the record already exists when an e-mail is registered twice', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/patients', {
      name: 'Another Ana',
      phone: '(11) 90000-1111',
      email: 'ana.costa@example.com',
    });

    expect(status).toBe(409);
    expect(body).toEqual({ error: 'This record already exists' });
  });

  it('treats the e-mail as the same whatever its capital letters', async () => {
    const { post } = await testApi();

    const { status } = await post('/api/patients', { name: 'Another Ana', phone: '(11) 90000-1111', email: 'Ana.Costa@Example.com' });

    expect(status).toBe(409);
  });

  it('says that the record is in use when a patient with appointments is removed', async () => {
    const { get, delete: remove } = await testApi();

    const { status, body } = await remove<Failure>('/api/patients/1');

    expect(status).toBe(409);
    expect(body).toEqual({ error: 'This record is in use and cannot be removed' });
    expect((await get('/api/patients/1')).status).toBe(200);
  });

  it('never shows the query', async () => {
    const { post, delete: remove } = await testApi();

    const duplicate = await post<Failure>('/api/patients', { name: 'Another Ana', phone: '(11) 90000-1111', email: 'ana.costa@example.com' });
    const inUse = await remove<Failure>('/api/patients/1');

    expect(duplicate.body.error).not.toMatch(SQL);
    expect(inUse.body.error).not.toMatch(SQL);
  });
});

describe('what the user reads when something nobody planned for goes wrong', () => {
  it('answers 500 with a plain message, and nothing of the error itself', async () => {
    const { db, get } = await testApi();
    // A database that is gone: every query fails from now on.
    await db.destroy();

    const { status, body } = await get<Failure>('/api/patients');

    expect(status).toBe(500);
    expect(body).toEqual({ error: 'Internal server error' });
  });
});

describe('what stays as it was', () => {
  it('answers 400 for a body that is not JSON, with the reason', async () => {
    const { app } = await testApi();

    const response = await app.inject({
      method: 'POST',
      url: '/api/patients',
      headers: { 'host': 'localhost:3001', 'content-type': 'application/json' },
      payload: '{ "name": ',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json<Failure>().error).not.toBe('Internal server error');
  });

  it('answers 404 and 400 as before', async () => {
    const { get, post } = await testApi();

    expect(await get('/api/patients/999')).toEqual({ status: 404, body: { error: 'Patient not found' } });
    expect((await post('/api/patients', { name: 'No Phone' })).status).toBe(400);
  });
});
