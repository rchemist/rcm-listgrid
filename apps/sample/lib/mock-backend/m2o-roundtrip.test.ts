// m2o-roundtrip.test.ts — TB-5 [TB-C7] proof: the ManyToOne reference
// round-trip across the apps/sample mock backend (test-backend-recon.md §3
// row: "M2O round-trip: GET 중첩{id,title}→라벨→save flatten `<name>Id`
// (RV-R13 회귀류) + bare-id 참조해석", TB-C7 row, line 63). Three legs, none
// of which had ANY prior test coverage (brief: "toWire/fromWire, which
// currently has ZERO test coverage"):
//
//   1. toWire (major.ts:135-151)         storage(flat id) -> wire(nested {id,name})
//   2. ManyToOneField.serializeValue     wire(nested)      -> save(flat `<name>Id`)
//      (many-to-one-field.ts:79-84)
//   3. fromWire (major.ts:95-132)        save(flat id)     -> storage(flat id)
//
// RV-R13 lesson (recon §3 line 35, PROGRESS.md line 4/56/147): edustack's
// real manyToOne is nested `{id, TITLE}` with `labelField:'title'` — the
// flatten previously risked keying off labelField instead of idField, which
// apps/sample's mock (labelField:'name', where name==idField's sibling by
// coincidence) could never have caught. §B(b) below explicitly constructs a
// labelField:'title' field to guard against that class of regression
// resurfacing (Do-NOT, recon: "mock의 `name` 형태가 edustack의 `title` 결함을
// 가릴 수 있음").
//
// TEST-ONLY — no source file is touched. Reuses majorStore/toWire/fromWire/
// MajorRow/MajorFields (./major) + collegeStore (./academic) +
// ManyToOneField/FieldEvalContext (@listgrid/schema-core) verbatim; no new
// shared helper or fixture module (brief's reuse constraint) — every helper
// below is local to this file.

import { describe, expect, it } from 'vitest';
import { ManyToOneField, type FieldEvalContext } from '@listgrid/schema-core';
import { majorStore, toWire, fromWire, type MajorRow, type MajorFields } from './major';
import { collegeStore } from './academic';

// serializeValue's override (many-to-one-field.ts:82) never invokes the
// `entityForm` thunk — it only reads `value[idField]`. A throwing dummy
// proves that at test-time (a passing test with a real EntityForm() thunk
// would hide an accidental invocation; this one would fail loudly).
const dummyEntityForm = (): never => {
  throw new Error('entityForm thunk should never be invoked by serializeValue');
};

// serializeValue's override ignores `_ctx` entirely (many-to-one-field.ts:82
// signature `_ctx: FieldEvalContext` — underscore-prefixed, unused) — an
// empty object type-asserted to FieldEvalContext is exactly what the brief
// prescribes and what the contract permits.
const ctx = {} as FieldEvalContext;

/** Fresh field instance per call — ManyToOneField carries no mutable state
 *  test-to-test, but a shared instance would obscure which labelField each
 *  assertion exercises when scanning the file. */
function collegeField(labelField: string): ManyToOneField {
  return new ManyToOneField('college', 300, {
    entityForm: dummyEntityForm,
    labelField,
  });
}

