import { FormField, FormFieldProps } from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import React from 'react';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { MarkdownEditor } from '../../ui';
import { isEquals } from '../../misc';
import { isBlank } from '../../utils/StringUtil';

interface MarkdownFieldProps extends FormFieldProps {}

export class MarkdownField extends FormField<MarkdownField> {
  constructor(name: string, order: number) {
    super(name, order, 'markdown');
  }

  /**
   * MarkdownField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return <MarkdownEditor {...await getInputRendererParameters(this, params)}></MarkdownEditor>;
    })();
  }

  /**
   * MarkdownField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): MarkdownField {
    return new MarkdownField(name, order);
  }

  private isEqualsOrEmpty(value?: string): boolean {
    if (isBlank(value)) return true;
    return value === '<p><br></p>' || value === '<p></p>';
  }

  isDirty(): boolean {
    if (this.value) {
      const isNullDefaultValue = this.isEqualsOrEmpty(this.value.default);
      const isNullFetchedValue = this.isEqualsOrEmpty(this.value.fetched);
      const isNullCurrentValue = this.isEqualsOrEmpty(this.value.current);

      if (isNullDefaultValue && isNullFetchedValue && isNullCurrentValue) {
        return false;
      }

      if (this.value.fetched !== undefined) {
        // fetch 된 값이 존재할 때는 fetched 된 값과 비교한다.
        if (isNullFetchedValue && isNullCurrentValue) {
          return false;
        }

        return !isEquals(this.value.fetched, this.value.current);
      } else {
        // fetch 된 값이 없을 때는 default 값과 비교한다.
        if (isNullDefaultValue && isNullCurrentValue) {
          return false;
        }

        return !isEquals(this.value.default, this.value.current);
      }
    }
    return false;
  }

  public static create(props: MarkdownFieldProps): MarkdownField {
    return new MarkdownField(props.name, props.order).copyFields(props);
  }
}
