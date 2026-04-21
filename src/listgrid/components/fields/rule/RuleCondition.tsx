'use client';

import { AbstractDateField, ListableFormField } from '../abstract';
import React, { useEffect, useState } from 'react';
import {
  getQueryConditionHelpText,
  getQueryConditionTypes,
  getQueryConditionValueType,
  QueryConditionType,
} from '../../../form/SearchForm';
import { SelectBox } from '../../../ui';
import { isBlank } from '../../../utils/StringUtil';
import { TagsInput } from '../../../ui';
import { IconCircleX } from '@tabler/icons-react';
import {
  getConfiguredFields,
  RuleConditionValue,
  RuleFieldEntityForm,
  RuleFieldValue,
} from './Type';
import { SelectOption } from '../../../form/Type';
import { isEmpty } from '../../../utils';
import { RuleFieldRenderer } from './RuleFieldRenderer';
import { ViewFieldError } from '../../form/ui/ViewFieldError';
import { ViewHelpText } from '../../form/ui/ViewHelpText';

interface RuleConditionProps {
  id: number;
  condition: 'AND' | 'OR';
  fieldValues: RuleFieldValue[];
  //fields: RuleFieldViewEntityForms[];
  targetEntityForm: RuleFieldEntityForm;
  clearError: () => void;
  clearCondition: () => void;
  addCondition: (value: RuleConditionValue) => void;
  fieldErrors: Map<number, string>;
  setFieldError: (error: Map<number, string>) => void;
}

