import { EntityForm } from '../config/EntityForm';
import { ReactNode } from 'react';
import { isEqualsIgnoreCase } from '../misc';
import { LabelType } from '../config/Config';
import { ModalOptions } from '../store';
import type { RouterApi } from '../router/types';

export interface EntityFormButtonStepInfo {
  useCreateStep: boolean;
  currentStep: number;
  maxStep: number;
  createStepFields: string[];
}

export interface EntityFormButtonProps {
  entityForm: EntityForm;
  router: RouterApi;
  pathname: string | null;
  setErrors: (errors: string[]) => void;
  setNotifications: (notifications: string[]) => void;
  step?: EntityFormButtonStepInfo;

  // 모달 관련 함수들
  showModal?: (options: ModalOptions) => string; // 모달 ID 반환
  closeModal?: (id: string) => Promise<void>;
  closeTopModal?: () => Promise<void>;
  // intentional: host apps define their own modal data shape (UIProvider wrapper)
  getModalData?: (id: string) => unknown;
  updateModalData?: (id: string, data: Partial<ModalOptions>) => void;
}

/**
 * ReactNode 버튼을 위한 래퍼 타입
 * ID를 가진 ReactNode로 중복 방지 가능
 */
export interface EntityFormReactNodeButton {
  id: string; // 버튼 식별자 (중복 방지용)
  button: ReactNode; // 실제 React 컴포넌트
}

/**
 * EntityForm에서 사용할 수 있는 버튼 타입
 */
export type EntityFormButtonType = EntityFormButton | EntityFormReactNodeButton;

export class EntityFormButton {
  readonly id: string; // id 가 save 이거나 delete 인 경우에는 기존의 entityForm 버튼을 대체한다.
  icon?: ReactNode | undefined;
  label?: LabelType | undefined;
  className?: string | undefined;
  onClick?: ((props: EntityFormButtonProps) => Promise<EntityForm>) | undefined;
  disabled?: ((props: EntityFormButtonProps) => Promise<boolean>) | undefined;
  hidden?: ((props: EntityFormButtonProps) => Promise<boolean>) | undefined;
  tooltip?: ((props: EntityFormButtonProps) => Promise<ReactNode>) | undefined;

  constructor(id: string) {
    this.id = id;
  }

  // 버튼 ID를 반환
  getId(): string {
    return this.id;
  }

  // id 가 save 이거나 delete 인 경우에는 기존의 entityForm 버튼을 대체한다.
  isOverwrite(id: string): boolean {
    return isEqualsIgnoreCase(this.id, id);
  }

  withIcon(icon?: ReactNode) {
    this.icon = icon;
    return this;
  }

  withLabel(label?: ReactNode) {
    this.label = label;
    return this;
  }

  withClassName(className?: string) {
    this.className = className;
    return this;
  }

  withOnClick(onClick?: (props: EntityFormButtonProps) => Promise<EntityForm>) {
    this.onClick = onClick;
    return this;
  }

  withDisabled(disabled?: (props: EntityFormButtonProps) => Promise<boolean>) {
    this.disabled = disabled;
    return this;
  }

  withHidden(hidden?: (props: EntityFormButtonProps) => Promise<boolean>) {
    this.hidden = hidden;
    return this;
  }

  withTooltip(tooltip?: (props: EntityFormButtonProps) => Promise<ReactNode>) {
    this.tooltip = tooltip;
    return this;
  }
}
