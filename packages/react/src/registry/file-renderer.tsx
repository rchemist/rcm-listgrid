import type { AssetConfig } from '@listgrid/schema-core';
import { isExternalUrl } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// File renderer (EA-C fan-out — File). Transplant of 0.3.x
// `src/listgrid/components/fields/FileField.tsx:41-281` (renderInstance
// :97-122, external-URL bypass `pickExternalUrl` :27-39 + :101-113 —
// re-verified against source 2026-07-11). New engine posture, per
// ea-c-scout-briefing.md PART D "File" + conductor decisions ①②⑥:
//
//   - value shape: plain `string` (single mode, `field.getMaxCount() <= 1`)
//     or plain `string[]` (multi mode, `field.getMaxCount() > 1`) — decision
//     ①. schema-core's `FileField` owns the single/multi switch
//     (`isMultiple()`/`getMaxCount()`); this renderer only branches render
//     shape on it, never re-derives the `config.maxCount` math itself.
//   - the upload seam is the EA-C0 pre-stage `UIComponents.FileInput` slot
//     (shared with Image/MultipleAsset — `useUI().FileInput`). Matching the
//     established, independently-converged posture of the sibling
//     image-renderer.tsx / multiple-asset-renderer.tsx (same EA-C batch):
//     this renderer never sources or passes an `onUpload` callback itself —
//     `UIComponents` (shared file, not owned by this task) carries no
//     upload-fn channel alongside the component registry, so a host that
//     wants real uploads overrides the injected `FileInput` COMPONENT via
//     `<UIProvider components={{ ...defaultUIComponents, FileInput:
//     HostFileInput }}>` with one that wires uploads (and any client-side
//     `config.maxSize` precheck, since `FileInputProps` deliberately has no
//     `maxSize` prop — the host's own component is where that check
//     belongs, `field.config.maxSize` is readable off the field it receives)
//     internally; the ui-default fallback renders a plain URL text field
//     only (no file picker without `onUpload`, which this renderer never
//     supplies) — the URL-edit path works end-to-end with zero host wiring
//     (decision ②, "edustack-parity, no upload wiring today"; hard rule
//     "URL-edit path must fully work without it").
//   - external-URL bypass (decision ⑥, `isExternalUrl` — schema-core util):
//     a URL value (single mode) or any individual URL (multi mode) that is
//     already an absolute `http(s)://` URL skips the FileInput entirely and
//     renders as a bare download link — parity with 0.3.x `pickExternalUrl`.
//     0.3.x shows NO inline edit/clear control for this case (its own
//     comment: replacing an external URL goes through a separate
//     delete-then-register flow) — single mode matches that exactly; multi
//     mode adds a `Remove` button per external row only because decision
//     ①/PART D's array shape makes "remove one URL from the list" a
//     structural necessity the single-value 0.3.x original never had to
//     express (the array itself needs *some* way to shrink for an
//     externally-bypassed entry, since it has no FileInput "×" to do it).
//
// a11y: FileInput's ui-default fallback puts `id` on a non-labelable
// wrapping `<div>` (primitives.tsx), so `<label htmlFor={name}>` never
// resolves to a focusable control here — same posture as the TagsInput/
// MultiSelect renderers (tag-field.test.tsx, multi-select-renderer.tsx).
// Multi mode additionally has no single canonical input to hang required/
// invalid/describedBy off of, so — same posture as MultiSelectFieldRenderer
// — those three are carried on an outer `role="group"` wrapper instead of
// repeated on every row's FileInput.

interface FileFieldLike {
  config?: AssetConfig;
  getMaxCount(): number;
  isMultiple(): boolean;
}

/** `accept` attribute forwarded to the file picker input — union of
 *  `config.fileTypes` (MIME patterns) and `config.extensions` (bare
 *  extensions, normalized to a leading dot), 0.3.x `IAssetConfig` parity. */
function buildAccept(config: AssetConfig | undefined): string | undefined {
  const parts: string[] = [];
  if (config?.fileTypes && config.fileTypes.length > 0) parts.push(...config.fileTypes);
  if (config?.extensions && config.extensions.length > 0) {
    parts.push(...config.extensions.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`)));
  }
  return parts.length > 0 ? parts.join(',') : undefined;
}

/** External-URL bypass row (0.3.x `pickExternalUrl`/FileField.tsx:27-39,
 *  101-113) — a bare download link, no asset-server prefixing. */
function ExternalUrlLink({ url }: { url: string }) {
  return (
    <div className="rcm-file-field-external">
      <a href={url} target="_blank" rel="noreferrer" className="rcm-file-field-link">
        {url}
      </a>
    </div>
  );
}

export function FileFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { FileInput } = useUI();
  const store = useFormStore();
  const value = useFieldValue<string | string[]>(name);
  const fileField = field as unknown as FileFieldLike;
  const accept = buildAccept(fileField.config);
  const multiple = fileField.isMultiple();
  const maxCount = fileField.getMaxCount();
  const label = field.getLabel();
  const ariaLabel = typeof label === 'string' ? label : name;

  if (!multiple) {
    const url = typeof value === 'string' ? value : undefined;
    if (url && isExternalUrl(url)) {
      return <ExternalUrlLink url={url} />;
    }
    return (
      <FileInput
        id={name}
        value={url ?? ''}
        onChange={(next) => store.getState().setValue(name, next)}
        ariaLabel={ariaLabel}
        {...(accept !== undefined ? { accept } : {})}
        {...(readOnly !== undefined ? { readOnly } : {})}
        {...(required ? { required: true } : {})}
        {...(invalid ? { invalid: true } : {})}
        {...(describedBy !== undefined ? { describedBy } : {})}
      />
    );
  }

  const values = Array.isArray(value) ? value : [];

  function replaceAt(index: number, next: string | undefined) {
    const nextValues =
      next === undefined
        ? values.filter((_, i) => i !== index)
        : values.map((v, i) => (i === index ? next : v));
    store.getState().setValue(name, nextValues);
  }

  function removeAt(index: number) {
    store.getState().setValue(
      name,
      values.filter((_, i) => i !== index),
    );
  }

  function add(next: string | undefined) {
    if (next === undefined) return;
    store.getState().setValue(name, [...values, next]);
  }

  return (
    <div
      data-field="file-multi"
      role="group"
      {...(required ? { 'aria-required': true } : {})}
      {...(invalid ? { 'aria-invalid': true } : {})}
      {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
    >
      {values.map((url, index) =>
        isExternalUrl(url) ? (
          <div key={index} className="rcm-file-field-external-row">
            <ExternalUrlLink url={url} />
            {!readOnly && (
              <button type="button" aria-label={`Remove ${url}`} onClick={() => removeAt(index)}>
                ×
              </button>
            )}
          </div>
        ) : (
          <FileInput
            key={index}
            id={`${name}-${index}`}
            value={url}
            onChange={(next) => replaceAt(index, next)}
            ariaLabel={`${ariaLabel} ${index + 1}`}
            {...(accept !== undefined ? { accept } : {})}
            {...(readOnly !== undefined ? { readOnly } : {})}
          />
        ),
      )}
      {!readOnly && values.length < maxCount && (
        <FileInput
          id={`${name}-add`}
          onChange={add}
          ariaLabel={`${ariaLabel} 추가`}
          {...(accept !== undefined ? { accept } : {})}
        />
      )}
    </div>
  );
}
