<!--
EXECUTION CONTRACT — zero-decision remediation specs (RV-R1..R12)
생성: 2026-07-13 · 13 authoring agents(opus/sonnet, high) + 13 opus cold-executor 검증
방법: 각 에이전트가 실코드를 열어 exactBefore verbatim 확인 후 exactAfter 작성; cold-executor가 "무결정 실행 가능?" 판정
검증: 13/13 소스 패치 verbatim 정확·compilable(cold-executor codeAccuracy). residue는 테스트/커맨드 세부에 국한 → 본 문서에 closure 반영 완료.
용도: 후속 opus/sonnet 세션이 설계·결정 없이 그대로 적용. before는 문자열 매칭, after는 그대로 치환.
근거(why): [midpoint-code-review.md](../analysis/2026-07-13/midpoint-code-review.md) §4. GA 게이트: [ga-gate-charter-brief.md](./ga-gate-charter-brief.md).
-->

# RV 개선 트랙 — 무결정(zero-decision) 실행 계약 (R1~R12)

**규율**: 아래 각 항목은 ① 확정 접근(대안 없음) ② 정확한 before→after 코드 ③ 정확한 테스트 ④ 기계적 수용 기준 ⑤ Do-NOT을 담는다. **실행 세션은 설계하지 않는다 — 매칭·치환·실행만 한다.** `exactBefore`는 현재 파일과 verbatim 일치(에이전트가 확인). exactOptionalPropertyTypes:true 안전.

> **착지 순서**: RV-R1(CRIT) → RV-R2(HIGH) → R3~R8(MED) → R9~R12(LOW). 각 항목 착지 후 해당 테스트 green 확인, 트랙 종료 시 full gate + E2E 재실행. 공개표면 변화: **R2만 없음(withFilter 재사용)·R10 withId 시그니처 widening**(자세히는 각 surfaceImpact).


---

## R1 — FormRuntime.reload() orphans the store write-path — re-run init pipe INTO the existing store  🔴 CRITICAL

