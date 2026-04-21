'use client';

import { FormField, FormFieldProps } from './abstract';
import { FieldRenderParameters } from '../../config/EntityField';
import React, { useEffect, useState } from 'react';
import { InputRendererProps } from '../../config/Config';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { Modal } from '../../ui';
import { Paper } from '../../ui';
import { Button } from '../../ui';
import { TextInput } from '../../ui';
import { defaultString, isBlank } from '../../utils/StringUtil';
import { IconPhotoPlus, IconTrash } from '@tabler/icons-react';
import { MultipleAssetUpload } from './view/MultipleAssetUpload';
import { getAccessableAssetUrl } from '../../misc';
import { RegexLowerEnglishNumber } from '../../misc';
import { isTrue } from '../../utils/BooleanUtil';
import { ViewHelpText } from '../form/ui/ViewHelpText';
import { Tooltip } from '../../ui';

interface MultipleAssetFieldProps extends FormFieldProps {
  tags?: string[] | undefined;
  fileTypes?: string[] | undefined;
}

export class MultipleAssetField extends FormField<MultipleAssetField> {
  tags?: string[] | undefined;

  fileTypes?: string[] | undefined;

  constructor(name: string, order: number, tags?: string[], fileTypes?: string[]) {
    super(name, order, 'custom');
    this.tags = tags;
    this.fileTypes = fileTypes;
  }

