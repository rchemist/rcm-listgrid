import { EntityForm } from '../../../config/EntityForm';
import { EntityFormManageable } from './ViewEntityForm.types';
import { EntityButtonLinkProps } from '../../../config/Config';
import { Session } from '../../../auth/types';
import { EntityFormButton } from '../../../config/EntityFormButton';
import { ModalOptions } from '../../../store';
import { RouterApi } from '../../../router';
import { ViewEntityFormClassNames } from './ViewEntityFormTheme.types';

export interface ButtonProps extends AbstractButtonProps {}

export interface AbstractButtonProps extends EntityFormManageable {
  postSave?: (entityForm: EntityForm) => Promise<EntityForm | void>;
  postDelete?: (entityForm: EntityForm) => Promise<EntityForm | void>;
  pathname: string;
  router: RouterApi;
  buttonLinks?: EntityButtonLinkProps;
  setErrors: (errors: string[]) => void;
  setNotifications: (notifications: string[]) => void;
  subCollection?: boolean;
  onRefresh?: () => void;
  openBaseLoading?: (open: boolean) => void;
  session?: Session;
  readonly?: boolean;
  /**
   * 새창(팝업) 모드 여부
   * - true일 때 목록 버튼 대신 닫기 버튼 표시
   * - 삭제 후 창 닫기 및 원본 창 새로고침 처리
   */
  popupMode?: boolean;
  /** 버튼 커스텀 클래스 (테마 시스템에서 전달) */
  buttonClassNames?: ViewEntityFormClassNames['buttons'];
}

export interface ViewEntityFormButtonsProps extends AbstractButtonProps {
  buttons?: EntityFormButton[];
  excludeButtons?: string[];
  readonly: boolean;
  useCreateStep?: boolean;
  currentStep?: number;
  maxStep?: number;
  createStepFields?: string[];

  // 모달 관련 함수들
  showModal?: (options: ModalOptions) => string;
  closeModal?: (id: string) => Promise<void>;
  closeTopModal?: () => Promise<void>;
  /** returns host-supplied data attached to the modal via ModalOptions.data */
  getModalData?: (id: string) => unknown;
  updateModalData?: (id: string, data: Partial<ModalOptions>) => void;

  // 테마 관련
  /** 버튼 커스텀 클래스 (테마 시스템에서 전달) */
  buttonClassNames?: ViewEntityFormClassNames['buttons'];
}