**확정 접근**: Chosen: the `into` refactor (analysis §4.1 primary), NOT the enumerate-merge fallback — it keeps the original store's action closures authoritative without enumerating data keys. `initializeFormStore` gains an optional `into?: StoreApi<FormStoreState>`. When present, the pipe still runs fetch → BIND → onInit → REBIND against the clone `ef` exactly as today, then builds the fresh state with `createFormStore(ef, storeOpts)` (zero duplication of seed logic) and copies ONLY its non-function DATA properties onto `into` via a shallow merge (`into.setState(dataState, false)`). Because the filter is "every non-function property" (all 11 data keys are non-functions; all 20 actions are functions), no data key can be missed — this structurally beats the enumerate-merge fallback without the big createFormStore extraction, and reuses the exact tested slice-building. `into`'s own action closures (which capture `into`'s set/get) are untouched, so its subscribers stay wired. `structureVersion` is written as `into.getState().structureVersion + 1` (monotonic bump) so ViewEntityForm always re-derives its tabs/groups against the reloaded fieldDefs even when the fresh store's baseline 0 would equal the current value. `reload()` passes `into: store` and drops the fresh-store-`replace:true` line. On a reload re-fetch FAILURE the live store's data is left intact (the fetch-error branch returns `into` unmodified when `into` is set). Known accepted limitation (out of scope, do-not): the store's `fetchedData` closure var is not in state so it is not refreshed by the merge — a field added by an onChanges handler AFTER a reload would rebind from the pre-reload record; the primary write-path (edit existing field / save) is fully fixed.

**공개표면**: Adds one OPTIONAL internal field `into?: StoreApi<FormStoreState>` to InitializeFormStoreOptions (an @listgrid/state option interface). No new exported symbol, no public-API count change, no schema change. `initializeFormStore`'s return shape is unchanged.

**Do-NOT**: Do NOT call `store.setState(someOtherStore.getState(), true)` (replace:true) with a foreign store's state — that is the exact orphaning bug; the fix merges only non-function data onto the live store. · Do NOT inject the throwaway `createFormStore(ef, storeOpts)` store (whose actions capture ITS own set/get) into the live tree — only harvest its non-function DATA and discard it. · Do NOT enumerate the data-slice keys by hand (fields/meta/fieldDefs/...) — the `typeof value !== 'function'` filter copies them all; hand-enumeration risks missing a key (the reason the enumerate-merge fallback was rejected). · Do NOT copy `structureVersion` verbatim from the fresh store (it is 0) — bump it off `into.getState().structureVersion + 1` so ViewEntityForm's structure effect always re-fires. · Do NOT expand scope to refresh the store's `fetchedData` closure var or extract createFormStore's slice-building into a shared helper — accepted out-of-scope; the reload write-path fix does not require it. · Do NOT change the fresh-init (no-`into`) return path or the fetch-error fresh path — those must remain byte-for-byte behaviorally identical (existing initialize-form-store tests depend on them).

**cold-executor**: executable=true · All four fileChanges exactBefore strings match the current source VERBATIM (initialize-form-store.ts lines 63-65, 205-208, 250-254; form-controller.ts lines 332-342), including inline comments — the executor can string-match them directly; 

### 파일 변경 (4)

#### `packages/state/src/initialize-form-store.ts` @ InitializeFormStoreOptions interface, after validateOnChange (~line 63-65)
_note: StoreApi (zustand/vanilla, line 1) and FormStoreState (./form-store, line 16) are already imported — no new import._
BEFORE:
```ts
  /** EF5 — passthrough to createFormStore's opt-in validate-on-change (default OFF). */
  validateOnChange?: CreateFormStoreOptions['validateOnChange'];
}
```
AFTER:
```ts
  /** EF5 — passthrough to createFormStore's opt-in validate-on-change (default OFF). */
  validateOnChange?: CreateFormStoreOptions['validateOnChange'];
  /**
   * R1 (analysis §4.1) — reload target. When provided, the freshly-built form
   * state is written INTO this EXISTING store (its DATA slices are replaced via
   * a shallow merge that PRESERVES every action closure) instead of a brand-new
   * store being returned. This keeps the live store's actions — and therefore
   * its subscribers (the mounted field renderers) — authoritative across a
   * `controller.reload()`. `result.store` is then this same instance.
   */
  into?: StoreApi<FormStoreState>;
}
```

#### `packages/state/src/initialize-form-store.ts` @ fetch-error catch branch inside initializeFormStore (~line 205-208)
_note: options.into is in scope (options is the fn param). Preserves fresh-path behavior byte-for-byte._
BEFORE:
```ts
    } catch (e) {
      // c. fetch error: skip bind/hooks entirely, return a usable-but-empty store.
      return { store: createFormStore(ef, storeOpts), entityForm: ef, error: toBackendError(e) };
    }
```
AFTER:
```ts
    } catch (e) {
      // c. fetch error: skip bind/hooks entirely.
      const error = toBackendError(e);
      // R1 (analysis §4.1): on a RELOAD re-fetch failure (into given) leave the
      // live store's current data intact — do NOT overwrite it with an empty
      // store; just surface the error. The fresh-init path (no `into`) still
      // returns a usable-but-empty store (0.3.x parity).
      if (options.into !== undefined) return { store: options.into, entityForm: ef, error };
      return { store: createFormStore(ef, storeOpts), entityForm: ef, error };
    }
```

#### `packages/state/src/initialize-form-store.ts` @ final build/return block of initializeFormStore (~line 250-255)
_note: All 11 FormStoreState data keys are non-functions; all 20 actions are functions — the typeof filter partitions them cleanly, so no data key is missed and no action is overwritten. `dataState as Partial<FormStoreState>` compiles (Partial<FormStoreState> is assignable to Record<string,unknown>, making the cast comparable); if the executor's TS flags it, widen to `as unknown as Partial<FormStoreState>`._
BEFORE:
```ts
  if (data !== undefined) storeOpts.fetchedData = data;
  storeOpts.initialMeta = initialMeta;
  const store = createFormStore(ef, storeOpts);

  return { store, entityForm: ef };
}
```
AFTER:
```ts
  if (data !== undefined) storeOpts.fetchedData = data;
  storeOpts.initialMeta = initialMeta;

  // R1 (analysis §4.1): reload path — write the freshly-built state INTO the
  // existing store rather than returning a throwaway one. Build the fresh state
  // with createFormStore (identical seed logic — no duplicated slice building),
  // then copy ONLY its non-function DATA properties onto `into` via a shallow
  // merge (replace: false). `into`'s own action closures — which capture
  // `into`'s set/get — are LEFT UNTOUCHED, so its subscribers stay wired.
  // structureVersion is bumped monotonically off `into`'s current value so
  // ViewEntityForm always re-derives its tabs/groups against the reloaded
  // fieldDefs (a plain copy of the fresh store's baseline 0 could equal the
  // current value and skip the re-derive).
  const into = options.into;
  if (into !== undefined) {
    const built = createFormStore(ef, storeOpts).getState();
    const dataState: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(built)) {
      if (typeof value !== 'function') dataState[key] = value;
    }
    dataState.structureVersion = into.getState().structureVersion + 1;
    into.setState(dataState as Partial<FormStoreState>, false);
    return { store: into, entityForm: ef };
  }

  const store = createFormStore(ef, storeOpts);
  return { store, entityForm: ef };
}
```

#### `packages/state/src/form-controller.ts` @ reload() function (lines 332-342)
_note: `fresh` var removed; initializeFormStore + InitializeFormStoreOptions imports remain used. `into: store` is a defined value (exactOptionalPropertyTypes-safe — not an assignment of `T | undefined` to an optional)._
BEFORE:
```ts
  async function reload(): Promise<void> {
    const id = entityForm.getId();
    if (id === undefined) return; // create mode: nothing to re-fetch (spec §6.2 FormRuntime.reload doc)
    const initOpts: InitializeFormStoreOptions = { entityForm, id, adapter };
    if (session !== undefined) initOpts.session = session;
    const fresh = await initializeFormStore(initOpts);
    // reflect the freshly-built store (fetch -> BIND -> onInit -> build) into
    // the SAME store instance the caller's subscribers already hold (zustand
    // `replace: true` — spec §6.2 suggested implementation).
    store.setState(fresh.store.getState(), true);
  }
```
AFTER:
```ts
  async function reload(): Promise<void> {
    const id = entityForm.getId();
    if (id === undefined) return; // create mode: nothing to re-fetch (spec §6.2 FormRuntime.reload doc)
    // R1 (analysis §4.1): re-run the init pipe INTO the existing store (`into`)
    // so its action closures — and therefore its live subscribers (the mounted
    // field renderers) — stay authoritative. The prior
    // `store.setState(fresh.store.getState(), true)` replaced those closures
    // with a throwaway store's (which captured the throwaway's set/get),
    // orphaning EVERY write after the first reload (silent data loss).
    const initOpts: InitializeFormStoreOptions = { entityForm, id, adapter, into: store };
    if (session !== undefined) initOpts.session = session;
    await initializeFormStore(initOpts);
  }
```

### 테스트 (1)

**`packages/state/src/__tests__/form-controller.test.ts`** — `reload() keeps the ORIGINAL store authoritative: post-reload edits notify its subscribers, reflect in getValue, and a save-error surfaces on it`

Insert a new `it(...)` inside the existing `describe('createFormController.validate / reload (spec §6.2)', ...)` block, immediately after the existing 'reload() re-fetches and reflects the fresh record...' test (between its closing `});` and the describe's closing `});`). ARRANGE: `const entityForm = WidgetForm().withId('42');` `const store = createFormStore(entityForm, { fetchedData: { name: 'stale' } });` `store.getState().hydrate({ name: 'stale' });` `const getOne = vi.fn(async () => ({ name: 'fresh' }));` `const update = vi.fn(async () => { const err: BackendError = { code: 'UNKNOWN', message: 'saved elsewhere' }; throw err; });` `const controller = createFormController({ entityForm, store, adapter: fakeAdapter({ getOne, update }) });`. ACT+ASSERT: `await controller.reload();` then subscribe to the SAME store AFTER reload: `const seen: unknown[] = []; const unsub = store.subscribe((s) => { seen.push(s.fields.name?.current); });`. (1) `store.getState().setValue('name', 'edited'); expect(seen).toContain('edited');` — pins the failing-before behavior: pre-fix the write lands on the throwaway store so the original store's subscriber never fires and `seen` stays empty. (2) `expect(store.getState().getValue('name')).toBe('edited');` then `unsub();`. (3) `const outcome = await controller.save(); expect(outcome).toEqual({ ok: false, reason: 'error', error: { code: 'UNKNOWN', message: 'saved elsewhere' } }); expect(store.getState().messages).toContainEqual({ key: 'save-error', severity: 'error', text: 'saved elsewhere' });` — pre-fix `addMessage` hits the throwaway store, so the original store's `messages` stays `[]` and this fails. All symbols (WidgetForm, createFormStore, createFormController, fakeAdapter, BackendError, vi, expect, it) are already imported/defined in this file — no new imports.

### 수용 기준
Run `npx vitest run packages/state/src/__tests__/form-controller.test.ts` from /Users/kunner/dev/rcm-listgrid — the new test passes AND the existing 'reload() re-fetches and reflects the fresh record into the SAME store instance' + 'reload() is a no-op in create mode' tests stay green. Confirm the test is discriminating: temporarily reverting reload() to `store.setState(fresh.store.getState(), true)` (with a `fresh` var) makes the new test FAIL at `expect(seen).toContain('edited')` and at the `messages` assertion. Then run the full gate `npm test` (vitest run) — all green. Typecheck via the repo build (`npm run build` or tsc as configured) compiles with exactOptionalPropertyTypes:true.

---

## R2 — R2 (HIGH): advanced-search re-apply stacks same-field AND clauses → empty results  🟠 HIGH

**확정 접근**: No new public API. Switch ViewListGrid.applyAdvancedSearch from the stacking primitive `SearchForm.addAndFilter` to the EXISTING replace-by-name primitive `SearchForm.withFilter('AND', ...items)`: collect every non-empty panel value into a `FilterItem[]` and apply them in one `withFilter` call. `withFilter` (search-form.ts:229-245) already replaces an existing same-`name` item within the AND bucket in place — so editing a field and re-applying yields a single `{name: current}` clause instead of the unsatisfiable `AND(name=old, name=new)`, and non-panel (host/hook-seeded) AND clauses are preserved because `withFilter` only touches the names it is handed. Chosen over adding a new `removeAndFilterByName` primitive (the analysis §4.2 sketch) because withFilter (a) needs no key enumeration, (b) is the existing correct sibling pattern for replace-by-name — already unit-tested in search-form.test.ts:159-201, and (c) leaves public surface unchanged (/schema stays 188), so no openDecision is created. search-form.ts is left completely untouched (addAndFilter semantics preserved for its other callers per the Do-NOT).

**공개표면**: None. No public API added or changed. search-form.ts is untouched (addAndFilter and withFilter unchanged). ViewListGrid internally switches from the existing SearchForm.addAndFilter to the existing SearchForm.withFilter. Public-surface counts unchanged: /schema stays 188/190, EntityForm 49/55, root 57/120 (check:surface).

**Do-NOT**: Do NOT modify SearchForm.addAndFilter — neither its signature nor its plain-stacking semantics; other callers (and its unit test at search-form.test.ts:215-224) depend on stacking. Leave packages/schema-core/src/search/search-form.ts entirely untouched. · Do NOT add a new public SearchForm method (e.g. removeAndFilterByName/clearAndFilters). withFilter already provides the replace-by-name behavior R2 needs; adding one would be an unnecessary public-surface change (/schema 188→189) and a spec-level openDecision. · Do NOT change SearchForm.withFilter's semantics — it is already correct and covered by search-form.test.ts:159-201. · Do NOT attempt to also remove clauses for fields the user CLEARS between applies in this change — that is outside R2's symptom (same-field edit → unsatisfiable AND) and outside the acceptance test; it would require a new remove primitive = a separate public-API decision. · Do NOT drop the conditional spread for queryConditionType — assigning `queryConditionType: undefined` violates exactOptionalPropertyTypes and breaks the existing 'omits queryConditionType entirely' test.

**cold-executor**: executable=true · exactBefore matched reality VERBATIM on all three ViewListGrid.tsx anchors. (1) Line 4 import: `import type { Direction, EntityField, EntityForm, QueryConditionType } from '@listgrid/schema-core';` — exact. (2) Doc comment lines 253-266 inc

### 파일 변경 (3)

#### `packages/react/src/components/ViewListGrid.tsx` @ line 4 — @listgrid/schema-core type import
_note: Add the FilterItem type (already exported from schema-core/index.ts:265) so the collected items array can be typed. Alphabetical order kept._
BEFORE:
```ts
import type { Direction, EntityField, EntityForm, QueryConditionType } from '@listgrid/schema-core';
```
AFTER:
```ts
import type {
  Direction,
  EntityField,
  EntityForm,
  FilterItem,
  QueryConditionType,
} from '@listgrid/schema-core';
```

#### `packages/react/src/components/ViewListGrid.tsx` @ lines 253-266 — applyAdvancedSearch doc comment (stale addAndFilter/stacking NOTE)
_note: Doc-only update so the comment matches the new mechanism; no runtime effect. Optional for compilation but required to avoid a stale, contradictory NOTE._
BEFORE:
```ts
  // Apply: fold every NON-EMPTY filter value into the store's current
  // SearchForm via the existing `addAndFilter` (no schema-core API change),
  // then hand the result to `setSearchForm` (page-reset + refetch, same pipe
  // quickSearch/setSort already use). `config.operator` (spec §5.1's open
  // `string`) is cast to `QueryConditionType` ONLY when present — omitted
  // entirely otherwise (exactOptionalPropertyTypes forbids `queryConditionType:
  // undefined`; no default operator is invented).
  //
  // NOTE (deviation, see §Report): this starts from `store.getState()
  // .searchForm` — the CURRENT accumulated AND-filters — so re-applying with
  // DIFFERENT values across two searches stacks a second `name`-keyed AND
  // clause rather than replacing the first (SearchForm has no "remove by
  // name" primitive in its W5-3 scope — see the brief's re-apply de-dup
  // Do-NOT). A single apply (this task's acceptance bar) is unaffected.
```
AFTER:
```ts
  // Apply: collect every NON-EMPTY filter value into a FilterItem[] and fold
  // them into the store's current SearchForm via the existing `withFilter`
  // (no schema-core API change), then hand the result to `setSearchForm`
  // (page-reset + refetch, same pipe quickSearch/setSort already use).
  // `config.operator` (spec §5.1's open `string`) is cast to
  // `QueryConditionType` ONLY when present — omitted entirely otherwise
  // (exactOptionalPropertyTypes forbids `queryConditionType: undefined`; no
  // default operator is invented).
  //
  // R2 fix (advanced-search re-apply): `withFilter('AND', ...)` REPLACES an
  // existing same-`name` AND clause in place (0.3.x replace-by-name semantics,
  // search-form.ts:229-245) instead of the previous `addAndFilter` STACKING —
  // so editing a field and re-applying yields a single `{name: current}`
  // clause, not the unsatisfiable `AND(name=old, name=new)` that returned 0
  // rows. Non-panel AND clauses (host/hook-seeded) are preserved: `withFilter`
  // only touches the names it is handed. A clause for a field the user CLEARS
  // between applies is not removed (withFilter has no remove path) — out of
  // R2's scope; a `removeAndFilter*` primitive would be a separate
  // public-surface decision.
```

#### `packages/react/src/components/ViewListGrid.tsx` @ lines 267-279 — function applyAdvancedSearch
_note: The conditional-spread for queryConditionType is kept verbatim (exactOptionalPropertyTypes-safe). withFilter with an empty items[] early-returns an unchanged clone (search-form.ts:231), so the all-fields-empty apply keeps the exact prior no-op behavior. withFilter returns a new SearchForm; setSearchForm accepts it unchanged._
BEFORE:
```ts
  function applyAdvancedSearch(): void {
    let next = store.getState().searchForm;
    for (const { field, config } of filterFields) {
      const value = filterValues[field.getName()];
      if (value === undefined || value === null || value === '') continue;
      next = next.addAndFilter({
        name: field.getName(),
        value,
        ...(config.operator ? { queryConditionType: config.operator as QueryConditionType } : {}),
      });
    }
    void store.getState().setSearchForm(next);
  }
```
AFTER:
```ts
  function applyAdvancedSearch(): void {
    const items: FilterItem[] = [];
    for (const { field, config } of filterFields) {
      const value = filterValues[field.getName()];
      if (value === undefined || value === null || value === '') continue;
      items.push({
        name: field.getName(),
        value,
        ...(config.operator ? { queryConditionType: config.operator as QueryConditionType } : {}),
      });
    }
    const next = store.getState().searchForm.withFilter('AND', ...items);
    void store.getState().setSearchForm(next);
  }
```

### 테스트 (1)

**`packages/react/src/__tests__/view-list-grid.test.tsx`** — `re-applying with an edited value REPLACES the prior same-field AND clause instead of stacking (R2)`

Add this `it(...)` inside the existing `describe('ViewListGrid advanced-search panel (spec §7 CAP-20; W5-3)', ...)` block (immediately after the test ending at line 510, 'applying a non-empty value AND-filters ...'). It reuses the file's existing helpers `filterForm()`, `rowsAdapterWithCalls()`, `createListStore`, `UIProvider`/`defaultUIComponents`, `ViewListGrid` — no new imports. Body:

```
it('re-applying with an edited value REPLACES the prior same-field AND clause instead of stacking (R2)', async () => {
  const entityForm = filterForm();
  const { adapter, listCalls } = rowsAdapterWithCalls([
    { id: '1', name: 'Engineering', code: 'ENG' },
  ]);
  const store = createListStore({ url: entityForm.url, adapter });

  render(
    <UIProvider components={defaultUIComponents}>
      <ViewListGrid entityForm={entityForm} store={store} />
    </UIProvider>,
  );

  await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: '고급검색' }));

  // apply #1: name = ABC
  fireEvent.change(screen.getByLabelText('Name Filter'), { target: { value: 'ABC' } });
  fireEvent.click(screen.getByRole('button', { name: '검색' }));
  await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(2));
  expect(listCalls[1]?.toJSON().filters.AND).toEqual([
    { name: 'name', value: 'ABC', queryConditionType: 'LIKE' },
  ]);

  // apply #2: edit the SAME field to name = XYZ and re-apply
  fireEvent.change(screen.getByLabelText('Name Filter'), { target: { value: 'XYZ' } });
  fireEvent.click(screen.getByRole('button', { name: '검색' }));
  await waitFor(() => expect(adapter.list).toHaveBeenCalledTimes(3));

  // R2: a SINGLE {name: XYZ} clause, NOT the stacked AND(name=ABC, name=XYZ)
  expect(listCalls[2]?.toJSON().filters.AND).toEqual([
    { name: 'name', value: 'XYZ', queryConditionType: 'LIKE' },
  ]);
  // and the live store's searchForm agrees
  expect(store.getState().searchForm.toJSON().filters.AND).toEqual([
    { name: 'name', value: 'XYZ', queryConditionType: 'LIKE' },
  ]);
});
```

Failing-before behavior this pins: with the current `addAndFilter` code, apply #2 produces `filters.AND == [{name:'name',value:'ABC',queryConditionType:'LIKE'},{name:'name',value:'XYZ',queryConditionType:'LIKE'}]`, so both `toEqual([single])` assertions fail. After the fix (`withFilter`) they pass. 'code' is left empty throughout, so it never contributes a clause.

### 수용 기준
1) `npx vitest run packages/react/src/__tests__/view-list-grid.test.tsx` (from repo root) → all tests pass, including the new 'R2' test AND the two pre-existing apply tests unchanged ('applying a non-empty value AND-filters via addAndFilter ...' at old line 484 and 'omits queryConditionType entirely ...' at old line 512). 2) Confirm the test genuinely pins the bug: temporarily reverting the function to `addAndFilter` makes the new test FAIL with a length-2 AND array; restoring `withFilter` makes it pass. 3) `npm run type-check` → exit 0 (proves the FilterItem import + `.withFilter('AND', ...items)` typecheck under exactOptionalPropertyTypes). 4) `npm test` (full vitest) and `npm run test:e2e` (**RESIDUE CLOSURE**: repo script, not a bare `npx playwright test`) → still green (2373 unit / 32 e2e baseline). 5) `npm run check:surface` → run BEFORE and AFTER the edit and assert every count is byte-identical (search-form.ts + all public exports untouched, so any delta is a bug) — baseline is /schema 188/190, EntityForm 49/55, root 57/120.

---

## R3 — EF1 runtime required-override made authoritative for both Xref field types via xref-aware isBlank + removal of the inert required CustomValidation  🟡 MED

**확정 접근**: Single coherent mechanism: (1) make `isBlank` (schema-core `field/value.ts`) xref-envelope-aware — GUARDED by a new optional `fieldType?: FieldType` third parameter so ONLY `'xrefMapping'`/`'xrefPreferMapping'` get the new branch (`{mapped, deleted?}` counts as blank iff it has no `mapped` rows); every other caller omits the arg and behaves byte-for-byte as before. (2) Thread the field type into the check: `form-field.ts` `validate()` calls `isBlank(ctx.value, ctx.renderType, this.type)`. Because the generic required-blank path already reads `override?.required ?? isRequired` AND does an EARLY RETURN when blank, this alone makes the EF1 store override authoritative in BOTH directions (scenario A blocks, scenario B allows) AND renders the field-local required `CustomValidation` unreachable for the failing case. (3) Therefore REMOVE the redundant `withRequired` override + `buildRequiredValidation` + now-unused imports from BOTH xref classes — keeping it is the ONLY thing that breaks scenario B (it reads declaration-only `isRequired` and ignores `override.required=false`). I chose removal over keeping-and-short-circuiting because it yields a single required mechanism identical to every other field in the repo (criterion b: matches the correct sibling pattern), needs no key enumeration (a), and eliminates dead code rather than adding an always-inert validation. Scenario A is the forcing function: it declares the field WITHOUT `withRequired`, so no CustomValidation exists — only the generic `isBlank` path can block it, making the `isBlank` fix mandatory. The Do-NOT ('do not change isBlank for non-xref types') is satisfied structurally by the `fieldType` guard.

**공개표면**: schema-core public export `isBlank` gains a 3rd optional param `fieldType?: FieldType` (backward-compatible; existing 2-arg callers unaffected). Two internal class methods removed: `XrefMappingField.withRequired`/`XrefPreferMappingField.withRequired` overrides (now inherit FormField base) and the two module-private `buildRequiredValidation` helpers + `REQUIRED_VALIDATION_ID` consts. No FieldType count change, no store API change, no new public API. FieldType/schema surface counts unchanged.

**Do-NOT**: Do NOT change isBlank's behavior for any non-xref field: the `fieldType` param is optional and the xref branch is gated on `=== 'xrefMapping' || === 'xrefPreferMapping'`. Do not add other type literals, and do not remove the trailing generic `Array`/undefined/null/'' checks (they remain the path for every other field). · Do NOT keep the `withRequired` override or `buildRequiredValidation` in either xref class 'just in case' — keeping them is exactly what breaks scenario B (they read declaration-only `isRequired`). Remove them fully, along with the 6 now-unused imports. · Do NOT thread the override into the CustomValidation or add fields to FieldEvalContext — that path was considered and rejected; the generic required-blank path is the single mechanism. · Do NOT regress declaration-time required: `withRequired(true)` with empty mapped must still fail (proved by existing L66/L77/L89 in xref-mapping-field.test.ts and L59 in the prefer test, now satisfied via isBlank's early return). Do not delete those tests. · Do NOT touch the other isBlank call sites (month-field.ts:49, string-validation.ts:33, min-max-number-validation.ts:32) — they must keep passing 2 args. · Do NOT mutate the value envelope in validate(): the fix only READS `mapped`; the existing invariant `deleted` survives an emptied `mapped` (xref-mapping-field.test.ts:89 asserts slice.current is untouched).

**cold-executor**: executable=true · Every exactBefore matched the current file verbatim — no stale anchors. Verified line-by-line: value.ts:2 and :27-34; form-field.ts:153 (and this.type is typed FieldType at form-field.ts:44, so isBlank(...,this.type) compiles against the ne

### 파일 변경 (11)

#### `packages/schema-core/src/field/value.ts` @ value.ts:2 (import)
_note: Add FieldType to the type import for the isBlank guard._
BEFORE:
```ts
import type { FieldValue, FieldValueSlice, RenderType } from './types';
```
AFTER:
```ts
import type { FieldType, FieldValue, FieldValueSlice, RenderType } from './types';
```

#### `packages/schema-core/src/field/value.ts` @ value.ts:27-34 (isBlank)
_note: Optional 3rd param; the two guarded FieldType literals are exactly types.ts:34 and :42. All existing callers (form-field pre-edit, month-field.ts:49, string-validation.ts:33, min-max-number-validation.ts:32, field-core.test.ts) pass no fieldType => unchanged._
BEFORE:
```ts
/** Transplant of FormField.isBlank:531-539 — empty array / undefined / null / ''. */
export function isBlank(slice: FieldValue | undefined, renderType: RenderType = 'create'): boolean {
  const value = getCurrentValue(slice, renderType);
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === undefined || value === null || value === '';
}
```
AFTER:
```ts
/**
 * Transplant of FormField.isBlank:531-539 — empty array / undefined / null / ''.
 *
 * R3 (xref runtime-required fix): `fieldType` GUARDS an xref-only branch — for
 * the `xrefMapping`/`xrefPreferMapping` envelope (`{mapped, deleted?}` /
 * `{mapped}`, deliberately kept as a non-null object so `deleted` survives an
 * emptied `mapped`, hence never blank under the generic object check below)
 * blank means "no mapped rows". This lets the generic required-blank path
 * (`form-field.ts` `validate()`, which already reads `override?.required`)
 * govern xref requiredness like every other field, so the EF1 store override
 * (`setMeta({required})`) is authoritative in BOTH directions. Omitting
 * `fieldType` (every non-xref caller) leaves the original behavior untouched.
 */
