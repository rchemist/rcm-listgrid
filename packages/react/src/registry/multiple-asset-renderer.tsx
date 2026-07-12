import { useState } from 'react';
// MultipleAssetField/AssetItem are not yet re-exported from the
// @listgrid/schema-core barrel (shared file — registration is the fan-out
// orchestrator's job, per this task's hard rules). Import straight from the
// sibling package's module so this renderer type-checks/builds standalone;
// behavior under the eventual barrel export is identical (same module).
import type {
  AssetItem,
  MultipleAssetField,
} from '../../../schema-core/src/field/multiple-asset-field';
import { useUI } from '../providers/ui';
import { useAssetUrl } from '../providers/asset-base';
import { useFieldValue, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// MultipleAssetField renderer (EA-C fan-out) — transplant of 0.3.x
// `MultipleAssetFieldView` (`src/listgrid/components/fields/
// MultipleAssetField.tsx:101-407`) + `view/MultipleAssetUpload.tsx:1-63`.
// Re-verified against source 2026-07-11. Faithful to the named-slot UX: a
// grid of fixed named slots (`field.tags`) plus any extra slot names present
// in the current value; clicking a slot opens the shared `Modal` primitive
// with an add/edit dialog (slot-name/description/url + primary flag); the
// slot-name input is gated by `RegexLowerEnglishNumber` (0.3.x
// `misc/index.ts:30`, lowercase-ascii+digits, Korean error text ported
// verbatim, :309-326); the `'Primary'`-NAMED slot never shows a delete
// affordance (:165,183-210). Store-write only for the field VALUE
// (`AssetItem[]`, conductor decision ④) — every other piece of interaction
// state (which slot is open, the in-progress edit draft, the validation
// error) is local `useState`, exactly like the old view (no global modal
// store, per this task's brief).
//
// Upload seam: the URL is a plain string, edited directly through the
// EA-C0 `FileInput` UI slot (`useUI().FileInput`). This renderer never
// invents or sources an `onUpload` function — schema-core/react own no
// upload HTTP (hard rule) and `UIComponents` carries no upload-fn channel
// alongside the component registry, so a host that wants real uploads
// overrides the injected `FileInput` COMPONENT itself (via `<UIProvider
// components={{ ...defaultUIComponents, FileInput: HostFileInput }}>`) with
// one that wires uploads internally; the ui-default fallback renders a
// plain URL text field only (no file picker without `onUpload`, which this
// renderer never supplies) — the URL-edit path works end-to-end with zero
// host wiring, matching decision ② ("edustack-parity, no upload wiring
// today").
//
// Deviations from the literal 0.3.x view (recorded — see task
// `deviations[]`):
//  1. Old code bootstrapped one BLANK `AssetItem{name:tag,url:''}` per fixed
//     tag into local view state on first mount even when there was no saved
//     value (:122-130), and `deepCopy(value)` (the base for every subsequent
//     save, :384) carried those untouched blanks along — so saving any ONE
//     slot could commit empty placeholder entries for every OTHER
//     configured-but-untouched tag into `MultipleAssetForm.assets`. Under
//     the new plain-`AssetItem[]` value contract (decision ④, `[]`-is-blank,
//     `../field/value.ts`) that would silently defeat `withRequired` (a
//     "non-empty" array of blank placeholders reads as populated) and is
//     also visibly wrong (broken-image cells for slots the user never
//     touched). This renderer instead DERIVES the displayed grid (one cell
//     per `field.tags` entry, always, whether filled or not, plus one cell
//     per extra name already present in the committed value) straight from
//     the store value on every render — no placeholder items are ever
//     written to the store. The visible "one cell per configured tag" grid
//     affordance is preserved; only the store-pollution side effect is not.
//  2. Old code's delete handler additionally dropped a FIXED tag out of
//     local `tags` state after deleting its item (:197-199), making that
//     slot vanish from the grid entirely (irrecoverable without a remount).
//     Because this renderer derives the grid from `field.tags` (fixed) ∪
//     (extra names still present in the value) rather than mutable local
//     state, deleting a fixed tag's item here leaves the slot in place,
//     empty and re-addable — the old vanishing-slot behavior is not
//     reproduced (judged a bug, not an intentional UX point worth
//     transplanting).
//  3. Old code's per-slot click handler used the SLOT'S POSITION IN
//     `tags[]` as an index directly into `value.assets[]` (:167,221,236,
//     "value?.assets?.[index]") — only correct when the two arrays stay
//     positionally aligned. This renderer looks the matching asset up BY
//     NAME (`assets.find(a => a.name === tag)`) instead, which is robust to
//     any array ordering and is what the old code was evidently trying to
//     express.
//  4. The old wrapper's single `preferred: string` (the tag name of the
//     "current featured" asset, set automatically to `currentEdit.name`
//     whenever the item saved was filed under the literal `'Primary'` slot,
//     :393) becomes an explicit per-item `primary?: boolean` toggle
//     (conductor decision ④) exposed as a checkbox in the add/edit dialog,
//     on ANY slot (not just the one literally named `'Primary'`) — saving
//     an item with the toggle on clears `primary` from every other item
//     (single-primary invariant preserved). This is a genuine UX surface
//     the old view did not have (it inferred "primary" purely from the slot
//     name); flagged since briefing PART A only asked for value-shape
//     equivalence, not a new toggle control.

/** 0.3.x `RegexLowerEnglishNumber` (`src/listgrid/misc/index.ts:30`) —
 *  lowercase ascii letters + digits only, 1-100 chars. Transplanted
 *  verbatim (pattern + intent); the Korean validation messages below are
 *  ported verbatim from `MultipleAssetField.tsx:309-326,379-382`. */
const RegexLowerEnglishNumber = /^[a-z0-9]{1,100}$/;

const EMPTY_DRAFT: AssetItem = { name: '', url: '' };

export function MultipleAssetFieldRenderer({
  field,
  name,
  readOnly,
  required,
  invalid,
  describedBy,
}: FieldRendererComponentProps) {
  const { Modal, TextInput, FileInput, CheckBox, Button } = useUI();
  const resolveAsset = useAssetUrl();
  const store = useFormStore();
  const value = useFieldValue<AssetItem[]>(name);
  const assetField = field as MultipleAssetField;
  const fixedTags = assetField.tags ?? [];
  const assets = value ?? [];

  // Displayed grid = fixed tags (always shown, filled or not) + any extra
  // names already present in the value that aren't one of the fixed tags
  // (slots the user added via "+ 추가"). Deviation 1/2 above.
  const extraTags = assets
    .map((a) => a.name)
    .filter((n): n is string => n !== undefined && n !== '' && !fixedTags.includes(n));
  const slots = [...fixedTags, ...extraTags];

  const [open, setOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<AssetItem>(EMPTY_DRAFT);
  const [error, setError] = useState('');

  function openForAdd() {
    setError('');
    setEditingTag(undefined);
    setDraft(EMPTY_DRAFT);
    setOpen(true);
  }

  function openForSlot(tag: string) {
    setError('');
    const existing = assets.find((a) => a.name === tag);
    setEditingTag(tag);
    setDraft(existing ?? { name: tag, url: '' });
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingTag(undefined);
    setDraft(EMPTY_DRAFT);
    setError('');
  }

  function removeSlot(tag: string) {
    store.getState().setValue(
      name,
      assets.filter((a) => a.name !== tag),
    );
  }

  /** Transplant of the name-input onChange gate, MultipleAssetField.tsx:309-326. */
  function handleNameChange(raw: string) {
    if (raw.trim() === '') {
      setError('이미지의 이름을 영문/숫자로 입력하세요.');
      setDraft({ ...draft, name: raw });
      return;
    }
    if (slots.includes(raw) && raw !== editingTag) {
      setError('중복된 이미지 이름이 존재합니다. 다른 이름을 입력해야 합니다.');
      return;
    }
    if (!RegexLowerEnglishNumber.test(raw)) {
      setError('영문 소문자/숫자만 입력할 수 있습니다');
      return;
    }
    setError('');
    setDraft({ ...draft, name: raw });
  }

  /** Transplant of the Save-button gate, MultipleAssetField.tsx:378-397. */
  function save() {
    if (!draft.name || draft.name.trim() === '') {
      setError('이미지 유형의 이름을 입력해야 합니다.');
      return;
    }
    if (!draft.url || draft.url.trim() === '') {
      setError('이미지를 업로드해 주세요.');
      return;
    }

    let next = assets.filter((a) => a.name !== draft.name);
    const saved: AssetItem = { ...draft };
    if (saved.primary) {
      // single-primary invariant (conductor decision ④, deviation 4 above).
      next = next.map((a) => {
        if (!a.primary) return a;
        const { primary: _demoted, ...rest } = a;
        return rest;
      });
    }
    next = [...next, saved];
    store.getState().setValue(name, next);
    close();
  }

  const accept =
    assetField.fileTypes && assetField.fileTypes.length > 0
      ? assetField.fileTypes.join(',')
      : 'image/*';
  const label = field.getLabel();
  const listLabel = typeof label === 'string' ? label : name;

  return (
    <div data-field="multipleAsset">
      <div role="list" aria-label={listLabel}>
        {slots.map((tag) => {
          const asset = assets.find((a) => a.name === tag);
          const filled = asset !== undefined && asset.url !== '';
          const isPrimarySlot = tag === 'Primary';
          return (
            <div key={tag} role="listitem" data-slot={tag}>
              <span>{tag}</span>
              {asset?.primary && <span aria-label="primary asset"> ★</span>}
              {!isPrimarySlot && !readOnly && filled && (
                <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeSlot(tag)}>
                  ×
                </button>
              )}
              <button
                type="button"
                aria-label={filled ? `Edit ${tag}` : `Add ${tag}`}
                disabled={readOnly}
                onClick={() => openForSlot(tag)}
              >
                {filled ? (
                  <img
                    src={resolveAsset(asset!.url)}
                    alt={asset!.description ?? asset!.name ?? ''}
                  />
                ) : (
                  '+'
                )}
              </button>
            </div>
          );
        })}
      </div>
      {/* `id={name}` intentionally NOT set here: the FieldRenderer wrapper's
          `<label htmlFor={name}>` would then override this BUTTON's own
          accessible name ("+ 추가") with the label text (a labelable-element
          association quirk, same class of issue field-a11y.test.tsx flags
          for TagsInput's non-labelable wrapper, just inverted) — so, like
          that renderer, this composite widget is queried through the stable
          `[data-field-name]` wrapper in tests rather than
          `findByLabelText`/id association. required/invalid/describedBy
          still forward as aria attributes (a11y contract, H2). */}
      {!readOnly && (
        <button
          type="button"
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onClick={openForAdd}
        >
          + 추가
        </button>
      )}

      <Modal
        open={open}
        onClose={close}
        title={editingTag !== undefined ? '이미지 수정' : '새 이미지 추가'}
      >
        <div>
          <span>이미지 유형</span>
          <TextInput
            ariaLabel="이미지 유형"
            placeholder="이미지 유형"
            value={draft.name ?? ''}
            readOnly={editingTag !== undefined}
            onChange={handleNameChange}
          />
        </div>
        <div>
          <span>Alt Tag</span>
          <TextInput
            ariaLabel="Alt Tag"
            placeholder="Alt tag"
            value={draft.description ?? ''}
            onChange={(v) => setDraft({ ...draft, description: v })}
          />
        </div>
        <div>
          <span>Image</span>
          <FileInput
            ariaLabel="Image"
            value={draft.url}
            accept={accept}
            onChange={(url) => setDraft({ ...draft, url: url ?? '' })}
          />
        </div>
        <div>
          <label>
            <CheckBox
              ariaLabel="Primary"
              checked={draft.primary === true}
              onChange={(checked) => {
                if (checked) {
                  setDraft({ ...draft, primary: true });
                } else {
                  const { primary: _cleared, ...rest } = draft;
                  setDraft(rest);
                }
              }}
            />
            Primary
          </label>
        </div>
        {error !== '' && <div role="alert">{error}</div>}
        {!readOnly && (
          <Button type="button" variant="primary" onClick={save}>
            {editingTag !== undefined ? '이미지 수정' : '이미지 등록'}
          </Button>
        )}
      </Modal>
    </div>
  );
}
