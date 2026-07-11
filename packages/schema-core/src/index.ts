// @listgrid/schema-core — EntityForm declarations, field metadata, validation,
// SearchForm, permission gating — React-free (charter C7; lint-enforced in P4).
//
// Re-foundation transplant target (ADR-0008). Verified 0.3.x logic is moved here
// module-by-module under the P2 characterization oracle. P3-1 lands the CONTRACT
// SKELETON: the pure-meta field interface, the runtime value slice, the eval
// context, the field vocabulary, the unified permission gate, and the validation
// base. Concrete field/validation transplants follow in P4/P5.

// --- auth (host-injected contract) ---
export type { Session, SessionUser } from './auth';

// --- field vocabulary + value ---
export type { FieldType, RenderType, FieldValue, FieldError, FieldValueSlice } from './field/types';
export type { FieldEvalContext } from './field/eval-context';
export type {
  OptionalBoolean,
  OptionalString,
  OptionalReactNode,
  ValuedBoolean,
  ValuedString,
  ValuedReactNode,
  ConditionalBooleanValue,
  ConditionalStringValue,
  ConditionalReactNodeValue,
  RequiredType,
  HiddenType,
  ReadOnlyType,
  PlaceholderType,
  LabelType,
  HelpTextType,
  TooltipType,
} from './field/conditional';
export {
  getConditionalBoolean,
  getConditionalString,
  getStaticConditionalBoolean,
} from './field/conditional';

// --- view presets ---
export type { ViewPreset, ViewPresetType } from './field/view-preset';
export {
  ALWAYS,
  HIDDEN,
  ADD_ONLY,
  MODIFY_ONLY,
  VIEW_ONLY,
  LIST_ONLY,
  VIEW_HIDDEN,
  HAS_VALUE_READONLY,
  HAS_VALUE_HIDDEN,
  getViewPreset,
} from './field/view-preset';

// --- field meta contract ---
export type { EntityItem, EntityField } from './field/entity-field';
export type { FieldMetaOverride } from './field/field-meta';

// --- imperative lifecycle: onChange cascade (EF2) ---
export type { FormMutator, ChangeHandler } from './field/form-mutator';

// --- permission policy (unified) ---
export { isPermitted, extractPermissions, mergeRequiredPermissions } from './permission';

// --- validation contract ---
export type { Validation } from './validation';
export { ValidateResult, ValidationItem } from './validation';

// --- validations catalog (concrete validations; transplanted from
// src/listgrid/validations/*.ts 0.3.x under the P2 characterization oracle) ---
export { RegexValidation } from './validations/regex-validation';
export { EmailValidation } from './validations/email-validation';
export { RegexFormulaValidation } from './validations/regex-formula-validation';
export { MinMaxNumberValidation } from './validations/min-max-number-validation';
export { StringValidation } from './validations/string-validation';
export { PhoneNumberValidation } from './validations/phone-number-validation';
export { TelephoneNumberValidation } from './validations/telephone-number-validation';
export { PasswordValidation } from './validations/password-validation';
export { IpAddressValidation, RegexAllowedIpAddr } from './validations/ip-address-validation';
export { CustomValidation } from './validations/custom-validation';

// --- regex constants the validations catalog is built on (React-free,
// verbatim from src/listgrid/misc/index.ts 0.3.x) ---
export {
  RegexEmailAddress,
  RegexPhoneNumber,
  RegexTelephoneNumber,
  RegexPasswordNormal,
} from './util/regex';

// --- runtime value-slice operations (pure fns over the store slice, ADR-0002) ---
export { getCurrentValue, isBlank, isDirty, normalizeEmptyValue, resetValue } from './field/value';

// --- URL classification (EA-C0 pre-stage; consumers: File/Image field
// external-URL bypass, ea-c-scout-briefing.md decision ⑥) ---
export { isExternalUrl } from './util/url';

// --- shared File/Image upload constraint config (EA-C0 pre-stage; consumers:
// FileField/ImageField, EA-C fan-out) ---
export type { AssetConfig } from './field/asset-config';

// --- phone formatting (EA-B0 PART D item 5; TelephoneNumberField consumer) ---
export { formatPhoneNumber, removePhoneNumberHyphens } from './util/phone-util';

// --- field classes (meta; render lives in @listgrid/react) ---
export { FormField } from './field/form-field';
export {
  StringField,
  EmailField,
  PhoneNumberField,
  BooleanField,
  NumberField,
  TextareaField,
  MarkdownField,
  DateField,
  SelectField,
} from './field/basic-fields';
export type { MinMaxLimit, MinMaxStringLimit, SelectOption } from './field/basic-fields';
export { ManyToOneField } from './field/many-to-one-field';
export type { ManyToOneConfig } from './field/many-to-one-field';
export { SubCollectionField } from './field/sub-collection-field';
export type { SubCollectionConfig } from './field/sub-collection-field';

// --- options-carrying field bases (EA-A0 pre-stage; consumers: Checkbox/
// MultiSelect/Tag, EA-A fan-out) ---
export { OptionsField, MultiOptionsField } from './field/options-field';

// --- EA-A trivial field classes (one class + one renderer file each; renderers
// register in @listgrid/react default-renderers) ---
export { CheckboxField } from './field/checkbox-field';
export type { CheckboxComboProps } from './field/checkbox-field';
export { MultiSelectField } from './field/multi-select-field';
export { PasswordField } from './field/password-field';
export type {
  PasswordFieldProps,
  PasswordStrength,
  PasswordStrengthRule,
} from './field/password-field';
export { MonthField } from './field/month-field';
export { YearField } from './field/year-field';
export { TimeField } from './field/time-field';
export type { TimeFieldValue } from './field/time-field';
export { LinkField } from './field/link-field';
export { TagField } from './field/tag-field';
export type { TagValidationResult } from './field/tag-field';
export { ColorPresetField } from './field/color-preset-field';
export { MessageViewField } from './field/message-view-field';
export { ProfileField } from './field/profile-field';
export { MappedJoinField } from './field/mapped-join-field';