  /**
   * MultipleAssetField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, params);
      return (
        <MultipleAssetFieldView
          fileTypes={this.fileTypes}
          tags={this.tags}
          {...(inputParams as React.ComponentProps<typeof MultipleAssetFieldView>)}
        ></MultipleAssetFieldView>
      );
    })();
  }

  /**
   * MultipleAssetField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): MultipleAssetField {
    return new MultipleAssetField(name, order, this.tags, this.fileTypes);
  }

  static create(props: MultipleAssetFieldProps): MultipleAssetField {
    return new MultipleAssetField(props.name, props.order, props.tags, props.fileTypes).copyFields(
      props,
      true,
    );
  }
}

export interface MultipleAssetForm {
  assets?: AssetItem[] | undefined;
  preferred?: string | undefined;
}

export interface AssetItem {
  name?: string | undefined;
  description?: string | undefined;
  url: string;
}

function deepCopy(value?: MultipleAssetForm): MultipleAssetForm {
  const newValue: MultipleAssetForm = {
    ...(value?.preferred !== undefined ? { preferred: value.preferred } : {}),
  };

  if (value?.assets !== undefined && value.assets.length > 0) {
    const newAssets: AssetItem[] = [];
    value.assets.forEach((asset) => {
      newAssets.push({ ...asset });
    });
    newValue.assets = newAssets;
  }

  return newValue;
}

interface MultipleAssetFieldViewProps extends InputRendererProps {
  tags?: string[] | undefined;
  fileTypes?: string[] | undefined;
}

const MultipleAssetFieldView = (props: MultipleAssetFieldViewProps) => {
  const [value, setValue] = useState<MultipleAssetForm>();
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number | undefined>();
  const [currentEdit, setCurrentEdit] = useState<AssetItem>({ url: '' });
  const [tags, setTags] = useState<string[]>(props.tags ?? []);

  useEffect(() => {
    if (props.value) {
      setValue(props.value);
      const tags = props.tags ?? [];
      if (props.value.assets) {
        props.value?.assets.forEach((asset: AssetItem) => {
          if (!tags.includes(asset.name ?? '')) {
            tags.push(asset.name ?? '');
          }
        });
      }
      setTags(tags);
    } else {
      // new value
      const newValue: MultipleAssetForm = { assets: [] };
      if (props.tags) {
        props.tags.forEach((tag) => {
          newValue.assets?.push({ name: tag, url: '' });
        });
        setValue(newValue);
        setTags(props.tags);
      }
    }
  }, [props.value]);

  function openImageForm(currentIndex?: number) {
    setError('');
    setCurrentIndex(currentIndex);
    setOpenAdd(true);

    if (currentIndex === undefined) {
      setCurrentEdit({ url: '' });
    } else {
      setCurrentEdit(value?.assets?.[currentIndex] ?? { url: '' });
    }
  }

  function closeUpload() {
    setCurrentEdit({ url: '' });
    setCurrentIndex(undefined);
    setOpenAdd(false);
  }

  const readonly = isTrue(props.readonly);

  return (
    <React.Fragment>
      <div className="rcm-asset-outer">
        <div className="rcm-asset-table-responsive">
          <div className="rcm-asset-grid">
            {tags.map((tag, index) => {
              const asset = value?.assets?.find((asset) => asset.name === tag);
              if (!asset) {
                return null;
              }

              const isPrimary = tag === 'Primary';

              return (
                <div key={`asset${index}`}>
                  <table className="rcm-asset-table">
                    <thead>
                      <tr>
                        <th key={`th-${index}`} className="rcm-asset-th">
                          <div className="rcm-asset-th-row">
                            {/* 첫번째 div 가 최대한 많은 공간을 사용하고 */}
                            <div
                              className={`rcm-asset-th-name${!isPrimary ? ' rcm-asset-th-name-compact' : ''}`}
                            >
                              <Tooltip label={`${asset.name}`}>
                                <div className="rcm-truncate">{asset.name}</div>
                              </Tooltip>
                            </div>
                            {/*두번째 div 는 딱 버튼 하나 들어갈 자리만 차지하면 좋겠어*/}
                            {!isPrimary && (
                              <div className="rcm-asset-th-remove">
                                {!readonly && (
                                  <button
                                    type={'button'}
                                    className="rcm-asset-th-remove-btn"
                                    onClick={() => {
                                      const newValues: MultipleAssetForm = { assets: [] };
                                      value!.assets?.forEach((asset, deleteIndex) => {
                                        if (index !== deleteIndex) {
                                          newValues.assets?.push(asset);
                                        }
                                      });

                                      if (props.tags?.includes(asset.name!)) {
                                        setTags(tags.filter((tag) => tag !== asset.name));
                                      }

                                      setValue(newValues);
                                      props.onChange(newValues, false);
                                    }}
                                  >
                                    <IconTrash className="rcm-icon" data-color="error" />
                                    {}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td key={`td-${index}`} className="rcm-asset-td">
                          <div
                            className="rcm-asset-td-inner"
                            onClick={() => {
                              openImageForm(index);
                            }}
                          >
                            <button className="rcm-asset-btn-fill">
                              {(function () {
                                if (isBlank(value?.assets?.[index]?.url)) {
                                  // 데이터 없음
                                  if (readonly) {
                                    return null;
                                  } else {
                                    return (
                                      <IconPhotoPlus className="rcm-icon rcm-asset-placeholder-icon" />
                                    );
                                  }
                                } else {
                                  const imgUrl = getAccessableAssetUrl(value!.assets![index]!.url);

                                  return (
                                    <img
                                      className="rcm-asset-img"
                                      alt={`${value?.assets?.[index]?.description ?? ''}`}
                                      onError={(event) => {
                                        event.currentTarget.src = '/assets/images/no-image.png';
                                      }}
                                      src={`${imgUrl}`}
                                    />
                                  );
                                }
                              })()}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
            {!readonly && (
              <div className="rcm-asset-add-col">
                <table className="rcm-asset-add-table">
                  <tbody>
                    <tr>
                      <td className="rcm-asset-add-td">
                        <button
                          type="button"
                          className="rcm-asset-add-btn"
                          onClick={() => {
                            openImageForm();
                          }}
                        >
                          + 추가
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {openAdd && (
        <Modal
          title={currentIndex === undefined ? '새 이미지 추가' : '이미지 수정'}
          size={'5xl'}
          position={'center'}
          opened={openAdd}
          onClose={() => {
            closeUpload();
          }}
        >
          <Paper className="rcm-asset-modal-body" key={`image-upload${currentIndex}`}>
            <div>
              <div className="rcm-asset-modal-label">
                <div>이미지 유형</div>
              </div>
              <TextInput
                placeHolder={'이미지 유형'}
                value={
                  currentIndex === undefined
                    ? ''
                    : defaultString(value?.assets?.[currentIndex]?.name)
                }
                readonly={
                  currentIndex !== undefined &&
                  tags.includes(defaultString(value?.assets?.[currentIndex ?? 0]?.name))
                }
                onChange={(value: string) => {
                  setError('');
                  if (isBlank(value)) {
                    setError('이미지의 이름을 영문/숫자로 입력하세요.');
                  } else {
                    if (tags.includes(value)) {
                      setError('중복된 이미지 이름이 존재합니다. 다른 이름을 입력해야 합니다.');
                    } else {
                      if (!RegexLowerEnglishNumber.test(value)) {
                        setError('영문 소문자/숫자만 입력할 수 있습니다');
                        return;
                      }

                      const currentItem: AssetItem = { ...currentEdit };
                      currentItem.name = value;
                      setCurrentEdit(currentItem);
                    }
                  }
                }}
                name={`item`}
              ></TextInput>
              {currentIndex === undefined && (
                <ViewHelpText
                  helpText={
                    'Front 에서 이 이미지를 식별하기 위한 Key입니다. 영문 소문자/숫자만 입력할 수 있습니다.'
                  }
                ></ViewHelpText>
              )}
            </div>
            <div>
              <div className="rcm-asset-modal-label">
                <div>Alt Tag</div>
              </div>
              <TextInput
                placeHolder={'Alt tag'}
                tooltip={{
                  label: '이미지가 표시될 때 &lt;img> 태그에 alt 속성값을 정의할 수 있습니다.',
                }}
                value={defaultString(value?.assets?.[currentIndex ?? 0]?.description)}
                onChange={(value: string) => {
                  const currentItem: AssetItem = { ...currentEdit };
                  currentItem.description = value;
                  setCurrentEdit(currentItem);
                }}
                name={`description`}
              ></TextInput>
            </div>
            <div>
              <div className="rcm-asset-modal-label">
                <div>Image</div>
              </div>
              <MultipleAssetUpload
                fileTypes={props.fileTypes}
                url={currentEdit.url}
                onChange={(url) => {
                  const currentItem: AssetItem = { ...currentEdit };
                  currentItem.url = url;
                  setCurrentEdit(currentItem);
                }}
              />
            </div>
            <div className="rcm-asset-modal-footer">
              {!isBlank(error) && <div className="rcm-asset-modal-error">{error}</div>}

              <Button
                style={{ marginLeft: 0.5 }}
                color={'info'}
                disabled={isBlank(currentEdit.name) || isBlank(currentEdit.url)}
                variant="filled"
                onClick={() => {
                  if (isBlank(currentEdit.name)) {
                    setError('이미지 유형의 이름을 입력해야 합니다.');
                  } else if (isBlank(currentEdit.url)) {
                    setError('이미지를 업로드해 주세요.');
                  } else {
                    const values: MultipleAssetForm = deepCopy(value);
                    if (currentIndex === undefined) {
                      values.assets?.push(currentEdit);
                      setTags([...tags, currentEdit.name!]);
                    } else {
                      values.assets![currentIndex] = currentEdit;
                    }
                    setValue(values);
                    setOpenAdd(false);
                    props.onChange(values, currentEdit.name === 'Primary');

                    closeUpload();
                  }
                }}
              >
                {currentIndex === undefined ? '이미지 등록' : '이미지 수정'}
              </Button>
            </div>
          </Paper>
        </Modal>
      )}
    </React.Fragment>
  );
};
