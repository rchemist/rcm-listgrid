import type { EntityForm } from '../entity-form';
import { NumberField, StringField } from './basic-fields';
import type { EntityField } from './entity-field';
import { FormField } from './form-field';

// AddressField + applyFullAddressFields (Phase EB, plan §EB — Daum 우편번호,
// documents/plans/e-track-field-parity.md). Transplant of the 0.3.x pair
// `src/listgrid/components/fields/address/AddressMapField.tsx:13-84` (Address
// type + field class) and `ApplyFullAddressFields.tsx:92-279` (helper),
// re-verified against source 2026-07-11 — REDUCED to the schema-declaration
// half (schema-core is React-free, charter C4); the Daum postcode picker UI
// is EB2 (`@listgrid/react` AddressRenderer).

/**
 * The address value shape (0.3.x `AddressMapField.tsx:13-21` `Address` — member-for-member
 * parity). `address1`/`postalCode` are the two flat carriers that CAN be required (see
 * {@link applyFullAddressFields}); `address2` is present (Daum never returns a detail
 * address, so it starts blank and the user fills it in) but never required.
 */
export interface Address {
  state?: string;
  city?: string;
  address1: string;
  address2: string;
  postalCode: string;
  longitude?: number;
  latitude?: number;
}

/**
 * Address (0.3.x `AddressMapField`, type `'custom'`; new type `'address'`) — a VIRTUAL
 * composite handle over the Daum-postcode-driven address picker. Unlike every other field
 * class, this field's OWN store slice is never the save-of-record: the server stores flat
 * columns (state/city/address1/address2/postalCode[/longitude/latitude]), carried by sibling
 * `StringField`/`NumberField` instances that {@link applyFullAddressFields} declares alongside
 * it (name-prefixed, e.g. `${prefix}address1`).
 *
 * `exceptOnSave = true` (the flag already declared on the base `FormField`, `form-field.ts`,
 * and already consulted unconditionally by `@listgrid/state`'s `toSaveData()` —
 * `form-store.ts:495` `if (field.exceptOnSave) continue;`, confirmed BEFORE this class was
 * written, no `@listgrid/state` change needed for EB1) keeps this composite's own value OUT of
 * every save payload, so a renderer that also happens to touch this field's store slot can
 * never leak a nested `address: {...}` key into a save request expecting flat columns.
 *
 * `required` is DELIBERATELY NOT exposed as a constructor/builder concern here — see
 * {@link applyFullAddressFields} for why required lives on the flat siblings instead.
 */
export class AddressField extends FormField<Address> {
  /** Whether the AddressRenderer (EB2) should also show a map preview. Declaration-only meta
   *  — the renderer owns the actual map widget / Kakao-key wiring (plan §EB: Kakao 지도는 EB
   *  필수 아님·연기, so this flag is currently inert until EB2 wires a map). */
  showMap?: boolean;

  constructor(name: string, order: number, showMap?: boolean) {
    super(name, order, 'address');
    this.exceptOnSave = true;
    if (showMap !== undefined) this.showMap = showMap;
  }
}

/** 0.3.x `appendLastDot` (`AddressMapField.tsx:76-84`) — normalizes a name prefix to always
 *  end in exactly one `.` (or `''` when unset), so sibling names compose as `${prefix}state`. */
function appendLastDot(str?: string): string {
  if (!str || str.length === 0) return '';
  return str.endsWith('.') ? str : `${str}.`;
}

const ADDRESS_SIBLING_LABELS = {
  state: '시/도',
  city: '시/군/구',
  address1: '주소1',
  address2: '상세 주소',
  postalCode: '우편번호',
  longitude: '경도',
  latitude: '위도',
} as const;

export interface AddressFieldsProps {
  /** dot-prefix applied to the composite + every flat sibling name (0.3.x parity —
   *  `appendLastDot`; e.g. prefix `'user'` → composite `'user.address'`, siblings
   *  `'user.state'` / `'user.city'` / ... — a trailing `.` is normalized away). */
  prefix?: string;
  /** composite field's order; siblings are ordered immediately after it. Default 1000
   *  (0.3.x `ApplyFullAddressFields.tsx:159` default). */
  order?: number;
  /** composite field label (default '주소'). */
  label?: string;
  /** whether address1/postalCode are required. 0.3.x parity in SPIRIT only — the 0.3.x
   *  helper also set `withRequired` on the composite itself (`ApplyFullAddressFields.tsx:165`);
   *  the new engine deliberately does NOT (see {@link AddressField} doc) since nothing writes
   *  the composite's own store slot. */
  required?: boolean;
  /** passthrough to `AddressField.showMap` (EB2 concern, plan §EB — Kakao 지도 연기). */
  showMap?: boolean;
  /** also declare `longitude`/`latitude` NumberField siblings (0.3.x `showLongitudeLatitude`). */
  showLongitudeLatitude?: boolean;
  tab?: { id: string; label?: string; order?: number };
  fieldGroup?: { id: string; label?: string; order?: number };
}

