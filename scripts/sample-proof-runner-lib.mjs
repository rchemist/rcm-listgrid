import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { chromium } from '@playwright/test';

export async function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

export function runCommand(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, { stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`npm ${args.join(' ')} exited code=${code} signal=${signal}`));
    });
  });
}

export async function startSample({ mode, port, databasePath }) {
  const output = [];
  const child = spawn('npm', ['--prefix', 'apps/sample', 'run', mode, '--', '-p', String(port)], {
    detached: process.platform !== 'win32',
    env: { ...process.env, LISTGRID_SAMPLE_DB_PATH: databasePath },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const capture = (chunk) => {
    output.push(String(chunk));
    if (output.length > 200) output.shift();
  };
  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  const baseURL = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`sample ${mode} exited before readiness\n${output.join('')}`);
    }
    try {
      const response = await fetch(`${baseURL}/entityform-proof`);
      if (response.ok) return { child, baseURL, output };
    } catch {
      // server is not accepting connections yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  await stopSample({ child });
  throw new Error(`sample ${mode} readiness timeout\n${output.join('')}`);
}

export async function stopSample({ child }) {
  if (child.exitCode !== null) return;
  if (process.platform === 'win32') child.kill('SIGTERM');
  else process.kill(-child.pid, 'SIGTERM');
  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (child.exitCode === null) {
        if (process.platform === 'win32') child.kill('SIGKILL');
        else process.kill(-child.pid, 'SIGKILL');
      }
      resolve();
    }, 10_000);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export async function withBrowser(baseURL, work) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ baseURL });
    return await work(page);
  } finally {
    await browser.close();
  }
}

export async function resetProof(baseURL) {
  const response = await fetch(`${baseURL}/api/sample-admin/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entities: ['entityform-proof'] }),
  });
  if (!response.ok) throw new Error(`reset failed: ${response.status} ${await response.text()}`);
}

export async function createProofRow(page, name, note) {
  await page.goto('/entityform-proof/baseline');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Note').fill(note);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/entityform-proof') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const response = await responsePromise;
  if (!response.ok())
    throw new Error(`create failed: ${response.status()} ${await response.text()}`);
  return /** @type {{id:string}} */ (await response.json());
}

export async function updateProofRow(page, id, note) {
  await page.goto(`/entityform-proof/baseline/${id}`);
  await page.getByLabel('Note').fill(note);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/entityform-proof/${id}`) &&
      response.request().method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const response = await responsePromise;
  if (!response.ok())
    throw new Error(`update failed: ${response.status()} ${await response.text()}`);
}

export async function deleteProofRow(page, id) {
  await page.goto(`/entityform-proof/baseline/${id}`);
  page.once('dialog', (dialog) => dialog.accept());
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/entityform-proof') && response.request().method() === 'DELETE',
  );
  await page.getByRole('button', { name: 'Delete' }).click();
  const response = await responsePromise;
  if (!response.ok())
    throw new Error(`delete failed: ${response.status()} ${await response.text()}`);
}
