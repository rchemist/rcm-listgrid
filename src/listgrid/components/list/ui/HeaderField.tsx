import { getAlignClassName } from '../../../common/func';
import React from 'react';
import { ListableFormField } from '../../fields/abstract';
import { getTranslation } from '../../../utils/i18n';
import { isTrue } from '../../../utils/BooleanUtil';
import { SortField } from './SortField';
import { SearchForm } from '../../../form/SearchForm';
import { ViewFieldManageable } from '../types/ViewListGrid.types';
import { EntityForm } from '../../../config/EntityForm';
import { HeaderFieldFilter } from './HeaderFieldFilter';
import { useListGridTheme } from '../context/ListGridThemeContext';

interface ViewHeaderFieldProps extends ViewFieldManageable {
  gridId: string;
  fields: ListableFormField<any>[];
  searchForm: SearchForm;
  entityForm: EntityForm;
  onChangeSearchForm: (searchForm: SearchForm, resetPage?: boolean) => void;
  sortable: boolean;
  draggable?: boolean;
  /** QuickSearch 필드명 Set (quickSearch 활성 시 해당 필드 헤더 필터 비활성화용) */
  quickSearchFieldNames?: Set<string>;
  /** QuickSearch 값 (값이 있으면 quickSearch 필드 헤더 필터 비활성화) */
  quickSearchValue?: string;
}
export const HeaderField = ({ viewFields, ...props }: ViewHeaderFieldProps) => {
  const { t } = getTranslation();
  const { classNames: themeClasses } = useListGridTheme();

  const listFields = props.fields;

  const draggable = isTrue(props.draggable);

  // 테마에서 헤더 셀 클래스 가져오기
  const cellClass = themeClasses.headerCell?.cell ?? 'whitespace-nowrap';
  const sortableClass =
    themeClasses.headerCell?.sortable ?? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-dark/30';
  const sortIconClass = themeClasses.headerCell?.sortIcon ?? 'ml-1 inline-block';
  const filterIconClass =
    themeClasses.headerCell?.filterIcon ?? 'ml-1 text-gray-400 hover:text-primary cursor-pointer';

  return (
    <React.Fragment>
      {listFields.map((field, index) => {
        if (viewFields.length === 0 || viewFields.includes(field.getName())) {
          const alignClassName = getAlignClassName(field.getListFieldAlignType(), true);

          const sortable: boolean = props.sortable && isTrue(field.getListConfig()?.sortable, true);
          const filterable: boolean = field.isFilterable();

          // QuickSearch 필드이고, QuickSearch 값이 있으면 헤더 필터 비활성화
          const isQuickSearchField = props.quickSearchFieldNames?.has(field.getName()) ?? false;
          const isQuickSearchActive = !!(
            props.quickSearchValue && props.quickSearchValue.trim().length > 0
          );
          const disableHeaderFilter = isQuickSearchField && isQuickSearchActive;

          return (
            <th key={`th_${index}`} className={cellClass}>
              <div className={`w-full min-w-[40px] flex items-center ${alignClassName}`}>
                <span>{field.viewLabel(t)}</span>
                {isTrue(sortable) && (
                  <span className={`inline-flex items-center ${sortIconClass}`}>
                    <SortField
                      name={field.name}
                      searchForm={props.searchForm}
                      onChangeSearchForm={props.onChangeSearchForm}
                    />
                  </span>
                )}
                {filterable && (
                  <span className={`inline-flex items-center ${filterIconClass}`}>
                    <HeaderFieldFilter
                      field={field}
                      gridId={props.gridId}
                      searchForm={props.searchForm}
                      entityForm={props.entityForm}
                      onChangeSearchForm={props.onChangeSearchForm}
                      disabled={disableHeaderFilter}
                    />
                  </span>
                )}
              </div>
            </th>
          );
        }
        return null;
      })}
      {draggable && (
        <th
          key={`th_drag`}
          className={themeClasses.headerCell?.dragHandleCell ?? 'w-2 whitespace-nowrap'}
        >
          {t('순서 변경')}
        </th>
      )}
    </React.Fragment>
  );
};
