import { describe, expect, it } from 'vitest';
// NOTE: this test crosses the schema-core → @listgrid/state boundary (a
// devDependency added for THIS test only, package.json) to exercise the
// exceptOnSave contract through a REAL store round-trip, per the task brief.
// schema-core's own runtime code stays state-free (ADR-0002 layering is
// unaffected — state still depends on schema-core at runtime, never the
// reverse).
import { createFormStore } from '@listgrid/state';
import { EntityForm } from '../entity-form';
import {
  AddressField,
  addressSiblingNames,
  applyFullAddressFields,
  type Address,
} from '../field/address-field';
import { StringField } from '../field/basic-fields';
import type { FieldEvalContext } from '../field/eval-context';

// `value` on FieldEvalContext is the field's own {current,fetched,default}
// slice (see eval-context.ts), NOT the raw scalar — wrap accordingly.
function ctx(current?: unknown, renderType: 'create' | 'update' = 'create'): FieldEvalContext {
  return { renderType, value: { current } };
}

describe('AddressField construction', () => {
  it('takes (name, order[, showMap]), type is address', () => {
    const f = new AddressField('address', 1000, true);
    expect(f.getName()).toBe('address');
    expect(f.getOrder()).toBe(1000);
    expect(f.type).toBe('address');
    expect(f.showMap).toBe(true);
  });

  it('showMap is unset when omitted (no stray `undefined` key confusion)', () => {
    const f = new AddressField('address', 1000);
    expect(f.showMap).toBeUndefined();
  });

  it('is exceptOnSave=true by construction (virtual composite handle)', () => {
    const f = new AddressField('address', 1000);
    expect(f.exceptOnSave).toBe(true);
  });
});

describe('AddressField exceptOnSave — real createFormStore + toSaveData round-trip', () => {
  function AddressEntityForm(): EntityForm {
    return new EntityForm('AddressTestForm', '/address-test').addFields({
      items: [new AddressField('address', 1000), new StringField('address1', 1010)],
    });
  }

  it('a value set on the composite slice never appears in toSaveData, sibling values DO', () => {
    const store = createFormStore(AddressEntityForm());
    const address: Address = {
      state: '서울',
      city: '강남구',
      address1: '테헤란로 1',
      address2: '3층',
      postalCode: '06133',
    };
    // even if something writes the composite's OWN slot directly...
    store.getState().setValue('address', address);
    // ...and the flat sibling that actually carries the save-of-record value...
    store.getState().setValue('address1', '테헤란로 1');

    const saved = store.getState().toSaveData();
    expect(saved.address).toBeUndefined();
    expect(saved.address1).toBe('테헤란로 1');
  });
});

describe('applyFullAddressFields — declares composite + flat siblings', () => {
  it('declares 1 AddressField + 5 flat siblings by default (no lon/lat)', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form);

    const names = form.getFields().map((f) => f.getName());
    expect(names).toEqual(
      expect.arrayContaining(['address', 'state', 'city', 'address1', 'address2', 'postalCode']),
    );
    expect(names).not.toContain('longitude');
    expect(names).not.toContain('latitude');

    const address = form.getField('address');
    expect(address).toBeInstanceOf(AddressField);
    expect((address as AddressField).exceptOnSave).toBe(true);
  });

  it('adds longitude/latitude NumberField siblings when showLongitudeLatitude=true', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { showLongitudeLatitude: true });

    const lon = form.getField('longitude');
    const lat = form.getField('latitude');
    expect(lon?.type).toBe('number');
    expect(lat?.type).toBe('number');
  });

  it('required=true puts required on address1/postalCode siblings only — NOT the composite', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { required: true });

    const address1 = form.getField('address1')!;
    const postalCode = form.getField('postalCode')!;
    const state = form.getField('state')!;
    const composite = form.getField('address')!;

    expect(address1.required).toBe(true);
    expect(postalCode.required).toBe(true);
    expect(state.required).toBeUndefined();
    expect(composite.required).toBeUndefined();
  });

  it('required-blank validation ACTUALLY fires on address1/postalCode (existing machinery, not hidden)', async () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { required: true });

    const address1 = form.getField('address1')!;
    const postalCode = form.getField('postalCode')!;
    const state = form.getField('state')!;

    // blank → fails (proves required is NOT dead-code-skipped by a hidden short-circuit)
    const address1Errors = await address1.validate(ctx(undefined));
    expect(address1Errors.length).toBe(1);
    const postalCodeErrors = await postalCode.validate(ctx(undefined));
    expect(postalCodeErrors.length).toBe(1);

    // filled → passes
    expect((await address1.validate(ctx('테헤란로 1'))).length).toBe(0);
    expect((await postalCode.validate(ctx('06133'))).length).toBe(0);

    // non-required sibling never fails regardless of blankness
    expect((await state.validate(ctx(undefined))).length).toBe(0);
  });

  it('DEVIATION lock: siblings are declared VISIBLE (not withHidden(true)) — see address-field.ts', async () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { required: true });
    const address1 = form.getField('address1')!;
    expect(await address1.isHidden(ctx(undefined))).toBe(false);
  });

  it('prefix composes composite + every sibling name, normalizing a trailing dot', () => {
    const form = new EntityForm('CollegeEntityForm', '/college');
    applyFullAddressFields(form, { prefix: 'user.' });
    const names = form.getFields().map((f) => f.getName());
    expect(names).toEqual(
      expect.arrayContaining([
        'user.address',
        'user.state',
        'user.city',
        'user.address1',
        'user.address2',
        'user.postalCode',
      ]),
    );
  });

  it('showMap passes through to the composite AddressField', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { showMap: true });
    const composite = form.getField('address') as AddressField;
    expect(composite.showMap).toBe(true);
  });

  it('tab/group pass through to addFields', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { tab: { id: 'contact' }, group: { id: 'addr-group' } });
    const composite = form.getField('address')!;
    expect(composite.getTabId()).toBe('contact');
    expect(composite.getFieldGroupId()).toBe('addr-group');
  });
});

