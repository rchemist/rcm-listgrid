import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useLoadingStore } from './index';

// P0-5 regression — useLoadingStore returned a plain mutable object with no
// subscription mechanism, so components reading it never re-rendered when
// setOpenBaseLoading was called through the public API.

describe('useLoadingStore — reactivity (P0-5 regression)', () => {
  function Probe() {
    const { openBaseLoading, setOpenBaseLoading } = useLoadingStore();
    return (
      <div>
        <span data-testid="loading-state">{String(openBaseLoading)}</span>
        <button onClick={() => setOpenBaseLoading(!openBaseLoading)}>toggle</button>
      </div>
    );
  }

  it('re-renders when setOpenBaseLoading is called through the public hook', () => {
    const { getByTestId, getByText } = render(<Probe />);
    expect(getByTestId('loading-state').textContent).toBe('false');

    fireEvent.click(getByText('toggle'));
    expect(getByTestId('loading-state').textContent).toBe('true');

    fireEvent.click(getByText('toggle'));
    expect(getByTestId('loading-state').textContent).toBe('false');
  });
});
