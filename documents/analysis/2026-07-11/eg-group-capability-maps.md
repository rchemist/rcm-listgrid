> **generated-by**: journal extraction (model: sonnet, date: 2026-07-11)
> **source**: `/Users/kunner/.claude/projects/-Users-kunner-dev-rcm-listgrid/b4f739f9-add3-4ddc-9db3-5293b1c59bcc/subagents/workflows/wf_8d0b6d02-1cc/journal.jsonl` (workflow `wf_8d0b6d02-1cc`, 18 journal entries; 8 `result` entries carrying a `group` key are the map:* porting-spec payloads assembled below)
> **method**: python3 JSONL parse -> per-entry temp files under the session scratchpad -> assembled into this single document (no `jq`/`head`/`cat` piping of the raw journal into any agent context, per repo discipline)
> **caveat**: this content is a prior PLANNING workflow's output, preserved here for reference. It is analysis/recon, not an implementation record — no code was changed to produce it. All `file:line` citations (old engine `src/listgrid/...` and new engine `packages/...`) must be re-verified against the actual tree at implementation time; the codebase may have moved since 2026-07-11.

---

# EG Group Capability Maps — EntityForm 전 API parity porting specs (8 groups)

Table of contents:

1. [CRUD LIFECYCLE & ACTIONS](#group-1)
2. [DATA TRANSFER / EXCEL (charter C6)](#group-2)
3. [LIST-TRACK EntityForm methods (getListFields/getFilterableFields/useListFields/withExcludeListFields/getListableFieldOrder/getViewOrder/withListConfig/withFilterable/withAppendAdvancedSearchFields/onFetchListData/withOnPostFetchListData/clearOnPostFetchListData)](#group-3)
4. [VALIDATION & ERROR SURFACE](#group-4)
5. [C6 — MULTI-STEP WIZARD + REVISION (createStep 위저드 + revisionEntityName 감사추적)](#group-5)
6. [FORM/FIELD SUGAR + ESCAPE HATCHES (EntityForm-level one-liners + alert/attribute/title sub-features)](#group-6)
7. [CLIENT EXTENSION SYSTEM](#group-7)
8. [PERMISSION & VISIBILITY](#group-8)

---

<a id="group-1"></a>

## Group 1: CRUD LIFECYCLE & ACTIONS

### Members

- delete()/deleteAll(idList)
- revisionEntityName (withRevisionEntityName/getRevisionEntityName)
- postDelete hook field
- manageEntityForm flags: withManageEntityForm/withCreatable/withUpdatable/withDeletable + isCreatable/isUpdatable/isDeletable
- ManageEntityForm presets: MANAGE_ENTITY_ALL/CREATE/UPDATE/NOT_DELETE
- withButtons/buttons (custom action slot)
- withHeaderArea/headerArea (custom header slot)
- Save/Delete button gating (ViewEntityFormButtons.getEntityFormButtons)
- neverDelete-aware Delete button variant (disabled '사용 안 함')

### Old Source (oldSource — citations into the 0.3.x/old engine)

- src/listgrid/config/EntityForm.tsx:433-445 — delete(): guards renderType==='create' (blocks delete of an unsaved create-mode form, Korean error '생성된 데이터만 삭제 가능합니다.'), else delegates to deleteAll([this.id])
- src/listgrid/config/EntityForm.tsx:447-493 — deleteAll(idList): guards isEmpty(idList); builds bulk DELETE {url} with formData {ids, revisionEntityName?} via getExternalApiDataWithError; on response.data success sets result.refreshOrList=true + clearAlertMessages(true); on failure sets result.errors; ALWAYS calls this.postDelete?.(this, idList) afterward regardless of success/failure
- src/listgrid/config/form/EntityFormBase.tsx:43 — revisionEntityName field declaration (comment: page sets it when constructing EntityForm)
- src/listgrid/config/form/EntityFormBase.tsx:130-132 — postDelete field: '(entityForm, idList?) => Promise<void>' — idList defined means bulk/list delete, undefined means single-entity delete from a detail form; distinct from ViewEntityForm's own postDelete used for screen control (React hooks live outside EntityForm)
- src/listgrid/config/form/EntityFormBase.tsx:738-746 — withRevisionEntityName(name) setter; getRevisionEntityName() fallback chain: this.revisionEntityName || this.menuUrl || this.name (comment: keeps save/query consistent)
- src/listgrid/config/EntityForm.tsx:878-879 — save() path also injects getRevisionEntityName() into submit data
- src/listgrid/config/form/EntityFormValidation.tsx:121-151 — withManageEntityForm(obj) setter; withCreatable/withUpdatable/withDeletable(bool=true) mutate this.manageEntityForm.{create,update,delete}; isCreatable/isUpdatable/isDeletable getters read the same struct
- src/listgrid/config/Config.ts:561-589 — ManageEntityForm interface {create,update,delete: boolean}; presets MANAGE_ENTITY_ALL(all true, frozen)/MANAGE_ENTITY_CREATE(create only)/MANAGE_ENTITY_UPDATE(update only)/MANAGE_ENTITY_NOT_DELETE(create+update, no delete)
- src/listgrid/config/form/EntityFormBase.tsx:37-39 — constructor defaults manageEntityForm to a deep-copied clone of MANAGE_ENTITY_ALL (every EntityForm is fully CRUD-capable unless narrowed)
- src/listgrid/config/form/EntityFormBase.tsx:174,748-751 — buttons?: ((entityForm)=>Promise<EntityFormButtonType[]>)[]; withButtons(fn) appends to the array (multiple registrations compose, not overwrite)
- src/listgrid/config/EntityFormButton.tsx:1-80 — EntityFormButtonType = EntityFormButton | EntityFormReactNodeButton; EntityFormButton has id (save/delete ids REPLACE the corresponding built-in button — isOverwrite()), icon, label, onClick(props)=>Promise<EntityForm> (return value propagates errors via setEntityForm), disabled/hidden/tooltip all async fns taking EntityFormButtonProps (entityForm, router, pathname, setErrors, setNotifications, setEntityForm, step info for wizards, modal helpers)
- src/listgrid/config/form/EntityFormBase.tsx:183-187,783-786 — headerArea?: (entityForm)=>Promise<ReactNode>; withHeaderArea(fn) setter (single, not array — last write wins, unlike buttons); doc comment: renders between header buttons and Alert area, sticky-positioned on scroll
- src/listgrid/components/form/hooks/useEntityFormLogic.ts:441-455 — headerArea rendered async into local headerAreaContent state whenever entityForm.headerArea is set; try/catch logs 'Error rendering headerArea' on throw
- src/listgrid/components/form/ViewEntityForm.tsx:104,158-160 — headerAreaContent rendered in a `.rcm-form-header-area` div between the button row and the alert area
- src/listgrid/components/form/ui/ViewEntityFormButtons.tsx:61-323 (getEntityFormButtons) — full gating engine: (a) collects entityForm.buttons[] outputs + props.buttons, dedupes by id, save/delete/list ids from entityForm.buttons OVERRIDE built-ins (isOverwrite check at :140-145); (b) excludeButtons pushed 'save' when !isCreatable || !isUpdatable || useCreateStep(wizard mode always suppresses default Save — steps have their own nav); (c) excludeButtons pushed 'delete' when !isDeletable; (d) hasEditableFields() (:170-184) scans entityForm.fields for any field that is NOT hidden AND NOT readonly (per current renderType) — Save is suppressed entirely if every field is readonly/hidden (canShowSaveButton); (e) Save rendered iff !readonly && canShowSaveButton && !excluded && no custom 'save' override; (f) List button OR ClosePopupButton (popup mode) always rendered unless excluded/overridden; (g) Delete rendered iff !readonly && !excluded && no custom 'delete' override && entityForm.getRenderType()==='update' (delete NEVER shows in create mode, independent of isDeletable) 
- src/listgrid/components/form/ui/buttons/DeleteButton.tsx:1-155 — neverDelete branch (:20-44): if entityForm.neverDelete && !active field value, render a disabled button labeled '사용 안 함' with a red tooltip explaining reactivation path (no click handler, delete is truly blocked, distinct from EntityFormActions neverDelete's field-swap-based UX which only fires on withNeverDelete() builder, not this runtime disabled-button path); else renders an enabled button (label '사용 중지' if neverDelete else '삭제') that on click shows a confirm modal (showConfirm), and on confirm: openBaseLoading(true) → entityForm.delete() → on refreshOrList: showSuccess + 1500ms delayed onThen (postDelete hook, popup-mode postMessage 'ENTITY_DELETED'+window.close, else router.push to redirectUrl ?? pathname-sans-trailing-slash, SKIPPED entirely if props.subCollection true — sub-collection delete propagates removal upward instead of navigating) → on error: parses JSON EntityError shape for server field/message, falls back to raw errors array, openBaseLoading(false)

### New Insertion (newInsertion — target location/plan in the new engine)

- packages/schema-core/src/backend/adapter.ts:25-40 — BackendAdapter interface DOES declare remove(url, ids: string[]): Promise<void> (bulk DELETE {url} body {ids}, doc comment cites 0.3.x parity: 'no per-row delete')
- packages/backend-rcm/src/adapter.ts:105,177+ — concrete rcm adapter DOES implement remove() faithfully (bulk DELETE, body {ids})
- grep across packages/state/src and packages/react/src for '.remove(' / 'onDelete' / 'deleteAll' / entityForm '.delete(' returns ZERO call sites — the adapter method is fully declared+implemented but never invoked anywhere in the new engine or its React layer. Confirmed dead wiring, not dead code (matches audit doc's 'declared, never called' framing)
- packages/schema-core/src/entity-form.ts — grep for revisionEntityName/postDelete/postSave/buttons/headerArea/attributes returns ZERO matches. None of these fields exist on the new EntityForm class at all — not stubbed, not partially typed, wholesale absent
- packages/schema-core/src/entity-form.ts — grep for manageEntityForm/Creatable/Updatable/Deletable/neverDelete: only neverDelete survived (private field :97, withNeverDelete()/isNeverDelete() :139-142,277-278, cloned :332) as a real boolean with clone-preservation but ZERO consuming side effect (no field-swap, no onInitialize hook — audit doc GAP#3, honest-documented not faked). isCreatable/isUpdatable/isDeletable and the whole ManageEntityForm struct/presets: ZERO presence, not even a stub
- packages/react/src/components/ViewEntityForm.tsx:17-21 — ViewEntityFormProps = {entityForm, store, onSave?}. No onDelete prop exists in the type at all
- packages/react/src/components/ViewEntityForm.tsx:218-220 — the ENTIRE button surface is one hardcoded `<Button type="button" onClick={handleSave} disabled={saving}>Save</Button>`. No Delete button, no custom buttons slot, no headerArea slot, no readonly gating, no hasEditableFields check, no renderType-based show/hide — Save always renders regardless of manageEntityForm-equivalent state or field editability
- packages/react/src/components/ViewListGrid.tsx:60 — only a comment referencing the 0.3.x subCollection add/delete/custom-button assembly concept; zero delete/bulk-delete implementation in the new list component
- apps/sample/app/college/[id]/page.tsx:39-42 (charter C7 precedent, host-owned transport) — the ESTABLISHED pattern for the port: ViewEntityForm's onSave prop is a host callback that owns the HTTP call (`await rcmAdapter.update(url, id, data); router.push(...)`) — save affordance lives in the engine, the actual network call is the host's. An onDelete prop should mirror this exactly: engine renders/gates the Delete button and calls back `onDelete?.(id)` (or similar), host page supplies the handler that calls `rcmAdapter.remove(url, [id])` and does the post-delete navigation — this is the natural target shape, not yet wired anywhere

### Dependencies

- EF1 (reactive META override) — field isHidden/isReadonly resolution that hasEditableFields()/Save-gating depends on already landed (state package)
- GAP-fix #2 in the audit doc (isPermitted end-to-end wiring, EF8/task#26 in-flight) — old ViewEntityFormButtons doesn't itself consult isPermitted directly for buttons, but tab/field permission visibility is an adjacent CRUD-adjacent gap the audit groups nearby; not a hard blocker for this group but worth sequencing awareness
- EntityForm.getRenderType() — already ported (packages/schema-core/src/entity-form.ts:274-281, create vs update via id presence) and is the gate Delete-button-visibility and manageEntityForm both need; no work required, just reuse
- BackendAdapter.remove — already declared+implemented (schema-core interface + backend-rcm), only the calling wiring is missing; no adapter-side work needed, purely engine+react+host wiring
- charter C7 (transport host-owned) — constrains the design: the engine must NOT call adapter.remove itself; it exposes the affordance + callback, host owns the HTTP call, exactly like onSave today

### Reuse Targets (reuseTargets)

- packages/react/src/components/ViewEntityForm.tsx — add onDelete prop + Delete <Button>, gated by renderType==='update' and a manageEntityForm-equivalent isDeletable, following the SAME pattern as the existing onSave/handleSave/Save button (reuse the Button from useUI(), the saving-state pattern for a new deleting-state)
- packages/schema-core/src/entity-form.ts — extend with manageEntityForm-equivalent fields/builders (withCreatable/withUpdatable/withDeletable/isCreatable/isUpdatable/isDeletable) alongside the existing neverDelete field (:97,139-142,277-278,332) as the nearest precedent for how a boolean CRUD-lifecycle flag is declared+cloned in the new class
- packages/state/src/form-store.ts — 'saving' boolean state precedent (used by ViewEntityForm's handleSave/disabled) is the direct template for a 'deleting' state to gate the Delete button during the async call, mirroring existing setSaving pattern
- apps/sample/app/college/[id]/page.tsx handleSave — direct template for the host-owned onDelete handler (rcmAdapter.remove + router.push), same file/pattern to extend when a delete E2E slice lands
- documents/analysis/2026-07-11/entityform-api-audit.md GAP-port items #1 (delete flow) and #2 (manageEntityForm CRUD flags) — this group IS those two items; audit already flags them as 'GAP-port — 사용자 결정 대기' (scope-expanding, needs explicit go-ahead, not silently portable under EF7/EF8's 'wire what's already exposed' mandate)

### Proof Needs (proofNeeds)

- Delete E2E on an existing consumer (College or Major) similar to EC1-3's characterization-oracle pattern: create → save → delete → confirm 404/removed from list, verifying adapter.remove is actually invoked with correct bulk body {ids} (and revisionEntityName if the entity declares one)
- manageEntityForm flag test matrix: isCreatable=false hides Save on a create-mode form; isUpdatable=false hides Save on an update-mode form; isDeletable=false hides Delete; default (unset) behaves as MANAGE_ENTITY_ALL (all visible) — must verify the NEW engine's default matches old's constructor-default-to-ALL, not an opt-in-empty default
- hasEditableFields() parity check: a form where every field is readonly/hidden must suppress Save even when isCreatable/isUpdatable are both true — this is a SEPARATE gate from the CRUD flags and easy to drop during port
- neverDelete + active-field interaction: reproduce the DeleteButton.tsx disabled-'사용 안 함' branch (entity has neverDelete AND active===false) vs the normal delete-confirm branch (neverDelete true but active===true still allows the 'deactivate' labeled delete flow) — two distinct UI states easy to collapse into one during port
- postDelete hook firing with correct idList semantics: single-entity delete() should still pass idList=[id] through to postDelete per current deleteAll() call, confirm new engine doesn't need a getRenderType()==='create' guard equivalent to old delete()'s early-return (blocks deleting an unsaved create-mode form)
- custom buttons override semantics: a custom button with id='delete' or id='save' from withButtons() must REPLACE the built-in, not duplicate — verify isOverwrite-equivalent dedup logic if/when withButtons is ported (not this task's proof, but the seam the port must preserve)

### Risks

- Scope classification: audit doc explicitly marks delete-flow and manageEntityForm-flags as 'GAP-port — 사용자 결정 대기' (user-decision-pending), NOT part of the EF7/EF8 'wire what's exposed' mandate — this planning task's MANDATE says 'full parity, no defer', which conflicts with the audit's own routing recommendation; the orchestrator/user must explicitly confirm this group is now greenlit for port, not just planned
- charter C7 boundary is easy to violate during implementation: the temptation will be to have the engine call adapter.remove() directly (mirroring how deleteAll() in the OLD engine directly calls getExternalApiDataWithError) — but the new engine's save path deliberately keeps HTTP out (page.tsx owns rcmAdapter.update), so delete must follow suit: engine exposes affordance+callback only, never the transport call itself
- old deleteAll() semantics conflate two callers: EntityForm.delete() (single, from a detail-form Delete button) and a hypothetical list-level bulk-delete (ViewListGrid row selection → deleteAll(idList) with idList.length>1) — the new engine's ViewListGrid has ZERO delete wiring at all (not even a comment beyond subCollection buttons), so this group's 'delete/deleteAll' member, if ported narrowly to just ViewEntityForm's single-record case, leaves the list-level bulk-delete surface completely unaddressed; worth flagging as a distinct sub-slice (list bulk-delete) rather than assuming ViewEntityForm's onDelete covers it
- neverDelete has TWO distinct old behaviors that must not be merged: (1) EntityFormActions.withNeverDelete() builder-time field-swap+onInitialize hide hook (audit's GAP#3, 'honest — not faked' — new engine's isNeverDelete() has zero side effect currently) vs (2) DeleteButton.tsx's RUNTIME check of entityForm.neverDelete + active-field value to decide disabled-vs-enabled button rendering — porting only #2 without #1 leaves a form that shows the right button text but never actually protects the 'active' field from being hidden/removed per the builder contract
- manageEntityForm's constructor DEFAULT is MANAGE_ENTITY_ALL (deep-cloned, all true) — a naive port that adds the getters/setters but forgets the constructor default will silently make every ported EntityForm un-creatable/un-updatable/un-deletable until explicitly opted in, the inverse of old behavior; this is the same class of regression EF7 already found once (pipe-order clobber) so extra vigilance warranted
- buttons/headerArea are LOWER priority per audit (#5, #6 in GAP-port list, 'sugar'/'저효율, 우회 존재' adjacent) but this group's charter bundles them with CRUD flags — if scoped together, effort should still weight delete-flow + manageEntityForm flags first since those block real Save/Delete UX, while custom buttons/headerArea are additive escape hatches with lower current consumer pressure (no ContentAsset/Rule-style dead-code argument found for them — they're simply unported, not proven unused)

### Review Grouping (reviewGrouping)

split-file


---

<a id="group-2"></a>

## Group 2: DATA TRANSFER / EXCEL (charter C6)

### Members

- withDataTransferConfig(props: DataTransferConfigProps): this
- getExportableFields(): Promise<DataField[] | undefined>
- getImportableFields(): Promise<DataField[] | undefined>
- getDataTransferConfig(): Promise<DataTransferConfig | undefined>
- private getDataFields(fieldNames, dataTransferRules?): DataField[]  (load-bearing helper for withDataTransferConfig)
- private getDataFieldsFromFields(): Promise<DataField[]>  (load-bearing helper for all 3 getters — snapshots current field declarations as DataField[])

### Old Source (oldSource — citations into the 0.3.x/old engine)

- src/listgrid/config/form/EntityFormActions.tsx:373-398 — withDataTransferConfig: builds a DataTransferConfig(props, this.getUrl()), defaults export.url to entity url, defaults exportFileName to title/name, and if props.fieldNames given resolves them via getDataFields() and calls config.setDataFields(); stores on this.dataTransferConfig
- src/listgrid/config/form/EntityFormActions.tsx:400-427 — private getDataFields(fieldNames, dataTransferRules?): resolves each fieldName via this.getField(), builds DataField.create({name,label,type,dataTransferRule}), and if field is OptionalField (select/multiselect/checkbox/tag) attaches field.options
- src/listgrid/config/form/EntityFormActions.tsx:429-442 — getExportableFields: returns dataTransferConfig.export.fields if non-empty, else falls back to getDataFieldsFromFields() (auto-derive from all declared fields) — but only when isSupportExport() is true, else undefined
- src/listgrid/config/form/EntityFormActions.tsx:444-457 — getImportableFields: same shape as getExportableFields but gated on isSupportImport() (note: old source has a copy-paste bug at :448 — checks `export?.fields` emptiness instead of `import?.fields` when deciding whether to fall back; faithful port must preserve or flag this)
- src/listgrid/config/form/EntityFormActions.tsx:459-488 — private getDataFieldsFromFields: guards `this instanceof EntityForm`, snapshots this.fields sorted by order, for each field awaits field.isRequired({entityForm:this}) and builds a DataField (name/label/type/options-if-OptionalField/required)
- src/listgrid/config/form/EntityFormActions.tsx:490-500 — getDataTransferConfig: if dataTransferConfig is set, computes defaultFields=getDataFieldsFromFields() and calls dataTransferConfig.validateDataFields(defaultFields) (lazily fills export/import.fields when empty) before returning the config
- src/listgrid/config/form/EntityFormBase.tsx:162 — field declaration: `dataTransferConfig?: DataTransferConfig | undefined` on the base mixin
- src/listgrid/config/EntityForm.tsx:113-114 — clone() propagation: `if (this.dataTransferConfig !== undefined) entityForm.withDataTransferConfig(this.dataTransferConfig)`
- src/listgrid/config/EntityFormTypes.ts:85 — `DataTransferConfigProps extends IDataTransferConfig` (adds fieldNames?: string[] on top of IDataTransferConfig)
- src/listgrid/transfer/Type.ts:100-445 — the whole config-shape/value-transform engine actually consumed: IDataTransferConfig/DataManageType (exportable/importable flags incl. DataTransferAll/NotSupport/ExportOnly/ImportOnly presets), TransferConfig/ExportTransferConfig/ImportTransferConfig (url, description, addedFields, overrideFormData, maxCount/countPerPage, sampleData, overrideParseResult, renderAsyncResult, mode.create/update), DataTransferConfig class (isSupportExport/Import, withExportableFields/withImportableFields/withExport-ImportUrl/withExportFileName/withImportSampleData/withAdded*Fields/withOverride*FormData/withExportDescription/withImportDescription/withImportOverrideParseResult/setDataFields+updateFields+applyIdPolicy(auto id-column)/validateDataFields), DataField class (getValueOnExport/getValueOnImport per-type transforms: select/multiselect option label<->value, date/datetime range formatting, boolean 예/아니오, html/markdown plain-text), getExportFileName() (adds yyyyMMddHHmmss timestamp + extension)
- src/listgrid/components/list/ui/DataTransferModal.tsx:1-60 — consumer: renders host-injected Exporter/Importer (via transfer/registry.ts getDataTransfer()) fed by dataTransferConfig.export/import + getExportFileName()
- src/listgrid/components/list/hooks/useListGridLogic.ts:539 — ACTUAL call site: `setDataTransferConfig(await entityForm.getDataTransferConfig())` — this is the only internally-used member of the 4; getExportableFields/getImportableFields have zero internal call sites (grep across src/listgrid) but are public API on an exported library class, same shape/pattern as getDataTransferConfig, so not provably dead — likely meant for host apps (GJCU/edustack) or a not-yet-built field-picker UI
- src/listgrid/transfer/registry.ts — DI seam: configureDataTransfer/getDataTransfer, documents why Exporter/Importer are injected rather than statically imported (keeps xlsx-js-style/file-saver out of the main bundle, host opts in via `@rchemist/listgrid/excel`)
- src/listgrid/transfer/Provider/ExcelProvider.ts:1-251 — actual Excel generation is 100% client-side: XLSX.utils.aoa_to_sheet + XLSX.utils.book_new via `xlsx-js-style`, download via `file-saver`; server is only hit for excelDownloadHistory logging (POST) and optional password encryption via lazily-registered officecrypto-tool
- src/listgrid/transfer/DataImporter.tsx:1-504 — import is client-parse-then-POST: parses uploaded file client-side with xlsx-js-style, matches header cells to DataField.getName()/getLabel() via createFieldMap, converts cell values via field.getValueOnImport() (async, per-row), drops all-blank rows, then submits the built DataRowSet to the server (import.url = url + getEndpoint('excelUpload'), or import.mode.create/update gating) via DataImportProcessor
- src/excel.ts:1-29 — opt-in subpath barrel `@rchemist/listgrid/excel`, `registerExcelDataTransfer()` one-liner wires DataExporter/DataImporter into the registry

### New Insertion (newInsertion — target location/plan in the new engine)

- packages/schema-core/src/entity-form.ts — add a DataTransferConfig-equivalent value object (or reuse a ported transfer/Type.ts, see below) as a private field alongside `neverDelete`/`title`, plus 4 new builder/query methods mirroring the class's existing withX/getX pairing style (withTitle/getTitle etc. at :134-138,270-280) and clone() propagation (:326-345, same pattern as onFetchData/onInitialize/submitTransform copy-through)
- New file packages/schema-core/src/data-transfer.ts (or field/data-transfer.ts) — port DataManageType/DataTransferAll/.../DataTransferConfig/DataField/DataTransferRule/TransferConfig/ExportTransferConfig/ImportTransferConfig/getExportFileName from src/listgrid/transfer/Type.ts:95-500,688-718 verbatim, adjusted to schema-core's FieldType (packages/schema-core/src/field/types.ts, ~40 variants vs old Config.ts's ~28 — DataField.getValueOnExport/Import's type-switch must be re-audited against the larger set, esp. the new xref*/addressField/contentAsset/subCollection/revision/mappedJoin types the old switch never saw)
- getDataFields/getDataFieldsFromFields private helpers port into entity-form.ts using this.getField(name)/this.getFields() (already exist, :296-300,286-288) and field.getName()/field.label/field.type (EntityField already exposes these, field/entity-field.ts) + field instanceof OptionsField check (packages/schema-core/src/field/options-field.ts) instead of old `instanceof OptionalField`, + field.isRequired({...}) — new engine's signature is isRequired(ctx: FieldEvalContext) (field/entity-field.ts:112, field/eval-context.ts) — need an EntityForm-shaped ctx builder equivalent to old `{entityForm: this}`
- packages/react/src/components/ViewListGrid.tsx — no dedicated data-transfer slot exists yet; the generic `toolbar?: (ctx: {checkedIds}) => ReactNode` render-prop (:72,262) is the natural seam — a host would render Export/Import buttons + modals through `toolbar`, fed by `entityForm.getDataTransferConfig()`, i.e. schema-core supplies the config, packages/react supplies nothing built-in (parity with old engine's opt-in DI: transfer/registry.ts's configureDataTransfer + `@rchemist/listgrid/excel` subpath) — a genuinely faithful *functional* port (not just the 4 config methods) additionally needs a new optional package/subpath (e.g. packages/react-excel or packages/state consumer hook) hosting DataExporter/DataImporter/ExcelProvider/DataImportProcessor equivalents (xlsx-js-style + file-saver), which is OUT of this group's 4 named members but is required dependency scope for 'export/import actually works' per the completion convention
- packages/state/src/list-store.ts — no dataTransferConfig slot currently (grep 0); the old engine's useListGridLogic.ts:138,539,776 pattern (state + async fetch of getDataTransferConfig() on mount, threaded down as a prop) would need an equivalent slice added here if/when the runtime UI half is built

### Dependencies

- src/listgrid/transfer/Type.ts (DataTransferConfig/DataField/DataTransferRule/TransferConfig/ExportTransferConfig/ImportTransferConfig/DataManageType/DataTransferAll etc.) — must be ported first, config methods are thin wrappers around it
- src/listgrid/config/EntityFormTypes.ts:85 DataTransferConfigProps (= IDataTransferConfig + fieldNames?)
- OptionsField (packages/schema-core/src/field/options-field.ts) — parity target for old `OptionalField` (options carrier), needed for the options-attach branch in getDataFields/getDataFieldsFromFields
- EntityField.isRequired(ctx: FieldEvalContext) (packages/schema-core/src/field/entity-field.ts:112, form-field.ts:102) — async, needs a ctx object; old passed `{entityForm: this}`
- FieldType (packages/schema-core/src/field/types.ts) — DataField's export/import value-transform switch keys off this; new engine has ~15 more variants than old Config.ts's FieldType so the switch needs re-auditing, not a blind copy
- xlsx-js-style (^1.2.0) + file-saver (^2.0.5) — optional peer deps, root package.json:251,264 (old engine) — 100% client-side Excel generation via XLSX.utils.aoa_to_sheet/book_new + FileSaver; NOT present in any packages/*/package.json yet (grep 0) — only needed if the runtime Exporter/Importer half is also ported, not for the 4 config methods themselves
- officecrypto-tool (optional, lazy-registered via registerExcelCrypto) — password-protected export only, Node-only crypto, old engine feature (ExcelProvider.ts:36-64)
- RuntimeConfig.getEndpoint('excelUpload'/'excelDownloadHistory') (src/listgrid/config/RuntimeConfig.ts) — server endpoint name overrides; new engine's equivalent config/adapter layer (packages/backend-rest, packages/backend-rcm) has no analog yet, grep turned up nothing
- transfer/registry.ts DI pattern (configureDataTransfer/getDataTransfer) — the reason Exporter/Importer are host-injected rather than statically imported: keeps xlsx-js-style/file-saver out of the default bundle graph; a new-engine equivalent subpath would need the same seam

### Reuse Targets (reuseTargets)

- EntityForm.getField/getFields (already exist, entity-form.ts:286-288,296-300) — reuse directly, no need to re-implement field lookup
- EntityForm's existing withX/getX + clone()-propagation pattern (title/neverDelete/submitTransform) — reuse verbatim as the template for withDataTransferConfig/getDataTransferConfig's clone semantics
- OptionsField (field/options-field.ts) — reuse as the `instanceof OptionalField` replacement
- FieldEvalContext (field/eval-context.ts) — reuse as the isRequired() ctx shape instead of inventing a new one
- ViewListGrid's `toolbar` render-prop (react/src/components/ViewListGrid.tsx:72) — reuse as the UI insertion seam rather than growing ViewListGrid's own prop surface, mirrors old engine's DataTransferModals composition point

### Proof Needs (proofNeeds)

- Faithful reproduction of the export/import field-resolution fallback logic: explicit props.fieldNames -> getDataFields(); empty/unset export.fields -> getDataFieldsFromFields() auto-derive from all declared fields (in field order) -> non-empty export.fields -> use as-is verbatim, gated by isSupportExport()/isSupportImport()
- The old-source copy-paste bug at EntityFormActions.tsx:448 (getImportableFields checks `this.dataTransferConfig.export?.fields` emptiness, not `import?.fields`, before deciding whether to auto-derive) — decide explicitly whether to port verbatim (bug-compatible) or fix, and document the decision either way; this is exactly the kind of thing that must be exercised (call both getters on a form where export.fields is set but import.fields is empty and observe which branch actually returns) not just read
- applyIdPolicy's automatic `id` DataField injection/stripping (Type.ts:380-390) tied to import.mode.update (isImportUpdateEnabled) — must be preserved: export always gets an id column prepended if missing; import only gets it when update mode is enabled, else id is stripped even if present
- validateDataFields' lazy-fill-only-when-empty semantics (Type.ts:424-444) — getDataTransferConfig() must call this every time (not just once) since it re-derives defaultFields from current field declarations, so a dynamically-added field (EF4) picked up correctly
- DataField.getValueOnExport/getValueOnImport's full per-type switch (select/multiselect option label<->value round-trip incl. the `|||` multi-value delimiter, date/datetime range array formatting via fDate/fDateTime, boolean 예/아니오, html/markdown plain-text strip) — re-verify against schema-core's actual FieldType superset, field by field, not assumed to still be exhaustive
- getExportFileName()'s timestamp-suffix + extension-preservation logic (Type.ts:688-718) if the file-generation half is ever ported
- Confirm whether getExportableFields/getImportableFields truly have zero external callers by also grepping any downstream consumer repos (GJCU/edustack, per project-repo-facts memory) if accessible — internal-repo grep alone (0 hits) is necessary but not sufficient to call them dead; absent that check, treat them as live public API per mandate (getDataTransferConfig's sibling pattern + no deprecation marker) and port

### Risks

- Scope mismatch: the 4 named members are cheap, self-contained config-declaration methods (~130 lines total incl. private helpers), but 'what export/import actually did' is a ~3,377-line separate subsystem (src/listgrid/transfer/* + list/ui/DataTransferModal.tsx + excel.ts barrel) with its own DI registry, xlsx-js-style/file-saver dependency, and server-endpoint contract — porting only the 4 methods gives schema-core a config object nobody in the new engine consumes yet; per the repo's own completion convention ('빌드 통과 ≠ 작동') a claim of 'data transfer works' would need that whole runtime half too, which is genuinely out of this group's charter and was previously logged as 'defer-documented / E-track 슬라이스 밖' in documents/analysis/2026-07-11/entityform-api-audit.md:39 — the parent orchestrator's blanket 'FULL parity, no scope-defer' mandate for this run appears to supersede that prior defer decision, so this should be flagged back rather than silently re-deferred
- xlsx-js-style/file-saver are NOT installed in any packages/*/package.json (grep 0) — if the runtime half is ported, this is a net-new dependency addition to the new engine's monorepo, not a reuse
- New engine's FieldType has grown substantially (xref*, addressField, contentAsset, subCollection, revision, mappedJoin, colorPreset, profile, messageView, link...) beyond what DataField.getValueOnExport/Import's switch (Type.ts:531-620) ever handled — those branches fall through to `return value` (identity), which is probably wrong/lossy for several of the newer types (e.g. contentAsset/subCollection have no meaningful flat Excel cell representation) and needs an explicit per-type decision, not a blind copy
- getImportableFields' copy-paste bug (see proofNeeds) could get silently ported as a 'faithful' bug or silently 'fixed' as scope creep — needs an explicit call in the port, not an accidental one
- isRequired() is async and old code awaits it per-field inside a loop (not Promise.all) in getDataFieldsFromFields — for forms with many fields this is a serial-await performance characteristic in the old source; faithful port should preserve behavior (not silently parallelize) unless proven safe, since field.isRequired may have ordering/context side effects in some field implementations
- The `this instanceof EntityForm` runtime guard in old getDataFieldsFromFields (:460-464) assumes EntityFormActions is only ever mixed into the concrete EntityForm class — new engine's entity-form.ts is a single concrete class (no mixin chain), so this guard is structurally moot/dead in the new engine and should be dropped, not ported as dead weight


---

<a id="group-3"></a>

## Group 3: LIST-TRACK EntityForm methods (getListFields/getFilterableFields/useListFields/withExcludeListFields/getListableFieldOrder/getViewOrder/withListConfig/withFilterable/withAppendAdvancedSearchFields/onFetchListData/withOnPostFetchListData/clearOnPostFetchListData)

### Members

- getListableFieldOrder(field): number
- useListFields(...fieldNames): this
- withListConfig(fieldName, config: IListConfig): this
- getListFields(): ListableFormField[]
- getFilterableFields(): ListableFormField[]
- getViewOrder(tabId, fieldGroupId, fieldOrder): number
- withFilterable(fieldName, filterable=true): this
- withExcludeListFields(...excludeListFields): this
- withAppendAdvancedSearchFields(...fields): this (EntityForm.tsx, not Actions mixin)
- onFetchListData?: PostFetchListData[] (EntityFormBase field)
- withOnPostFetchListData(...postFetchListData): this (EntityFormBase)
- clearOnPostFetchListData(): this (EntityFormData, not Actions — grouping note below)

### Old Source (oldSource — citations into the 0.3.x/old engine)

- src/listgrid/config/form/EntityFormActions.tsx:39-56 getListableFieldOrder — listConfig.order ?? (field.order + tab.order*1e6 + fieldGroup.order*1e4)
- src/listgrid/config/form/EntityFormActions.tsx:99-106 withExcludeListFields — dedupe-append into excludeListFields[]
- src/listgrid/config/form/EntityFormActions.tsx:130-136 withListConfig(fieldName, config) — delegates to field.withListConfig if field instanceof ListableFormField
- src/listgrid/config/form/EntityFormActions.tsx:202-215 useListFields(...names) — calls field.useListField() per name (sets listConfig.support=true)
- src/listgrid/config/form/EntityFormActions.tsx:220-255 getListFields() — filters fields by isSupportList()+!excludeListFields, falls back to first listable field, throws if truly none, sorts by getListableFieldOrder
- src/listgrid/config/form/EntityFormActions.tsx:257-357 getFilterableFields() — filters by isFilterable(), auto-injects synthetic `<field>.name` StringField filter for ManyToOne targets whose target EntityForm has a filterable `name` field (and `<field>.user.name` for includeUser UserFields), dedupes, sorts
- src/listgrid/config/form/EntityFormActions.tsx:359-371 getViewOrder(tabId, groupId, fieldOrder) — tab.order*10000 + group.order*1000 + fieldOrder
- src/listgrid/config/form/EntityFormActions.tsx:502-508 withFilterable(fieldName, filterable) — field.withFilterable(filterable)
- src/listgrid/config/EntityForm.tsx:154-157 withAppendAdvancedSearchFields(...fields) — sets this.appendAdvancedSearchFields (lives on EntityForm.tsx itself, NOT EntityFormActions — member list attributes it to Actions but source is the top-level class)
- src/listgrid/config/form/EntityFormBase.tsx:120 onFetchListData?: PostFetchListData[] field decl; :768-771 withOnPostFetchListData appends
- src/listgrid/config/form/EntityFormData.tsx:97-100 clearOnPostFetchListData — resets onFetchListData=[] (lives in EntityFormData mixin, NOT EntityFormActions — same misattribution as withAppendAdvancedSearchFields)
- src/listgrid/config/EntityForm.tsx:97 clone() propagates onFetchListData
- src/listgrid/components/list/types/ViewListGrid.types.ts:167 PostFetchListData = (pageResult: PageResult) => Promise<PageResult>
- src/listgrid/components/list/hooks/useListGridLogic.ts:275-280 — onFetchListData hooks executed sequentially post-fetch, post-client-extension, pre-options.onFetched, only when result.list non-empty; comment marks it '기존 onFetchListData Hook 지원 (하위 호환성)' i.e. legacy back-compat path
- src/listgrid/config/ListGrid.ts:38-43 ListGrid.getListFields() memoizes entityForm.getListFields()
- src/listgrid/config/ListGrid.ts:208-238 ListGrid.getAdvancedSearchFields() = entityForm.getFilterableFields() + dedup-merge entityForm.appendAdvancedSearchFields, re-sorted by field.order
- src/listgrid/config/ListGrid.ts:45-151 getQuickSearchProperty() consumes getListFields()+per-field listConfig.quickSearch to build quick-search field (incl. OR-field union across multiple quickSearch:true fields, and StringField-only auto-fallback)
- src/listgrid/components/list/hooks/useListGridLogic.ts:47-74 listFields = listGrid.getListFields(); objectFieldMap built from dot-notation list field names (drives item[fieldName] flattening at :288-302); props.options.fields appended if not duplicate
- src/listgrid/components/fields/abstract/ListableFormField.tsx:55-92 IListConfig shape (support/quickSearch/filterable/sortable/order/label/align/viewRaw/op/multiFilter) and :118-436 ListableFormField class (isSupportList/isFilterable/isSortable/getListConfig/useListField/withListConfig/withFilterable/withSortable + per-field viewListItem/viewListFilter render dispatch) — the field-level substrate every EntityForm-level LIST-TRACK method reads/writes; this class has ZERO analog in the new engine

### New Insertion (newInsertion — target location/plan in the new engine)

- packages/schema-core/src/entity-form.ts — currently has NO list-related surface at all: no excludeListFields, no appendAdvancedSearchFields, no onFetchListData array, no getListFields/getFilterableFields/getListableFieldOrder/getViewOrder/withListConfig/withFilterable/withExcludeListFields/useListFields/withAppendAdvancedSearchFields/withOnPostFetchListData/clearOnPostFetchListData methods. All 12 members are 100% additions, not edits.
- packages/schema-core/src/field/entity-field.ts + field-meta.ts — EntityField interface has no listConfig/isSupportList/isFilterable/isSortable/getListConfig concept whatsoever (confirmed via grep — zero hits). This is upstream of the EntityForm-level methods: getListFields/getFilterableFields/withListConfig/withFilterable/useListFields cannot be ported until a ListableFormField-equivalent meta surface exists on EntityField (either as new optional fields on the EntityField interface, or a parallel FieldMetaOverride-style side-map keyed by field name, per ADR-0003 pure-meta posture).
- packages/state/src/list-store.ts:24-40,62-69 createListStore already has a `postFetch: (rows) => rows` option applied on every fetch() — this is a PARTIAL, narrower analog of onFetchListData: sync not async, operates on `rows` (page.content) only (no totalElements/searchForm visibility, unlike PostFetchListData's full PageResult), single function not an array, and supplied by the store creator (host), not read off EntityForm. Porting withOnPostFetchListData/clearOnPostFetchListData/onFetchListData faithfully means either (a) EntityForm grows an onFetchListData handler-array (schema-core, pure) that initializeFormStore-adjacent list-store wiring reads and folds into postFetch, or (b) documenting postFetch as the deliberately-narrowed new-engine replacement and NOT porting the old hook chain 1:1 — this is a design decision, not a mechanical port.
- packages/react/src/components/ViewListGrid.tsx:75-134 deriveDefaultColumnNames/resolveColumns — the CURRENT column-derivation mechanism (`showInList: boolean` + first-4-non-hidden-fields fallback) is a deliberate placeholder that getListFields()/getListableFieldOrder() supersede. Wiring getListFields() in means replacing this whole derivation path, not appending to it.
- packages/react/src/components/ViewListGrid.tsx — has no advanced-search UI, no filter fields, no quickSearch OR-field union, no manyToOne synthetic filter-field injection at all today. getFilterableFields()/withAppendAdvancedSearchFields()/getViewOrder() have no UI consumer to land in yet — this is new UI surface, not a slot to fill.
- No packages/state equivalent of ListGrid.ts exists (getQuickSearchProperty/getAdvancedSearchFields/fetchData-with-extension-points glue). If getListFields/getFilterableFields are ported onto schema-core EntityForm, something in @listgrid/state (or a new thin ListGrid-successor) needs to bridge them into createListStore's SearchForm/adapter.list() call the way old ListGrid.fetchData()+getAdvancedSearchFields() did.

### Dependencies

- A ListableFormField-equivalent per-field list metadata surface in schema-core (IListConfig: support/quickSearch/filterable/sortable/order/label/align/viewRaw/op/multiFilter) MUST land before getListFields/getFilterableFields/withListConfig/withFilterable/useListFields/getListableFieldOrder can be ported at all — none of the ~40+ existing schema-core field types carry this today.
- A list-item cell renderer registry (analog of packages/react/src/registry/field-renderer-registry.ts used by FieldRenderer.tsx) is needed for per-type list-cell formatting (ListableFormField.renderListItemOriginal/viewListItem) — today ViewListGrid.tsx:132 does bare `String(row[name])` for every type.
- A list-filter renderer registry (analog, for viewListFilter/renderListFilterOriginal) is needed before getFilterableFields()-driven UI (advanced search form) can render anything — no such registry or advanced-search component exists in packages/react today.
- EntityForm.getTab/getFieldGroup (used by getListableFieldOrder/getViewOrder for the tab.order*1e6+group.order*1e4 composite ordering) — new EntityForm.getTabs()/getFieldGroups() exist but return arrays, not O(1) single-tab/group lookups by id; a thin id-lookup helper is needed or the composite-order formula must be rewritten against array scans.
- AbstractManyToOneField.getEntityForm() (used by getFilterableFields's manyToOne '<field>.name' synthetic-filter injection) — need to confirm packages/schema-core's ManyToOneField equivalent exposes the target EntityForm the same way (not verified in this pass; scout should check many-to-one-field.ts before porting getFilterableFields verbatim).
- createListStore's postFetch design decision (see newInsertion) must be resolved — whether onFetchListData becomes a real EntityForm-level array feeding postFetch, or postFetch is documented as its permanent narrower replacement — before withOnPostFetchListData/clearOnPostFetchListData/onFetchListData are ported, since porting them faithfully changes postFetch's contract (async, full PageResult, array-of-hooks).

### Reuse Targets (reuseTargets)

- packages/state/src/list-store.ts createListStore (rows/totalElements/totalPages/searchForm/fetch/setPage/setPageSize/setSort/quickSearch) — reuse as the fetch/pagination substrate; getListFields()-derived columns and getFilterableFields()-derived filter UI both sit ON TOP of this, no changes needed to its fetch mechanics.
- packages/state/src/list-store.ts:28-40 postFetch option — reuse/extend as the landing spot for onFetchListData once the design question above is resolved, rather than inventing a second post-fetch hook mechanism.
- packages/react/src/registry/field-renderer-registry.ts pattern (type -> Renderer component, consumed via getFieldRenderer(field.type) in FieldRenderer.tsx) — reuse this exact registration pattern for the new list-cell and list-filter registries rather than inventing a different dispatch mechanism.
- packages/react/src/components/ViewListGrid.tsx's existing columns prop (ViewListGridColumn union: bare name | {name,label,render}) — the synthetic-column escape hatch already covers the EA-D2-0 precedent (XrefPreferMappingView-style composite columns); getListFields()-driven default derivation should PRODUCE this same ResolvedColumn shape, not a parallel one.
- packages/schema-core/src/field/field-meta.ts FieldMetaOverride pattern (EF1: imperative per-field meta override held in the form store, wins over declared/predicate value) — worth considering as the shape for list-config-as-override too, for consistency with the field-meta precedent already established in this codebase, though listConfig is declare-time (like EntityItem base fields) not runtime-override in the 0.3.x source.

### Proof Needs (proofNeeds)

- Characterization tests against the OLD engine for: getListFields() ordering (tab.order*1e6 + group.order*1e4 + field.order composite, with per-field listConfig.order override winning), the 'throw if zero listable fields, else fallback to first listable field' edge case, and the excludeListFields interaction.
- getFilterableFields()'s ManyToOne synthetic-filter-field injection (both the generic <field>.name path and the includeUser <field>.user.name path) — this is the single most complex/surprising piece of behavior in the group and needs an explicit before/after fixture (a form with a ManyToOne field whose target has a filterable 'name' field) to prove parity, not just a unit test of the sort comparator.
- getViewOrder() vs getListableFieldOrder() — confirm these are genuinely two different formulas for two different purposes (view-tab ordering vs list-column ordering) and not accidental duplication before porting both; EntityForm.tsx:506 is the sole call site for getViewOrder, worth checking it isn't dead/superseded by something else in the new engine's tab/group render path first.
- End-to-end proof that a ported getListFields()/getFilterableFields() actually drives packages/react/src/components/ViewListGrid.tsx column/filter rendering for at least one real form (e.g. reuse the EC1/EC2/EC3 vertical-slice forms already ported), not just unit-level EntityForm method output — the task's own MANDATE requires 'feeds the list screen' proof, and today there is no consumer wired at all.
- onFetchListData/withOnPostFetchListData/clearOnPostFetchListData: confirm real call sites (search turned up consumer files under src/listgrid/components/fields and config/SubCollectionField.tsx — re-grep specifically for onFetchListData/withOnPostFetchListData usage, not just the whole LIST-TRACK member set, since this pass only confirmed the mechanism, not enumerating its callers) before deciding whether it's genuinely load-bearing enough to port as a real array vs. documented as superseded by list-store postFetch.

### Risks

- SPLITS INTO TWO VERY DIFFERENT SIZES — flag honestly per the task's own framing: (a) the 12 EntityForm-level methods, once their field-level substrate exists, are individually small (~150-200 LOC total of pure sort/filter/lookup logic, faithfully portable in isolation) — but (b) they are USELESS without wiring into ViewListGrid, and that wiring requires building infrastructure that plainly does not exist yet: a per-field IListConfig meta surface on every schema-core field type (~40+ field types), a list-cell renderer registry, a list-filter renderer registry, and an advanced-search UI component. The old engine's list ecosystem (src/listgrid/components/list/*.tsx + ui/ + hooks/, excluding config/) is ~10,300 LOC; the current new-engine ViewListGrid.tsx is 273 LOC and its own header comment states it is 'Deliberately minimal... not this V0.4 slice.' This group is NOT a same-order-of-magnitude port like the EA-* field waves — it is closer in shape to a new phase (EG/EH-scale) than a slice-able task.
- Two of the 12 members are misattributed to EntityFormActions.tsx in the group framing: withAppendAdvancedSearchFields actually lives in EntityForm.tsx (not the Actions mixin) and clearOnPostFetchListData actually lives in EntityFormData.tsx (not Actions). Purely a citation/location correction, not a behavior risk, but worth fixing before any port ticket cites 'EntityFormActions.tsx' as the sole source file.
- onFetchListData's old comment literally calls it '기존 ... Hook 지원 (하위 호환성)' (existing hook support, for backward compatibility) inside useListGridLogic.ts — i.e. even in the OLD engine this was already flagged as a legacy path being kept for back-compat rather than the primary mechanism (options.onFetched and client extensions run before/after it in the same pipeline). Porting it faithfully risks re-introducing a mechanism the old codebase itself was already de-emphasizing; recommend explicit user/conductor decision on whether to port verbatim or fold into list-store's postFetch as the sole new-engine mechanism (see dependencies) — do NOT silently drop it (mandate is full parity or proven-dead), but do surface the 'already legacy in the source' fact so the decision is informed.
- No dead-code candidates found in this group — unlike the ContentAsset/Rule precedent cited in the task's MANDATE, grep confirms all 12 members (or their underlying onFetchListData mechanism) have live, non-test call sites in the old source (11 consumer files for the ListableFormField-level methods; useListGridLogic.ts:275-280 for onFetchListData). Nothing here can be exempted as genuinely dead — full port (once the substrate exists) is the only honest outcome.
- getFilterableFields()'s dependency on AbstractManyToOneField.getEntityForm() and includeUser-typed fields was NOT verified against the new engine's ManyToOneField/XrefMapping field implementations in this read-only pass (time-boxed to the EntityForm-method group as briefed) — a follow-up scout should confirm the new ManyToOneField equivalent actually exposes a target EntityForm reference before assuming this sub-behavior ports mechanically.

### Review Grouping (reviewGrouping)

Recommend NOT reviewing this as one PR/ticket. Split into: (EG1) field-level IListConfig substrate on schema-core EntityField + the 12 EntityForm-level methods as pure logic (small, reviewable like EA-* waves, blocked on nothing but design sign-off on the postFetch/onFetchListData question) — vs. (EG2+) the ViewListGrid column-derivation replacement + list-cell renderer registry + (EG3+) the advanced-search UI + list-filter renderer registry, each sized like its own EF/EC-track phase. Conductor should size EG2/EG3 explicitly before committing to a timeline; they are not 'the rest of this same task', they are new phases.

### LOC (scale estimate)

10278

### Port Notes (portNotes)

See newInsertion/dependencies/reuseTargets — no code changes made (read-only planning task, no edits performed).


---

<a id="group-4"></a>

## Group 4: VALIDATION & ERROR SURFACE

### Members

- withErrors(errors: FieldError[]): this — sets EntityForm.errors
- getErrorMap(): Map<tabLabel, FieldError[]> — groups this.errors by the owning tab, dedupes same-field messages via Set-union, stamps error.tabId
- mergeError(name, errors): void — in-place replace-or-append for one field's errors inside this.errors, delegates to mergeFieldErrors() for the union case
- formErrors state slice (declared, currently inert — 0 writers)
- getFieldValidationState/setFieldValidationState/clearFieldValidationState — tri-state {validated:boolean, message?, color?} Map keyed by fieldName, separate channel from FieldError
- withCheckDuplicate(fieldName, checkDuplicate fn): this — EntityForm-level builder that casts the named field to CheckButtonValidationField and installs the async dedupe-check callback
- CheckButtonValidationField base (withCheckButtonValidation/withCheckButtonLabel builders + renderCheckButtonValidationField UI flow + isRequired override) — extended by StringField, EmailField AND LinkField in the old engine, not just Link
- internalSave() server-error ingestion block — parses BackendAdapter-style {message | fieldError(Map|object)} into FieldError[], calls withErrors(), and applies the 'fieldErrors present ⇒ suppress generic message' UX rule
- AliasField/ExternalIdField/SlugField factories (Preset.tsx) — the actual production callers of withCheckButtonValidation, exported as public library API

### Old Source (oldSource — citations into the 0.3.x/old engine)

- src/listgrid/config/form/EntityFormValidation.tsx:12-27 (getFieldValidationState/setFieldValidationState/clearFieldValidationState)
- src/listgrid/config/form/EntityFormValidation.tsx:37-90 (withErrors/getErrorMap)
- src/listgrid/config/form/EntityFormValidation.tsx:92-119 (mergeError)
- src/listgrid/config/EntityFormMethod.ts:28-51 (mergeFieldErrors — Set-union of messages per field name)
- src/listgrid/config/EntityFormTypes.ts:51,55-60 (FieldError shape, SubmitFormData.errors)
- src/listgrid/config/EntityForm.tsx:72 (fieldValidationStates cloned on EVERY clone(); errors:65 only cloned when includeValue=true — asymmetric clone semantics)
- src/listgrid/config/EntityForm.tsx:639-829 (internalSave — :648 errors reset at save start, :657-667 client-validation→withErrors, :725-829 server error parse→withErrors, :813-822 suppress-generic-message-when-fieldErrors rule, :700 clearAlertMessages on success)
- src/listgrid/config/EntityForm.tsx:1053-1064 (withCheckDuplicate)
- src/listgrid/components/fields/abstract/CheckButtonValidationField.tsx:1-140 (full base — builders, render flow, onValid/onClear/onCheck wiring setFieldValidationState)
- src/listgrid/components/fields/StringField.tsx:20 and EmailField.tsx:16 (extend CheckButtonValidationField — NOT dead, live base for two commonly-used field types)
- src/listgrid/components/fields/LinkField.tsx:18 (also extends CheckButtonValidationField but LinkField itself never configures checkButtonValidation anywhere in-repo — this one usage is plausibly dead)
- src/listgrid/components/fields/Preset.tsx:49-68 (AliasField),75-90 (ExternalIdField),160-180 (SlugField) — real withCheckButtonValidation(checkDuplicateValueProcess(...)) callers
- src/listgrid/config/Config.ts:604-619 (CheckButtonValidationFieldProps, checkDuplicateValueProcess)
- src/listgrid/index.ts:298,305 (CheckButtonValidationField and Preset.tsx factories are public exported API, not internal-only)
- src/listgrid/components/form/FieldRenderer.tsx:166-184,209-219,267-289 (per-field error read/write: merges validate() errors + entityForm.errors by field name into one Set)
- src/listgrid/components/form/ViewEntityForm.tsx:258 (entityErrorMap={entityForm.getErrorMap()} feeds the banner)
- src/listgrid/components/form/ui/ViewEntityFormErrors.tsx:1-50 (errors vs entityErrorMap precedence: banner suppresses flat notification list when map non-empty)
- src/listgrid/components/form/ui/ViewEntityError.tsx:1-171 (collapsible per-tab error banner: click tab-header→onTabChange, click field-row→onTabChange+scrollIntoView by data-field-name — keys by tab LABEL in errorMap but looks up by both label and error.tabId, a latent inconsistency)
- src/listgrid/components/form/ui/ViewEntityFormButtons.tsx:266-275 (Save-button fallback: if getErrorMap().size===0, flatten form.errors into a plain notification instead)

### New Insertion (newInsertion — target location/plan in the new engine)

- packages/state/src/form-store.ts:82,405 — formErrors:string[] is declared+initialized but has 0 writers anywhere in packages/ (grep-confirmed); needs a setFormErrors/mapServerErrors(err: BackendError|FieldError[]) action
- packages/schema-core/src/field/types.ts:87 FieldError{message,code} and packages/schema-core/src/backend/adapter.ts:16-23 BackendError{code,message,fieldErrors:Record<string,string[]>} already exist and are EXPLICITLY documented as 'charter C5 server errors → field channel' / 'ADR-0005 mapping' — but nothing consumes them; this is the intended landing shape, not a shape to invent
- packages/backend-rcm/src/adapter.ts:31-91 already parses server responses into BackendAdapterError(code,message,fieldErrors) end-to-end — this side is DONE; the gap is purely on the consumption side
- packages/react/src/components/ViewEntityForm.tsx:166-178 handleSave() calls `await onSave?.(...)` with no try/catch — a thrown BackendAdapterError from the host's onSave (e.g. apps/sample/app/college/[id]/page.tsx:39-40 `await rcmAdapter.update(...)`, also uncaught) is currently swallowed by nothing — it becomes an unhandled promise rejection; needs a catch that calls the new setFormErrors/mapServerErrors action, distributing fieldErrors into per-field `fields[name].errors` and leftover .message into formErrors
- packages/react/src/components/ViewEntityForm.tsx:210-216 formErrors render is a flat <ul> with no tab-grouping/click-to-navigate — no equivalent of getErrorMap()/ViewEntityError.tsx exists; the tab bar's own deriveTabs/tab-id lookup (already in this file for the tab buttons) is the natural reuse point for tab-grouping instead of a new lookup
- packages/react/src/components/FieldRenderer.tsx:92-118 already renders `slice.errors` per field (from validateField/validateAll) — server fieldErrors should append into this SAME array, not a parallel channel, to match old FieldRenderer.tsx's single merged Set of messages
- packages/state/src/form-store.ts — no fieldValidationStates-equivalent slice exists at all; CheckButtonValidation's tri-state {validated,message,color} would need a new slice (e.g. checkStates: Record<name,{validated,message?,color?}>) plus get/set/clear actions, since FieldValueSlice.errors (message+code only) cannot represent a 'validated:true/success' state
- packages/schema-core/src/field/basic-fields.ts:11-29 StringField/EmailField are plain FormField<string> with zero check-duplicate capability — no withCheckButtonValidation/checkButtonLabel builders anywhere in schema-core
- packages/react/src/registry/link-renderer.tsx + packages/schema-core/src/field/link-field.ts already contain a 'Conductor decision ⑧: CheckButtonValidation DESCOPED' comment/rationale — this rationale is Link-specific and does not cover StringField/EmailField, see risks

### Dependencies

- Task #21 EF7 (in_progress) — onInitialize/hydrate pipe reorder shares the same lifecycle point where old internalSave() resets errors=[] at save start (EntityForm.tsx:648) and clears alerts on success (:700); this group's save-time error clear/reset should be sequenced with whatever EF7 lands for the save pipeline, not designed independently
- Task #26 EF8 (pending, 'formErrors + isPermitted + neverDelete') — EF8's formErrors item IS members #1-4 of this group; this plan's findings (mergeError union semantics, tab-grouping, suppress-generic-message-when-fieldErrors rule, clear-on-success) must be handed to whoever executes EF8, or EF8 will land a shallow wiring that misses documented old behavior
- e-track-field-parity.md backlog item 7 ('withCheckDuplicate/CheckButtonValidationField — 미이식(Link/중복확인 필드 EA wave 시)') already exists but frames this as Link-scoped and low-priority; this plan's research contradicts that framing (see risks) and should trigger a conductor re-decision before EA-wave-style execution
- Any StringField/EmailField consumer work (EA-A/EA-B tasks #6/#7, already completed) would need retrofitting if CheckButtonValidation is promoted from descoped to GAP-port — those fields are already shipped in the new engine without this capability

### Reuse Targets (reuseTargets)

- FieldError{message,code} (schema-core/field/types.ts:87) — reuse as-is for both client-validation and server-validation field errors; do not invent a second shape
- BackendError.fieldErrors:Record<string,string[]> (schema-core/backend/adapter.ts) — already the designed C5 ingestion contract and already produced by backend-rcm's BackendAdapterError; reuse this exact contract as the setFormErrors/mapServerErrors input, no new server-error DTO needed
- fields[name].errors + validateField/validateAll (state/form-store.ts:512-534) — reuse the same array/slice for server errors instead of a parallel per-field channel, matching old FieldRenderer's single merged-Set behavior (src/listgrid/components/form/FieldRenderer.tsx:207-219)
- ViewEntityForm.tsx's existing deriveTabs/tab lookup (used for the tab bar buttons) — reuse for tab-grouping the error banner instead of re-deriving tab membership from scratch
- useUI() UI-provider abstraction (Button/TextInput pattern already used throughout react/src/components) — reuse for any check-duplicate button primitive so it stays host-swappable like the rest of the engine
- packages/backend-rcm/src/adapter.ts parseBackendError/extractFieldErrors (already implemented, mirrors old EntityForm.tsx:767-796 field-error object/Map parsing) — do not re-implement server-payload parsing on the state/react side, only consume its output

### Proof Needs (proofNeeds)

Oracles to demonstrate before calling this ported (mirrors the EC1-EC3 field-reproduction bar, not just a build-passes check): (1) trigger a save whose onSave throws a BackendAdapterError with fieldErrors:{name:[...]}, then assert the named field's slice.errors shows the message AND formErrors carries only the leftover non-field message (the old 'fieldErrors present ⇒ suppress generic message' rule at EntityForm.tsx:813-822 must survive bit-for-bit, not just 'some error shows somewhere'). (2) Fail-save twice with overlapping field names across the two responses and assert message union/dedup (old mergeFieldErrors Set-union), not duplication or last-write-wins. (3) A subsequent SUCCESSFUL save must clear both the prior field errors and formErrors — assert no stale banner survives a second attempt (old: this.errors=[] at every internalSave start + clearAlertMessages on success). (4) For CheckButtonValidationField specifically: before any port work, get an explicit conductor/user decision on whether it stays descoped (accepting the existing link-field.ts/link-renderer.tsx 'Conductor decision ⑧' as final despite it being Link-specific) or is promoted to GAP-port for StringField/EmailField; if promoted, reproduce the AliasField/SlugField flow end-to-end (type value → click check → async checkDuplicate call → tri-state validated:true/false → visual color) against a fixture as the acceptance oracle, matching the EC-track precedent for 'proven working, not just compiling'.

### Risks

(1) SCOPE-FRAMING ERROR IN EXISTING DOCS: the audit doc and e-track-field-parity.md backlog both frame CheckButtonValidation as 'does Link need it?' / 'Link/중복확인 필드' — but grep evidence shows LinkField never actually used checkButtonValidation (plausibly dead for Link specifically), while StringField/EmailField DO, via AliasField/ExternalIdField/SlugField factories that are exported public library API (src/listgrid/index.ts:305). This does NOT meet the repo's own dead-code bar (the EA-C ContentAsset precedent required: zero real usage in both consumers AND a non-functional stub in the old engine — CheckButtonValidationField is fully functional in the old engine). The link-field.ts/link-renderer.tsx 'Conductor decision ⑧: DESCOPED' comments already checked into the new engine are therefore justified only for Link, not for the base capability as a whole — this needs an explicit re-decision, not a silent reversal by an executor. (2) SCHEMA-CORE PURITY: EF2 already established a FormMutator-seam pattern specifically to keep schema-core React/host-free (commit 6c88413); bolting an async checkButtonValidation(entityForm,value)=>Promise<ValidateResult> callback + tri-state result directly onto FormField risks repeating a purity violation unless it goes through a similar seam — this is a small design decision, not a copy-paste port, likely EF2-adjacent effort. (3) LATENT BUG IN OLD ENGINE, DO NOT COPY: getErrorMap() keys its Map by tab LABEL (EntityFormValidation.tsx:57 `const key = tab.label`) while ViewEntityError.tsx's handleFieldClick looks fields up by tab ID (error.tabId) and handleErrorClick looks the header up by LABEL — two tabs sharing a label would collide/misroute. New engine should key by tab id uniformly; flag this as a deliberate deviation, not a faithful-port miss. (4) DOUBLE-TRACKING: members #1-4 (formErrors/withErrors/getErrorMap/mergeError) are already inside task #26 EF8's stated scope ('formErrors 배선') — if this analysis isn't handed to EF8's executor, EF8 risks landing a shallow `formErrors.push(message)` that misses the union/suppress/clear-on-success semantics documented here, which would look 'done' (renders something) without matching old behavior (the exact 'declared-but-INERT' trap this audit was launched to catch). (5) fieldValidationStates has no analog in FieldValueSlice — needs new store surface (checkStates slice), not a field extension, sizing decision needed before implementation.

### Review Grouping (reviewGrouping)

Hand cluster (A) formErrors/withErrors/getErrorMap/mergeError/server-error-ingestion to task #26 EF8 as its concretized 'formErrors' sub-item (proofNeeds items 1-3 become EF8's acceptance oracle). Route cluster (B) CheckButtonValidationField/withCheckDuplicate/fieldValidationStates to the conductor as a NEW decision request (not folded into EF8, not silently executed as EA-wave backlog) because it contradicts an existing checked-in descope decision and needs an explicit user/conductor call before scheduling — present it as: 'descope confirmed (accept existing Link-only framing, StringField/EmailField dedupe-check stays unported)' vs 'promote to GAP-port (StringField/EmailField retrofit + new store slice + schema-core purity seam)'.

### LOC (scale estimate)

730

### Port Notes (portNotes)

Read-only planning only — no edits made. Two sub-clusters with very different maturity: (A) formErrors/withErrors/getErrorMap/mergeError/server-error-ingestion — the TARGET shape already exists in new engine (FieldError, BackendError.fieldErrors) and is explicitly documented in code comments as designed for exactly this (charter C5, ADR-0005) but is 100% unwired on the consumption side (backend-rcm production side is done); this is squarely EF8's 'formErrors' item and should be executed with the semantics captured under proofNeeds. (B) getFieldValidationState/setFieldValidationState/clearFieldValidationState + withCheckDuplicate + CheckButtonValidationField — no target shape exists at all in new engine, and the one existing decision on record (link-field.ts Conductor decision ⑧) demonstrably under-scopes the question by examining only LinkField instead of StringField/EmailField, its actual old-engine users. Recommend surfacing finding (1) in risks to the conductor as a standalone decision point before any GAP-port work is scheduled for this sub-cluster — it changes whether EA-A/EA-B's already-completed StringField/EmailField ports need retrofitting.


---

<a id="group-5"></a>

## Group 5: C6 — MULTI-STEP WIZARD + REVISION (createStep 위저드 + revisionEntityName 감사추적)

### Members

- EntityFormActions.withCreateStep(createStep?)
- EntityFormActions.getCreateStep()
- EntityFormActions.setCreateStep(createStep?)
- CreateStep interface (Config.ts:552-559)
- createStepFields plumbing through getViewableTabs/getViewableFieldGroups/isViewableFieldGroup/getVisibleFields
- EntityFormBase.withRevisionEntityName(name)
- EntityFormBase.getRevisionEntityName()
- EntityFormBase.setRevisionEntityNameIfBlank(path)
- EntityFormBase.getTabFields(tabId) — hard dependency of real-world withCreateStep usage, not itself in the audit's member list

### Old Source (oldSource — citations into the 0.3.x/old engine)

- Config.ts:552-559 — CreateStep{id,label,order,hidden?,description?,fields:string[]}
- EntityFormActions.tsx:545-558 getCreateStep() — filters out steps with hidden===true, returns undefined if this.createStep unset
- EntityFormActions.tsx:559-564 setCreateStep() — sorts array ascending by `order`, stores raw (unfiltered) array on this.createStep
- EntityFormActions.tsx:566-569 withCreateStep() — chain wrapper over setCreateStep
- EntityForm.tsx:50 clone/cloneWithEntityForm — `entityForm.createStep = this.getCreateStep()` — NOTE: clone re-assigns the ALREADY hidden-filtered result, so a hidden step is permanently dropped across every clone (quirk, not obviously intentional — flag for parity decision)
- EntityFormBase.tsx:349-387 getViewableTabs(includeHide, createStepFields, session) — per tab: permission check, then getViewableFieldGroups({tabId,session,createStepFields}); tab included only if resultant fieldGroups.length>0; sorted by tab.order
- EntityFormBase.tsx:428-458 getViewableFieldGroups() — loops tab.fieldGroups, keeps group id if isViewableFieldGroup() true
- EntityFormBase.tsx:460-535 isViewableFieldGroup() — for each field in group: skip if createStepFields non-empty AND field.name not included; then permission + isHidden; group viewable iff at least one field (or, in update renderType, one SubCollection) passes
- EntityFormBase.tsx:537-586 getVisibleFields(tabId, groupId, session, createStepFields) — same field-name-allowlist predicate applied a second time at the actual field-list-for-render layer: `!hidden && (isEmpty(createStepFields) || createStepFields.includes(name))`
- EntityFormBase.tsx:711-736 getTabFields(tabId) — flattens all fieldGroups under a tab into one ordered EntityField[] (clone(true), reordered `groupOrder*1000+fieldOrder`) — this is what real consumer code (gjcu-academic-front) calls to build each CreateStep.fields array from tab ids
- useEntityFormInitializer.ts:99-106 — initial load: createStepFields seeded from FIRST step only (`getCreateStep()[0].fields`), fed into getViewableTabs(false, createStepFields) — the returned `tabs` state is ALREADY FILTERED to only tabs with step-1 content; initial tabIndex = first non-hidden tab of that filtered list
- useEntityFormLogic.ts:292-299 useCreateStep = renderType==='create' && getCreateStep() defined && length>0 — **CREATE-ONLY gate, never active in update/edit mode**
- useEntityFormLogic.ts:301 maxStep = (getCreateStep()?.length ?? 1) - 1
- useEntityFormLogic.ts:303-309 createStepFields = getCreateStep()[currentStep].fields (current step's allowlist, recomputed on step change)
- useEntityFormLogic.ts:311-340 and 461-495 changeCurrentStep(stepNumber) — on step change: fetches the FULL tab list via getViewableTabs(false) (no createStepFields arg — unlike initial load!), finds first tab whose getViewableFieldGroups({tabId,createStepFields:step.fields}) is non-empty, sets tabIndex/selectedTabIndex to it, but stores the FULL (unfiltered) tab array into `tabs` state — reconciled at render time by CSS display:none, not array filtering (see ViewTab.tsx)
- ViewTab.tsx:46-60,85-110 — per-tab useEffect recomputes getViewableFieldGroups({tabId,createStepFields}); if groups.length===0 the tab button is `display:none` (NOT removed from the DOM/array) — comment explicitly: keeps headlessui Tab.Group's selectedIndex from breaking
- ViewEntityForm.tsx:172-185 useCreateStep && <CreateStepView .../> — the Stepper UI is rendered ABOVE the normal tab/panel area, in addition to (not instead of) it
- ViewEntityForm.tsx:288-293,316-320 — when useCreateStep is true the actual tab-button row (Tab.List) gets an `rcm-hide` class (switcher hidden — user can only navigate via CreateStepView's Next/Prev, not by clicking tabs) while Tab.Panels for ALL tabs still render (each ViewTabPanel receives createStepFields and filters fields internally)
- ViewFieldGroup.tsx:150-190 — getVisibleFields(tabId, groupId, session, createStepFields) is the actual per-render field-list source; same allowlist predicate as EntityFormBase.getVisibleFields
- CreateStepView.tsx:11-28 validateAndAdvanceStep(entityForm, currentStep, session) — on Next click: validates the UNION of ALL fields from step 0..currentStep (not just current step) via entityForm.validate({fieldNames, session}); on failure clones the form and calls withErrors(result), blocking advance; success clones+clears errors
- CreateStepView.tsx / CreateStepButtons.tsx — Prev always enabled unless step 0; Next shown while currentStep<maxStep; Save button shown only at currentStep===maxStep — Save is otherwise unreachable mid-wizard
- EntityFormBase.tsx:738-741 withRevisionEntityName(name) — plain setter
- EntityFormBase.tsx:743-746 getRevisionEntityName() — 3-level fallback: `this.revisionEntityName || this.menuUrl || this.name` — ALWAYS returns a non-empty string because `name` is required in the constructor
- EntityFormBase.tsx:847-851 setRevisionEntityNameIfBlank(path) — sets this.revisionEntityName = path ONLY if isBlank(current) — idempotent guard, first-caller-wins
- EntityForm.tsx:49 clone — `entityForm.revisionEntityName = this.revisionEntityName` (raw copy, unlike createStep's filtered copy)
- useEntityFormInitializer.ts:79-97 — the AUTOMATIC call site: for every MAIN entity form (`!isSubCollectionEntity`), on every initializeEntityForm(), computes `revisionPath` from `pathname` (strips the trailing `/{id}` segment when entityForm.id is set, else raw pathname) and calls `entityForm.setRevisionEntityNameIfBlank(revisionPath)` — this means EVERY form gets a real, page-route-derived revisionEntityName with ZERO explicit config; withRevisionEntityName is only needed to OVERRIDE this default
- EntityForm.tsx:868-879 getSubmitFormData() — unconditionally injects `data['revisionEntityName'] = this.getRevisionEntityName()` into every create/update payload (shared payload builder for both POST and PUT)
- EntityForm.tsx:447-478 deleteAll(idList) — bulk DELETE {url}: builds `formData = {ids: idList}`, then `if (revisionEntityName) formData['revisionEntityName'] = revisionEntityName` — comment cites this as the rcm-framework 0.1.0 bulk-delete wire CONTRACT ('Decision #31'), not optional metadata
- RevisionField.tsx:200 — comment notes the revision HISTORY DISPLAY side no longer filters by revisionEntityName (uses entityId alone) — so revisionEntityName's only remaining live purpose is the write-path (save/delete) audit-trail key, not read-side filtering

### New Insertion (newInsertion — target location/plan in the new engine)

- schema-core/src/entity-form.ts — add `CreateStepDef {id,label,order,hidden?,description?,fields:string[]}` type (mirrors TabDef's declared-vs-effective split: TabDef.hidden precedent at :62-80 is the direct template) + private `createSteps: CreateStepDef[]` + `withCreateStep(steps?)`/`setCreateStep(steps?)` (sort by order, store raw) + `getCreateStep()` (filter out hidden===true, return undefined if empty/unset) — same asymmetry as old engine (store raw, read filtered)
- schema-core/src/entity-form.ts — add `getTabFields(tabId): EntityField[]` (flatten all fields under a tab across groups, ordered) — REQUIRED for the real consumer usage pattern (`entityForm.getTabFields('default').map(f=>f.getName())` building each CreateStep.fields); not itself an audited member but withCreateStep is unusable at gjcu-parity without it
- schema-core/src/entity-form.ts clone() — propagate createSteps; decide explicitly (own decision, not silent-copy of old quirk) whether clone stores getCreateStep() (hidden-filtered, old behavior/quirk) or the raw array (arguably more correct) — document the choice either way since it diverges from a literal port
- schema-core/src/entity-form.ts — add `revisionEntityName?: string` field + `withRevisionEntityName(name)` + `getRevisionEntityName()` with fallback `this.revisionEntityName || this.name` (menuUrl has NO equivalent in the new engine — constructor only takes name+fetchUrl, no page-route concept; see risk below) + `setRevisionEntityNameIfBlank(path)` (idempotent, isBlank guard) — propagate raw value in clone()
- state/src/form-store.ts toSaveData() — after building `out` (the existing exceptOnSave/ManyToOne dump, :562-575) and BEFORE applying the EF6 submitTransform, inject `out['revisionEntityName'] = entityForm.getRevisionEntityName()` — same unconditional-injection contract as old getSubmitFormData; must run before submitTransform so a host override can still see/replace it, matching old engine's ordering (revisionEntityName set at data build time, before withOverrideSubmitData ran)
- schema-core/src/backend/adapter.ts BackendAdapter.remove — extend signature to `remove(url: string, ids: string[], revisionEntityName?: string): Promise<void>` — additive, non-breaking (audit confirms zero current call sites, `adapter.ts:37`/GAP-port #1); the caller (future delete-flow UI/hook — GAP #1, out of THIS group's scope) is responsible for passing entityForm.getRevisionEntityName()
- backend-rcm/src/adapter.ts remove() impl — merge `revisionEntityName` into the DELETE body alongside `ids` when provided (`JSON.stringify({ids, ...(revisionEntityName?{revisionEntityName}:{})})`) — mirrors old EntityForm.tsx:465-471 conditional-truthy injection
- react package — a NEW hook analogous to useEntityFormInitializer.ts:79-97's auto-derivation: schema-core is React-free/router-free (file header, entity-form.ts:50-54) so the pathname→revisionEntityName derivation CANNOT live in schema-core; it must be a react-layer hook (e.g. `useRevisionEntityName` or inline in the future ViewEntityForm init flow) that calls `entityForm.setRevisionEntityNameIfBlank(derivedPath)` once per initialize, for main-entity forms only — no such hook/init-flow exists yet in packages/react (ViewEntityForm.tsx has no pathname/router dependency at all today)
- react/src/components/ViewEntityForm.tsx (or a new CreateStepView.tsx port) — add `currentStep` store/local state, `useCreateStep = renderType==='create' && entityForm.getCreateStep() non-empty`, `maxStep`, `createStepFields = getCreateStep()[currentStep].fields`; thread `createStepFields` into `deriveTabs`/`deriveGroupFields` (ViewEntityForm.tsx:64-99) as an additional filter predicate — mirrors old getViewableFieldGroups/getVisibleFields allowlist check (`isEmpty(createStepFields) || createStepFields.includes(name)`) — reuse the EC3-0 tabHidden PATTERN (declared value + runtime override + effective-hidden resolution) as the template for how 'tab has no content for this step' composes with the existing tabHidden slice, but keep them as two independent gates (a step-empty tab is a DERIVED per-render filter, not a persisted tabHidden write — do not conflate by calling store.setTabHidden on step change, since that would leak state across step navigation/back button)
- react layer — Prev/Next/Save step UI: a lean port of CreateStepView.tsx/CreateStepButtons.tsx (Stepper + button group); Next handler needs a 'validate fields 0..currentStep' capability — form-store.ts today only exposes single-field validateField(name) and whole-form validateAll(); the port can compose this WITHOUT a new store method by looping `await store.getState().validateField(name)` over the accumulated field-name union and AND-ing the booleans (equivalent to old validateAndAdvanceStep's entityForm.validate({fieldNames}) subset-validate) — note as a possible follow-up store API (`validateFields(names)`) if the loop proves awkward
- react layer — Save-button gating: `currentStep === maxStep` before showing/enabling Save during a wizard — today ViewEntityForm.tsx:218-220 hardcodes one unconditional Save button (GAP-port #5, separate item) — this group's port must at minimum suppress/hide that Save affordance on non-final steps when useCreateStep is true

### Dependencies

- EC3-0 (TabDef.hidden / store.tabHidden / deriveTabs) — direct structural precedent for how CreateStepDef.hidden and a 'no visible content this step' tab filter should compose; reuse the same declared-vs-runtime-override split rather than inventing a new pattern
- EF1 (setMeta/useFieldMeta reactive override substrate) — an alternative (not chosen above, but worth the plan noting) implementation of per-step field hiding would be driving field.meta.hidden via setMeta on step change instead of a separate createStepFields render-filter; the OLD engine's actual behavior is a render-filter (fields never marked hidden, just excluded from the visible-fields query), so the render-filter approach in newInsertion is the faithful port — flagging so an implementer doesn't accidentally pick the setMeta path and diverge from parity (e.g. a step-1-only field, if implemented via setMeta(hidden:true), would still fail hidden-field required-validation semantics differently than a field simply absent from getVisibleFields)
- GAP-port #1 'Delete flow' (audit doc §GAP-port, line 25) — BackendAdapter.remove has zero UI call sites in the new engine at all; the revisionEntityName-on-delete half of this group is USELESS until a delete flow exists. This group can and should still add the `remove(url, ids, revisionEntityName?)` signature + backend-rcm body-merge (cheap, additive, unblocks the future delete-flow work) but the end-to-end 'delete actually sends revisionEntityName' behavior cannot be observed/verified until GAP #1 is implemented — flag this as a partial/blocked deliverable, not silently mark it done
- getTabFields(tabId) — not an audited member of this group but a hard runtime dependency of the ONE confirmed real-world withCreateStep consumer (gjcu-academic-front ApplicationFormLayout.tsx:682-713); porting withCreateStep without it leaves the API technically present but unusable in the pattern the only known consumer actually needs
- router/pathname threading in the react package — setRevisionEntityNameIfBlank's real value (auto page-route-derived revisionEntityName for EVERY form, not just wizard forms) depends on a pathname source; packages/react currently has no equivalent of useEntityFormInitializer.ts's router integration for this purpose — must be designed as part of whatever the eventual 'main entity form initialize' react hook is (may already be slated for GAP-port #1/#3 work; coordinate rather than build a second, divergent init hook)

### Reuse Targets (reuseTargets)

- packages/schema-core/src/entity-form.ts TabDef (:62-80) + EntityForm.setTabHidden (:216-235) — direct template for CreateStepDef's declared-hidden-filtering shape and for keeping the runtime/declared split
- packages/state/src/form-store.ts FormStoreState.tabHidden slice + setTabHidden action (:69-79,133-139,558-560) — pattern reference for any runtime per-step override slice, though see dependencies note: do not literally reuse tabHidden itself for step-content filtering
- packages/react/src/components/ViewEntityForm.tsx deriveTabs/deriveGroups/deriveGroupFields (:64-100) — the exact functions to extend with a createStepFields parameter, avoiding a parallel derivation path
- packages/state/src/form-store.ts toSaveData() (:562-582) — existing single injection point for the submit-transform hook (EF6); revisionEntityName injection is a same-shaped addition immediately upstream of it
- packages/schema-core/src/backend/adapter.ts BackendAdapter interface + packages/backend-rcm/src/adapter.ts createRcmAdapter() remove() (:177-183) — the two files to extend together for the revisionEntityName-on-delete wire contract

### Proof Needs (proofNeeds)

- Unit test: getCreateStep() hides hidden:true steps but setCreateStep()/internal storage keeps them (so a later un-hide is possible) — port the old asymmetry deliberately, add a regression test pinning it since it's an easy 'obviously wrong, let me fix it' target for a future refactor
- Unit test: getRevisionEntityName() fallback chain — explicit value wins > name fallback when unset (menuUrl tier intentionally dropped — document the decision in the test name/comment, not just silently omitted)
- Unit test: setRevisionEntityNameIfBlank is a no-op once a value is already set (first-caller-wins), matching isBlank-guard semantics
- Unit test: toSaveData() includes revisionEntityName in the payload for BOTH create and update renderType, and that a registered submitTransform still receives/can override it (ordering test)
- Integration/E2E: reproduce the gjcu-academic-front ApplicationFormLayout 4-step wizard shape (basic/personal/education/other tabs → 4 CreateStep entries via getTabFields) against the new engine's ported withCreateStep + Stepper UI — this is the only known real consumer, so it is the parity oracle, not a synthetic fixture
- E2E: confirm useCreateStep is CREATE-only — the SAME entityForm declaration used in update/edit mode must show ALL tabs normally, no stepper, no field filtering (a regression here would silently break every edit screen of a wizard-configured entity)
- E2E: Next-button validation blocks advance on invalid fields in ANY of steps 0..currentStep (not just the current step) and unblocks/advances once fixed — matches CreateStepView.tsx's cumulative-fields validate, a subtle behavior easy to under-port as 'validate current step fields only'
- Once GAP #1 (delete flow) lands: integration test asserting the DELETE request body actually contains revisionEntityName — cannot be verified before then; document as blocked, not skipped

### Risks

- clone() re-assigns `getCreateStep()` (hidden-filtered) onto the clone in the OLD engine (EntityForm.tsx:50) — a step marked hidden is PERMANENTLY lost on every clone, which happens routinely (validateAndAdvanceStep clones on every Next click, CreateStepView.tsx:23,27). A literal port inherits this; a 'corrected' port (clone the raw array) silently changes behavior for any consumer relying on (or accidentally depending on) the old quirk. Must be an explicit, documented decision, not an accidental fix or an accidental bug-for-bug port.
- useCreateStep is gated on renderType==='create' ONLY (useEntityFormLogic.ts:293-299) — there is no wizard in update/edit mode in the old engine at all. Easy to over-generalize during the port (e.g. 'why not let edit mode step through too') — that would be new scope, not parity.
- Initial-tab-list vs step-change-tab-list ASYMMETRY in the old engine: initial load passes createStepFields into getViewableTabs so `tabs` state is already step-1-filtered (useEntityFormInitializer.ts:106); every SUBSEQUENT step change instead fetches the FULL unfiltered tab list and CSS-hides per-tab (useEntityFormLogic.ts:467, ViewTab.tsx:105). A naive single-code-path port will likely normalize this into one behavior — decide once, document it, since headlessui Tab.Group's selectedIndex-stability constraint (ViewTab.tsx:58-59 comment) is WHY the old engine chose 'keep the array, hide via CSS' for navigation but not for initial mount; the new engine's array-based deriveTabs (no headlessui) may not have the same constraint, so the 'right' new-engine answer could legitimately just filter the array both times — but that is a behavior change worth calling out, not a silent one.
- menuUrl has no equivalent in the new EntityForm (constructor is name+fetchUrl only, no page-route field) — the fallback ladder cannot be a literal 3-tier port. Falling back straight to `name` changes the DEFAULT revisionEntityName value for every form that never explicitly set one (in the old engine, most forms got a page-route-derived value via setRevisionEntityNameIfBlank(pathname), not the bare entity `name`) — if any backend logic keys off revisionEntityName looking like a route path rather than an internal entity name, this is a real behavioral divergence, not just a cosmetic one. Needs either (a) porting the pathname-auto-derivation hook into the react layer (restores old default), or (b) an explicit product decision that `name`-only fallback is acceptable, recorded as a decision, not left implicit.
- BackendAdapter.remove signature change is additive/non-breaking TODAY only because there are zero call sites (audit confirms) — but it is a public library interface consumed by external apps' own adapter implementations if any exist outside this repo; a signature change still needs a changelog/major-version-awareness note even though no ripple was found in-repo grep of gjcu/edustack.
- The whole delete-flow (GAP #1) is unimplemented — porting revisionEntityName's delete-side half produces code with no caller and no way to observe/verify end-to-end until that separate, out-of-scope gap is filled. Do not report this half as 'done/verified' — it is 'plumbed but unreachable' until GAP #1 lands.
- EntityFormButtonStepInfo (EntityFormButton.tsx:8-12, {useCreateStep,currentStep,maxStep,createStepFields}) is passed to custom `withButtons` factories in the old engine so host apps can build step-aware custom buttons — the new engine's Save button is still hardcoded (GAP-port #5, separate item); porting createStep without eventually also porting withButtons means a host cannot replicate this gjcu-style customization even after this group's work lands. Not this group's scope to fix, but the two GAPs are coupled for anyone trying to reach full gjcu parity.

### Review Grouping (reviewGrouping)

이 그룹은 성격이 다른 두 하위 작업이 하나의 charter(C6)로 묶여 있음 — 리뷰/구현 시 별도 PR/커밋으로 쪼개는 것을 권장: (A) createStep 위저드(schema-core CreateStepDef+getTabFields, state 없음, react Stepper+단계필터 — UI 비중 큼, gjcu E2E로 검증) vs (B) revisionEntityName(schema-core 필드 3종, state toSaveData 1줄 삽입, backend-rcm adapter 시그니처 확장 — 전 폼 공통 계약이라 파급범위는 넓지만 코드량은 작음, delete 절반은 GAP #1 대기). 하나의 리뷰 게이트에 묶으면 "작지만 파급범위 넓은 B"가 "크지만 국소적인 A"에 묻혀 리뷰 품질이 떨어질 위험.

### LOC (scale estimate)

650

### Port Notes (portNotes)

이 그룹은 감사 문서(§defer-documented)에서 "charter-GA 미슬라이스"로 분류돼 있었으나, 사용자 지시(FULL parity, no defer)에 따라 재조사함. withCreateStep은 이 repo 내부에는 콜사이트가 0이지만 **소비자 저장소(gjcu-academic-front)에 실제 프로덕션 4단계 입학원서 위저드로 살아있음**을 로컬 grep으로 직접 확인(~/dev/gjcu-academic-backend/gjcu-academic-front/apps/admission/src/components/application/ApplicationFormLayout.tsx:659-716) — ContentAsset/Rule 선례와 달리 **dead-code 판정 불가, 반드시 이식 대상**. revisionEntityName은 한 걸음 더 나아가 명시적 opt-in 없이도 **모든 메인 엔티티 폼의 save/delete 요청에 자동으로 실려나가는 baseline 동작**(useEntityFormInitializer.ts의 무조건 setRevisionEntityNameIfBlank 호출)이라 이 그룹 라벨(위저드+리비전)보다 실제 영향 범위가 넓음 — 이식 시 "위저드 전용 기능"이 아니라 "전 폼 공통 저장/삭제 페이로드 계약"으로 취급해야 함. delete 경로는 GAP #1(delete flow 자체 미구현)에 막혀 이 그룹만으로는 종단 검증 불가 — adapter 시그니처 확장까지는 이 그룹에서 하되, "완료"가 아니라 "GAP #1 대기 중"으로 명시할 것.


---

<a id="group-6"></a>

## Group 6: FORM/FIELD SUGAR + ESCAPE HATCHES (EntityForm-level one-liners + alert/attribute/title sub-features)

### Members

- withTitle(dynamic {title,field,view})
- withHelpText(name,helpText)/withTooltip(name,tooltip) form-level 2-arg delegate
- withUrl
- withMenuUrl
- withParentId
- hasField(name)
- hasTab(id)
- getLabel(name)
- getHelpText(name,session)
- removeTab(tab)
- removeTabs(tabs)
- withAttributes/getAttributes/putAttribute/removeAttribute/hasAttribute (form-level attribute bag)
- addAttributeToField/removeAttributeToField/getFieldAttributes (field-attribute-via-form convenience)
- withAlertMessages/clearAlertMessages/removeAlertMessage/getAlertMessages/clearAllMessages
- withFieldToLayout(layout)
- merge(origin)
- setFetchedValue(name,value) single-field

### Old Source (oldSource — citations into the 0.3.x/old engine)

- EntityFormBase.tsx:210-227 withTitle (title:string|{title,field,view}) + :284-306 getTitle/getTitlePostfix (async, resolves title.title | field value via getCurrentValue | fallback name-field/id/'신규 입력') — real async resolver: components/form/hooks/useEntityFormTitle.ts:22-29 (title.view(f) awaited, title.field looked up)
- EntityFormBase.tsx:672-686 withHelpText(name,helpText)/withTooltip(name,tooltip) — find field, mutate, re-set into fields Map. Zero real callers found repo-wide (grep for 2-arg form); all real call sites (Preset.tsx, ApplyFullAddressFields.tsx, XrefPiceMappingView.tsx, EntityFormData.tsx:189) use the field-level 1-arg chained builder (FormField.tsx:171-180 old / already ported to packages/schema-core/src/field/form-field.ts:171-180)
- EntityFormBase.tsx:200-208 withUrl/withMenuUrl. Real callers: SubCollectionField.tsx:255 (listGrid.getEntityForm().withUrl(url) — dynamicUrl override for nested ListGrid); ManyToOneView.tsx:45,339-346 + FieldRendererHelper.tsx:31,34,38 (menuUrl → external link to referenced entity's own admin page, window.open(menuUrl+'/'+id))
- EntityFormBase.tsx:229-232 withParentId. Real callers: SubCollectionField.tsx:212 (this.entityForm.clone(true).withParentId(parentEntityForm.id)), InlineSubCollectionView.tsx:200,216 (same pattern) — parent-id threading into a nested EntityForm's own separate fetch/list
- EntityFormBase.tsx:308-310 hasField, :341-343 hasTab. Real internal callers: EntityFormData.tsx:130 (addFields dedup guard for a new tab id), EntityFormActions.tsx:157 (addFields tab lookup guard), EntityFormActions.tsx:276,306 (advanced-search ManyToOne auto-filter-field injection, checks referenced form hasField('name')/hasField('user.name'))
- EntityFormBase.tsx:652-660 getLabel(name)→field.getLabel(); :662-670 getHelpText(name,session)→field.getHelpText({entityForm,session}) (async, only when `this instanceof EntityForm`). Real callers: EntityForm.tsx:776,786 + EntityFormMethod.ts:121,126 (server fieldError map → field label for the error banner), RuleBasedSelector.tsx:39,56 (client-extension rule display)
- EntityFormBase.tsx:402-408 removeTabs, :410-418 removeTab (Map.delete on this.tabs). Zero callers found anywhere in repo (only self-declaration) — genuinely dead
- EntityFormBase.tsx:778-810 withAttributes/getAttributes/putAttribute/removeAttribute/hasAttribute (EntityFormBase.attributes Map, distinct from per-field attributes) + :812-835 addAttributeToField/removeAttributeToField/getFieldAttributes (reach into field.attributes via the form). Zero real callers anywhere — only EntityForm.tsx:91 clone() propagates `this.attributes` (never read back). Field-level `field.attributes` itself IS live (read at FieldRendererHelper.tsx:20 `attributes: field.attributes`) — only the EntityForm-level wrapper API is dead
- EntityFormActions.tsx:63-72 clearAlertMessages, :79-87 withAlertMessages, :94-97 removeAlertMessage, :112-114 getAlertMessages, :121-128 clearAllMessages, backing field EntityFormBase.tsx:87 `alertMessages: AlertMessage[]`. Real, substantial old subsystem: components/form/hooks/useAlertManager.ts + components/form/ui/ViewEntityFormAlerts.tsx + components/form/types/ViewEntityFormAlerts.types.ts + ViewEntityForm.tsx wiring — a banner-message channel distinct from field validation errors (key/message/persistent/color)
- EntityForm.tsx:1066-1073 withFieldToLayout (loops all fields, field.withLayout('full'|'half') if instanceof FormField). Zero callers anywhere in repo besides its own declaration — genuinely dead
- EntityForm.tsx:129-133 merge(origin) → origin.cloneWithEntityForm(this,true). Zero invocations anywhere in repo; the only hit is a COMMENT at components/form/FieldRenderer.tsx:126-130 documenting that the old `entityForm.merge(cloned); setEntityForm(entityForm)` same-ref pattern was deliberately ABANDONED in the old engine itself (Sprint 31c: React 19 setState skips a same-reference update, so controlled-input values stopped syncing) and replaced by passing the new `cloned` reference directly — genuinely dead, with an explicit in-repo obsolescence note
- EntityForm.tsx:135-152 setFetchedValue(name,value) single-field (sets field.value.fetched, and .current only if unset). Real caller: components/fields/ApplyFullAddressFields.tsx:257. ALREADY PORTED VERBATIM — packages/schema-core/src/entity-form.ts:204-214, whose own doc comment cites 'the old engine's EntityForm.tsx:135-152 setFetchedValue verbatim'. No action needed for this one member.

### New Insertion (newInsertion — target location/plan in the new engine)

- withTitle: extend packages/schema-core/src/entity-form.ts `title` slot from `string` to `string | {title?:string; field?:string; view?:(ef:EntityForm)=>Promise<ReactNode>}` (mirror old EntityFormBase.tsx:47-53 type); getTitle() stays sync/string-only for the simple case, add an async resolver (new getResolvedTitle(session?) on EntityForm, or a small hook in packages/react mirroring useEntityFormTitle.ts) that ViewEntityForm.tsx:132 calls instead of the current sync `entityForm.getTitle()`
- withHelpText(name,)/withTooltip(name,) form-level: NOT recommended to port (dead — zero real callers, field-level 1-arg builder already covers every real use, already ported to form-field.ts:171-180)
- withUrl/withParentId: NOT recommended to port as-is — sole old consumer (SubCollectionField's separate-fetch nested ListGrid, parent-id-filtered) is superseded by the new inline SubCollectionField (packages/schema-core/src/field/sub-collection-field.ts — values live in the parent form store, no separate url/id fetch). Re-evaluate only if/when a new SubCollection variant needs cross-form dynamic-URL override
- withMenuUrl: real standing gap, recommend porting — add `menuUrl?: string` to the many-to-one-field.ts referenced-EntityForm declaration (or resolve via the target EntityForm's own getUrl()-adjacent field) and wire an external-link affordance into packages/react/src/registry/many-to-one-renderer.tsx (currently has none — grep confirmed zero menuUrl/window.open/Link usage)
- hasField/hasTab: trivial one-liner add to packages/schema-core/src/entity-form.ts queries section — `hasField(name){ return this.getField(name)!==undefined }`, `hasTab(id){ return this.tabs.has(id) }`. Their real old behavioral role (addFields dedup guard) is ALREADY inlined equivalently at entity-form.ts:239/249 `if (!this.tabs.has(tabId))`/`if (!this.groups.has(groupId))` — porting the public methods is for surface completeness, not missing behavior
- getLabel(name): trivial delegate — `getLabel(name){ return this.getField(name)?.getLabel() }` on entity-form.ts, reusing form-field.ts's existing getLabel()
- getHelpText(name,session): do NOT port as a bare delegate — schema-core deliberately moved ReactNode-resolving getHelpText()/getTooltip() OUT to 'the renderer layer' (entity-field.ts:21-23 architecture note), and that renderer-layer resolver does not exist yet (FieldRenderer.tsx never reads field.helpText/tooltip at all today). Correct insertion is a packages/react hook (e.g. useFieldHelpText(field, ctx)) built alongside the currently-unbuilt helpText/tooltip RENDER support, with EntityForm.getHelpText(name,session) as a thin form-level wrapper over it once that lands
- removeTab/removeTabs: NOT recommended to port — zero callers, propose an explicit dead-code note instead (parallel to withFieldToLayout/merge)
- form-level attribute bag (withAttributes/getAttributes/putAttribute/removeAttribute/hasAttribute) + addAttributeToField/removeAttributeToField/getFieldAttributes: NOT recommended to port — zero real callers; field-level `attributes?: Map` (already present, entity-field.ts:102/form-field.ts:68, and already read at render time) fully covers the one thing that IS live
- withAlertMessages/clearAlertMessages/removeAlertMessage/getAlertMessages/clearAllMessages: real GAP-port, sized as a mini-subsystem not a one-liner — add `alertMessages: AlertMessage[]` state to FormStoreState (packages/state/src/form-store.ts) parallel to the existing (currently inert, EF8/task#26) `formErrors` slot, expose store actions mirroring the 5 old methods, and add a banner render block in ViewEntityForm.tsx next to the existing `formErrors.length>0` block (ViewEntityForm.tsx:210-216) — reuse that block as the structural template
- withFieldToLayout: NOT recommended to port — zero callers, dead
- merge(origin): NOT recommended to port — zero callers, and the old engine's own commit history explicitly abandoned this same-reference pattern as a React-19 bug source (see oldSource citation) — porting it would reintroduce a known-bad pattern
- setFetchedValue(name,value): no action — already faithfully ported to packages/schema-core/src/entity-form.ts:204-214

### Dependencies

- getHelpText(name) port is gated on the (currently unbuilt) helpText/tooltip renderer-layer resolver in packages/react/src/components/FieldRenderer.tsx — do not land the form-level delegate before that exists, or it repeats the exact 'declared-but-INERT' failure mode already flagged for formErrors/isPermitted (EF8, task #26)
- getLabel/getHelpText's real old consumer (server fieldError→field-label mapping, EntityForm.tsx:776-786) is GAP-port item #4 in documents/analysis/2026-07-11/entityform-api-audit.md ('서버 검증 에러→필드 매핑') — not yet built in the new engine either; porting getLabel alone is safe/standalone, but getHelpText's usefulness there is blocked on that larger item
- alertMessages needs a new FormStoreState slot design that should be done alongside (not instead of) the EF8 formErrors wiring (task #26, already pending) — both are form-level UX message channels and sequencing them together avoids two divergent designs for the same concept
- withMenuUrl needs many-to-one-field.ts + many-to-one-renderer.tsx (EA-D xref/domain field port, already completed per task history) as its landing surface

### Reuse Targets (reuseTargets)

- packages/schema-core/src/field/form-field.ts:171-180 withHelpText/withTooltip (field-level) — reuse as-is; form-level getLabel/getHelpText should thinly delegate to this, not reimplement
- packages/schema-core/src/field/entity-field.ts:102 / form-field.ts:68 `attributes?: Map<string,unknown>` (field-level) — reuse as-is; do not resurrect the dead EntityForm-level attribute bag
- packages/state/src/form-store.ts FormStoreState.formErrors slot (currently inert, EF8/task#26 target) — reuse as the direct structural template for a new alertMessages slot (array-append/persistent-filter semantics differ but the store-slice + render-block pattern is identical)
- packages/schema-core/src/entity-form.ts:204-214 setFetchedValue — already-correct precedent for 'verbatim single-field port', useful as the review template for any future one-liner ports in this group
- packages/schema-core/src/entity-form.ts:239,249 addFields()'s existing `!this.tabs.has(tabId)` / `!this.groups.has(groupId)` guards — already reproduce hasTab's one real behavioral role; new public hasField/hasTab should just expose the same check
- components/form/hooks/useEntityFormTitle.ts (old) — direct template for the async title.field/title.view resolution hook the new engine still needs

### Proof Needs (proofNeeds)

For the 5 confirmed-dead members (removeTab/removeTabs, withFieldToLayout, merge, form-level attribute bag incl. addAttributeToField family, form-level 2-arg withHelpText/withTooltip): a repo-wide grep for each method name was already run in this analysis and returned zero real call sites (only self-declarations / one obsolescence comment) — re-run the same grep at actual port/removal time as a final check, no runtime characterization test needed since there is no old behavior to reproduce. For the GAP-port members that DO get built (withTitle dynamic resolution, withMenuUrl external-link, hasField/hasTab, getLabel, alertMessages subsystem): a characterization test per member comparing old-engine output to new — (1) title: async view()/field() resolution against a fetched record, (2) menuUrl: ManyToOne renderer emits the external link with correct id-appended URL, (3) hasField/hasTab: boolean parity against a form with dynamically-added fields (EF4), (4) getLabel: delegate parity, (5) alertMessages: add/persistent-filter/clear/clearAll round-trip plus banner render — mirroring the existing formErrors E2E pattern once EF8/task#26 lands it.

### Risks

(1) The audit doc (documents/analysis/2026-07-11/entityform-api-audit.md) buckets withAlertMessages et al. under 'defer-documented' with the reasoning 'charter 무명명 escape hatch, 소비자 니즈 시' — but this analysis found REAL, substantial old usage (useAlertManager.ts + ViewEntityFormAlerts.tsx + ViewEntityForm.tsx wiring), which contradicts the 'not needed' framing under this task's strict full-parity mandate. Needs explicit conductor/user sign-off to treat as out-of-scope rather than silently deferring — it is not dead code. (2) getHelpText(name) is a trap: porting only the form-level one-liner without first building the renderer-layer helpText/tooltip resolver would just create a 4th 'declared-but-inert' API, the exact failure class EF8/task#26 already exists to fix for formErrors/isPermitted — sequence this after that resolver lands, not before. (3) withUrl/withParentId look like a real gap (4 real old call sites) but their sole consumer — the old SubCollectionField's separate-fetch nested ListGrid — has been architecturally superseded by the new inline SubCollectionField (schema-core/src/field/sub-collection-field.ts has zero url/parentId concept). Porting these two methods with no real new-architecture consumer risks recreating dead surface; recommend explicit non-port with this rationale rather than silent omission, since the mandate requires citing dead-code evidence for any skip and 'superseded architecture, no current consumer' is a different justification than 'never called' and should be flagged as such to the conductor. (4) hasField/hasTab's real old behavioral role (advanced-search auto-filter injection) is tied to the already-deferred List-track slice — adding the public one-liner methods is safe and cheap but must not be mistaken for that feature being ported.

### LOC (scale estimate)

180

### Port Notes (portNotes)

Net recommendation to conductor: PORT (real gap, small) — withMenuUrl (+ ManyToOne renderer link), hasField/hasTab (trivial), getLabel (trivial). PORT (real gap, non-trivial, needs design) — withTitle dynamic {title,field,view} resolution, withAlertMessages subsystem (5 methods + store slot + render block). DEFER pending prerequisite — getHelpText(name) (needs renderer-layer resolver first, EF8-adjacent). DO NOT PORT, cite dead-code evidence — withHelpText/withTooltip form-level 2-arg (field-level already covers all real use), removeTab/removeTabs (0 callers), withFieldToLayout (0 callers), merge() (0 callers + explicit in-repo abandonment note), form-level attribute bag incl. addAttributeToField/removeAttributeToField/getFieldAttributes (0 callers; field-level attributes already live and already ported). DO NOT PORT, architecture-superseded (not exactly 'dead' — flag distinctly) — withUrl/withParentId (old SubCollection's separate-fetch pattern has no equivalent consumer in the new inline SubCollectionField). ALREADY DONE — setFetchedValue(name,value) single-field, verified verbatim in packages/schema-core/src/entity-form.ts:204-214.


---

<a id="group-7"></a>

## Group 7: CLIENT EXTENSION SYSTEM

### Members

- withClientPreFetchList
- withClientPostFetchList
- withClientPreCreate
- withClientPostCreate
- withClientPreRead
- withClientPostRead
- withClientPreUpdate
- withClientPostUpdate
- withClientPreDelete
- withClientPostDelete
- executeClientExtensions
- hasClientExtensions
- getClientExtensions
- getAllClientExtensions

### Old Source (oldSource — citations into the 0.3.x/old engine)

- src/listgrid/config/form/EntityFormExtensions.tsx:1-172 — whole file: private withClientExtension(point,handler,options) builds {handler, options:{enabled:true,continueOnError:true,priority:0,...options}}, pushes onto clientExtensions.get(point)||[], re-sorts by options.priority ascending, Map.set. All 10 withClientPre*/Post* builders (lines 46-118) are thin wrappers calling this with a fixed ExtensionPoint. executeClientExtensions (123-147): loops sorted configs, skips enabled===false, awaits handler(result,context) threading the return value forward as `result`, try/catch per handler logs `[Client Extension Error] {name}.{point}` and continueOnError===false rethrows (aborts the loop, propagates uncaught to caller). hasClientExtensions (152-157)/getClientExtensions(162-164)/getAllClientExtensions(169-171) are Map reads.
- src/listgrid/extensions/EntityFormExtension.types.ts:1-64 — ExtensionPoint enum (6 CRUD-adjacent points x pre/post = PRE/POST_FETCH_LIST, _CREATE, _READ, _UPDATE, _DELETE; comment at :39-40 states the enum is shared client+server); ClientExtensionContext<TSession,TUser> = {session?,user?,entityForm:EntityForm,[key:string]:any}; ExtensionOptions{priority?,enabled?,continueOnError?,description?}; ClientExtensionFunction<TInput,TOutput=TInput> = (data,context)=>Promise<TOutput>|TOutput.
- src/listgrid/config/EntityForm.tsx:54-55 — cloneWithEntityForm does `entityForm.clientExtensions = new Map(this.clientExtensions)`: a SHALLOW Map copy — the per-point config ARRAYS are the same array references as the original, unlike onChanges/onFetchData/onInitialize which are copied with `[...this.onChanges]` etc (lines 94-97). A withClientPre*/Post* call issued on a post-clone instance mutates the pre-clone instance's array too (registration-time-only in practice since builder chains run before any clone(), but a real shared-mutable-state bug to note, not silently reproduce, if porting).
- src/listgrid/components/form/hooks/useEntityFormSave.ts:58-103 — the ONLY dispatch site for PRE_CREATE/POST_CREATE/PRE_UPDATE/POST_UPDATE. hasClientExtensions gates a context build. PRE point dispatched BEFORE `processedEntityForm.save(session)` with data=`entityForm.fetchedEntity ?? {}` (the STALE pre-edit fetched record, NOT the submit payload) — the awaited return value is discarded (`processedEntityForm = entityForm;` is a no-op reassignment, line 81). POST point dispatched AFTER a successful save with data=`finalEntityForm.fetchedEntity ?? {}` (now the fresh post-save record, since internalSave's setFetchedValues sets fetchedEntity from the server response) — return value again discarded. No try/catch wraps either executeClientExtensions call or the save() call in this callback — an uncaught continueOnError:false throw propagates as an unhandled rejection from the useCallback. postSave (a separate single-callback host hook, not part of this system) fires after.
- src/listgrid/components/list/hooks/useListGridLogic.ts:210-273 — the ONLY dispatch site for PRE_FETCH_LIST/POST_FETCH_LIST. Unlike CREATE/UPDATE, this pair IS a real transform pipeline: `finalSearchForm = await entityForm.executeClientExtensions(PRE_FETCH_LIST, listSearchForm, context)` replaces the working SearchForm before `listGrid.fetchData(finalSearchForm,...)`; `processedResult = await entityForm.executeClientExtensions(POST_FETCH_LIST, result, context)` replaces the working PageResult after fetch, BEFORE the separate legacy `onFetchListData` hook array runs, BEFORE `props.options?.onFetched`. Ordering: PRE_FETCH_LIST -> adapter fetch -> POST_FETCH_LIST -> onFetchListData(legacy) -> onFetched(host prop).
- src/listgrid/config/EntityForm.tsx:433-493 (delete()/deleteAll()) and :534-606,608-637 (setFetchedValues()/fetchData()) — read in full: ZERO executeClientExtensions calls anywhere in these methods (only the separate single-callback `this.postDelete` fires in deleteAll). This is the dead-invocation evidence for PRE_READ/POST_READ/PRE_DELETE/POST_DELETE — confirmed by a repo-wide grep for `executeClientExtensions` (3 hits total: the definition file + the two call sites above; nothing else).
- /Users/kunner/dev/gjcu-academic-backend/gjcu-academic-front/packages/entities/Academic/Admission/applicant/FreshmanEntityForm.ts:134-241 — REAL production consumer (chained off `@rchemist/listgrid`'s EntityForm, imported via @gjcu/entities and wired into live routes: apps/admin/.../academic/admission/freshman/[id]/page.tsx, apps/admission ApplicationCard.tsx/ApplicationFormLayout.tsx — traced via configureFreshman <- AdmissionEntityForm/AdminAdmissionEntityForm/ApplyAdmissionEntityForm). Registers ALL 8 CRUD builder methods including withClientPreRead, withClientPreDelete, withClientPostDelete — i.e. the ExtensionPoint values that are NEVER dispatched anywhere in the old engine. This means the READ/DELETE handlers are dead code in a stricter sense than the ContentAsset/Rule precedent (0 consumer usage): here a real consumer DOES call the builder (so it is NOT 'no internal caller' at the registration API level) but the registration is silently INERT because the CRUD flow never invokes executeClientExtensions for those 4 points — same 'declared-but-INERT' shape as the audit's formErrors/isPermitted/neverDelete findings, not the same shape as genuinely-unreferenced dead code.

### New Insertion (newInsertion — target location/plan in the new engine)

- packages/schema-core/src/entity-form.ts — add a new orthogonal hook axis (own file recommended, e.g. entity-form-extension.ts, ported near-verbatim from EntityFormExtension.types.ts: ExtensionPoint enum, ClientExtensionContext<TSession=Session,TUser=SessionUser> using the ALREADY-MATCHING schema-core Session/SessionUser shapes from ./auth, ExtensionOptions, ClientExtensionConfig, ClientExtensionFunction). EntityForm gains a private `clientExtensions: Map<ExtensionPoint, ClientExtensionConfig[]>`, the 10 withClientPre*/Post* builders + private withClientExtension helper, executeClientExtensions/hasClientExtensions/getClientExtensions/getAllClientExtensions — same public surface as old EntityFormExtensions.tsx. clone() must deep-copy per-point arrays (`new Map([...this.clientExtensions].map(([k,v]) => [k, [...v]]))`) — fixes the old engine's shallow-copy bug rather than reproducing it (flag as a deliberate, documented deviation, matching how onChanges/onFetchData/onInitialize/submitTransform already deep-copy on clone in this file).
- packages/state/src/list-store.ts `fetch()` (currently lines 53-76) — natural PRE_FETCH_LIST/POST_FETCH_LIST dispatch site, direct analogue of useListGridLogic.ts:210-273's transform-pipeline pattern: dispatch PRE_FETCH_LIST on `get().searchForm` before calling `opts.adapter.list(...)`, using its (possibly-transformed) result as the actual query; dispatch POST_FETCH_LIST on the resolved `page` (or `page.content`, TBD — old contract operated on the whole PageResult, the newer EA-D2-0 `postFetch` option only touches `rows`/content, needs a shape decision) before applying `opts.postFetch` and before `set(...)`. BLOCKING GAP: CreateListStoreOptions currently has no `entityForm` field at all (only {url, adapter, initialSearch, postFetch}) and no session/user threading — both must be added as new (optional, to stay non-breaking) options for this dispatch to exist.
- packages/react/src/components/ViewEntityForm.tsx `handleSave()` (currently lines 166-178) — natural PRE_CREATE/POST_CREATE/PRE_UPDATE/POST_UPDATE dispatch site, direct analogue of useEntityFormSave.ts's onClickSaveButton: dispatch PRE_* before `await onSave?.(store.getState().toSaveData())`, POST_* after it resolves successfully (same try/finally shape already present, so an unguarded continueOnError:false throw propagates exactly like the old engine's unwrapped useCallback). BLOCKING GAP: (a) ViewEntityFormProps has no session/user prop — `useSession()` (packages/react/src/providers/auth.tsx, already used by FieldRenderer) is available to pull in, so this is wiring not new infra; (b) old engine's PRE/POST_CREATE/UPDATE data param was `entityForm.fetchedEntity` — schema-core's new EntityForm has NO fetchedEntity concept (that lived only in the old class-as-runtime-state design ADR-0002 replaced); the closest analogues in the new engine are `store.getState().toSaveData()` (the actual payload, PRE-appropriate) and whatever the store/adapter hands back post-save (POST-appropriate) — but `onSave`'s current signature is `(data) => void | Promise<void>`, so there is no structured post-save result to feed POST_* with server-fresh data. This needs an explicit conductor design call (verbatim-faithful stale/discarded-return-value old contract vs a corrected contract), not a mechanical port — see risks.
- packages/state/src/initialize-form-store.ts (fetch/onFetchData/onInitialize pipe, lines 57-118) — the architecturally natural PRE_READ/POST_READ insertion point IF the conductor chooses to fix the old engine's inertness rather than faithfully reproduce it (insert around the `adapter.getOne(...)` call at step b/lines 74-83, alongside but distinct from the onFetchData loop at step d). Faithful-port-only path: port ONLY the withClientPreRead/withClientPostRead builder methods (schema-core, item 1 above) with NO dispatch site anywhere — this reproduces the old engine's actual (broken) behavior byte-for-byte, including for the real FreshmanEntityForm.ts consumer whose preRead handler already never fires today.
- PRE_DELETE/POST_DELETE — NO insertion point exists or can exist yet: the new engine has no delete flow at all (BackendAdapter.remove is declared with zero call sites, ViewEntityForm has no delete button/onDelete prop — documents/analysis/2026-07-11/entityform-api-audit.md GAP-port item 1, itself flagged '사용자 결정 대기'). Faithful-port-only path: port ONLY the two builder methods (schema-core, item 1 above), no dispatch site — matches old engine's actual (also-broken) behavior. A real dispatch site cannot be mapped until the delete flow itself is designed and built (hard dependency, not something this group can resolve standalone).

### Dependencies

- EF2 FormMutator pattern (packages/schema-core/src/field/form-mutator.ts, packages/state/src/form-store.ts) — architectural precedent for keeping schema-core state-agnostic (ADR-0003 purity) via an injected interface rather than a raw store reference; relevant if the CREATE/UPDATE dispatch context should carry store-write capability (it doesn't in the old contract, which only ever mutates via the raw context.entityForm reference and discards handler return values, but the new port may want to reconsider this — see risks).
- EF3 initializeFormStore pipe (packages/state/src/initialize-form-store.ts) — the per-handler try/catch-log-and-continue isolation convention (0.3.x parity, already documented in this file's own comments at lines 88-96/99-107) is the pattern to reuse verbatim for READ dispatch IF that path is built, and is already the convention executeClientExtensions itself follows for continueOnError:true.
- EF6 submitTransform single-slot pattern (entity-form.ts withSubmitTransform/getSubmitTransform, form-store.ts toSaveData:562-582) — shows the established convention for 'apply a registered hook to the mechanical save payload'; relevant as a design-alternative reference point since the old CREATE/UPDATE client extensions do NOT actually transform the payload (that job is submitTransform's, already ported) despite superficially looking like they might.
- HARD BLOCKING dependency: delete flow (documents/analysis/2026-07-11/entityform-api-audit.md GAP-port #1) must exist before PRE_DELETE/POST_DELETE can have a real dispatch site — this group cannot independently unblock that; it is explicitly marked '사용자 결정 대기' in the audit's own Conductor 결정 section.
- packages/react/src/providers/auth.tsx useSession()/AuthProvider — already-built session-threading infra this group can reuse rather than invent, for the CREATE/UPDATE (and, if built, READ) dispatch sites' ClientExtensionContext.session/user construction (old pattern: `session?.getUser?.()`, and schema-core's Session.getUser?.() shape at packages/schema-core/src/auth.ts already matches).

### Reuse Targets (reuseTargets)

- schema-core Session/SessionUser (packages/schema-core/src/auth.ts) — reuse directly for ClientExtensionContext<TSession,TUser>'s defaults instead of redeclaring a parallel type.
- packages/react/src/providers/auth.tsx useSession() — reuse for context.session/user construction in ViewEntityForm (and list-store's caller, ViewListGrid, if session needs to reach the store).
- entity-form.ts's existing per-hook-array clone-propagation style (`copy.onChanges = [...this.onChanges]` etc, lines 339-345) — reuse this exact deep-copy convention for clientExtensions instead of the old engine's shallow Map-copy bug.
- EF3's per-handler try/catch/console.error/continue convention (initialize-form-store.ts) — reuse verbatim for any executeClientExtensions loop's per-config error isolation (it already matches — executeClientExtensions was itself the model EF3 followed 0.3.x-side).

### Proof Needs (proofNeeds)

Unit: withClientExtension priority-sort order (lower priority number runs first) and enabled:false skip, continueOnError:true swallow-and-log vs continueOnError:false rethrow-and-abort-loop, for a Map with >1 config on the same point — direct port of implicit old-engine behavior, no old test file located in this scan (grep test files for 'ClientExtension' recommended before assuming zero prior coverage). Unit: hasClientExtensions(...points) is a some()-across-points OR, not an every() — old call sites always pass a pre+post pair and treat it as a single gate. Integration (list-store): PRE_FETCH_LIST's returned SearchForm is what actually reaches adapter.list (not the original), and POST_FETCH_LIST's returned value is what reaches postFetch/set() — mirrors useListGridLogic.ts's finalSearchForm/processedResult threading exactly. Integration (ViewEntityForm): PRE_CREATE/PRE_UPDATE dispatches before onSave is invoked, POST_CREATE/POST_UPDATE only after a successful (non-throwing) onSave, and picks the CREATE vs UPDATE point correctly off the store's renderType. Explicit non-goal proof: for whichever of PRE_READ/POST_READ/PRE_DELETE/POST_DELETE end up ported builder-only (no dispatch site), add a codified regression test or doc comment asserting they are INTENTIONALLY inert. Whichever data-contract choice is made for PRE/POST_CREATE/UPDATE (verbatim stale-fetchedEntity-discarded-return vs corrected toSaveData/response-threaded), pin it with a test asserting the CHOSEN contract.

### Risks

Data-contract fork for CREATE/UPDATE: the old engine's PRE/POST_CREATE/UPDATE handlers receive entityForm.fetchedEntity (stale pre-edit data) and their return value is silently discarded by the call site — this looks like a latent bug, not intentional design (it contradicts the FETCH_LIST pair's real transform-pipeline contract on the same generic executeClientExtensions primitive). 'Faithful' porting is ambiguous: reproduce the bug (handlers stay logging/side-effect-only forever) vs fix it (thread the real submit payload/post-save result through) — needs an explicit conductor call, not a silent pick. PRE_READ/POST_READ and PRE_DELETE/POST_DELETE are used by a REAL production consumer (gjcu FreshmanEntityForm.ts) but are provably never dispatched by the old engine's own CRUD flow — this is NOT the ContentAsset/Rule 'zero consumer usage' dead-code shape the mandate's exemption clause is written for; treating them as 'genuinely dead, exempt from porting' would cite the wrong precedent. They must be ported as builder methods at minimum, with the dispatch-site question (fix vs faithfully-leave-inert) called out separately. PRE_DELETE/POST_DELETE additionally cannot be wired regardless of that choice, because the new engine has no delete flow to attach to yet (a separate GAP-port item already pending a user decision) — this group's plan must state that dependency explicitly rather than quietly shipping delete extension points with no callers, or quietly building a delete flow as a side effect of this group. list-store.ts currently has no entityForm/session parameter at all — adding client-extension dispatch there necessarily changes CreateListStoreOptions' public shape; every existing call site should be re-checked for the addition being truly non-breaking. The old engine's clone() shallow-copies the clientExtensions Map (array references shared across clones) — a latent bug, benign under the old engine's declare-once-then-clone usage pattern; silently fixing it on port is a deviation from byte-for-byte fidelity and should be logged as such even though it is almost certainly the right call. Server-side extensions share the same ExtensionPoint enum (X-Extension-Point HTTP header in EntityForm.tsx:683-693's internalSave) — out of scope for this CLIENT group, but any enum port should keep the shared-vocabulary intent legible for a future server-extension port.

### Review Grouping (reviewGrouping)

Single dedicated review pass (own commit/PR), separate from any EA/EB/EC field-parity wave — this group is infrastructure-shaped (new schema-core hook axis + two new dispatch sites + one open delete-flow dependency + one open data-contract decision) rather than mechanical field-by-field porting, and the two 'inert in old engine but used by a real consumer' findings (READ, DELETE) need conductor sign-off on fix-vs-faithful BEFORE implementation starts, not after.

### LOC (scale estimate)

336

### Port Notes (portNotes)

Verdict on the mandate's opening question (overlap EF2/3/6, or genuinely distinct?): GENUINELY DISTINCT. EF2 (onChanges) is field-edit-time reactivity dispatched from store.setValue with a FormMutator, unrelated to CRUD actions. EF3 (onFetchData/onInitialize) is fetch/init-time, pure (EntityForm,data)=>EntityForm transforms with per-handler try/catch isolation, no session/priority/enabled/continueOnError model, no CREATE/UPDATE/DELETE coverage at all. EF6 (submitTransform) is a single-slot payload-shaping hook applied inside toSaveData(), unrelated to the old engine's PRE/POST_CREATE/UPDATE (which, per the fetchedEntity/discarded-return-value finding, do NOT actually shape the submit payload despite the superficial CREATE/UPDATE naming overlap with EF6's job). The CLIENT EXTENSION SYSTEM is a materially more generic, orthogonal hook axis: a ClientExtensionContext carrying session/user/entityForm, per-point HANDLER ARRAYS (not single-slot) with priority ordering + enabled/continueOnError options, covering 6 CRUD-adjacent lifecycle points that the EF-track hooks don't touch. Of those 6 points, only 2 pairs (FETCH_LIST, CREATE/UPDATE) are actually reachable in the old engine; READ and DELETE are provably inert there today despite being registered by a real production consumer (FreshmanEntityForm.ts). Recommend routing this group's implementation as its own follow-up phase (not folded into EA/EC field-porting waves) given the open design forks (data contract, delete-flow hard dependency) it surfaces — a mechanical 'port the file' pass is not sufficient here the way it was for most EA/EB field members.


---

<a id="group-8"></a>

## Group 8: PERMISSION & VISIBILITY

### Members

- EntityField.isPermitted() end-to-end 배선 — schema-core 예측(FormField.isPermitted/validate)은 이미 완료, render(FieldRenderer)와 save-payload(toSaveData) 두 지점이 미배선
- getViewableTabs(EntityFormBase.tsx:349-387) → ViewEntityForm.deriveTabs에 권한게이트 + '콘텐츠 없으면 숨김' 게이트 추가
- getViewableFieldGroups/isViewableFieldGroup(:428-535) → ViewEntityForm.deriveGroups에 권한게이트 + hasVisibleContent 신설
- getVisibleFields/getVisibleCollections(:537-625) → 기존 deriveGroupFields(필드+서브콜렉션 통합, EF4 OK-superseded) 재사용 + FieldRenderer 하드게이트로 실제 렌더 차단
- 탭/필드그룹 requiredPermissions → TabDef/FieldGroupDef에 필드 신설 + EntityForm.addFields() 입력에 배선(EC3-0의 tab.hidden 배선과 동일 패턴)
- PermissionPolicy usage → schema-core/src/permission.ts에 이미 canonical 구현 완료·index.ts export 완료. react/state는 import해서 쓰기만 하면 됨(신규 로직 불필요)

### Old Source (oldSource — citations into the 0.3.x/old engine)

- EntityFormBase.tsx:349-387 getViewableTabs — includeHide?, createStepFields?, session? → session에서 userPermissions 4-way 추출(session.roles ?? session.authentication.roles ?? this.session.roles ?? this.session.authentication.roles), 탭별 tab.isPermitted() 실패 시 skip, getViewableFieldGroups 결과 length>0 인 탭만 채택, order 정렬
- EntityFormBase.tsx:428-458 getViewableFieldGroups — tab.fieldGroups 순회하며 isViewableFieldGroup true인 id만 배열로 반환
- EntityFormBase.tsx:460-535 isViewableFieldGroup — fieldGroup.isPermitted() 실패시 즉시 false, 그다음 그룹 내 각 field: entityField.isPermitted() 실패시 continue, isHidden() false인 필드가 하나라도 있으면 viewable=true(break). update 렌더타입일 때 SubCollection도 동일 로직으로 체크(단, isPermitted 체크는 SubCollection엔 없음 — 구엔진 갭). `this instanceof EntityForm` 가드는 EntityFormBase/EntityForm 상속분리 잔재 — 신엔진엔 그 계층이 없어 이식 불필요
- EntityFormBase.tsx:537-586 getVisibleFields — field.isPermitted() → field.isHidden() → createStepFields 필터 순으로 필터링 후 order 정렬해 반환(실제 렌더 목록)
- EntityFormBase.tsx:588-625 getVisibleCollections — collection.isHidden()만 체크, isPermitted 체크 없음(구엔진 갭 — SubCollection 권한 미게이트). 신엔진 permission.ts 주석이 이미 charter C2로 이 갭을 닫기로 결정했음(EntityItem 베이스에 requiredPermissions 승격)
- EntityTab.ts:13,28-50 — requiredPermissions 필드 + withRequiredPermissions(머지, Set-dedup) + isPermitted(ANY-OF)
- EntityFieldGroup.ts:21,40-62 — 동일 패턴(EntityTab과 byte-for-byte 동일 predicate, permission.ts 주석이 이미 명시)
- FormField.tsx:853-861 isPermitted predicate — permission.ts:19-30로 이미 통합 이식 완료(1:1 동일 로직, 재확인 완료)
- FormField.tsx:790-795 validate() 내부 isPermitted 단락(hidden/readonly 다음, required 이전) — form-field.ts:120-126로 이미 이식 완료(unconditional, override로 우회 불가)
- EntityForm.tsx:842-930 getSubmitFormData, 특히 :909-916 — session에서 userPermissions 추출(2-way) 후 `for (const field of this.fields.values()) { if (!field.isPermitted(userPermissions)) continue; ... }` — 저장 payload에서 unpermitted 필드를 완전히 제외. 신엔진 toSaveData(form-store.ts:562-582)에 대응 로직 없음 — 라이브 보안갭
- ViewFieldGroup.tsx:148-203 — mount 시 getVisibleFields/getVisibleCollections로 필드·서브콜렉션 조회, showFields||showCollections 없으면 그룹 자체를 null 렌더(빈 그룹 숨김), 형제 그룹 중 isViewableFieldGroup true인 게 있으면 collapsable=true(UI 접기/펼치기 — 권한/가시성 스코프 밖, cosmetic)
- ViewTab.tsx:46-60, ViewTabPanel.tsx:35-45 — getViewableFieldGroups(tabId, createStepFields) 결과 length>0으로 탭 콘텐츠 존재 여부 판정(session 파라미터 없이 호출 — this.session 인스턴스 폴백에 의존하던 구조, 신엔진은 세션이 스토어/컨텍스트로 명시 전달되므로 구조적으로 불필요)
- CardItem.tsx:290-390 — list-track 카드뷰에서 getViewableTabs/getViewableFieldGroups/getVisibleFields/getVisibleCollections를 session과 함께 호출(권한 인지 리스트 카드 렌더). ViewListGrid.tsx는 audit 문서상 '별도 슬라이스(defer-documented)'로 명시돼 있어 본 그룹의 포트 대상에서 명시적으로 제외 — 근거는 documents/analysis/2026-07-11/entityform-api-audit.md의 defer-documented 절

### New Insertion (newInsertion — target location/plan in the new engine)

- packages/schema-core/src/entity-form.ts — TabDef에 `requiredPermissions?: string[]` 추가(EntityTab.requiredPermissions 대응), FieldGroupDef에 동일 추가(EntityFieldGroup.requiredPermissions 대응). AddFieldsInput.tab/.fieldGroup 객체에도 `requiredPermissions?: string[]` 추가. addFields() 본문에서 tab.hidden을 세팅하는 것과 동일한 스프레드 패턴(`...(input.tab?.hidden !== undefined ? {hidden: ...} : {})`)으로 requiredPermissions도 조건부 스프레드. clone()은 tabs/groups를 `{...v}` 얕은복사(:336-337)하므로 별도 수정 불필요 — 새 필드가 자동으로 따라감
- packages/react/src/components/FieldRenderer.tsx — `extractPermissions` import 추가(@listgrid/schema-core). 렌더 본문에서 `const permitted = field.isPermitted(extractPermissions(session));` (동기, 이미 session 변수 존재). effHidden 합성을 `const effHidden = !permitted || (metaOverride.hidden ?? hidden);`로 변경 — permission은 EF1 setMeta로도 우회 불가한 하드게이트(순서가 핵심: !permitted가 먼저 short-circuit)
- packages/react/src/components/ViewEntityForm.tsx — `isPermitted`, `extractPermissions` import(@listgrid/schema-core), `useSession` import(../providers/auth). deriveTabs/deriveGroups 시그니처에 `userPermissions: string[]` 파라미터 추가. `hasVisibleContent(fields, userPermissions)` 헬퍼 신설: `fields.some(f => f.hidden !== true && f.isPermitted(userPermissions))` — 정적 hidden===true + 동기 isPermitted만 체크(async 조건부 predicate는 FieldRenderer가 최종 렌더시 별도로 완전히 재평가하므로 이중 게이트). deriveTabs에 `.filter(t => isPermitted(t.requiredPermissions, userPermissions))`와 `.filter(t => deriveGroups(entityForm, fields, t.id, userPermissions).length > 0)` 체인 추가(EC3-0 tabHidden 필터 뒤에 이어붙임). deriveGroups에 `.filter(g => isPermitted(g.requiredPermissions, userPermissions))`와 `.filter(g => hasVisibleContent(deriveGroupFields(fields, tabId, g.id), userPermissions))` 추가. ViewEntityFormInner에서 `const session = useSession(); const userPermissions = extractPermissions(session);` 추가 후 deriveTabs/deriveGroups 호출에 전달. deriveGroupFields 자체는 미필터 유지(권한 최종판정은 FieldRenderer 하드게이트가 담당 — 이중 소스 오브 트루스 방지)
- packages/state/src/form-store.ts — `extractPermissions` import 추가. toSaveData() 루프에 `if (!field.isPermitted(userPermissions)) continue;` 삽입(exceptOnSave 체크 바로 다음). `userPermissions`는 클로저에 이미 있는 `session` 변수(:197)로부터 `extractPermissions(session)` — buildCtx가 이미 동일 session을 쓰는 것과 동일 패턴, 함수 진입부에서 한 번 계산해 재사용 가능

### Dependencies

- EF1 (반응형 META override, setMeta/getMeta, FieldRenderer의 effHidden/effRequired/effReadOnly 합성 패턴) — 완료. effHidden 합성 자리에 permission 하드게이트를 끼워 넣는 자리가 이미 마련돼 있음
- EC3-0 (TabDef.hidden + store.tabHidden 슬라이스 + deriveTabs 필터) — 완료. requiredPermissions는 동일 TabDef/addFields 확장 패턴을 그대로 반복
- AuthProvider/useSession (session 스레딩, 세션-부재 시 명시적 undefined 계약) — 완료, 그대로 재사용
- schema-core permission.ts (isPermitted/extractPermissions/mergeRequiredPermissions/PermissionPolicy) — 완료·index.ts export 완료
- schema-core EntityItem 베이스(requiredPermissions/isPermitted()/withRequiredPermissions) + FormField 구현(:105-107,200-203,237) + SubCollectionField가 FormField를 extends — 완료, charter C2(SubCollection도 권한 게이트) 이미 구조적으로 달성돼 있음
- schema-core FormField.validate()의 isPermitted 단락(:120-126, unconditional) — 완료, 신규 포트가 참고할 '오버라이드 불가' 순서의 근거

### Reuse Targets (reuseTargets)

- Reuse: packages/schema-core/src/permission.ts 전체(isPermitted/extractPermissions/mergeRequiredPermissions/PermissionPolicy) — 신규 구현 금지, import만
- Reuse: packages/schema-core/src/field/form-field.ts의 isPermitted()/validate() 하드게이트 순서를 FieldRenderer/toSaveData 포트의 근거 패턴으로 그대로 준용
- Reuse: packages/react/src/components/ViewEntityForm.tsx의 EC3-0 deriveTabs 필터체인 골격(:64-78) — requiredPermissions/hasVisibleContent 필터를 같은 체인에 이어붙임
- Reuse: packages/react/src/components/ViewListGrid.tsx deriveDefaultColumnNames(:84-98)의 '정적 hidden만 체크, async predicate는 구조 유도에 안 씀' 선례 — hasVisibleContent의 설계 근거로 명시적으로 인용
- Reuse: packages/react/src/providers/auth.tsx useSession() — 그대로 사용, 신규 provider 불필요

### Proof Needs (proofNeeds)

보안 관련 그룹 — role-gated hide 테스트 필수. (1) packages/react/src/__tests__/field-permission.test.tsx(신설, tab-hidden.test.tsx 명명 선례 준용): requiredPermissions 설정된 필드가 session 권한 없으면 FieldRenderer가 null 렌더 확인 + setMeta(name,{hidden:false})로 강제 override 시도해도 여전히 숨김(하드게이트 순서 회귀 테스트, EF1 우회 불가 확인). (2) packages/react/src/__tests__/tab-group-permission.test.tsx(신설): tab.requiredPermissions 불충족 시 탭바에서 탭 버튼 자체가 사라짐(EC3-0 tab-hidden.test.tsx와 동일 패턴), fieldGroup.requiredPermissions 불충족 시 legend/fieldset이 안 뜸, 모든 필드가 unpermitted인 그룹은 hasVisibleContent=false로 그룹 자체가 사라짐(빈 fieldset 렌더 금지) 확인. (3) packages/state/src/__tests__/permission.test.ts(신설): toSaveData()가 unpermitted 필드를 payload에서 제외함을 확인(EntityForm.tsx:909-916 parity) — 세션 없음/세션은 있지만 role 불일치/role 일치 3케이스. (4) packages/schema-core/src/__tests__/permission.test.ts(신설, 순수함수 단위테스트 현재 부재): isPermitted/extractPermissions/mergeRequiredPermissions 유닛 — EntityTab.test.ts/EntityFieldGroup.test.ts의 기존 케이스를 순수함수 버전으로 이식. (5) packages/schema-core/src/__tests__/entity-form.test.ts(또는 기존 파일 확장): addFields({tab:{requiredPermissions},fieldGroup:{requiredPermissions}})로 선언한 TabDef/FieldGroupDef가 getTabs()/getFieldGroups()에서 값을 유지하고 clone() 후에도 보존됨을 확인. (6) SubCollectionField가 charter C2로 새로 권한 게이트된 것 확인하는 회귀 테스트 1건(구엔진엔 없던 동작이므로 '리그레션'이 아니라 '신규 동작'임을 테스트명/주석에 명시).

### Risks

① 아키텍처 긴장: 구엔진 isViewableFieldGroup은 완전한 async isHidden predicate로 '탭/그룹에 보이는 콘텐츠가 있는가'를 판정했지만, 신엔진 deriveTabs/deriveGroups는 D4(필드 슬라이스 단위 구독) 보존을 위해 동기 함수로 남아있어야 함 — 정적 hidden===true + 동기 isPermitted만으로 근사(hasVisibleContent)하는 설계를 제안했고 ViewListGrid.deriveDefaultColumnNames 선례로 정당화했지만, 잔여 갭이 있음: 조건부(predicate) hidden으로만 숨겨진 필드는 구조 판정에서는 '있음'으로 카운트되므로 모든 필드가 조건부로 숨겨진 그룹/탭이 빈 채로 노출될 수 있음. 이 트레이드오프를 conductor가 명시적으로 승인해야 함(EC3-0 수준의 아키텍처 결정 필요, 단순 배선이 아님). ② FieldRenderer의 permission 하드게이트 순서(`!permitted || (metaOverride.hidden ?? hidden)`)가 뒤바뀌면(즉 metaOverride가 permission보다 먼저 체크되면) onChanges/onInitialize 핸들러가 setMeta(hidden:false)로 unpermitted 필드를 강제 노출시키는 보안 우회가 생김 — 순서 자체가 보안 요구사항이므로 반드시 회귀테스트로 고정. ③ toSaveData()는 현재 unpermitted 필드 배제 로직이 전혀 없는 상태로 이미 shipped — '이식 안 됨'이 아니라 '현재 살아있는 보안 갭'이므로 그룹 내 최우선 처리 후보. ④ getVisibleCollections가 구엔진에서 SubCollection에 permission 체크를 안 했던 것을, 신엔진은 charter C2(EntityItem 베이스 승격)로 의도적으로 확대 적용함 — 이것은 패리티 버그가 아니라 의도된 보안 강화이므로 리뷰 시 '회귀'로 오인하지 않도록 주석/커밋 메시지에 명시 필요. ⑤ createStepFields(위저드 단계별 필드 필터)는 charter C6 미구현 기능에 종속되므로 본 그룹 포트에서 의도적으로 제외 — 별도 위저드 슬라이스가 착수될 때 함께 포트. ⑥ includeHide 파라미터는 구엔진 실사용처 전수 조사 결과 모든 콜사이트가 `false`만 넘겼음(진짜 dead는 아니고 '선언됐지만 true로 쓰인 적 없음') — 완전성을 위해 옵션 파라미터로만 열어두고 우선순위는 낮게.

### Review Grouping (reviewGrouping)

PR1(보안 핫픽스, 최우선·독립): form-store.ts toSaveData permission 배선 — 가장 작고 리스크 낮음, 즉시 머지 가능. PR2(보안 핫픽스, 독립): FieldRenderer.tsx permission 하드게이트 — EF1 우회불가 순서 회귀테스트 필수 동반. PR3(무위험 데이터 확장, PR4 선행): schema-core entity-form.ts TabDef/FieldGroupDef.requiredPermissions + addFields 배선 — 동작 변화 없음(소비하는 곳이 없으면 no-op), 리뷰 가볍게. PR4(구조 변경, 가장 큼, conductor 승인 후 착수): ViewEntityForm.tsx deriveTabs/deriveGroups의 hasVisibleContent 근사 게이트 — sync-approximation 트레이드오프를 PR 설명에 명시하고 잔여갭 특성화 테스트를 별도 이슈로 남길 것. PR1·PR2는 서로 독립이라 병렬 가능, PR4는 PR3 머지 후 착수.

### LOC (scale estimate)

160

### Port Notes (portNotes)

구엔진 EntityFormBase.tsx:349-625 블록 전체가 '탭→필드그룹→필드/서브콜렉션' 3단 가시성 캐스케이드 하나의 로직이고, 신엔진에서는 이미 EC3-0(tab.hidden)이 그중 1단(탭 자체 숨김)만 포트해놓은 상태 — 이번 그룹은 나머지 2단(권한 게이트 + '콘텐츠 없으면 숨김' 게이트)을 EC3-0과 같은 파일·같은 함수(deriveTabs/deriveGroups)에 이어붙이는 확장 작업이라 신규 파일/신규 컴포넌트가 필요 없음. schema-core 쪽(TabDef/FieldGroupDef/permission.ts/EntityItem)은 이미 거의 완비돼 있어 이번 그룹의 실작업 무게중심은 packages/react(FieldRenderer, ViewEntityForm)와 packages/state(form-store.toSaveData) 3개 파일. 구현 순서 제안: toSaveData 배선(보안, 독립적, 가장 작음) → FieldRenderer 하드게이트(보안, 독립적, 작음) → TabDef/FieldGroupDef+addFields(순수 데이터 확장, 무위험) → ViewEntityForm deriveTabs/deriveGroups 확장(가장 크고, hasVisibleContent 근사 결정이 conductor 승인 필요). 테스트 파일명은 기존 tab-hidden.test.ts(x) 명명 관례를 그대로 따를 것.


---

