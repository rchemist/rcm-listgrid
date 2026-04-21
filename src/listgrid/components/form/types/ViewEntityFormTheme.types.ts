import React from 'react';
import { EntityForm } from '../../../config/EntityForm';
import { FormField } from '../../fields/abstract';
import { Session } from '../../../auth/types';
import {
  ListGridThemeVariant,
  ViewListGridClassNames,
} from '../../list/types/ViewListGridTheme.types';

/**
 * 커스텀 필드 렌더러에 전달되는 Props
 *
 * @example
 * ```tsx
 * const MyCardRenderer: React.FC<CustomFieldRendererProps> = ({
 *   field,
 *   entityForm,
 *   value,
 *   onChange,
 *   required,
 *   readonly,
 * }) => {
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       {items.map(item => (
 *         <Card
 *           key={item.id}
 *           selected={value?.id === item.id}
 *           onClick={() => onChange(item)}
 *         />
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export interface CustomFieldRendererProps {
  /** 렌더링할 필드 인스턴스 */
  field: FormField<any>;
  /** EntityForm 인스턴스 */
  entityForm: EntityForm;
  /** EntityForm setter */
  setEntityForm?: React.Dispatch<React.SetStateAction<EntityForm | undefined>>;
  /** 현재 필드 값 */
  value: any;
  /** 값 변경 핸들러 */
  onChange: (value: any, propagation?: boolean) => void;
  /** 에러 발생 핸들러 */
  onError: (message: string) => void;
  /** 에러 초기화 핸들러 */
  clearError: () => void;
  /** 필수 여부 */
  required: boolean;
  /** 읽기 전용 여부 */
  readonly: boolean;
  /** 세션 정보 */
  session?: Session;
  /** 도움말 텍스트 */
  helpText?: React.ReactNode;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 서브콜렉션 엔티티 여부 */
  subCollectionEntity?: boolean;
  /** EntityForm 리셋 함수 */
  resetEntityForm?: (delay?: number, preserveState?: boolean) => Promise<void>;
}

/**
 * 필드 렌더러 맵 타입
 * 필드명을 키로, 커스텀 렌더러 컴포넌트를 값으로 가지는 객체
 */
export type FieldRendererMap = {
  [fieldName: string]: React.ComponentType<CustomFieldRendererProps>;
};

/**
 * ViewEntityForm 컴포넌트 테마 타입 정의
 *
 * 이 타입을 사용하여 EntityForm의 모든 스타일 요소를 커스터마이징할 수 있습니다.
 * 모노리포 환경에서 사이트별로 다른 디자인을 적용할 때 사용합니다.
 *
 * @example
 * ```tsx
 * const myTheme: ViewEntityFormClassNames = {
 *   header: {
 *     container: 'mt-2 bg-blue-50',
 *   },
 *   title: {
 *     text: 'text-2xl text-blue-800',
 *   },
 * };
 * ```
 */
export interface ViewEntityFormClassNames {
  /**
   * 최상위 컨테이너 스타일
   */
  root?: string;

  /**
   * 로딩 상태 스타일
   */
  loading?: {
    /** 로딩 컨테이너 */
    container?: string;
    /** 로딩 스켈레톤 */
    skeleton?: string;
  };

  /**
   * 헤더 영역 스타일 (제목 + 버튼)
   */
  header?: {
    /** 헤더 전체 컨테이너 */
    container?: string;
    /** 데스크톱 레이아웃 */
    desktop?: string;
    /** 모바일 레이아웃 */
    mobile?: string;
    /** 제목 wrapper */
    titleWrapper?: string;
    /** 버튼 wrapper */
    buttonWrapper?: string;
  };

  /**
   * 제목 스타일
   */
  title?: {
    /** 제목 컨테이너 */
    container?: string;
    /** 제목 텍스트 */
    text?: string;
  };

