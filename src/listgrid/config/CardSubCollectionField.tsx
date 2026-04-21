import { EntityForm } from './EntityForm';
import {
  getConditionalReactNode,
  HelpTextType,
  HiddenType,
  LabelType,
  ReadOnlyType,
  TooltipType,
} from './Config';
import { ReactNode } from 'react';
import { FieldInfoParameters } from './EntityField';
import { Session } from '../auth/types';
import React from 'react';
import { FilterItem, SearchForm } from '../form/SearchForm';
import { SubCollectionField } from './SubCollectionField';

/**
 * Columns configuration type
 * - number: Field columns only, card grid is auto-calculated
 * - {card, field}: Explicit card grid and field columns
 */
export type ColumnsConfig = number | { card: number; field: number };

/**
 * Card configuration for CardSubCollectionField
 */
export interface CardConfig {
  /**
   * Column configuration for card grid and field layout
   * - number: Field columns only (card grid auto-calculated based on layout)
   * - {card, field}: Explicit card grid columns and field columns
   * - Mobile is always 1 column for both cards and fields
   * @default 2
   */
  columns?: ColumnsConfig;
  /**
   * Page size for client-side pagination
   * - If set, enables client-side pagination with the specified page size
   * - If not set or 0, all items are displayed without pagination
   * @default undefined (no pagination)
   */
  pageSize?: number;
  /** Fields to display on each card (whitelist) */
  displayFields?: string[];
  /** Fields to exclude from card display (blacklist) - useful when titleField is a function */
  excludeFields?: string[];
  /** Field name or function for card title */
  titleField?: string | ((item: any) => string);
  /** CSS class name for card container */
  containerClassName?: string;
  /** CSS class name for selected card container */
  selectedContainerClassName?: string;
  /** CSS class name for card title */
  titleClassName?: string;
  /** Custom render function for entire card */
  renderCard?: (item: any, isSelected: boolean, onSelect: () => void) => ReactNode;
}

/**
 * CardSubCollectionRelation configuration
 * Defines the relationship between parent and child entities
 */
export interface CardSubCollectionRelation {
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
 * Filter configuration for CardSubCollectionField
 * Same format as ViewListGridOptionProps.filters
 */
export type CardSubCollectionFilters = (entityForm: EntityForm) => Promise<
  {
    condition: 'AND' | 'OR';
    items: FilterItem[];
  }[]
>;

/**
 * Fetch options for CardSubCollectionField
 * Controls how data is fetched (SearchForm-based vs simple URL)
 */
export interface CardSubCollectionFetchOptions {
  /** Whether to use SearchForm-based fetching (POST request) */
  useSearchForm?: boolean;
  /** Page size for fetching all data (default: 10000) */
  pageSize?: number;
  /** Whether to use viewDetail mode */
  viewDetail?: boolean;
  /** Additional filters to apply */
  filters?: CardSubCollectionFilters;
}

/**
 * CardSubCollectionField configuration
 * Extends SubCollectionField to display items in a card grid format
 */
export class CardSubCollectionField extends SubCollectionField {
  // Card-specific properties
  tooltip?: TooltipType | undefined;
  fetchUrl: string;
  fetchUrlFunction?: ((parentEntityForm: EntityForm) => string) | undefined;
  cardConfig?: CardConfig | undefined;
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
    cardConfig?: CardConfig | undefined;
    fetchOptions?: CardSubCollectionFetchOptions | undefined;
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

    // Set default fetchOptions (same as SubCollectionField behavior)
    // Default: useSearchForm: true, viewDetail: true, pageSize: 10000
    const defaultFetchOptions: CardSubCollectionFetchOptions = {
      useSearchForm: true,
      viewDetail: true,
      pageSize: 10000,
    };

    // Merge user-provided fetchOptions with defaults
    this.fetchOptions = props.fetchOptions
      ? { ...defaultFetchOptions, ...props.fetchOptions }
      : defaultFetchOptions;

