// deriveFilterFields (spec §5.1/§7, CAP-20; W5-3) — the advanced-search-panel
// sibling of deriveListFields (view-list-grid.test.tsx's derivation suite),
// same truthy/false/undeclared tri-state, driven by getFilterConfig() instead
// of getListConfig(). Pure schema-core derivation — no rendering needed.

import { describe, expect, it } from 'vitest';
import { EntityForm, StringField, SubCollectionField } from '@listgrid/schema-core';
import { deriveFilterFields } from '../components/list-columns';

/** `late` declares an order override (config.order 1, well ahead of its own
 * declared order 500) plus label/operator — proves the override, not a
 * coincidence of the field's own order. `early` opts in plain (`withFilter()`,
 * no config) — sorts by ITS OWN declared order (100) since it has no
 * override. `excluded` (`withFilter(false)`) and `undeclared` (never called)
 * must never appear. */
function derivationForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget').addFields({
    items: [
      new StringField('late', 500)
        .withLabel('Late Field')
        .withFilter({ order: 1, label: 'Late Filter', operator: 'LIKE' }),
      new StringField('early', 100).withLabel('Early Field').withFilter(),
      new StringField('excluded', 200).withLabel('Excluded Field').withFilter(false),
      new StringField('undeclared', 300).withLabel('Undeclared Field'),
    ],
  });
}

describe('deriveFilterFields (spec §5.1/§7; W5-3)', () => {
  it("collects only withFilter()-truthy fields, sorted by config.order over the field's own declared order — excludes withFilter(false) and undeclared fields", () => {
    const entityForm = derivationForm();
    const derived = deriveFilterFields(entityForm);

    // 'late' (config.order 1) sorts BEFORE 'early' (its own declared order
    // 100, no override) despite 'late' declaring order 500 on the field
    // itself — proves config.order actually overrides, not coincides.
    expect(derived.map(({ field }) => field.getName())).toEqual(['late', 'early']);
    expect(derived[0]?.config).toEqual({ order: 1, label: 'Late Filter', operator: 'LIKE' });
    expect(derived[1]?.config).toEqual({});
  });

  it('excludes a subCollection field even when it declares a truthy withFilter() config', () => {
    // SubCollectionField extends FormField (inherits withFilter/
    // getFilterConfig), so a filter-configured sub-collection is a real,
    // reachable case — unlike deriveListFields' equivalent test, which has no
    // such fixture available.
    const child = new EntityForm('ChildEntityForm', '/child');
    const entityForm = new EntityForm('ParentEntityForm', '/parent').addFields({
      items: [
        new SubCollectionField('children', 100, { childEntityForm: () => child })
          .withLabel('Children')
          .withFilter({ label: 'Children Filter' }),
        new StringField('name', 200).withLabel('Name').withFilter(),
      ],
    });

    const derived = deriveFilterFields(entityForm);
    expect(derived.map(({ field }) => field.getName())).toEqual(['name']);
  });
});
