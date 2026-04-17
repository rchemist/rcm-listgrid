'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {ManyToOneConfig} from '../../../config/Config';
import React, {useEffect, useState} from "react";
import {IconPlus, IconX} from "@tabler/icons-react";
import {ViewListGrid} from '../../list/ViewListGrid';
import {ListGrid} from '../../../config/ListGrid';
import {TreeSelectView} from './TreeSelectView';
import {SearchForm} from "../../../form/SearchForm";
import {EntityForm} from '../../../config/EntityForm';
import {useModalManagerStore} from '../../../../store';

interface SelectedItem {
  id: string;
  name: string;
  data: any;
}

interface ManyToOneMultiFilterViewProps {
  name: string;
  label?: string;
  config: ManyToOneConfig;
  parentEntityForm: EntityForm;
  value?: string[];  // Array of IDs
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
                data: data
              });
            }
          } catch (e) {
            // If fetch fails, still add with ID as name
            items.push({
              id: id,
              name: id,
              data: { id }
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
            newSearchForm.withFilter("AND", ...(await filterItem(parentEntityForm)));
          }
        }
        if (entityForm.neverDelete) {
          newSearchForm.handleAndFilter("active", "true");
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
    if (selectedItems.some(selected => selected.id === itemId)) {
      return;
    }

    (async () => {
      const displayName = await getDisplayName(item);
      const newItems = [...selectedItems, {
        id: itemId,
        name: displayName,
        data: item
      }];

      setSelectedItems(newItems);
      onChange(newItems.map(i => i.id));
    })();
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(newItems);
    onChange(newItems.map(i => i.id));
  };

  const handleSelectModal = () => {
    const modalId = `manytoone-multi-select-${name}`;

    // Clone searchForm and exclude already selected items
    const modalSearchForm = searchForm?.clone() ?? SearchForm.create();
    const idField = config.field?.id ?? 'id';

    // Add NOT_IN filter to exclude already selected items
    if (selectedItems.length > 0) {
      const selectedIds = selectedItems.map(item => item.id);
      modalSearchForm.handleAndFilter(idField, selectedIds, 'NOT_IN');
    }

    openModal({
      modalId,
      title: `${label ?? name} 선택`,
      size: '5xl',
      content: (
        <div className="modal-content flex max-h-[90vh] flex-col overflow-hidden">
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
                filterable: config.filterable,
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
      )
    });
  };

  if (!mount) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Selected items as chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20"
          >
            <span className="max-w-[150px] truncate">{item.name}</span>
            <button
              type="button"
              onClick={() => handleRemoveItem(item.id)}
              className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20 transition-colors"
            >
              <IconX className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={handleSelectModal}
          className="inline-flex items-center gap-1 px-2.5 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          <IconPlus className="w-3.5 h-3.5" />
          <span>추가</span>
        </button>
      </div>

      {/* Helper text */}
      {selectedItems.length === 0 && (
        <p className="text-xs text-gray-400">
          추가 버튼을 클릭하여 {label ?? name}을(를) 선택하세요. 여러 개를 선택할 수 있습니다.
        </p>
      )}
    </div>
  );
};