export function isBlank(
  slice: FieldValue | undefined,
  renderType: RenderType = 'create',
  fieldType?: FieldType,
): boolean {
  const value = getCurrentValue(slice, renderType);
  if (fieldType === 'xrefMapping' || fieldType === 'xrefPreferMapping') {
    if (value === undefined || value === null) return true;
    const mapped = (value as { mapped?: unknown[] }).mapped;
    return mapped === undefined || mapped.length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === undefined || value === null || value === '';
}
```

#### `packages/schema-core/src/field/form-field.ts` @ form-field.ts:153 (validate, required-blank branch)
_note: Threads the field type so isBlank's xref branch fires. this.type is FieldType (matches new param). The surrounding `const required = override?.required ?? (await this.isRequired(ctx));` at line 151 is already correct and unchanged._
BEFORE:
```ts
      if (isBlank(ctx.value, ctx.renderType)) {
```
AFTER:
```ts
      if (isBlank(ctx.value, ctx.renderType, this.type)) {
```

#### `packages/schema-core/src/field/xref-mapping-field.ts` @ xref-mapping-field.ts:1-9 (imports)
_note: Drop the 6 imports used ONLY by the removed withRequired override + buildRequiredValidation (CustomValidation, ValidateResult, requiredMessage, getCurrentValue, RequiredType, FieldValue). Verified via grep: these symbols have no other use in this file. FormField (extends) + EntityForm/FilterItem (config) stay._
BEFORE:
```ts
import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { CustomValidation } from '../validations/custom-validation';
import { ValidateResult } from '../validation';
import { requiredMessage } from '../util/korean';
import { getCurrentValue } from './value';
import { FormField } from './form-field';
import type { RequiredType } from './conditional';
import type { FieldValue } from './types';
```
AFTER:
```ts
import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { FormField } from './form-field';
```

#### `packages/schema-core/src/field/xref-mapping-field.ts` @ xref-mapping-field.ts:68-89 (const + class doc)
_note: Removes the REQUIRED_VALIDATION_ID const and rewrites the class doc to the new mechanism._
BEFORE:
```ts
const REQUIRED_VALIDATION_ID = 'xref-mapping-required';

/**
 * Mapped/deleted id-list xref (0.3.x `XrefMappingField`, `supportPriority`
 * dropped — type `'xrefMapping'`).
 *
 * REQUIRED POSTURE (documented mechanism, EA-D2-1 decision — see the
 * `withRequired` override below): the generic required-blank check
 * (`form-field.ts` `validate()` → `isBlank(ctx.value, ctx.renderType)`,
 * `./value.ts`) can NEVER fire for this field. `isBlank` only special-cases
 * `Array`/`undefined`/`null`/`''`; `{mapped, deleted}` is always a non-null,
 * non-array OBJECT once the renderer has touched it — including the
 * "nothing mapped" state `{mapped: [], deleted: [...]}` — so `isBlank`
 * reports `false` (not blank) unconditionally (the same InlineMap-lesson
 * pitfall `inline-map-field.ts` documents for its own value shapes). The
 * envelope is deliberately ALWAYS kept as an object — `deleted` must survive
 * even when `mapped` empties out (the save wire needs it to tell the backend
 * which mappings to sever) — so the renderer never writes `undefined` to
 * "unblank" the field. `withRequired()` therefore attaches a `CustomValidation`
 * that inspects `mapped?.length` directly; THIS is the field's required
 * mechanism, not a generic-blank byproduct.
 */
```
AFTER:
```ts
/**
 * Mapped/deleted id-list xref (0.3.x `XrefMappingField`, `supportPriority`
 * dropped — type `'xrefMapping'`).
 *
 * REQUIRED POSTURE (R3): requiredness uses the SAME generic required-blank
 * path as every other field (`form-field.ts` `validate()` →
 * `isBlank(ctx.value, ctx.renderType, this.type)`). `isBlank` is xref-aware
 * (`./value.ts`, guarded by `fieldType`): the `{mapped, deleted}` envelope —
 * deliberately kept as a non-null object so `deleted` survives an emptied
 * `mapped` (the save wire needs it to tell the backend which mappings to
 * sever) — counts as blank iff it has no `mapped` rows. Because the generic
 * path already honors the EF1 store override (`override?.required ??
 * isRequired`), `setMeta({required})` is authoritative for this field in BOTH
 * directions at runtime; no field-local `CustomValidation` is attached (an
 * earlier design did, but it read declaration-only `isRequired` and so could
 * neither enable nor relax requiredness from a runtime override).
 */
```

#### `packages/schema-core/src/field/xref-mapping-field.ts` @ xref-mapping-field.ts:102-138 (getExcludeId .. buildRequiredValidation, to EOF)
_note: Removes the withRequired override and buildRequiredValidation entirely. withRequired now inherits FormField base (sets required flag only). Conditional/function required is still honored — the generic path at form-field.ts:151 runs the same `await this.isRequired(ctx)`._
BEFORE:
```ts
  getExcludeId(): string | undefined {
    return this.config.excludeId;
  }

  /**
   * Same `withRequired` call as every other field (FormField base) PLUS the
   * `mapped?.length` `CustomValidation` this field's blank-envelope shape
   * needs (class doc above). Idempotent — calling `withRequired` more than
   * once does not stack duplicate validations (checked by id).
   */
  override withRequired(required?: RequiredType): this {
    super.withRequired(required);
    if (!(this.validations ?? []).some((v) => v.id === REQUIRED_VALIDATION_ID)) {
      this.validations = [...(this.validations ?? []), buildRequiredValidation(this)];
    }
    return this;
  }
}

function buildRequiredValidation(field: XrefMappingField): CustomValidation {
  return new CustomValidation(REQUIRED_VALIDATION_ID, async (ctx, value) => {
    // Respects a conditional `required` (a function/preset, not just a
    // static `true`) the same way the generic required-blank check would —
    // this validation only fails when the field is CURRENTLY required.
    const required = await field.isRequired(ctx);
    if (!required) return ValidateResult.success();

    const current = getCurrentValue(value as FieldValue<XrefMappingValue>, ctx.renderType);
    const mapped = current?.mapped;
    if (mapped === undefined || mapped.length === 0) {
      const label =
        typeof field.getLabel() === 'string' ? String(field.getLabel()) : field.getName();
      return ValidateResult.fail(requiredMessage(label));
    }
    return ValidateResult.success();
  });
}
```
AFTER:
```ts
  getExcludeId(): string | undefined {
    return this.config.excludeId;
  }
}
```

#### `packages/schema-core/src/field/xref-prefer-mapping-field.ts` @ xref-prefer-mapping-field.ts:1-9 (imports)
_note: Same 6-import removal as the sibling. XrefPreferMappingValue type stays declared in-file (interface, not imported)._
BEFORE:
```ts
import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { CustomValidation } from '../validations/custom-validation';
import { ValidateResult } from '../validation';
import { requiredMessage } from '../util/korean';
import { getCurrentValue } from './value';
import { FormField } from './form-field';
import type { RequiredType } from './conditional';
import type { FieldValue } from './types';
```
AFTER:
```ts
import type { EntityForm } from '../entity-form';
import type { FilterItem } from '../search/search-form';
import { FormField } from './form-field';
```

#### `packages/schema-core/src/field/xref-prefer-mapping-field.ts` @ xref-prefer-mapping-field.ts:48-59 (const + class doc)
_note: Removes the const and rewrites the doc._
BEFORE:
```ts
const REQUIRED_VALIDATION_ID = 'xref-prefer-mapping-required';

/**
 * Preferred-flagged mapping xref (0.3.x `XrefPreferMappingField`, type
 * `'xrefPreferMapping'`).
 *
 * REQUIRED POSTURE: identical mechanism/rationale to `XrefMappingField`
 * (see that class's doc) — `{mapped}` is a non-array object, so the
 * generic `isBlank` required-blank check can never see it as blank;
 * `withRequired()` attaches a `CustomValidation` on `mapped?.length`
 * instead. This IS the field's documented required mechanism.
 */
```
AFTER:
```ts
/**
 * Preferred-flagged mapping xref (0.3.x `XrefPreferMappingField`, type
 * `'xrefPreferMapping'`).
 *
 * REQUIRED POSTURE (R3): identical mechanism to `XrefMappingField` — the
 * generic required-blank path drives requiredness, with `isBlank`
 * (`./value.ts`, guarded by `fieldType`) treating the `{mapped}` envelope as
 * blank iff it has no rows. The generic path honors the EF1 store override
 * (`override?.required ?? isRequired`), so runtime `setMeta({required})` is
 * authoritative in both directions; no field-local `CustomValidation` is
 * attached.
 */
```

#### `packages/schema-core/src/field/xref-prefer-mapping-field.ts` @ xref-prefer-mapping-field.ts:75-104 (withPreferredLabel .. buildRequiredValidation, to EOF)
_note: Removes the withRequired override and buildRequiredValidation. withPreferredLabel is kept verbatim._
BEFORE:
```ts
  /** 0.3.x parity builder (`XrefPreferMappingField.withPreferredLabel`). */
  withPreferredLabel(preferredLabel: string): this {
    this.config = { ...this.config, preferredLabel };
    return this;
  }

  override withRequired(required?: RequiredType): this {
    super.withRequired(required);
    if (!(this.validations ?? []).some((v) => v.id === REQUIRED_VALIDATION_ID)) {
      this.validations = [...(this.validations ?? []), buildRequiredValidation(this)];
    }
    return this;
  }
}

function buildRequiredValidation(field: XrefPreferMappingField): CustomValidation {
  return new CustomValidation(REQUIRED_VALIDATION_ID, async (ctx, value) => {
    const required = await field.isRequired(ctx);
    if (!required) return ValidateResult.success();

    const current = getCurrentValue(value as FieldValue<XrefPreferMappingValue>, ctx.renderType);
    const mapped = current?.mapped;
    if (mapped === undefined || mapped.length === 0) {
      const label =
        typeof field.getLabel() === 'string' ? String(field.getLabel()) : field.getName();
      return ValidateResult.fail(requiredMessage(label));
    }
    return ValidateResult.success();
  });
}
```
AFTER:
```ts
  /** 0.3.x parity builder (`XrefPreferMappingField.withPreferredLabel`). */
  withPreferredLabel(preferredLabel: string): this {
    this.config = { ...this.config, preferredLabel };
    return this;
  }
}
```

#### `packages/schema-core/src/__tests__/xref-mapping-field.test.ts` @ xref-mapping-field.test.ts:104-109 (idempotent test — must change, would fail otherwise)
_note: REQUIRED edit — this is the only existing xref-mapping-field.test assertion that fails under the fix (withRequired no longer adds a validation). All other assertions in this file stay green: the required-blank cases (L66/L77/L89) now come from isBlank's early return instead of the CustomValidation, still exactly 1 failure each; L98/L83/L111/L137 unchanged. The L65 describe title and L137 test name still mention 'CustomValidation' but their assertions pass. **RESIDUE CLOSURE (cold-executor R3)**: do NOT rewrite those describe/test strings in this pass — they are cosmetic (assertions stay green regardless) and rewriting them is out of scope; leave them byte-identical._
BEFORE:
```ts
  it('withRequired is idempotent — calling it twice does not stack duplicate validations', () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target })
      .withRequired(true)
      .withRequired(true);
    expect(f.validations).toHaveLength(1);
  });
```
AFTER:
```ts
  it('withRequired sets the required flag and attaches NO field validation (required is enforced by the generic isBlank path)', () => {
    const f = new XrefMappingField('professors', 10, { entityForm: target }).withRequired(true);
    expect(f.required).toBe(true);
    expect(f.validations).toBeUndefined();
  });
```

#### `packages/schema-core/src/__tests__/xref-prefer-mapping-field.test.ts` @ xref-prefer-mapping-field.test.ts:80-85 (idempotent test — must change)
_note: REQUIRED edit — mirror of the mapping-field change. L59/L69/L75 assertions stay green via isBlank early return._
BEFORE:
```ts
  it('withRequired is idempotent', () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target })
      .withRequired(true)
      .withRequired(true);
    expect(f.validations).toHaveLength(1);
  });
```
AFTER:
```ts
  it('withRequired sets the required flag and attaches NO field validation (required is enforced by the generic isBlank path)', () => {
    const f = new XrefPreferMappingField('college', 10, { entityForm: target }).withRequired(true);
    expect(f.required).toBe(true);
    expect(f.validations).toBeUndefined();
  });