describe('applyFullAddressFields — hydrate seeds flat siblings from data (@listgrid/state)', () => {
  it('flat names: hydrate seeds address1/state/postalCode directly from the record', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form);
    const store = createFormStore(form);

    store.getState().hydrate({
      state: '서울',
      city: '강남구',
      address1: '테헤란로 1',
      address2: '3층',
      postalCode: '06133',
    });

    expect(store.getState().getValue('address1')).toBe('테헤란로 1');
    expect(store.getState().getValue('state')).toBe('서울');
    expect(store.getState().getValue('postalCode')).toBe('06133');
  });

  it("dotted names: prefix 'user' seeds siblings from data['user.state'] etc.", () => {
    const form = new EntityForm('CollegeEntityForm', '/college');
    applyFullAddressFields(form, { prefix: 'user' });
    const store = createFormStore(form);

    store.getState().hydrate({
      user: {
        state: '서울',
        city: '강남구',
        address1: '테헤란로 1',
        address2: '3층',
        postalCode: '06133',
      },
    });

    expect(store.getState().getValue('user.address1')).toBe('테헤란로 1');
    expect(store.getState().getValue('user.state')).toBe('서울');
    expect(store.getState().getValue('user.postalCode')).toBe('06133');
  });
});

describe('FormField.renderedBy — EB2 render-suppression marker (NOT hidden)', () => {
  it('withRenderedBy sets the member, chainable', () => {
    const f = new StringField('address1', 100);
    expect(f.renderedBy).toBeUndefined();
    const chained = f.withRenderedBy('address');
    expect(chained).toBe(f);
    expect(f.renderedBy).toBe('address');
  });

  it('clone() carries renderedBy (shallow Object.assign copy)', () => {
    const f = new StringField('address1', 100).withRenderedBy('address');
    const cloned = f.clone();
    expect(cloned.renderedBy).toBe('address');
    expect(cloned).not.toBe(f);
  });

  it('renderedBy does NOT short-circuit validate() — required still fires (the whole point vs hidden)', async () => {
    const f = new StringField('address1', 100).withRequired(true).withRenderedBy('address');
    const errors = await f.validate(ctx(undefined));
    expect(errors.length).toBe(1);
    expect(await f.isHidden(ctx(undefined))).toBe(false);
  });
});

describe('addressSiblingNames — shared prefix-derivation helper', () => {
  it('derives the 5 flat sibling names from an unprefixed composite name', () => {
    expect(addressSiblingNames('address')).toEqual({
      state: 'state',
      city: 'city',
      address1: 'address1',
      address2: 'address2',
      postalCode: 'postalCode',
    });
  });

  it('derives dotted sibling names from a prefixed composite name', () => {
    expect(addressSiblingNames('user.address')).toEqual({
      state: 'user.state',
      city: 'user.city',
      address1: 'user.address1',
      address2: 'user.address2',
      postalCode: 'user.postalCode',
    });
  });

  it('matches the names applyFullAddressFields actually declares (no drift)', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { prefix: 'user' });
    const names = addressSiblingNames('user.address');
    for (const n of Object.values(names)) {
      expect(form.getField(n)).toBeDefined();
    }
  });
});

describe('applyFullAddressFields — renderedBy fan-out to every sibling it creates', () => {
  it('every flat sibling (incl. longitude/latitude) is marked renderedBy the composite name', () => {
    const form = new EntityForm('StudentEntityForm', '/student');
    applyFullAddressFields(form, { showLongitudeLatitude: true });

    const siblingNames = [
      'state',
      'city',
      'address1',
      'address2',
      'postalCode',
      'longitude',
      'latitude',
    ];
    for (const n of siblingNames) {
      expect(form.getField(n)!.renderedBy).toBe('address');
    }
    // the composite itself carries no renderedBy — it IS the renderer, not rendered-by one.
    expect(form.getField('address')!.renderedBy).toBeUndefined();
  });

  it('prefixed form: siblings are renderedBy the prefixed composite name', () => {
    const form = new EntityForm('CollegeEntityForm', '/college');
    applyFullAddressFields(form, { prefix: 'user' });
    expect(form.getField('user.address1')!.renderedBy).toBe('user.address');
    expect(form.getField('user.postalCode')!.renderedBy).toBe('user.address');
  });
});
