import { EntityForm, StringField } from '@listgrid/schema-core';

// PermDemo — W3-1 E2E fixture ONLY (documents/plans/entityform-api-
// implementation-waves.md §W3-1): a dedicated minimal entity proving CAP-02
// (tab/group requiredPermissions gate the view) + CAP-03 (hasVisibleContent
// suppresses an empty tab/group), driven through a real browser against the
// sample app's fixed ADMIN session (providers.tsx `{ roles: ['ADMIN'] }`).
// Deliberately NOT wired to any mock-backend/api route — the E2E only ever
// visits `/perm-demo/new` (create mode, no fetch) and never saves, so no
// backend surface is needed. Kept separate from college/major/student/etc.
// so this fixture can never perturb their own E2E assertions (e.g. default
// column derivation, tab-count checks).
export const permDemoFetchUrl = '/perm-demo';

export function PermDemoEntityForm(): EntityForm {
  return new EntityForm('PermDemoEntityForm', permDemoFetchUrl)
    .withTitle('권한 데모')
    .addFields({
      // 'main' — no requiredPermissions (control: always visible, keeps the
      // tab bar itself rendered since ViewEntityForm unmounts the whole
      // tablist at <=1 visible tab).
      tab: { id: 'main', label: '기본정보', order: 0 },
      group: { id: 'basic', label: '기본', order: 0 },
      items: [new StringField('name', 100).withLabel('이름')],
    })
    .addFields({
      // CAP-03 — 'secretGroup' carries NO requiredPermissions of its own;
      // its single field does. Suppressed by hasVisibleContent, not by the
      // group-level permission gate.
      tab: { id: 'main', order: 0 },
      group: { id: 'secretGroup', label: '비밀그룹', order: 1 },
      items: [
        new StringField('secretGroupField', 110)
          .withLabel('비밀필드')
          .withRequiredPermissions('SUPERADMIN'),
      ],
    })
    .addFields({
      // CAP-02 — tab-level requiredPermissions the fixed ADMIN session HOLDS.
      tab: { id: 'admin', label: '관리자', order: 1, requiredPermissions: ['ADMIN'] },
      items: [new StringField('adminField', 200).withLabel('관리자전용필드')],
    })
    .addFields({
      // CAP-02 — tab-level requiredPermissions the fixed ADMIN session LACKS.
      tab: { id: 'superadmin', label: '최고관리자', order: 2, requiredPermissions: ['SUPERADMIN'] },
      items: [new StringField('superField', 300).withLabel('최고관리자전용필드')],
    });
}