    // Handle fetchUrl - can be string or function
    // When useSearchForm is true (default), use the entityForm's URL
    if (this.fetchOptions.useSearchForm) {
      this.fetchUrl = props.entityForm.getUrl();
    } else if (typeof props.fetchUrl === 'function') {
      this.fetchUrl = props.entityForm.getUrl(); // Default to entityForm URL
      this.fetchUrlFunction = props.fetchUrl;
    } else {
      this.fetchUrl = props.fetchUrl ?? props.entityForm.getUrl();
    }

    this.cardConfig = props.cardConfig;
  }

  /**
   * Override withTooltip to support tooltips (parent class doesn't support it)
   */
  withTooltip(tooltip?: TooltipType): this {
    this.tooltip = tooltip;
    return this;
  }

  async getTooltip(props: FieldInfoParameters): Promise<ReactNode> {
    return await getConditionalReactNode(props, this.tooltip);
  }

  /**
   * Override clone to include card-specific properties
   */
  clone(): CardSubCollectionField {
    const cloned = new CardSubCollectionField({
      entityForm: this.entityForm,
      relation: this.relation as CardSubCollectionRelation,
      order: this.order,
      name: this.name,
      label: this.label,
      helpText: this.helpText,
      hidden: this.hidden,
      readonly: this.readonly,
      fetchUrl: this.fetchUrl,
      cardConfig: this.cardConfig,
      fetchOptions: this.fetchOptions,
    });

    cloned.form = this.form;
    cloned.hideLabel = this.hideLabel;
    cloned.tooltip = this.tooltip;

    return cloned;
  }

  withFetchOptions(fetchOptions: CardSubCollectionFetchOptions): this {
    // Merge with existing fetchOptions (which already has defaults)
    this.fetchOptions = { ...this.fetchOptions, ...fetchOptions };
    return this;
  }

  withCardConfig(cardConfig: CardConfig): this {
    this.cardConfig = cardConfig;
    return this;
  }

  /**
   * Build the SearchForm for fetching data
   * Note: getMappedByFilter() and getMappedByValue() are inherited from SubCollectionField
   */
  async buildSearchForm(parentEntityForm: EntityForm): Promise<SearchForm> {
    const searchForm = new SearchForm();

    // Set page size (default: 10000 to fetch all data at once)
    searchForm.withPageSize(this.fetchOptions?.pageSize ?? 10000);

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
   * Override render to display card grid instead of list grid
   */
  async render({
    entityForm,
    session,
  }: {
    entityForm: EntityForm;
    session?: Session;
  }): Promise<ReactNode | null> {
    // Lazy load the CardSubCollectionView component
    const CardSubCollectionView = React.lazy(() =>
      import('../components/list/ui/CardSubCollectionView').then((m) => ({
        default: m.CardSubCollectionView,
      })),
    );

    // Get the fetch URL
    let fetchUrl: string;
    if (this.fetchUrlFunction) {
      fetchUrl = this.fetchUrlFunction(entityForm);
    } else {
      fetchUrl = this.fetchUrl;
    }

    // Determine readonly status
    const readonly = await this.isReadonly({ entityForm, session });

    // Get tooltip
    const tooltip = await this.getTooltip({ entityForm, session });

    // Build initial SearchForm if using SearchForm-based fetching
    let initialSearchForm: SearchForm | undefined;
    if (this.fetchOptions?.useSearchForm) {
      initialSearchForm = await this.buildSearchForm(entityForm);
    }

    const viewProps = {
      parentEntityForm: entityForm,
      parentId: entityForm.id!,
      entityForm: this.entityForm,
      fetchUrl,
      ...(this.cardConfig !== undefined ? { cardConfig: this.cardConfig } : {}),
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
        <CardSubCollectionView {...viewProps} />
      </React.Suspense>
    );
  }
}
