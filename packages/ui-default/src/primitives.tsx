// Default UI primitives — plain semantic HTML, no CSS framework, no
// component library dependency. Every input primitive normalizes onChange
// to the plain VALUE the field store expects (never the raw DOM event).
import type {
  ButtonProps,
  CheckBoxProps,
  DateInputProps,
  LoadingOverlayProps,
  ModalProps,
  NumberInputProps,
  PaginationProps,
  SelectBoxProps,
  StackProps,
  TableCellProps,
  TableComponent,
  TableProps,
  TableRowProps,
  TextareaProps,
  TextInputProps,
  UIComponents,
} from './types';

export function TextInput({
  value,
  onChange,
  placeholder,
  readOnly,
  disabled,
  id,
  ariaLabel,
}: TextInputProps) {
  return (
    <input
      type="text"
      id={id}
      value={value ?? ''}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export function Textarea({
  value,
  onChange,
  rows,
  readOnly,
  disabled,
  id,
  ariaLabel,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      value={value ?? ''}
      rows={rows}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  readOnly,
  disabled,
  id,
  ariaLabel,
}: NumberInputProps) {
  return (
    <input
      type="number"
      id={id}
      value={value ?? ''}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => {
        const raw = e.target.value;
        onChange?.(raw === '' ? NaN : Number(raw));
      }}
    />
  );
}

export function DateInput({ value, onChange, readOnly, disabled, id, ariaLabel }: DateInputProps) {
  return (
    <input
      type="date"
      id={id}
      value={value ?? ''}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export function CheckBox({ checked, onChange, disabled, id, ariaLabel }: CheckBoxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked ?? false}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
}

export function SelectBox({ value, onChange, options, disabled, id, ariaLabel }: SelectBoxProps) {
  const opts = options ?? [];
  return (
    <select
      id={id}
      value={value === undefined ? '' : String(value)}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => {
        const raw = e.target.value;
        const matched = opts.find((o) => String(o.value) === raw);
        onChange?.(matched ? matched.value : raw);
      }}
    >
      {opts.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Button({ onClick, children, type, disabled, variant }: ButtonProps) {
  return (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  );
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title}>
      {title !== undefined && (
        <div>
          <strong>{title}</strong>
          {onClose && (
            <button type="button" aria-label="Close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function TableBase({ children }: TableProps) {
  return <table>{children}</table>;
}
function Thead({ children }: TableRowProps) {
  return <thead>{children}</thead>;
}
function Tbody({ children }: TableRowProps) {
  return <tbody>{children}</tbody>;
}
function Tr({ children }: TableRowProps) {
  return <tr>{children}</tr>;
}
function Th({ children, colSpan }: TableCellProps) {
  return <th colSpan={colSpan}>{children}</th>;
}
function Td({ children, colSpan }: TableCellProps) {
  return <td colSpan={colSpan}>{children}</td>;
}

export const Table: TableComponent = Object.assign(TableBase, { Thead, Tbody, Tr, Th, Td });

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange?.(page - 1)}>
        Prev
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange?.(page + 1)}>
        Next
      </button>
    </nav>
  );
}

export function Stack({ children, gap }: StackProps) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: gap ?? 8 }}>{children}</div>;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;
  return (
    <div role="status" aria-live="polite">
      Loading…
    </div>
  );
}

/** Default UI component registry (charter C7, ADR-0004) — spread into the
 * renderer's provider and override piecemeal, or swap wholesale. */
export const defaultUIComponents: UIComponents = {
  TextInput,
  Textarea,
  NumberInput,
  DateInput,
  CheckBox,
  SelectBox,
  Button,
  Modal,
  Table,
  Pagination,
  Stack,
  LoadingOverlay,
};
