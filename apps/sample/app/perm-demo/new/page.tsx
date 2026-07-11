'use client';

import { useMemo } from 'react';
import { createFormStore } from '@listgrid/state';
import { ViewEntityForm } from '@listgrid/react';
import { PermDemoEntityForm } from '../../../lib/entities/perm-demo';

// W3-1 E2E fixture page — see lib/entities/perm-demo.ts header. create-mode
// only (no id => createFormStore is fully synchronous, no adapter fetch), and
// `onSave` is intentionally a no-op: e2e/tab-permission.spec.ts only reads
// tab/group visibility, it never clicks Save (no mock-backend route backs
// this entity).
export default function PermDemoNewPage() {
  const entityForm = useMemo(() => PermDemoEntityForm(), []);
  const store = useMemo(() => createFormStore(entityForm), [entityForm]);

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
    </main>
  );
}
