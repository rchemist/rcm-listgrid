import { EntityForm, StringField } from '@listgrid/schema-core';

// StepsDemo — W4-2 E2E fixture ONLY (documents/plans/entityform-public-api-
// spec.md §3.2, C6): a dedicated minimal entity proving withSteps' 3-step
// create wizard through a real browser — isolated from college/major/etc.
// (perm-demo.ts / action-demo.ts precedent) so this fixture can never
// perturb their own E2E assertions. Each field is required so the final
// Save (validateAll, run on ALL declared fields — not just the current
// step's) only succeeds once every step's field has actually been filled,
// proving the wizard retains cross-step values in the store rather than
// losing them when a step's <FieldRenderer> unmounts.
export const stepsDemoFetchUrl = '/steps-demo';

export function StepsDemoEntityForm(): EntityForm {
  return new EntityForm('StepsDemoEntityForm', stepsDemoFetchUrl)
    .withTitle('단계 데모')
    .addFields({
      items: [
        new StringField('firstName', 100).withRequired(true).withLabel('이름'),
        new StringField('lastName', 110).withRequired(true).withLabel('성'),
        new StringField('email', 120).withRequired(true).withLabel('이메일'),
      ],
    })
    .withSteps([
      { id: 'name', label: '이름', order: 0, fields: ['firstName'] },
      { id: 'family', label: '성', order: 1, fields: ['lastName'] },
      { id: 'contact', label: '연락처', order: 2, fields: ['email'] },
    ]);
}
