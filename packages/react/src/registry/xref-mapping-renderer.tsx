import { useEffect, useMemo, useState } from 'react';
import type { StoreApi } from 'zustand';
import type { FilterItem, XrefMappingField, XrefMappingValue } from '@listgrid/schema-core';
import { SearchForm } from '@listgrid/schema-core';
import { createListStore, type ListStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { useAdapter } from '../providers/adapter';
import { useFieldValue, useFormStore } from '../providers/form-store';
import { ViewListGrid } from '../components/ViewListGrid';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// XrefMappingRenderer (EA-D2-1 — plain view only, ea-d2-xref-major-briefing.md
// §2/§3/§4). Two grids reusing ViewListGrid (EA-D2-0's minimal-4 extensions):
//   (a) a DISPLAY grid — IN(mapped ids), selection+toolbar's "삭제" moves a
//       checked id mapped→deleted (re-verified `XrefMappingView.tsx:73-130,
//       230-246`);
//   (b) a PICKER modal ("선택" button) — NOT_IN(mapped ids), onRowClick
//       single-adds+closes (old `onSelect`), selection+onConfirm multi-adds+
//       closes (old "선택 완료" `selection.actions`).
// Both queries also carry `config.filters()` (re-verified: the old view
// applied `filters` to BOTH `viewSearchForm` (display) AND `searchForm`
// (picker) — `XrefMappingView.tsx:100-103` — a domain filter like staffs'
// `assistant=true` must gate what's shown as mapped too, not just what's
// pickable).

function idsKey(ids: string[]): string {
  return ids.join(',');
}

async function resolveFilters(field: XrefMappingField): Promise<FilterItem[]> {
  return field.config.filters ? field.config.filters() : [];
}

export function XrefMappingRenderer({ field, name, readOnly }: FieldRendererComponentProps) {
  const { Button, Modal } = useUI();
  const store = useFormStore();
  const adapter = useAdapter();
  const value = useFieldValue<XrefMappingValue>(name);
  const xf = field as XrefMappingField;
  const target = useMemo(() => xf.getEntityForm(), [xf]);

  const mapped = value?.mapped ?? [];
  const deleted = value?.deleted ?? [];
  const mappedKey = idsKey(mapped);

  // --- display grid: IN(mapped), rebuilt whenever the mapped-id SET changes
  // (identity-stable via `mappedKey`, not the `mapped` array reference —
  // cancellation-safe: a stale in-flight filters() resolution from a
  // superseded id set is discarded). Empty mapped => NO store at all (no
  // ViewListGrid mount => no IN-with-empty-list fetch — the old view instead
  // sent the query with `withShouldReturnEmpty(true)`, a SearchForm flag this
  // engine's SearchForm has no equivalent of; skipping the fetch entirely is
  // the pragmatic parity: same visible empty-state result, one fewer network
  // round trip).
  const [displayStore, setDisplayStore] = useState<StoreApi<ListStoreState> | undefined>(undefined);

  useEffect(() => {
    if (mapped.length === 0) {
      setDisplayStore(undefined);
      return;
    }
    let cancelled = false;
    void (async () => {
      const filterItems = await resolveFilters(xf);
      if (cancelled) return;
      let initialSearch = SearchForm.create({ pageSize: 1000 }).addAndFilter({
        name: 'id',
        queryConditionType: 'IN',
        values: mapped,
      });
      for (const item of filterItems) initialSearch = initialSearch.addAndFilter(item);
      setDisplayStore(createListStore({ url: target.getUrl(), adapter, initialSearch }));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedKey, target, adapter, xf]);

  // --- picker modal: NOT_IN(mapped) [+ excludeId], resolved fresh on every
  // open (M2O filter-channel pattern, many-to-one-renderer.tsx).
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerStore, setPickerStore] = useState<StoreApi<ListStoreState> | undefined>(undefined);

  useEffect(() => {
    if (!pickerOpen) {
      setPickerStore(undefined);
      return;
    }
    let cancelled = false;
    void (async () => {
      const filterItems = await resolveFilters(xf);
      if (cancelled) return;
      let initialSearch = SearchForm.create();
      const excludeId = xf.getExcludeId();
      if (excludeId !== undefined) {
        initialSearch = initialSearch.addAndFilter({
          name: 'id',
          queryConditionType: 'NOT_EQUAL',
          value: excludeId,
        });
      }
      if (mapped.length > 0) {
        initialSearch = initialSearch.addAndFilter({
          name: 'id',
          queryConditionType: 'NOT_IN',
          values: mapped,
        });
      }
      for (const item of filterItems) initialSearch = initialSearch.addAndFilter(item);
      setPickerStore(createListStore({ url: target.getUrl(), adapter, initialSearch }));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen, mappedKey, target, adapter, xf]);

  function addIds(ids: string[]): void {
    let nextMapped = mapped;
    let nextDeleted = deleted;
    for (const id of ids) {
      nextMapped = nextMapped.filter((x) => x !== id);
      nextDeleted = nextDeleted.filter((x) => x !== id);
      nextMapped = [...nextMapped, id];
    }
    store.getState().setValue(name, { mapped: nextMapped, deleted: nextDeleted });
  }

  function deleteIds(ids: string[]): void {
    const nextMapped = mapped.filter((x) => !ids.includes(x));
    const nextDeleted = [...deleted.filter((x) => !ids.includes(x)), ...ids];
    store.getState().setValue(name, { mapped: nextMapped, deleted: nextDeleted });
  }

  const label = typeof field.getLabel() === 'string' ? String(field.getLabel()) : name;

  return (
    <div data-field="xrefMapping" data-xref-mapping={name}>
      {mapped.length === 0 ? (
        <div data-xref-empty>매핑된 항목이 없습니다.</div>
      ) : (
        displayStore && (
          <ViewListGrid
            entityForm={target}
            store={displayStore}
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
        <Button type="button" onClick={() => setPickerOpen(true)}>
          선택
        </Button>
      )}
      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title={`${label} 선택`}>
        {pickerOpen && pickerStore && (
          <ViewListGrid
            entityForm={target}
            store={pickerStore}
            onRowClick={(row) => {
              const id = row['id'];
              if (id === undefined || id === null) return;
              addIds([String(id)]);
              setPickerOpen(false);
            }}
            selection={{
              enabled: true,
              confirmLabel: '선택 완료',
              onConfirm: (ids) => {
                addIds(ids);
                setPickerOpen(false);
              },
            }}
          />
        )}
      </Modal>
    </div>
  );
}
