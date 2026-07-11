import { describe, expect, it } from 'vitest';
import { EntityForm, StringField } from '../index';

// W2-5 (spec §4.1/§6.2) — save/delete lifecycle hook builders (schema-core
// layer). Covers EntityForm.onBeforeSave/onAfterSave/onBeforeDelete/
// onAfterDelete + get*Handlers registration-order/clone-propagation,
// mirroring the EF2/W2-1 onChange/onInit pattern (on-changes.test.ts).
// Successor to this file's prior EF6 withSubmitTransform/getSubmitTransform
// coverage — EF6 is REMOVED (spec §4.2: "EF6 withSubmitTransform은
// onBeforeSave로 대체·제거"). The onBeforeSave dispatch/cancel/throw
// semantics (per-handler try/catch, cancel stops the flow) are exercised at
// the controller level (@listgrid/state/__tests__/form-controller.test.ts),
// NOT here — schema-core stays a pure declaration (ADR-0003), so this file
// only proves the registration surface.

function OneFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [new StringField('name', 1).withLabel('Name')],
  });
}

describe('EntityForm.onBeforeSave / getBeforeSaveHandlers (spec §4.1/§6.2)', () => {
  it('onBeforeSave appends handlers; getBeforeSaveHandlers returns them in registration order', () => {
    const h1 = () => {};
    const h2 = () => {};
    const form = OneFieldForm().onBeforeSave(h1).onBeforeSave(h2);
    expect(form.getBeforeSaveHandlers()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no onBeforeSave handlers', () => {
    expect(OneFieldForm().getBeforeSaveHandlers()).toEqual([]);
  });

  it('clone() propagates beforeSaveHandlers independently of the original', () => {
    const h1 = () => {};
    const original = OneFieldForm().onBeforeSave(h1);
    const cloned = original.clone();
    expect(cloned.getBeforeSaveHandlers()).toEqual([h1]);

    cloned.onBeforeSave(() => {});
    expect(original.getBeforeSaveHandlers()).toHaveLength(1);
    expect(cloned.getBeforeSaveHandlers()).toHaveLength(2);
  });
});

describe('EntityForm.onAfterSave / getAfterSaveHandlers (spec §4.1/§6.2)', () => {
  it('onAfterSave appends handlers; getAfterSaveHandlers returns them in registration order', () => {
    const h1 = () => {};
    const h2 = () => {};
    const form = OneFieldForm().onAfterSave(h1).onAfterSave(h2);
    expect(form.getAfterSaveHandlers()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no onAfterSave handlers', () => {
    expect(OneFieldForm().getAfterSaveHandlers()).toEqual([]);
  });

  it('clone() propagates afterSaveHandlers independently of the original', () => {
    const h1 = () => {};
    const original = OneFieldForm().onAfterSave(h1);
    const cloned = original.clone();
    expect(cloned.getAfterSaveHandlers()).toEqual([h1]);

    cloned.onAfterSave(() => {});
    expect(original.getAfterSaveHandlers()).toHaveLength(1);
    expect(cloned.getAfterSaveHandlers()).toHaveLength(2);
  });
});

describe('EntityForm.onBeforeDelete / getBeforeDeleteHandlers (spec §4.1/§6.2)', () => {
  it('onBeforeDelete appends handlers; getBeforeDeleteHandlers returns them in registration order', () => {
    const h1 = () => {};
    const h2 = () => {};
    const form = OneFieldForm().onBeforeDelete(h1).onBeforeDelete(h2);
    expect(form.getBeforeDeleteHandlers()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no onBeforeDelete handlers', () => {
    expect(OneFieldForm().getBeforeDeleteHandlers()).toEqual([]);
  });

  it('clone() propagates beforeDeleteHandlers independently of the original', () => {
    const h1 = () => {};
    const original = OneFieldForm().onBeforeDelete(h1);
    const cloned = original.clone();
    expect(cloned.getBeforeDeleteHandlers()).toEqual([h1]);

    cloned.onBeforeDelete(() => {});
    expect(original.getBeforeDeleteHandlers()).toHaveLength(1);
    expect(cloned.getBeforeDeleteHandlers()).toHaveLength(2);
  });
});

describe('EntityForm.onAfterDelete / getAfterDeleteHandlers (spec §4.1/§6.2)', () => {
  it('onAfterDelete appends handlers; getAfterDeleteHandlers returns them in registration order', () => {
    const h1 = () => {};
    const h2 = () => {};
    const form = OneFieldForm().onAfterDelete(h1).onAfterDelete(h2);
    expect(form.getAfterDeleteHandlers()).toEqual([h1, h2]);
  });

  it('a fresh EntityForm has no onAfterDelete handlers', () => {
    expect(OneFieldForm().getAfterDeleteHandlers()).toEqual([]);
  });

  it('clone() propagates afterDeleteHandlers independently of the original', () => {
    const h1 = () => {};
    const original = OneFieldForm().onAfterDelete(h1);
    const cloned = original.clone();
    expect(cloned.getAfterDeleteHandlers()).toEqual([h1]);

    cloned.onAfterDelete(() => {});
    expect(original.getAfterDeleteHandlers()).toHaveLength(1);
    expect(cloned.getAfterDeleteHandlers()).toHaveLength(2);
  });
});