```

### 테스트 (1)

**`packages/state/src/__tests__/field-meta.test.ts`** — `R3 scenario A/B — EF1 setMeta override governs xref requiredness end-to-end (new describe block appended)`

ADD imports XrefMappingField, XrefPreferMappingField to the existing `@listgrid/schema-core` import group (alongside EmailField, EntityForm, StringField...). ADD this helper + describe block at end of file:

function XrefForm(): EntityForm {
  return new EntityForm('MajorEntityForm', '/major').addFields({
    items: [
      // NOT required by declaration (scenario A base)
      new XrefMappingField('professors', 1, { entityForm: () => new EntityForm('P', '/p') }),
      // required by declaration (scenario B base)
      new XrefMappingField('staffs', 2, { entityForm: () => new EntityForm('S', '/s') }).withRequired(true),
      // prefer variant, NOT required by declaration (scenario A prefer)
      new XrefPreferMappingField('college', 3, { entityForm: () => new EntityForm('C', '/c') }),
    ],
  });
}

describe('R3 — EF1 required override on xref fields', () => {
  it('A: setMeta({required:true}) on a declared-not-required xref BLOCKS save when mapped is empty', async () => {
    const store = createFormStore(XrefForm());
    store.getState().setValue('professors', { mapped: [], deleted: [] });
    // declared-not-required + override absent -> valid
    expect(await store.getState().validateField('professors')).toBe(true);
    store.getState().setMeta('professors', { required: true });
    expect(await store.getState().validateField('professors')).toBe(false);
    expect(store.getState().fields.professors.errors?.length).toBeGreaterThan(0);
  });

  it('B: setMeta({required:false}) on a declared-required xref ALLOWS save when mapped is empty', async () => {
    const store = createFormStore(XrefForm());
    store.getState().setValue('staffs', { mapped: [], deleted: [] });
    // declared-required + empty mapped -> invalid before override
    expect(await store.getState().validateField('staffs')).toBe(false);
    store.getState().setMeta('staffs', { required: false });
    expect(await store.getState().validateField('staffs')).toBe(true);
    expect(store.getState().fields.staffs.errors ?? []).toHaveLength(0);
  });

  it('A (prefer): setMeta({required:true}) blocks an empty xrefPreferMapping', async () => {
    const store = createFormStore(XrefForm());
    store.getState().setValue('college', { mapped: [] });
    expect(await store.getState().validateField('college')).toBe(true);
    store.getState().setMeta('college', { required: true });
    expect(await store.getState().validateField('college')).toBe(false);
    expect(store.getState().fields.college.errors?.length).toBeGreaterThan(0);
  });
});

This faithfully reproduces the store->validation path: validateField calls field.validate(buildCtx(...), get().meta[name]) (form-store.ts:793), and meta[name] is exactly the FieldMetaOverride written by setMeta. Scenario A proves the fix's forcing case (no CustomValidation exists on an un-withRequired field, so only the xref-aware isBlank generic path can block). Scenario B proves relaxation now works (old CustomValidation ignored override.required=false and wrongly failed). getCurrentValue returns the setValue'd `current` slice regardless of renderType, so the tests are renderType-agnostic.

### 수용 기준
Run: `npx vitest run packages/schema-core/src/__tests__/xref-mapping-field.test.ts packages/schema-core/src/__tests__/xref-prefer-mapping-field.test.ts packages/schema-core/src/__tests__/field-core.test.ts packages/state/src/__tests__/field-meta.test.ts` — expect all files PASS, including the 3 new R3 scenario tests (A blocks, B allows, prefer-A blocks) and the two rewritten `withRequired ... attaches NO field validation` tests. Then full suite `npm test` (vitest run) — expect 0 failures (no other test references the removed validation ids `xref-mapping-required`/`xref-prefer-mapping-required` or `buildRequiredValidation`, verified by grep). Typecheck: `npx tsc -p packages/schema-core/tsconfig.json` and `npx tsc -p packages/state/tsconfig.json` — expect no errors (exactOptionalPropertyTypes:true; the new optional `fieldType?` param and the removed imports compile cleanly; unused-import lint is 'warn' only, but all 6 removed imports are gone so no warning either).

---

## R4 — validateAll: replace whole-map snapshot write with a functional per-field errors merge  🟡 MED

**확정 접근**: Keep validateAll's existing per-field loop and gating logic (snapshot `s` for the gate check is unchanged — that's an orthogonal, already-intentional design per the W4-3a comment) exactly as-is. Change ONLY the accumulator and the final commit: instead of building a full `fields` object off the stale pre-loop snapshot and calling the non-functional `set({ fields })`, collect just the computed `errors` messages per field name into a `Map`, then commit with a functional `set((cur) => ...)` that spreads the FRESHEST `cur.fields` and overwrites only the `errors` key per field. This is the same functional-merge pattern already used by every other writer in this file (e.g. `runAsyncValidationNow` ~518-527, `setFieldErrors` ~803-812) — it needs no named helper and no enumeration of which other keys to preserve, because spreading `cur.fields[name]` (read live, inside the updater) automatically carries forward whatever `asyncState`/`current`/`dirty` a concurrent write landed in the meantime.

**공개표면**: none — internal implementation change to validateAll()'s commit strategy; no public API signature change (FormStoreState.validateAll() keeps the same Promise<boolean> signature and observable per-call gating semantics).

**Do-NOT**: Do NOT change the gate-check logic (the `slice = s.fields[name]` block) — it intentionally reads the pre-loop snapshot `s` for THIS call's verdict; that is a separate, already-settled design decision (W4-3a comment), not part of the R4 defect. · Do NOT introduce a named helper function for the merge (e.g. `mergeFieldErrors`) — inline the functional `set((cur) => ...)` exactly as given; do not leave any helper's body unspecified. · Do NOT change `set({ fields })` to `set((s) => ({ fields: { ...s.fields, ...fields } }))` (spreading the whole stale `fields` object over `cur.fields`) — that re-introduces the same clobber for every key inside each touched field's slice object (asyncState/current/dirty), not just the top-level map; only the per-field `errors` key may be written. · Do NOT reorder the two new fields ('alias' before 'slow') in the test — sortedFieldDefs sorts by getOrder(), and the race depends on 'alias' being processed (and its neutral validate() completing) before validateAll parks on 'slow'. · Do NOT drop the `slowCallCount` guard in the test's CustomValidation — without it the second (post-race) validateAll() call creates a new unresolved Promise every time and the test hangs/times out. · Do NOT resolve `resolveSlowCheck` before `resolveAliasCheck` in the test — the ordering (alias's check settles first, mid-loop) is what reproduces the exact race window the bug depends on. · Do NOT touch runAsyncValidationNow (~502-528) or any other functional `set((s) => ...)` writer in this file — they are already correct and are cited only as the existing pattern to match.

**cold-executor**: executable=true · All three exactBefore blocks match the real files verbatim. (1) form-store.ts validateAll() exactBefore == lines 815-844 exactly (full W4-3a comment, `const fields = { ...s.fields }`, per-field `fields[name] = { ...fields[name], errors: mes

### 파일 변경 (3)

#### `packages/state/src/form-store.ts` @ validateAll() ~lines 815-845
_note: Only the accumulator (fields object -> messagesByField Map) and the final commit change. The gate-check logic (lines using `s.fields[name]`/`slice`) is untouched — it intentionally reads the pre-loop snapshot for the gate verdict of THIS call; the bug fixed here is only about not clobbering the STORED asyncState afterward. `messages` stays typed as `{ message: string }[]` (structurally FieldError[]) matching the existing pattern used two methods above in `setFieldErrors`._
BEFORE:
```ts
      async validateAll() {
        const s = get();
        let valid = true;
        const fields = { ...s.fields };
        for (const field of sortedFieldDefs(s)) {
          const name = field.getName();
          const errs = await field.validate(buildCtx(s, name), s.meta[name]);
          const messages = errs.map((e) => ({ message: e.message }));
          // W4-3a (D1, spec §5.3/§6.2): async save-gating. A field declaring an
          // AsyncValidation whose value is DIRTY but has not resolved to
          // 'valid' is invalid — NO network here: the sync validate() above
          // stays neutral (AsyncValidation.validate() always succeeds), and
          // this reads the stored tri-state the check already resolved. Gated
          // on `dirty` so an untouched update-form field (its persisted value
          // already confirmed) needs no re-check, and a reverted value
          // (resetValue -> 'unchecked', dirty=false) doesn't block save. See
          // FieldValueSlice.asyncState + form-controller.ts save flow.
          const slice = s.fields[name];
          if (
            findAsyncValidation(field) !== undefined &&
            slice?.dirty === true &&
            slice.asyncState !== 'valid'
          ) {
            messages.push({ message: asyncGateMessage(slice.asyncState) });
          }
          fields[name] = { ...fields[name], errors: messages };
          if (messages.length > 0) valid = false;
        }
        set({ fields });
        return valid;
      },
```
AFTER:
```ts
      async validateAll() {
        const s = get();
        let valid = true;
        const messagesByField = new Map<string, { message: string }[]>();
        for (const field of sortedFieldDefs(s)) {
          const name = field.getName();
          const errs = await field.validate(buildCtx(s, name), s.meta[name]);
          const messages = errs.map((e) => ({ message: e.message }));
          // W4-3a (D1, spec §5.3/§6.2): async save-gating. A field declaring an
          // AsyncValidation whose value is DIRTY but has not resolved to
          // 'valid' is invalid — NO network here: the sync validate() above
          // stays neutral (AsyncValidation.validate() always succeeds), and
          // this reads the stored tri-state the check already resolved. Gated
          // on `dirty` so an untouched update-form field (its persisted value
          // already confirmed) needs no re-check, and a reverted value
          // (resetValue -> 'unchecked', dirty=false) doesn't block save. See
          // FieldValueSlice.asyncState + form-controller.ts save flow.
          const slice = s.fields[name];
          if (
            findAsyncValidation(field) !== undefined &&
            slice?.dirty === true &&
            slice.asyncState !== 'valid'
          ) {
            messages.push({ message: asyncGateMessage(slice.asyncState) });
          }
          messagesByField.set(name, messages);
          if (messages.length > 0) valid = false;
        }
        // R4 fix (analysis §4.3, MEDIUM): the old `set({ fields })` below
        // replaced the ENTIRE fields map with the `s.fields` snapshot taken
        // at the top of this function (only patched with `errors`). If an
        // in-flight AsyncValidation's own check (runAsyncValidationNow, this
        // file) resolves DURING this loop's await window, its live
        // `set((s) => ...)` write (e.g. asyncState 'checking' -> 'valid')
        // lands on the store — then this function's final non-functional
        // `set({ fields })` clobbered it straight back to the pre-race
        // 'checking' snapshot, sticking the tri-state forever (no further
        // trigger fires for an already-settled check) and permanently
        // blocking save via asyncGateMessage. Fix: merge functionally,
        // reading the FRESHEST `cur.fields` inside the updater, and writing
        // ONLY the computed `errors` key per field — every other key
        // (asyncState/current/dirty/...) keeps whatever the freshest state
        // holds, so a concurrent write can never be undone by this commit.
        set((cur) => {
          const fields = { ...cur.fields };
          for (const [name, messages] of messagesByField) {
            fields[name] = { ...fields[name], errors: messages };
          }
          return { fields };
        });
        return valid;
      },
```

#### `packages/state/src/__tests__/async-validation.test.ts` @ top-of-file import from '@listgrid/schema-core' (~lines 2-8)
_note: CustomValidation is exported from packages/schema-core/src/index.ts:80 — used only to build a controllable second field that holds validateAll's per-field await loop open during the test (see new test below)._
BEFORE:
```ts
import {
  AsyncValidation,
  EntityForm,
  StringField,
  ValidateResult,
  type BackendAdapter,
} from '@listgrid/schema-core';
```
AFTER:
```ts
import {
  AsyncValidation,
  CustomValidation,
  EntityForm,
  StringField,
  ValidateResult,
  type BackendAdapter,
} from '@listgrid/schema-core';
```

#### `packages/state/src/__tests__/async-validation.test.ts` @ between the end of the 'form-store AsyncValidation (W4-3a) — save-gating in validateAll' describe block and the start of 'createFormController.save (W4-3a async gate — spec §6.2)' describe block (~lines 349-354)
_note: Inserted as a new top-level describe block. Uses the file's existing beforeEach(vi.useFakeTimers())/afterEach(vi.useRealTimers()) (lines 43-49) — no new timer setup needed. slowCallCount guard is required: 'slow' field's CustomValidation.validate() re-runs on every validateAll() call (schema-core form-field.ts:164), so without the guard the second (post-race) validateAll() call would create a brand-new never-resolved Promise and hang the test._
BEFORE:
```ts
    // not dirty -> the async gate is skipped, so the untouched record saves.
    expect(await store.getState().validateAll()).toBe(true);
  });
});

describe('createFormController.save (W4-3a async gate — spec §6.2)', () => {
```
AFTER:
```ts
    // not dirty -> the async gate is skipped, so the untouched record saves.
    expect(await store.getState().validateAll()).toBe(true);
  });
});

// R4 (analysis 2026-07-13/midpoint-code-review.md §4.3, MEDIUM) —
// validateAll's final write must not clobber a concurrently-resolving
// AsyncValidation check back to a stale pre-loop snapshot.
describe('form-store AsyncValidation — R4: validateAll must not clobber a concurrently-resolving async check', () => {
  it('a change-triggered async check that resolves during validateAll\'s await window ends "valid" (not stuck "checking"), and a later save is not blocked', async () => {
    let resolveAliasCheck!: (r: ValidateResult) => void;
    let resolveSlowCheck!: (r: ValidateResult) => void;
    let slowCallCount = 0;
    const form = new EntityForm('R4EntityForm', '/r4').addFields({
      items: [
        new StringField('alias', 1)
          .withLabel('Alias')
          .withValidations(
            new AsyncValidation(
              () => new Promise<ValidateResult>((res) => (resolveAliasCheck = res)),
              { debounceMs: 50 },
            ),
          ),
        // 'slow' exists purely to hold validateAll's per-field await loop
        // open (via a real pending Promise) so 'alias'’s AsyncValidation check
        // can settle WHILE validateAll is still mid-loop — the exact race the
        // R4 bug depends on. Only the FIRST invocation blocks; the second
        // validateAll() call below (post-race) must resolve immediately or
        // it would hang forever.
        new StringField('slow', 2)
          .withLabel('Slow')
          .withValidations(
            new CustomValidation('slow-check', () => {
              slowCallCount += 1;
              if (slowCallCount === 1) {
                return new Promise<ValidateResult>((res) => (resolveSlowCheck = res));
              }
              return Promise.resolve(ValidateResult.success());
            }),
          ),
      ],
    });
    const store = createFormStore(form);

    store.getState().setValue('alias', 'candidate'); // dirty, schedules the 'change'-trigger debounce
    await vi.advanceTimersByTimeAsync(50); // fires the debounce -> runAsyncValidationNow -> 'checking', now parked awaiting the held check promise
    expect(store.getState().fields.alias?.asyncState).toBe('checking');

    const validateAllPending = store.getState().validateAll();
    // validateAll's snapshot (taken synchronously above, before the check
    // settles) sees 'checking' and gates THIS call — expected, orthogonal to
    // R4. validateAll is now parked awaiting 'slow's CustomValidation, i.e.
    // it has NOT reached its final write yet: this is the R4 race window.

    resolveAliasCheck(ValidateResult.success()); // the async check settles WHILE validateAll is still mid-loop
    resolveSlowCheck(ValidateResult.success()); // release validateAll's remaining field so it can reach its final write
    await validateAllPending;

    // R4 fix: the final write must not clobber the just-settled 'valid' back
    // to the pre-race 'checking' snapshot.
    expect(store.getState().fields.alias?.asyncState).toBe('valid');

    // save is not blocked: a fresh validateAll (post-race) reads the settled
    // 'valid' state and passes cleanly. Pre-fix, asyncState stayed stuck
    // 'checking' forever (no new trigger ever fires for an already-settled
    // check), permanently blocking save via asyncGateMessage.
    expect(await store.getState().validateAll()).toBe(true);
    expect(store.getState().fields.alias?.errors ?? []).toEqual([]);
  });
});

describe('createFormController.save (W4-3a async gate — spec §6.2)', () => {
```

### 테스트 (1)

**`packages/state/src/__tests__/async-validation.test.ts`** — `form-store AsyncValidation — R4: validateAll must not clobber a concurrently-resolving async check > a change-triggered async check that resolves during validateAll's await window ends "valid" (not stuck "checking"), and a later save is not blocked`

ARRANGE: build an EntityForm with two fields — 'alias' (order 1) carrying an AsyncValidation whose check() returns a Promise held open via `resolveAliasCheck`, debounceMs:50; 'slow' (order 2) carrying a CustomValidation whose validateFunction returns a Promise held open via `resolveSlowCheck` on its FIRST call only (a `slowCallCount` counter makes every subsequent call resolve immediately, since sortedFieldDefs re-invokes it on every validateAll() call). Create `store = createFormStore(form)`. ACT 1: `store.getState().setValue('alias','candidate')` (dirty, schedules the change-trigger debounce); `await vi.advanceTimersByTimeAsync(50)` fires the debounce, which sets asyncState 'checking' and starts awaiting the held check Promise. ASSERT 1: `store.getState().fields.alias?.asyncState` is 'checking'. ACT 2: call `const validateAllPending = store.getState().validateAll()` (not awaited) — its per-field loop processes 'alias' (AsyncValidation.validate() is always neutral/immediate) then parks awaiting 'slow's held CustomValidation Promise, i.e. validateAll has NOT reached its final `set()` yet. ACT 3: `resolveAliasCheck(ValidateResult.success())` then `resolveSlowCheck(ValidateResult.success())` (in that order, synchronously back to back) then `await validateAllPending`. ASSERT 2 (the R4 regression pin — fails on the pre-fix `set({ fields })` snapshot-replace, passes after the functional-merge fix): `store.getState().fields.alias?.asyncState` equals 'valid' (not stuck 'checking'). ASSERT 3 (save not blocked): `await store.getState().validateAll()` resolves to `true`, and `store.getState().fields.alias?.errors ?? []` equals `[]`.

### 수용 기준
cd /Users/kunner/dev/rcm-listgrid && npx vitest run packages/state/src/__tests__/async-validation.test.ts — all tests in the file pass, including the new 'R4: validateAll must not clobber a concurrently-resolving async check' describe block. Additionally run the full suite to confirm no regression: npx vitest run (or `npm test` from repo root) — same total pass count as before this change plus the 1 new test, 0 failures. Revert-check: temporarily re-applying only the OLD `set({ fields })` line (reverting form-store.ts) while keeping the new test must make the new test fail with `fields.alias?.asyncState` observed as 'checking' at ASSERT 2 (confirms the test actually pins the bug).

---

## R5 — FieldRenderer predicate effect: Promise.allSettled + non-permissive error fallback (required fails closed)  🟡 MED

**확정 접근**: Rewrite the predicate resolution inside the existing async IIFE in FieldRenderer.tsx to use `Promise.allSettled` instead of `Promise.all`, and resolve each settled result independently. Chosen error-fallback policy (the analysis §4.3 left an 'or'): on a rejected predicate we do NOT fall to the permissive `false` default — instead we KEEP the field's last-known resolved value by simply not calling that predicate's state setter (the useState seed is `false`, which already equals the declared-static value of any predicate that can throw: only the `ValuedBoolean` function branch can reject, and `getStaticConditionalBoolean` returns `false` for the function branch — so "keep last-known if any, else declared-static" collapses to "don't overwrite" and needs NO extra tracking state or access to the field's private raw conditional). `required` is the one exception: on rejection it fails CLOSED via `setRequired(true)` so a throwing predicate can never silently disable the `*` and the required-validation gate. Chosen over the alternative "wrap the whole IIFE in one try/catch" because per-predicate settle is what actually fixes the confirmed root cause (one throwing predicate dropping ALL THREE gates), matches the sibling `.catch` posture in many-to-one-renderer.tsx / custom-option-renderer.tsx, touches no public surface, and enumerates no easily-missed keys. `Promise.allSettled` never rejects and no other code in the block throws, so the async IIFE can no longer produce an unhandled rejection. The `cancelled` guard (`if (!cancelled) { ... }`) is preserved verbatim around the whole assignment block.

**공개표면**: none (internal react-layer behavior change only; no exported symbols added or changed — public-surface counts unchanged 49/57/188)

**Do-NOT**: Do NOT restore permissive `false` on error for any gate — the whole bug is that a thrown predicate dropped gates to false. On rejection: hidden/readOnly keep last-known (skip the setter), required fails closed to true. · Do NOT default required to false on error — that is precisely the defect being fixed. · Do NOT touch the synchronous permission hard-gate `const permitted = field.isPermitted(...)` / `effHidden = !permitted || ...` (lines 96-103) — it is already safe and synchronous, outside this effect. · Do NOT remove or alter the `let cancelled = false;` / `if (!cancelled)` guard or the cleanup `return () => { cancelled = true; };` — keep them exactly, wrap only the assignment logic inside the existing `if (!cancelled)` block. · Do NOT change the useEffect dependency array `[store, session, field, fieldName, slice, depSignal]`. · Do NOT add a try/catch around the whole IIFE as the fix mechanism — allSettled is the fix; adding a broad catch is redundant and would obscure which predicate failed. · Do NOT change the useState seeds `useState(false)` for hidden/required/readOnly (they are the correct declared-static baseline: only the async function branch can throw, and its static value is false). · Do NOT edit schema-core conditional.ts / getConditionalBoolean — this is a react-layer fix; the predicate contract stays `Promise<boolean>`.

**cold-executor**: executable=true · exactBefore matches FieldRenderer.tsx:73-83 VERBATIM (6-space indent, exact Promise.all block + if(!cancelled) assignment) — string-replace lands cleanly. tsconfig.json confirms lib es2020 (line 4) so Promise.allSettled/PromiseSettledResult

### 파일 변경 (1)

#### `packages/react/src/components/FieldRenderer.tsx` @ FieldRenderer.tsx:73-83 (inside the predicate useEffect's async IIFE)
_note: Only the Promise.all call + the if(!cancelled) assignment block is replaced. The surrounding `useEffect(() => { let cancelled = false; (async () => { const state = ...; const ctx = {...}; <REPLACED>; })(); return () => { cancelled = true; }; }, [...])` is untouched — the cancelled guard is preserved. Target is es2020 / lib es2020 (tsconfig.json:3-4), so Promise.allSettled is in-lib; PromiseSettledResult narrowing on `.status` makes `.value`/`.reason` type-safe (no exactOptionalPropertyTypes concern — no object literals introduced). console.error is the same prefix style as many-to-one-renderer.tsx:84._
BEFORE:
```ts
      const [isHidden, isRequired, isReadOnly] = await Promise.all([
        field.isHidden(ctx),
        field.isRequired(ctx),
        field.isReadOnly(ctx),
      ]);

      if (!cancelled) {
        setHidden(isHidden);
        setRequired(isRequired);
        setReadOnly(isReadOnly);
      }
```
AFTER:
```ts
      // R5 — Promise.allSettled (NOT Promise.all): one throwing predicate must
      // NOT drop the other two gates to their permissive `false` default, and
      // the discarded rejected promise must not surface as an unhandled
      // rejection. On a rejected predicate we KEEP the field's last-known
      // resolved value (never fall to permissive false — the useState seed is
      // also the declared-static value, since only the async ValuedBoolean
      // branch can throw). `required` additionally fails CLOSED (stays
      // required) so a throwing predicate can never silently disable the `*`
      // and the required-validation gate. Sibling posture: many-to-one-
      // renderer.tsx / custom-option-renderer.tsx both `.catch` their async
      // resolves rather than let them reject.
      const [hiddenResult, requiredResult, readOnlyResult] = await Promise.allSettled([
        field.isHidden(ctx),
        field.isRequired(ctx),
        field.isReadOnly(ctx),
      ]);

      if (!cancelled) {
        if (hiddenResult.status === 'fulfilled') setHidden(hiddenResult.value);
        else
          console.error(
            '[@listgrid/react] FieldRenderer isHidden predicate threw',
            fieldName,
            hiddenResult.reason,
          );

        if (readOnlyResult.status === 'fulfilled') setReadOnly(readOnlyResult.value);
        else
          console.error(
            '[@listgrid/react] FieldRenderer isReadOnly predicate threw',
            fieldName,
            readOnlyResult.reason,
          );

        if (requiredResult.status === 'fulfilled') setRequired(requiredResult.value);
        else {
          // fail CLOSED — a throwing required predicate must NOT drop the field
          // to not-required (that would disable the `*` and the required gate).
          setRequired(true);
          console.error(
            '[@listgrid/react] FieldRenderer isRequired predicate threw; failing closed (required)',
            fieldName,
            requiredResult.reason,
          );
        }
      }
```

### 테스트 (1)

**`packages/react/src/__tests__/field-predicate-error.test.tsx`** — `R5 — a throwing required predicate fails CLOSED and emits no unhandled rejection`

NEW FILE. Write it verbatim (harness copied from field-meta-reactive.test.tsx — real ui-default primitives + registerDefaultRenderers + full provider stack + ViewEntityForm, JSDOM render). Full content:

import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntityForm, StringField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

// A field whose required predicate is an async ValuedBoolean that ALWAYS
// rejects. Under the pre-R5 Promise.all path this rejection (a) dropped all
// three gates (required stayed at the permissive seed `false` -> no
// aria-required) and (b) surfaced as an unhandled rejection from the discarded
// async IIFE promise.
function throwingRequiredForm(): EntityForm {
  return new EntityForm('ThrowEntityForm', '/throw').addFields({
    items: [
      new StringField('name', 1)
        .withLabel('Name')
        .withRequired(() => Promise.reject(new Error('boom'))),
    ],
  });
}

function renderForm(entityForm: EntityForm) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('R5 — FieldRenderer predicate error fallback', () => {
  it('a throwing required predicate fails CLOSED (stays required) and emits no unhandled rejection', async () => {
    const seen: unknown[] = [];
    const handler = (reason: unknown) => seen.push(reason);
    process.on('unhandledRejection', handler);
    try {
      renderForm(throwingRequiredForm());
      const nameInput = await screen.findByLabelText(/^Name/);
      // ASSERT 1: required stays enforced despite the throw (pre-R5: absent).
      await waitFor(() => expect(nameInput).toHaveAttribute('aria-required', 'true'));
      // let any discarded rejected promise surface on the process.
      await new Promise((r) => setTimeout(r, 0));
    } finally {
      process.off('unhandledRejection', handler);
    }
    // ASSERT 2: the throwing predicate produced no unhandled rejection
    // (pre-R5: Promise.all propagated the 'boom' error out of the fire-and-
    // forget IIFE).
    expect(
      seen.some((r) => r instanceof Error && r.message === 'boom'),
    ).toBe(false);
  });
});

Both assertions FAIL on the pre-R5 code (aria-required absent because no setter runs after the rejected Promise.all; and the 'boom' rejection is unhandled) and PASS after the patch.

### 수용 기준
Run `npx vitest run packages/react/src/__tests__/field-predicate-error.test.tsx` from repo root → 1 passed. Then `npx vitest run packages/react` → all existing react tests still green (no regression; note field-meta-reactive.test.tsx still passes — its declared-not-required 'name' resolves to false via a fulfilled predicate, so setHidden/setRequired/setReadOnly still run). Then `npm run type-check` → exit 0 (Promise.allSettled is in the es2020 lib per tsconfig.json:3-4; PromiseSettledResult `.status` narrowing keeps `.value`/`.reason` type-safe). No public-surface change, so `npm run check:surface` counts are unchanged (49/57/188).

---

## R6 — getSessionStorageObject throws SyntaxError on empty-string stored value  🟡 MED

**확정 접근**: Replace the ad-hoc `value === undefined` guard in getSessionStorageObject with the same isBlank(value) guard already used by the sibling getLocalStorageObject (storage.ts:120), then apply the same non-null-assertion style on the two downstream reads — this is a direct copy of the correct sibling pattern already in the same file, needs no new import (isBlank is already imported at storage.ts:7), and touches zero public surface.

**공개표면**: none

**Do-NOT**: Do NOT change getSessionStorageItem (storage.ts:139-152) — the bug is only in getSessionStorageObject's guard, not in the lower-level item getter, which already correctly returns '' for an empty stored value (that '' propagating to JSON.parse is exactly the bug). · Do NOT add a new import for isBlank — it is already imported at storage.ts:7 and used by getLocalStorageObject in the same file. · Do NOT drop the `!` non-null assertions on `customParse(value!)` / `parse<T>(value!)` — isBlank is not a TS type-predicate so removing them will cause a TS2345 type error (`string | undefined` not assignable to `string`) since the compiler no longer narrows `value` after the isBlank check. · Do NOT touch getLocalStorageObject (storage.ts:115-123) itself — it is already correct and is the pattern being copied, not a target of this fix. · Do NOT change the customParse call signature or add new optional parameters — this is a one-line guard fix, not an API change.

**cold-executor**: executable=true · exactBefore matches the real file verbatim. storage.ts:154-162 getSessionStorageObject is exactly as quoted (guard `if (value === undefined) return undefined;`, `customParse(value)` without `!`, `parse<T>(value!)`). exactAfter is a correct 

### 파일 변경 (1)

#### `packages/utils/src/storage.ts` @ storage.ts:154-162 getSessionStorageObject
_note: isBlank is already imported at storage.ts:7 (`import { isBlank } from './internal';`) — no import edit needed. Note the `!` added to `customParse(value)` -> `customParse(value!)`: isBlank is not a TS type predicate, so unlike the old `value === undefined` check it does not narrow `value` from `string | undefined` to `string`; the sibling getLocalStorageObject (storage.ts:120-122) already carries this same non-null assertion on both downstream reads for exactly this reason — mirror it exactly or the file will fail to typecheck._
BEFORE:
```ts
export function getSessionStorageObject<T>(
  key: string,
  customParse?: (value: string) => T | undefined,
): T | undefined {
  const value = getSessionStorageItem(key);
  if (value === undefined) return undefined;
  if (customParse !== undefined) return customParse(value);
  return parse<T>(value!);
}
```
AFTER:
```ts
export function getSessionStorageObject<T>(
  key: string,
  customParse?: (value: string) => T | undefined,
): T | undefined {
  const value = getSessionStorageItem(key);
  if (isBlank(value)) return undefined;
  if (customParse !== undefined) return customParse(value!);
  return parse<T>(value!);
}
```

### 테스트 (2)

**`packages/utils/src/__tests__/storage.test.ts`** — `getSessionStorageObject returns undefined for an empty-string stored value`

Insert as a new it(...) block immediately after the existing it('getSessionStorageObject returns undefined for a missing key', ...) block (test.ts:105-107), still inside the describe('sessionStorage helpers (jsdom-backed)', ...) block (whose beforeEach/afterEach at test.ts:86-87 already clear window.sessionStorage — no new setup needed). Exact code to insert:

  it('getSessionStorageObject returns undefined for an empty-string stored value', () => {
    setSessionStorageItem('k', '');
    expect(getSessionStorageObject('k')).toBeUndefined();
  });

Before the fix this throws SyntaxError: Unexpected end of JSON input (from JSON.parse('') inside parse<T>(value!)) instead of returning undefined — this test pins that regression. setSessionStorageItem and getSessionStorageObject are already imported at test.ts:9 and test.ts:12 respectively; no import edit needed.

**`packages/utils/src/__tests__/storage.test.ts`** — `getLocalStorageObject returns undefined for an empty-string stored value`

Symmetric localStorage guard test, requested by the review to document that the sibling already behaves correctly (regression guard, not a behavior change). Insert as a new it(...) block immediately after the existing it('getLocalStorageObject supports a custom parse fn', ...) block (test.ts:79-82), still inside describe('localStorage helpers (jsdom-backed)', ...) (beforeEach/afterEach at test.ts:51-52 already clear window.localStorage). Exact code to insert:

  it('getLocalStorageObject returns undefined for an empty-string stored value', () => {
    setLocalStorageItem('k', '');
    expect(getLocalStorageObject('k')).toBeUndefined();
  });

This passes both before and after the storage.ts fix (getLocalStorageObject already guards with isBlank) — it exists purely to lock in the symmetric contract the review called for. setLocalStorageItem and getLocalStorageObject are already imported at test.ts:5 and test.ts:8 respectively; no import edit needed.

### 수용 기준
From repo root (/Users/kunner/dev/rcm-listgrid): run `npx vitest run packages/utils/src/__tests__/storage.test.ts`. Expected: all tests in the file pass, including the two new ones (`getSessionStorageObject returns undefined for an empty-string stored value` and `getLocalStorageObject returns undefined for an empty-string stored value`) — zero failures, zero thrown SyntaxError. Then run the full suite `npm test` (vitest run) from repo root to confirm no regression elsewhere; expected all packages green.

---

## R7 — TIER2 exportValue passthrough: defensive scalar extraction for nested relation-object row values (no more literal "[object Object]")  🟡 MED

**확정 접근**: Add an unconditional defensive guard inside exportValue's TIER 2 `default` case only (packages/excel/src/value-transform.ts). It is unconditional — no FieldType branch, no manyToOne/xref/address special-casing — because value-transform.ts's exportValue signature is `(type: FieldType, value: unknown, options?: ValueTransformOptions)` and never receives the field's ManyToOneConfig/labelField; DataFieldSpec (packages/schema-core/src/data-transfer.ts:18-34) carries only `name`/`label`/`type`, no labelField, confirmed by reading the file — so there is no configured label key reachable from this pure type-keyed switch to thread through (threading ManyToOneConfig.labelField in would require widening DataFieldSpec's public shape and export-core.ts's call chain, out of scope for a MED defensive fix). Deterministic fallback probe order on the raw object, first present-and-non-nullish key wins: `name`, then `label`, then `id`; `''` if none present. This is the minimal-public-surface option (the review's alternative — TIER3-exclude+warn — is rejected because it silently drops legitimate scalar-shaped manyToOne rows from export instead of degrading gracefully). GA still empirically confirms against real GJCU list-endpoint row shape per the review's Do-NOT — that remains a verification step, not an implementation decision, and is unaffected by this fix (the guard already handles both nested-object and flat-scalar shapes correctly).

**공개표면**: none (packages/excel/src/value-transform.ts: one new unexported internal helper exportTier2Value, not added to index.ts/barrel exports; exportValue's public signature and exported behavior for all previously-passing inputs is unchanged — only the default-case object-handling path changes)

**Do-NOT**: Do NOT special-case by FieldType (no `if (type === 'manyToOne' || type === 'xrefMapping' || ...)` branch) — the guard must be unconditional per the review's explicit instruction, since GA has not yet confirmed which TIER2 types actually receive nested objects from GJCU. · Do NOT add a `labelField` property to `DataFieldSpec` (packages/schema-core/src/data-transfer.ts) or thread `ManyToOneConfig.labelField` through `export-core.ts`'s call chain to `exportValue` — that is a public-schema-surface change out of scope for this MED defensive fix; the deterministic name/label/id fallback is the resolved approach. · Do NOT touch `importValue` — the review's finding and this fix are export-only (TIER2 `default` case of `exportValue`); import-side nested-object handling was not reported and is out of scope. · Do NOT touch the TIER 1 switch cases (select/multiselect/date/datetime/boolean/html/markdown) — only the `default:` (TIER 2) branch changes. · Do NOT change `AUTO_DERIVE_EXCLUDED_TYPES` / `isAutoDeriveExcluded` — manyToOne/xref*/address staying OUT of TIER 3 is correct and unrelated to this fix; do not move them into TIER 3 as an alternative 'fix'. · Do NOT guess or hardcode a specific GJCU field name (e.g. do not assume the label key is literally 'companyName' or similar) — the fallback probe order is exactly `name`, `label`, `id`, in that order, nothing else. · Do NOT wrap the new helper's Array.isArray check in a way that changes existing TIER2 array-value behavior — arrays still fall to `String(value)` exactly as before; only non-array objects get the label-extraction treatment.

**cold-executor**: executable=true · Both exactBefore blocks match the current file verbatim. fileChange #1 matches value-transform.ts lines 133-150 exactly (ValueTransformOptions interface through `switch (type) {`). fileChange #2's block `    default:\n      return String(va

### 파일 변경 (2)

#### `packages/excel/src/value-transform.ts` @ new helper inserted just above exportValue, between ValueTransformOptions (ends line 135) and exportValue's doc comment (line 137)
BEFORE:
```ts
export interface ValueTransformOptions {
  options?: ValueTransformOption[] | undefined;
}

/**
 * Export a field's runtime value to its xlsx-cell string representation,
 * keyed off `type` (TIER 1 switch; everything else is TIER 2 passthrough —
 * see file header). `options` carries the field's declared `SelectOption[]`
 * for `select`/`multiselect` (`Type.ts:540-564`); omit for every other type.
 */
export function exportValue(
  type: FieldType,
  value: unknown,
  options?: ValueTransformOptions,
): string {
  if (value === undefined || value === null) return '';

  switch (type) {
```
AFTER:
```ts
export interface ValueTransformOptions {
  options?: ValueTransformOption[] | undefined;
}

/**
 * TIER 2 passthrough's defensive guard for `exportValue`'s `default` case
 * (R7, midpoint-code-review.md §4.3). A manyToOne/xref*/address field's
 * runtime row value can be the nested RELATED-ENTITY OBJECT itself (not yet
 * flattened to a scalar id/label) when the backend list response embeds the
 * relation inline — `String({...})` on that shape literally yields the
 * string `"[object Object]"`. This guard is UNCONDITIONAL (no `FieldType`
 * branch, no manyToOne-specific check) because `exportValue`'s signature
 * (`type`, `value`, `options?: { options?: SelectOption[] }`) never receives
 * the field's `ManyToOneConfig`/`labelField` — `DataFieldSpec`
 * (`@listgrid/schema-core/data-transfer.ts:18-34`) carries only
 * `name`/`label`/`type`, no `labelField` (checked; confirmed absent) — so
 * there is no configured label key reachable here. Deterministic fallback
 * probe order on the raw object: `name`, then `label`, then `id`, first
 * present-and-non-nullish value wins; `''` if none match. Non-object,
 * non-array values (the TIER 2 common case: string/number/boolean/etc.)
 * are untouched — `String(value)`, identical to the prior behavior. GA still
 * confirms this against the real GJCU list-endpoint row shape (§9 GA
 * brief) — a verification step now, not an open runtime decision.
 */
function exportTier2Value(value: object): string {
  if (!Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const label = obj.name ?? obj.label ?? obj.id;
    return label === undefined || label === null ? '' : String(label);
  }
  return String(value);
}

/**
 * Export a field's runtime value to its xlsx-cell string representation,
 * keyed off `type` (TIER 1 switch; everything else is TIER 2 passthrough —
 * see file header). `options` carries the field's declared `SelectOption[]`
 * for `select`/`multiselect` (`Type.ts:540-564`); omit for every other type.
 */
export function exportValue(
  type: FieldType,
  value: unknown,
  options?: ValueTransformOptions,
): string {
  if (value === undefined || value === null) return '';

  switch (type) {
```

#### `packages/excel/src/value-transform.ts` @ exportValue's default: case, exact current lines 182-183
BEFORE:
```ts
    default:
      return String(value);
  }
}
```
AFTER:
```ts
    default:
      return typeof value === 'object' ? exportTier2Value(value) : String(value);
  }
}
```

### 테스트 (1)

**`packages/excel/src/__tests__/value-transform.test.ts`** — `appended inside describe('TIER 2 — scalar passthrough (every FieldType not in TIER 1/TIER 3)'), as the last it() block, right before that describe's closing `});` which currently follows the 'import: number passes the value through unchanged' test (line ~183)`

