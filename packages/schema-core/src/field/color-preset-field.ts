import { FormField } from './form-field';

// ColorPreset (0.3.x ColorPresetField, src/listgrid/components/fields/
// ColorPresetField.tsx:11-47, type 'text' reused there — new engine gives it
// a dedicated 'colorPreset' type so the FieldRenderer registry can dispatch
// it, EA-A PART 2 §ColorPreset). Value is a color-name key (e.g. 'indigo').
//
// 0.3.x carried NO base class and NO withXxx builder for `presets` — it's a
// constructor-only optional arg (`presets?: string[]`) that narrows the
// swatch palette the renderer offers; undefined/empty means "offer every
// named color". Faithful transplant keeps that shape (no builder added).
//
// The old renderer resolved swatch colors through Tailwind class helpers
// (AllColorTypes/getAdditionalColorClass/getOppositeTextColorClass,
// common/func.ts) — conductor decision ③ (briefing banner) explicitly
// forbids transplanting those Tailwind helpers: the renderer uses an
// inline-style named-color→hex palette instead. That palette lives in the
// renderer (react package), not here — schema-core stays render-free
// (charter C4/ADR-0003).
export class ColorPresetField extends FormField<string> {
  presets?: string[] | undefined;

  constructor(name: string, order: number, presets?: string[]) {
    super(name, order, 'colorPreset');
    this.presets = presets;
  }
}
