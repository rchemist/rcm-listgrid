import { describe, expect, it, vi } from 'vitest';
import {
  CustomValidation,
  EntityForm,
  ManyToOneField,
  StringField,
  ValidateResult,
  type BackendAdapter,
  type BackendError,
  type FieldEvalContext,
} from '@listgrid/schema-core';
import { createFormStore } from '../form-store';
import { createFormController } from '../form-controller';

// W2-5 (spec §6.2) — createFormController's save/delete/reload/validate flow.
// Covers the 6 proof scenarios the wave briefing calls out (success /
// validation-fail / cancel / server fieldErrors mapping / suppress-generic /
// clear-on-success), the migrated EF6 semantics (an onBeforeSave handler
// transforming the payload via setData; a throwing handler logged+skipped
// per spec §4.2 — REVERSING the old "throwing transform propagates"
// assertion this replaces, see store.test.ts's removal note), and light
// delete/reload/validate coverage. The revision inject step (spec §3.1/§6.2,
// CAP-07; W4-4) — save payload `revisionEntityName` key + `adapter.remove`'s
// 3rd arg — is covered in its own describe block below. The capability gate
// (CAP-06; W3-2) is covered separately below, in its own describe block.

function WidgetForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withRequired(true).withLabel('Name')],
  });
}

/** Minimal BackendAdapter double — every method is a vi.fn(); tests override only what they exercise. */
function fakeAdapter(overrides: Partial<BackendAdapter> = {}): BackendAdapter {
  return {
    list: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    ...overrides,
  };
}