export const RuleCondition = (props: RuleConditionProps) => {
  const { id, targetEntityForm, clearError, clearCondition } = props;

  const [fieldValues, setFieldValues] = useState<RuleFieldValue[]>(props.fieldValues);

  const [fieldErrors, setFieldErrors] = useState<Map<number, string>>();

  const [selected, setSelected] = useState<string>();

  useEffect(() => {
    setFieldErrors(props.fieldErrors);
  }, [props.fieldErrors]);

  function changeValue(index: number, value: any) {
    setFieldValues((prevFieldValues) => {
      const newFieldValues = [...prevFieldValues];
      newFieldValues[index]!.values = value;
      changeFilterValues(newFieldValues);
      return newFieldValues;
    });
  }
  /*
  function changeValue(index: number, value: any) {
    const newFieldValues = [...fieldValues];
    newFieldValues[index].values = value;
    changeFilterValues(newFieldValues);
  }*/

  function changeFilterValues(newFieldValues: RuleFieldValue[]) {
    clearError();
    setFieldValues(newFieldValues);
    const ruleCondition = new RuleConditionValue(
      id,
      props.condition,
      props.targetEntityForm.prefix,
    ).withValues(newFieldValues);
    props.addCondition(ruleCondition);
  }

  function changeQueryConditionType(index: number, type: QueryConditionType) {
    const newFieldValues = [...fieldValues];
    newFieldValues[index]!.queryConditionType = type;
    newFieldValues[index]!.values = [];
    changeFilterValues(newFieldValues);
  }

  function getMaxConditionId() {
    if (isEmpty(fieldValues)) {
      return 0;
    }

    let maxId = 0;

    for (const filter of fieldValues) {
      if (filter.id > maxId) {
        maxId = filter.id;
      }
    }
    return maxId + 1;
  }

  if (
    (targetEntityForm.fields === undefined || targetEntityForm.fields.length === 0) &&
    targetEntityForm.entityForm === undefined
  ) {
    // 아무 것도 할 수 있는게 없다.
    return <div>Rule 을 처리하려면 EntityForm 이나 대상 필드를 지정해야 합니다.</div>;
  }

  const fields = getConfiguredFields(targetEntityForm);

  const fieldOptions: SelectOption[] = [];

  for (const field of fields) {
    fieldOptions.push({
      label: field.label + '',
      value: field.name,
    });
  }

  return (
    <div className="rcm-rule-wrap">
      <div className="rcm-rule-condition-box">
        <div className={'form-input w-fit flex relative mt-[-20px] space-x-2 items-center'}>
          <div>{props.condition}</div>
          <div>조건</div>
          <div>
            <button
              className={'mt-1'}
              onClick={() => {
                clearCondition();
              }}
            >
              <IconCircleX className="max-w-4" />
            </button>
          </div>
        </div>

        <div className={'flex gap-3 items-center mt-3'}>
          <div className={'min-w-[200px]'}>
            <SelectBox
              options={fieldOptions}
              required={true}
              onChange={(fieldName: string) => {
                const field = fields.find((f) => f.name === fieldName);
                setSelected(field?.name);
              }}
              name={'targetField'}
            ></SelectBox>
          </div>

          <div className={'flex gap-3 items-center'}>
            <button
              className={'btn btn-secondary h-[36px]'}
              disabled={!selected}
              onClick={() => {
                const newFieldValues = [...fieldValues];

                const field = fields.find((f) => f.name === selected);
                const queryConditionTypes = getQueryConditionTypes(field as ListableFormField<any>);

                newFieldValues.push({
                  id: getMaxConditionId(),
                  name: selected as string,
                  queryConditionType: queryConditionTypes[0]!.value as QueryConditionType,
                  values: [],
                });

                setFieldValues(newFieldValues);
              }}
            >
              선택
            </button>
          </div>
        </div>

        {(function () {
          return fieldValues.map((fieldValue, index) => {
            const field = fields.find((f) => f.name === fieldValue.name)!;

            if (!field) {
              return null;
            }

            const currentQueryConditionType = fieldValue.queryConditionType;

            const currentValueType = getQueryConditionValueType(currentQueryConditionType);

            const helpText = getQueryConditionHelpText(field.getLabel(), currentQueryConditionType);

            return (
              <div key={index}>
                <div className={'font-bold mt-5'}>{field?.label}</div>
                <div className={'flex gap-3 items-center'}>
                  <div className={'min-w-[200px] max-w-[200px]'}>
                    <SelectBox
                      options={getQueryConditionTypes(field)}
                      value={fieldValue.queryConditionType}
                      required={true}
                      onChange={(type: string) => {
                        changeQueryConditionType(index, type as QueryConditionType);
                      }}
                      name={`queryConditionType${index}`}
                    ></SelectBox>
                  </div>
                  <div className={'w-full flex'}>
                    {(function () {
                      const fields: React.ReactNode[] = [];

                      if (field.type === 'manyToOne') {
                        // manyToOneField 라면 required 를 제외해야 한다.
                        // 이게 required 가 되면 필드 clear 가 안 된다.
                        field.withRequired(false);
                      } else {
                        field.withRequired(true);
                      }

                      if (currentValueType === 'SINGLE') {
                        const currentValue =
                          fieldValue.values !== undefined && fieldValue.values.length > 0
                            ? fieldValue.values[0]
                            : '';
                        fields.push(
                          <div key={`${fieldValue.name}_${index}`} className={'w-full'}>
                            <RuleFieldRenderer
                              field={field
                                .clone()
                                // required 를 넣어서 optional field 의 선택안함 옵션을 제거한다.
                                .withValue(currentValue)}
                              onChange={(value) => {
                                if (field.type === 'manyToOne') {
                                  changeValue(index, isBlank(value) ? [] : [value.id]);
                                } else {
                                  changeValue(index, [value]);
                                }
                              }}
                            ></RuleFieldRenderer>
                          </div>,
                        );
                      } else if (currentValueType === 'RANGE') {
                        // 단일 필드로 Range 를 지원하는 필드 타입은 날짜 뿐이다.
                        if (field instanceof AbstractDateField) {
                          const cloned = field
                            .clone(true)
                            .withRange(true)
                            .withValue(fieldValue.values);

                          return (
                            <div className={'w-full'}>
                              <RuleFieldRenderer
                                field={cloned}
                                onChange={(value) => {
                                  if (Array.isArray(value) && value.length === 2) {
                                    changeValue(index, [...value]);
                                  }
                                }}
                              ></RuleFieldRenderer>
                            </div>
                          );
                        } else {
                          const currentValue1 =
                            fieldValue.values !== undefined && fieldValue.values.length > 0
                              ? fieldValue.values[0]
                              : '';
                          const currentValue2 =
                            fieldValue.values !== undefined && fieldValue.values.length > 1
                              ? fieldValue.values[1]
                              : '';

                          const field1 = field.clone(true).withRange(true).withValue(currentValue1);
                          const field2 = field.clone(true).withRange(true).withValue(currentValue2);

                          return (
                            <div
                              key={`${fieldValue.name}_${index}`}
                              className={'flex justify-between'}
                            >
                              <RuleFieldRenderer
                                field={field1}
                                onChange={(value) => {
                                  changeValue(index, [...value]);
                                }}
                              ></RuleFieldRenderer>{' '}
                              ~
                              <RuleFieldRenderer
                                field={field2}
                                onChange={(value) => {
                                  changeValue(index, [...value]);
                                }}
                              ></RuleFieldRenderer>
                            </div>
                          );
                        }
                      } else if (currentValueType === 'MULTIPLE') {
                        // multiple field 는 tags 뿐이다.
                        const currentValue =
                          fieldValue.values !== undefined && fieldValue.values.length > 0
                            ? fieldValue.values
                            : [];

                        fields.push(
                          <TagsInput
                            key={`${fieldValue.name}_${index}`}
                            size={'md'}
                            value={currentValue}
                            clearable
                            onChange={(value: string[]) => {
                              changeValue(index, [...value]);
                            }}
                          />,
                        );
                      }
                      return fields;
                    })()}
                  </div>
                  <button
                    onClick={() => {
                      const newFieldValues = [...fieldValues];
                      newFieldValues.splice(index, 1);
                      changeFilterValues(newFieldValues);
                    }}
                  >
                    <IconCircleX className="max-w-4" />
                  </button>
                </div>
                {fieldErrors?.has(index) && (
                  <div className={'px-2'}>
                    <ViewFieldError errors={[fieldErrors.get(index)!]} />
                  </div>
                )}
                <div className={'px-2'}>
                  <ViewHelpText helpText={`${helpText}`}></ViewHelpText>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};
