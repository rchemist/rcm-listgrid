import { describe, expect, it } from 'vitest';
import {
  EmailField,
  EntityForm,
  StringField,
  ValidateResult,
  XrefMappingField,
  XrefPreferMappingField,
  type FieldEvalContext,
  type Validation,
} from '@listgrid/schema-core';
import { createFormStore } from '../form-store';

// EF1 — reactive field META override (the foundation the imperative lifecycle
// onChanges/onInitialize, EF2/EF3, builds on). Covers the state-layer half:
// setMeta/getMeta bookkeeping + validateField/validateAll consulting the
// override so an explicit `false` still wins over a declared `true` (and
// vice versa) via `??`.

function TwoFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('name', 1).withLabel('Name'), // NOT required by declaration
      new StringField('code', 2).withRequired(true).withLabel('Code'), // required by declaration
      new EmailField('email', 3).withLabel('Email'), // auto-attaches EmailValidation
    ],
  });
}

/** A trivial Validation that always fails with `message` (or a default). */
function alwaysFails(message = 'always fails'): Validation {
  return {
    id: 'always-fails',
    message,
    async validate(_ctx: FieldEvalContext) {
      return ValidateResult.fail(message);
    },
    getErrorMessage() {
      return message;
    },
  };
}

describe('form-store meta override (EF1)', () => {
  it('setMeta shallow-merges across calls; getMeta returns the accumulated override', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setMeta('name', { required: true });
    store.getState().setMeta('name', { hidden: true });
    expect(store.getState().getMeta('name')).toEqual({ required: true, hidden: true });
  });

  it('setMeta on field A leaves field B meta undefined', () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setMeta('name', { required: true });
    expect(store.getState().getMeta('code')).toBeUndefined();
  });

  it('validateField: override.required=true makes a blank, declared-not-required field INVALID', async () => {
    const store = createFormStore(TwoFieldForm());
    // 'name' is not required by declaration and is blank → would be valid.
    expect(await store.getState().validateField('name')).toBe(true);
    store.getState().setMeta('name', { required: true });
    const valid = await store.getState().validateField('name');
    expect(valid).toBe(false);
    expect(store.getState().fields.name.errors?.length).toBeGreaterThan(0);
  });

  it('validateField: override.required=false makes a blank, declared-required field VALID', async () => {
    const store = createFormStore(TwoFieldForm());
    // 'code' is required by declaration and is blank → invalid by default.
    expect(await store.getState().validateField('code')).toBe(false);
    store.getState().setMeta('code', { required: false });
    const valid = await store.getState().validateField('code');
    expect(valid).toBe(true);
    expect(store.getState().fields.code.errors ?? []).toHaveLength(0);
  });

  it('validateField: override.validations replaces the declared list — a failing override invalidates', async () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setValue('name', 'anything');
    expect(await store.getState().validateField('name')).toBe(true);
    store.getState().setMeta('name', { validations: [alwaysFails('nope')] });
    const valid = await store.getState().validateField('name');
    expect(valid).toBe(false);
    expect(store.getState().fields.name.errors?.[0].message).toBe('nope');
  });

  it('validateField: an empty override.validations array wins over declared-failing validations', async () => {
    const store = createFormStore(TwoFieldForm());
    // 'email' auto-attaches EmailValidation; an invalid address fails it.
    store.getState().setValue('email', 'not-an-email');
    expect(await store.getState().validateField('email')).toBe(false);
    // Override with an empty list — wins over the declared-failing EmailValidation.
    store.getState().setMeta('email', { validations: [] });
    const valid = await store.getState().validateField('email');
    expect(valid).toBe(true);
    expect(store.getState().fields.email.errors ?? []).toHaveLength(0);
  });

  it("validateAll consults each field's meta override", async () => {
    const store = createFormStore(TwoFieldForm());
    store.getState().setValue('code', 'C1'); // satisfies declared required
    store.getState().setMeta('name', { required: true }); // now name is required too, and blank
    const valid = await store.getState().validateAll();
    expect(valid).toBe(false);
    expect(store.getState().fields.name.errors?.length).toBeGreaterThan(0);
    expect(store.getState().fields.code.errors ?? []).toHaveLength(0);
  });
});

function XrefForm(): EntityForm {
  return new EntityForm('MajorEntityForm', '/major').addFields({
    items: [
      // NOT required by declaration (scenario A base)
      new XrefMappingField('professors', 1, { entityForm: () => new EntityForm('P', '/p') }),
      // required by declaration (scenario B base)
      new XrefMappingField('staffs', 2, {
        entityForm: () => new EntityForm('S', '/s'),
      }).withRequired(true),
      // prefer variant, NOT required by declaration (scenario A prefer)
      new XrefPreferMappingField('college', 3, { entityForm: () => new EntityForm('C', '/c') }),
    ],
  });
}

describe('R3 — EF1 required override on xref fields', () => {
  it('A: setMeta({required:true}) on a declared-not-required xref BLOCKS save when mapped is empty', async () => {
    const store = createFormStore(XrefForm());
    store.getState().setValue('professors', { mapped: [], deleted: [] });
    // declared-not-required + override absent -> valid
    expect(await store.getState().validateField('professors')).toBe(true);
    store.getState().setMeta('professors', { required: true });
    expect(await store.getState().validateField('professors')).toBe(false);
    expect(store.getState().fields.professors.errors?.length).toBeGreaterThan(0);
  });

  it('B: setMeta({required:false}) on a declared-required xref ALLOWS save when mapped is empty', async () => {
    const store = createFormStore(XrefForm());
    store.getState().setValue('staffs', { mapped: [], deleted: [] });
    // declared-required + empty mapped -> invalid before override
    expect(await store.getState().validateField('staffs')).toBe(false);
    store.getState().setMeta('staffs', { required: false });
    expect(await store.getState().validateField('staffs')).toBe(true);
    expect(store.getState().fields.staffs.errors ?? []).toHaveLength(0);
  });

  it('A (prefer): setMeta({required:true}) blocks an empty xrefPreferMapping', async () => {
    const store = createFormStore(XrefForm());
    store.getState().setValue('college', { mapped: [] });
    expect(await store.getState().validateField('college')).toBe(true);
    store.getState().setMeta('college', { required: true });
    expect(await store.getState().validateField('college')).toBe(false);
    expect(store.getState().fields.college.errors?.length).toBeGreaterThan(0);
  });
});
