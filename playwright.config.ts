import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// E2E harness for the re-foundation vertical slice (documents/plans/
// e2e-parity-vertical-slice.md). Drives apps/sample — a real Next.js app that
// wires the new @listgrid/* engine to a mock RCM CRUD backend — in a real
// browser, so "done" means observed behavior, not a green unit test.

const PORT = 3100;
const databaseDirectory = mkdtempSync(join(tmpdir(), `listgrid-e2e-${process.pid}-`));
const databasePath = join(databaseDirectory, 'listgrid-sample.sqlite');
process.env.LISTGRID_E2E_DB_DIRECTORY = databaseDirectory;
process.env.LISTGRID_SAMPLE_DB_PATH = databasePath;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : [['list']],
  timeout: 30_000,
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -w @listgrid/sample -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      LISTGRID_SAMPLE_DB_PATH: databasePath,
    },
  },
});
