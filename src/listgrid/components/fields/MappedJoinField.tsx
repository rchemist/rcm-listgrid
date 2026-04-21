import { FormField, FormFieldProps } from './abstract';
import { FieldInfoParameters, FieldRenderParameters } from '../../config/EntityField';
import React from 'react';

// ManyToOne 관계이지만 단순 Join key 만 관리되는 필드인 경우 이 필드를 사용한다.
// 보통 SubCollection 에서처럼 key 값 관리만 하는 경우에 사용된다.
export class MappedJoinField extends FormField<MappedJoinField> {
  constructor(name: string) {
    super(name, 10, 'hidden');
  }

  /**
   * MappedJoinField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <input
          type={'hidden'}
          name={`${this.getName()}`}
          value={await this.getCurrentValue(params.entityForm.getRenderType())}
        />
      );
    })();
  }

  /**
   * MappedJoinField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): MappedJoinField {
    return new MappedJoinField(name);
  }

  static create(props: FormFieldProps): MappedJoinField {
    return new MappedJoinField(props.name).copyFields(props, true);
  }

  async isHidden(props: FieldInfoParameters): Promise<boolean> {
    return Promise.resolve(true);
  }
}
