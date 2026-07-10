import type { MinMaxLimit, SelectOption } from './basic-fields';
import { MultiOptionsField } from './options-field';

// Checkbox (EA-A fan-out). Transplant of 0.3.x
// `src/listgrid/components/fields/CheckboxField.tsx:16-59` — META ONLY
// (charter C4); the renderer (`@listgrid/react` checkbox-renderer.tsx) owns
// rendering one native checkbox per declared option.
//
// valueShape is `string[]` — a SET of selected option values, NOT a single
// boolean (briefing PART 2 §Checkbox pitfall: "MultipleOptionalField 배열
// 처리에 전부 위임 — Boolean처럼 만들지 말 것"). Base: MultiOptionsField
// (options + min/max-selected-count validate, EA-A0 pre-stage transplant of
// 0.3.x `MultipleOptionalField`, `abstract/OptionalField.tsx:210-345`).
//
// DESCOPED (briefing PART 2 §Checkbox flags these "chip 변형 — descope
// 후보", and the EA-A0 pre-stage already excludes their backing state —
// chipConfig/singleFilter — from the shared OptionsField/MultiOptionsField
// base as UX-variant knobs, options-field.ts:1-16): `useChip`,
// `withSingleFilter`. `createCacheKey` (0.3.x `OptionalField.tsx:253-260`,
// a render-memo key) is also dropped — store-driven rendering makes memo-key
// computation the renderer's concern, not the field's (same call already
// made for the shared base).

/**
 * Layout hint for a checkbox group (0.3.x `ComboProps`,
 * `config/Config.ts:441-444`, reused by `OptionalField.withComboType:80-84`
 * for radio/checkbox direction). NOT folded into the shared
 * OptionsField/MultiOptionsField base — the pre-stage decision excluded
 * `combo` there as a UX-variant knob; Checkbox keeps its own copy because
 * group layout (row vs column) is this field's primary rendering axis, not
 * a cross-field concern every options field needs.
 */
export interface CheckboxComboProps {
  direction?: 'row' | 'column';
  columns?: number;
}

/**
 * Checkbox GROUP (0.3.x `CheckboxField`, type 'checkbox' — already in
 * {@link FieldType}). Renders one checkbox per declared `options` entry; the
 * store value is the array of currently-checked option values.
 */
export class CheckboxField extends MultiOptionsField<string[]> {
  combo?: CheckboxComboProps;

  constructor(name: string, order: number, options?: SelectOption[], limit?: MinMaxLimit) {
    super(name, order, 'checkbox');
    if (options !== undefined) this.options = [...options];
    if (limit !== undefined) this.limit = limit;
  }

  /** Transplant of `OptionalField.withComboType:80-84` — row/column layout hint. */
  withComboType(props?: CheckboxComboProps): this {
    if (props !== undefined) this.combo = props;
    else delete this.combo;
    return this;
  }
}
