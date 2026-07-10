import { useFieldValue } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// MappedJoin renderer (0.3.x MappedJoinField.tsx:15-25 — `renderInstance`
// returned a raw `<input type="hidden">` mirroring the current value, no
// onChange: a join-key carrier is never directly edited by the user, only by
// sibling logic writing through `store.getState().setValue(...)`). Faithful
// transplant: no UI primitive needed (there is nothing visual to theme), so
// this bypasses useUI() entirely — unlike every other renderer in this
// registry. In practice `FieldRenderer` (react/src/components/FieldRenderer.tsx:88)
// already returns `null` before mounting ANY renderer for a hidden field, and
// MappedJoinField.isHidden() always resolves true — so this component is a
// fallback for direct/registry-driven use (e.g. a host that renders a
// registered component outside the FieldRenderer wrapper) and is exercised
// directly in the accompanying test.
export function MappedJoinFieldRenderer({ name }: FieldRendererComponentProps) {
  const value = useFieldValue<string>(name);
  return <input type="hidden" id={name} name={name} value={value ?? ''} readOnly />;
}