  /**
   * 버튼 스타일
   */
  buttons?: {
    /** 버튼 그룹 컨테이너 */
    container?: string;
    /** 버튼 inner wrapper */
    innerWrapper?: string;
    /** 저장 버튼 */
    save?: string;
    /** 목록 버튼 */
    list?: string;
    /** 삭제 버튼 */
    delete?: string;
    /** 닫기 버튼 (팝업) */
    close?: string;
    /** 커스텀 버튼 기본값 */
    custom?: string;
  };

  /**
   * Alert 메시지 스타일
   */
  alerts?: {
    /** 단일 알림 컨테이너 */
    singleContainer?: string;
    /** 다중 알림 컨테이너 */
    multiContainer?: string;
    /** 헤더 (접힘/펼침 버튼) */
    header?: string;
    /** 헤더 - 펼쳐진 상태 */
    headerExpanded?: string;
    /** 헤더 - 접힌 상태 */
    headerCollapsed?: string;
    /** 알림 목록 컨테이너 */
    listContainer?: string;
    /** 알림 목록 - 펼쳐진 상태 */
    listExpanded?: string;
    /** 알림 목록 - 접힌 상태 */
    listCollapsed?: string;
    /** 알림 목록 내부 */
    listContent?: string;
  };

  /**
   * 개별 AlertItem 스타일
   */
  alertItem?: {
    /** 알림 아이템 컨테이너 */
    container?: string;
    /** 아이콘 */
    icon?: string;
    /** 콘텐츠 wrapper */
    contentWrapper?: string;
    /** 메시지 텍스트 */
    message?: string;
    /** 설명 텍스트 */
    description?: string;
    /** 닫기 버튼 */
    closeButton?: string;
    /** 색상별 스타일 (동적) - success, danger, warning, info 등 */
    colorVariants?: {
      success?: string;
      danger?: string;
      warning?: string;
      info?: string;
      primary?: string;
      secondary?: string;
      dark?: string;
    };
  };

  /**
   * 에러 표시 스타일
   */
  errors?: {
    /** 에러 컨테이너 */
    container?: string;
    /** 에러 헤더 버튼 */
    header?: string;
    /** 에러 헤더 - 펼쳐진 상태 */
    headerExpanded?: string;
    /** 에러 헤더 - 접힌 상태 */
    headerCollapsed?: string;
    /** 에러 아이콘 */
    headerIcon?: string;
    /** 에러 타이틀 */
    headerTitle?: string;
    /** 에러 카운트 뱃지 */
    headerBadge?: string;
    /** 에러 콘텐츠 영역 */
    content?: string;
    /** 에러 아이템 컨테이너 */
    item?: string;
    /** 탭 이름 */
    tabName?: string;
    /** 필드별 에러 목록 */
    fieldErrors?: string;
    /** 필드 에러 버튼 */
    fieldErrorButton?: string;
  };

  /**
   * 탭 스타일
   */
  tabs?: {
    /** 탭 리스트 컨테이너 */
    list?: string;
    /** 탭 버튼 */
    tab?: string;
    /** 탭 버튼 - 선택된 상태 */
    tabSelected?: string;
    /** 탭 버튼 - 비활성화 상태 */
    tabDisabled?: string;
  };

  /**
   * 탭 패널 스타일
   */
  tabPanel?: {
    /** Tab.Panel 자체에 적용되는 클래스 */
    panel?: string;
    /** 빈 상태 메시지 */
    empty?: string;
    /** 콘텐츠 영역 */
    content?: string;
  };

  /**
   * 패널/스크롤 영역 스타일
   */
  panel?: {
    /** 스크롤 컨테이너 */
    scrollContainer?: string;
    /** 레이아웃 wrapper */
    layoutWrapper?: string;
    /** 패널 컨테이너 */
    container?: string;
    /** 패널 내부 */
    inner?: string;
  };

  /**
   * 필드 그룹 스타일
   */
  fieldGroup?: {
    /** 그룹 컨테이너 (panel) */
    container?: string;
    /** 그룹 헤더 영역 */
    header?: string;
    /** 그룹 제목 */
    title?: string;
    /** 액션 영역 (도움말, 접기/펼치기) */
    actions?: string;
    /** 접기/펼치기 토글 */
    collapseToggle?: string;
    /** 필드 목록 컨테이너 */
    content?: string;
  };