ARRANGE: none (pure function call). ACT+ASSERT — insert this exact code as the last it(...) inside the existing describe('TIER 2 — scalar passthrough (every FieldType not in TIER 1/TIER 3)', () => { ... }) block:

  it('export: manyToOne row value {id,name} exports the label, not "[object Object]"', () => {
    expect(exportValue('manyToOne', { id: 7, name: 'Acme Inc' })).toBe('Acme Inc');
  });

  it('export: manyToOne row value with no name falls back to label then id', () => {
    expect(exportValue('manyToOne', { id: 7, label: 'Acme Label' })).toBe('Acme Label');
    expect(exportValue('manyToOne', { id: 7 })).toBe('7');
  });

  it('export: manyToOne row value already flattened to a scalar id passes through unchanged (regression guard)', () => {
    expect(exportValue('manyToOne', 7)).toBe('7');
  });

This pins the failing-before behavior: before the fix, exportValue('manyToOne', { id: 7, name: 'Acme Inc' }) returns the literal string '[object Object]'; after the fix it returns 'Acme Inc'. Run: cd packages/excel && npx vitest run src/__tests__/value-transform.test.ts — all three new assertions plus the full existing suite in that file must pass.

### 수용 기준
1) `cd /Users/kunner/dev/rcm-listgrid && npx vitest run packages/excel/src/__tests__/value-transform.test.ts` — exits 0, all existing tests still green plus the 3 new manyToOne assertions pass. 2) `cd /Users/kunner/dev/rcm-listgrid && npx vitest run packages/excel/src/__tests__/export-core.test.ts` — exits 0 (unaffected by this change but must not regress, since export-core.ts's bridgeExportValue calls exportValue unchanged). 3) `cd /Users/kunner/dev/rcm-listgrid/packages/excel && npx tsc --noEmit` (or the package's existing typecheck script) — 0 errors (new exportTier2Value helper is fully typed, no any). 4) Manual grep proof: `grep -n 'exportTier2Value' packages/excel/src/value-transform.ts` shows the helper defined once and called once from the default: case. 5) GA-blocking (unchanged from the review, not part of this ticket's acceptance): GA brief still empirically confirms real GJCU manyToOne/xref/address list-row shape and records the result — this fix makes that confirmation a non-blocking check instead of a required design decision, but does not remove the GA verification step itself.

---

## R8 — DataImporter.handleSubmit — catch rejecting onSubmit and surface SUBMIT_ERROR  🟡 MED

**확정 접근**: Wrap the existing `await onSubmit(rows)` in a catch clause that calls `setError(SUBMIT_ERROR)`, mirroring the exact pattern the parse path already uses for PARSE_ERROR (single new module-level string constant + setError call), and keep the existing `finally { setSubmitting(false) }` untouched. This is the only approach discussed in the analysis (§4.3 R8's `확정 설계안` already names this exact shape); there is no second option to choose between.

**공개표면**: none (SUBMIT_ERROR is a module-private, unexported constant; no change to DataImporterProps or any public API)

**Do-NOT**: Do not remove or reorder the existing `finally { setSubmitting(false) }` — it must still run on both success and failure paths. · Do not clear `rows` inside the new catch block — nothing in the review or existing code calls for discarding the parsed rows on submit failure; only add the error display. · Do not export SUBMIT_ERROR from DataImporter.tsx — the three sibling error constants (NO_FIELD_MATCH_ERROR, NO_DATA_ERROR, PARSE_ERROR) are module-private; stay consistent. · Do not add a global unhandledRejection listener or any new test-infrastructure file for this fix — the catch block itself is the fix; the test proves it indirectly via the alert + re-enable assertions, matching this suite's existing style. · Do not change the onSubmit prop type (`(rows) => Promise<void> | void`) — the catch must handle both a rejecting Promise and a synchronously-throwing non-async onSubmit (the existing `await` already coerces a non-Promise return, and a synchronous throw inside a non-async onSubmit is also caught by the same try/catch since the throw happens before/during the awaited call).

**cold-executor**: executable=false · All three fileChange exactBefore blocks match the real files VERBATIM. (1) DataImporter.tsx:43-45 — `const PARSE_ERROR = '엑셀 파일을 읽는 중...확인하세요.';` blank line, then `export function DataImporter({ entityForm, onSubmit, onClose }: DataImporter

### 파일 변경 (3)

#### `packages/excel/src/DataImporter.tsx` @ DataImporter.tsx:43 (constant block, just above the component)
_note: New constant SUBMIT_ERROR, same declaration style/placement as PARSE_ERROR/NO_DATA_ERROR/NO_FIELD_MATCH_ERROR immediately above it. Not exported (matches the existing three error constants, none of which are exported either)._
BEFORE:
```ts
const PARSE_ERROR = '엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식(xlsx)을 확인하세요.';

export function DataImporter({ entityForm, onSubmit, onClose }: DataImporterProps) {
```
AFTER:
```ts
const PARSE_ERROR = '엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식(xlsx)을 확인하세요.';
const SUBMIT_ERROR = '데이터 제출 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.';

export function DataImporter({ entityForm, onSubmit, onClose }: DataImporterProps) {
```

#### `packages/excel/src/DataImporter.tsx` @ DataImporter.tsx:90-98 (handleSubmit)
_note: Adds a catch between the existing try and finally. finally's setSubmitting(false) is untouched per the Do-NOT. rows is intentionally left populated on failure (matches host retry expectation; no existing code path clears rows on submit failure, and nothing in the review calls for adding one)._
BEFORE:
```ts
  async function handleSubmit(): Promise<void> {
    if (rows.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(rows);
    } finally {
      setSubmitting(false);
    }
  }
```
AFTER:
```ts
  async function handleSubmit(): Promise<void> {
    if (rows.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(rows);
    } catch {
      setError(SUBMIT_ERROR);
    } finally {
      setSubmitting(false);
    }
  }
```

#### `packages/excel/src/__tests__/DataImporter.test.tsx` @ DataImporter.test.tsx:124-134 (third `it(...)` through the closing `describe` brace)
_note: Reuses the existing renderImporter/selectFile/bufferFromAoa/FakeFileReader harness already in this file (renderImporter accepts a custom onSubmit mock as its one parameter, per its signature at line 61). Uses the same header/row fixture as the file's first test so the file parses to a non-empty rows array and Submit becomes enabled before the click. The final assertion (`toBeEnabled()` after the failed submit) proves the button re-enables — pinning the 'button re-enables' half of the bug — and the alert assertion proves the error-message half. No explicit unhandled-rejection assertion is added: the catch block added in DataImporter.tsx structurally eliminates the unhandled rejection (the awaited promise's rejection is now handled inside handleSubmit); do not add a `process.on('unhandledRejection', ...)` listener — no other test in this repo's suites does that, and it would be inventing test infrastructure outside this fix's scope._
BEFORE:
```ts
  it('shows an error and keeps Submit disabled when no header cell matches a declared field', async () => {
    currentBuffer = bufferFromAoa([['Unrelated\n[nope]'], ['x']]);
    const { onSubmit } = renderImporter();

    selectFile();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```
AFTER:
```ts
  it('shows an error and keeps Submit disabled when no header cell matches a declared field', async () => {
    currentBuffer = bufferFromAoa([['Unrelated\n[nope]'], ['x']]);
    const { onSubmit } = renderImporter();

    selectFile();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error and re-enables Submit when onSubmit rejects, without an unhandled rejection', async () => {
    currentBuffer = bufferFromAoa([
      ['Name\n[name]', 'Status\n[status]', 'Active\n[active]'],
      ['Acme College', 'Active', '예'],
    ]);
    const onSubmit = vi.fn().mockRejectedValue(new Error('network down'));
    renderImporter(onSubmit);

    selectFile();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '데이터 제출 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.',
      ),
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});
```

### 테스트 (1)

**`packages/excel/src/__tests__/DataImporter.test.tsx`** — `shows an error and re-enables Submit when onSubmit rejects, without an unhandled rejection`

Arrange: currentBuffer = bufferFromAoa([['Name\n[name]','Status\n[status]','Active\n[active]'], ['Acme College','Active','예']]); onSubmit = vi.fn().mockRejectedValue(new Error('network down')); renderImporter(onSubmit). Act: selectFile(); wait for Submit button enabled; fireEvent.click(Submit). Assert: (1) onSubmit called once (await waitFor); (2) screen.getByRole('alert') eventually has textContent '데이터 제출 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.' (await waitFor) — this is the currently-failing-before-fix behavior: today no alert ever appears because handleSubmit has no catch; (3) Submit button is enabled again (rows still populated, submitting reset to false) — today this already happens (button re-enables), so this assertion alone does not pin the bug, but combined with (2) it proves the full R8 symptom pair (button re-enables AND no error shown) is fixed together.

### 수용 기준
From repo root: `npx vitest run packages/excel/src/__tests__/DataImporter.test.tsx` — the new test 'shows an error and re-enables Submit when onSubmit rejects, without an unhandled rejection' passes, and the existing 3 tests (parses+calls onSubmit / drops blank rows / no-field-match error) remain green. Then `npm run type-check` (root `tsc --noEmit`; **RESIDUE CLOSURE**: the repo uses npm and has NO per-package scripts — `pnpm --filter @listgrid/excel run type-check` does not exist) → exit 0.

---

## R9 — EntityForm.clone() 를 this-preserving 시그니처로 변경 (spec Law L3 위반 수정)  ⚪ LOW

**확정 접근**: EntityForm.clone()의 반환 타입을 `EntityForm`에서 `this`로 바꾸고, 하드코딩된 `new EntityForm(this.name, this.url)` 생성 대신 런타임 생성자를 통해 인스턴스를 만드는 `new (this.constructor as new (name: string, url: string) => this)(this.name, this.url)` 패턴을 적용한다. 이 패턴을 선택한 이유: EntityForm.clone()의 나머지 본문(58줄)은 최상위-키 단위 얕은 복사/배열 복사를 `copy.<field> = ...` 형태로 필드별 수행하는 구조라서, form-field.ts의 `Object.assign(Object.create(getPrototypeOf(this)), this)` 스타일(생성자를 아예 건너뛰는 방식)로 바꾸면 58줄의 필드별 복사 로직을 전부 걷어내는 대규모 리라이트가 되어 회귀 위험이 커진다. 대신 생성자만 서브클래스 인지형으로 바꾸는 최소 변경으로 L3(`clone(): this`)를 만족시키고 기존 필드별 복사 로직은 전부 보존한다 — 표면 변경 최소화(공개 API 변경은 반환 타입 시그니처 하나뿐이고 동작은 동일).

**공개표면**: EntityForm.clone()의 반환 타입이 EntityForm → this로 바뀐다(공개 API 시그니처 변경, 동작은 동일 — 서브클래스가 아닌 기존 호출부는 this가 EntityForm과 동일하므로 무영향). 새 export/구조 없음.

**Do-NOT**: 본문(copy.titleSpec 부터 return copy 까지, 58줄)을 Object.assign/Object.create 패턴으로 다시 쓰지 말 것 — 회귀 위험 대비 이득이 없다(위 resolvedApproach 참조). 오직 클래스 선언 3줄만 바꾼다. · 생성자 캐스트를 `as any`로 단순화하지 말 것 — `new (this.constructor as new (name: string, url: string) => this)(...)` 캐스트가 정확히 컴파일됨을 로컬에서 tsc(strict+exactOptionalPropertyTypes)로 이미 확인했다. · CustomEntityForm에 생성자를 새로 선언하지 말 것 — 기본 상속 생성자(name, url)를 그대로 써야 clone()의 2-인자 호출과 시그니처가 맞는다는 이 픽스의 전제(2-인자 생성자 가정)를 테스트가 검증하게 된다. · field-core.test.ts 대신 새 파일(entity-form-clone.test.ts 등)을 만들지 말 것 — EntityForm.clone() 테스트는 이미 field-core.test.ts의 'EntityForm declaration (charter C1)' describe 블록에 산다(65~70줄 기존 clone 테스트 참조), 그 옆에 추가한다.

**cold-executor**: executable=true · exactBefore matched reality verbatim at all three anchors. (1) entity-form.ts:1094-1096 — the JSDoc line, `clone(includeValue = false): EntityForm {`, and `const copy = new EntityForm(this.name, this.url);` are byte-identical to the file; t

### 파일 변경 (3)

#### `packages/schema-core/src/entity-form.ts` @ entity-form.ts:1094-1096 EntityForm.clone() 선언부
_note: 나머지 clone() 본문(copy.titleSpec = {...this.titleSpec}; 부터 return copy; 까지, 원본 1097~1152줄)은 한 글자도 바꾸지 않는다 — copy는 여전히 EntityForm의 protected/private 필드에 접근 가능한 타입(this extends EntityForm)이므로 기존 필드별 복사 라인은 그대로 컴파일된다. 마지막 줄 `return copy;`도 그대로 둔다(타입이 EntityForm→this로 자동으로 좁혀짐)._
BEFORE:
```ts
  /** Declaration clone (charter C1: `userForm.clone().withId(id)` for the form screen). */
  clone(includeValue = false): EntityForm {
    const copy = new EntityForm(this.name, this.url);
```
AFTER:
```ts
  /**
   * Declaration clone (charter C1: `userForm.clone().withId(id)` for the form screen).
   * This-preserving (spec Law L3: `clone(): this`) — constructs via the
   * RUNTIME constructor (`this.constructor`), not the hardcoded `EntityForm`
   * class, so a subclass instance's `clone()` returns that same subclass,
   * not a plain `EntityForm` (same posture as `FormField.clone()` in
   * ./field/form-field.ts, which is this-preserving via a different
   * mechanism — Object.create on the live prototype — since FormField has no
   * fixed 2-arg constructor to replay).
   */
  clone(includeValue = false): this {
    const copy = new (this.constructor as new (name: string, url: string) => this)(
      this.name,
      this.url,
    );
```

#### `packages/schema-core/src/__tests__/field-core.test.ts` @ field-core.test.ts:43-45 CollegeForm() 헬퍼와 describe 블록 사이
_note: CustomEntityForm은 오버라이드 없이 EntityForm 생성자(name, url)를 그대로 물려받는다 — clone() 내부의 `new (this.constructor as ...)(this.name, this.url)` 호출과 시그니처가 일치해야 하므로 별도 생성자를 추가하지 않는다._
BEFORE:
```ts
        new BooleanField('active', 900).withLabel('사용여부').withDefaultValue(true),
      ],
    });
}

describe('EntityForm declaration (charter C1)', () => {
```
AFTER:
```ts
        new BooleanField('active', 900).withLabel('사용여부').withDefaultValue(true),
      ],
    });
}

// R9 — a trivial EntityForm subclass with no overrides, used to assert
// clone()'s this-preserving contract (spec Law L3: `clone(): this`).
class CustomEntityForm extends EntityForm {}

describe('EntityForm declaration (charter C1)', () => {
```

#### `packages/schema-core/src/__tests__/field-core.test.ts` @ field-core.test.ts:65-71 'clone is independent' 테스트 다음, describe 블록 닫는 괄호 앞
_note: toBeInstanceOf 단언 스타일은 동일 패키지의 checkbox-field.test.ts:117 (`expect(clone).toBeInstanceOf(CheckboxField)`)과 custom-option-field.test.ts:125의 기존 관례를 그대로 따른다._
BEFORE:
```ts
  it('clone is independent (declaration copy)', () => {
    const a = CollegeForm();
    const b = a.clone();
    expect(b.getField('name')).not.toBe(a.getField('name'));
    expect(b.getFields().length).toBe(a.getFields().length);
  });
});
```
AFTER:
```ts
  it('clone is independent (declaration copy)', () => {
    const a = CollegeForm();
    const b = a.clone();
    expect(b.getField('name')).not.toBe(a.getField('name'));
    expect(b.getFields().length).toBe(a.getFields().length);
  });

  it('clone() is this-preserving — a subclass instance clones to the same subclass (spec Law L3, R9)', () => {
    const custom = new CustomEntityForm('CustomEntityForm', '/custom');
    const cloned = custom.clone();
    expect(cloned).toBeInstanceOf(CustomEntityForm);
  });
});
```

### 테스트 (1)

**`packages/schema-core/src/__tests__/field-core.test.ts`** — `EntityForm declaration (charter C1) > clone() is this-preserving — a subclass instance clones to the same subclass (spec Law L3, R9)`

Arrange: `const custom = new CustomEntityForm('CustomEntityForm', '/custom');` where `class CustomEntityForm extends EntityForm {}` is defined at module scope (no overrides). Act: `const cloned = custom.clone();`. Assert: `expect(cloned).toBeInstanceOf(CustomEntityForm);` — before the fix this fails because clone() hardcodes `new EntityForm(...)`, so `cloned` is a plain EntityForm instance, not a CustomEntityForm, and toBeInstanceOf(CustomEntityForm) is false.

### 수용 기준
1) `cd /Users/kunner/dev/rcm-listgrid && npx vitest run packages/schema-core/src/__tests__/field-core.test.ts` → all tests in the file pass, including the new 'clone() is this-preserving' test. 2) `npx tsc -p packages/schema-core/tsconfig.json --noEmit` (or the package's existing typecheck script) → no new type errors; `EntityForm.clone()`'s declared return type is `this`, matching `FormField.clone(): this` (field/form-field.ts:286) precedent. 3) Grep confirms no call site depends on `clone()` returning the literal `EntityForm` type in a breaking way: `grep -rn '\.clone()' packages/schema-core/src packages/react/src packages/state/src 2>/dev/null` — every existing use only chains `with*`/getter calls (which `this`-typed builders already support), so no call site needs updating.

---

## R10 — withId() widen to accept undefined (Law L4 undefined=release), mirror withRevision  ⚪ LOW

**확정 접근**: Widen withId's param to `id: string | undefined` and, when undefined, clear this.id back to undefined — exactly mirroring the existing withRevision(entityName: string | undefined) pattern at entity-form.ts:878-880. This requires also widening the backing field `private id?: string;` (entity-form.ts:469) to `private id: string | undefined = undefined;`, because under this repo's exactOptionalPropertyTypes:true, an optional property (`id?: string`) forbids assigning the literal `undefined` to it — only an explicit `string | undefined` union type (the exact pattern already used for `revisionEntityName` at line 491, with the same in-code rationale comment) permits `this.id = undefined`. This is the only viable approach (no alternative was viable: keeping `id?: string` and doing `delete this.id` would work at runtime but breaks the mirror-withRevision consistency the analysis calls for and diverges from the codebase's established exactOptionalPropertyTypes idiom used for every other undefined-clearable field in this class). No other call site or downstream consumer needs changes: getId() already returns `string | undefined`, and clone()'s existing guard `if (this.id !== undefined) copy.id = this.id;` (line 1113) remains correct and compiles unchanged against the widened field type. (NB: the authoring agent referenced a `mode()` method here — it does NOT exist; ignore any `mode()` mention.)

**공개표면**: packages/schema-core public API: EntityForm.withId signature changes from `withId(id: string): this` to `withId(id: string | undefined): this` — a widening (backward-compatible, no existing call site with a string argument breaks). Brings the implementation into conformance with the already-published spec (documents/plans/entityform-public-api-spec.md §3.1 row 50, which already documents `(id: string | undefined): this` — this fix corrects code to match already-committed spec, not the reverse).

**Do-NOT**: Do NOT change the field declaration to stay `id?: string` and use `delete this.id` inside withId — it would compile but breaks the mandated mirror-of-withRevision pattern and is inconsistent with every other undefined-clearable field in this class (meta/revisionEntityName/dataTransfer all use explicit `| undefined` union types, never `delete`). · Do NOT touch clone() (entity-form.ts:1113) — its existing `if (this.id !== undefined) copy.id = this.id;` guard is already correct and compiles unchanged against the widened `string | undefined` field type; rewriting it to an unconditional assignment (to mirror revisionEntityName's clone line 1128) is an unrelated cosmetic change outside R10's scope. · Do NOT add a branch inside withId (e.g. `if (id === undefined) { delete this.id } else { this.id = id }`) — once the field is `string | undefined`, the plain `this.id = id;` assignment already implements clear-on-undefined; adding a branch is unnecessary code the reviewer would flag as over-engineering relative to the withRevision precedent it must match line-for-line in spirit. · Do NOT change getId()'s return type or body (entity-form.ts:941-943) — it already returns `string | undefined` and needs no edit. · Do NOT add a `mode()` method — it does not exist and inventing it is out of R10 scope. · Do NOT rename the new test file or place it outside packages/schema-core/src/__tests__/ — that directory is the established location for entity-form declaration-layer tests (revision.test.ts, entity-form-meta.test.ts, entity-form-title.test.ts, entity-form-data-transfer.test.ts all live there).

**cold-executor**: executable=false · The two source-file changes' exactBefore strings match the current file VERBATIM: (1) field block lines 468-469 `  private formReadOnly = false;\n  private id?: string;` — exact; (2) withId lines 622-626 `  /** Mark this instance as an exis

### 파일 변경 (2)

#### `packages/schema-core/src/entity-form.ts` @ entity-form.ts:469 (private id field declaration)
_note: Widens the backing field so `this.id = undefined` typechecks under exactOptionalPropertyTypes:true (tsconfig.json:13). Mirrors the revisionEntityName field declaration/comment at entity-form.ts:484-491 verbatim in style._
BEFORE:
```ts
  private formReadOnly = false;
  private id?: string;
```
AFTER:
```ts
  private formReadOnly = false;
  /**
   * Declared record id (spec §3.1, renderType 판별자) — `withId`'s storage.
   * `undefined` = create-mode (not declared). This field is declared
   * `| undefined` explicitly (exactOptionalPropertyTypes), same posture as
   * {@link revisionEntityName}, so `withId(undefined)` can clear a
   * previously-declared id back to "not declared" (L4 "undefined = clear").
   */
  private id: string | undefined = undefined;
