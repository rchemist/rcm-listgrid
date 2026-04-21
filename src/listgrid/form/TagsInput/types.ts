import { AdditionalColorType, ColorType, SizeType } from '../../common/type';

/**
 * 태그 아이템 인터페이스
 * 각 태그의 고유 ID와 값을 포함합니다.
 */
export interface TagItem {
  /** 태그의 고유 ID */
  id: string;
  /** 태그의 표시 값 */
  value: string;
  /** 태그의 색상 */
  color?: ColorType | AdditionalColorType;
}

/**
 * 태그 검증 결과 인터페이스
 */
export interface TagValidationResult {
  /** 검증 통과 여부 */
  valid: boolean;
  /** 검증 실패 시 오류 메시지 */
  message?: string;
}

/**
 * TagsInput 컴포넌트의 Props 인터페이스
 */
export interface TagsInputProps {
  /** 현재 선택된 태그들의 배열 */
  value?: string[];
  /** 태그 변경 시 호출되는 콜백 함수 */
  onChange?: (value: string[]) => void;
  /** 사용 가능한 태그 옵션들의 배열 */
  data?: string[];
  /** 태그 필터링 함수 */
  filter?: (options: string[], search: string) => string[];
  /** 최대 태그 개수 제한 */
  maxTags?: number;
  /** 최소 태그 개수 제한 */
  minTags?: number;
  /** 읽기 전용 모드 */
  readOnly?: boolean;
  /** 비활성화 모드 */
  disabled?: boolean;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 입력 필드 크기 */
  size?: SizeType;
  /** 지울 수 있는지 여부 */
  clearable?: boolean;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 추가 CSS 클래스명 */
  className?: string;
  /** 루트 요소의 CSS 클래스명 */
  classNames?: {
    root?: string;
    input?: string;
    wrapper?: string;
    tag?: string;
    tagLabel?: string;
    tagRemove?: string;
    dropdown?: string;
    dropdownItem?: string;
    error?: string;
  };
  /** 태그 색상 함수 */
  getTagColor?: (tagValue: string) => ColorType | AdditionalColorType;
  /**
   * 태그 추가 시 실시간 검증 콜백
   * @param value - 추가하려는 태그 값
   * @returns 검증 결과 (valid: true면 추가, false면 거부 및 오류 메시지 표시)
   */
  onValidateTag?: (value: string) => TagValidationResult | Promise<TagValidationResult>;
}

/**
 * TagsInput Context 타입
 * 하위 컴포넌트들이 공유하는 상태와 함수들을 정의합니다.
 */
export interface TagsInputContextType {
  /** 현재 입력 중인 텍스트 */
  inputValue: string;
  /** 입력 텍스트 설정 함수 */
  setInputValue: (value: string) => void;
  /** 드롭다운 표시 여부 */
  isDropdownOpen: boolean;
  /** 드롭다운 표시/숨김 함수 */
  setIsDropdownOpen: (open: boolean) => void;
  /** 현재 선택된 드롭다운 아이템 인덱스 */
  selectedIndex: number;
  /** 선택된 드롭다운 아이템 인덱스 설정 함수 */
  setSelectedIndex: (index: number) => void;
  /** 필터링된 옵션들 */
  filteredOptions: string[];
  /** 태그 추가 함수 */
  addTag: (tag: string) => void;
  /** 태그 제거 함수 */
  removeTag: (tagId: string) => void;
  /** 입력 필드 포커스 함수 */
  focusInput: () => void;
}

/**
 * Tag 컴포넌트의 Props 인터페이스
 */
export interface TagProps {
  /** 태그 아이템 */
  tag: TagItem;
  /** 태그 크기 */
  size: SizeType;
  /** 읽기 전용 모드 */
  readOnly?: boolean;
  /** 비활성화 모드 */
  disabled?: boolean;
  /** 추가 CSS 클래스명 */
  className?: string;
  /** 태그 라벨 CSS 클래스명 */
  tagLabelClassName?: string;
  /** 태그 제거 버튼 CSS 클래스명 */
  tagRemoveClassName?: string;
}

/**
 * TagsInputDropdown 컴포넌트의 Props 인터페이스
 */
export interface TagsInputDropdownProps {
  /** 드롭다운에 표시할 옵션들 */
  options: string[];
  /** 현재 선택된 아이템 인덱스 */
  selectedIndex: number;
  /** 아이템 클릭 시 호출되는 콜백 함수 */
  onItemClick: (option: string) => void;
  /** 추가 CSS 클래스명 */
  className?: string;
  /** 드롭다운 아이템 CSS 클래스명 */
  dropdownItemClassName?: string;
}
