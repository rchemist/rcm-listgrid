// EG1 — save-payload permission gate (SECURITY). isPermitted (schema-core)
// is the canonical predicate; this suite locks in that toSaveData() consults
// it per-field, BEFORE the field ever reaches the payload — a hidden-but-
// unpermitted field must never be smuggled through a save request.
//
// Semantics under test (packages/schema-core/src/permission.ts):
//   - requiredPermissions undefined/empty  -> always permitted.
//   - requiredPermissions non-empty + userPermissions undefined/empty -> NOT permitted.
//   - requiredPermissions non-empty + ANY overlap with userPermissions -> permitted.
//   - extractPermissions(session) reads `session.roles ?? session.authentication.roles ?? []`.

import { describe, expect, it } from 'vitest';
import { EntityForm, StringField, type Session } from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

function GatedForm(): EntityForm {
  return new EntityForm('GatedEntityForm', '/gated').addFields({
    items: [
      new StringField('name', 1).withLabel('Name'),
      new StringField('salary', 2).withLabel('Salary').withRequiredPermissions('hr:read'),
    ],
  });
}

describe('EG1 — toSaveData permission gate', () => {
  it('a field with no requiredPermissions is always present, even with no session', () => {
    const store = createFormStore(GatedForm());
    store.getState().setValue('name', 'Ann');
    const save = store.getState().toSaveData();
    expect(save.name).toBe('Ann');
  });

  it('a field with requiredPermissions the session LACKS is ABSENT from toSaveData (no session)', () => {
    const store = createFormStore(GatedForm());
    store.getState().setValue('salary', 5000);
    const save = store.getState().toSaveData();
    expect('salary' in save).toBe(false);
  });

  it('a field with requiredPermissions the session LACKS is ABSENT from toSaveData (mismatched role)', () => {
    const session: Session = { roles: ['sales:read'] };
    const store = createFormStore(GatedForm(), { session });
    store.getState().setValue('salary', 5000);
    const save = store.getState().toSaveData();
    expect('salary' in save).toBe(false);
  });

  it('a field with requiredPermissions the session HAS is PRESENT in toSaveData (session.roles)', () => {
    const session: Session = { roles: ['hr:read'] };
    const store = createFormStore(GatedForm(), { session });
    store.getState().setValue('salary', 5000);
    const save = store.getState().toSaveData();
    expect(save.salary).toBe(5000);
  });

  it('extracts permissions from session.authentication.roles when session.roles is absent', () => {
    const session: Session = { authentication: { roles: ['hr:read'] } };
    const store = createFormStore(GatedForm(), { session });
    store.getState().setValue('salary', 5000);
    const save = store.getState().toSaveData();
    expect(save.salary).toBe(5000);
  });
});
