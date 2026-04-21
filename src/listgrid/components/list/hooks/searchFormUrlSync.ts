import { FilterItem, SearchForm } from '../../../form/SearchForm';
import { FiltersState, hasUrlParams, ListGridUrlState } from './urlStateParsers';

/**
 * Convert SearchForm to URL state object
 * @param searchForm - The SearchForm instance to convert
 * @param quickSearchPropertyName - Name of the quick search field (for backward compatibility)
 * @param orFields - Additional fields that are searched with OR condition in quick search
 * @returns URL state object
 */
export function searchFormToUrlState(
  searchForm: SearchForm,
  quickSearchPropertyName?: string,
  orFields?: string[],
): ListGridUrlState {
  const urlState: ListGridUrlState = {
    page: null,
    pageSize: null,
    q: null,
    sort: null,
    filters: null,
  };

  // Page (only if not 0)
  const page = searchForm.getPage();
  if (page > 0) {
    urlState.page = page;
  }

  // PageSize (only if not default 20)
  const pageSize = searchForm.getPageSize();
  if (pageSize !== 20) {
    urlState.pageSize = pageSize;
  }

  // Sort
  const sorts = searchForm.getSorts();
  if (sorts.size > 0) {
    // Get the first sort (primary sort)
    const [field, direction] = Array.from(sorts.entries())[0]!;
    // Only include if not the default createdAt:DESC
    if (field !== 'createdAt' || direction !== 'DESC') {
      urlState.sort = { field, direction };
    }
  }

  // Filters
  const filters = searchForm.getFilters();
  const quickSearchFields = searchForm.getQuickSearchFields();

  if (filters.size > 0 || quickSearchFields.length > 0) {
    const filtersState: FiltersState = {};

    // Get quick search value from SearchForm (filters.OR 기반)
    const quickSearchValue = searchForm.getQuickSearchValue();

    // Process AND filters
    const andFilters = filters.get('AND');
    if (andFilters && andFilters.length > 0) {
      const urlFilters: FilterItem[] = [];

      for (const filter of andFilters) {
        // Skip quick search filter with subFilters (handled via q parameter)
        if (
          filter.subFilters &&
          filter.subFilters.size > 0 &&
          quickSearchFields.includes(filter.name)
        ) {
          continue;
        }
        // Extract quick search to separate q parameter (legacy single field search)
        if (
          quickSearchPropertyName &&
          filter.name === quickSearchPropertyName &&
          !orFields?.length
        ) {
          // Legacy mode: if quickSearchValue is not set yet, use this filter's value
          if (!quickSearchValue) {
            urlState.q = filter.value ?? null;
          }
          continue; // Don't include in filters
        }
        // Skip NOT conditions (developer filters, not user filters)
        if (filter.not) {
          continue;
        }
        urlFilters.push(filter);
      }

      if (urlFilters.length > 0) {
        filtersState.AND = urlFilters;
      }
    }

    // Process OR filters (exclude quick search fields)
    const orFilters = filters.get('OR');
    if (orFilters && orFilters.length > 0) {
      // Filter out quick search filters and NOT conditions
      const urlFilters = orFilters.filter((f) => !f.not && !quickSearchFields.includes(f.name));
      if (urlFilters.length > 0) {
        filtersState.OR = urlFilters;
      }
    }

    // Set quick search from SearchForm
    if (quickSearchValue) {
      urlState.q = quickSearchValue;
    }

    // Set filters if any exist
    if (filtersState.AND?.length || filtersState.OR?.length) {
      urlState.filters = filtersState;
    }
  }

  return urlState;
}

/**
 * Convert URL state to SearchForm
 * @param urlState - URL state object
 * @param quickSearchPropertyName - Name of the quick search field
 * @param baseSearchForm - Optional base SearchForm to clone
 * @param orFields - Additional fields that are searched with OR condition in quick search
 * @returns New SearchForm instance
 */
