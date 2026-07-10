import { FormField } from './form-field';

// Concrete leaf-field classes — META ONLY (charter C4). The type discriminant
// drives the FieldRenderer registry in @listgrid/react (ADR-0003 §2); all
// rendering (input widget, list cell, filter) lives there, not here. Transplanted
// from src/listgrid/components/fields/* (0.3.x) constructor signatures.

/** Single-line text (0.3.x StringField, type 'text'). */
export class StringField extends FormField<string> {
  useCopy: boolean;
  constructor(name: string, order: number, useCopy = false) {
    super(name, order, 'text');
    this.useCopy = useCopy;
  }
}

/** Boolean (0.3.x BooleanField, type 'boolean'). */
export class BooleanField extends FormField<boolean> {
  emptyLabel?: string;
  constructor(name: string, order: number, emptyLabel?: string) {
    super(name, order, 'boolean');
    if (emptyLabel !== undefined) this.emptyLabel = emptyLabel;
  }
}

export interface MinMaxLimit {
  min?: number;
  max?: number;
}

/** Numeric (0.3.x NumberField, type 'number'). */
export class NumberField extends FormField<number> {
  currency?: string;
  double?: boolean;
  limit?: MinMaxLimit;
  constructor(
    name: string,
    order: number,
    props?: { currency?: string; double?: boolean; limit?: MinMaxLimit },
  ) {
    super(name, order, 'number');
    if (props?.currency !== undefined) this.currency = props.currency;
    if (props?.double !== undefined) this.double = props.double;
    if (props?.limit !== undefined) this.limit = props.limit;
  }
}

/** Multi-line text (0.3.x TextareaField, type 'textarea', rows default 10). */
export class TextareaField extends FormField<string> {
  rows: number;
  limit?: MinMaxLimit;
  constructor(name: string, order: number, rows = 10, limit?: MinMaxLimit) {
    super(name, order, 'textarea');
    this.rows = rows;
    if (limit !== undefined) this.limit = limit;
  }
}

/** Rich text (0.3.x MarkdownField, type 'markdown'). NOTE: 0.3.x has a custom
 *  isDirty rich-text-empty normalization ('<p><br></p>' sentinels) — deferred to
 *  V1 (renderer-editor-specific; not on College's critical path). */
export class MarkdownField extends FormField<string> {
  constructor(name: string, order: number) {
    super(name, order, 'markdown');
  }
}

/** Select / dropdown (0.3.x SelectField, type 'select'). Options are meta. */
export interface SelectOption {
  value: string | number | boolean;
  label: string;
}
export class SelectField extends FormField<string | number | boolean> {
  options: SelectOption[];
  constructor(name: string, order: number, options: SelectOption[] = []) {
    super(name, order, 'select');
    this.options = options;
  }
  withOptions(options: SelectOption[]): this {
    this.options = options;
    return this;
  }
}
