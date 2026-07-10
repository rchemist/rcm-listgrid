import {
  extractPermissions,
  isPermitted as permitCheck,
  mergeRequiredPermissions,
} from '../permission';
import type { Validation } from '../validation';
import { ValidateResult } from '../validation';
import { requiredMessage } from '../util/korean';
import {
  getConditionalBoolean,
  type HelpTextType,
  type HiddenType,
  type LabelType,
  type PlaceHolderType,
  type ReadOnlyType,
  type RequiredType,
  type TooltipType,
} from './conditional';
import type { EntityField } from './entity-field';
import type { FieldEvalContext } from './eval-context';
import type { FieldMetaOverride } from './field-meta';
import type { FieldType, FieldValue } from './types';
import { isBlank } from './value';
import type { ViewPreset } from './view-preset';

/**
 * Abstract base for every concrete field class (charter C1/C4). The React-free
 * successor to the 0.3.x FormField
 * (src/listgrid/components/fields/abstract/FormField.tsx) — but PURE META only:
 *
 *   - render members (view/renderInstance/renderListItemInstance) are gone; the
 *     renderer layer (@listgrid/react) registers per-type components (ADR-0003).
 *   - the RUNTIME value lives in the form store; `value` here is only the
 *     declaration seed (default via withDefaultValue). dirty/blank/current are
 *     pure functions over the store slice (./value), not methods here (ADR-0002).
 *
 * Predicates take {@link FieldEvalContext} (ADR-0003 §4). The chainable withXxx
 * builders are the charter-C1 declaration grammar.
 */
export abstract class FormField<TValue = unknown> implements EntityField<TValue> {
  order: number;
  name: string;
  type: FieldType;

  label?: LabelType;
  helpText?: HelpTextType;
  tooltip?: TooltipType;
  hidden?: HiddenType;
  readonly?: ReadOnlyType;
  required?: RequiredType;
  placeHolder?: PlaceHolderType;
  hideLabel?: boolean;
  validations?: Validation[];
  requiredPermissions?: string[];
  exceptOnSave?: boolean;
  dependsOn?: string[];
  attributes?: Map<string, unknown>;
  value?: FieldValue<TValue>;
  form?: { tabId: string; fieldGroupId: string };

  protected constructor(name: string, order: number, type: FieldType) {
    this.name = name;
    this.order = order;
    this.type = type;
  }

  // --- getters ---
  getName(): string {
    return this.name;
  }
  getOrder(): number {
    return this.order;
  }
  getLabel(): LabelType {
    return this.label ?? this.name;
  }
  getTabId(): string {
    return this.form?.tabId ?? '';
  }
  getFieldGroupId(): string {
    return this.form?.fieldGroupId ?? '';
  }

  // --- pure predicates (over meta + context) ---
  async isHidden(ctx: FieldEvalContext): Promise<boolean> {
    return getConditionalBoolean(ctx, this.hidden);
  }
  async isReadonly(ctx: FieldEvalContext): Promise<boolean> {
    return getConditionalBoolean(ctx, this.readonly);
  }
  async isRequired(ctx: FieldEvalContext): Promise<boolean> {
    return getConditionalBoolean(ctx, this.required);
  }
  isPermitted(userPermissions?: string[]): boolean {
    return permitCheck(this.requiredPermissions, userPermissions);
  }

