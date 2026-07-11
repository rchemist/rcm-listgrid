import type { ConditionalReactNodeValue } from './conditional';
import { FormField } from './form-field';

// MessageView (0.3.x MessageViewField, src/listgrid/components/fields/
// MessageViewField.tsx:9-38 — renderInstance :22-26 was a bare
// `<div>{this.message}</div>`). 0.3.x reused the generic 'custom' type for
// this (:13); the new engine gives it a dedicated 'messageView' type so the
// FieldRenderer registry can dispatch it (EA-A0 pre-stage §3, types.ts).
//
// `message` is a {@link ConditionalReactNodeValue} — type-only `ReactNode`
// (conditional.ts precedent, helpText/tooltip :44-45) so schema-core stays
// React-free (ADR-0003 §Decision 5). RESOLVING it (the `React.isValidElement`
// branch) is a react-layer concern: packages/react/src/util/
// conditional-react-node.ts `getConditionalReactNode` (EA-A0 pre-stage §4) —
// consumed by message-view-renderer.tsx, not here. 0.3.x carried a raw
// ReactNode directly (no conditional resolution at all); this is the one
// deliberate shape change the schema-core/react split forces, not a "fix".
//
// The 0.3.x constructor unconditionally set `readonly = true` and
// `hideLabel = true` (MessageViewField.tsx:14-15) — nothing in 0.3.x ever
// un-set these after construction, so this is transplanted as-is (faithful
// transplant, briefing banner ①). A caller CAN still chain
// `.withReadOnly(false)`/`.withHideLabel(false)` afterward (ordinary builder
// semantics — last write wins), same as 0.3.x.
//
// No builders beyond the inherited FormField ones: 0.3.x had none either
// (message is constructor-only; `static create()` was a 0.3.x
// factory-pattern relic superseded by `new MessageViewField(...)` +
// chaining here).
export class MessageViewField extends FormField<unknown> {
  message: ConditionalReactNodeValue;

  constructor(name: string, order: number, message: ConditionalReactNodeValue) {
    super(name, order, 'messageView');
    this.readOnly = true;
    this.hideLabel = true;
    this.message = message;
  }
}
