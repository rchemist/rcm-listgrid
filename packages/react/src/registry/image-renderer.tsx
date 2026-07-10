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
 * The value store may hold a plain `string` (single image, the common
 * maxCount<=1 case) or a `string[]` (multi-image, maxCount>1 — conductor
 * decision ①). The FileInput slot's contract (EA-C0 pre-stage,
 * `packages/ui-default/src/types.ts` `FileInputProps`) is single-string only,
 * so both the display value AND the thumbnail source read the FIRST url out
 * of either shape — parity with 0.3.x's own `pickImageUrl` picking
 * `existFiles[0]` (ImageField.tsx:56-64).
 */
function firstUrl(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
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
  const multiple = (resolvedConfig.maxCount ?? 1) > 1;
  const url = firstUrl(value);
  const accept = resolvedConfig.fileTypes?.join(',');

  function handleChange(next: string | undefined) {
    if (multiple) {
      store.getState().setValue(name, next === undefined ? [] : [next]);
    } else {
      store.getState().setValue(name, next);
    }
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
      {url ? (
        <img
          src={url}
          alt=""
          style={
            imageField.previewSize !== undefined
              ? {
                  width: imageField.previewSize,
                  height: imageField.previewSize,
                  objectFit: 'cover',
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
