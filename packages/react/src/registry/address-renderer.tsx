import { useEffect, useMemo, useRef, useState } from 'react';
import { addressSiblingNames } from '@listgrid/schema-core';
import DaumPostcode from 'react-daum-postcode';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormField, useFormStore } from '../providers/form-store';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// AddressRenderer (EB2 — plan §EB, documents/plans/e-track-field-parity.md). Transplant of the
// 0.3.x PostCodeSelector/AddressFieldView pair
// (`src/listgrid/components/fields/address/PostCodeSelector.tsx`,
// `.../address/AddressFieldView.tsx`), re-verified against source 2026-07-11 — REDUCED to a
// single-shot picker (no `주소 제거`/session-remount ceremony: the store-direct-write posture,
// EA-D `InlineMap` precedent, makes those unnecessary here) and using `react-daum-postcode`
// DIRECTLY (ADR-sanctioned exception — root `package.json` already carries it as a peer for
// exactly this precedent) rather than the 0.3.x hand-rolled `loadPostcode` script loader.
//
// This is the ONLY renderer this composite field owns: the 5 flat siblings
// (state/city/address1/address2/postalCode) `applyFullAddressFields` declares are all marked
// `renderedBy` the composite's name (`form-field.ts` doc), so `ViewEntityForm`'s standalone
// iteration skips their OWN `<FieldRenderer>` — this component is the sole place their editors
// (or read-only displays) exist. Validation is UNAFFECTED by that suppression (the whole point
// vs `hidden` — `address-field.ts` header): required/invalid state below is read directly off
// each sibling's OWN store slice (`useFormField`) — the exact same slice `validateAll` writes
// into — so a save attempt with a blank required sibling shows up here exactly as it would have
// on a standalone `<FieldRenderer>`.
//
// Values written on `onComplete` (0.3.x `handleDaumComplete` parity, minus longitude/latitude —
// Daum's popup never returns coordinates, so there is nothing to fan out to those siblings even
// when `showLongitudeLatitude` declared them): postalCode←zonecode, address1←roadAddress,
// state←sido, city←sigungu, each a plain `store.getState().setValue()` commit (cascade default —
// same store-direct-write posture as `InlineMapFieldRenderer`). `address2` is deliberately left
// untouched (Daum never returns a detail address) and receives focus once the modal has actually
// closed, so the user's next keystroke goes straight into the field they still need to fill in.

interface DaumPostcodeResult {
  zonecode: string;
  roadAddress: string;
  sido: string;
  sigungu: string;
}

export function AddressFieldRenderer({ name, readOnly }: FieldRendererComponentProps) {
  const { TextInput, Button, Modal } = useUI();
  const store = useFormStore();
  const names = useMemo(() => addressSiblingNames(name), [name]);

  const postalCode = useFieldValue<string>(names.postalCode) ?? '';
  const address1 = useFieldValue<string>(names.address1) ?? '';
  const address2 = useFieldValue<string>(names.address2) ?? '';
  const state = useFieldValue<string>(names.state) ?? '';
  const city = useFieldValue<string>(names.city) ?? '';

  const postalCodeSlice = useFormField(names.postalCode);
  const address1Slice = useFormField(names.address1);
  const postalCodeErrors = postalCodeSlice.errors ?? [];
  const address1Errors = address1Slice.errors ?? [];

  // Sibling `required` is a declared boolean here — `applyFullAddressFields` never sets a
  // conditional RequiredType on address1/postalCode (see its `required` prop doc) — so a
  // direct read off the live field registry is exact; no async predicate resolution needed
  // (contrast FieldRenderer's isRequired()/isHidden() dance, which exists for the general
  // conditional case these siblings never use).
  const postalCodeRequired = store.getState().fieldDefs[names.postalCode]?.required === true;
  const address1Required = store.getState().fieldDefs[names.address1]?.required === true;

  const [open, setOpen] = useState(false);
  // Set right before setOpen(false) inside handleComplete only — NOT on every close (e.g. the
  // user dismissing the picker without completing) — so address2 only steals focus after an
  // actual selection, never on a bare cancel.
  const focusAddress2Ref = useRef(false);

  useEffect(() => {
    if (!open && focusAddress2Ref.current) {
      focusAddress2Ref.current = false;
      document.getElementById(names.address2)?.focus();
    }
  }, [open, names.address2]);

  function handleComplete(data: DaumPostcodeResult): void {
    const s = store.getState();
    s.setValue(names.postalCode, data.zonecode);
    s.setValue(names.address1, data.roadAddress);
    s.setValue(names.state, data.sido);
    s.setValue(names.city, data.sigungu);
    focusAddress2Ref.current = true;
    setOpen(false);
  }

  const postalCodeErrorId = postalCodeErrors.length > 0 ? `${names.postalCode}-error` : undefined;
  const address1ErrorId = address1Errors.length > 0 ? `${names.address1}-error` : undefined;

  return (
    <div data-field="address">
      <div data-address-row="postalCode">
        <TextInput
          id={names.postalCode}
          value={postalCode}
          readOnly
          {...(postalCodeRequired ? { required: true } : {})}
          {...(postalCodeErrorId !== undefined
            ? { invalid: true, describedBy: postalCodeErrorId }
            : {})}
        />
        {!readOnly && (
          <Button type="button" onClick={() => setOpen(true)}>
            주소 찾기
          </Button>
        )}
      </div>
      {postalCodeErrorId !== undefined && (
        <ul id={postalCodeErrorId} role="alert">
          {postalCodeErrors.map((err, i) => (
            <li key={i}>{err.message}</li>
          ))}
        </ul>
      )}

      <div data-address-row="address1">
        <TextInput
          id={names.address1}
          value={address1}
          readOnly
          {...(address1Required ? { required: true } : {})}
          {...(address1ErrorId !== undefined
            ? { invalid: true, describedBy: address1ErrorId }
            : {})}
        />
      </div>
      {address1ErrorId !== undefined && (
        <ul id={address1ErrorId} role="alert">
          {address1Errors.map((err, i) => (
            <li key={i}>{err.message}</li>
          ))}
        </ul>
      )}

      {(state || city) && (
        <div data-address-row="state-city">{[state, city].filter(Boolean).join(' ')}</div>
      )}

      <div data-address-row="address2">
        <TextInput
          id={names.address2}
          value={address2}
          onChange={(v) => store.getState().setValue(names.address2, v)}
          {...(readOnly !== undefined ? { readOnly } : {})}
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="주소 검색">
        {open && <DaumPostcode onComplete={handleComplete} />}
      </Modal>
    </div>
  );
}
