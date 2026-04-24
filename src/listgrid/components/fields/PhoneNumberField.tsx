'use client';

import {
  ListableFormField,
  ListableFormFieldProps,
  ViewListProps,
  ViewListResult,
} from './abstract';
import React from 'react';
import { Validation } from '../../validations/Validation';
import { PhoneNumberValidation } from '../../validations/PhoneNumberValidation';
import { RegexValidation } from '../../validations/RegexValidation';
import { FieldRenderParameters } from '../../config/EntityField';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { formatPhoneNumber, removePhoneNumberHyphens } from '../../utils/PhoneUtil';
import { RenderType } from '../../config/Config';
import { EntityForm } from '../../config/EntityForm';
import { PhoneNumberFieldView } from './view/PhoneNumberFieldView';
import { PhoneNumberListView } from './view/PhoneNumberListView';
import { getPermission } from '../../config/RuntimeConfig';
import type { Session } from '../../auth/types';

interface PhoneNumberFieldProps extends ListableFormFieldProps {
  enableSms?: boolean; // Enable SMS functionality (default: false)
}

export class PhoneNumberField extends ListableFormField<PhoneNumberField> {
  enableSms?: boolean;
  private smsPermissionOverride?: (session?: Session) => boolean;

  constructor(name: string, order: number, validations?: Validation[], enableSms?: boolean) {
    super(name, order, 'phone');
    this.validations = validations ? [...validations] : [new PhoneNumberValidation()];
    this.helpText = '숫자만 10 ~ 11 자리 사이로 입력해 주세요';
    this.enableSms = enableSms ?? false;
  }

  /**
   * Enable SMS functionality
   */
  withSms(enabled: boolean = true): this {
    this.enableSms = enabled;
    return this;
  }

  /**
   * Override the SMS send permission predicate for this field instance.
   * If not set, RuntimeConfig.permissions.canSendSms is used (library default: always true).
   */
  withSmsPermission(predicate: (session?: Session) => boolean): this {
    this.smsPermissionOverride = predicate;
    return this;
  }

  private resolveCanSendSms(session?: Session): boolean {
    const fn = this.smsPermissionOverride ?? getPermission('canSendSms');
    return fn(session);
  }

  /**
   * PhoneNumberField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, params);

      // validations에서 RegexValidation 찾기
      let regex: { pattern: RegExp; message: string } | undefined;
      if (this.validations) {
        const regexValidation = this.validations.find((v) => v instanceof RegexValidation) as
          | RegexValidation
          | undefined;
        if (regexValidation) {
          regex = {
            pattern: regexValidation.regex,
            message: regexValidation.message || '전화번호 형식이 올바르지 않습니다.',
          };
        }
      }

      return (
        <PhoneNumberFieldView
          name={inputParams.name}
          value={inputParams.value}
          onChange={inputParams.onChange}
          onError={inputParams.onError}
          readonly={inputParams.readonly}
          placeHolder={inputParams.placeHolder}
          regex={regex}
          enableSms={this.enableSms}
          session={params.entityForm.session}
          renderType={params.entityForm.getRenderType()}
          canSendSmsByPermission={this.resolveCanSendSms(params.entityForm.session)}
        />
      );
    })();
  }

  /**
   * PhoneNumberField 표시값 가져오기 (하이픈 포맷팅)
   */
  async getDisplayValue(entityForm: EntityForm, renderType?: RenderType): Promise<any> {
    if (this.displayFunc) {
      return this.displayFunc(entityForm, this, renderType);
    }

    const value = await this.getCurrentValue(renderType);

    // 하이픈 포맷팅 적용
    return formatPhoneNumber(value);
  }

  /**
   * PhoneNumberField 저장값 가져오기 (하이픈 제거)
   */
  async getSaveValue(entityForm: EntityForm, renderType?: RenderType): Promise<any> {
    if (this.saveValue) {
      return this.saveValue(entityForm, this, renderType);
    }

    const value = await this.getCurrentValue(renderType);

    // 하이픈 제거한 숫자만 반환
    return removePhoneNumberHyphens(value);
  }

  /**
   * PhoneNumberField 리스트 아이템 렌더링 (하이픈 포맷팅 + SMS 기능)
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    const value = props.item[this.name];
    const formatted = formatPhoneNumber(value);

    // If SMS is enabled and we have a value, use PhoneNumberListView
    if (this.enableSms && value) {
      return Promise.resolve({
        result: (
          <PhoneNumberListView
            phoneNumber={value}
            formattedValue={formatted}
            enableSms={this.enableSms}
            session={props.entityForm.session}
            canSendSmsByPermission={this.resolveCanSendSms(props.entityForm.session)}
          />
        ),
        linkOnCell: true, // Prevent row click from triggering when clicking the dropdown
      });
    }

    return Promise.resolve({ result: formatted });
  }

  /**
   * PhoneNumberField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): PhoneNumberField {
    const cloned = new PhoneNumberField(name, order, this.validations, this.enableSms);
    if (this.smsPermissionOverride) {
      cloned.smsPermissionOverride = this.smsPermissionOverride;
    }
    return cloned;
  }

  static create(props: PhoneNumberFieldProps): PhoneNumberField {
    const field = new PhoneNumberField(props.name, props.order, props.validations, props.enableSms);
    return field.copyFields(props, true);
  }
}
