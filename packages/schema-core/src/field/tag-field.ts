import { MultiOptionsField } from './options-field';

// TagField (EA-A fan-out) — transplant of 0.3.x
// `src/listgrid/components/fields/TagField.tsx:22-130`. Re-verified against
// source 2026-07-11: base MultipleOptionalField, value shape `string[]`,
// constructor `(name, order, options?, limit?)` delegating straight into
// `super(name, order, 'tag', options, limit)`, one extra builder
// (`withTagValidation`) plus an extra instance field (`tagValidation`)
// carried through `createInstance`/`static create`.
//
// New engine: options/limit are declared via the shared MultiOptionsField
// builders (`withOptions`/`withLimit`/`withMin`/`withMax`, EA-A0 pre-stage)
// rather than constructor positionals — same posture as
// `options-field.test.ts`'s TestTagsField and the sibling Checkbox/
// MultiSelect fan-out. `tagValidation` is TagField's only field-specific
// addition, so it is declared here.
//
// `tagValidation` is a per-tag, ASYNC, renderer-level validation gate (0.3.x
// pitfall, briefing PART 2 §Tag) — it is NOT a `Validation` catalog entry and
// is never consulted by `FormField.validate()`/`MultiOptionsField.validate()`
// (which only check required-blank, declared `validations[]`, and
// selected-COUNT limits). It is meta the TagFieldRenderer passes through to
// the TagsInput primitive's `onValidateTag` prop verbatim — the transplant
// keeps that split faithfully (schema-core carries the function reference;
// @listgrid/react is the only thing that ever calls it).

/** Outcome of a per-tag validation check (0.3.x `form/TagsInput/types.ts`
 *  `TagValidationResult`). Declared locally (schema-core is React-free and
 *  does not depend on @listgrid/ui-default) — structurally identical to the
 *  ui-default `TagsInputProps['onValidateTag']` shape it interops with, so no
 *  cross-package import is required for the two to type-check together. */
export interface TagValidationResult {
  valid: boolean;
  message?: string;
}

/** Tag input — a set of free-form (or suggestion-constrained) string tags
 *  (0.3.x TagField, type 'tag'). Value shape: `string[]`. */
export class TagField extends MultiOptionsField<string[]> {
  tagValidation?: (value: string) => TagValidationResult | Promise<TagValidationResult>;

  constructor(name: string, order: number) {
    super(name, order, 'tag');
  }

  /**
   * Set the per-tag add-time validation gate. Transplant of
   * `TagField.withTagValidation:35-40` — a function invoked with the raw tag
   * string being added; a `{valid:false}` result rejects the tag (renderer
   * surfaces `message`). Runs at INPUT time in the renderer, not at
   * `field.validate()` time (0.3.x pitfall — do not fold into the
   * `validations[]` catalog).
   */
  withTagValidation(
    validation?: (value: string) => TagValidationResult | Promise<TagValidationResult>,
  ): this {
    if (validation !== undefined) this.tagValidation = validation;
    else delete this.tagValidation;
    return this;
  }
}
