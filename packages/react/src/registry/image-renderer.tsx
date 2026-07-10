import type { AssetConfig } from '@listgrid/schema-core';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// Image renderer (EA-C fan-out — Image). Transplant of 0.3.x
// `src/listgrid/components/fields/ImageField.tsx:141-189` (renderInstance):
// upload input + (when a value is present) an image preview. New engine
// posture, per ea-c-scout-briefing.md PART D "Image" + conductor decision ⑤:
//
//   - the upload seam is the EA-C0 pre-stage `UIComponents.FileInput` slot
//     (shared with File) — this renderer never speaks HTTP and never sources
//     or passes an `onUpload` callback itself; whether a file picker appears
//     at all is entirely up to whichever `FileInput` component the host
//     injected via useUI() (ui-default's own fallback takes an `onUpload`
//     prop internally and simply omits the picker when it's not supplied —
//     but supplying it is that component's business, not this renderer's).
//     Same posture as 0.3.x's headless-stub upload input (briefing PART A
//     "업로드 HTTP의 실제 위치") — the URL-edit path (`value`/`onChange`) fully
//     works with zero upload wiring.
//   - the thumbnail is a BARE `<img>` (previewSize applied via inline style)
//     instead of 0.3.x's `ImageFieldFormPreview` + click-to-enlarge modal —
//     the zoom modal is explicitly DESCOPED (Profile-renderer precedent for
//     "minimal placeholder, host can override the slot").
//   - 0.3.x's `getEndpoint('noImageFallback')` (a RuntimeConfig endpoint,
//     `/assets/images/no-image.png` default) has NO equivalent in the new
//     engine (no RuntimeConfig singleton) — DEVIATION (documented, not a
//     bug, briefing PART D "no-image 처리... deviation 기록"): when the value
//     is empty, this renderer shows no `<img>` at all (not even a broken/
//     placeholder one) — just the FileInput. A host that wants a no-image
//     placeholder image renders it itself by overriding the FileInput slot
//     (or wrapping this renderer's registration).
//
// Type-only `AssetConfig` import is already barrel-exported (EA-C0
// pre-stage); the ImageField CLASS itself is not (registration is the
// fan-out orchestrator's job per this task's hard rules) — so this file
// reads the field's extra members (`config`, `previewSize`,
// `resolveConfig()`) through a minimal structural interface instead of
// importing the concrete class, exactly mirroring how FieldRendererComponentProps
// already types `field: EntityField` generically.
interface ImageFieldLike {
  config?: AssetConfig;
  previewSize?: number | string;
  resolveConfig(): AssetConfig;
}

/**
 * Thumbnail style derived from the field's `previewSize` (px/CSS length) —
 * shared by every rendered `<img>`, single or multi mode.
 */
function thumbnailStyle(previewSize: number | string | undefined) {
  return previewSize !== undefined
    ? ({ width: previewSize, height: previewSize, objectFit: 'cover' as const } as const)
    : undefined;
}

export function ImageFieldRenderer({
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
  const imageField = field as unknown as ImageFieldLike;
  const resolvedConfig = imageField.resolveConfig();
  const maxCount = resolvedConfig.maxCount ?? 1;
  const multiple = maxCount > 1;
  const accept = resolvedConfig.fileTypes?.join(',');
  const style = thumbnailStyle(imageField.previewSize);

  if (!multiple) {
    const url = typeof value === 'string' ? value : undefined;

    function handleChange(next: string | undefined) {
      store.getState().setValue(name, next);
    }

    return (
      <div>
        <FileInput
          id={name}
          {...(url !== undefined ? { value: url } : {})}
          onChange={handleChange}
          {...(accept !== undefined ? { accept } : {})}
          {...(readOnly !== undefined ? { readOnly } : {})}
          {...(required ? { required: true } : {})}
          {...(invalid ? { invalid: true } : {})}
          {...(describedBy !== undefined ? { describedBy } : {})}
        />
        {url ? <img src={url} alt="" style={style} /> : null}
      </div>
    );
  }

  // Multi mode (maxCount>1) — EA-R1 #2 fix: mirror file-renderer.tsx's
  // multi-mode structure (one FileInput per hydrated URL + one adder slot
  // while under maxCount) instead of the old single-slot `[next]`
  // replace-the-whole-array posture, which showed only `value[0]` and
  // dropped every other pre-loaded URL on the very first edit.
  const values: string[] = Array.isArray(value) ? value : [];

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
      data-field="image-multi"
      role="group"
      {...(required ? { 'aria-required': true } : {})}
      {...(invalid ? { 'aria-invalid': true } : {})}
      {...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {})}
    >
      {values.map((url, index) => (
        <div key={index}>
          <FileInput
            id={`${name}-${index}`}
            value={url}
            onChange={(next) => replaceAt(index, next)}
            {...(accept !== undefined ? { accept } : {})}
            {...(readOnly !== undefined ? { readOnly } : {})}
          />
          <img src={url} alt="" style={style} />
          {!readOnly && (
            <button
              type="button"
              aria-label={`Remove image ${index + 1}`}
              onClick={() => removeAt(index)}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {!readOnly && values.length < maxCount && (
        <FileInput
          id={`${name}-add`}
          onChange={add}
          {...(accept !== undefined ? { accept } : {})}
        />
      )}
    </div>
  );
}