export function urlStateToSearchForm(
  urlState: ListGridUrlState,
  quickSearchPropertyName?: string,
  baseSearchForm?: SearchForm,
  orFields?: string[],
): SearchForm {
  const searchForm = baseSearchForm?.clone() ?? SearchForm.create();

  // Page
  if (urlState.page !== null) {
    searchForm.withPage(urlState.page);
  }

  // PageSize
  if (urlState.pageSize !== null) {
    searchForm.withPageSize(urlState.pageSize);
  }

  // Sort
  if (urlState.sort) {
    searchForm.withSort(urlState.sort.field, urlState.sort.direction);
  }

  // Quick search - reconstruct OR conditions if orFields exist
  if (urlState.q && quickSearchPropertyName) {
    if (orFields && orFields.length > 0) {
      // Use handleQuickSearch for OR condition search
      const allFields = [quickSearchPropertyName, ...orFields];
      searchForm.handleQuickSearch(urlState.q, allFields);
    } else {
      // Legacy single field search
      searchForm.handleAndFilter(quickSearchPropertyName, urlState.q, 'LIKE');
    }
  }

  // Filters
  if (urlState.filters) {
    if (urlState.filters.AND && urlState.filters.AND.length > 0) {
      searchForm.withFilter('AND', ...urlState.filters.AND);
    }
    if (urlState.filters.OR && urlState.filters.OR.length > 0) {
      searchForm.withFilter('OR', ...urlState.filters.OR);
    }
  }

  return searchForm;
}

/**
 * Merge URL state with sessionStorage state
 * Priority: URL > sessionStorage > default
 *
 * @param urlState - State from URL
 * @param sessionSearchForm - SearchForm from sessionStorage (can be undefined)
 * @param quickSearchPropertyName - Quick search field name
 * @param orFields - Additional fields that are searched with OR condition in quick search
 * @returns Merged SearchForm
 */
export function mergeUrlAndSessionState(
  urlState: ListGridUrlState,
  sessionSearchForm: SearchForm | undefined,
  quickSearchPropertyName?: string,
  orFields?: string[],
): SearchForm {
  // If URL has any params, use URL state (URL priority)
  if (hasUrlParams(urlState)) {
    // Start with session form as base to preserve non-URL state
    return urlStateToSearchForm(urlState, quickSearchPropertyName, sessionSearchForm, orFields);
  }

  // No URL params, use sessionStorage if available
  if (sessionSearchForm) {
    return sessionSearchForm.clone();
  }

  // Neither URL nor session, return empty
  return SearchForm.create();
}

/**
 * Extract quick search value from SearchForm
 * @param searchForm - SearchForm to extract from
 * @param quickSearchPropertyName - Quick search field name
 * @param orFields - Additional fields that are searched with OR condition (for determining mode)
 * @returns Quick search value or empty string
 */
export function getQuickSearchFromSearchForm(
  searchForm: SearchForm,
  quickSearchPropertyName?: string,
  orFields?: string[],
): string {
  // First, try to get value from _quickSearch filter (OR condition search)
  const quickSearchValue = searchForm.getQuickSearchValue();
  if (quickSearchValue) {
    return quickSearchValue;
  }

  // Fallback: try legacy single field search (only when not using OR search mode)
  // When orFields exist, we're in OR search mode and AND filters on quickSearch fields
  // should NOT be treated as quick search values
  if (!quickSearchPropertyName || (orFields && orFields.length > 0)) {
    return '';
  }

  const filters = searchForm.getFilter(quickSearchPropertyName);
  if (filters.length > 0 && filters[0]!.filters.length > 0) {
    return filters[0]!.filters[0]!.value ?? '';
  }

  return '';
}

/**
 * Check if two URL states are equal
 */
export function areUrlStatesEqual(a: ListGridUrlState, b: ListGridUrlState): boolean {
  // Page
  if (a.page !== b.page) return false;

  // PageSize
  if (a.pageSize !== b.pageSize) return false;

  // Quick search
  if (a.q !== b.q) return false;

  // Sort
  if (a.sort?.field !== b.sort?.field || a.sort?.direction !== b.sort?.direction) {
    return false;
  }

  // Filters (deep compare via JSON)
  const aFilters = JSON.stringify(a.filters);
  const bFilters = JSON.stringify(b.filters);
  if (aFilters !== bFilters) return false;

  return true;
}
