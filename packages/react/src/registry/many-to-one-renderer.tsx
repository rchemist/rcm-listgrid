import { useEffect, useMemo, useState } from 'react';
import type { StoreApi } from 'zustand';
import type { ManyToOneField } from '@listgrid/schema-core';
import { SearchForm } from '@listgrid/schema-core';
import { createListStore, type ListStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { useAdapter, useReferenceResolver } from '../providers/adapter';
import { useFieldValue, useFormStore } from '../providers/form-store';
import { ViewListGrid } from '../components/ViewListGrid';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// ManyToOne renderer (charter C3 — relations are 1급). The keystone renderer:
// it REUSES ViewListGrid as a searchable picker inside a Modal, so selecting a
// reference exercises the whole list+provider stack. Selecting a row writes the
// full entity into this field's slice; the form store flattens it to `<name>Id`
// on save (toSaveData). Reload shows the referenced entity's label, resolving
// a bare id through the adapter when necessary.

function labelOf(value: unknown, labelField: string): string {
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    return String(rec[labelField] ?? rec['name'] ?? rec['id'] ?? '');
  }
  return value != null ? String(value) : '';
}

export function ManyToOneRenderer({ field, name, readOnly }: FieldRendererComponentProps) {
  const { Button, Modal } = useUI();
  const store = useFormStore();
  const adapter = useAdapter();
  const resolveReference = useReferenceResolver();
  const value = useFieldValue<unknown>(name);
  const m2o = field as ManyToOneField;
  const labelField = typeof m2o.getLabelField === 'function' ? m2o.getLabelField() : 'name';

  const target = useMemo(() => m2o.getEntityForm(), [m2o]);
  const pickerStore = useMemo(
    () => createListStore({ url: target.url, adapter }),
    [target, adapter],
  );

  const [open, setOpen] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState<string | undefined>(undefined);

  // EA-D2-0 M2O filter channel (decision ②): config.filter, when present, is
  // resolved fresh EVERY time the picker opens — the resolved FilterItem[]
  // becomes the filtered picker store's `initialSearch` (AND-ed). Covers the
  // XrefPrefer mini-form filter and a self-referencing entity's exclude-self
  // filter (e.g. parentMajor's NOT_EQUAL on its own id). Cancellation-safe:
  // a close (or unmount) before resolution discards the result.
  const [filteredStore, setFilteredStore] = useState<StoreApi<ListStoreState> | undefined>(
    undefined,
  );
  // EC-R1: a rejecting config.filter must not strand the picker with a
  // perpetually-undefined filteredStore (infinite blank) — surface a visible
  // error instead of silently hanging or falling back to the unfiltered
  // pickerStore (these filters express exclusion, e.g. parentMajor's
  // NOT_EQUAL self; an unfiltered fallback would let a user pick a
  // duplicate/self).
  const [filterError, setFilterError] = useState(false);

  useEffect(() => {
    if (!open) {
      // clear so the NEXT open re-resolves rather than reusing a stale
      // filtered store from a previous open.
      setFilteredStore(undefined);
      setFilterError(false);
      return;
    }
    const resolveFilter = m2o.config.filter;
    if (!resolveFilter) return;

    let cancelled = false;
    setFilterError(false);
    void resolveFilter()
      .then((items) => {
        if (cancelled) return;
        let initialSearch = SearchForm.create();
        for (const item of items) initialSearch = initialSearch.addAndFilter(item);
        setFilteredStore(createListStore({ url: target.url, adapter, initialSearch }));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('[@listgrid/react] ManyToOneRenderer filter resolution failed', err);
        setFilterError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, m2o, target, adapter]);

  // if the slice holds a bare id (edit mode, from the server), resolve it to the
  // referenced entity's label for display (charter C3 — a reference is not an
  // id textbox).
  useEffect(() => {
    let cancelled = false;
    if (value != null && typeof value !== 'object') {
      resolveReference(target.url, String(value))
        .then((entity) => {
          if (!cancelled) setResolvedLabel(labelOf(entity, labelField));
        })
        .catch(() => {
          if (!cancelled) setResolvedLabel(undefined);
        });
    } else {
      setResolvedLabel(undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [value, resolveReference, target, labelField]);

  const display = resolvedLabel ?? labelOf(value, labelField);

  // when config.filter exists, the picker MUST wait for the filtered store
  // (not fall back to the unfiltered pickerStore) — showing unfiltered rows
  // even momentarily would defeat the filter channel (e.g. parentMajor
  // briefly listing itself as selectable).
  const hasFilter = typeof m2o.config.filter === 'function';
  const activeStore = hasFilter ? filteredStore : pickerStore;

  return (
    <span data-field="manyToOne">
      <span data-m2o-value={name}>{display || '(선택 안 됨)'}</span>{' '}
      {!readOnly && (
        <Button type="button" onClick={() => setOpen(true)}>
          찾기
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={`${labelField} 선택`}>
        {open && filterError && <div role="alert">목록 필터를 불러오지 못했습니다.</div>}
        {open && !filterError && activeStore && (
          <ViewListGrid
            entityForm={target}
            store={activeStore}
            onRowClick={(row) => {
              store.getState().setValue(name, row);
              setOpen(false);
            }}
          />
        )}
      </Modal>
    </span>
  );
}
