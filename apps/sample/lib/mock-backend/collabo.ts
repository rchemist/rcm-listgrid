// `org` / `staff` / `collabo` entity fixtures — EC2 (plan §EC,
// documents/plans/e-track-field-parity.md), reproducing the GJCU
// CollaboEntityForm domain (ec2-collabo-briefing.md) on the new engine. A
// separate module from academic.ts (Academic/University domain) because
// these three belong to GJCU's Academic/Management package instead — same
// getOrCreateStore pattern, crud-routes.ts unchanged.

import { getOrCreateStore } from './store';

export interface Org {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  // §4 M2O nested-autofill requirement — every row MUST embed its
  // organization (id+name), not just an id, so picking a Staff row in the
  // ManyToOneRenderer picker carries `organization.id` into the parent
  // Collabo form with ZERO extra fetch (ec2-collabo-briefing.md §4).
  organization: { id: string; name: string };
  [key: string]: unknown;
}

export interface Collabo {
  id: string;
  name: string;
  representative: string;
  officer: string;
  socialEnterprise: boolean;
  promoterType?: string;
  // M2O fields fetched as NESTED objects (GJCU parity — the source
  // onInitialize/onChanges branches read `staff.organization.id` /
  // `professor`/`promoterDepartment.id` directly off the fetched value, not
  // a flattened id — ec2-collabo-briefing.md §2/§3/§4).
  professor?: { id: string; name: string };
  staff?: { id: string; name: string; organization?: { id: string; name: string } };
  promoterName?: string;
  promoterDepartment?: { id: string; name: string };
  showOnApply: boolean;
  collaborated: boolean;
  // §2 recommendation: the string ENUM directly ('NONE'|'GENERAL'|
  // 'CONTRACTED'), never the GJCU-backend Boolean the dropped onInitialize
  // branch 2 exists to coerce (ec2-collabo-briefing.md §2 gap note).
  contracted: 'NONE' | 'GENERAL' | 'CONTRACTED';
  type: string;
  collaboratedAt?: string;
  asset?: string;
  // Full 5-sibling flat address (gap③ accepted — applyFullAddressFields has
  // no `fields:` subset option yet).
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  [key: string]: unknown;
}

const orgSeed: Org[] = [
  { id: '1', name: '산학협력단' },
  { id: '2', name: '연구지원팀' },
  { id: '3', name: '기획처' },
];

// Reuses professorSeed's id/name pairs (academic.ts:76-85) for the professor
// M2O — same person, both fixtures agree.
const staffSeed: Staff[] = [
  {
    id: '1',
    name: '이서연',
    email: 'seoyeon.lee@example.ac.kr',
    organization: { id: '1', name: '산학협력단' },
  },
  {
    id: '2',
    name: '박준서',
    email: 'junseo.park@example.ac.kr',
    organization: { id: '2', name: '연구지원팀' },
  },
  {
    id: '3',
    name: '최윤아',
    email: 'yuna.choi@example.ac.kr',
    organization: { id: '3', name: '기획처' },
  },
];

const collaboSeed: Collabo[] = [
  {
    id: '1',
    name: '가나다전자',
    representative: '홍길동',
    officer: '김담당',
    socialEnterprise: false,
    promoterType: 'STAFF',
    staff: { id: '1', name: '이서연', organization: { id: '1', name: '산학협력단' } },
    promoterDepartment: { id: '1', name: '산학협력단' },
    showOnApply: true,
    // collaborated:false row (E2E #1/#4 baseline) — contracted stays the
    // NONE-only swapped state; collaboratedAt hidden.
    collaborated: false,
    contracted: 'NONE',
    type: 'CORP',
    state: '서울',
    city: '강남구',
    address1: '테헤란로 152',
    address2: '5층',
    postalCode: '06236',
  },
  {
    id: '2',
    name: '라마바연구소',
    representative: '이영희',
    officer: '박담당',
    socialEnterprise: true,
    promoterType: 'PROFESSOR',
    professor: { id: '2', name: '이하은' },
    promoterDepartment: { id: '2', name: '연구지원팀' },
    showOnApply: true,
    // collaborated:true row (E2E #4 — onInitialize first-paint effects):
    // collaboratedAt visible+required, contracted CONTRACTED/GENERAL option
    // set, on the FIRST paint, with zero interaction.
    collaborated: true,
    contracted: 'CONTRACTED',
    type: 'RESEARCH',
    collaboratedAt: '2025-03-01',
    asset: 'https://example.com/collabo/agreement-2.pdf',
    state: '경기',
    city: '성남시 분당구',
    address1: '판교역로 235',
    address2: '',
    postalCode: '13494',
  },
];

export function orgStore() {
  return getOrCreateStore<Org>('org', orgSeed);
}

export function staffStore() {
  return getOrCreateStore<Staff>('staff', staffSeed);
}

export function collaboStore() {
  return getOrCreateStore<Collabo>('collabo', collaboSeed);
}
