import { useEffect, useMemo, useState } from 'react';
import type { StoreApi } from 'zustand';
import type {
  EntityField,
  EntityForm,
  FilterItem,
  XrefPreferMappingField,
  XrefPreferMappingValue,
} from '@listgrid/schema-core';
import {
  BooleanField,
  ManyToOneField,
  EntityForm as SchemaEntityForm,
  SearchForm,
} from '@listgrid/schema-core';
import { createFormStore, createListStore, type ListStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { useAdapter } from '../providers/adapter';
import { useFieldValue, useFormStore } from '../providers/form-store';
import { ViewListGrid, type ViewListGridColumn } from '../components/ViewListGrid';
import { ViewEntityForm } from '../components/ViewEntityForm';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// XrefPreferMappingRenderer (EA-D2-1, ea-d2-xref-major-briefing.md §1/§3/§4/§5).
// One display grid (IN(mapped ids), a synthetic `preferred` column via the
// EA-D2-0 `columns` union, rows annotated via `postFetch` — re-verified old
// `XrefPreferMappingView.tsx:253-265` `onFetched` parity) + a mini-form modal
// ("ChildFormModal" isolation idiom, sub-collection-renderer.tsx) — its own
// EntityForm{ mapping: ManyToOneField(target, filter=NOT_IN mapped ids +
// config.filters), preferred: BooleanField } in an ISOLATED createFormStore,
// mounted fresh per open (mirrors sub-collection-renderer's `ChildFormModal`:
// "its own store per open (mount)").
//
// Save reads `data['mappingId']` — NOT `data['mapping']` — the M2O-flatten
// trap `form-store.ts` `toSaveData()` applies to every `manyToOne` field
// (`out['${name}Id'] = ...`); re-verified against the old view's own inline
// warning comment (`XrefPreferMappingView.tsx:172-176`).
//
// Scope note (not in EA-D2-1 spec item 5, deliberately NOT ported): the old
// view also let a click on an ALREADY-DISPLAYED row reopen the mini-form
// pre-filled to retoggle that row's `preferred` flag
// (`XrefPreferMappingView.tsx:238-246`, the display grid's `onSelect`). The
// spec's mini-form description is add-only ("append {id, preferred}");
// retoggling an existing row's preferred flag has no UI here — the only way
// to change which mapping is preferred is delete + re-add via the mini-form.

function idsKey(ids: string[]): string {
  return ids.join(',');
}

// Single-preferred enforcement (re-verified `XrefPreferMappingView.tsx`):
// - onDELETE (`onDelete:298-322`) DOES enforce it — if the removal leaves no
//   `preferred: true` row, `mapped[0]` is promoted. Ported below (`deleteIds`).
// - onSAVE/add (`onSave:203-220`) LOOKS like it enforces the same invariant
//   ("preferred 가 무조건 단 하나는 있어야 한다") but the `found` check tests
//   `item.id === target` against the array that was JUST pushed with that
//   exact `target` id — so `found` is unconditionally `true` and the
//   `mapped[0]!.preferred = true` branch is DEAD CODE, never observably
//   different from "just push {id, preferred} as given." Transplanted as
//   the OBSERVABLE behavior (push as-is, no forced promotion on add) rather
//   than the unreachable branch — `addMapping` below.
function promoteFirstIfNoPreferred(
  mapped: { id: string; preferred?: boolean }[],
): { id: string; preferred?: boolean }[] {
  if (mapped.length === 0 || mapped.some((m) => m.preferred === true)) return mapped;
  return mapped.map((m, i) => (i === 0 ? { ...m, preferred: true } : m));
}

function PreferMiniFormModal({
  target,
  currentIds,
  resolveConfigFilters,
  mappingLabel,
  preferredLabel,
  onAdd,
  onClose,
}: {
  target: EntityForm;
  currentIds: string[];
  resolveConfigFilters: () => Promise<FilterItem[]>;
  mappingLabel: string;
  preferredLabel: string;
  onAdd: (id: string, preferred: boolean) => void;
  onClose: () => void;
}) {
  const { Modal } = useUI();

  // Own EntityForm + store per open (mount) — sub-collection-renderer.tsx's
  // ChildFormModal isolation idiom: the mini-form's state never touches the
  // parent form's store, and reopening always starts create-mode blank.
  const [miniForm] = useState(() =>
    new SchemaEntityForm('XrefPreferMiniForm', target.getUrl()).addFields({
      items: [
        new ManyToOneField('mapping', 100, {
          entityForm: () => target,
          filter: async () => {
            const configFilters = await resolveConfigFilters();
            return currentIds.length > 0
              ? [
                  { name: 'id', queryConditionType: 'NOT_IN' as const, values: currentIds },
                  ...configFilters,
                ]
              : configFilters;
          },
        })
          .withLabel(mappingLabel)
          .withRequired(true),
        new BooleanField('preferred', 200).withLabel(preferredLabel).withDefaultValue(false),
      ],
    }),
  );
  const [store] = useState(() => createFormStore(miniForm, { renderType: 'create' }));

  return (
    <Modal open onClose={onClose} title={`${mappingLabel} 추가`}>
      <ViewEntityForm
        entityForm={miniForm}
        store={store}
        onSave={(data) => {
          const targetId = data['mappingId'];
          if (typeof targetId !== 'string') return;
          onAdd(targetId, data['preferred'] === true);
        }}
      />
    </Modal>
  );
}

export function XrefPreferMappingRenderer({ field, name, readOnly }: FieldRendererComponentProps) {
  const { Button, CheckBox } = useUI();
  const store = useFormStore();
  const adapter = useAdapter();
  const value = useFieldValue<XrefPreferMappingValue>(name);
  const xf = field as XrefPreferMappingField;
  const target = useMemo(() => xf.getEntityForm(), [xf]);

  const mapped = value?.mapped ?? [];
  const ids = mapped.map((m) => m.id);
  const mappedKey = idsKey(ids);
  const preferredLabel = xf.getPreferredLabel();
  const mappingLabel = typeof field.getLabel() === 'string' ? String(field.getLabel()) : name;

  async function resolveConfigFilters(): Promise<FilterItem[]> {
    return xf.config.filters ? xf.config.filters() : [];
  }

  // display grid — IN(mapped ids), rebuilt whenever the id SET changes;
  // postFetch annotates each row with its `preferred` flag from the CURRENT
  // value (re-verified old `onFetched` parity — XrefPreferMappingView.tsx:
  // 253-265). Empty mapped => no store mounted (XrefMapping's
  // no-IN-empty-query posture, ported here too).
  const [displayStore, setDisplayStore] = useState<StoreApi<ListStoreState> | undefined>(undefined);
  // EC-R1: a rejecting config.filters() must not strand the display grid
  // with a perpetually-undefined store (infinite blank) — surface a visible
  // error instead of hanging or falling back to an unfiltered store.
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setDisplayStore(undefined);
      setDisplayError(false);
      return;
    }
    let cancelled = false;
    setDisplayError(false);
    void (async () => {
      try {
        const configFilters = await resolveConfigFilters();
        if (cancelled) return;
        let initialSearch = SearchForm.create({ pageSize: 1000 }).addAndFilter({
          name: 'id',
          queryConditionType: 'IN',
          values: ids,
        });
        for (const item of configFilters) initialSearch = initialSearch.addAndFilter(item);
        setDisplayStore(
          createListStore({
            url: target.getUrl(),
            adapter,
            initialSearch,
            postFetch: (rows) =>
              rows.map((row) => {
                const match = mapped.find((m) => m.id === String(row['id']));
                return match ? { ...row, preferred: match.preferred === true } : row;
              }),
          }),
        );
      } catch (err) {
        if (cancelled) return;
        console.error(
          '[@listgrid/react] XrefPreferMappingRenderer display filter resolution failed',
          err,
        );
        setDisplayStore(undefined);
        setDisplayError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedKey, target, adapter, xf]);

  function defaultColumnNames(entityForm: EntityForm): string[] {
    const fields = entityForm.getFields().filter((f: EntityField) => f.type !== 'subCollection');
    const marked = fields.filter(
      (f: EntityField) => 'showInList' in f && (f as { showInList?: boolean }).showInList === true,
    );
    if (marked.length > 0) return marked.map((f: EntityField) => f.getName());
    return fields
      .filter((f: EntityField) => f.hidden !== true)
      .slice(0, 4)
      .map((f: EntityField) => f.getName());
  }

  const columns: ViewListGridColumn[] = useMemo(
    () => [
      ...defaultColumnNames(target),
      {
        name: 'preferred',
        label: preferredLabel,
        render: (row: Record<string, unknown>) => (
          <CheckBox ariaLabel={preferredLabel} checked={row['preferred'] === true} disabled />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [target, preferredLabel],
  );

  const [editing, setEditing] = useState(false);

  function addMapping(id: string, preferred: boolean): void {
    // structural dup guard — the mini-form's own NOT_IN(currentIds) filter
    // already keeps an already-mapped id off the picker in normal use, so
    // this is a defensive no-op rather than a surfaced error (deviation from
    // the old view's "이미 등록된 정보입니다" form-level error — this engine's
    // form store has no form-level-error write channel outside validateAll,
    // see EA-D2-1 notes).
    if (mapped.some((m) => m.id === id)) {
      setEditing(false);
      return;
    }
    const nextMapped = [...mapped, { id, preferred }];
    store.getState().setValue(name, { mapped: nextMapped });
    setEditing(false);
  }

  function deleteIds(idsToRemove: string[]): void {
    const remaining = mapped.filter((m) => !idsToRemove.includes(m.id));
    const nextMapped = promoteFirstIfNoPreferred(remaining);
    store.getState().setValue(name, { mapped: nextMapped });
  }

  return (
    <div data-field="xrefPreferMapping" data-xref-prefer-mapping={name}>
      {ids.length === 0 ? (
        <div data-xref-empty>매핑된 항목이 없습니다.</div>
      ) : displayError ? (
        <div role="alert">목록 필터를 불러오지 못했습니다.</div>
      ) : (
        displayStore && (
          <ViewListGrid
            entityForm={target}
            store={displayStore}
            columns={columns}
            selection={{ enabled: !readOnly, onConfirm: () => {} }}
            toolbar={({ checkedIds }) =>
              !readOnly ? (
                <Button
                  type="button"
                  disabled={checkedIds.length === 0}
                  onClick={() => deleteIds(checkedIds)}
                >
                  삭제
                </Button>
              ) : null
            }
          />
        )
      )}
      {!readOnly && (
        <Button type="button" onClick={() => setEditing(true)}>
          불러오기
        </Button>
      )}
      {editing && (
        <PreferMiniFormModal
          target={target}
          currentIds={ids}
          resolveConfigFilters={resolveConfigFilters}
          mappingLabel={mappingLabel}
          preferredLabel={preferredLabel}
          onAdd={addMapping}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
