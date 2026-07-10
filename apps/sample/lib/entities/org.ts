import { EntityForm, StringField } from '@listgrid/schema-core';

// Org — the M2O target of Staff.organization AND Collabo.promoterDepartment
// (EC2 plan §6, documents/plans/e-track-field-parity.md — port of GJCU
// OrgEntityForm, referenced but not itself read for this port; name-only is
// enough since nothing in the Collabo reproduction reads any Org field beyond
// `id`/`name`). Deliberately minimal — new entity, not an extension of an
// existing one (Search-first: no name-only-department entity existed yet).

export const orgFetchUrl = '/org';

export function OrgEntityForm(): EntityForm {
  return new EntityForm('OrgEntityForm', orgFetchUrl).withTitle('부서').addFields({
    items: [new StringField('name', 100).withRequired(true).withLabel('부서명')],
  });
}
