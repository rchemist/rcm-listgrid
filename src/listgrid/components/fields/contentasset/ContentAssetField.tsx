import { FormField, FormFieldProps } from '../abstract';
import React from 'react';
import { FieldRenderParameters } from '../../../config/EntityField';
import { getInputRendererParameters } from '../../helper/FieldRendererHelper';
import { ContentAssetItem } from './ContentAssetItem';
import { ContentAsset } from './types';

interface ContentAssetFieldProps extends FormFieldProps {
  /** 최대 업로드 가능한 항목 수 */
  maxItems?: number;

  /** 허용된 파일 타입 (예: ['image/*', 'application/pdf']) */
  acceptedFileTypes?: string[];

  /** 최대 파일 크기 (bytes) */
  maxFileSize?: number;
}

/**
 * ContentAssetField
 * 범용적인 파일 업로드 및 관리를 위한 ListGrid 커스텀 필드
 *
 * @extends FormField
 */
export class ContentAssetField extends FormField<ContentAssetField> {
  /** 최대 업로드 가능한 항목 수 */
  maxItems?: number;

  /** 허용된 파일 타입 */
  acceptedFileTypes?: string[];

  /** 최대 파일 크기 (bytes) */
  maxFileSize?: number;

  constructor(name: string, order: number) {
    super(name, order, 'contentAsset');
  }

  /**
   * ContentAssetField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, params);
      return (
        <ContentAssetItem
          {...(inputParams as React.ComponentProps<typeof ContentAssetItem>)}
          entityForm={params.entityForm}
          {...(params.session !== undefined ? { session: params.session } : {})}
          {...(this.maxItems !== undefined ? { maxItems: this.maxItems } : {})}
          {...(this.acceptedFileTypes !== undefined
            ? { acceptedFileTypes: this.acceptedFileTypes }
            : {})}
          {...(this.maxFileSize !== undefined ? { maxFileSize: this.maxFileSize } : {})}
        />
      );
    })();
  }

  /**
   * ContentAssetField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): ContentAssetField {
    return new ContentAssetField(name, order);
  }

  /**
   * 기본값 설정
   * @param value ContentAsset 배열
   */
  withDefaultValue(value: ContentAsset[]): this {
    return super.withDefaultValue(value);
  }

  /**
   * 최대 항목 수 설정
   * @param maxItems 최대 항목 수
   */
  withMaxItems(maxItems: number): this {
    this.maxItems = maxItems;
    return this;
  }

  /**
   * 허용된 파일 타입 설정
   * @param acceptedFileTypes 파일 타입 배열
   */
  withAcceptedFileTypes(acceptedFileTypes: string[]): this {
    this.acceptedFileTypes = acceptedFileTypes;
    return this;
  }

  /**
   * 최대 파일 크기 설정
   * @param maxFileSize 최대 파일 크기 (bytes)
   */
  withMaxFileSize(maxFileSize: number): this {
    this.maxFileSize = maxFileSize;
    return this;
  }

  /**
   * ContentAssetField 인스턴스 생성 헬퍼
   * @param props ContentAssetFieldProps
   */
  static create(props: ContentAssetFieldProps): ContentAssetField {
    const field = new ContentAssetField(props.name, props.order).copyFields(props, true);

    if (props.maxItems !== undefined) {
      field.withMaxItems(props.maxItems);
    }

    if (props.acceptedFileTypes) {
      field.withAcceptedFileTypes(props.acceptedFileTypes);
    }

    if (props.maxFileSize !== undefined) {
      field.withMaxFileSize(props.maxFileSize);
    }

    return field;
  }
}
