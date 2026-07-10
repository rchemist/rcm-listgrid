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

// --- permission policy (unified) ---
export {
  PermissionPolicy,
  isPermitted,
  extractPermissions,
  mergeRequiredPermissions,
} from './permission';

// --- validation contract (base only; concretes ported in P4) ---
export type { Validation } from './validation';
export { ValidateResult, ValidationItem } from './validation';

// P1-5 workspace-wiring marker — apps/sample imports this to prove the
// @listgrid/* workspace path resolves. Now shipping real contract modules.
export const SCHEMA_CORE_VERSION = '0.0.0';
