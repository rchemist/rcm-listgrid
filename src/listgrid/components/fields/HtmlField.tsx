import { FormField, FormFieldProps, ViewRenderProps, ViewRenderResult } from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import React from 'react';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { MarkdownEditor } from '../../ui';
import { isEquals } from '../../misc';
import { isBlank } from '../../utils/StringUtil';

interface HtmlFieldProps extends FormFieldProps {}

export class HtmlField extends FormField<HtmlField> {
  constructor(name: string, order: number) {
    super(name, order, 'markdown');
  }

  /**
   * HtmlField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return <MarkdownEditor {...await getInputRendererParameters(this, params)}></MarkdownEditor>;
    })();
  }

  /**
   * View mode: render HTML content with dangerouslySetInnerHTML
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = props.item[this.name];
    if (value === null || value === undefined || value === '') {
      return { result: null };
    }
    return {
      result: <div dangerouslySetInnerHTML={{ __html: String(value) }} />,
    };
  }

  /**
   * HtmlField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): HtmlField {
    return new HtmlField(name, order);
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

  public static create(props: HtmlFieldProps): HtmlField {
    return new HtmlField(props.name, props.order).copyFields(props);
  }
}