  /**
   * 개별 필드 스타일
   */
  field?: {
    /** 필드 컨테이너 */
    container?: string;
    /** 레이블 wrapper */
    labelWrapper?: string;
    /** 레이블 텍스트 */
    label?: string;
    /** 필수 아이콘 */
    requiredIcon?: string;
    /** 수정됨 아이콘 */
    dirtyIcon?: string;
    /** 도움말 아이콘 */
    tooltipIcon?: string;
    /** 필드 값 컨테이너 */
    valueContainer?: string;
  };

  /**
   * 필드 에러 스타일
   */
  fieldError?: {
    /** 에러 메시지 */
    message?: string;
  };

  /**
   * 도움말 텍스트 스타일
   */
  helpText?: {
    /** 도움말 텍스트 */
    text?: string;
  };

  /**
   * CreateStep (단계별 생성) 스타일
   */
  createStep?: {
    /** 전체 컨테이너 */
    container?: string;
    /** 패널 */
    panel?: string;
    /** 스텝퍼 wrapper */
    stepperWrapper?: string;
    /** 스텝 라벨 */
    stepLabel?: string;
    /** 버튼 그룹 */
    buttonGroup?: string;
    /** 이전 버튼 */
    prevButton?: string;
    /** 다음 버튼 */
    nextButton?: string;
    /** 저장 버튼 */
    saveButton?: string;
    /** 토글 버튼 */
    toggleButton?: string;
  };

  /**
   * 헤더 영역 스타일 (withHeaderArea로 추가된 커스텀 영역)
   * 헤더 버튼과 Alert 영역 사이에 표시되는 sticky 고정 영역
   */
  headerArea?: {
    /** 헤더 영역 컨테이너 */
    container?: string;
  };

  /**
   * 푸터 영역 스타일 (buttonPosition: 'bottom' 일 때 사용)
   */
  footer?: {
    /** 푸터 컨테이너 */
    container?: string;
  };
}

/**
 * 테마 컨텍스트 값 타입
 */
export interface EntityFormThemeContextValue {
  /** 클래스 이름 객체 */
  classNames: ViewEntityFormClassNames;
  /**
   * 기본 클래스와 커스텀 클래스를 병합
   * @param base 기본 Tailwind 클래스
   * @param custom 커스텀 클래스 (선택사항)
   * @returns 병합된 클래스 문자열
   */
  cn: (base: string, custom?: string) => string;
  /**
   * 커스텀 필드 렌더러
   * 특정 필드명에 대해 기본 View 대신 사용할 커스텀 컴포넌트
   */
  fieldRenderers?: FieldRendererMap;
  /**
   * 특정 필드에 대한 커스텀 렌더러가 있는지 확인
   * @param fieldName 필드명
   * @returns 커스텀 렌더러 컴포넌트 또는 undefined
   */
  getFieldRenderer: (
    fieldName: string,
  ) => React.ComponentType<CustomFieldRendererProps> | undefined;
  /** 버튼 라벨 오버라이드 */
  buttonLabels?: ButtonLabelOverrides;
  /** Custom stepper renderer for create step mode */
  stepperRenderer?: StepperRenderer;
  /** Create step button position: 'top' (inside stepper panel) or 'bottom' (below form fields) */
  createStepButtonPosition?: 'top' | 'bottom';
}

/**
 * 버튼 라벨 오버라이드
 */
export interface ButtonLabelOverrides {
  save?: string;
  delete?: string;
  list?: string;
}

/**
 * Custom stepper renderer props for create step mode
 * CreateStep 모드에서 커스텀 스테퍼 렌더러에 전달되는 Props
 */
export interface StepperRendererProps {
  /** Step definitions */
  steps: { id: string; label: string; description?: string }[];
  /** Current active step index */
  currentStep: number;
  /** Maximum step index */
  maxStep: number;
  /** Step click handler */
  onStepClick: (step: number) => void;
}

/**
 * Custom stepper renderer component type
 * 커스텀 스테퍼 렌더러 컴포넌트 타입
 */