// --- EA-C upload field classes (plain string/string[] values; upload HTTP is
// host-owned via the UIComponents.FileInput slot — ea-c-scout-briefing.md) ---
export { FileField } from './field/file-field';
export { ImageField } from './field/image-field';
export { MultipleAssetField } from './field/multiple-asset-field';
export type { AssetItem } from './field/multiple-asset-field';

// --- EA-B moderate field classes ---
export { DatetimeField } from './field/datetime-field';
export type { DatetimeFieldValue } from './field/datetime-field';
export { CustomOptionField } from './field/custom-option-field';
export type { CustomOptionComboProps, CustomOptionLayout } from './field/custom-option-field';
export { BirthdayField } from './field/birthday-field';
export { TelephoneNumberField } from './field/telephone-number-field';
export { ColorField } from './field/color-field';

// --- EA-D InlineMap (single delegate; store-direct-write redesign, no
// pendingRef — ea-d-scout-briefing.md PART B/D) ---
export { InlineMapField } from './field/inline-map-field';
export type { InlineMapConfig, InlineMapValue, MapKey, KeyValue } from './field/inline-map-field';

// --- EA-D2-1 Xref (plain views only; ea-d2-xref-major-briefing.md §1/§2/§4
// — supportPriority/add NOT ported, filters narrowed to single-function-form
// only, correcting the 0.3.x FilterItem[]|fn union / gjcu degrees [fn] bug) ---
export { XrefMappingField } from './field/xref-mapping-field';
export type { XrefMappingConfig, XrefMappingValue } from './field/xref-mapping-field';
export { XrefPreferMappingField } from './field/xref-prefer-mapping-field';
export type {
  XrefPreferMappingConfig,
  XrefPreferMappingValue,
} from './field/xref-prefer-mapping-field';

// --- EB1/EB2 Address (Daum 우편번호 composite handle + flat siblings — plan §EB) ---
export { AddressField, applyFullAddressFields, addressSiblingNames } from './field/address-field';
export type { Address, AddressFieldsProps, AddressSiblingNames } from './field/address-field';

// --- EntityForm declaration (charter C1) ---
export { EntityForm } from './entity-form';
export type { FieldGroupDef, TabDef, AddFieldsInput, Capabilities } from './entity-form';

// --- create-mode wizard (spec §3.2, C6; W4-2 — withSteps/getSteps declared
// on EntityForm above; StepDef.hidden reuses ConditionalBooleanValue, CAP-10) ---
export type { StepDef } from './entity-form';

// --- imperative lifecycle: consolidated init/fetch hook (spec §3.3/§4.1
// `onInit`; W2-1 — dispatched by initializeFormStore, @listgrid/state) ---
export type { InitContext, InitHandler } from './entity-form';

// --- imperative lifecycle: save/delete hooks (spec §4.1/§6.2; W2-5 —
// dispatched by createFormController, @listgrid/state/form-controller.ts;
// successor to the EF6 submit-transform single-slot) ---
export type {
  BeforeSaveContext,
  AfterSaveContext,
  BeforeDeleteContext,
  AfterDeleteContext,
  BeforeSaveHandler,
  AfterSaveHandler,
  BeforeDeleteHandler,
  AfterDeleteHandler,
} from './entity-form';

// --- imperative lifecycle: list-fetch hooks (spec §4.1; W2-6 — dispatched
// by createListStore's fetch(), @listgrid/state/list-store.ts) ---
export type {
  BeforeListFetchContext,
  AfterListFetchContext,
  BeforeListFetchHandler,
  AfterListFetchHandler,
} from './entity-form';

// --- FormRuntime (save/delete/reload/validate contract; spec §6.2; W2-5 —
// structural interface only, implemented by createFormController in
// @listgrid/state/form-controller.ts) ---
export type { FormRuntime, SaveOutcome, DeleteOutcome } from './form-runtime';

// --- form actions (spec §3.4, CAP-09; W3-3 — addAction/getActions declared
// here; built-in Save/Delete merge + visible/enabled/render resolution is
// @listgrid/react's ViewEntityForm) ---
export type { FormAction, ActionContext, ActionRender } from './entity-form';

// --- onChanges builder catalog (EF2; port of 0.3.x
// src/listgrid/config/OnChangeEntityForm.ts:76-361 — changeHidden/
// changeRequired/changeSelectOptions only; derivedValidations is out of
// scope, later task) ---
export { changeHidden } from './onchanges/change-hidden';
export type { ConditionalMetaClause } from './onchanges/change-hidden';
export { changeRequired } from './onchanges/change-required';
export { changeSelectOptions } from './onchanges/change-select-options';
export type { ConditionalSelectOptionsClause } from './onchanges/change-select-options';

// --- SearchForm (list query model, charter C9) ---
export { SearchForm } from './search/search-form';
export type {
  Direction,
  SortSpec,
  QueryConditionType,
  FilterItem,
  SearchFormJSON,
} from './search/search-form';

// --- backend adapter contract (ADR-0005; impls in @listgrid/backend-*) ---
export type { PageResult, BackendErrorCode, BackendError, BackendAdapter } from './backend/adapter';
