import { useEffect, useState, type ReactNode } from 'react';
import type { FieldEvalContext, MessageViewField } from '@listgrid/schema-core';
import { useSession } from '../providers/auth';
import { snapshotFieldValues, useFormStore } from '../providers/form-store';
import { getConditionalReactNode } from '../util/conditional-react-node';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// MessageView renderer (EA-A fan-out — MessageView). Transplant of 0.3.x
// MessageViewField.renderInstance (src/listgrid/components/fields/
// MessageViewField.tsx:22-26) — a bare `<div>{this.message}</div>`, nothing
// else: no UI primitive, no store read/write (the field is display-only, and
// its constructor-forced readonly=true/hideLabel=true already keep
// FieldRenderer from emitting a <label> or an editable-control wrapper
// around it, message-view-field.ts).
//
// The one thing that DOES change vs. 0.3.x: `field.message` is a
// ConditionalReactNodeValue, not a raw ReactNode (schema-core stays
// React-free, ADR-0003 §5), so it has to be resolved through
// getConditionalReactNode (EA-A0 pre-stage §4, ../util/
// conditional-react-node) before it can be rendered. Resolution is async
// (the function-conditional branch may itself be async), so it runs in an
// effect — same FieldEvalContext-building pattern as FieldRenderer's own
// hidden/required/readOnly resolution (components/FieldRenderer.tsx:50-73).
export function MessageViewFieldRenderer({
  field,
  name,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const store = useFormStore();
  const session = useSession();
  const messageField = field as MessageViewField;
  const [message, setMessage] = useState<ReactNode>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const state = store.getState();
      const ownSlice = state.fields[name];
      const ctx: FieldEvalContext = {
        renderType: state.renderType,
        values: snapshotFieldValues(state),
        ...(ownSlice !== undefined ? { value: ownSlice } : {}),
        ...(session !== undefined ? { session } : {}),
      };
      const resolved = await getConditionalReactNode(ctx, messageField.message);
      if (!cancelled) setMessage(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [store, session, messageField, name]);

  return (
    <div
      id={name}
      data-field="messageView"
      {...(required ? { 'aria-required': true } : {})}
      {...(invalid ? { 'aria-invalid': true } : {})}
      {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
    >
      {message}
    </div>
  );
}
