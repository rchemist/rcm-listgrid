import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SaveButton } from './SaveButton';

type SaveButtonProps = React.ComponentProps<typeof SaveButton>;

describe('SaveButton — latest EntityForm snapshot', () => {
  it('saves latestEntityFormRef.current instead of the stale entityForm prop', async () => {
    const snapshotForm = {
      id: 'save-form',
      save: vi.fn(),
    };
    const latestForm = {
      id: 'save-form',
      save: vi.fn().mockResolvedValue({
        entityForm: undefined,
        errors: [],
      }),
    };
    latestForm.save.mockResolvedValue({
      entityForm: latestForm,
      errors: [],
    });

    const setEntityForm = vi.fn();
    const props = {
      entityForm: snapshotForm,
      latestEntityFormRef: { current: latestForm },
      setEntityForm,
      pathname: '/entities/save-form',
      router: {},
      setErrors: vi.fn(),
      setNotifications: vi.fn(),
    } as unknown as SaveButtonProps;

    render(<SaveButton {...props} />);
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(latestForm.save).toHaveBeenCalledTimes(1);
    });
    expect(snapshotForm.save).not.toHaveBeenCalled();
    expect(setEntityForm).toHaveBeenCalledWith(latestForm);
  });
});
