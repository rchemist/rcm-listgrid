'use client';

import { ManyToOneConfig } from '../../../config/Config';
import React, { useEffect, useState } from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { ViewListGrid } from '../../list/ViewListGrid';
import { ListGrid } from '../../../config/ListGrid';
import { TreeSelectView } from './TreeSelectView';
import { SearchForm } from '../../../form/SearchForm';
import { EntityForm } from '../../../config/EntityForm';
import { useModalManagerStore } from '../../../store';

interface SelectedItem {
  id: string;
  name: string;
  data: any;
}

interface ManyToOneMultiFilterViewProps {
  name: string;
  label?: string | undefined;
  config: ManyToOneConfig;
  parentEntityForm: EntityForm;
  value?: string[] | undefined; // Array of IDs
  onChange: (value: string[]) => void;
}

export const ManyToOneMultiFilterView = ({
  name,
  label,
  config,
  parentEntityForm,
  value,
  onChange,
}: ManyToOneMultiFilterViewProps) => {
  const { openModal, closeModal } = useModalManagerStore();
  const entityForm = config.entityForm;

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchForm, setSearchForm] = useState<SearchForm>();
  const [mount, setMount] = useState(false);

  // Initialize selected items from value (array of IDs)
  useEffect(() => {
    (async () => {
      if (value && Array.isArray(value) && value.length > 0) {
        const items: SelectedItem[] = [];

        for (const id of value) {
          try {
            const fetchEntityForm = entityForm.clone(true);
            fetchEntityForm.id = id;
            const response = await fetchEntityForm.fetchData();
            const data = response.data.data;

            if (data) {
              const displayName = await getDisplayName(data);
              items.push({
                id: id,
                name: displayName,
                data: data,
              });
            }
          } catch (e) {
            // If fetch fails, still add with ID as name
            items.push({
              id: id,
              name: id,
              data: { id },
            });
          }
        }

        setSelectedItems(items);
      } else {
        setSelectedItems([]);
      }

      // Initialize search form with filters
      const filter = config.filter ?? [];
      const newSearchForm = SearchForm.create();

      if (filter.length > 0) {
        for (const filterItem of filter) {
          if (filterItem) {
            newSearchForm.withFilter('AND', ...(await filterItem(parentEntityForm)));
          }
        }
        if (entityForm.neverDelete) {
          newSearchForm.handleAndFilter('active', 'true');
        }
      }

      setSearchForm(newSearchForm);
      setMount(true);
    })();
  }, [value]);

  const getDisplayName = async (data: any): Promise<string> => {
    if (config.displayFunc) {
      return await config.displayFunc(data);
    }
    if (config.field?.name) {
      if (config.field.name instanceof Function) {
        return config.field.name(data);
      }
      return data[config.field.name] ?? '';
    }
    return data.name ?? data.id ?? '';
  };

  const handleAddItem = (item: any) => {
    const idField = config.field?.id ?? 'id';
    const itemId = item[idField];

    // Check if already selected
    if (selectedItems.some((selected) => selected.id === itemId)) {
      return;
    }

    (async () => {
      const displayName = await getDisplayName(item);
      const newItems = [
        ...selectedItems,
        {
          id: itemId,
          name: displayName,
          data: item,
        },
      ];

      setSelectedItems(newItems);
      onChange(newItems.map((i) => i.id));
    })();
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = selectedItems.filter((item) => item.id !== itemId);
    setSelectedItems(newItems);
    onChange(newItems.map((i) => i.id));
  };

  const handleSelectModal = () => {
    const modalId = `manytoone-multi-select-${name}`;

    // Clone searchForm and exclude already selected items
    const modalSearchForm = searchForm?.clone() ?? SearchForm.create();
    const idField = config.field?.id ?? 'id';

    // Add NOT_IN filter to exclude already selected items
    if (selectedItems.length > 0) {
      const selectedIds = selectedItems.map((item) => item.id);
      modalSearchForm.handleAndFilter(idField, selectedIds, 'NOT_IN');
    }

    openModal({
      modalId,
      title: `${label ?? name} 선택`,
      size: '5xl',
      content: (
        <div className="rcm-modal-content-scroll">
          {config.tree ? (
            <TreeSelectView
              entityForm={entityForm}
              tree={config.tree}
              onSelect={(item) => {
                handleAddItem(item);
                closeModal(modalId);
              }}
            />
          ) : (
            <ViewListGrid
              listGrid={new ListGrid(entityForm).withSearchForm(modalSearchForm)}
              options={{
                popup: true,
                ...(config.filterable !== undefined ? { filterable: config.filterable } : {}),
                readonly: true,
                selection: {
                  enabled: false,
                },
                manyToOne: {
                  onSelect: (item) => {
                    handleAddItem(item);
                    closeModal(modalId);
                  },
                },
              }}
            />
          )}
        </div>
      ),
    });
  };

  if (!mount) {
    return null;
  }

  return (
    <div className="rcm-m2o-multi-wrap">
      {/* Selected items as chips */}
      <div className="rcm-m2o-multi-chips">
        {selectedItems.map((item) => (
          <div key={item.id} className="rcm-m2o-multi-chip">
            <span className="rcm-m2o-multi-chip-label">{item.name}</span>
            <button
              type="button"
              onClick={() => handleRemoveItem(item.id)}
              className="rcm-m2o-multi-chip-remove"
            >
              <IconX className="rcm-m2o-multi-chip-remove-icon" />
            </button>
          </div>
        ))}

        {/* Add button */}
        <button type="button" onClick={handleSelectModal} className="rcm-m2o-multi-add">
          <IconPlus className="rcm-m2o-multi-add-icon" />
          <span>추가</span>
        </button>
      </div>

      {/* Helper text */}
      {selectedItems.length === 0 && (
        <p className="rcm-m2o-multi-helper">
          추가 버튼을 클릭하여 {label ?? name}을(를) 선택하세요. 여러 개를 선택할 수 있습니다.
        </p>
      )}
    </div>
  );
};
