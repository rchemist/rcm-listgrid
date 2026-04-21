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
import { IListConfig } from '../components/fields/abstract/ListableFormField';

/**
 * Inline list field configuration
 * Allows overriding ListConfig per field
 */
export interface InlineListFieldConfig {
  /** Field name from EntityForm */
  name: string;
  /** Override ListConfig options */
  listConfig?: Partial<IListConfig>;
}

/**
 * Row action button configuration
 * `item` is a generic row payload — host apps know their own entity shape
 */
export interface InlineRowAction {
  /** Unique action identifier */
  id: string;
  /** Button label - static string or function receiving row item */
  label: string | ((item: any) => string);
  /** Button icon */
  icon?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Click handler - receives row item and entityForm */
  onClick: (item: any, entityForm: EntityForm, refresh: () => void) => Promise<void>;
  /** Disable condition */
  disabled?: (item: any) => boolean;
  /** Hide condition */
  hidden?: (item: any) => boolean;
  /** Confirmation message before execution */
  confirm?: string | ((item: any) => string);
}

/**
 * Row action column configuration
 * Allows multiple action columns with different positions and labels
 */
export interface InlineRowActionColumn {
  /** Unique column identifier */
  id: string;
  /** Column header label (default: '작업') */
  label?: string | undefined;
  /** Column order in the list (default: 9999) */
  order?: number | undefined;
  /** Actions to display in this column */
  actions: InlineRowAction[];
}

/**
 * InlineSubCollectionRelation configuration
 * Same as SubCollectionRelation but explicitly typed
 */
export interface InlineSubCollectionRelation {
  /** ManyToOne field name in the child entity */
  mappedBy: string;
  /** Filter field name (defaults to mappedBy) */
  filterBy?: string;
  /** Property to get the value from parent entity (default: 'id') */
  valueProperty?: string;
  /** Additional attributes for the subcollection */
  attributes?: Record<string, any>;
}

/**
 * Pagination options for InlineSubCollectionField
 */
export interface InlinePaginationOptions {
  /** Page size (default: 10) */
  pageSize?: number;
  /** Use client-side pagination (load all data first) */
  clientSide?: boolean;
}

/**
 * Global ListConfig options applied to all fields
 */
export interface InlineGlobalListConfig {
  /** Enable/disable filtering for all fields */
  filterable?: boolean;
  /** Enable/disable sorting for all fields */
  sortable?: boolean;
  /** Enable/disable quick search */
  quickSearch?: boolean;
}

/**
 * Fetch options for InlineSubCollectionField
 */
export interface InlineSubCollectionFetchOptions {
  /** Whether to use SearchForm-based fetching (POST request) */
  useSearchForm?: boolean;
  /** Page size for fetching */
  pageSize?: number;
  /** Whether to use viewDetail mode */
  viewDetail?: boolean;
  /** Additional filters to apply */
  filters?: (entityForm: EntityForm) => Promise<
    {
      condition: 'AND' | 'OR';
      items: FilterItem[];
    }[]
  >;
}

/**
 * InlineSubCollectionField configuration
 * Extends SubCollectionField to display items in a simple list table format
 * without detail view - only shows list with optional row actions
 */
export class InlineSubCollectionField extends SubCollectionField {
  // Inline-specific properties
  tooltip?: TooltipType | undefined;
  fetchOptions?: InlineSubCollectionFetchOptions | undefined;

  /** List fields to display - can be field names or detailed config */
  inlineListFields?: (string | InlineListFieldConfig)[] | undefined;

  /** Row action columns - supports multiple action columns */
  inlineRowActionColumns?: InlineRowActionColumn[] | undefined;

  /** Pagination options */
  inlinePagination?: InlinePaginationOptions | undefined;

  /** Global ListConfig applied to all fields */
  inlineGlobalListConfig?: InlineGlobalListConfig | undefined;

  /** Hide title */
  hideTitle?: boolean | undefined;

  constructor(props: {
    entityForm: EntityForm;
    relation: InlineSubCollectionRelation;
    order: number;
    name: string;
    label?: LabelType | undefined;
    helpText?: HelpTextType | undefined;
    hidden?: HiddenType | undefined;
    readonly?: ReadOnlyType | undefined;
    listFields?: (string | InlineListFieldConfig)[] | undefined;
    /** Row action columns - supports multiple action columns */
    rowActionColumns?: InlineRowActionColumn[] | undefined;
    pagination?: InlinePaginationOptions | undefined;
    globalListConfig?: InlineGlobalListConfig | undefined;
    fetchOptions?: InlineSubCollectionFetchOptions | undefined;
    hideTitle?: boolean | undefined;
  }) {
    // Call parent constructor
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

    // Set inline-specific properties
    this.inlineListFields = props.listFields;
    this.inlinePagination = props.pagination;
    this.inlineGlobalListConfig = props.globalListConfig;
    this.hideTitle = props.hideTitle;
    this.inlineRowActionColumns = props.rowActionColumns;

    // Set default fetchOptions
    const defaultFetchOptions: InlineSubCollectionFetchOptions = {
      useSearchForm: true,
      viewDetail: false,
      pageSize: props.pagination?.pageSize ?? 10,
    };

    this.fetchOptions = props.fetchOptions
      ? { ...defaultFetchOptions, ...props.fetchOptions }
      : defaultFetchOptions;
  }

  /**
   * Override withTooltip to support tooltips
   */
  withTooltip(tooltip?: TooltipType): this {
    this.tooltip = tooltip;
    return this;
  }

  async getTooltip(props: FieldInfoParameters): Promise<ReactNode> {
    return await getConditionalReactNode(props, this.tooltip);
  }

