import { ListableFormField, ListableFormFieldProps } from './ListableFormField';
import { ManyToOneConfig, RenderType } from '../../../config/Config';
import type { CardItemConfig } from '../view/CardManyToOneView';

/**
 * CardView 렌더링 설정
 * ManyToOneField에서 withCardView() 메서드로 활성화할 때 사용
 */
export interface CardViewConfig {
  /** 그리드 컬럼 수 (기본: 3) */
  columns?: number;
  /** 모바일(sm) 화면에서의 컬럼 수 */
  mobileColumns?: number;
  /** 페이지당 카드 수 (기본: 6) */
  pageSize?: number;
  /** 검색 버튼 표시 여부 */
  showSearchButton?: boolean;
  /** 선택 안됨 시 전체 표시 (기본: true) */
  showAllWhenEmpty?: boolean;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 카드 그리드 className */
  gridClassName?: string;
  /** 카드 스타일/렌더링 설정 */
  cardConfig?: CardItemConfig;
  /** 검색 우선 모드: true면 검색 전까지 카드 목록 숨김 (서버 검색) */
  searchFirst?: boolean;
  /** 검색 입력란 플레이스홀더 */
  searchPlaceholder?: string;
  /** 검색 필드 지정 (기본: ['name']) */
  searchFields?: string[];
}

/**
 * SelectBoxView 렌더링 설정
 * ManyToOneField에서 withSelectBoxView() 메서드로 활성화할 때 사용
 */
export interface SelectBoxViewConfig {
  /** 표시할 라벨 필드 이름 또는 함수 (기본: 'name') */
  labelField?: string | ((item: any) => string);
  /** 값 필드 이름 (기본: 'id') */
  valueField?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 선택 안함 옵션 라벨 (required=false일 때) */
  nullValueLabel?: string;
  /** 검색 가능 여부 (기본: false) */
  isSearchable?: boolean;
  /** 메뉴 포지션 */
  menuPosition?: 'fixed' | 'absolute';
  /** 메뉴 배치 */
  menuPlacement?: 'auto' | 'bottom' | 'top';
}

export interface AbstractManyToOneFieldProps<
  TValue = any,
  TForm extends object = any,
> extends ListableFormFieldProps<TValue, TForm> {
  config: ManyToOneConfig;
  /** 카드뷰 사용 여부 */
  useCardView?: boolean;
  /** 카드뷰 설정 */
  cardViewConfig?: CardViewConfig;
  /** 셀렉트박스뷰 사용 여부 */
  useSelectBoxView?: boolean;
  /** 셀렉트박스뷰 설정 */
  selectBoxViewConfig?: SelectBoxViewConfig;
}

/**
 * Abstract base class for ManyToOne relationship fields
 * This class provides common functionality for ManyToOneField and UserField
 */
export abstract class AbstractManyToOneField<
  TSelf extends AbstractManyToOneField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> extends ListableFormField<TSelf, TValue, TForm> {
  config: ManyToOneConfig;

  /** 카드뷰 사용 여부 */
  useCardView?: boolean;

  /** 카드뷰 설정 */
  cardViewConfig?: CardViewConfig;

  /** 셀렉트박스뷰 사용 여부 */
  useSelectBoxView?: boolean;

  /** 셀렉트박스뷰 설정 */
  selectBoxViewConfig?: SelectBoxViewConfig;

  constructor(name: string, order: number, manyToOne: ManyToOneConfig) {
    super(name, order, 'manyToOne');
    this.config = manyToOne;
  }

  /**
   * Get the EntityForm from the config
   */
  getEntityForm() {
    return this.config.entityForm;
  }

  /**
   * Check if this field has a valid config
   */
  hasConfig(): boolean {
    return this.config != null;
  }

  /**
   * Get the field name for ID mapping
   */
  getIdFieldName(): string {
    return this.config.field?.id || 'id';
  }

  /**
   * Get mapped ID and name from the current value
   */
  async getMappedIdName(
    renderType: RenderType = 'create',
  ): Promise<{ id: any; name: any } | undefined> {
    // ManyToOne으로 매핑되어 있는 값의 id 값을 가져온다.
    const value: any = await this.getCurrentValue(renderType);

    if (value) {
      const idField = this.config.field?.id ?? 'id';
      const nameField = this.config.field?.name ?? 'name';
      try {
        if (nameField instanceof Function) {
          return { id: value[idField], name: nameField(value) };
        }
        return { id: value[idField], name: value[nameField] };
      } catch (e) {
        console.error(e);
      }
    }

    return undefined;
  }
}
