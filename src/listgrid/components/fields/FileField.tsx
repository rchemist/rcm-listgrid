import {
  ListableFormField,
  ListableFormFieldProps,
  ViewListProps,
  ViewListResult,
} from './abstract';
import React from 'react';
import { IAssetConfig, RenderType } from '../../config/Config';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { FileFieldValue } from '../../ui';
import { LazyFileUploadInput as FileUploadInput } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { isEmpty } from '../../utils';
import { getAccessableAssetUrl } from '../../misc';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { TextInput } from '../../ui';
import { isBlank as isBlankString } from '../../utils/StringUtil';

interface FileFieldProps extends ListableFormFieldProps {
  config?: IAssetConfig | undefined;
}

export class FileField extends ListableFormField<FileField> {
  config?: IAssetConfig | undefined;

  constructor(name: string, order: number, config?: IAssetConfig) {
    super(name, order, 'file');
    this.config = config;
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
   * FileField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <FileUploadInput
          config={this.config}
          {...await getInputRendererParameters(this, params)}
        ></FileUploadInput>
      );
    })();
  }

  /**
   * FileField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): FileField {
    return new FileField(name, order, this.config);
  }

  /**
   * FileField 리스트 필터 렌더링 (기본 텍스트 입력)
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
   * FileField 리스트 아이템 렌더링 (원본 renderListItem 로직 보존)
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return (async () => {
      const value = await props.item;

      if (value[this.name]) {
        const file = value[this.name] as FileFieldValue;

        if (!isEmpty(file.existFiles) && !isBlankString(file.existFiles[0]?.url)) {
          const fileDownloadUrl = getAccessableAssetUrl(file.existFiles[0]!.url);

          return {
            result: (
              <div className="rcm-file-field-cell">
                <div className="rcm-file-field-inner">
                  <a
                    href={fileDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rcm-file-field-link"
                  >
                    <IconDeviceFloppy className="rcm-file-field-icon" />
                    <span className="rcm-file-field-name">{file.existFiles[0]!.url}</span>
                  </a>
                </div>
              </div>
            ),
            linkOnCell: false,
          };
        }
      }

      return {
        result: null,
      };
    })();
  }

  static create(props: FileFieldProps): FileField {
    return new FileField(props.name, props.order, props.config).copyFields(props, true);
  }

  async isBlank(renderType: RenderType = 'create'): Promise<boolean> {
    const value = await this.getCurrentValue(renderType);

    if (value !== undefined && value !== null && value instanceof FileFieldValue) {
      let blank = true;

      for (const file of value.existFiles) {
        if (!isBlankString(file.url)) {
          blank = false;
          break;
        }
      }

      if (blank) {
        for (const file of value.newFiles) {
          if (!isBlankString(file.url)) {
            blank = false;
            break;
          }
        }
      }

      return blank;
    }

    return true;
  }

  isDirty(): boolean {
    if (this.value) {
      if (this.value.fetched !== undefined) {
        // fetch 된 값이 존재할 때는 fetched 된 값과 비교한다.
        let dirty = this.value.current === undefined || this.value.current === null;

        if (!dirty) {
          const fileValue = FileFieldValue.create(this.value.current);
          return fileValue.isDirty();
        }

        return dirty;
      } else {
        // fetch 된 값이 없을 때는 default 값과 비교한다.
        let dirty = this.value.default === undefined || this.value.default === null;

        if (!dirty) {
          const fileValue = FileFieldValue.create(this.value.default);
          return fileValue.isDirty();
        } else {
          const value = this.value.current;

          // 현재 값에 아무 파일이 없을 때
          if (this.value.current === undefined || this.value.current === null) {
            return false;
          }

          if (value !== undefined && value !== null && value instanceof FileFieldValue) {
            return value.isDirty();
          }
        }

        return dirty;
      }
    }
    return false;
  }
}
