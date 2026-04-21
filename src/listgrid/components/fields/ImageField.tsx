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
import { getAccessableAssetUrl } from '../../misc';
import { TextInput } from '../../ui';

interface ImageFieldProps extends ListableFormFieldProps {
  config?: IAssetConfig | undefined;
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
                      event.currentTarget.src = '/assets/images/no-image.png';
                    }}
                    alt="primary image"
                  />
                  <div className="rcm-image-field-preview-wrap">
                    <img
                      className="rcm-image-field-preview"
                      src={`${imgUrl}`}
                      onError={(event) => {
                        event.currentTarget.src = '/assets/images/no-image.png';
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
              src={`/assets/images/no-image.png`}
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
