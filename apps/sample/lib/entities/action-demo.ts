import { EntityForm, StringField } from '@listgrid/schema-core';

// ActionDemo — W3-3 E2E fixture ONLY (documents/plans/entityform-api-
// implementation-waves.md §W3-3): a dedicated minimal entity proving
// addAction's custom-action rendering + ActionContext wiring (CAP-09)
// through a real browser, isolated from college/major/etc. (perm-demo.ts
// precedent) so this fixture can never perturb their own E2E assertions.
// Deliberately NOT saved in the E2E — the custom action's `run` mutates a
// field value directly via `ctx.mutator`, proving the ActionContext plumbing
// without needing a backend round-trip.
export const actionDemoFetchUrl = '/action-demo';

export function ActionDemoEntityForm(): EntityForm {
  return new EntityForm('ActionDemoEntityForm', actionDemoFetchUrl)
    .withTitle('액션 데모')
    .addFields({
      items: [new StringField('name', 100).withLabel('이름')],
    })
    .addAction({
      id: 'hello',
      label: '커스텀',
      run: (ctx) => {
        ctx.mutator.setValue('name', 'clicked');
      },
    });
}
