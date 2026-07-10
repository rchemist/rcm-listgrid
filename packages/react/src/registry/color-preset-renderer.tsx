import { useState } from 'react';
import type { ColorPresetField } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// ColorPreset renderer (EA-A, PART 2 §ColorPreset). Transplant of the input
// path of src/listgrid/components/fields/ColorPresetField.tsx:69-123
// (ColorPresetFieldView — a trigger button that opens a Popover holding a
// swatch grid). No Popover primitive exists in UIComponents; conductor
// decision ③ (briefing banner) already commits ColorPreset to an
// inline-style static palette, so the popover surface reuses the existing
// Modal primitive (same "reuse before inventing a slot" posture as
// ManyToOneRenderer's picker Modal) instead of adding a new one.
//
// Conductor decision ③ ALSO forbids transplanting the old Tailwind class
// helpers (AllColorTypes/getAdditionalColorClass/getOppositeTextColorClass,
// common/func.ts) — this renderer carries its own named-color→hex map and
// applies swatch/trigger colors via inline `style`, never a CSS class. The
// 16 names are 0.3.x's AdditionalColorType union (common/type.ts:32-48); the
// field's `presets` (if non-empty) narrows which of those 16 the swatch grid
// offers, otherwise all 16 are offered — same "presets subset, else full
// palette" contract as the old field's `presets?: string[]` ctor arg.
const COLOR_HEX: Record<string, string> = {
  dark: '#1a1a2e',
  gray: '#868e96',
  red: '#e03131',
  pink: '#e64980',
  grape: '#ae3ec9',
  violet: '#7048e8',
  indigo: '#4263eb',
  blue: '#1c7ed6',
  cyan: '#0c8599',
  green: '#2f9e44',
  lime: '#66a80f',
  yellow: '#f08c00',
  orange: '#e8590c',
  teal: '#0ca678',
  black: '#000000',
  white: '#ffffff',
};

const ALL_COLOR_NAMES = Object.keys(COLOR_HEX);

/** 0.3.x default fallback color (ColorPresetField.tsx:77,82 — `useState('indigo')`
 *  + `props.value ?? 'indigo'`). */
const DEFAULT_COLOR = 'indigo';

function hexOf(color: string): string {
  return COLOR_HEX[color] ?? COLOR_HEX[DEFAULT_COLOR] ?? '#4263eb';
}

/** 0.3.x getOppositeTextColorClass (common/func.ts:163-205) always returns
 *  white text for every named color except 'white' itself (→ dark text). */
function textColorOf(color: string): string {
  return color === 'white' ? '#1a1a2e' : '#ffffff';
}

export function ColorPresetFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { Modal } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string>(name);
  const presets = (field as ColorPresetField).presets;
  const palette =
    presets && presets.length > 0 ? presets.filter((c) => c in COLOR_HEX) : ALL_COLOR_NAMES;

  const [open, setOpen] = useState(false);
  const selected = value ?? DEFAULT_COLOR;

  return (
    <span data-field="colorPreset">
      <button
        type="button"
        id={name}
        disabled={readOnly}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen(true)}
        style={{
          backgroundColor: hexOf(selected),
          color: textColorOf(selected),
          border: 'none',
          borderRadius: 4,
          padding: '6px 12px',
          cursor: readOnly ? 'default' : 'pointer',
        }}
      >
        색상 선택
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="색상 선택">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 8,
          }}
        >
          {palette.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              aria-pressed={color === selected}
              onClick={() => {
                store.getState().setValue(name, color);
                setOpen(false);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: color === selected ? '2px solid currentColor' : 'none',
                backgroundColor: hexOf(color),
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </Modal>
    </span>
  );
}