describe('A. 참조해석 — toWire resolves a bare stored id to nested {id,name} (major.ts:135-151)', () => {
  it('(a) collegeId "1" resolves to the nested college object', () => {
    const major: MajorRow = majorStore().create({
      name: 'TB-5 컴퓨터공학과',
      type: 'MAJOR',
      collegeId: '1',
      professorIds: [],
      staffIds: [],
    });
    const wire = toWire(major);
    // Fixture fact (brief §FIXTURE FACTS, academic.ts:31-40): id '1' seeds
    // to 공과대학 — locked literal, not derived, so a seed-drift bug in
    // academic.ts would also be caught here (not just laundered through
    // collegeStore().findById()).
    expect(wire.college).toEqual({ id: '1', name: '공과대학' });
  });

  it("(b) self-referencing parentMajorId resolves to the parent major's own nested object", () => {
    const parent: MajorRow = majorStore().create({
      name: 'TB-5 상위학부',
      type: 'DEPARTMENT',
      professorIds: [],
      staffIds: [],
    });
    const child: MajorRow = majorStore().create({
      name: 'TB-5 하위전공',
      type: 'MAJOR',
      parentMajorId: parent.id,
      professorIds: [],
      staffIds: [],
    });
    const wire = toWire(child);
    expect(wire.parentMajor).toEqual({ id: parent.id, name: parent.name });
  });

  it('(c) a dangling collegeId (row does not exist) resolves to undefined, not a broken object', () => {
    // Guard: prove '99999' is genuinely absent from the seed (collegeStore
    // reused per the brief), so this test isn't accidentally hitting a real
    // row and passing for the wrong reason.
    expect(collegeStore().findById('99999')).toBeUndefined();

    const major: MajorRow = majorStore().create({
      name: 'TB-5 유령대학전공',
      type: 'MAJOR',
      collegeId: '99999',
      professorIds: [],
      staffIds: [],
    });
    const wire = toWire(major);
    expect(wire.college).toBeUndefined();
  });

  it('(d) absent collegeId (no reference at all) resolves to undefined', () => {
    const major: MajorRow = majorStore().create({
      name: 'TB-5 대학없음전공',
      type: 'MAJOR',
      professorIds: [],
      staffIds: [],
    });
    const wire = toWire(major);
    expect(wire.college).toBeUndefined();
  });

  it('(e) the wire NEVER carries the flat collegeId/parentMajorId keys — only nested objects', () => {
    const parent: MajorRow = majorStore().create({
      name: 'TB-5 플랫키검사상위',
      type: 'DEPARTMENT',
      professorIds: [],
      staffIds: [],
    });
    const major: MajorRow = majorStore().create({
      name: 'TB-5 플랫키검사전공',
      type: 'MAJOR',
      collegeId: '1',
      parentMajorId: parent.id,
      professorIds: [],
      staffIds: [],
    });
    const wire = toWire(major);
    expect('collegeId' in wire).toBe(false);
    expect('parentMajorId' in wire).toBe(false);
    // sanity: the nested forms ARE present (this isn't just a typo dropping
    // both keys silently) — proves the flat keys are absent BECAUSE they
    // were replaced by the nested shape, not because resolution failed.
    expect(wire.college).toEqual({ id: '1', name: '공과대학' });
    expect(wire.parentMajor).toEqual({ id: parent.id, name: parent.name });
  });
});

describe('B. save flatten — ManyToOneField.serializeValue is idField-keyed, never labelField-keyed (RV-R13 guard, many-to-one-field.ts:79-84)', () => {
  it('(a) a nested {id,name} value flattens to {collegeId}, never {college} — the RV-R13 regression shape', () => {
    const field = collegeField('name');
    const result = field.serializeValue({ id: '1', name: '공과대학' }, ctx);
    expect(result).toEqual({ collegeId: '1' });
    expect('college' in result).toBe(false);
    expect(result.collegeId).toBe('1'); // string id, never the object
  });

  it('(b) labelField-agnostic (R7/RV-R13): a {id,title} value with labelField:"title" still flattens by idField', () => {
    // This is the exact class RV-R13 fixed: edustack's manyToOne is nested
    // {id, TITLE} with labelField:'title' (recon §3 line 35). A flatten
    // that accidentally keyed off getLabelField() instead of getIdField()
    // would read value['title'] (undefined for this shape) instead of
    // value['id'] — producing {collegeId: undefined} instead of
    // {collegeId: '1'}. apps/sample's own fixtures (labelField:'name')
    // can never exercise this branch, hence the explicit construction here.
    const field = collegeField('title');
    const result = field.serializeValue({ id: '1', title: '컴퓨터공학' }, ctx);
    expect(result).toEqual({ collegeId: '1' });
  });

  it('(c) a raw non-object id value falls through to the base { [name]: value } shape', () => {
    const field = collegeField('name');
    const result = field.serializeValue('1', ctx);
    expect(result).toEqual({ college: '1' });
  });

  it('(d) an undefined value falls through to { [name]: undefined }', () => {
    const field = collegeField('name');
    const result = field.serializeValue(undefined, ctx);
    expect(result).toEqual({ college: undefined });
  });
});

