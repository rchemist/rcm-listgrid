import { FormField } from './form-field';
import type { FieldEvalContext } from './eval-context';

/**
 * MappedJoin (0.3.x MappedJoinField, `src/listgrid/components/fields/
 * MappedJoinField.tsx:7-41`) — a ManyToOne relation whose only purpose is
 * carrying a join key; there is no picker UI, it just travels with the form
 * so `toSaveData()` includes it. No builders, no config — the whole class is
 * the constructor + the always-hidden override.
 *
 * Old-engine constructor hardcoded `order=10` and reused the generic 'hidden'
 * type string (:9). The new engine gives it its own dedicated type
 * (`'mappedJoin'`, already declared in ./types) and — like every other
 * schema-core field — takes `order` explicitly from the caller rather than
 * hardcoding it, matching every sibling leaf-field constructor (DateField,
 * MarkdownField, etc. in ./basic-fields).
 */
export class MappedJoinField extends FormField<string> {
  constructor(name: string, order: number) {
    super(name, order, 'mappedJoin');
  }

  /**
   * Transplant of MappedJoinField.isHidden:38-40 — unconditionally hidden,
   * regardless of any `withHidden(...)` declaration. `FormField.isHidden`
   * (the inherited default) is a regular async method here (not sealed), so
   * this override is legal in the new engine (ADR-0003) even though
   * schema-core has no render layer of its own. The value still survives:
   * `FieldRenderer` renders `null` for a hidden field, but the form store's
   * `toSaveData()` iterates `fieldDefs` unconditionally (only `exceptOnSave`
   * is excluded) — so a MappedJoin field's value reaches save data even
   * though it is never visibly rendered (locked by the accompanying test).
   */
  override async isHidden(_ctx: FieldEvalContext): Promise<boolean> {
    return true;
  }
}
