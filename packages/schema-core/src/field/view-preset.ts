import type { ConditionalBooleanValue } from './conditional';

// View presets (charter C2 vocabulary) — reusable readOnly/hidden policy
// bundles applied via `withViewPreset()`. Transplanted verbatim from
// src/listgrid/config/Config.ts:217-342 (0.3.x).

/**
 * A readOnly/hidden policy pair. Each side is a full conditional
 * (literal | per-render-type | function of context).
 */
export interface ViewPreset {
  readOnly?: ConditionalBooleanValue;
  hidden?: ConditionalBooleanValue;
}

/** Visible + editable in both create and update. */
export const ALWAYS: ViewPreset = { hidden: { onCreate: false, onUpdate: false } };
/** Never shown. */
export const HIDDEN: ViewPreset = { hidden: { onCreate: true, onUpdate: true } };
/** Editable only when creating (readOnly on update). */
export const ADD_ONLY: ViewPreset = { readOnly: { onCreate: false, onUpdate: true } };
/** Shown+editable only on update; hidden on create. */
export const MODIFY_ONLY: ViewPreset = {
  readOnly: { onCreate: true, onUpdate: false },
  hidden: { onCreate: true, onUpdate: false },
};
/** Read-only everywhere it shows; hidden on create. */
export const VIEW_ONLY: ViewPreset = {
  readOnly: { onCreate: true, onUpdate: true },
  hidden: { onCreate: true, onUpdate: false },
};
/** Read-only and hidden in the form — list column only. */
export const LIST_ONLY: ViewPreset = {
  readOnly: { onCreate: true, onUpdate: true },
  hidden: { onCreate: true, onUpdate: true },
};
/** Editable on create, read-only+... on update (view-oriented). */
export const VIEW_HIDDEN: ViewPreset = {
  readOnly: { onCreate: false, onUpdate: true },
  hidden: { onCreate: false, onUpdate: true },
};
/** Read-only once the field has a value (current or fetched). */
export const HAS_VALUE_READONLY: ViewPreset = {
  readOnly: (ctx) =>
    ctx.value?.current || ctx.value?.fetched ? Promise.resolve(true) : Promise.resolve(false),
};
/** Hidden once the field has a value (current or fetched). */
export const HAS_VALUE_HIDDEN: ViewPreset = {
  hidden: (ctx) =>
    ctx.value?.current || ctx.value?.fetched ? Promise.resolve(true) : Promise.resolve(false),
};

/**
 * The named-preset union. Consolidates the two parallel 0.3.x mappers
 * (`ViewPresetType`/getViewPreset at Config.ts:199-215 and
 * `ModifiableType`/getModifiableType at Config.ts:293-326) into one enum + one
 * mapper covering the union of their members (ADR-0004 surface reduction).
 */
export type ViewPresetType =
  | 'ALWAYS'
  | 'ADD_ONLY'
  | 'MODIFY_ONLY'
  | 'VIEW_ONLY'
  | 'VIEW_HIDDEN'
  | 'LIST_ONLY'
  | 'HIDDEN';

export function getViewPreset(type: ViewPresetType): ViewPreset {
  switch (type) {
    case 'ALWAYS':
      return ALWAYS;
    case 'ADD_ONLY':
      return ADD_ONLY;
    case 'MODIFY_ONLY':
      return MODIFY_ONLY;
    case 'VIEW_ONLY':
      return VIEW_ONLY;
    case 'VIEW_HIDDEN':
      return VIEW_HIDDEN;
    case 'LIST_ONLY':
      return LIST_ONLY;
    case 'HIDDEN':
      return HIDDEN;
    default:
      return ALWAYS;
  }
}
