/**
 * ViewListGrid 컴포넌트 테마 타입 정의
 *
 * ListGrid와 하위 컴포넌트들의 모든 스타일 요소를 커스터마이징할 수 있습니다.
 * EntityFormTheme과 함께 통합 테마 시스템의 일부로 사용됩니다.
 *
 * @example
 * ```tsx
 * const myListGridTheme: ViewListGridClassNames = {
 *   panel: {
 *     container: 'mt-5 border rounded-xl',
 *   },
 *   table: {
 *     container: 'table-hover w-full',
 *   },
 * };
 * ```
 */
export interface ViewListGridClassNames {
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
    /** 로딩 오버레이 영역 */
    overlay?: string;
    /** 로딩 스켈레톤 */
    skeleton?: string;
  };

  /**
   * 헤더 영역 스타일 (ListGridHeader)
   */
  header?: {
    /** 헤더 전체 컨테이너 */
    container?: string;
    /** 제목 영역 외부 컨테이너 */
    titleContainer?: string;
    /** 제목 영역 내부 래퍼 */
    titleWrapper?: string;
    /** 제목 텍스트 */
    titleText?: string;
    /** 버튼 그룹 컨테이너 */
    buttonGroup?: string;
  };

  /**
   * 패널 스타일 (메인 컨텐츠 영역)
   */
  panel?: {
    /** 패널 컨테이너 */
    container?: string;
    /** Main Entity 스타일 */
    mainEntity?: string;
    /** SubCollection 스타일 */
    subCollection?: string;
    /** 기본 스타일 (isMainEntity, isSubCollection 모두 false) */
    default?: string;
  };

  /**
   * 서브콜렉션 버튼 영역 (SubCollectionButtons)
   */
  subCollectionButtons?: {
    /** 컨테이너 */
    container?: string;
    /** 버튼 그룹 */
    buttonGroup?: string;
    /** 추가 버튼 */
    addButton?: string;
    /** 삭제 버튼 */
    deleteButton?: string;
    /** 기타 액션 버튼 */
    actionButton?: string;
  };

  /**
   * 검색바 스타일 (QuickSearchBar)
   */
  searchBar?: {
    /** 검색바 전체 컨테이너 */
    container?: string;
    /** 내부 래퍼 */
    innerWrapper?: string;
    /** 레이아웃 래퍼 (flex) */
    layoutWrapper?: string;
  };

  /**
   * 검색 인풋 스타일 (QuickSearchInput)
   */
  searchInput?: {
    /** 인풋 컨테이너 */
    container?: string;
    /** 인풋 필드 */
    input?: string;
    /** 검색 아이콘 */
    icon?: string;
    /** 검색 버튼 */
    button?: string;
    /** 클리어 버튼 */
    clearButton?: string;
  };

  /**
   * 검색바 액션 버튼 (SearchBarActions)
   */
  searchBarActions?: {
    /** 컨테이너 */
    container?: string;
    /** 페이지 사이즈 셀렉트 */
    pageSizeSelect?: string;
    /** 필터 버튼 */
    filterButton?: string;
    /** 필드 선택기 버튼 */
    fieldSelectorButton?: string;
    /** 고급 검색 버튼 */
    advancedSearchButton?: string;
  };

  /**
   * 고급 검색 폼 스타일 (AdvancedSearchForm)
   */
  advancedSearch?: {
    /** 폼 컨테이너 */
    container?: string;
    /** 폼 패널 */
    panel?: string;
    /** 필드 그리드 */
    fieldGrid?: string;
    /** 버튼 영역 */
    buttonArea?: string;
    /** 검색 버튼 */
    searchButton?: string;
    /** 초기화 버튼 */
    resetButton?: string;
    /** 닫기 버튼 */
    closeButton?: string;
  };

  /**
   * 테이블 스타일
   */
  table?: {
    /** 테이블 responsive 래퍼 */
    responsiveWrapper?: string;
    /** 테이블 컨테이너 */
    container?: string;
    /** 테이블 요소 */
    table?: string;
    /** 테이블 헤더 (thead) */
    thead?: string;
    /** 헤더 행 (tr) */
    headerRow?: string;
    /** 테이블 바디 (tbody) */
    tbody?: string;
    /** 컨텐츠 래퍼 (비-팝업 모드) */
    contentWrapper?: string;
  };

  /**
   * 테이블 헤더 셀 스타일 (HeaderField)
   */
  headerCell?: {
    /** 헤더 셀 (th) */
    cell?: string;
    /** 정렬 가능 헤더 */
    sortable?: string;
    /** 정렬 중인 헤더 */
    sorted?: string;
    /** 정렬 아이콘 */
    sortIcon?: string;
    /** 필터 아이콘 */
    filterIcon?: string;
    /** 체크박스 헤더 셀 */
    checkboxCell?: string;
    /** 드래그 핸들 헤더 셀 */
    dragHandleCell?: string;
    /** 새창 열기 헤더 셀 */
    openNewWindowCell?: string;
    /** 선택 버튼 헤더 셀 */
    selectCell?: string;
  };

  /**
   * 테이블 행 스타일 (ViewRows)
   */
  row?: {
    /** 행 (tr) */
    row?: string;
    /** 호버 상태 */
    hover?: string;
    /** 선택된 행 */
    selected?: string;
    /** 짝수 행 */
    even?: string;
    /** 홀수 행 */
    odd?: string;
    /** 드래그 중인 행 */
    dragging?: string;
    /** 클릭 가능한 행 */
    clickable?: string;
  };

  /**
   * 테이블 셀 스타일 (ViewColumn)
   */
  cell?: {
    /** 셀 (td) */
    cell?: string;
    /** 체크박스 셀 */
    checkboxCell?: string;
    /** 번호 셀 */
    numberCell?: string;
    /** 드래그 핸들 셀 */
    dragHandleCell?: string;
    /** 새창 열기 셀 */
    openNewWindowCell?: string;
    /** 선택 버튼 셀 */
    selectCell?: string;
    /** 데이터 셀 */
    dataCell?: string;
  };

  /**
   * 체크박스 스타일 (EntireChecker)
   */
  checkbox?: {
    /** 체크박스 컨테이너 */
    container?: string;
    /** 체크박스 인풋 */
    input?: string;
    /** 전체 선택 체크박스 */
    selectAll?: string;
    /** 개별 체크박스 */
    item?: string;
    /** 선택된 상태 */
    checked?: string;
    /** 부분 선택 상태 */
    indeterminate?: string;
  };

  /**
   * 빈 상태 스타일
   */
  empty?: {
    /** 빈 상태 컨테이너 */
    container?: string;
    /** 빈 상태 메시지 */
    message?: string;
    /** 빈 상태 아이콘 */
    icon?: string;
  };

  /**
   * 페이지네이션 스타일
   */
  pagination?: {
    /** 페이지네이션 컨테이너 */
    container?: string;
    /** 페이지네이션 래퍼 */
    wrapper?: string;
  };

  /**
   * 알림 메시지 스타일
   */
  notifications?: {
    /** 알림 컨테이너 */
    container?: string;
    /** 에러 알림 */
    error?: string;
    /** 성공 알림 */
    success?: string;
    /** 경고 알림 */
    warning?: string;
    /** 정보 알림 */
    info?: string;
  };

  /**
   * 필드 선택기 스타일 (FieldSelector)
   */
  fieldSelector?: {
    /** 선택기 컨테이너 */
    container?: string;
    /** 드롭다운 패널 */
    dropdown?: string;
    /** 필드 아이템 */
    item?: string;
    /** 선택된 필드 */
    selectedItem?: string;
    /** 체크박스 */
    checkbox?: string;
  };

  /**
   * 필터 드롭다운 스타일 (FilterDropdown)
   */
  filterDropdown?: {
    /** 드롭다운 컨테이너 */
    container?: string;
    /** 드롭다운 패널 */
    panel?: string;
    /** 필터 인풋 */
    input?: string;
    /** 적용 버튼 */
    applyButton?: string;
    /** 초기화 버튼 */
    resetButton?: string;
  };

  /**
   * 모달 스타일 (SubCollectionViewModal 등)
   */
  modal?: {
    /** 모달 오버레이 */
    overlay?: string;
    /** 모달 컨테이너 */
    container?: string;
    /** 모달 헤더 */
    header?: string;
    /** 모달 바디 */
    body?: string;
    /** 모달 푸터 */
    footer?: string;
    /** 닫기 버튼 */
    closeButton?: string;
  };

  /**
   * 데이터 전송 모달 스타일 (DataTransferModal)
   */
  dataTransferModal?: {
    /** 모달 컨테이너 */
    container?: string;
    /** 옵션 그리드 */
    optionGrid?: string;
    /** 옵션 아이템 */
    optionItem?: string;
    /** 진행률 바 */
    progressBar?: string;
  };

  /**
   * 우선순위 조절 스타일 (PriorityButton, 드래그 핸들)
   */
  priority?: {
    /** 드래그 핸들 */
    dragHandle?: string;
    /** 드래그 핸들 아이콘 */
    dragHandleIcon?: string;
    /** 우선순위 버튼 */
    button?: string;
    /** 활성화 상태 */
    active?: string;
  };

  /**
   * 팝업 모드 스타일 (options.popup이 true일 때)
   */
  popup?: {
    /** 팝업 컨테이너 */
    container?: string;
    /** 스크롤 영역 */
    scrollArea?: string;
    /** 팝업 테이블 */
    table?: string;
  };
}

/**
 * ListGrid 테마 변형 타입
 */
export type ListGridThemeVariant = 'default' | 'main' | 'subCollection' | 'modal' | 'popup';

/**
 * ListGrid 테마 컨텍스트 값 타입
 */
export interface ListGridThemeContextValue {
  /** 클래스 이름 객체 */
  classNames: ViewListGridClassNames;
  /**
   * 기본 클래스와 커스텀 클래스를 병합
   * @param base 기본 Tailwind 클래스
   * @param custom 커스텀 클래스 (선택사항)
   * @returns 병합된 클래스 문자열
   */
  cn: (base: string, custom?: string) => string;
  /** 현재 적용된 변형 */
  variant: ListGridThemeVariant;
}
