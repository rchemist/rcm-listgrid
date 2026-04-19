import { EntityForm } from '../../../config/EntityForm';
import { ReactNode } from 'react';
import { ListableFormField } from '../../fields/abstract';
import {
  ItemCheckable,
  OpenInNewWindowOptions,
  SelectionOptions,
  ViewFieldManageable,
} from './ViewListGrid.types';
import { Session } from '../../../auth/types';

/** Inline expansion state for SubCollection */
export interface InlineExpansionState {
  expandedItems: string[];
  isExpanded: (id: string) => boolean;
  toggleExpansion: (id: string) => void;
  collapseItem: (id: string) => void;
  canExpand: boolean;
  setManagedId: (value: any) => void;
}

export interface ViewRowItemProps extends AbstractRowItemProps, ItemCheckable {
  session?: Session;
  /** 관리자 권한 여부 (부모에서 계산하여 전달) */
  isAdmin?: boolean;
  isSubCollection: boolean;
  list: any[];
  enableCheckItem: boolean;
  managePriority: boolean;
  startNumber: number;
  onDrag?: (idList: string[]) => void;
  useAccordion?: {
    render: (item: any, refresh: () => void) => Promise<ReactNode | null | undefined>;
  };
  sortRowsPriority?: (rows: any[]) => Promise<void>;
  messages?: {
    noData?: string;
  };
  viewMode: 'popup' | 'page';
  selectionOptions?: SelectionOptions;
  showCheckboxInput?: boolean;
  /** 새창 열기 버튼 옵션 */
  openInNewWindow?: OpenInNewWindowOptions;
  /** SubCollection 인라인 확장 상태 (depth <= maxInlineDepth일 때 사용) */
  inlineExpansion?: InlineExpansionState;
  /** SubCollection mappedBy 필드 (부모 참조 필드) - ViewEntityForm에서 자동 숨김 처리 */
  mappedBy?: string;
  /** 인라인/상세 뷰에서 수정 불가 여부 (readonly 또는 modifyOnView: false일 때 true) */
  inlineViewReadonly?: boolean;
}

export interface AbstractRowItemProps extends ViewFieldManageable {
  fields: ListableFormField<any>[];
  router: any;
  path: any;
  entityForm: EntityForm;
  onSelect?: (
    item: any,
    setManagedId?: (value: any) => void,
    clearFilterAndSort?: () => void,
  ) => void;
  onRefresh?: () => void;
}

export interface RowItemProps extends AbstractRowItemProps {
  clickAccordion?: () => void;
  item: any;
  index: number;
  viewMode: 'popup' | 'page';
}
