import { ModalOptions } from '../store';
import { ReactNode } from 'react';
import { CommonFieldProps } from '../components/fields/Preset';
import { IDataTransferConfig } from '../transfer/Type';
import {
  FieldGroupInfo,
  HelpTextType,
  HiddenType,
  ReadOnlyType,
  RequiredType,
  TabInfo,
} from './Config';
import { EntityForm } from './EntityForm';
import { EntityItem } from './EntityItem';
import { ColorType } from '../common/type';

export type CopyEntityFormExplicitFieldType = string | CopyEntityFormOverrideFieldProps;

export interface CopyEntityFormToInnerFieldsProps {
  prefix: string;
  entityForm: EntityForm;
  tab?: TabInfo;
  fieldGroup?: FieldGroupInfo;
  excludeFields?: string[];
  explicitFields?: CopyEntityFormExplicitFieldType[];
}

export interface CopyEntityFormOverrideFieldProps extends CommonFieldProps {
  tab?: TabInfo;
  fieldGroup?: FieldGroupInfo;
  helpText?: HelpTextType;
  hidden?: HiddenType;
  readonly?: ReadOnlyType;
  required?: RequiredType;
}

export interface AddFieldItemProps extends AbstractAddFieldProps {
  items: EntityItem[];
  overwrite?: boolean; // 기존 필드를 덮어쓸지 여부 (기본값: false)
}

export interface AbstractAddFieldProps {
  tab?: TabInfo;
  fieldGroup?: FieldGroupInfo;
}

export interface SubmitFormData {
  // intentional: generic entity payload — callers know their own entity shape
  data: any;
  modifiedFields: string[];
  errors: FieldError[];
  error: boolean;
}

export interface FieldError {
  name: string;
  label: string | ReactNode | false;
  errors: string[];
  tabId?: string | undefined;
  errorId?: string | undefined;
}

export interface AlertMessageLink {
  // 링크 타입이 tab 인 경우, value 는 탭 id 이다.
  // 링크 타입이 field 인 경우, value 는 필드의 name 값이다.
  // 링크 타입이 external 인 경우, value 는 외부 링크 url 이다.
  // link 값이 존재하는 경우 tab 이면 AlertMessage 를 클릭했을 때 해당 탭으로 전환
  // field 이면 AlertMessage 를 클릭했을 때 해당 필드의 탭으로 전환하고 필드까지 스크롤한다.
  // external 이면 AlertMessage 를 클릭했을 때 외부 링크로 이동한다.
  // modal 이면 AlertMessage 를 클릭했을 때 모달 컴포넌트를 표시한다.
  type?: 'tab' | 'field' | 'external' | 'modal'; // 기본값은 tab 이다.
  value: string | ModalOptions; // 탭 id 또는 필드의 name 값 또는 외부 링크 url 또는 모달 컴포넌트
  target?: '_self' | '_blank' | '_parent' | '_top'; // 기본값은 _blank 이다. 외부 링크인 경우에만 이 값을 사용한다.
}

export interface AlertMessage {
  key: string;
  message: string | ReactNode;
  description?: ReactNode;
  color: ColorType;
  persistent?: boolean;
  link?: AlertMessageLink;
}

export interface DataTransferConfigProps extends IDataTransferConfig {
  fieldNames?: string[] | undefined;
}
