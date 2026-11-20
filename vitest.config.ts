import { defineConfig } from 'vitest/config';

// The tests run in UTC, so they give the same result on every computer, whatever its time zone.
process.env.TZ = 'UTC';

export default defineConfig({
  test: {
    projects: ['server', 'client'],
  },
});
