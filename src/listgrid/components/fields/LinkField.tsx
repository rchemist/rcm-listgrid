import React from 'react';
import {
  CheckButtonValidationField,
  CheckButtonValidationFieldProps,
  ViewListProps,
  ViewListResult,
} from './abstract';
import { TextInput } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { LinkFieldView } from './view/LinkFieldView';
import { IconExternalLink } from '@tabler/icons-react';
import { isBlank } from '../../utils/StringUtil';
import { normalizeUrl } from '../../misc';

interface LinkFieldProps extends CheckButtonValidationFieldProps {}

export class LinkField extends CheckButtonValidationField<LinkField> {
  constructor(name: string, order: number) {
    super(name, order, 'text');
  }

  /**
   * LinkField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    if (this.checkButtonValidation !== undefined) {
      return super.renderCheckButtonValidationField(params);
    }

    return (async () => {
      const inputParams = await getInputRendererParameters(this, params);
      return (
        <LinkFieldView
          {...(inputParams as React.ComponentProps<typeof LinkFieldView>)}
        ></LinkFieldView>
      );
    })();
  }

  /**
   * LinkField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): LinkField {
    return new LinkField(name, order);
  }

  /**
   * LinkField 리스트 필터 렌더링 (원본 renderListFilter 로직 보존)
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <TextInput
          name={`${this.name}_${params.entityForm.id}`}
          onChange={(value: string) => {
            params.onChange(value, 'LIKE');
          }}
          value={params.value}
        ></TextInput>
      );
    })();
  }

  /**
   * LinkField 리스트 아이템 렌더링 (원본 renderListItem 로직 보존)
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    const value = String(props.item[this.name] ?? '');

    if (isBlank(value)) {
      return Promise.resolve({ result: value });
    }

    // 링크가 존재하는 경우 클릭 가능한 링크로 렌더링
    const linkElement = (
      <div className="rcm-link-cell">
        <span className="rcm-truncate">{value}</span>
        {!isBlank(value) && (
          <button
            type="button"
            className="rcm-link-cell-btn"
            onClick={(e) => {
              e.stopPropagation();
              window.open(normalizeUrl(value), '_blank');
            }}
          >
            <IconExternalLink className="rcm-link-cell-icon" />
          </button>
        )}
      </div>
    );

    return Promise.resolve({
      result: linkElement,
    });
  }

  static create(props: LinkFieldProps): LinkField {
    return new LinkField(props.name, props.order).copyFields(props, true);
  }
}
