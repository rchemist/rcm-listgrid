import type {
  HelpTextType,
  HiddenType,
  LabelType,
  PlaceHolderType,
  ReadOnlyType,
  RequiredType,
} from './conditional';
import type { FieldEvalContext } from './eval-context';
import type { FieldType, FieldValue } from './types';
import type { ViewPreset } from './view-preset';
import type { Validation, ValidateResult } from '../validation';

/**
 * The shared base for every declarable form item — fields, tabs, field groups,
 * and sub-collections. Transplanted from src/listgrid/config/EntityItem.ts (0.3.x)
 * with two structural changes:
 *
 *   1. PURE META ONLY (ADR-0003 §Decision 1): render members are gone. `view()`,
 *      `overrideRender`, `displayFunc`, and the ReactNode-resolving `getHelpText()`
 *      / `getTooltip()` methods move to the renderer layer. Declarations that
 *      merely CARRY a ReactNode (`label`, `helpText`) stay — they are type-only
 *      React (ADR-0003 §5). Predicates that resolve BOOLEAN conditions
 *      (`isHidden`/`isReadonly`) stay: they are pure over meta + context.
 *
 *   2. PERMISSION LIFTED TO THE BASE (charter C2): `requiredPermissions` +
 *      `isPermitted()` lived only on EntityField in 0.3.x, leaving SubCollections
 *      ungated. Lifting them here closes that gap — every item kind inherits the
 *      one canonical rule (see ../permission).
 *
 * All predicates take {@link FieldEvalContext} instead of the 0.3.x
 * EntityForm-carrying `FieldInfoParameters` (ADR-0003 §Decision 4).
 */
export interface EntityItem {
  order: number;
  name: string;
  label?: LabelType;
  helpText?: HelpTextType;
  hidden?: HiddenType;
  readonly?: ReadOnlyType;
  hideLabel?: boolean;
  /** layout placement — which tab / field-group this item renders under. */
  form?: { tabId: string; fieldGroupId: string };
  /** permission gate (lifted from EntityField — closes the SubCollection gap, charter C2). */
  requiredPermissions?: string[];

  // --- pure getters ---
  getOrder(): number;
  getName(): string;
  getLabel(): LabelType;
  getTabId(): string;
  getFieldGroupId(): string;

  // --- pure predicates (over meta + context) ---
  isHidden(ctx: FieldEvalContext): Promise<boolean>;
  isReadonly(ctx: FieldEvalContext): Promise<boolean>;
  /** ANY-OF permission check — see ../permission isPermitted. */
  isPermitted(userPermissions?: string[]): boolean;

  // --- chainable builders (charter C1 `withXxx` grammar) ---
  withViewPreset(preset: ViewPreset): this;
  withRequiredPermissions(...permissions: string[]): this;

  /** structural clone; `includeValue` copies the value slice (declaration copy). */
  clone(includeValue?: boolean): this;
}

/**
 * A single field's pure metadata (charter C1/C4). The React-free half of the
 * 0.3.x `EntityField` (config/EntityField.ts) — render members
 * (`view`/`overrideRender`/`displayFunc`) are NOT here; they register with the
 * FieldRenderer registry in @listgrid/react (ADR-0003 §Decision 2). The runtime
 * value lives in the form store as a {@link FieldValueSlice}; `value` here is the
 * declaration seed only.
 *
 * NOTE (scope): this is the P3-1 contract skeleton — the essential meta surface
 * that fixes the architecture. The exhaustive per-member disposition of the full
 * 0.3.x interface (~30 members) is settled by the P3-4 surface audit and ported
 * field-by-field in P4/P5 under the P2 characterization oracle.
 */
export interface EntityField<TValue = unknown> extends EntityItem {
  type: FieldType;
  /** declaration seed value (current/fetched/default); runtime state lives in the store slice. */
  value?: FieldValue<TValue>;
  placeHolder?: PlaceHolderType;
  required?: RequiredType;
  validations?: Validation[];
  /** exclude this field's value from the save payload. */
  exceptOnSave?: boolean;
  /**
   * opaque render-facing passthrough (0.3.x EntityField.attributes). Kept as
   * schema-core opaque data — never interpreted here; consumed by renderers.
   */
  attributes?: Map<string, unknown>;

  // --- pure predicate ---
  isRequired(ctx: FieldEvalContext): Promise<boolean>;

  // NOTE: dirty/blank/current-value are pure functions over the runtime value
  // slice (../field/value.ts: isDirty/isBlank/getCurrentValue) — NOT instance
  // methods, because the value lives in the form store, not on the field
  // (ADR-0002 §Decision 1 value/meta separation).

  /**
   * Run this field's declared validations (+ required-blank check) against the
   * eval context (ctx.value = the field's current value slice). Transplant of
   * FormField.validate:779-823 — returns the failing results (empty = valid).
   */
  validate(ctx: FieldEvalContext): Promise<ValidateResult[]>;

  // --- chainable builders ---
  withRequired(required?: RequiredType): this;
  withValidations(...validations: Validation[]): this;
  withPlaceHolder(placeHolder?: PlaceHolderType): this;
  withValue(value: TValue): this;
}
