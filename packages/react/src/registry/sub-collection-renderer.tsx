import { useMemo, useState } from 'react';
import type { BackendAdapter, EntityForm, SubCollectionField } from '@listgrid/schema-core';
import {
  createFormStore,
  getBufferedSubCollectionRows,
  setBufferedSubCollectionRows,
} from '@listgrid/state';
import { ViewEntityForm } from '../components/ViewEntityForm';
import { getMessages } from '../messages';
import { useAdapter } from '../providers/adapter';
import { useFieldValue, useFormStore } from '../providers/form-store';
import { useUI } from '../providers/ui';
import type { FieldRendererComponentProps } from './field-renderer-registry';

function labelText(form: EntityForm, name: string): string {
  const lbl = form.getField(name)?.getLabel();
  return typeof lbl === 'string' ? lbl : name;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

function errorText(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
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
  onSubmit: (data: Record<string, unknown>) => boolean | Promise<boolean>;
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
          const submitted = onSubmit(data);
          if (typeof submitted === 'boolean') {
            if (submitted) onClose();
            return;
          }
          return submitted.then((saved) => {
            if (saved) onClose();
          });
        }}
      />
    </Modal>
  );
}

interface CollectionEditorProps extends FieldRendererComponentProps {
  field: SubCollectionField;
  adapter?: BackendAdapter;
}

function CollectionEditor({ field: sc, name, entityId, adapter }: CollectionEditorProps) {
  const { Table, Button } = useUI();
  const store = useFormStore();
  const rows = useFieldValue<Record<string, unknown>[]>(name) ?? [];
  const childForm = useMemo(() => sc.getChildEntityForm(), [sc]);
  const [editing, setEditing] = useState<{ index: number | null } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const childResource = sc.getPersistence() === 'child-resource';

  const columns = useMemo(
    () =>
      childForm
        .getFields()
        .filter(
          (f) => f.type !== 'subCollection' && (!childResource || f.getName() !== sc.getMappedBy()),
        )
        .slice(0, 4)
        .map((f) => f.getName()),
    [childForm, childResource, sc],
  );

  function surfaceError(action: string, error: unknown): void {
    const text = `${childForm.getTitle() ?? name} ${action}에 실패했습니다: ${errorText(error)}`;
    store.getState().addMessage({
      key: `subcollection-${name}-error`,
      severity: 'error',
      text,
    });
    getMessages().showError(text);
  }

  function upsert(index: number | null, data: Record<string, unknown>): boolean | Promise<boolean> {
    const initial = index === null ? undefined : rows[index];
    function commit(saved: Record<string, unknown>): boolean {
      const next = [...rows];
      if (index === null) next.push(saved);
      else next[index] = saved;
      store.getState().setValue(name, next);
      store.getState().removeMessage(`subcollection-${name}-error`);

      if (childResource) {
        if (entityId === undefined) {
          // Parent create screen: every child is local until controller.save()
          // receives the newly-created parent id and flushes this buffer.
          setBufferedSubCollectionRows(store, name, next);
        } else if (initial !== undefined) {
          // A failed create-screen flush leaves that row buffered. Editing it
          // after the parent exists retries the child create immediately; drop
          // the now-persisted row from the retry buffer.
          setBufferedSubCollectionRows(
            store,
            name,
            getBufferedSubCollectionRows(store, name).filter((row) => row !== initial),
          );
        }
      }
      return true;
    }

    if (!childResource) return commit(data);
    if (entityId === undefined) return commit(data);

    return (async () => {
      const mappedBy = sc.getMappedBy();
      if (mappedBy === undefined || adapter === undefined) return false;
      const payload = { ...data, [mappedBy]: entityId };
      try {
        const rowId = initial?.['id'];
        const result =
          rowId === undefined
            ? await adapter.create(childForm.url, payload)
            : await adapter.update(childForm.url, String(rowId), payload);
        return commit(asRecord(result) ?? { ...(initial ?? {}), ...data });
      } catch (error) {
        surfaceError(index === null ? '추가' : '수정', error);
        return false;
      }
    })();
  }

  function removeAt(index: number): void {
    const row = rows[index];
    if (row === undefined) return;
    function commitRemove(): void {
      const next = rows.filter((_, i) => i !== index);
      store.getState().setValue(name, next);
      store.getState().removeMessage(`subcollection-${name}-error`);
      if (childResource) {
        setBufferedSubCollectionRows(
          store,
          name,
          entityId === undefined
            ? next
            : getBufferedSubCollectionRows(store, name).filter((buffered) => buffered !== row),
        );
      }
    }

    if (!childResource || entityId === undefined || row['id'] === undefined) {
      commitRemove();
      return;
    }
    if (adapter === undefined) return;
    setRemoving(index);
    void adapter
      .remove(childForm.url, [String(row['id'])], childForm.getRevisionEntityName())
      .then(commitRemove)
      .catch((error: unknown) => surfaceError('삭제', error))
      .finally(() => setRemoving(null));
  }

  return (
    <div data-subcollection={name}>
      <Button type="button" onClick={() => setEditing({ index: null })}>
        추가
      </Button>
      <Table>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column}>{labelText(childForm, column)}</Table.Th>
            ))}
            <Table.Th>작업</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, index) => (
            <Table.Tr key={childResource ? String(row['id'] ?? index) : index}>
              {columns.map((column) => (
                <Table.Td key={column}>{String(row[column] ?? '')}</Table.Td>
              ))}
              <Table.Td>
                <Button type="button" onClick={() => setEditing({ index })}>
                  수정
                </Button>{' '}
                <Button type="button" disabled={removing === index} onClick={() => removeAt(index)}>
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

function EmbeddedSubCollectionRenderer(props: FieldRendererComponentProps) {
  return <CollectionEditor {...props} field={props.field as SubCollectionField} />;
}

function ChildResourceSubCollectionRenderer(props: FieldRendererComponentProps) {
  const adapter = useAdapter();
  return (
    <CollectionEditor {...props} field={props.field as SubCollectionField} adapter={adapter} />
  );
}

export function SubCollectionRenderer(props: FieldRendererComponentProps) {
  const sc = props.field as SubCollectionField;
  return sc.getPersistence() === 'child-resource' ? (
    <ChildResourceSubCollectionRenderer {...props} />
  ) : (
    <EmbeddedSubCollectionRenderer {...props} />
  );
}
