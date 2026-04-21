import { EntityForm } from './EntityForm';
import {
  getConditionalReactNode,
  HelpTextType,
  HiddenType,
  LabelType,
  ReadOnlyType,
  TooltipType,
} from './Config';
import React, { ReactNode } from 'react';
import { FieldInfoParameters } from './EntityField';
import { Session } from '../auth/types';
import { FilterItem, SearchForm } from '../form/SearchForm';
import { SubCollectionField } from './SubCollectionField';
import { CardSubCollectionFetchOptions, CardSubCollectionRelation } from './CardSubCollectionField';

/**
 * Table configuration for TableSubCollectionField
 */
export interface TableConfig {
  /**
   * Fields to display as columns (whitelist).
   * If not set, all list-enabled fields are shown.
   */
  displayFields?: string[];
  /**
   * Fields to exclude from columns (blacklist).
   */
  excludeFields?: string[];
  /**
   * Page size for client-side pagination.
   * @default undefined (no pagination)
   */
  pageSize?: number;
  /**
   * Whether to show row numbers as the first column.
   * @default true
   */
  showRowNumbers?: boolean;
}

/**
 * TableSubCollectionField configuration
 * Extends SubCollectionField to display items in a table format
 */
export class TableSubCollectionField extends SubCollectionField {
  tooltip?: TooltipType | undefined;
  fetchUrl: string;
  fetchUrlFunction?: ((parentEntityForm: EntityForm) => string) | undefined;
  tableConfig?: TableConfig | undefined;
  fetchOptions?: CardSubCollectionFetchOptions | undefined;

  constructor(props: {
    entityForm: EntityForm;
    relation: CardSubCollectionRelation;
    order: number;
    name: string;
    label?: LabelType | undefined;
    helpText?: HelpTextType | undefined;
    hidden?: HiddenType | undefined;
    readonly?: ReadOnlyType | undefined;
    fetchUrl?: string | ((parentEntityForm: EntityForm) => string) | undefined;
    tableConfig?: TableConfig | undefined;
    fetchOptions?: CardSubCollectionFetchOptions | undefined;
  }) {
    super({
      entityForm: props.entityForm,
      relation: props.relation,
      order: props.order,
      name: props.name,
      label: props.label,
      helpText: props.helpText,
      hidden: props.hidden,
      readonly: props.readonly,
    });

    const defaultFetchOptions: CardSubCollectionFetchOptions = {
      useSearchForm: true,
      viewDetail: true,
      pageSize: 10000,
    };

    this.fetchOptions = props.fetchOptions
      ? { ...defaultFetchOptions, ...props.fetchOptions }
      : defaultFetchOptions;

    if (this.fetchOptions.useSearchForm) {
      this.fetchUrl = props.entityForm.getUrl();
    } else if (typeof props.fetchUrl === 'function') {
      this.fetchUrl = props.entityForm.getUrl();
      this.fetchUrlFunction = props.fetchUrl;
    } else {
      this.fetchUrl = props.fetchUrl ?? props.entityForm.getUrl();
    }

    this.tableConfig = props.tableConfig;
  }

  withTooltip(tooltip?: TooltipType): this {
    this.tooltip = tooltip;
    return this;
  }

  async getTooltip(props: FieldInfoParameters): Promise<ReactNode> {
    return await getConditionalReactNode(props, this.tooltip);
  }

  clone(): TableSubCollectionField {
    const cloned = new TableSubCollectionField({
      entityForm: this.entityForm,
      relation: this.relation as CardSubCollectionRelation,
      order: this.order,
      name: this.name,
      label: this.label,
      helpText: this.helpText,
      hidden: this.hidden,
      readonly: this.readonly,
      fetchUrl: this.fetchUrl,
      tableConfig: this.tableConfig,
      fetchOptions: this.fetchOptions,
    });

    cloned.form = this.form;
    cloned.hideLabel = this.hideLabel;
    cloned.tooltip = this.tooltip;

    return cloned;
  }

  withFetchOptions(fetchOptions: CardSubCollectionFetchOptions): this {
    this.fetchOptions = { ...this.fetchOptions, ...fetchOptions };
    return this;
  }

  withTableConfig(tableConfig: TableConfig): this {
    this.tableConfig = tableConfig;
    return this;
  }

  async buildSearchForm(parentEntityForm: EntityForm): Promise<SearchForm> {
    const searchForm = new SearchForm();

    searchForm.withPageSize(this.fetchOptions?.pageSize ?? 10000);

    if (this.fetchOptions?.viewDetail) {
      searchForm.withViewDetail(true);
    }

    const mappedByFilter = this.getMappedByFilter(parentEntityForm);

    if (this.fetchOptions?.filters) {
      const additionalFilters = await this.fetchOptions.filters(parentEntityForm);
      if (additionalFilters.length > 0 && additionalFilters[0]!.items) {
        const hasMappedByFilter = additionalFilters[0]!.items.some(
          (item: FilterItem) => item.name === mappedByFilter.name,
        );
        if (!hasMappedByFilter) {
          additionalFilters[0]!.items.unshift(mappedByFilter);
        }
        additionalFilters.forEach((filterGroup) => {
          searchForm.withFilter(filterGroup.condition, ...filterGroup.items);
        });
      }
    } else {
      searchForm.handleAndFilter(mappedByFilter.name, mappedByFilter.value);
    }

    return searchForm;
  }

  async render({
    entityForm,
    session,
  }: {
    entityForm: EntityForm;
    session?: Session;
  }): Promise<ReactNode | null> {
    const TableSubCollectionView = React.lazy(() =>
      import('../components/list/ui/TableSubCollectionView').then((m) => ({
        default: m.TableSubCollectionView,
      })),
    );

    let fetchUrl: string;
    if (this.fetchUrlFunction) {
      fetchUrl = this.fetchUrlFunction(entityForm);
    } else {
      fetchUrl = this.fetchUrl;
    }

    const readonly = await this.isReadonly({ entityForm, session });
    const tooltip = await this.getTooltip({ entityForm, session });

    let initialSearchForm: SearchForm | undefined;
    if (this.fetchOptions?.useSearchForm) {
      initialSearchForm = await this.buildSearchForm(entityForm);
    }

    const viewProps = {
      parentEntityForm: entityForm,
      parentId: entityForm.id!,
      entityForm: this.entityForm,
      fetchUrl,
      ...(this.tableConfig !== undefined ? { tableConfig: this.tableConfig } : {}),
      relation: this.relation as CardSubCollectionRelation,
      readonly,
      ...(session !== undefined ? { session } : {}),
      ...(this.fetchOptions !== undefined ? { fetchOptions: this.fetchOptions } : {}),
      ...(initialSearchForm !== undefined ? { initialSearchForm } : {}),
      tooltip,
    };

    return (
      <React.Suspense
        fallback={
          <div className="rcm-loading-overlay">
            <div className="rcm-spinner" />
          </div>
        }
      >
        <TableSubCollectionView {...viewProps} />
      </React.Suspense>
    );
  }
}
