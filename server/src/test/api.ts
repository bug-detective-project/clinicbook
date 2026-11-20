import type { FastifyInstance } from 'fastify';
import { createApp } from '../app.ts';
import type { Settings } from '../config.ts';
import { openDatabase, seedDatabase } from '../db.ts';
import type { Db } from '../db.ts';

/** The day every server test calls today: a Monday. */
export const TODAY = '2026-03-09';
export const TOMORROW = '2026-03-10';

export interface Answer<Body> {
  status: number;
  body: Body;
}

export interface TestApi {
  db: Db;
  app: FastifyInstance;
  get<Body = unknown>(url: string): Promise<Answer<Body>>;
  post<Body = unknown>(url: string, payload?: unknown): Promise<Answer<Body>>;
  patch<Body = unknown>(url: string, payload?: unknown): Promise<Answer<Body>>;
  delete<Body = unknown>(url: string): Promise<Answer<Body>>;
}

/** A fresh in-memory database with the sample data, and the app on top of it. */
export async function testApi(overrides: Partial<Settings> = {}): Promise<TestApi> {
  const db = openDatabase(':memory:');
  await seedDatabase(db, TODAY);
  const app = createApp(db, { today: TODAY, remindersEnabled: true, ...overrides });

  async function call<Body>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, payload?: unknown): Promise<Answer<Body>> {
    const response = await app.inject({ method, url, payload: payload as object | undefined, headers: { host: 'localhost:3001' } });
    return { status: response.statusCode, body: (response.body === '' ? undefined : response.json()) as Body };
  }

  return {
    db,
    app,
    get: (url) => call('GET', url),
    post: (url, payload) => call('POST', url, payload),
    patch: (url, payload) => call('PATCH', url, payload),
    delete: (url) => call('DELETE', url),
  };
}
