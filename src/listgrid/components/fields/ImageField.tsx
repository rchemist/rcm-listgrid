import {
  ListableFormField,
  ListableFormFieldProps,
  ViewListProps,
  ViewListResult,
} from './abstract';
import React from 'react';
import { IAssetConfig } from '../../config/Config';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { FileFieldValue } from '../../ui';
import { LazyFileUploadInput as FileUploadInput } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { isEmpty } from '../../utils';
import { getAccessableAssetUrl, isExternalUrl } from '../../misc';
import { TextInput } from '../../ui';
import { getEndpoint } from '../../config/RuntimeConfig';
import { ImageFieldFormPreview } from './view/ImageFieldFormPreview';

interface ImageFieldProps extends ListableFormFieldProps {
  config?: IAssetConfig | undefined;
  previewSize?: number | string | undefined;
}

/**
 * 다양한 형태의 필드 값(`FileFieldValue` 인스턴스 / POJO / 문자열)에서
 * 외부 절대 URL(`http(s)://`) 을 추출한다. 외부 URL 이 아니면 `undefined`.
 * 리스트 셀 (`renderListItemInstance`) 의 외부 URL 분기 판별에 사용된다.
 */
function pickExternalUrl(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') {
    return isExternalUrl(value) ? value.trim() : undefined;
  }
  if (typeof value === 'object') {
    const files: any[] = Array.isArray(value.existFiles) ? value.existFiles : [];
    for (const f of files) {
      if (f && typeof f.url === 'string' && isExternalUrl(f.url)) return f.url.trim();
    }
  }
  return undefined;
}

/**
 * 다양한 형태의 필드 값(`FileFieldValue` 인스턴스 / POJO / 문자열) 에서
 * 폼 미리보기에 표시할 이미지 URL 을 추출한다. 외부 절대 URL 은 그대로,
 * 그 외 자체 asset 경로는 `getAccessableAssetUrl` 로 정규화하여 반환한다.
 * 값이 비어있거나 첫 파일에 URL 이 없으면 `undefined`.
 */
function pickImageUrl(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return isExternalUrl(trimmed) ? trimmed : getAccessableAssetUrl(trimmed);
  }
  if (typeof value === 'object') {
    const files: any[] = Array.isArray(value.existFiles) ? value.existFiles : [];
    for (const f of files) {
      if (f && typeof f.url === 'string') {
        const url = f.url.trim();
        if (!url) continue;
        return isExternalUrl(url) ? url : getAccessableAssetUrl(url);
      }
    }
  }
  return undefined;
}

export class ImageField extends ListableFormField<ImageField> {
  config?: IAssetConfig | undefined;
  previewSize?: number | string | undefined;

  constructor(name: string, order: number, config?: IAssetConfig) {
    super(name, order, 'file');
    this.config = config;
    this.listConfig = {
      filterable: false,
      sortable: false,
    };
  }

  withConfig(config?: IAssetConfig): this {
    this.config = config;
    return this;
  }

  /**
   * 폼 뷰 미리보기 이미지의 한 변 크기 (가로 = 세로). `number` 는 px,
   * `string` 은 CSS 길이값 (`'6rem'`, `'120px'` 등) 으로 적용된다.
   * 미지정 시 라이브러리 기본값 (`.rcm-image-field-form-preview` 의 `8rem`)
   * 이 그대로 적용된다.
   */
  withPreviewSize(size: number | string): this {
    this.previewSize = size;
    return this;
  }

  withMaxSize(maxSize?: number): this {
    this.config = {
      maxSize: maxSize,
      maxCount: this.config?.maxCount,
      extensions: this.config?.extensions,
      fileTypes: this.config?.fileTypes,
    };
    return this;
  }

  withMaxCount(maxCount?: number): this {
    this.config = {
      maxSize: this.config?.maxSize,
      maxCount: maxCount,
      extensions: this.config?.extensions,
      fileTypes: this.config?.fileTypes,
    };
    return this;
  }

  withExtensions(...extension: string[]): this {
    this.config = {
      maxSize: this.config?.maxSize,
      maxCount: this.config?.maxCount,
      extensions: extension,
      fileTypes: this.config?.fileTypes,
    };
    return this;
  }

  withFileTypes(...fileTypes: string[]): this {
    this.config = {
      maxSize: this.config?.maxSize,
      maxCount: this.config?.maxCount,
      extensions: this.config?.extensions,
      fileTypes: fileTypes,
    };
    return this;
  }

