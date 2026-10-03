import { EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { describe, expect, it } from 'vitest';
import { configureLabels, getLabels } from '../labels';

describe('label catalog configuration', () => {
  it('restores a required-message snapshot without registering the dispatcher recursively', async () => {
    const originalLabels = { ...getLabels() };
    const fieldLabel = 'Required fixture';
    const expectedMessage = originalLabels.requiredMessage(fieldLabel);
    const form = new EntityForm(
      'RequiredMessageRestoreFixture',
      '/required-message-restore',
    ).addFields({
      items: [new StringField('requiredField', 10).withLabel(fieldLabel).withRequired()],
    });
    const store = createFormStore(form);

    try {
      configureLabels({ requiredMessage: (label) => `override:${label}` });
      configureLabels(originalLabels);

      expect(await store.getState().validateAll()).toBe(false);
      expect(store.getState().fields.requiredField.errors?.[0].message).toBe(expectedMessage);
    } finally {
      configureLabels(originalLabels);
    }
  });
});