```

#### `packages/schema-core/src/entity-form.ts` @ entity-form.ts:622-626 (withId method)
_note: The method body `this.id = id; return this;` is UNCHANGED — only the param type widens and the doc comment is replaced. Once the field is `string | undefined` (file change #1), a plain assignment already implements the clear-on-undefined behavior identically to withRevision's body at entity-form.ts:878-880, so no branching/delete logic is needed inside the method._
BEFORE:
```ts
  /** Mark this instance as an existing-record (update) form. */
  withId(id: string): this {
    this.id = id;
    return this;
  }
```
AFTER:
```ts
  /**
   * Mark this instance as an existing-record (update) form, or clear it
   * back to create-mode (spec §3.1 `withId` signature row: `(id: string |
   * undefined): this`). `undefined` CLEARS a previously-set id back to
   * "not declared" (L4 "undefined = release", `withRevision(undefined)`
   * precedent) — from that point on `getId()` reports `undefined` again.
   */
  withId(id: string | undefined): this {
    this.id = id;
    return this;
  }
```

### 테스트 (1)

**`packages/schema-core/src/__tests__/entity-form-id.test.ts`** — `new file — mirrors packages/schema-core/src/__tests__/revision.test.ts structure, scoped to withId/getId ONLY`

> **⚠ RESIDUE CLOSURE (cold-executor R10)**: `EntityForm.mode()` does **NOT exist** (verified: no method definition, no `.mode(` call anywhere in `packages/schema-core/src`). The authoring agent fabricated it. The **source patch above is correct** and does not depend on `mode()`; only the test/prose referenced it. Below is the **corrected** test — getId-only assertions (the symbol R10 actually touches). Do NOT add a `mode()` method (that would be inventing new public API outside R10; if update/create derivation is ever wanted it is a separate spec item).

Create the file with this exact content:

import { describe, expect, it } from 'vitest';
import { EntityForm } from '../index';

// EntityForm.withId / getId (spec §3.1, R10) — the record-id declaration.
// Covers: round-trip, undefined clear (L4 "undefined = release"),
// chainability, and replace semantics. Mirrors revision.test.ts's
// withRevision coverage shape.

function BareForm(): EntityForm {
  return new EntityForm('WidgetEntityForm', '/widget');
}

describe('EntityForm.withId / getId (round-trip)', () => {
  it('an EntityForm with no withId() call reports getId() === undefined', () => {
    const form = BareForm();
    expect(form.getId()).toBeUndefined();
  });

  it("withId('42') round-trips: getId() === '42'", () => {
    const form = BareForm().withId('42');
    expect(form.getId()).toBe('42');
  });

  it('withId(undefined) clears a previously-set id back to undefined (L4)', () => {
    const form = BareForm().withId('42');
    expect(form.getId()).toBe('42');
    form.withId(undefined);
    expect(form.getId()).toBeUndefined();
  });

  it('withId() is chainable (returns this)', () => {
    const form = BareForm();
    expect(form.withId('42')).toBe(form);
  });

  it('a later withId() call REPLACES the previous declaration (L1 with* semantics)', () => {
    const form = BareForm().withId('first');
    form.withId('second');
    expect(form.getId()).toBe('second');
  });
});

**Pre-fix red is a TYPE error, not a runtime failure** (correcting the authoring agent's false rationale): `packages/schema-core/tsconfig.json` EXCLUDES `**/*.test.ts`, and vitest (esbuild) strips types without checking — so `npx vitest run` on the pre-fix code would actually RUN and PASS the getId-only assertions (runtime `this.id = undefined` works even with `id?: string`). The pre-fix defect surfaces only under a test-inclusive typecheck: `withId(undefined)` is `TS2345` against the pre-fix `withId(id: string)` signature. If pre-fix red is required as evidence, run: `npx tsc --noEmit --strict --exactOptionalPropertyTypes packages/schema-core/src/entity-form.ts packages/schema-core/src/__tests__/entity-form-id.test.ts` → expect `TS2345` on the `withId(undefined)` line pre-fix, exit 0 post-fix.

### 수용 기준
cd /Users/kunner/dev/rcm-listgrid && npx vitest run packages/schema-core/src/__tests__/entity-form-id.test.ts — **expect 5 passed, 0 failed** (post-fix). Then `npm run type-check` (root `tsc --noEmit`, which INCLUDES tests via the root tsconfig) → exit 0, confirming the `withId(undefined)` call and the exactOptionalPropertyTypes-safe field widening compile clean repo-wide (including entity-form.ts's untouched clone() at line 1113 which must still typecheck against the widened field).

---

## R11 — reset() clears pending validate/async debounce timers + touched marks (analysis §4.4)  ⚪ LOW

**확정 접근**: Apply the exact same clearTimeout+delete cleanup addField()/removeField() already perform (EF-R2 pattern, form-store.ts:740-750 / 776-784) inside reset() — but since reset() reverts ALL fields at once (not a single name), iterate and clear every entry in validationTimers and asyncValidationTimers, then clear touchedFields entirely, before the existing set() call. This reuses the established sibling pattern verbatim (no new mechanism) and needs no per-field enumeration since Map.clear()/Set.clear() cover every pending timer in one call.

**공개표면**: none — internal-only change to the reset() action body in packages/state/src/form-store.ts; no exported type, public method signature, or FormMutator/EntityForm surface changes.

**Do-NOT**: Do NOT add a new public dispose/cleanup API — the fix stays entirely inside the existing reset() action body, matching the EF-R2 comment at form-store.ts:474 ('No new public dispose API is added (out of scope per EF5 briefing)'). · Do NOT iterate Object.entries(s.fields) inside the set() callback to clear timers per-name — Map.clear()/Set.clear() on the whole map/set is correct and simpler since reset() always reverts every field, not a single name; do not invent a narrower per-field loop. · Do NOT move the timer-clearing calls inside the set() updater function — set()'s updater must stay a pure state-computation callback (existing repo convention throughout this file); clear the timers as a plain statement before calling set(), exactly as shown in exactAfter. · Do NOT change resetValue() in packages/schema-core/src/field/value.ts — it already correctly resets asyncState/errors/dirty synchronously (W4-6 FIX #3); this fix only prevents a LATER stale timer from overwriting that already-correct synchronous reset. · Do NOT touch the async-validation.test.ts 'store.reset() brings a checked field back to asyncState "unchecked" (W4-6 FIX #3)' test (lines 131-140) — it is a different, already-passing scenario (post-resolution reset, no pending timer) and must remain byte-identical. · Do NOT add cleanup logic to validateField(), validateAll(), or runAsyncValidation() — the leak is specific to the two debounce-timer Maps + touchedFields Set inside reset(); other actions are out of scope for R11.

**cold-executor**: executable=true · exactBefore matches reality on both anchors verbatim. Source: form-store.ts reset() at lines 861-869 is byte-identical to the spec's exactBefore. Test: async-validation.test.ts lines 225-230 (end of the 'change'-trigger debounce describe bl

### 파일 변경 (1)

#### `packages/state/src/form-store.ts` @ reset() action, ~line 861 (inside createFormStore's createStore((set, get) => ({ ... })) callback, same closure as validationTimers/asyncValidationTimers/touchedFields declared at lines 476-477 and 500)
_note: validationTimers, asyncValidationTimers, touchedFields are Map<string, ReturnType<typeof setTimeout>> / Set<string> declared in the outer createFormStore function body (lines 476-477, 500) — the same closure the actions object (containing reset, addField, removeField) is created in, so they are directly referenceable with no new imports or params._
BEFORE:
```ts
      reset() {
        set((s) => {
          const fields: Record<string, FieldValueSlice> = {};
          for (const [name, slice] of Object.entries(s.fields)) {
            fields[name] = resetValue(slice, s.renderType);
          }
          return { fields };
        });
      },
```
AFTER:
```ts
      reset() {
        // R11 (analysis §4.4): resetValue() below synchronously reverts each
        // slice's asyncState to 'unchecked' and drops its errors, but a
        // pending validate-on-change trailing debounce (validationTimers) or
        // 'change'-trigger AsyncValidation debounce (asyncValidationTimers)
        // is a closure-captured setTimeout that doesn't know the field was
        // just reset — left alone it still fires later and resurrects a
        // 'checking' badge / stale error on the just-reset field. Same
        // clearTimeout+delete cleanup addField/removeField already do for a
        // single replaced/removed name (EF-R2), applied here to every
        // pending timer since reset() touches every field at once.
        for (const timer of validationTimers.values()) clearTimeout(timer);
        validationTimers.clear();
        for (const timer of asyncValidationTimers.values()) clearTimeout(timer);
        asyncValidationTimers.clear();
        touchedFields.clear();

        set((s) => {
          const fields: Record<string, FieldValueSlice> = {};
          for (const [name, slice] of Object.entries(s.fields)) {
            fields[name] = resetValue(slice, s.renderType);
          }
          return { fields };
        });
      },
```

### 테스트 (1)

**`packages/state/src/__tests__/async-validation.test.ts`** — `reset() during a pending change-trigger debounce cancels the timer — no stale check resurrects on the reset field (R11), inserted as the last test inside the existing describe("form-store AsyncValidation (W4-3) — 'change' trigger debounce", ...) block (after the 'an explicit runAsyncValidation() call cancels...' test, i.e. immediately before that describe block's closing `});` currently at line 230)`

EXACT insertion — anchor exactBefore (end of the 'change'-trigger debounce describe block, lines 225-230 verbatim):
```
    // the cancelled debounce timer never fires a second (stale) run.
    await vi.advanceTimersByTimeAsync(1000);
    expect(check).toHaveBeenCalledTimes(1);
    expect(store.getState().fields.alias?.asyncState).toBe('invalid');
  });
});
```
exactAfter (adds the new test before the closing `});`, no other lines touched):
```
    // the cancelled debounce timer never fires a second (stale) run.
    await vi.advanceTimersByTimeAsync(1000);
    expect(check).toHaveBeenCalledTimes(1);
    expect(store.getState().fields.alias?.asyncState).toBe('invalid');
  });

  it('reset() during a pending change-trigger debounce cancels the timer — no stale check resurrects on the reset field (R11)', async () => {
    const check = vi.fn(async () => ValidateResult.fail('중복된 값입니다'));
    const store = createFormStore(ChangeForm(check, 300));

    store.getState().setValue('alias', 'x'); // schedules a 300ms debounced check
    store.getState().reset(); // reset happens WITHIN the debounce window

    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    expect(store.getState().fields.alias?.errors).toBeUndefined();

    // without the R11 fix, this advance fires the stale timer: 'checking'
    // flashes on the reset field, then a wasted network check resolves it
    // to 'invalid' with a stale error — on a field the user never touched
    // again after reset.
    await vi.advanceTimersByTimeAsync(1000);

    expect(check).not.toHaveBeenCalled();
    expect(store.getState().fields.alias?.asyncState).toBe('unchecked');
    expect(store.getState().fields.alias?.errors).toBeUndefined();
  });
});
```
Arrange: ChangeForm(check, 300) — same helper already defined at the top of this file (function ChangeForm(check, debounceMs=300)) building a single StringField('alias') with an AsyncValidation({debounceMs}) 'change'-trigger validation; check mocked to always fail so any stray fire is observable via asyncState 'invalid' + a non-empty errors array. Act: setValue('alias','x') (schedules the 300ms debounce per scheduleAsyncValidation, form-store.ts:530-539) immediately followed by reset() — both synchronous, so reset lands well inside the still-pending window. Assert (pins the pre-fix failing behavior): immediately after reset, asyncState is 'unchecked' and errors is undefined (resetValue's synchronous revert); after advancing fake timers 1000ms (past the 300ms window), check must NOT have been called (proves the timer was cancelled, not merely outraced) and asyncState/errors remain unchanged — before the fix, the uncancelled timer fires runAsyncValidationNow, calling check and flipping asyncState to 'checking' then 'invalid' with a stale error on the reset field.

### 수용 기준
cd /Users/kunner/dev/rcm-listgrid && npx vitest run packages/state/src/__tests__/async-validation.test.ts — all tests in the file pass including the new R11 test (expect passed count increased by exactly 1 vs. baseline, 0 failed). Then npx vitest run packages/state/src/__tests__/validate-on-change.test.ts and packages/state/src/__tests__/dynamic-fields.test.ts to confirm the EF-R2 addField/removeField cleanup tests still pass unchanged (no regression). Finally npm run test (repo root, package.json line 183: "vitest run") for the full suite green.

---

## R12 — delete() in create-mode with no ids: early-guard instead of building [undefined]  ⚪ LOW

**확정 접근**: Add a single early-return guard in del() (packages/state/src/form-controller.ts) that fires only when BOTH deleteOpts?.ids is undefined AND entityForm.getId() is undefined, returning { ok: false, reason: 'capability' } — the exact outcome the analysis (documents/analysis/2026-07-13/midpoint-code-review.md §4.4) names. This reuses the DeleteOutcome union's existing 'capability' reason (schema-core/src/form-runtime.ts:81, DeleteOutcome = SaveOutcome) and mirrors the silent-block contract of the capability gate 4 lines above it (form-controller.ts:277-278) — no new reason value, no schema change, no adapter call, no message. This is preferred over inventing a new reason (e.g. 'no-id') because DeleteOutcome is a shared type also used by save's SaveOutcome, and CAP-06's capability gate is the only existing sibling pattern for 'silently refuse to call the adapter' — matching it keeps the outcome space closed and needs no consumer-side handling for a brand-new discriminant.

**공개표면**: none — no public API/type signature change; DeleteOutcome union unchanged (reuses existing 'capability' reason). Internal behavior change only: del() now short-circuits before calling adapter.remove when create-mode + no ids given.

**Do-NOT**: Do NOT invent a new DeleteOutcome reason (e.g. 'no-id', 'noop') — DeleteOutcome = SaveOutcome (schema-core/src/form-runtime.ts:87) is a shared closed union; reuse the existing 'capability' reason exactly as the analysis names. · Do NOT move the guard before the CAP-06 capability gate (form-controller.ts:276-278) — capability denial must still win first when both conditions could apply. · Do NOT change the guard condition to check only `deleteOpts?.ids === undefined` (without also checking `entityForm.getId() === undefined`) — that would wrongly block a legitimate update-mode delete() called with no opts, which must still fall through to `ids = [entityForm.getId()!]`. · Do NOT add a message/banner (store.getState().addMessage(...)) on this path — the capability-gate sibling pattern it mirrors is silent (no adapter call, no message); do not diverge from that contract. · Do NOT touch the onBeforeDelete handler loop, adapter.remove call, or onAfterDelete loop below — this fix is strictly the early-return guard inserted before the existing `const ids = ...` line. · Do NOT alter the existing 3 tests already in the 'createFormController.delete (spec §6.2)' describe block (success / cancel / adapter error) — only add the new test as specified, in the exact position given (first test in the block).

**cold-executor**: executable=true · Both exactBefore anchors matched the real files verbatim. form-controller.ts:280 = `    const ids = deleteOpts?.ids ?? [entityForm.getId()!];` (4-space indent, unique — sole match in file). form-controller.test.ts:303-304 two-line block mat

### 파일 변경 (2)

#### `packages/state/src/form-controller.ts` @ del() function, line 280 (const ids = deleteOpts?.ids ?? [entityForm.getId()!];), immediately after the CAP-06 capability gate (lines 276-278) and before the onBeforeDelete handler loop
_note: Guard order: after the CAP-06 capability gate (must still deny on capability first) and before the onBeforeDelete handler loop (handlers receive ctx.ids and must never see [undefined]). ids stays typed string[] afterward — entityForm.getId()! remains valid since the guard already proved getId() !== undefined on the fallback path._
BEFORE:
```ts
    const ids = deleteOpts?.ids ?? [entityForm.getId()!];
```
AFTER:
```ts
    if (deleteOpts?.ids === undefined && entityForm.getId() === undefined) {
      // create-mode delete with no ids and no bound id — building [undefined]
      // would call adapter.remove with a bogus id array (R12,
      // documents/analysis/2026-07-13/midpoint-code-review.md §4.4). Same
      // silent-block contract as the capability gate above: no adapter call,
      // no message.
      return { ok: false, reason: 'capability' };
    }
    const ids = deleteOpts?.ids ?? [entityForm.getId()!];
```

#### `packages/state/src/__tests__/form-controller.test.ts` @ describe('createFormController.delete (spec §6.2)', () => { block, line 303, as the FIRST test before the existing 'success: calls adapter.remove...' test
_note: WidgetForm() (test file line 24-28) builds an EntityForm with NO .withId(...) call, so entityForm.getId() is undefined — this is the exact create-mode-with-no-id state R12 targets. fakeAdapter/WidgetForm helpers already exist at the top of this file (lines 24-40); no new helper needed._
BEFORE:
```ts
describe('createFormController.delete (spec §6.2)', () => {
  it('success: calls adapter.remove with [id] and returns { ok: true, result: undefined }', async () => {
```
AFTER:
```ts
describe('createFormController.delete (spec §6.2)', () => {
  it('create-mode, no opts.ids, no bound id: returns { ok: false, reason: \'capability\' } without calling adapter.remove (R12 — no [undefined] built)', async () => {
    const entityForm = WidgetForm();
    const store = createFormStore(entityForm);
    const remove = vi.fn();
    const controller = createFormController({
      entityForm,
      store,
      adapter: fakeAdapter({ remove }),
    });

    const outcome = await controller.delete();

    expect(outcome).toEqual({ ok: false, reason: 'capability' });
    expect(remove).not.toHaveBeenCalled();
  });

  it('success: calls adapter.remove with [id] and returns { ok: true, result: undefined }', async () => {
```

### 테스트 (1)

**`packages/state/src/__tests__/form-controller.test.ts`** — `createFormController.delete (spec §6.2) > create-mode, no opts.ids, no bound id: returns { ok: false, reason: 'capability' } without calling adapter.remove (R12 — no [undefined] built)`

Arrange: entityForm = WidgetForm() (no .withId — create mode, entityForm.getId() === undefined); store = createFormStore(entityForm); remove = vi.fn(); controller = createFormController({ entityForm, store, adapter: fakeAdapter({ remove }) }). Act: const outcome = await controller.delete() (no deleteOpts — deleteOpts?.ids is undefined). Assert: expect(outcome).toEqual({ ok: false, reason: 'capability' }); expect(remove).not.toHaveBeenCalled(). Before the fix this test fails because del() builds ids = [undefined] and calls adapter.remove('/widget', [undefined], undefined), so remove IS called and the outcome is { ok: true, result: undefined } instead.

### 수용 기준
From repo root: `npx vitest run packages/state/src/__tests__/form-controller.test.ts`. Expected: all tests in the file pass (existing suite count + 1 new test = green), including the new 'create-mode, no opts.ids, no bound id' test under the 'createFormController.delete (spec §6.2)' describe block. Also run `npx tsc --noEmit -p packages/state` (or the repo's standard typecheck entry for packages/state) to confirm exactOptionalPropertyTypes compiles clean — the guard uses only `===` comparisons against `undefined`, no assignment of `T | undefined` into an optional field, so no cast/spread is needed.
