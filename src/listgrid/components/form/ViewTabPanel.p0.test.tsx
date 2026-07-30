import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ViewTabPanel } from './ViewTabPanel';

vi.mock('@headlessui/react', () => ({
  Tab: {
    Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock('./ViewFieldGroup', () => ({
  ViewFieldGroup: ({ groupId }: { groupId: string }) => (
    <input data-testid={`group-${groupId}`} defaultValue="draft" />
  ),
}));

type ViewTabPanelProps = React.ComponentProps<typeof ViewTabPanel>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('ViewTabPanel — ordinary EntityForm commits preserve the field subtree', () => {
  it('keeps the existing focused field mounted while group recomputation is pending', async () => {
    const initialForm = {
      getViewableFieldGroups: vi.fn().mockResolvedValue(['main']),
    };
    const nextGroups = deferred<string[]>();
    const nextForm = {
      getViewableFieldGroups: vi.fn(() => nextGroups.promise),
    };

    const baseProps = {
      id: 'main-tab',
      tabIndex: 'main-tab',
      readonly: false,
    };
    const { rerender } = render(
      <ViewTabPanel
        {...baseProps}
        entityForm={initialForm as unknown as ViewTabPanelProps['entityForm']}
      />,
    );

    const focusedField = await screen.findByTestId('group-main');
    focusedField.focus();
    expect(focusedField).toHaveFocus();

    rerender(
      <ViewTabPanel
        {...baseProps}
        entityForm={nextForm as unknown as ViewTabPanelProps['entityForm']}
      />,
    );

    expect(screen.getByTestId('group-main')).toBe(focusedField);
    expect(focusedField).toHaveFocus();
    expect(screen.queryByText('이 단계에서는 표시할 내용이 없습니다.')).not.toBeInTheDocument();

    nextGroups.resolve(['main']);
    await waitFor(() => {
      expect(nextForm.getViewableFieldGroups).toHaveBeenCalled();
    });
    expect(screen.getByTestId('group-main')).toBe(focusedField);
  });
});
