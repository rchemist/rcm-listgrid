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

interface ImageFieldProps extends ListableFormFieldProps {
  config?: IAssetConfig | undefined;
}

/**
 * 다양한 형태의 필드 값(`FileFieldValue` 인스턴스 / POJO / 문자열)에서
 * 외부 절대 URL(`http(s)://`) 을 추출한다. 외부 URL 이 아니면 `undefined`.
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

export class ImageField extends ListableFormField<ImageField> {
  config?: IAssetConfig | undefined;

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

      // 외부 URL 우회: 값이 `http(s)://` 절대 URL 이면 자체 asset 서버를 거치지 않고
      // 그대로 이미지로 표시한다. (첨부 정책상 교체는 "기존 삭제 후 신규 등록" 흐름이므로
      // 별도 교체 컨트롤 없이 표시만으로 충분.)
      const externalUrl = pickExternalUrl(
        await this.getCurrentValue(params.entityForm.getRenderType()),
      );
      if (externalUrl) {
        return (
          <div className="rcm-image-field-external">
            <img
              className="rcm-image-field-external-img"
              src={externalUrl}
              alt="external image"
              onError={(event) => {
                event.currentTarget.src = getEndpoint('noImageFallback');
              }}
            />
          </div>
        );
      }

      return (
        <FileUploadInput
          config={config}
          {...await getInputRendererParameters(this, params)}
        ></FileUploadInput>
      );
    })();
  }

  /**
   * ImageField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): ImageField {
    return new ImageField(name, order, this.config);
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
    return new ImageField(props.name, props.order, props.config).copyFields(props, true);
  }
}
