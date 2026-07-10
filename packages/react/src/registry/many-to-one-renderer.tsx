import { useEffect, useMemo, useState } from 'react';
import type { ManyToOneField } from '@listgrid/schema-core';
import { createListStore } from '@listgrid/state';
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
    () => createListStore({ url: target.getUrl(), adapter }),
    [target, adapter],
  );

  const [open, setOpen] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState<string | undefined>(undefined);

  // if the slice holds a bare id (edit mode, from the server), resolve it to the
  // referenced entity's label for display (charter C3 — a reference is not an
  // id textbox).
  useEffect(() => {
    let cancelled = false;
    if (value != null && typeof value !== 'object') {
      resolveReference(target.getUrl(), String(value))
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

  return (
    <span data-field="manyToOne">
      <span data-m2o-value={name}>{display || '(선택 안 됨)'}</span>{' '}
      {!readOnly && (
        <Button type="button" onClick={() => setOpen(true)}>
          찾기
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={`${labelField} 선택`}>
        {open && (
          <ViewListGrid
            entityForm={target}
            store={pickerStore}
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