describe('createFormController.save (spec §6.2)', () => {
  it('sets saving synchronously, coalesces duplicate save calls, and always unlocks after settle', async () => {
    let resolveCreate!: (value: Record<string, unknown>) => void;
    const create = vi.fn(
      () =>
        new Promise<Record<string, unknown>>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const first = controller.save();
    const second = controller.save();
    expect(store.getState().saving).toBe(true);
    expect(first).toBe(second);

    await vi.waitFor(() => expect(resolveCreate).toBeTypeOf('function'));
    resolveCreate({ id: '1', name: 'Widget A' });
    await expect(first).resolves.toEqual({
      ok: true,
      result: { id: '1', name: 'Widget A' },
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(store.getState().saving).toBe(false);
  });

  it('never sends a value changed while validation is in flight', async () => {
    let resolveValidation!: (result: ValidateResult) => void;
    const validation = new CustomValidation(
      'slow',
      () =>
        new Promise<ValidateResult>((resolve) => {
          resolveValidation = resolve;
        }),
    );
    const entityForm = new EntityForm('RaceForm', '/race').addFields({
      items: [new StringField('name', 1).withValidations(validation)],
    });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'old-valid');
    const create = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const pending = controller.save();
    expect(store.getState().saving).toBe(true);
    await vi.waitFor(() => expect(resolveValidation).toBeTypeOf('function'));
    store.getState().setValue('name', 'new-unvalidated');
    resolveValidation(ValidateResult.success());

    await expect(pending).resolves.toEqual({ ok: false, reason: 'validation' });
    expect(create).not.toHaveBeenCalled();
    expect(store.getState().saving).toBe(false);
  });
  it('success: validates, builds the payload, calls adapter.create, and returns { ok: true, result }', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const created = { id: '1', name: 'Widget A' };
    const create = vi.fn(async (url: string, data: Record<string, unknown>) => {
      expect(url).toBe('/widget');
      expect(data).toEqual({ name: 'Widget A' });
      return created;
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: true, result: created });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('uses create when id is absent even if fetchedData makes the store render as update', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm, { fetchedData: { name: 'Prefilled' } });
    store.getState().setValue('name', 'Prefilled');
    const create = vi.fn(async () => ({ id: 'new-id', name: 'Prefilled' }));
    const update = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create, update }),
    });

    expect(store.getState().renderType).toBe('update');
    expect(entityForm.getId()).toBeUndefined();
    await expect(controller.save()).resolves.toMatchObject({ ok: true });
    expect(create).toHaveBeenCalledTimes(1);
    expect(update).not.toHaveBeenCalled();
  });

  it('validation-fail: skips the adapter call entirely and returns { ok: false }', async () => {
    const entityForm = WidgetForm(); // 'name' required, left blank
    const store = createFormStore(entityForm);
    const create = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'validation' });
    expect(create).not.toHaveBeenCalled();
    expect(store.getState().fields.name?.errors?.length).toBeGreaterThan(0); // validateAll already populated this
  });

  it('cancel: an onBeforeSave handler calling ctx.cancel(reason) stops the flow before the adapter call', async () => {
    const entityForm = WidgetForm().onBeforeSave((ctx) => {
      ctx.cancel('user declined');
    });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'cancelled', cancelled: 'user declined' });
    expect(create).not.toHaveBeenCalled();
    expect(store.getState().messages).toContainEqual(
      expect.objectContaining({ severity: 'info', text: 'user declined' }),
    );
  });

  it('reason-less cancel is distinguishable from a validation failure (D2 #W2-5)', async () => {
    // exactOptional forbids `cancelled: undefined`, so before the `reason`
    // discriminant a reason-less cancel() and a validation failure both
    // resolved a bare `{ ok: false }` — indistinguishable. `reason` fixes that.
    const entityForm = WidgetForm().onBeforeSave((ctx) => {
      ctx.cancel(); // no reason
    });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'cancelled' });
    expect(outcome).not.toHaveProperty('cancelled'); // no reason string given
    expect(create).not.toHaveBeenCalled();
  });

  it('server fieldErrors mapping: a declared field is keyed by NAME (not label)', async () => {
    const entityForm = WidgetForm().withId('1'); // update mode
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const error: BackendError = {
      code: 'VALIDATION',
      message: 'Validation failed',
      fieldErrors: { name: ['too short'] },
    };
    const update = vi.fn(async () => {
      throw error;
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'error', error });
    expect(store.getState().fields.name?.errors).toEqual([{ message: 'too short' }]);
  });

  it('maps multiple field errors and multiple global validation errors independently', async () => {
    const entityForm = WidgetForm().withId('1');
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const error: BackendError = {
      code: 'VALIDATION',
      message: 'Validation failed',
      fieldErrors: { name: ['too short', 'reserved'] },
      globalErrors: ['date range is invalid', 'form combination is not allowed'],
    };
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({
        update: vi.fn(async () => {
          throw error;
        }),
      }),
    });

    await controller.save();

    expect(store.getState().fields.name?.errors).toEqual([
      { message: 'too short' },
      { message: 'reserved' },
    ]);
    expect(store.getState().globalErrors).toEqual([
      'date range is invalid',
      'form combination is not allowed',
    ]);
  });

  it('an unmatched fieldErrors key becomes a global validation error', async () => {
    const entityForm = WidgetForm().withId('1');
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const error: BackendError = {
      code: 'VALIDATION',
      message: 'Validation failed',
      fieldErrors: { nonField: ['server-side check failed'] },
    };
    const update = vi.fn(async () => {
      throw error;
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await controller.save();

    expect(store.getState().globalErrors).toEqual(['server-side check failed']);
  });

  it('suppress-generic: error.message is NOT banner-ed when fieldErrors is present', async () => {
    const entityForm = WidgetForm().withId('1');
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const error: BackendError = {
      code: 'VALIDATION',
      message: 'Validation failed',
      fieldErrors: { name: ['too short'] },
    };
    const update = vi.fn(async () => {
      throw error;
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await controller.save();

    expect(store.getState().messages.some((m) => m.text === 'Validation failed')).toBe(false);
    expect(store.getState().messages.some((m) => m.key === 'save-error')).toBe(false);
  });

  it('no fieldErrors: error.message IS banner-ed as { key: "save-error" }', async () => {
    const entityForm = WidgetForm().withId('1');
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const error: BackendError = { code: 'UNKNOWN', message: 'network down' };
    const update = vi.fn(async () => {
      throw error;
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'error', error });
    expect(store.getState().messages).toContainEqual(
      expect.objectContaining({ key: 'save-error', severity: 'error', text: 'network down' }),
    );
  });

  it('clear-on-success: a non-persistent message is cleared, a persistent one survives', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    store.getState().addMessage({ key: 'stale', severity: 'warning', text: 'stale' });
    store
      .getState()
      .addMessage({ key: 'sticky', severity: 'info', text: 'sticky', persistent: true });
    const create = vi.fn(async () => ({ id: '1' }));
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    await controller.save();

    const keys = store.getState().messages.map((m) => m.key);
    expect(keys).not.toContain('stale');
    expect(keys).toContain('sticky');
  });

  it('onBeforeSave setData mutates the payload the adapter receives (successor to EF6 submitTransform)', async () => {
    const entityForm = WidgetForm().onBeforeSave((ctx) => {
      ctx.setData({ ...ctx.data, extra: true });
    });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async (_url: string, data: Record<string, unknown>) => {
      expect(data).toEqual({ name: 'Widget A', extra: true });
      return { id: '1' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome.ok).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('a throwing onBeforeSave handler is logged + SKIPPED, not propagated (spec §4.2) — remaining handlers still run and save proceeds', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const calls: string[] = [];
    const entityForm = WidgetForm()
      .onBeforeSave(() => {
        calls.push('first');
        throw new Error('boom');
      })
      .onBeforeSave((ctx) => {
        calls.push('second');
        ctx.setData({ ...ctx.data, seenSecond: true });
      });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async (_url: string, data: Record<string, unknown>) => {
      expect(data).toEqual({ name: 'Widget A', seenSecond: true });
      return { id: '1' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(calls).toEqual(['first', 'second']);
    expect(outcome.ok).toBe(true); // NOT cancelled/failed — the throw did not propagate
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('createFormController modifiedFields update contract', () => {
  it('sends only changed declared field names and preserves revisionEntityName', async () => {
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new StringField('name', 1), new StringField('description', 2)],
      })
      .withId('42')
      .withRevision('widget-revision');
    const store = createFormStore(entityForm);
    store.getState().hydrate({ name: 'Old name', description: 'Untouched' });
    store.getState().setValue('name', 'New name');
    const update = vi.fn(async (_url: string, _id: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        name: 'New name',
        description: 'Untouched',
        revisionEntityName: 'widget-revision',
        modifiedFields: ['name'],
      });
      return { id: '42' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('lists an explicitly cleared field so nullable values can be applied', async () => {
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new StringField('name', 1), new StringField('description', 2)],
      })
      .withId('42');
    const store = createFormStore(entityForm);
    store.getState().hydrate({ name: 'Widget', description: 'Remove me' });
    store.getState().setValue('description', null);
    const update = vi.fn(async (_url: string, _id: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        name: 'Widget',
        description: null,
        modifiedFields: ['description'],
      });
      return { id: '42' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
  });

  it('uses a ManyToOne declared name while its payload is flattened to the id key', async () => {
    const RelatedForm = () => new EntityForm('SiteEntityForm', '/site');
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [
          new ManyToOneField('site', 1, { entityForm: RelatedForm }),
          new ManyToOneField('owner', 2, { entityForm: RelatedForm }),
        ],
      })
      .withId('42');
    const store = createFormStore(entityForm);
    store.getState().hydrate({
      site: { id: 'site-1', name: 'Old site' },
      owner: { id: 'owner-1', name: 'Old owner label' },
    });
    store.getState().setValue('site', { id: 'site-2', name: 'New site' });
    store.getState().setValue('owner', { id: 'owner-1', name: 'Updated owner label' });
    const update = vi.fn(async (_url: string, _id: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        siteId: 'site-2',
        ownerId: 'owner-1',
        modifiedFields: ['site'],
      });
      return { id: '42' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
  });

  it('lists a cleared ManyToOne relation by its declared name without throwing', async () => {
    const RelatedForm = () => new EntityForm('SiteEntityForm', '/site');
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new ManyToOneField('site', 1, { entityForm: RelatedForm })],
      })
      .withId('42');
    const store = createFormStore(entityForm);
    store.getState().hydrate({ site: { id: 'S1', name: 'X' } });
    store.getState().setValue('site', null);
    const update = vi.fn(async (_url: string, _id: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        site: null,
        modifiedFields: ['site'],
      });
      return { id: '42' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('lists a ManyToOne relation selected from a null baseline without throwing', async () => {
    const RelatedForm = () => new EntityForm('SiteEntityForm', '/site');
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new ManyToOneField('site', 1, { entityForm: RelatedForm })],
      })
      .withId('42');
    const store = createFormStore(entityForm);
    store.getState().hydrate({ site: null });
    store.getState().setValue('site', { id: 'S1' });
    const update = vi.fn(async (_url: string, _id: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        siteId: 'S1',
        modifiedFields: ['site'],
      });
      return { id: '42' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('lists both directions of undefined-to-object relation changes without throwing', async () => {
    const RelatedForm = () => new EntityForm('SiteEntityForm', '/site');
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [
          new ManyToOneField('selectedSite', 1, { entityForm: RelatedForm }),
          new ManyToOneField('clearedSite', 2, { entityForm: RelatedForm }),
        ],
      })
      .withId('42');
    const store = createFormStore(entityForm);
    store.getState().hydrate({
      selectedSite: undefined,
      clearedSite: { id: 'S2', name: 'Y' },
    });
    store.getState().setValue('selectedSite', { id: 'S1' });
    store.getState().setValue('clearedSite', undefined);
    const update = vi.fn(async (_url: string, _id: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        selectedSiteId: 'S1',
        clearedSite: undefined,
        modifiedFields: ['selectedSite', 'clearedSite'],
      });
      return { id: '42' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('treats null and undefined relation values as equal', async () => {
    const RelatedForm = () => new EntityForm('SiteEntityForm', '/site');
    const entityForm = new EntityForm('WidgetEntityForm', '/widget')
      .addFields({
        items: [new ManyToOneField('site', 1, { entityForm: RelatedForm })],
      })
      .withId('42');
    const store = createFormStore(entityForm);
    store.getState().hydrate({ site: null });
    store.getState().setValue('site', undefined);
    const update = vi.fn(async (_url: string, _id: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        site: undefined,
        modifiedFields: [],
      });
      return { id: '42' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('does not add modifiedFields to create payloads', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async (_url: string, data: Record<string, unknown>) => {
      expect(data).toEqual({ name: 'Widget A' });
      expect(data).not.toHaveProperty('modifiedFields');
      return { id: '1' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    await expect(controller.save()).resolves.toMatchObject({ ok: true });
  });
});

describe('createFormController.delete (spec §6.2)', () => {
  it("create-mode, no opts.ids, no bound id: returns { ok: false, reason: 'capability' } without calling adapter.remove (R12 — no [undefined] built)", async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    const remove = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: false, reason: 'capability' });
    expect(remove).not.toHaveBeenCalled();
  });

  it('success: calls adapter.remove with [id] and returns { ok: true, result: undefined }', async () => {
    const entityForm = WidgetForm().withId('42');
    const store = createFormStore(entityForm);
    const remove = vi.fn(async (url: string, ids: string[]) => {
      expect(url).toBe('/widget');
      expect(ids).toEqual(['42']);
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: true, result: undefined });
  });

  it('cancel: an onBeforeDelete handler calling ctx.cancel(reason) stops the flow before adapter.remove', async () => {
    const entityForm = WidgetForm()
      .withId('42')
      .onBeforeDelete((ctx) => {
        ctx.cancel('confirm declined');
      });
    const store = createFormStore(entityForm);
    const remove = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: false, reason: 'cancelled', cancelled: 'confirm declined' });
    expect(remove).not.toHaveBeenCalled();
  });

  it('adapter error: addMessage with the generic text, returns { ok: false, error }', async () => {
    const entityForm = WidgetForm().withId('42');
    const store = createFormStore(entityForm);
    const error: BackendError = { code: 'FORBIDDEN', message: 'not allowed' };
    const remove = vi.fn(async () => {
      throw error;
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: false, reason: 'error', error });
    expect(store.getState().messages).toContainEqual(
      expect.objectContaining({ key: 'delete-error', severity: 'error', text: 'not allowed' }),
    );
  });
});

// revision inject (spec §3.1/§6.2, CAP-07; W4-4) — save flow step 5 / delete
// flow step 4. `entityForm.getRevisionEntityName()` is the honest-undefined
// getter (schema-core entity-form.ts); the controller injects/passes it ONLY
// when withRevision was declared (spec §6.2 "설정 시에만") — no
// always-truthy fallback survives into the wire payload.
describe('createFormController revision inject (spec §3.1/§6.2, CAP-07; W4-4)', () => {
  it('save: withRevision declared -> the adapter.create payload carries revisionEntityName with the declared value', async () => {
    const entityForm = WidgetForm().withRevision('widget-revision');
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async (_url: string, data: Record<string, unknown>) => {
      expect(data).toEqual({ name: 'Widget A', revisionEntityName: 'widget-revision' });
      return { id: '1' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome.ok).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('save: withRevision NOT declared -> the adapter payload has no revisionEntityName key at all', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async (_url: string, data: Record<string, unknown>) => {
      expect(data).toEqual({ name: 'Widget A' });
      expect('revisionEntityName' in data).toBe(false);
      return { id: '1' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome.ok).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('save: revision inject happens AFTER onBeforeSave (a handler-set value is preserved and the revision key is layered on top)', async () => {
    const entityForm = WidgetForm()
      .withRevision('widget-revision')
      .onBeforeSave((ctx) => {
        ctx.setData({ ...ctx.data, extra: true });
      });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async (_url: string, data: Record<string, unknown>) => {
      expect(data).toEqual({
        name: 'Widget A',
        extra: true,
        revisionEntityName: 'widget-revision',
      });
      return { id: '1' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    await controller.save();

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('delete: withRevision declared -> adapter.remove is called with the declared value as its 3rd arg', async () => {
    const entityForm = WidgetForm().withId('42').withRevision('widget-revision');
    const store = createFormStore(entityForm);
    const remove = vi.fn(async (url: string, ids: string[], revision?: string) => {
      expect(url).toBe('/widget');
      expect(ids).toEqual(['42']);
      expect(revision).toBe('widget-revision');
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: true, result: undefined });
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('delete: withRevision NOT declared -> adapter.remove is called with undefined as its 3rd arg', async () => {
    const entityForm = WidgetForm().withId('42');
    const store = createFormStore(entityForm);
    const remove = vi.fn(async (url: string, ids: string[], revision?: string) => {
      expect(url).toBe('/widget');
      expect(ids).toEqual(['42']);
      expect(revision).toBeUndefined();
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: true, result: undefined });
    expect(remove).toHaveBeenCalledTimes(1);
  });
});

// CAP-06 (spec §3.4/§6.2; W3-2) — capability gate, save/delete step 1. A
// conditional (role-based) capability is resolved through the SAME
// FieldEvalContext (renderType/session/values) every other conditional uses.
const isAdmin = async (ctx: FieldEvalContext): Promise<boolean> =>
  ctx.session?.roles?.includes('ADMIN') ?? false;

describe('createFormController capability gate (spec §3.4/§6.2, CAP-06; W3-2)', () => {
  it('create mode + unauthorized session: save() returns { ok: false }, adapter.create is NOT called', async () => {
    const entityForm = WidgetForm().withCapabilities({ create: isAdmin });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
      session: { roles: ['USER'] },
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'capability' });
    expect(create).not.toHaveBeenCalled();
  });

  it('create mode + authorized session: capability passes and the existing flow (validate -> onBeforeSave -> adapter) runs unaffected', async () => {
    const entityForm = WidgetForm().withCapabilities({ create: isAdmin });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async () => ({ id: '1' }));
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
      session: { roles: ['ADMIN'] },
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: true, result: { id: '1' } });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('update mode + capabilities.update: false: save() returns { ok: false }, adapter.update is NOT called', async () => {
    const entityForm = WidgetForm().withId('1').withCapabilities({ update: false });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const update = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: false, reason: 'capability' });
    expect(update).not.toHaveBeenCalled();
  });

  it('passes EntityForm identity to update capability predicates without an id field', async () => {
    const updateAllowed = vi.fn(async (ctx: FieldEvalContext) => ctx.entityId === 'entity-42');
    const entityForm = WidgetForm().withId('entity-42').withCapabilities({ update: updateAllowed });
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const update = vi.fn(async () => ({ id: 'entity-42' }));
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update }),
    });

    await expect(controller.save()).resolves.toEqual({
      ok: true,
      result: { id: 'entity-42' },
    });
    expect(updateAllowed).toHaveBeenCalledWith(
      expect.objectContaining({ entityId: 'entity-42', renderType: 'update' }),
    );
    expect(entityForm.getFields().some((field) => field.getName() === 'id')).toBe(false);
  });

  it('capabilities.delete conditional: unauthorized session -> del() returns { ok: false }, adapter.remove NOT called; authorized session -> passes through', async () => {
    const entityForm = WidgetForm().withId('42').withCapabilities({ delete: isAdmin });
    const remove = vi.fn(async () => undefined);

    const deniedStore = createFormStore(entityForm);
    const deniedController = createFormController({
      entityForm,
      store: deniedStore,
      adapter: fakeAdapter({ remove }),
      session: { roles: ['USER'] },
    });
    const deniedOutcome = await deniedController.delete();
    expect(deniedOutcome).toEqual({ ok: false, reason: 'capability' });
    expect(remove).not.toHaveBeenCalled();

    const allowedStore = createFormStore(entityForm);
    const allowedController = createFormController({
      entityForm,
      store: allowedStore,
      adapter: fakeAdapter({ remove }),
      session: { roles: ['ADMIN'] },
    });
    const allowedOutcome = await allowedController.delete();
    expect(allowedOutcome).toEqual({ ok: true, result: undefined });
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('no capabilities declared: save/delete proceed exactly as before (default-true, backward compatible)', async () => {
    const entityForm = WidgetForm().withId('1');
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const update = vi.fn(async () => ({ id: '1' }));
    const remove = vi.fn(async () => undefined);
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ update, remove }),
    });

    expect(await controller.save()).toEqual({ ok: true, result: { id: '1' } });
    expect(update).toHaveBeenCalledTimes(1);
    expect(await controller.delete()).toEqual({ ok: true, result: undefined });
    expect(remove).toHaveBeenCalledTimes(1);
  });
});

// W3-5 (spec §3.1/§6.1, CAP-27) — withReadOnly is a display/edit-affordance
// contract only (hides the built-in Save button + ORs every field's
// effective readOnly). It does NOT hard-gate controller.save/delete —
// write-blocking is withCapabilities' job. These tests lock the ABSENCE of
// any formReadOnly check in the controller.
describe('createFormController + withReadOnly (spec §3.1/§6.1, CAP-27; W3-5) — no save/delete hard-gate', () => {
  it('withReadOnly(true) + capability allowed: save() still calls adapter.create (formReadOnly does not block writes)', async () => {
    const entityForm = WidgetForm().withReadOnly(true);
    const store = createFormStore(entityForm);
    store.getState().setValue('name', 'Widget A');
    const create = vi.fn(async () => ({ id: '1' }));
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ create }),
    });

    const outcome = await controller.save();

    expect(outcome).toEqual({ ok: true, result: { id: '1' } });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('withReadOnly(true) + capability allowed: delete() still calls adapter.remove (formReadOnly does not block writes)', async () => {
    const entityForm = WidgetForm().withId('1').withReadOnly(true);
    const store = createFormStore(entityForm);
    const remove = vi.fn(async () => undefined);
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: true, result: undefined });
    expect(remove).toHaveBeenCalledTimes(1);
  });
});

describe('createFormController.validate / reload (spec §6.2)', () => {
  it('validate() delegates to store.validateAll()', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    const controller = createFormController({ entityForm, store, adapter: fakeAdapter() });

    expect(await controller.validate()).toBe(false); // required 'name' left blank
    store.getState().setValue('name', 'Widget A');
    expect(await controller.validate()).toBe(true);
  });

  it('reload() is a no-op in create mode (no id to re-fetch)', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    const getOne = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ getOne }),
    });

    await controller.reload();

    expect(getOne).not.toHaveBeenCalled();
  });

  it('reload() re-fetches and reflects the fresh record into the SAME store instance', async () => {
    const entityForm = WidgetForm().withId('42');
    const store = createFormStore(entityForm, { fetchedData: { name: 'stale' } });
    store.getState().hydrate({ name: 'stale' });
    const getOne = vi.fn(async (url: string, id: string) => {
      expect(url).toBe('/widget');
      expect(id).toBe('42');
      return { name: 'fresh' };
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ getOne }),
    });

    await controller.reload();

    expect(getOne).toHaveBeenCalledTimes(1);
    expect(store.getState().getValue('name')).toBe('fresh');
  });

  it('reload() replaces the fetched baseline used by fields added later at runtime', async () => {
    const entityForm = WidgetForm().withId('42');
    const store = createFormStore(entityForm, {
      fetchedData: { name: 'old-name', late: 'old-value' },
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({
        getOne: vi.fn(async () => ({ name: 'fresh-name', late: 'fresh-value' })),
      }),
    });

    store.getState().setValue('name', 'local-edit');
    await controller.reload();
    expect(store.getState().getValue('name')).toBe('fresh-name');
    expect(store.getState().isDirty()).toBe(false);

    store.getState().addField(new StringField('late', 2));
    expect(store.getState().getValue('late')).toBe('fresh-value');
  });

  it('reload() keeps the ORIGINAL store authoritative: post-reload edits notify its subscribers, reflect in getValue, and a save-error surfaces on it', async () => {
    const entityForm = WidgetForm().withId('42');
    const store = createFormStore(entityForm, { fetchedData: { name: 'stale' } });
    store.getState().hydrate({ name: 'stale' });
    const getOne = vi.fn(async () => ({ name: 'fresh' }));
    const update = vi.fn(async () => {
      const err: BackendError = { code: 'UNKNOWN', message: 'saved elsewhere' };
      throw err;
    });
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ getOne, update }),
    });

    await controller.reload();

    // subscribe to the SAME store AFTER reload — pre-fix, reload() replaced
    // the store's action closures with a throwaway store's, so a write after
    // reload lands on the throwaway store and this subscriber never fires.
    const seen: unknown[] = [];
    const unsub = store.subscribe((s) => {
      seen.push(s.fields.name?.current);
    });
    store.getState().setValue('name', 'edited');
    expect(seen).toContain('edited');
    expect(store.getState().getValue('name')).toBe('edited');
    unsub();

    const outcome = await controller.save();
    expect(outcome).toEqual({
      ok: false,
      reason: 'error',
      error: { code: 'UNKNOWN', message: 'saved elsewhere' },
    });
    expect(store.getState().messages).toContainEqual({
      key: 'save-error',
      severity: 'error',
      text: 'saved elsewhere',
    });
  });
});
