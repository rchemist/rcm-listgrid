// Default UI primitives — plain semantic HTML, no CSS framework, no
// component library dependency. Every input primitive normalizes onChange
// to the plain VALUE the field store expects (never the raw DOM event).
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type {
  ButtonProps,
  CheckBoxProps,
  DateInputProps,
  FileInputProps,
  InlineMapProps,
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
  TagsInputProps,
  TextareaProps,
  TextInputProps,
  UIComponents,
  UserViewProps,
} from './types';

export function TextInput({
  value,
  onChange,
  placeholder,
  type,
  readOnly,
  disabled,
  id,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: TextInputProps) {
  return (
    <input
      type={type ?? 'text'}
      id={id}
      value={value ?? ''}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
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
  required,
  invalid,
  describedBy,
}: TextareaProps) {
  return (
    <textarea
      id={id}
      value={value ?? ''}
      rows={rows}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
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
  required,
  invalid,
  describedBy,
}: NumberInputProps) {
  return (
    <input
      type="number"
      id={id}
      value={value ?? ''}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => {
        const raw = e.target.value;
        onChange?.(raw === '' ? NaN : Number(raw));
      }}
    />
  );
}

export function DateInput({
  value,
  onChange,
  readOnly,
  disabled,
  id,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: DateInputProps) {
  return (
    <input
      type="date"
      id={id}
      value={value ?? ''}
      readOnly={readOnly}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

export function CheckBox({
  checked,
  onChange,
  disabled,
  id,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: CheckBoxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked ?? false}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
}

export function SelectBox({
  value,
  onChange,
  options,
  disabled,
  id,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: SelectBoxProps) {
  const opts = options ?? [];
  return (
    <select
      id={id}
      value={value === undefined ? '' : String(value)}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
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

/**
 * Minimal token input (EA-A0 pre-stage — first consumer: TagField).
 * Enter adds the current text as a tag (after `onValidateTag`, if
 * supplied); each tag carries its own remove button. `data` (if given)
 * feeds a native `<datalist>` for suggestions — no custom dropdown/filter
 * UI (that's the 0.3.x `TagsInput` component's job; this is the ui-default
 * fallback a host is expected to override with its own design-system
 * widget, same posture as every other primitive here).
 */
export function TagsInput({
  value,
  onChange,
  data,
  onValidateTag,
  maxTags,
  placeholder,
  readOnly,
  disabled,
  id,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const tags = value ?? [];
  const listId = data && data.length > 0 && id ? `${id}-suggestions` : undefined;

  async function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || readOnly || disabled) return;
    if (tags.includes(tag)) {
      setInputValue('');
      return;
    }
    if (maxTags !== undefined && tags.length >= maxTags) {
      setError(`최대 ${maxTags}개까지 추가할 수 있습니다.`);
      return;
    }
    if (onValidateTag) {
      const result = await onValidateTag(tag);
      if (!result.valid) {
        setError(result.message ?? '유효하지 않은 태그입니다.');
        return;
      }
    }
    setError(undefined);
    onChange?.([...tags, tag]);
    setInputValue('');
  }

  function removeTag(index: number) {
    if (readOnly || disabled) return;
    const next = tags.slice();
    next.splice(index, 1);
    onChange?.(next);
  }

  return (
    <div id={id}>
      <ul aria-label={ariaLabel ? `${ariaLabel} — selected` : undefined}>
        {tags.map((tag, index) => (
          <li key={`${tag}-${index}`}>
            <span>{tag}</span>
            {!readOnly && !disabled && (
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(index)}>
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        aria-invalid={invalid || (error !== undefined ? true : undefined) || undefined}
        aria-describedby={describedBy}
        list={listId}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void addTag(inputValue);
          }
        }}
      />
      {listId && (
        <datalist id={listId}>
          {(data ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </datalist>
      )}
      {error !== undefined && <div role="alert">{error}</div>}
    </div>
  );
}

/**
 * File/Image upload fallback (EA-C0 pre-stage — first consumers: File/Image/
 * MultipleAsset fields, EA-C fan-out; ea-c-scout-briefing.md decision ②).
 * The value is always the plain URL string (no FileFieldValue envelope):
 * edited directly via the text input (edustack-parity — today's real
 * behavior has no upload wiring at all). When a host supplies `onUpload`,
 * a file picker is ALSO rendered; selecting a file calls `onUpload`, and on
 * success feeds the resolved URL into `onChange`. On rejection the current
 * value is left untouched and the failure surfaces via `role="alert"`
 * (async-safe — no partial/optimistic value change). Without `onUpload` no
 * file picker renders at all (nothing to wire it to). A clear-value button
 * is included so a populated URL can be removed without hand-editing text.
 */
export function FileInput({
  id,
  value,
  onChange,
  onUpload,
  accept,
  readOnly,
  disabled,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: FileInputProps) {
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so re-selecting the same file re-fires onChange next time.
    e.target.value = '';
    if (!file) return;
    setUploadError(undefined);
    try {
      const result = await onUpload!(file);
      onChange?.(result.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '파일 업로드에 실패했습니다.');
    }
  }

  return (
    <div id={id}>
      <input
        type="text"
        value={value ?? ''}
        readOnly={readOnly}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange?.(e.target.value === '' ? undefined : e.target.value)}
      />
      {!readOnly && !disabled && value !== undefined && value !== '' && (
        <button type="button" aria-label="Clear" onClick={() => onChange?.(undefined)}>
          ×
        </button>
      )}
      {onUpload && (
        <input
          type="file"
          accept={accept}
          disabled={readOnly || disabled}
          aria-label={ariaLabel ? `${ariaLabel} — upload` : undefined}
          onChange={(e) => void handleFileSelect(e)}
        />
      )}
      {uploadError !== undefined && <div role="alert">{uploadError}</div>}
    </div>
  );
}

let inlineMapRowSeq = 0;

interface InlineMapRow {
  id: number;
  key: string;
  value: string;
}

/** Build the ordered row list an incoming `value` Record represents. Fresh
 *  ids on every call by design — rows are only ever rebuilt from `value`
 *  when `recordsEqual` below has determined the current local rows no
 *  longer match it (an external change), so a stable id per rebuild is not
 *  needed for React reconciliation correctness (key churn just means a
 *  fresh row of inputs, not a semantic loss). */
function rowsFromRecord(record: Record<string, string> | undefined): InlineMapRow[] {
  return Object.entries(record ?? {}).map(([key, value]) => ({
    id: inlineMapRowSeq++,
    key,
    value,
  }));
}

function inlineMapDeriveRecord(rows: InlineMapRow[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const row of rows) {
    if (row.key !== '') record[row.key] = row.value;
  }
  return record;
}

function recordsEqual(a: Record<string, string> | undefined, b: Record<string, string>): boolean {
  const keysA = Object.keys(a ?? {});
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  const source = a ?? {};
  return keysA.every((k) => source[k] === b[k]);
}

/** Strip blank-value entries (EA-R1 #1 companion to
 *  `inline-map-renderer.tsx`'s `buildResult`, which now collapses a record
 *  that is blank-by-VALUE in every entry down to `undefined`/`[]` at the
 *  store-write boundary, closing the 0.3.x #1289 `{ key: '' }`-reads-as-
 *  not-blank hole). Used ONLY for the resync-decision comparison below, not
 *  for row rendering: comparing the raw incoming `value` against the raw
 *  local-derived record would otherwise treat that store-side collapse as
 *  an "external change" and wipe an in-progress free-mode row the instant
 *  its key is typed but its value isn't yet (the local `rows` buffer is
 *  the one thing that's still allowed to hold a real key + blank value —
 *  comparing on meaningful content only keeps the resync decision blind to
 *  that in-progress state while still catching genuine external changes. */
function meaningfulRecord(record: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value !== '') result[key] = value;
  }
  return result;
}

/**
 * Key-value row editor (EA-D — InlineMap, first/only consumer:
 * InlineMapField; host reference UX: gjcu `packages/ui/form/InlineMap.tsx`).
 * Always speaks `Record<string,string>` at the `value`/`onChange` boundary
 * (`InlineMapProps` doc comment, `types.ts`) — the injecting renderer owns
 * any `KeyValue[]`/`Map` conversion.
 *
 * FIXED-KEYS mode (`keys` non-empty) needs no local row bookkeeping — each
 * row maps 1:1 to a stable declared key, so it renders straight off
 * `value`/`keys` every render. FREE mode does need local `rows` state: a
 * plain `Record` can represent neither an in-progress blank key (typing a
 * new row's key from empty) nor two rows sharing the same (still-being-
 * edited) key, so rows are tracked with a synthetic id and only re-derived
 * from `value` when the CONTENT the current rows would produce
 * (`inlineMapDeriveRecord`) diverges from the incoming `value` — i.e. on a
 * genuine external change, never merely because the renderer handed back a
 * new object reference (a `resultType` conversion in the renderer allocates
 * a fresh Record every render even when nothing changed).
 */
export function InlineMap({
  value,
  onChange,
  keys,
  minRows,
  maxRows,
  keyLabel,
  valueLabel,
  readOnly,
  disabled,
  id,
  ariaLabel,
  required,
  invalid,
  describedBy,
}: InlineMapProps) {
  const fixedKeys = keys && keys.length > 0 ? keys : undefined;
  const editable = !readOnly && !disabled;
  const kLabel = keyLabel ?? 'Key';
  const vLabel = valueLabel ?? 'Value';

  const [rows, setRows] = useState<InlineMapRow[]>(() => rowsFromRecord(value));
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (fixedKeys) return;
    if (
      recordsEqual(
        meaningfulRecord(value ?? {}),
        meaningfulRecord(inlineMapDeriveRecord(rowsRef.current)),
      )
    )
      return;
    setRows(rowsFromRecord(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rowsRef sidesteps the need for `rows` here
  }, [value, fixedKeys]);

  function emit(next: InlineMapRow[]) {
    setRows(next);
    onChange?.(inlineMapDeriveRecord(next));
  }

  function setFixedValue(k: string, v: string) {
    onChange?.({ ...(value ?? {}), [k]: v });
  }

  function setRowKey(rowId: number, key: string) {
    emit(rows.map((row) => (row.id === rowId ? { ...row, key } : row)));
  }

  function setRowValue(rowId: number, value_: string) {
    emit(rows.map((row) => (row.id === rowId ? { ...row, value: value_ } : row)));
  }

  function addRow() {
    if (maxRows !== undefined && rows.length >= maxRows) {
      setError(`최대 ${maxRows}개 까지 입력 가능합니다.`);
      return;
    }
    setError(undefined);
    setRows([...rows, { id: inlineMapRowSeq++, key: '', value: '' }]);
  }

  function removeRow(rowId: number) {
    if (minRows !== undefined && rows.length <= minRows) {
      setError(`최소 ${minRows}개 이상의 항목이 필요합니다.`);
      return;
    }
    setError(undefined);
    emit(rows.filter((row) => row.id !== rowId));
  }

  const displayRows = fixedKeys
    ? fixedKeys.map((k) => ({
        id: k.key,
        key: k.key,
        label: k.label ?? k.key,
        value: value?.[k.key] ?? '',
      }))
    : rows.map((row) => ({ id: String(row.id), key: row.key, label: undefined, value: row.value }));

  return (
    <div
      id={id}
      data-field="inline-map"
      role="group"
      aria-label={ariaLabel}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    >
      <table>
        <thead>
          <tr>
            <th>{kLabel}</th>
            <th>{vLabel}</th>
            {!fixedKeys && editable && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, index) => (
            <tr key={row.id}>
              <td>
                {fixedKeys ? (
                  <span>{row.label}</span>
                ) : (
                  <input
                    type="text"
                    value={row.key}
                    readOnly={!editable}
                    disabled={disabled}
                    aria-label={`${kLabel} ${index + 1}`}
                    onChange={(e) => setRowKey(Number(row.id), e.target.value)}
                  />
                )}
              </td>
              <td>
                <input
                  type="text"
                  value={row.value}
                  readOnly={!editable}
                  disabled={disabled}
                  aria-label={`${vLabel} ${index + 1}`}
                  onChange={(e) =>
                    fixedKeys
                      ? setFixedValue(row.key, e.target.value)
                      : setRowValue(Number(row.id), e.target.value)
                  }
                />
              </td>
              {!fixedKeys && editable && (
                <td>
                  <button
                    type="button"
                    aria-label={`Remove row ${index + 1}`}
                    onClick={() => removeRow(Number(row.id))}
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!fixedKeys && editable && (
        <button type="button" onClick={addRow}>
          Add
        </button>
      )}
      {error !== undefined && <div role="alert">{error}</div>}
    </div>
  );
}

/**
 * Placeholder fallback for the Profile field's `UserView` slot (EA-A0
 * pre-stage, conductor decision ②: "최소 placeholder — 호스트 오버라이드
 * 전제"). Renders the value as plain text; a real host replaces this
 * component with a user-lookup/avatar view via `UIComponents.UserView`.
 */
export function UserView({ value, id, ariaLabel, describedBy }: UserViewProps) {
  return (
    <span id={id} aria-label={ariaLabel} aria-describedby={describedBy}>
      {value === undefined || value === null ? '' : String(value)}
    </span>
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
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management (a11y gap D): move focus into the dialog on open, and
  // restore it to whatever had focus beforehand on close/unmount. Hooks must
  // run unconditionally, so the `!open` early return stays BELOW this effect.
  useEffect(() => {
    if (!open) return;
    const saved =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
    dialogRef.current?.focus();
    return () => {
      saved?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
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

export function Pagination({ page, totalPages, onChange, prevLabel, nextLabel }: PaginationProps) {
  return (
    <nav aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange?.(page - 1)}>
        {prevLabel ?? 'Prev'}
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange?.(page + 1)}>
        {nextLabel ?? 'Next'}
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
  TagsInput,
  FileInput,
  InlineMap,
  UserView,
  Button,
  Modal,
  Table,
  Pagination,
  Stack,
  LoadingOverlay,
};
