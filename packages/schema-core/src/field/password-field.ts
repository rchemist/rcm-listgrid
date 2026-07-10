import { PasswordValidation } from '../validations/password-validation';
import { RegexValidation } from '../validations/regex-validation';
import { FormField } from './form-field';
import type { Validation } from '../validation';

// Transplanted from src/listgrid/components/fields/PasswordField.tsx:15-100
// (0.3.x). valueShape: string (EA-A briefing PART 2 §Password). No shared
// options base — same shape as EmailField (basic-fields.ts:19-35): a single
// FormField<string> with an auto-attached default validation.
//
// `strength` is HOST-OWNED in 0.3.x (UIProvider.tsx:225 `PasswordStrength =
// any`) — only the `regex[]` shape the constructor/withStrength actually read
// is transplanted (briefing: "regex 배열 shape 가정만 이식"). The renderer layer
// decides how (or whether) to visualize strength; schema-core only carries the
// meta needed to derive the RegexValidation entries.

/** One strength rule: a pattern the password must match + its failure message
 *  (0.3.x PasswordStrength.regex[] entry shape — host owns the rest of the
 *  PasswordStrength contract, e.g. any UI-only scoring/label fields). */
export interface PasswordStrengthRule {
  pattern: RegExp;
  error: string;
}

/** Minimal host-owned PasswordStrength shape this field actually consumes. */
export interface PasswordStrength {
  regex?: PasswordStrengthRule[];
}

/** @deprecated Kept for its type shape only — the `PasswordField.create()`
 *  factory that consumed this (0.3.x PasswordField.tsx factory-pattern
 *  relic) was dropped (EA-R1 #4, same precedent as MessageViewField: `new
 *  PasswordField(...)` + chaining supersedes it). */
export interface PasswordFieldProps {
  name: string;
  order: number;
  validations?: Validation[];
  strength?: PasswordStrength;
}

export class PasswordField extends FormField<string> {
  strength?: PasswordStrength | undefined;

  constructor(
    name: string,
    order: number,
    validations?: Validation[],
    strength?: PasswordStrength,
  ) {
    super(name, order, 'password');
    if (validations) {
      this.validations = [...validations];
    } else {
      this.validations = [new PasswordValidation()];
    }
    if (strength) {
      this.strength = strength;
      if (strength.regex) {
        const newValidations: Validation[] = [];
        for (const regex of strength.regex) {
          newValidations.push(
            new RegexValidation('passwordStrength-' + name, regex.pattern, regex.error),
          );
        }
        this.validations = [...this.validations, ...newValidations];
      }
    }
  }

  /**
   * Set (or clear) the strength rules. Transplant of
   * PasswordField.withStrength:69-84 — when a strength with `regex[]` is
   * supplied, the id-tagged `'PasswordValidation'` default entry is filtered
   * OUT of the current validations list and one `RegexValidation` per rule is
   * appended in its place. The id-tag match is load-bearing (briefing
   * pitfalls) — do not rename/relax it.
   *
   * DEVIATION from literal source: 0.3.x pushes `{ ...validation }` (a
   * shallow plain-object copy) for surviving entries. Since `validate()`/
   * `getErrorMessage()` are prototype methods on `ValidationItem` subclasses,
   * spreading an instance strips them — any non-'PasswordValidation' entry
   * surviving the filter would silently lose its `validate` method on the
   * next validate() call. That's a latent 0.3.x bug, not intentional
   * behavior; this transplant pushes the validation reference itself so
   * surviving entries stay functional.
   */
  withStrength(strength?: PasswordStrength): this {
    this.strength = strength;
    if (strength !== undefined && this.validations !== undefined && this.validations.length > 0) {
      const newValidations: Validation[] = [];
      for (const validation of this.validations) {
        if (validation.id !== 'PasswordValidation') {
          newValidations.push(validation);
        }
      }
      if (strength.regex) {
        for (const regex of strength.regex) {
          newValidations.push(
            new RegexValidation('passwordStrength-' + this.name, regex.pattern, regex.error),
          );
        }
      }
      this.validations = newValidations;
    }
    return this;
  }
}
