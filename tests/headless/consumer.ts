// Headless consumer fixture — spec §10 gate 5 / CAP-25 (W7-2).
//
// Imports ONLY `@rchemist/listgrid/schema` + `/state`. Proves the declaration +
// store layers are consumable with ZERO React/UI peers: this file must
// TYPE-CHECK under `tsc` with no `@types/react` installed (see
// scripts/headless-check.sh). If a shared build chunk ever leaks React types
// into the `/schema` or `/state` surface, tsc here fails — that is the gate.
import { EntityForm, StringField } from '@rchemist/listgrid/schema';
import { createFormStore } from '@rchemist/listgrid/state';

export function buildHeadlessForm(): EntityForm {
  return new EntityForm('HeadlessUser', '/api/user')
    .withTitle('Headless User')
    .addFields({
      tab: { id: 'main', label: 'Main', order: 0 },
      items: [
        new StringField('name', 100).withRequired(true).withLabel('Name'),
        new StringField('email', 200).withLabel('Email'),
      ],
    });
}

export function assertHeadless(): string {
  const form = buildHeadlessForm();
  const store = createFormStore(form);

  const nameField = form.getField('name');
  if (!nameField || nameField.getLabel() !== 'Name') {
    throw new Error('headless: EntityForm field lookup failed');
  }
  if (typeof store.getState().getValue !== 'function') {
    throw new Error('headless: form store missing getValue');
  }
  return form.name;
}