  /**
   * ImageField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      let config = this.config;
      if (!config) {
        config = {
          maxCount: 1,
          extensions: ['png', 'jpeg', 'jpg', 'gif', 'webp', 'svg'],
          fileTypes: ['image/*'],
        };
      } else {
        if (!config.fileTypes) {
          config.fileTypes = ['image/*'];
        }
        if (!config.extensions) {
          config.extensions = ['png', 'jpeg', 'jpg', 'gif', 'webp', 'svg'];
        }
        if (!config.maxCount || config.maxCount < 1) {
          config.maxCount = 1;
        }
      }

      const imageUrl = pickImageUrl(await this.getCurrentValue(params.entityForm.getRenderType()));

      const uploadInput = (
        <FileUploadInput
          config={config}
          {...await getInputRendererParameters(this, params)}
        ></FileUploadInput>
      );

      // 이미지 값이 존재하면 폼에서 항상 썸네일 미리보기를 노출하고,
      // 클릭 시 모달로 확대 보기를 제공한다. 외부 절대 URL / 내부 asset URL
      // 모두 동일 경로로 처리되어 unsized `<img>` 가 거대하게 렌더되던
      // 문제를 차단한다 (`.rcm-image-field-form-preview` 의 기본 크기 적용).
      if (imageUrl) {
        return (
          <ImageFieldFormPreview
            imageUrl={imageUrl}
            previewSize={this.previewSize}
            fallbackUrl={getEndpoint('noImageFallback')}
          >
            {this.readonly ? null : uploadInput}
          </ImageFieldFormPreview>
        );
      }

      return uploadInput;
    })();
  }

  /**
   * ImageField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): ImageField {
    const cloned = new ImageField(name, order, this.config);
    cloned.previewSize = this.previewSize;
    return cloned;
  }

  /**
   * ImageField 리스트 필터 렌더링 (기본 텍스트 입력)
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <TextInput
          name={`${this.name}_${params.entityForm.id}`}
          onChange={(value: string) => params.onChange(value, 'LIKE')}
          value={params.value}
        />
      );
    })();
  }

  /**
   * ImageField 리스트 아이템 렌더링 (원본 renderListItem 로직 보존)
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return (async () => {
      const value = await props.item;

      if (value[this.name]) {
        // 값이 단순 외부 URL 문자열로 들어온 케이스 — 자체 asset 서버를 거치지 않고
        // 그대로 썸네일/확대 미리보기 렌더링.
        const externalUrl = pickExternalUrl(value[this.name]);
        if (externalUrl) {
          return {
            result: (
              <div className="rcm-image-field-cell">
                <div className="rcm-image-field-hover-group">
                  <img
                    className="rcm-image-field-thumb"
                    src={externalUrl}
                    onError={(event) => {
                      event.currentTarget.src = getEndpoint('noImageFallback');
                    }}
                    alt="primary image"
                  />
                  <div className="rcm-image-field-preview-wrap">
                    <img
                      className="rcm-image-field-preview"
                      src={externalUrl}
                      onError={(event) => {
                        event.currentTarget.src = getEndpoint('noImageFallback');
                      }}
                      alt="enlarged image"
                    />
                  </div>
                </div>
              </div>
            ),
          };
        }

        const file = value[this.name] as FileFieldValue;
        if (!isEmpty(file.existFiles)) {
          const imgUrl = getAccessableAssetUrl(file.existFiles[0]!.url);

          return {
            result: (
              <div className="rcm-image-field-cell">
                <div className="rcm-image-field-hover-group">
                  <img
                    className="rcm-image-field-thumb"
                    src={`${imgUrl}`}
                    onError={(event) => {
                      event.currentTarget.src = getEndpoint('noImageFallback');
                    }}
                    alt="primary image"
                  />
                  <div className="rcm-image-field-preview-wrap">
                    <img
                      className="rcm-image-field-preview"
                      src={`${imgUrl}`}
                      onError={(event) => {
                        event.currentTarget.src = getEndpoint('noImageFallback');
                      }}
                      alt="enlarged image"
                    />
                  </div>
                </div>
              </div>
            ),
          };
        }
      }

      return {
        result: (
          <div className="rcm-image-field-cell">
            <img
              className="rcm-image-field-thumb rcm-image-field-thumb-placeholder"
              src={getEndpoint('noImageFallback')}
              alt="no image"
            />
          </div>
        ),
      };
    })();
  }

  static create(props: ImageFieldProps): ImageField {
    const field = new ImageField(props.name, props.order, props.config).copyFields(props, true);
    if (props.previewSize !== undefined) field.previewSize = props.previewSize;
    return field;
  }
}
