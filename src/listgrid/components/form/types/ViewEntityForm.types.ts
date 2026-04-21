/*
 *  ViewEntityForm 타입/인터페이스 정의 파일
 *  모든 타입에는 JSDoc(영문) + 한글 설명을 추가합니다.
 */
import { EntityForm } from '../../../config/EntityForm';
import { EntityFormButton } from '../../../config/EntityFormButton';
import { EntityButtonLinkProps } from '../../../config/Config';
import { Session } from '../../../auth/types';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { ApiSpecification } from '../../api/Type';

/**
 * Props for ViewEntityForm component.
 * ViewEntityForm 컴포넌트에 전달되는 모든 속성 정의
 */
export interface ViewEntityFormProps {
  /**
   * EntityForm instance to be managed and rendered.
   * 관리 및 렌더링할 EntityForm 인스턴스
   */
  entityForm: EntityForm;
  /**
   * Custom buttons to be added to the form.
   * 폼에 추가할 커스텀 버튼 배열
   */
  buttons?: EntityFormButton[];
  /**
   * Types of buttons to exclude (e.g., 'save', 'list', 'delete').
   * 제외할 버튼 타입 (예: 'save', 'list', 'delete')
   */
  excludeButtons?: string[];
  /**
   * Custom title for the form.
   * 폼의 커스텀 제목
   */
  title?: string;
  /**
   * Whether to hide the title area.
   * 제목 영역 숨김 여부
   */
  hideTitle?: boolean;
  /**
   * Callback after saving the entity form.
   * 저장 후 호출되는 콜백 (비동기)
   */
  postSave?: (entityForm: EntityForm) => Promise<EntityForm>;
  /**
   * Callback after deleting the entity form.
   * 삭제 후 호출되는 콜백 (비동기)
   */
  postDelete?: (entityForm: EntityForm) => Promise<void>;
  /**
   * Button link handlers for navigation.
   * 버튼 클릭 시 라우팅 등 링크 핸들러
   */
  buttonLinks?: EntityButtonLinkProps;
  /**
   * Whether this is a sub-collection entity form (e.g., modal).
   * 서브 콜렉션(모달 등) 여부
   */
  subCollection?: boolean;
  /**
   * Readonly mode flag.
   * 읽기 전용 모드 여부
   */
  readonly?: boolean;
  /**
   * API specification or custom ReactNode for API docs.
   * API 명세 또는 커스텀 ReactNode
   */
  apiSpec?: ApiSpecification | ReactNode;
  /**
   * Session info (optional, overrides default session).
   * 세션 정보 (선택, 기본 세션을 덮어씀)
   */
  session?: Session;
  /**
   * Callback after initializing the entity form.
   * EntityForm 초기화 후 호출되는 콜백 (비동기)
   */
  onInitialize?: (entityForm: EntityForm) => Promise<EntityForm>;
  /**
   * Callback after the component is fully rendered and loaded.
   * 컴포넌트가 완전히 렌더링되고 로드된 후 호출되는 콜백 (비동기)
   */
  onLoad?: (entityForm: EntityForm) => Promise<void>;
  /**
   * Popup mode flag for new window display.
   * 새창(팝업) 모드 여부 - true일 때 목록 버튼 대신 닫기 버튼 표시
   */
  popupMode?: boolean;
  /**
   * Position of the action buttons.
   * 버튼 위치 설정
   * - 'header': 상단 헤더 영역 (기본값)
   * - 'bottom': 폼 하단 영역
   */
  buttonPosition?: 'header' | 'bottom';
  /**
   * Enable auto-save to sessionStorage.
   * sessionStorage 자동 저장 활성화 (새로고침 시 입력값 유지)
   * - true: 자동 저장 활성화
   * - false: 자동 저장 비활성화 (기본값)
   */
  autoSave?: boolean;
  /**
   * Custom key for auto-save storage.
   * 자동 저장 스토리지 키 (동일 엔티티 다른 컨텍스트 구분용)
   * - 미지정 시: entityName + id 조합으로 자동 생성
   * - 지정 시: entityName + id + autoSaveKey 조합
   */
  autoSaveKey?: string;
  /**
   * Inline mode flag for SubCollection inline expansion.
   * SubCollection 인라인 확장 모드 여부
   * - true: 패널 배경/테두리 없이 인라인으로 표시
   * - false: 일반 패널 스타일 적용 (기본값)
   */
  inlineMode?: boolean;
  /**
   * MappedBy field name to hide related fields in SubCollection.
   * SubCollection에서 부모 참조 필드 자동 숨김을 위한 mappedBy 필드명
   * - 예: 'studentId' 지정 시 'studentId', 'student', 'student.name' 등 자동 숨김
   * - 빈 문자열이나 undefined일 경우 모든 필드 표시
   */
  hideMappedByFields?: string;
  /**
   * Hide all buttons including custom buttons.
   * 모든 버튼 숨김 (커스텀 버튼 포함)
   * - true: 모든 버튼 숨김 (리비전 모드 등에서 사용)
   * - false: 버튼 정상 표시 (기본값)
   */
  hideAllButtons?: boolean;
}

/**
 * TabIndexable interface for tab navigation.
 * 탭 인덱스 및 setter를 위한 인터페이스
 */
export interface TabIndexable {
  /**
   * Current tab index.
   * 현재 탭 인덱스
   */
  tabIndex: string;
  /**
   * Setter for tab index (optional).
   * 탭 인덱스 setter (선택)
   */
  setTabIndex?: (tabIndex: string) => void;
}

/**
 * EntityFormManageable interface for entity form state management.
 * EntityForm 상태 관리용 인터페이스
 */
export interface EntityFormManageable {
  /**
   * EntityForm instance.
   * EntityForm 인스턴스
   */
  entityForm: EntityForm;
  /**
   * Setter for EntityForm state (optional).
   * EntityForm 상태 setter (선택)
   */
  setEntityForm?: Dispatch<SetStateAction<EntityForm | undefined>>;
}

export interface TabIndexable {
  tabIndex: string;
  setTabIndex?: (tabIndex: string) => void;
}

export interface EntityFormManageable {
  entityForm: EntityForm;
  setEntityForm?: React.Dispatch<React.SetStateAction<EntityForm | undefined>>;
}
