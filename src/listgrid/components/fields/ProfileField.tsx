import React, { ReactNode } from 'react';
import { FieldRenderParameters } from '../../config/EntityField';
import { FormField } from './abstract';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { UserView } from '../../ui';

export class ProfileField extends FormField<ProfileField> {
  constructor(name: string, order: number) {
    super(name, order, 'custom');
    this.hideLabel = true;
    this.readonly = true;
  }

  /**
   * ProfileField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<ReactNode | null | undefined> {
    return (async () => {
      return <UserView {...await getInputRendererParameters(this, params)}></UserView>;
    })();
  }

  /**
   * ProfileField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): ProfileField {
    return new ProfileField(name, order);
  }
}
