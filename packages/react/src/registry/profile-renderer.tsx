import { useUI } from '../providers/ui';
import { useFieldValue } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Profile renderer (EA-A fan-out — Profile). 0.3.x ProfileField
// (src/listgrid/components/fields/ProfileField.tsx:17-21) rendered a bare
// `<UserView/>` fed the field's render parameters. UserView's actual shape is
// HOST-OWNED (conductor decision ②, briefing PART 2 §Profile) — this renderer
// is the "최소 placeholder" posture: it forwards the raw store value straight
// through the `UIComponents.UserView` slot (EA-A0 pre-stage §5③) and nothing
// else. ui-default's own UserView fallback renders the value as plain text; a
// real host replaces the slot with a user-lookup/avatar view without
// touching this renderer.
//
// ProfileField forces readonly=true in its constructor (profile-field.ts), so
// there is no onChange/setValue wiring here by default — same as 0.3.x, which
// never offered an editable path for this field. If a caller un-sets readonly
// via `.withReadOnly(false)`, this renderer still has no write path (the
// UserView slot contract is display-only, {@link
// packages/ui-default/src/types.ts} `UserViewProps`) — that mirrors 0.3.x,
// which had no editable UserView either.
//
// `hideLabel` is always true by default (profile-field.ts), so FieldRenderer
// renders no external `<label htmlFor>` for this field — `ariaLabel` is
// forwarded here (field label when it's a plain string, else the field name)
// so the UserView slot still carries an accessible name.
export function ProfileFieldRenderer({ field, name, describedBy }: FieldRendererComponentProps) {
  const { UserView } = useUI();
  const value = useFieldValue<unknown>(name);
  const label = field.getLabel();
  const ariaLabel = typeof label === 'string' ? label : name;
  return (
    <UserView
      id={name}
      value={value}
      ariaLabel={ariaLabel}
      {...(describedBy !== undefined ? { describedBy } : {})}
    />
  );
}
