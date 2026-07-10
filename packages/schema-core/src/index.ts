// @listgrid/schema-core — EntityForm declarations, field metadata, validation,
// SearchForm, PermissionPolicy — React-free (charter C7; lint-enforced in P4).
//
// Re-foundation transplant target (ADR-0008). Verified 0.3.x logic is moved here
// module-by-module under the P2 characterization oracle. P3-1 lands the CONTRACT
// SKELETON: the pure-meta field interface, the runtime value slice, the eval
// context, the field vocabulary, the unified PermissionPolicy, and the validation
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
  PlaceHolderType,
  LabelType,
  HelpTextType,
  TooltipType,
} from './field/conditional';
export { getConditionalBoolean, getConditionalString } from './field/conditional';

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

// --- imperative lifecycle: onChanges cascade (EF2) ---
export type { FormMutator, OnChangesHandler } from './field/form-mutator';

// --- permission policy (unified) ---
export {
  PermissionPolicy,
  isPermitted,
  extractPermissions,
  mergeRequiredPermissions,
} from './permission';

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
export { isEquals, isEqualCollection } from './util/compare';

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
export type { MinMaxLimit, SelectOption } from './field/basic-fields';
export { ManyToOneField } from './field/many-to-one-field';
export type { ManyToOneConfig } from './field/many-to-one-field';
export { SubCollectionField } from './field/sub-collection-field';
export type { SubCollectionConfig } from './field/sub-collection-field';

// --- EntityForm declaration (charter C1) ---
export { EntityForm } from './entity-form';
export type { FieldGroupDef, TabDef, AddFieldsInput } from './entity-form';

// --- imperative lifecycle: fetch/init hooks (EF3; dispatched by
// initializeFormStore, @listgrid/state) ---
export type { OnFetchDataHandler, OnInitializeHandler } from './entity-form';

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

// P1-5 workspace-wiring marker — apps/sample imports this to prove the
// @listgrid/* workspace path resolves. Now shipping real contract modules.
export const SCHEMA_CORE_VERSION = '0.0.0';
