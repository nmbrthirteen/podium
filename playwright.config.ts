import { rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const port = 3418;
const dataDir = path.join(os.tmpdir(), 'podium-e2e-data');

if (!process.env.TEST_WORKER_INDEX) rmSync(dataDir, { recursive: true, force: true });

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: `bun x next dev --port ${port}`,
    env: { PODIUM_DATA_DIR: dataDir, PODIUM_COACH: 'off' },
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
