'use client';

import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { EntityForm } from '../../../config/EntityForm';
import { Session } from '../../../auth/types';
import { FilterItem, SearchForm } from '../../../form/SearchForm';
import { ListGrid } from '../../../config/ListGrid';
import { ViewListGrid } from '../ViewListGrid';
import { ViewListGridOptionProps } from '../types/ViewListGrid.types';
import {
  InlineGlobalListConfig,
  InlineListFieldConfig,
  InlinePaginationOptions,
  InlineRowAction,
  InlineRowActionColumn,
  InlineSubCollectionFetchOptions,
  InlineSubCollectionRelation,
} from '../../../config/InlineSubCollectionField';
import {
  IListConfig,
  ListableFormField,
  ViewListProps,
  ViewListResult,
} from '../../fields/abstract/ListableFormField';
import { Tooltip } from '../../../ui';
import { useLoadingStore } from '../../../loading';
import { showAlert } from '../../../message';
import { FieldRenderParameters } from '../../../config/EntityField';

export interface InlineSubCollectionViewProps {
  parentEntityForm: EntityForm;
  parentId: string;
  entityForm: EntityForm;
  relation: InlineSubCollectionRelation;
  readonly?: boolean;
  session?: Session;
  listFields?: (string | InlineListFieldConfig)[];
  /** Row action columns - supports multiple action columns */
  rowActionColumns?: InlineRowActionColumn[];
  pagination?: InlinePaginationOptions;
  globalListConfig?: InlineGlobalListConfig;
  fetchOptions?: InlineSubCollectionFetchOptions;
  initialSearchForm?: SearchForm;
  tooltip?: ReactNode;
  hideTitle?: boolean;
  viewListOptions?: ViewListGridOptionProps;
}

/**
 * InlineRowActionField - Custom field for rendering row action buttons
 * This field renders action buttons in the list view
 * Now supports multiple columns with unique columnId
 */
class InlineRowActionField extends ListableFormField<InlineRowActionField> {
  private columnId: string;
  private rowActions: InlineRowAction[];
  private onActionHandler: (action: InlineRowAction, item: any) => Promise<void>;
  private columnLabel: string;
  private columnOrder: number;

  constructor(
    columnId: string,
    rowActions: InlineRowAction[],
    onActionHandler: (action: InlineRowAction, item: any) => Promise<void>,
    columnLabel?: string,
    columnOrder?: number,
  ) {
    const order = columnOrder ?? 9999;
    const fieldName = `_rowActions_${columnId}`;
    super(fieldName, order, 'custom');
    this.columnId = columnId;
    this.rowActions = rowActions;
    this.onActionHandler = onActionHandler;
    this.columnLabel = columnLabel ?? '작업';
    this.columnOrder = order;

    // Configure as list field
    this.listConfig = {
      support: true,
      filterable: false,
      sortable: false,
      quickSearch: false,
      order: order,
      label: this.columnLabel,
      align: 'center',
    };
  }

  protected createInstance(name: string, order: number): InlineRowActionField {
    return new InlineRowActionField(
      this.columnId,
      this.rowActions,
      this.onActionHandler,
      this.columnLabel,
      this.columnOrder,
    );
  }

  protected async renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return null;
  }

  protected async renderListItemInstance(props: ViewListProps): Promise<ViewListResult | null> {
    const { item } = props;

    if (!this.rowActions || this.rowActions.length === 0) {
      return { result: null, linkOnCell: false };
    }

    const visibleActions = this.rowActions.filter((action) => !action.hidden?.(item));

    if (visibleActions.length === 0) {
      return { result: null, linkOnCell: false };
    }

    const buttons = (
      <div className="rcm-inline-action-row">
        {visibleActions.map((action) => {
          const label = typeof action.label === 'function' ? action.label(item) : action.label;
          const isDisabled = action.disabled?.(item) ?? false;

          return (
            <Tooltip key={action.id} label={label}>
              <button
                type="button"
                className={`rcm-button ${action.className ?? ''} ${isDisabled ? 'rcm-is-disabled' : ''}`}
                data-variant={action.className ? undefined : 'outline'}
                data-size="sm"
                disabled={isDisabled}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  this.onActionHandler(action, item);
                }}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {label}
              </button>
            </Tooltip>
          );
        })}
      </div>
    );

    return { result: buttons, linkOnCell: false };
  }
}

