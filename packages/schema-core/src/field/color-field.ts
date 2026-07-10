import { FormField } from './form-field';

// Color field (EA-B fan-out, PART C §Color). Transplant of 0.3.x
// `src/listgrid/components/fields/ColorField.tsx:9-37` (class body) — a
// ListableFormField subclass with type='custom', no extra declared
// properties, no withXxx builders, and no validate() override (base
// FormField's required-blank + declared-validations check is the whole
// story; the old class adds nothing on top). Per the EA-B briefing,
// list-cell rendering (old :39-52, dynamic Tailwind `!bg-[${value}]`) is
// globally deferred — this class is FormField-direct (not a base class),
// matching the field's Part C "base: FormField 직속" call.
//
// Value shape: hex color string (e.g. '#ff0000'), matching the old
// ColorInput's `format={'hex'}` (ColorField.tsx:80).
export class ColorField extends FormField<string> {
  constructor(name: string, order: number) {
    super(name, order, 'color');
  }
}
