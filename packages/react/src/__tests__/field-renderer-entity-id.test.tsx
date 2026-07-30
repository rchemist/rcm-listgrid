import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntityForm, FormField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { ViewEntityForm } from '../components/ViewEntityForm';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { registerFieldRenderer } from '../registry/field-renderer-registry';

class IdentityProbeField extends FormField<unknown> {
  constructor() {
    super('probe', 1, 'custom');
  }
}

registerDefaultRenderers();
registerFieldRenderer('custom', ({ entityId }) => (
  <span data-testid="renderer-entity-id">{entityId}</span>
));

describe('FieldRenderer EntityForm identity context', () => {
  it('passes EntityForm identity to a custom renderer without an id field', async () => {
    const entityForm = new EntityForm('IdentityProbeEntityForm', '/identity-probe')
      .withId('record-17')
      .addFields({ items: [new IdentityProbeField()] });
    const store = createFormStore(entityForm);

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <ViewEntityForm entityForm={entityForm} store={store} />
        </AuthProvider>
      </UIProvider>,
    );

    expect(await screen.findByTestId('renderer-entity-id')).toHaveTextContent('record-17');
    expect(entityForm.getFields().some((field) => field.getName() === 'id')).toBe(false);
  });
});