export type StepperRenderer = React.ComponentType<StepperRendererProps>;

/**
 * 테마 Provider props 타입
 */
export interface EntityFormThemeProviderProps {
  /** 커스텀 테마 (기본 테마에 병합됨) */
  theme?: Partial<ViewEntityFormClassNames>;
  /** 버튼 라벨 오버라이드 */
  buttonLabels?: ButtonLabelOverrides;
  /**
   * 커스텀 필드 렌더러
   * 특정 필드의 View를 완전히 다른 컴포넌트로 대체
   *
   * @example
   * ```tsx
   * <EntityFormThemeProvider
   *   theme={myTheme}
   *   fieldRenderers={{
   *     syllabus: CardManyToOneView,
   *     selection: CardManyToOneView,
   *   }}
   * >
   *   {children}
   * </EntityFormThemeProvider>
   * ```
   */
  fieldRenderers?: FieldRendererMap;
  /** Custom stepper renderer for create step mode */
  stepperRenderer?: StepperRenderer;
  /** Create step button position */
  createStepButtonPosition?: 'top' | 'bottom';
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}

// ============================================================================
// 통합 테마 시스템 (EntityForm + ListGrid)
// ============================================================================

/**
 * 통합 테마 클래스 타입
 *
 * EntityForm과 ListGrid의 모든 스타일을 하나의 테마로 관리합니다.
 * 모노리포 환경에서 사이트별/컨텍스트별 다른 디자인을 적용할 때 사용합니다.
 *
 * @example
 * ```tsx
 * const myTheme: ThemeClassNames = {
 *   entityForm: {
 *     header: { container: 'mt-2 bg-blue-50' },
 *   },
 *   listGrid: {
 *     panel: { container: 'mt-5 border rounded-xl' },
 *   },
 * };
 * ```
 */
export interface ThemeClassNames {
  /** EntityForm 테마 클래스 */
  entityForm?: ViewEntityFormClassNames;
  /** ListGrid 테마 클래스 */
  listGrid?: ViewListGridClassNames;
}

/**
 * 테마 변형 타입 (EntityForm + ListGrid 통합)
 */
export type ThemeVariant = 'default' | 'main' | 'subCollection' | 'modal' | 'popup' | 'compact';

/**
 * 통합 테마 컨텍스트 값 타입
 */
export interface ThemeContextValue {
  /** EntityForm 클래스 이름 객체 */
  entityFormClassNames: ViewEntityFormClassNames;
  /** ListGrid 클래스 이름 객체 */
  listGridClassNames: ViewListGridClassNames;
  /**
   * 기본 클래스와 커스텀 클래스를 병합
   * @param base 기본 Tailwind 클래스
   * @param custom 커스텀 클래스 (선택사항)
   * @returns 병합된 클래스 문자열
   */
  cn: (base: string, custom?: string) => string;
  /** 현재 적용된 변형 */
  variant: ThemeVariant;
  /**
   * 커스텀 필드 렌더러
   * 특정 필드명에 대해 기본 View 대신 사용할 커스텀 컴포넌트
   */
  fieldRenderers?: FieldRendererMap;
  /**
   * 특정 필드에 대한 커스텀 렌더러가 있는지 확인
   * @param fieldName 필드명
   * @returns 커스텀 렌더러 컴포넌트 또는 undefined
   */
  getFieldRenderer: (
    fieldName: string,
  ) => React.ComponentType<CustomFieldRendererProps> | undefined;
}

/**
 * 통합 테마 Provider props 타입
 */
export interface ThemeProviderProps {
  /** 커스텀 테마 (기본 테마에 병합됨) */
  theme?: Partial<ThemeClassNames>;
  /** 테마 변형 (default, main, subCollection, modal 등) */
  variant?: ThemeVariant;
  /**
   * 커스텀 필드 렌더러
   * 특정 필드의 View를 완전히 다른 컴포넌트로 대체
   */
  fieldRenderers?: FieldRendererMap;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}

// Re-export for convenience
export type { ViewListGridClassNames, ListGridThemeVariant };
