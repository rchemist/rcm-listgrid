import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// A field whose required predicate is an async ValuedBoolean that ALWAYS
// rejects. Under the pre-R5 Promise.all path this rejection (a) dropped all
// three gates (required stayed at the permissive seed `false` -> no
// aria-required) and (b) surfaced as an unhandled rejection from the discarded
// async IIFE promise.
function throwingRequiredForm(): EntityForm {
  return new EntityForm('ThrowEntityForm', '/throw').addFields({
    items: [
      new StringField('name', 1)
        .withLabel('Name')
        .withRequired(() => Promise.reject(new Error('boom'))),
    ],
  });
}

function renderForm(entityForm: EntityForm) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('R5 — FieldRenderer predicate error fallback', () => {
  it('a throwing required predicate fails CLOSED (stays required) and emits no unhandled rejection', async () => {
    const seen: unknown[] = [];
    const handler = (reason: unknown) => seen.push(reason);
    process.on('unhandledRejection', handler);
    try {
      renderForm(throwingRequiredForm());
      const nameInput = await screen.findByLabelText(/^Name/);
      // ASSERT 1: required stays enforced despite the throw (pre-R5: absent).
      await waitFor(() => expect(nameInput).toHaveAttribute('aria-required', 'true'));
      // let any discarded rejected promise surface on the process.
      await new Promise((r) => setTimeout(r, 0));
    } finally {
      process.off('unhandledRejection', handler);
    }
    // ASSERT 2: the throwing predicate produced no unhandled rejection
    // (pre-R5: Promise.all propagated the 'boom' error out of the fire-and-
    // forget IIFE).
    expect(seen.some((r) => r instanceof Error && r.message === 'boom')).toBe(false);
  });
});
