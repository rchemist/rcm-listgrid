import { describe, expect, it } from 'vitest';
import { EntityForm, StringField, type StepDef } from '../index';

// withSteps/getSteps (spec §3.2, C6; W4-2) — the create-mode wizard
// declaration. Covers: round-trip, order-sort, clone() preserving a hidden
// step (the GJCU 0.3.x clone-drops-hidden-step bug this fixes), clone
// independence, withSteps(undefined) clearing, and StepDef deep-copy on
// input (a caller mutating their own array/objects after the call must not
// reach into the stored declaration). The renderer's hidden-step exclusion
// (@listgrid/react ViewEntityForm) is out of scope here — pure declaration
// layer only.

function ThreeFieldForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('a', 1).withLabel('A'),
      new StringField('b', 2).withLabel('B'),
      new StringField('c', 3).withLabel('C'),
    ],
  });
}

function threeSteps(): StepDef[] {
  return [
    { id: 'step1', label: 'Step 1', order: 0, fields: ['a'] },
    { id: 'step2', label: 'Step 2', order: 1, fields: ['b'] },
    { id: 'step3', label: 'Step 3', order: 2, fields: ['c'] },
  ];
}

describe('EntityForm.withSteps / getSteps (round-trip)', () => {
  it('getSteps() with no withSteps() call returns []', () => {
    const form = ThreeFieldForm();
    expect(form.getSteps()).toEqual([]);
  });

  it('withSteps() round-trips the declared steps', () => {
    const form = ThreeFieldForm().withSteps(threeSteps());
    expect(form.getSteps()).toEqual(threeSteps());
  });

  it('withSteps() is chainable (returns this)', () => {
    const form = ThreeFieldForm();
    expect(form.withSteps(threeSteps())).toBe(form);
  });

  it('withSteps(undefined) clears a previously-declared wizard', () => {
    const form = ThreeFieldForm().withSteps(threeSteps());
    expect(form.getSteps()).toHaveLength(3);
    form.withSteps(undefined);
    expect(form.getSteps()).toEqual([]);
  });

  it('a later withSteps() call REPLACES, not merges, the previous declaration (L1 with* semantics)', () => {
    const form = ThreeFieldForm().withSteps(threeSteps());
    form.withSteps([{ id: 'only', label: 'Only', fields: ['a'] }]);
    expect(form.getSteps().map((s) => s.id)).toEqual(['only']);
  });
});

describe('getSteps() order sort', () => {
  it('sorts by order ascending regardless of declaration order', () => {
    const form = ThreeFieldForm().withSteps([
      { id: 'last', label: 'Last', order: 2, fields: ['c'] },
      { id: 'first', label: 'First', order: 0, fields: ['a'] },
      { id: 'mid', label: 'Mid', order: 1, fields: ['b'] },
    ]);
    expect(form.getSteps().map((s) => s.id)).toEqual(['first', 'mid', 'last']);
  });

  it('a step with no declared order sorts as order 0 (stable, getTabs()/getFields() precedent)', () => {
    const form = ThreeFieldForm().withSteps([
      { id: 'withOrder', label: 'With order', order: 5, fields: ['a'] },
      { id: 'noOrder', label: 'No order', fields: ['b'] },
    ]);
    expect(form.getSteps().map((s) => s.id)).toEqual(['noOrder', 'withOrder']);
  });
});

describe('getSteps() does NOT filter hidden steps (view resolves hidden — spec §3.2)', () => {
  it('a hidden:true step is still returned by getSteps()', () => {
    const form = ThreeFieldForm().withSteps([
      { id: 'step1', label: 'Step 1', order: 0, fields: ['a'] },
      { id: 'hiddenStep', label: 'Hidden', order: 1, fields: ['b'], hidden: true },
    ]);
    expect(form.getSteps().map((s) => s.id)).toEqual(['step1', 'hiddenStep']);
    expect(form.getSteps().find((s) => s.id === 'hiddenStep')?.hidden).toBe(true);
  });

  it('a function-typed hidden step is still returned by getSteps() (resolution is the view layer)', () => {
    const hiddenFn = async () => true;
    const form = ThreeFieldForm().withSteps([
      { id: 'step1', label: 'Step 1', order: 0, fields: ['a'], hidden: hiddenFn },
    ]);
    expect(form.getSteps()[0]?.hidden).toBe(hiddenFn);
  });
});

describe('clone() preserves steps, INCLUDING a hidden one (GJCU 0.3.x clone-drops-hidden-step bug fix)', () => {
  it('clone().getSteps() is identical (by value) to the original, hidden step included', () => {
    const form = ThreeFieldForm().withSteps([
      { id: 'step1', label: 'Step 1', order: 0, fields: ['a'] },
      { id: 'hiddenStep', label: 'Hidden', order: 1, fields: ['b'], hidden: true },
    ]);
    const cloned = form.clone();
    expect(cloned.getSteps()).toEqual(form.getSteps());
    expect(cloned.getSteps().find((s) => s.id === 'hiddenStep')?.hidden).toBe(true);
  });

  it('clone() of a form with no declared steps yields an empty getSteps()', () => {
    const form = ThreeFieldForm();
    expect(form.clone().getSteps()).toEqual([]);
  });

  it('clone independence — mutating the CLONE (via a fresh withSteps call) does not affect the original', () => {
    const form = ThreeFieldForm().withSteps(threeSteps());
    const cloned = form.clone();
    cloned.withSteps([{ id: 'onlyOnClone', label: 'Only on clone', fields: ['a'] }]);
    expect(cloned.getSteps().map((s) => s.id)).toEqual(['onlyOnClone']);
    expect(form.getSteps().map((s) => s.id)).toEqual(['step1', 'step2', 'step3']);
  });

  it('clone independence — mutating a StepDef object/fields array RETURNED by the ORIGINAL after clone() does not affect the clone', () => {
    const form = ThreeFieldForm().withSteps(threeSteps());
    const cloned = form.clone();
    const originalStep = form.getSteps()[0];
    if (originalStep) {
      originalStep.label = 'mutated after clone';
      originalStep.fields.push('mutatedField');
    }
    expect(cloned.getSteps()[0]?.label).toBe('Step 1');
    expect(cloned.getSteps()[0]?.fields).toEqual(['a']);
  });
});

describe('StepDef deep-copy on withSteps() input (a caller mutating their own array/objects after the call is inert)', () => {
  it('mutating the input ARRAY after withSteps() does not affect stored declaration', () => {
    const input = threeSteps();
    const form = ThreeFieldForm().withSteps(input);
    input.push({ id: 'addedAfter', label: 'Added after', fields: ['a'] });
    input.length = 0; // also prove clearing the caller's array is inert
    expect(form.getSteps().map((s) => s.id)).toEqual(['step1', 'step2', 'step3']);
  });

  it('mutating an input STEP OBJECT (and its fields array) after withSteps() does not affect stored declaration', () => {
    const input = threeSteps();
    const form = ThreeFieldForm().withSteps(input);
    const firstInput = input[0];
    if (firstInput) {
      firstInput.label = 'mutated after withSteps';
      firstInput.fields.push('mutatedField');
    }
    const stored = form.getSteps().find((s) => s.id === 'step1');
    expect(stored?.label).toBe('Step 1');
    expect(stored?.fields).toEqual(['a']);
  });
});
