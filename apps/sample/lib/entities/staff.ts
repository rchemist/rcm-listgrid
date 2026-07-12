import { EntityForm, ManyToOneField, StringField } from '@listgrid/schema-core';
import { OrgEntityForm } from './org';

// Staff — the M2O target of Collabo.staff (EC2 plan §6). `organization` is the
// field EC2's §4 M2O nested-autofill mechanism depends on: a Staff row picked
// from the ManyToOneRenderer's picker carries its FULL row object (including
// this nested `organization:{id,name}`) into the parent form in one write —
// no extra fetch (ec2-collabo-briefing.md §4). The fixture (mock-backend/
// academic.ts staffSeed) MUST embed `organization` on every seed row for that
// to be exercisable; a flat `organizationId` (the employee.ts shape) would not
// carry the nested id the Collabo onChanges/onInitialize branches read.
export const staffFetchUrl = '/staff';

export function StaffEntityForm(): EntityForm {
  return new EntityForm('StaffEntityForm', staffFetchUrl).withTitle('교직원').addFields({
    items: [
      // withList (spec §5.1; W5-2) — StaffEntityForm has no list page of its
      // own, but it IS rendered implicit-columns as the Collabo.staff
      // ManyToOne picker AND the Major.staffs XrefMapping picker (both no
      // `columns` prop) — collabo.spec.ts Scenario 2/3 and major.spec.ts
      // Scenario d open these and read row names. The magic fallback that
      // used to backstop them is abolished, so `name` needs an explicit
      // opt-in (deviation from waves' literal "college/subject/professor"
      // list — see the W5-2 report).
      new StringField('name', 100).withRequired(true).withLabel('이름').withList(),
      new StringField('email', 110).withLabel('이메일'),
      new ManyToOneField('organization', 120, {
        entityForm: () => OrgEntityForm(),
        labelField: 'name',
      }).withLabel('소속 부서'),
    ],
  });
}