/**
 * InlineSubCollectionView component
 * Renders a simple list table without detail view
 * Supports row actions and field overrides
 */
export const InlineSubCollectionView: React.FC<InlineSubCollectionViewProps> = ({
  parentEntityForm,
  parentId,
  entityForm,
  relation,
  readonly = false,
  session,
  listFields,
  rowActionColumns,
  pagination,
  globalListConfig,
  fetchOptions,
  initialSearchForm,
  tooltip,
  hideTitle = false,
  viewListOptions,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { setOpenBaseLoading } = useLoadingStore();

  // Refresh function for row actions
  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Handle row action click
  const handleRowAction = useCallback(
    async (action: InlineRowAction, item: any) => {
      // Check if disabled
      if (action.disabled?.(item)) {
        return;
      }

      // Confirmation if needed
      if (action.confirm) {
        const message =
          typeof action.confirm === 'function' ? action.confirm(item) : action.confirm;
        const confirmed = window.confirm(message);
        if (!confirmed) {
          return;
        }
      }

      try {
        setOpenBaseLoading(true);
        // Pass the configuredEntityForm from the ref
        await action.onClick(item, entityForm.clone(true).withParentId(parentId), refresh);
      } catch (error) {
        console.error('Row action error:', error);
        showAlert({
          message: error instanceof Error ? error.message : '작업 중 오류가 발생했습니다.',
          topLayer: true,
        });
      } finally {
        setOpenBaseLoading(false);
      }
    },
    [entityForm, parentId, refresh, setOpenBaseLoading],
  );

  // Clone entityForm and apply field overrides
  const configuredEntityForm = useMemo(() => {
    const cloned = entityForm.clone(true).withParentId(parentId);

    // Apply list field overrides
    if (listFields && listFields.length > 0) {
      const fieldNames = listFields.map((f) => (typeof f === 'string' ? f : f.name));
      const fieldConfigs = new Map<string, Partial<IListConfig>>();

      listFields.forEach((f) => {
        if (typeof f !== 'string' && f.listConfig) {
          fieldConfigs.set(f.name, f.listConfig);
        }
      });

      // Update field list configs
      cloned.fields.forEach((field) => {
        if (field instanceof ListableFormField) {
          if (fieldNames.includes(field.name)) {
            // Enable this field for list display
            field.useListField();

            // Apply specific config override if provided
            const configOverride = fieldConfigs.get(field.name);
            if (configOverride) {
              field.withListConfig({
                ...field.getListConfig(),
                ...configOverride,
                support: true,
              });
            }

            // Apply global config
            if (globalListConfig) {
              const currentConfig = field.getListConfig() ?? {};
              const mergedFilterable = globalListConfig.filterable ?? currentConfig.filterable;
              const mergedSortable = globalListConfig.sortable ?? currentConfig.sortable;
              const mergedQuickSearch = globalListConfig.quickSearch ?? currentConfig.quickSearch;
              field.withListConfig({
                ...currentConfig,
                ...(mergedFilterable !== undefined ? { filterable: mergedFilterable } : {}),
                ...(mergedSortable !== undefined ? { sortable: mergedSortable } : {}),
                ...(mergedQuickSearch !== undefined ? { quickSearch: mergedQuickSearch } : {}),
                support: true,
              });
            }
          } else {
            // Disable this field for list display
            delete (field as { listConfig?: unknown }).listConfig;
          }
        }
      });
    } else if (globalListConfig) {
      // Apply global config to all list fields
      cloned.fields.forEach((field) => {
        if (field instanceof ListableFormField && field.isSupportList()) {
          const currentConfig = field.getListConfig() ?? {};
          const mergedFilterable = globalListConfig.filterable ?? currentConfig.filterable;
          const mergedSortable = globalListConfig.sortable ?? currentConfig.sortable;
          const mergedQuickSearch = globalListConfig.quickSearch ?? currentConfig.quickSearch;
          field.withListConfig({
            ...currentConfig,
            ...(mergedFilterable !== undefined ? { filterable: mergedFilterable } : {}),
            ...(mergedSortable !== undefined ? { sortable: mergedSortable } : {}),
            ...(mergedQuickSearch !== undefined ? { quickSearch: mergedQuickSearch } : {}),
            support: true,
          });
        }
      });
    }

    // Add row action columns if defined
    if (rowActionColumns && rowActionColumns.length > 0) {
      rowActionColumns.forEach((column) => {
        if (column.actions && column.actions.length > 0) {
          const actionField = new InlineRowActionField(
            column.id,
            column.actions,
            handleRowAction,
            column.label,
            column.order,
          );
          cloned.fields.set(`_rowActions_${column.id}`, actionField);
        }
      });
    }

    return cloned;
  }, [
    entityForm,
    parentId,
    listFields,
    globalListConfig,
    rowActionColumns,
    readonly,
    handleRowAction,
  ]);

  // Create ListGrid
  const listGrid = useMemo(() => {
    return new ListGrid(configuredEntityForm);
  }, [configuredEntityForm]);

  // Build filters with mappedBy
  const buildFilters = useCallback(
    async (ef: EntityForm): Promise<{ condition: 'AND' | 'OR'; items: FilterItem[] }[]> => {
      // Get mappedBy filter
      const mappedBy = relation.mappedBy;
      const filterBy =
        relation.filterBy ??
        (mappedBy.endsWith('Id') ? mappedBy.replace('Id', '') + '.id' : mappedBy);
      const valueProperty = relation.valueProperty ?? 'id';

      let mappedByValue: string | number | undefined;
      if (valueProperty === 'id') {
        mappedByValue = parentId;
      } else {
        const value = parentEntityForm.getValue(valueProperty);
        if (typeof value === 'string' || typeof value === 'number') {
          mappedByValue = value;
        }
      }

      const mappedByFilter: FilterItem = {
        name: filterBy,
        ...(mappedByValue !== undefined ? { value: String(mappedByValue) } : {}),
      };

      // Apply user-defined filters if any
      if (fetchOptions?.filters) {
        const additionalFilters = await fetchOptions.filters(ef);
        if (additionalFilters.length > 0 && additionalFilters[0]!.items) {
          const hasMappedByFilter = additionalFilters[0]!.items.some(
            (item: FilterItem) => item.name === mappedByFilter.name,
          );
          if (!hasMappedByFilter) {
            additionalFilters[0]!.items.unshift(mappedByFilter);
          }
          return additionalFilters;
        }
      }

      // Return default filter
      return [
        {
          condition: 'AND',
          items: [mappedByFilter],
        },
      ];
    },
    [relation, parentId, parentEntityForm, fetchOptions],
  );

  // Build ViewListGrid options
  const options: ViewListGridOptionProps = useMemo(() => {
    const baseOptions: ViewListGridOptionProps = {
      ...viewListOptions,
      hideTitle: hideTitle,
      readonly: readonly,
      subCollection: {
        name: relation.mappedBy,
        mappedBy: relation.mappedBy,
        mappedValue: parentId,
        // List only mode - disable modify on view
        modifyOnView: false,
      },
      filters: buildFilters,
      // Disable create/update UI since we only show list
      createOrUpdate: {
        addNew: false,
        modal: false,
      },
      // Hide pagination controls if client-side pagination with all data
      ...(pagination?.clientSide !== undefined ? { hidePagination: pagination.clientSide } : {}),
    };

    return baseOptions;
  }, [viewListOptions, hideTitle, readonly, relation, parentId, buildFilters, pagination]);

  return (
    <div className="inline-subcollection-view" key={`inline-sub-${refreshKey}`}>
      {tooltip && <div className="rcm-inline-subcollection-tooltip">{tooltip}</div>}
      <ViewListGrid
        listGrid={listGrid}
        parentId={parentId}
        options={options}
        viewMode="popup"
        {...(session !== undefined ? { session } : {})}
      />
    </div>
  );
};
