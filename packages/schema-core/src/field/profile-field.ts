import { FormField } from './form-field';

// Profile (0.3.x ProfileField, src/listgrid/components/fields/
// ProfileField.tsx:7-29 — renderInstance :17-21 was a bare `<UserView/>` fed
// this field's render parameters). 0.3.x reused the generic 'custom' type for
// this (:9); the new engine gives it a dedicated 'profile' type so the
// FieldRenderer registry can dispatch it (EA-A0 pre-stage §3, types.ts).
//
// UserView's real shape is HOST-OWNED (conductor decision ②, briefing PART 2
// §Profile): 0.3.x's own UserView was already a headless stub
// (UIProvider.tsx:211, typed `= any`), so there is no concrete value shape to
// transplant here. The field carries an `unknown` value and the react layer
// renders it through the `UIComponents.UserView` slot (EA-A0 pre-stage §5③)
// — ui-default's fallback shows the raw value as text; a real host overrides
// the slot with an actual user-lookup/avatar view without touching this
// class or the renderer.
//
// The 0.3.x constructor unconditionally set `readonly = true` and
// `hideLabel = true` (ProfileField.tsx:10-11) — nothing in 0.3.x ever un-set
// these after construction, so this is transplanted as-is (faithful
// transplant, briefing banner ①). A caller CAN still chain
// `.withReadOnly(false)`/`.withHideLabel(false)` afterward (ordinary builder
// semantics — last write wins), same as 0.3.x.
//
// No builders beyond the inherited FormField ones: 0.3.x had none either
// (constructor-only; `createInstance`/`renderInstance` were 0.3.x
// abstract-class plumbing superseded by `new ProfileField(...)` + chaining
// here and the react-layer renderer registry, respectively).
export class ProfileField extends FormField<unknown> {
  constructor(name: string, order: number) {
    super(name, order, 'profile');
    this.readonly = true;
    this.hideLabel = true;
  }
}