/**
 * Declare a composite {@link AddressField} (`${prefix}address`) + its flat sibling carriers
 * (`StringField` state/city/address1/address2/postalCode[, `NumberField` longitude/latitude])
 * on `entityForm`. Transplant of 0.3.x `applyFullAddressFields`
 * (`ApplyFullAddressFields.tsx:92-279`), reduced to the schema-declaration half:
 *
 *   - the 0.3.x `withOnChanges` cascade (:222-243 — pushing the composite's OWN value down to
 *     siblings on selection) has no equivalent here: EB2's AddressRenderer writes siblings
 *     DIRECTLY via the store (same store-direct-write posture as `InlineMapField`, EA-D — see
 *     `inline-map-field.ts` header), so there is nothing for an onChanges handler to cascade.
 *   - the 0.3.x `withOnFetchData` hook (:245-278 — synthesizing a composite value from flat
 *     fetched columns) is unneeded: `@listgrid/state`'s `hydrate()` (`form-store.ts:345-366`,
 *     via `resolveFetchedValue`) already seeds EVERY declared field — flat or dotted name —
 *     straight from the fetched record, siblings included (plan §EB: "hydrate가 flat 필드를
 *     data[name]/data['user.state']에서 이미 seed→onFetchData 불요", verified by reading
 *     `resolveFetchedValue`, `form-store.ts:23-31`, which walks `name.split('.')`).
 *
 * DEVIATION (recorded, EB1): siblings are declared VISIBLE — `withHidden(true)` is
 * DELIBERATELY NOT applied, even though the AddressRenderer (EB2) is meant to visually own
 * them. `FormField.validate()` short-circuits the ENTIRE required/validations check when a
 * field is hidden OR readonly (`form-field.ts:110-112`, itself a faithful transplant of the
 * 0.3.x `FormField.tsx:786-789` short-circuit) — declaring `address1`/`postalCode` hidden
 * would make their `required` silently dead code (never evaluated by `validateField`/
 * `validateAll`, `@listgrid/state` `form-store.ts:442-467`), defeating the plan's explicit
 * "required는 형제(address1/postalCode)에 부여→기존 Validation 기계 재사용" requirement. Any
 * standalone-rendering suppression of the siblings is therefore an EB2 (renderer-layer)
 * concern — e.g. the ViewEntityForm/FieldRenderer iteration excluding fields a composite
 * claims ownership of — NOT a `hidden` declaration here, since `hidden` (declared OR the EF1
 * runtime meta override — both are read through the exact same `override?.hidden ?? ...`
 * expression) would suppress validation too, not just rendering.
 */
export function applyFullAddressFields(
  entityForm: EntityForm,
  props?: AddressFieldsProps,
): EntityForm {
  const prefix = appendLastDot(props?.prefix);
  const addressName = `${prefix}address`;
  const baseOrder = props?.order ?? 1000;
  const required = props?.required ?? false;
  const showLongitudeLatitude = props?.showLongitudeLatitude ?? false;

  const stringSibling = (
    key: 'state' | 'city' | 'address1' | 'address2' | 'postalCode',
    order: number,
    isRequired: boolean,
  ): StringField => {
    const field = new StringField(`${prefix}${key}`, order).withLabel(ADDRESS_SIBLING_LABELS[key]);
    if (isRequired) field.withRequired(true);
    return field;
  };
  const numberSibling = (key: 'longitude' | 'latitude', order: number): NumberField =>
    new NumberField(`${prefix}${key}`, order).withLabel(ADDRESS_SIBLING_LABELS[key]);

  const items: EntityField[] = [
    new AddressField(addressName, baseOrder, props?.showMap).withLabel(props?.label ?? '주소'),
    stringSibling('state', baseOrder + 1, false),
    stringSibling('city', baseOrder + 2, false),
    stringSibling('address1', baseOrder + 3, required),
    stringSibling('address2', baseOrder + 4, false),
    stringSibling('postalCode', baseOrder + 5, required),
  ];
  if (showLongitudeLatitude) {
    items.push(numberSibling('longitude', baseOrder + 6), numberSibling('latitude', baseOrder + 7));
  }

  entityForm.addFields({
    ...(props?.tab !== undefined ? { tab: props.tab } : {}),
    ...(props?.fieldGroup !== undefined ? { fieldGroup: props.fieldGroup } : {}),
    items,
  });

  return entityForm;
}
