import type { StoreApi } from 'zustand';
import { useStore } from 'zustand';
import type { EntityForm } from '@listgrid/schema-core';
import type { FormStoreState } from '@listgrid/state';
import { useUI } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { FieldRenderer } from './FieldRenderer';

// ViewEntityForm — the top-level form screen (task item 5): title, a simple
// tab bar (only rendered when there's more than one tab — single/no-tab forms
// like College just render their one group), field groups → FieldRenderer per
// field, form-level errors, and a Save button that validates before calling
// back out to the host's persistence (`onSave`). Deliberately minimal — no
// stepper/sub-collection/theme system (that's the 0.3.x surface this
// replaces, not this V0.4 slice).

export interface ViewEntityFormProps {
  entityForm: EntityForm;
  store: StoreApi<FormStoreState>;
  onSave?: (data: Record<string, unknown>) => void | Promise<void>;
}

export function ViewEntityForm({ entityForm, store, onSave }: ViewEntityFormProps) {
  return (
    <FormStoreProvider store={store}>
      <ViewEntityFormInner
        entityForm={entityForm}
        store={store}
        {...(onSave !== undefined ? { onSave } : {})}
      />
    </FormStoreProvider>
  );
}

function ViewEntityFormInner({ entityForm, store, onSave }: ViewEntityFormProps) {
  const { Button } = useUI();
  const tabIndex = useStore(store, (s) => s.tabIndex);
  const formErrors = useStore(store, (s) => s.formErrors);
  const saving = useStore(store, (s) => s.saving);

  const tabs = entityForm.getTabs();
  const activeTabId = tabs.find((t) => t.id === tabIndex)?.id ?? tabs[0]?.id ?? 'default';
  const groups = entityForm.getFieldGroups(activeTabId);
  const title = entityForm.getTitle();

  async function handleSave(): Promise<void> {
    store.getState().setSaving(true);
    try {
      const valid = await store.getState().validateAll();
      if (!valid) return;
      await onSave?.(store.getState().toSaveData());
    } finally {
      store.getState().setSaving(false);
    }
  }

  return (
    <div data-entity-form={entityForm.getName()}>
      {title && <h2>{title}</h2>}

      {tabs.length > 1 && (
        <div role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === activeTabId}
              disabled={tab.id === activeTabId}
              onClick={() => store.getState().setTabIndex(tab.id)}
            >
              {tab.label ?? tab.id}
            </button>
          ))}
        </div>
      )}

      {groups.map((group) => (
        <fieldset key={group.id}>
          {group.label && <legend>{group.label}</legend>}
          {entityForm.getGroupFields(activeTabId, group.id).map((field) => (
            <FieldRenderer key={field.getName()} field={field} />
          ))}
        </fieldset>
      ))}

      {formErrors.length > 0 && (
        <ul role="alert" data-form-errors="">
          {formErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      <Button type="button" onClick={() => void handleSave()} disabled={saving}>
        Save
      </Button>
    </div>
  );
}
