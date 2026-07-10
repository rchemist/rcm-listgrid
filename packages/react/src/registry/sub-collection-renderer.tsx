import { useMemo, useState } from 'react';
import type { EntityForm, SubCollectionField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { useFieldValue, useFormStore } from '../providers/form-store';
import { ViewEntityForm } from '../components/ViewEntityForm';
import type { FieldRendererComponentProps } from './field-renderer-registry';

// SubCollectionRenderer (charter C3 — OneToMany inline). The collection value is
// an array of child rows in the PARENT store; each add/edit opens the child's
// ViewEntityForm bound to an ISOLATED child store (ADR-0002 §Decision 4 — the
// child form has its own store and reports back only via the onSave callback),
// then writes the result into the parent array. Save includes the array under
// the collection name.

function labelText(form: EntityForm, name: string): string {
  const lbl = form.getField(name)?.getLabel();
  return typeof lbl === 'string' ? lbl : name;
}

// A child-row editor in a Modal — its own store per open (mount), so the child
// form state is fully isolated from the parent and from other rows.
function ChildFormModal({
  childForm,
  initial,
  title,
  onSubmit,
  onClose,
}: {
  childForm: EntityForm;
  initial: Record<string, unknown> | null;
  title: string;
  onSubmit: (data: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const { Modal } = useUI();
  const [store] = useState(() => {
    const s = createFormStore(childForm, initial ? { renderType: 'update' } : {});
    if (initial) s.getState().hydrate(initial);
    return s;
  });

  return (
    <Modal open onClose={onClose} title={title}>
      <ViewEntityForm
        entityForm={childForm}
        store={store}
        onSave={(data) => {
          onSubmit(data);
          onClose();
        }}
      />
    </Modal>
  );
}

export function SubCollectionRenderer({ field, name }: FieldRendererComponentProps) {
  const { Table, Button } = useUI();
  const store = useFormStore();
  const rows = useFieldValue<Record<string, unknown>[]>(name) ?? [];
  const sc = field as SubCollectionField;
  const childForm = useMemo(() => sc.getChildEntityForm(), [sc]);
  const [editing, setEditing] = useState<{ index: number | null } | null>(null);

  const columns = useMemo(
    () =>
      childForm
        .getFields()
        .filter((f) => f.type !== 'subCollection')
        .slice(0, 4)
        .map((f) => f.getName()),
    [childForm],
  );

  function upsert(index: number | null, data: Record<string, unknown>): void {
    const next = [...rows];
    if (index === null) next.push(data);
    else next[index] = data;
    store.getState().setValue(name, next);
  }
  function removeAt(index: number): void {
    store.getState().setValue(
      name,
      rows.filter((_, i) => i !== index),
    );
  }

  return (
    <div data-subcollection={name}>
      <Button type="button" onClick={() => setEditing({ index: null })}>
        추가
      </Button>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {columns.map((c) => (
              <Table.Th key={c}>{labelText(childForm, c)}</Table.Th>
            ))}
            <Table.Th>작업</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, i) => (
            <Table.Tr key={i}>
              {columns.map((c) => (
                <Table.Td key={c}>{String(row[c] ?? '')}</Table.Td>
              ))}
              <Table.Td>
                <Button type="button" onClick={() => setEditing({ index: i })}>
                  수정
                </Button>{' '}
                <Button type="button" onClick={() => removeAt(i)}>
                  삭제
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {editing && (
        <ChildFormModal
          childForm={childForm}
          initial={editing.index !== null ? (rows[editing.index] ?? null) : null}
          title={`${childForm.getTitle() ?? name} ${editing.index !== null ? '수정' : '추가'}`}
          onSubmit={(data) => upsert(editing.index, data)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