  /**
   * Run required-blank check + declared validations. Transplant of
   * FormField.validate:779-823 — hidden/readonly/unpermitted fields skip
   * validation; required-blank short-circuits; returns failing results only.
   *
   * `override` (EF1) is the imperative per-field meta override held in the
   * form store: when a key is set (non-undefined) it WINS over the
   * declared/predicate-resolved value. `??` is deliberate here — it lets an
   * explicit `false` override win (only `undefined` falls through to the
   * predicate), unlike `||` which would treat `false` as "not set".
   */
  async validate(ctx: FieldEvalContext, override?: FieldMetaOverride): Promise<ValidateResult[]> {
    const hidden = override?.hidden ?? (await this.isHidden(ctx));
    const readonly = override?.readonly ?? (await this.isReadonly(ctx));
    if (hidden || readonly) return [];
    if (!this.isPermitted(extractPermissions(ctx.session))) {
      return [];
    }

    const required = override?.required ?? (await this.isRequired(ctx));
    if (required) {
      if (isBlank(ctx.value, ctx.renderType)) {
        const label =
          typeof this.getLabel() === 'string' ? String(this.getLabel()) : this.getName();
        return [ValidateResult.fail(requiredMessage(label))];
      }
    }

    const validations = override?.validations ?? this.validations;
    const results: ValidateResult[] = [];
    if (validations && validations.length > 0) {
      for (const v of validations) {
        const r = await v.validate(ctx, ctx.value, v.message);
        if (r.hasError()) results.push(r);
      }
    }
    return results;
  }

  // --- chainable builders (charter C1 withXxx grammar) ---
  withLabel(label?: LabelType): this {
    if (label !== undefined) this.label = label;
    return this;
  }
  withRequired(required?: RequiredType): this {
    this.required = required === undefined ? true : required;
    return this;
  }
  withReadOnly(readOnly?: ReadOnlyType): this {
    this.readonly = readOnly === undefined ? true : readOnly;
    return this;
  }
  withHidden(hidden?: HiddenType): this {
    if (hidden !== undefined) this.hidden = hidden;
    else delete this.hidden;
    return this;
  }
  withPlaceHolder(placeHolder?: PlaceHolderType): this {
    if (placeHolder !== undefined) this.placeHolder = placeHolder;
    else delete this.placeHolder;
    return this;
  }
  withHelpText(helpText?: HelpTextType): this {
    if (helpText !== undefined) this.helpText = helpText;
    else delete this.helpText;
    return this;
  }
  withTooltip(tooltip?: TooltipType): this {
    if (tooltip !== undefined) this.tooltip = tooltip;
    else delete this.tooltip;
    return this;
  }
  withHideLabel(hideLabel = true): this {
    this.hideLabel = hideLabel;
    return this;
  }
  withValidations(...validations: (Validation | undefined)[]): this {
    this.validations = validations.filter((v): v is Validation => v !== undefined);
    return this;
  }
  /** Declare the sibling fields this field's conditionals read (cross-field cascade). */
  withDependsOn(...names: string[]): this {
    this.dependsOn = names;
    return this;
  }
  withRequiredPermissions(...permissions: string[]): this {
    this.requiredPermissions = mergeRequiredPermissions(this.requiredPermissions, permissions);
    return this;
  }
  withViewPreset(preset: ViewPreset): this {
    if (preset.readonly !== undefined) this.readonly = preset.readonly;
    if (preset.hidden !== undefined) this.hidden = preset.hidden;
    return this;
  }
  withForm(form: { tabId: string; fieldGroupId: string }): this {
    this.form = form;
    return this;
  }
  withOrder(order: number): this {
    this.order = order;
    return this;
  }
  /** Set the declaration default (seeds the store slice's default+current). */
  withDefaultValue(value: TValue): this {
    const next: FieldValue<TValue> = { default: value };
    const fetched = this.value?.fetched;
    if (fetched !== undefined) next.fetched = fetched;
    const currentSource = this.value?.current ?? value;
    if (currentSource !== undefined) next.current = currentSource;
    this.value = next;
    return this;
  }
  /** Set the current declaration value. Transplant of FormField.withValue:647-670. */
  withValue(value: TValue): this {
    this.value = { ...this.value, current: value };
    return this;
  }

  /** Structural declaration clone; drops the value unless includeValue. */
  clone(includeValue = false): this {
    const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this) as this;
    if (this.validations) copy.validations = [...this.validations];
    if (this.requiredPermissions) copy.requiredPermissions = [...this.requiredPermissions];
    if (includeValue && this.value) {
      copy.value = { ...this.value };
    } else {
      delete copy.value;
    }
    return copy;
  }
}
