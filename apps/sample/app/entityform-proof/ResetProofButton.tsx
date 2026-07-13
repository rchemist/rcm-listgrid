'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ResetProofButton() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'resetting' | 'done' | 'error'>('idle');

  async function reset() {
    setState('resetting');
    const response = await fetch('/api/sample-admin/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entities: ['entityform-proof'] }),
    });
    setState(response.ok ? 'done' : 'error');
    if (response.ok) router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={reset} disabled={state === 'resetting'}>
        Proof 데이터 초기화
      </button>{' '}
      <span role="status">
        {state === 'done' ? 'seed 1행으로 초기화됨' : state === 'error' ? '초기화 실패' : ''}
      </span>
    </div>
  );
}
