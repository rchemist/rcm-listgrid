// `major` entity fixture — EC3 (plan §EC, documents/plans/e-track-field-parity.md),
// reproducing the GJCU MajorEntityForm domain (ea-d2-xref-major-briefing.md
// §1/§6) on the new engine. A separate module from academic.ts/collabo.ts —
// Major is its own record shape (self-referencing M2O + 2 XrefMapping
// fields), not a trivial EntityStore<T> passthrough like every other entity
// so far: the WIRE shape (nested `college`/`parentMajor` objects,
// `professors`/`staffs` as `{mapped, deleted}` envelopes) differs from the
// STORAGE shape (flat `collegeId`/`parentMajorId`, plain `professorIds`/
// `staffIds` arrays) — toWire()/applyXrefPatch() below bridge the two, same
// as a real backend's DTO mapping layer would.

import { getOrCreateStore, type WithId } from './store';
import { collegeStore } from './academic';

export type MajorType = 'DEPARTMENT' | 'MAJOR';

/** The mutable storage columns, id excluded — kept as its own type (rather
 *  than `Omit<MajorRow, 'id'>`) so `fromWire`'s return type stays a plain
 *  object shape, not fighting WithId's `[key: string]: unknown` index
 *  signature Omit/Pick would otherwise drag along. Still carries its OWN
 *  index signature (`EntityStore.create/update` take `Partial<MajorRow>`,
 *  and MajorRow's index signature — inherited from WithId — otherwise makes
 *  a plain-shaped argument structurally incompatible). */
export interface MajorFields {
  name: string;
  type: MajorType;
  majorCode?: string;
  collegeId?: string;
  parentMajorId?: string;
  // Xref mapped-id lists (briefing §6 item 4 — "store keeps a mapped id list
  // per major, applies {mapped,deleted} on update").
  professorIds: string[];
  staffIds: string[];
  majorMandatory?: number;
  majorSelective?: number;
  minorMandatory?: number;
  [key: string]: unknown;
}

/** Internal storage shape — flat ids only (never sent over the wire as-is). */
export interface MajorRow extends MajorFields, WithId {
  id: string;
}

const majorSeed: MajorRow[] = [
  {
    id: '1',
    name: '컴퓨터공학과',
    type: 'MAJOR',
    majorCode: 'CS',
    parentMajorId: '2',
    professorIds: ['1', '2'],
    staffIds: ['1'],
    majorMandatory: 12,
    majorSelective: 39,
    minorMandatory: 24,
  },
  {
    id: '2',
    name: '공과대학',
    type: 'DEPARTMENT',
    collegeId: '1',
    professorIds: [],
    staffIds: [],
  },
];

export function majorStore() {
  return getOrCreateStore<MajorRow>('major', majorSeed);
}

/**
 * XrefMappingValue merge (briefing §6 item 4): `mapped` is the CURRENT full
 * desired set the renderer already accumulates client-side (addIds/deleteIds
 * in xref-mapping-renderer.tsx keep it as the running "should be mapped"
 * list, not a delta) — but this still honors `deleted` explicitly, per task
 * instruction ("merges mapped adds and removes deleted"), so the backend
 * stays correct even against a caller that only sends deltas.
 */
function applyXrefPatch(
  existingIds: string[],
  patch: { mapped?: string[]; deleted?: string[] } | undefined,
): string[] {
  if (!patch) return existingIds;
  const next = new Set(existingIds);
  for (const id of patch.deleted ?? []) next.delete(id);
  for (const id of patch.mapped ?? []) next.add(id);
  return [...next];
}

/** Extract the flat storage fields a create/update body carries (M2O fields
 *  arrive flattened as `collegeId`/`parentMajorId` — form-store.ts
 *  toSaveData; xref fields arrive as `{mapped, deleted}` envelopes — pass
 *  through, ea-d2-xref-major-briefing.md §4). */
export function fromWire(body: Record<string, unknown>, existing?: MajorRow): MajorFields {
  const base: MajorFields = existing
    ? { ...existing }
    : {
        name: '',
        type: 'MAJOR',
        professorIds: [],
        staffIds: [],
      };

  if (typeof body.name === 'string') base.name = body.name;
  if (body.type === 'DEPARTMENT' || body.type === 'MAJOR') base.type = body.type;
  if ('majorCode' in body) base.majorCode = (body.majorCode as string | undefined) ?? undefined;
  if ('collegeId' in body) base.collegeId = (body.collegeId as string | undefined) ?? undefined;
  if ('parentMajorId' in body) {
    base.parentMajorId = (body.parentMajorId as string | undefined) ?? undefined;
  }
  if ('majorMandatory' in body) {
    base.majorMandatory = (body.majorMandatory as number | undefined) ?? undefined;
  }
  if ('majorSelective' in body) {
    base.majorSelective = (body.majorSelective as number | undefined) ?? undefined;
  }
  if ('minorMandatory' in body) {
    base.minorMandatory = (body.minorMandatory as number | undefined) ?? undefined;
  }

  base.professorIds = applyXrefPatch(
    base.professorIds,
    body.professors as { mapped?: string[]; deleted?: string[] } | undefined,
  );
  base.staffIds = applyXrefPatch(
    base.staffIds,
    body.staffs as { mapped?: string[]; deleted?: string[] } | undefined,
  );

  return base;
}

/** Storage row -> wire shape (GET/search response, briefing §4 wire table). */
export function toWire(row: MajorRow): Record<string, unknown> {
  const college = row.collegeId ? collegeStore().findById(row.collegeId) : undefined;
  const parentMajor = row.parentMajorId ? majorStore().findById(row.parentMajorId) : undefined;
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    majorCode: row.majorCode,
    college: college ? { id: college.id, name: college.name } : undefined,
    parentMajor: parentMajor ? { id: parentMajor.id, name: parentMajor.name } : undefined,
    professors: { mapped: row.professorIds },
    staffs: { mapped: row.staffIds },
    majorMandatory: row.majorMandatory,
    majorSelective: row.majorSelective,
    minorMandatory: row.minorMandatory,
  };
}
