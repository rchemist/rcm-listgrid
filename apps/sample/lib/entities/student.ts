import { applyFullAddressFields, EntityForm, StringField } from '@listgrid/schema-core';

// Student — EC1 (plan §EC, documents/plans/e-track-field-parity.md): the
// FIRST real-browser exercise of the EB address stack. `name` is the only
// scalar field; `applyFullAddressFields` declares the composite `address`
// field + its flat siblings (state/city/address1/address2/postalCode) with
// address1/postalCode required (no `prefix` — the default composite name
// `address` already matches the plain sibling names the AddressRenderer
// (EB2) and the fixture backend (mock-backend/academic.ts studentSeed) both
// use). `showLongitudeLatitude` stays false — Kakao 지도 좌표는 연기 (EB1 doc).

export const studentFetchUrl = '/student';

export function StudentEntityForm(): EntityForm {
  const entityForm = new EntityForm('StudentEntityForm', studentFetchUrl)
    .withTitle('학생')
    .addFields({
      items: [new StringField('name', 10).withRequired(true).withLabel('이름')],
    });

  return applyFullAddressFields(entityForm, {
    order: 20,
    required: true,
    showLongitudeLatitude: false,
  });
}