  /**
   * Set list fields to display
   */
  withListFields(...fields: (string | InlineListFieldConfig)[]): this {
    this.inlineListFields = fields;
    return this;
  }

  /**
   * Set row action columns - supports multiple action columns
   */
  withRowActionColumns(...columns: InlineRowActionColumn[]): this {
    this.inlineRowActionColumns = columns;
    return this;
  }

  /**
   * Set pagination options
   */
  withPagination(options: InlinePaginationOptions): this {
    this.inlinePagination = options;
    return this;
  }

  /**
   * Set global ListConfig
   */
  withGlobalListConfig(config: InlineGlobalListConfig): this {
    this.inlineGlobalListConfig = config;
    return this;
  }

  /**
   * Set fetch options
   */
  withFetchOptions(options: InlineSubCollectionFetchOptions): this {
    this.fetchOptions = { ...this.fetchOptions, ...options };
    return this;
  }

  /**
   * Hide title
   */
  withHideTitle(hide?: boolean): this {
    this.hideTitle = hide ?? true;
    return this;
  }

  /**
   * Override clone to include inline-specific properties
   */
  clone(): InlineSubCollectionField {
    const cloned = new InlineSubCollectionField({
      entityForm: this.entityForm,
      relation: this.relation as InlineSubCollectionRelation,
      order: this.order,
      name: this.name,
      label: this.label,
      helpText: this.helpText,
      hidden: this.hidden,
      readonly: this.readonly,
      listFields: this.inlineListFields,
      rowActionColumns: this.inlineRowActionColumns,
      pagination: this.inlinePagination,
      globalListConfig: this.inlineGlobalListConfig,
      fetchOptions: this.fetchOptions,
      hideTitle: this.hideTitle,
    });

    cloned.form = this.form;
    cloned.hideLabel = this.hideLabel;
    cloned.tooltip = this.tooltip;
    cloned.listViewFields = this.listViewFields;
    cloned.viewListOptions = this.viewListOptions;
    cloned.dynamicUrl = this.dynamicUrl;

    return cloned;
  }

  /**
   * Build the SearchForm for fetching data
   */
  async buildSearchForm(parentEntityForm: EntityForm): Promise<SearchForm> {
    const searchForm = new SearchForm();

    // Set page size
    searchForm.withPageSize(this.fetchOptions?.pageSize ?? this.inlinePagination?.pageSize ?? 10);

    // Set viewDetail mode
    if (this.fetchOptions?.viewDetail) {
      searchForm.withViewDetail(true);
    }

    // Get the mappedBy filter
    const mappedByFilter = this.getMappedByFilter(parentEntityForm);

    // Apply user-defined filters if any
    if (this.fetchOptions?.filters) {
      const additionalFilters = await this.fetchOptions.filters(parentEntityForm);
      if (additionalFilters.length > 0 && additionalFilters[0]!.items) {
        // Check if mappedBy filter already exists
        const hasMappedByFilter = additionalFilters[0]!.items.some(
          (item: FilterItem) => item.name === mappedByFilter.name,
        );
        if (!hasMappedByFilter) {
          additionalFilters[0]!.items.unshift(mappedByFilter);
        }
        // Apply all filters
        additionalFilters.forEach((filterGroup) => {
          searchForm.withFilter(filterGroup.condition, ...filterGroup.items);
        });
      }
    } else {
      // Apply only mappedBy filter
      searchForm.handleAndFilter(mappedByFilter.name, mappedByFilter.value);
    }

    return searchForm;
  }

  /**
   * Override render to display inline list table
   */
  async render({
    entityForm,
    session,
  }: {
    entityForm: EntityForm;
    session?: Session;
  }): Promise<ReactNode | null> {
    // Lazy load the InlineSubCollectionView component
    const InlineSubCollectionView = React.lazy(() =>
      import('../components/list/ui/InlineSubCollectionView').then((m) => ({
        default: m.InlineSubCollectionView,
      })),
    );

    // Determine readonly status
    const readonly = await this.isReadonly({ entityForm, session });

    // Get tooltip
    const tooltip = await this.getTooltip({ entityForm, session });

    // Build initial SearchForm
    let initialSearchForm: SearchForm | undefined;
    if (this.fetchOptions?.useSearchForm) {
      initialSearchForm = await this.buildSearchForm(entityForm);
    }

    const viewProps = {
      parentEntityForm: entityForm,
      parentId: entityForm.id!,
      entityForm: this.entityForm,
      relation: this.relation as InlineSubCollectionRelation,
      readonly,
      ...(session !== undefined ? { session } : {}),
      ...(this.inlineListFields !== undefined ? { listFields: this.inlineListFields } : {}),
      ...(this.inlineRowActionColumns !== undefined
        ? { rowActionColumns: this.inlineRowActionColumns }
        : {}),
      ...(this.inlinePagination !== undefined ? { pagination: this.inlinePagination } : {}),
      ...(this.inlineGlobalListConfig !== undefined
        ? { globalListConfig: this.inlineGlobalListConfig }
        : {}),
      ...(this.fetchOptions !== undefined ? { fetchOptions: this.fetchOptions } : {}),
      ...(initialSearchForm !== undefined ? { initialSearchForm } : {}),
      tooltip,
      ...(this.hideTitle !== undefined ? { hideTitle: this.hideTitle } : {}),
      ...(this.viewListOptions !== undefined ? { viewListOptions: this.viewListOptions } : {}),
    };

    return (
      <React.Suspense
        fallback={
          <div className="rcm-loading-overlay">
            <div className="rcm-spinner" />
          </div>
        }
      >
        <InlineSubCollectionView {...viewProps} />
      </React.Suspense>
    );
  }
}
