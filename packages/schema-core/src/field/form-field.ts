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
  type PlaceholderType,
  type ReadOnlyType,
  type RequiredType,
  type TooltipType,
} from './conditional';
import type { EntityField } from './entity-field';
import type { FieldEvalContext } from './eval-context';
import type { FieldMetaOverride } from './field-meta';
import type { FieldFilterConfig, FieldListConfig } from './list-config';
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
  readOnly?: ReadOnlyType;
  required?: RequiredType;
  placeholder?: PlaceholderType;
  hideLabel?: boolean;
  validations?: Validation[];
  requiredPermissions?: string[];
  exceptOnSave?: boolean;
  dependsOn?: string[];
  /**
   * Render-suppression marker (Phase EB — conductor-settled, NOT `hidden`; see
   * `AddressField`/`applyFullAddressFields`, `address-field.ts`, for the full argument). When
   * set, names the composite field (by `name`) whose OWN renderer (e.g. the `@listgrid/react`
   * `AddressFieldRenderer`) already renders this field's editor — so standalone form
   * iteration (`ViewEntityForm`) skips it. Deliberately orthogonal to `hidden`:
   * `FormField.validate()` does NOT consult `renderedBy` — a `renderedBy` field's
   * required/validations still run exactly as if it were rendered standalone. Only the
   * RENDER layer (outside schema-core, charter C4) is suppression's business.
   */
  renderedBy?: string;
  attributes?: Map<string, unknown>;
  value?: FieldValue<TValue>;
  form?: { tabId: string; fieldGroupId: string };
  /**
   * List/filter declaration substrate (spec §5.1; W5-1 — purely additive,
   * nothing consumes these yet). `undefined` = never declared; `false` =
   * explicit exclude; an object = opt-in with that override config. See
   * {@link withList}/{@link withFilter} below.
   */
  private listConfig?: FieldListConfig | false | undefined;
  private filterConfig?: FieldFilterConfig | false | undefined;

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
  async isReadOnly(ctx: FieldEvalContext): Promise<boolean> {
    return getConditionalBoolean(ctx, this.readOnly);
  }
  async isRequired(ctx: FieldEvalContext): Promise<boolean> {
    return getConditionalBoolean(ctx, this.required);
  }
  isPermitted(userPermissions?: string[]): boolean {
    return permitCheck(this.requiredPermissions, userPermissions);
  }

  /**
   * Public extension seam (spec §5.2): contributes this field's save-payload
   * entry as a keyed map. Base impl — every ordinary field saves under its
   * own name. `ManyToOneField` overrides this to flatten to `<name>Id`
   * (many-to-one-field.ts). `toSaveData` (@listgrid/state) merges every
   * field's contribution with `Object.assign`, then applies dotted-name
   * nesting in one pass — this method does NOT nest dotted names itself.
   * `ctx` is unread here; it exists so a custom field's override can read
   * sibling values/session/renderType (same context `validate` receives).
   */
  serializeValue(value: TValue, _ctx: FieldEvalContext): Record<string, unknown> {
    return { [this.getName()]: value };
  }

  /**
   * Run required-blank check + declared validations. Transplant of
   * FormField.validate:779-823 — hidden/readOnly/unpermitted fields skip
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
    const readOnly = override?.readOnly ?? (await this.isReadOnly(ctx));
    if (hidden || readOnly) return [];
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
    this.readOnly = readOnly === undefined ? true : readOnly;
    return this;
  }
  withHidden(hidden?: HiddenType): this {
    if (hidden !== undefined) this.hidden = hidden;
    else delete this.hidden;
    return this;
  }
  withPlaceholder(placeholder?: PlaceholderType): this {
    if (placeholder !== undefined) this.placeholder = placeholder;
    else delete this.placeholder;
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
  /** Mark this field as rendered by the named composite field's renderer — see the
   *  `renderedBy` member doc above for the full suppression-vs-hidden argument. */
  withRenderedBy(name: string): this {
    this.renderedBy = name;
    return this;
  }
  withRequiredPermissions(...permissions: string[]): this {
    this.requiredPermissions = mergeRequiredPermissions(this.requiredPermissions, permissions);
    return this;
  }
  withViewPreset(preset: ViewPreset): this {
    if (preset.readOnly !== undefined) this.readOnly = preset.readOnly;
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

  /**
   * Declare this field's list-column participation (spec §5.1 — opt-in, no
   * magic fallback). Omitting the call entirely leaves it `undefined`
   * (not declared); `withList(false)` explicitly excludes the field;
   * `withList()`/`withList({...})` opts in with the given override config
   * (default `{}`). Replaces the 0.3.x useListField/withListConfig/
   * useListFields/withExcludeListFields quartet. Consumption (column
   * derivation/sorting) is W5-2 — this method only stores the declaration.
   */
  withList(config: FieldListConfig | false = {}): this {
    this.listConfig = config;
    return this;
  }
  getListConfig(): FieldListConfig | false | undefined {
    return this.listConfig;
  }
  /**
   * Declare this field's advanced-search participation (spec §5.1).
   * Same opt-in/exclude/undeclared tri-state as {@link withList}.
   * Consumption (filter panel, `SearchForm` mapping) is W5-3.
   */
  withFilter(config: FieldFilterConfig | false = {}): this {
    this.filterConfig = config;
    return this;
  }
  getFilterConfig(): FieldFilterConfig | false | undefined {
    return this.filterConfig;
  }

  /** Structural declaration clone; drops the value unless includeValue. */
  clone(includeValue = false): this {
    const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this) as this;
    if (this.validations) copy.validations = [...this.validations];
    if (this.requiredPermissions) copy.requiredPermissions = [...this.requiredPermissions];
    // listConfig/filterConfig are object-or-false-or-undefined: only the
    // object case needs a fresh copy (false/undefined are primitives —
    // Object.assign above already carried them over with no aliasing risk).
    if (this.listConfig && typeof this.listConfig === 'object') {
      copy.listConfig = { ...this.listConfig };
    }
    if (this.filterConfig && typeof this.filterConfig === 'object') {
      copy.filterConfig = { ...this.filterConfig };
    }
    if (includeValue && this.value) {
      copy.value = { ...this.value };
    } else {
      delete copy.value;
    }
    return copy;
  }
}
