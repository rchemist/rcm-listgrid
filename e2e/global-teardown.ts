import { rmSync } from 'node:fs';

export default function globalTeardown(): void {
  const directory = process.env.LISTGRID_E2E_DB_DIRECTORY;
  if (directory) rmSync(directory, { recursive: true, force: true });
}
