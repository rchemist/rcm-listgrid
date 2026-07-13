export default async function globalSetup(): Promise<void> {
  const response = await fetch('http://localhost:3100/api/sample-admin/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entities: ['entityform-proof'] }),
  });
  if (!response.ok)
    throw new Error(`proof DB reset failed: ${response.status} ${await response.text()}`);
}
