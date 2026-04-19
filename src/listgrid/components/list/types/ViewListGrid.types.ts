import { ColorType } from '../../../common/type';
import { FilterItem, SearchForm } from '../../../form/SearchForm';
import { PageResult } from '../../../form/Type';
import { EntityFormActionResult } from '../../../config/Config';
import { EntityForm } from '../../../config/EntityForm';
import { ListGrid, SubCollectionProps } from '../../../config/ListGrid';
import { ListableFormField } from '../../fields/abstract';
import { ListGridHeaderButtonProps } from './ListGridHeader.types';
import { ReactNode } from 'react';
import { Session } from '../../../auth/types';
import { getRuntimeConfig } from '../../../config/RuntimeConfig';

export const searchFormHashKey: string = getRuntimeConfig().searchFormHashKey;

export interface SelectionActionButton {
  label: string | ((checkedItems: string[]) => string);
  onClick: (entityForm: EntityForm, checkedItems: string[]) => Promise<void>;
  color?: ColorType;
  outline?: boolean;
  className?: string;
  icon?: ReactNode;
  show?: boolean | ((checkedItems: string[]) => boolean);
  confirmMessage?: string | ((checkedItems: string[]) => string);
  canExecute?: (checkedItems: string[]) => boolean;
}

export interface SelectionOptions {
  // 체크박스 표시 제어
  enabled?: boolean | ((entityForm: EntityForm) => boolean);

  // 선택 가능한 항목 필터링
  selectableFilter?: (item: any) => boolean;

  // 선택 상태 변경 시 콜백
  onSelectionChange?: (checkedItems: string[], allItems: any[]) => void;

  // 선택 제한
  maxSelection?: number;
  minSelection?: number;

  // 선택 검증
  validateSelection?: (checkedItems: string[]) => { valid: boolean; message?: string };

  // 선택 시 표시되는 액션 버튼들
  actions?: SelectionActionButton[];

  // 기본 삭제 버튼 설정
  deleteButton?:
    | {
        show?: boolean | ((checkedItems: string[]) => boolean);
        label?: string | ((checkedItems: string[]) => string);
        confirmMessage?: string | ((checkedItems: string[]) => string);
        className?: string;
        icon?: ReactNode;
      }
    | false; // false로 설정하면 삭제 버튼 완전히 숨김
}

export interface ViewListGridOptionProps {
  hideTitle?: boolean;
  onDragPriority?: { support: boolean; onModify?: (changed: Map<string, number>) => Promise<void> }; // priority 를 지원하는 컬렉션. 즉 우선순위를 변경할 수 있는지 여부. 이 값이 true 라면 listGrid 의 맨 왼쪽에 onDrag 핸들러를 붙여 준다.
  onDrag?: (idList: string[]) => void;
  useAccordion?: { render: (item: any, router: any) => Promise<ReactNode | null | undefined> };
  readonly?: boolean;
  subCollection?: SubCollectionProps;
  onSelect?: (item: any, setManagedId: (value: any) => void) => void;
  manyToOne?: { onSelect: (item: any, setManagedId: (value: any) => void) => void };
  popup?: boolean;
  filterable?: boolean; // EntityForm 설정 여부와 관계 없이 filter 를 할 수 없게 하려면 이 값을 false 로 정의한다.
  sortable?: boolean; // EntityForm 설정 여부와 관계 없이 sort 를 할 수 없게 하려면 이 값을 false 로 정의한.
  createOrUpdate?: CreateUpdateOptions;
  delete?: {
    onDelete?: (
      entityForm: EntityForm,
      rows: any[],
      checkedItems: string[],
    ) => Promise<EntityFormActionResult>;
    postDelete?: (entityForm: EntityForm, rows: any[], checkedItems: string[]) => Promise<void>;
  };
  // 선택 관련 통합 옵션
  selection?: SelectionOptions;
  // if condition is undefined, then AND
  filters?: (
    entityForm: EntityForm,
  ) => Promise<{ condition?: 'AND' | 'OR'; items: FilterItem[] }[]>;
  fields?: ListableFormField<any>[];
  onFetched?: PostFetchListData;
  headerButtons?: ((props: ListGridHeaderButtonProps) => Promise<ReactNode>)[];
  cacheable?: boolean;
  messages?: {
    noData?: string;
  };
  topContent?: (parentId: string, searchForm?: SearchForm) => ReactNode;
  defaultPageSize?: number;
  hidePageSize?: boolean;
  hidePagination?: boolean;
  hideAdvancedSearch?: boolean;
  /**
   * 새창 열기 버튼 설정
   * 활성화 시 각 행의 오른쪽에 새창으로 열기 버튼이 표시됩니다.
   */
  openInNewWindow?: OpenInNewWindowOptions;
  /**
   * URL 동기화 설정
   * 페이징, 검색, 필터, 정렬 상태를 URL 쿼리 파라미터와 동기화
   * - true: 기본 옵션으로 활성화
   * - false: 비활성화
   * - UrlSyncOptions: 세부 옵션 지정
   * 기본값: 메인 엔티티(subCollection이 아닌)에서 자동 활성화
   */
  urlSync?: UrlSyncOptions | boolean;
}

/**
 * 새창 열기 옵션 인터페이스
 */
export interface OpenInNewWindowOptions {
  /** 활성화 여부 (기본값: false) */
  enabled: boolean;
  /** 버튼 툴팁 텍스트 */
  tooltip?: string;
  /** 새창 크기 설정 */
  windowFeatures?: {
    width?: number;
    height?: number;
  };
  /** 행별 표시 여부 필터 (특정 조건의 항목만 새창 버튼 표시) */
  showFilter?: (item: any) => boolean;
}

/**
 * URL 동기화 옵션 인터페이스
 * ListGrid의 페이징, 검색, 필터, 정렬 상태를 URL과 동기화
 */
export interface UrlSyncOptions {
  /** URL 동기화 활성화 여부 (기본값: isMainEntity일 때 true) */
  enabled?: boolean;
  /** 필터를 URL에 포함할지 여부 (기본값: true) */
  includeFilters?: boolean;
  /** 정렬을 URL에 포함할지 여부 (기본값: true) */
  includeSort?: boolean;
  /** 페이지 크기를 URL에 포함할지 여부 (기본값: false) */
  includePageSize?: boolean;
  /** sessionStorage 폴백 사용 여부 (기본값: true) */
  sessionStorageFallback?: boolean;
}

export type PostFetchListData = (pageResult: PageResult) => Promise<PageResult>;

export interface ViewListGridProps {
  listGrid: ListGrid;
  parentId?: string;
  options?: ViewListGridOptionProps;
  title?: string;
  viewMode?: 'popup' | 'page'; // subcollection 일 때는 popup 으로만 사용된다. 일반적인 리스트그리드에서 기본값은 page 이다.
  session?: Session;
}

export interface CreateUpdateOptions {
  addNew?: boolean;
  modal?: boolean;
  onSave?: (entityForm: EntityForm) => Promise<void>;
  onClose?: () => void;
}

export interface ViewFieldManageable {
  viewFields: string[];
  setViewFields?: (viewFields: string[]) => void;
}

export interface ItemCheckable {
  checkedItems: any[];
  setCheckedItems?: (itemIds: any[]) => void;
}