describe('C. backend contract — fromWire reads FLAT ids only, a nested body silently drops the reference (major.ts:95-132)', () => {
  it('(a) fromWire reads flat collegeId/parentMajorId straight off the body', () => {
    const parent: MajorRow = majorStore().create({
      name: 'TB-5 fromWire상위',
      type: 'DEPARTMENT',
      professorIds: [],
      staffIds: [],
    });
    const fields: MajorFields = fromWire({
      name: 'TB-5 fromWire전공',
      type: 'MAJOR',
      collegeId: '1',
      parentMajorId: parent.id,
    });
    expect(fields.collegeId).toBe('1');
    expect(fields.parentMajorId).toBe(parent.id);
  });

  it('(b) a nested {college:{id,name}} body (the RV-R13 bug shape) is NOT read as a reference — proves the wire REQUIRES the flatten', () => {
    // fromWire only branches on `'collegeId' in body` (major.ts:114) — it
    // never inspects `body.college`. A caller that forgot to flatten (the
    // exact RV-R13 failure mode, only on the write side instead of the
    // read side) silently loses the reference instead of erroring.
    const body = {
      name: 'TB-5 중첩바디버그',
      type: 'MAJOR',
      college: { id: '1', name: '공과대학' },
    };
    const fields: MajorFields = fromWire(body);
    expect(fields.collegeId).toBeUndefined();
  });
});

describe('D. full round-trip closure — create → toWire → serializeValue → PUT body → fromWire → update → toWire is idempotent', () => {
  it('collegeId survives create/GET/save/update unchanged, flat on every wire boundary and nested on every read boundary', () => {
    // 1. create a major pointing at college '1' (storage: flat collegeId).
    const created: MajorRow = majorStore().create({
      name: 'TB-5 라운드트립전공',
      type: 'MAJOR',
      collegeId: '1',
      professorIds: [],
      staffIds: [],
    });

    // 2. GET: storage -> wire. Flat id resolves to the nested {id,name}
    //    the client's ManyToOneRenderer would bind into form state.
    const getWire = toWire(created);
    expect(getWire.college).toEqual({ id: '1', name: '공과대학' });

    // 3. Save flatten: the exact ManyToOneField shape MajorEntityForm uses
    //    for its `college` field (lib/entities/major.ts:174-177,
    //    labelField:'name') re-serializes the nested value the client just
    //    read back into a flat id — this is the RV-R13 guard applied to a
    //    real GET->PUT cycle instead of an isolated unit call.
    const field = collegeField('name');
    const serialized = field.serializeValue(getWire.college, ctx);
    expect(serialized).toEqual({ collegeId: '1' });

    // 4. Merge into a PUT-shaped body — flat, never nested.
    const putBody: Record<string, unknown> = {
      name: created.name,
      type: created.type,
      ...serialized,
    };
    expect(putBody.collegeId).toBe('1');
    expect(putBody.college).toBeUndefined();

    // 5. Backend contract: fromWire reads the flat id back into storage.
    const updatedFields: MajorFields = fromWire(putBody, created);
    expect(updatedFields.collegeId).toBe('1');

    // 6. Persist + re-fetch: toWire again reproduces the SAME nested
    //    college object — no drift across the full closure.
    const updatedRow = majorStore().update(created.id, updatedFields);
    expect(updatedRow).toBeDefined();
    const finalWire = toWire(updatedRow as MajorRow);
    expect(finalWire.college).toEqual(getWire.college);
  });
});
