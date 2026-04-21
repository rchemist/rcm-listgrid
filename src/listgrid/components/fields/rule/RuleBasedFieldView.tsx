'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import {
  ResultByCount,
  ResultByRuleCondition,
  RuleBasedFieldProps,
  RuleConditionValue,
  RuleFieldEntityForm,
  RuleFieldType,
} from './Type';
import { isEmpty } from '../../../utils';
import { SelectOption } from '../../../form/Type';
import { IconBox } from '@tabler/icons-react';
import { SelectBox } from '../../../ui';
import { isBlank } from '../../../utils/StringUtil';
import { RuleCondition } from './RuleCondition';
import { FormField } from '../abstract';
import { isTrue } from '../../../utils/BooleanUtil';
import { FilterItem, getQueryConditionValueType, SearchForm } from '../../../form/SearchForm';
import { getExternalApiDataWithError } from '../../../misc';
import { ViewHelpText } from '../../form/ui/ViewHelpText';
import { ViewFieldError } from '../../form/ui/ViewFieldError';
import { useLoadingStore } from '../../../loading';

interface RuleBasedFieldViewProps extends RuleBasedFieldProps {
  onCancel: () => void;
  apiUrl?: string | undefined;
  label?: ReactNode | undefined;
  helpText?: ReactNode | undefined;
  onSubmitField?: ResultByRuleCondition | undefined;
  onSubmitSelector?: ResultByCount | undefined;
  viewType: 'selector' | 'field';
  type?: RuleFieldType | undefined;
  entityForms: RuleFieldEntityForm[];
}

export const RuleBasedFieldsView = (props: RuleBasedFieldViewProps) => {
  // 기본적으로 리스트의 필드들은 검색이 가능하다는 뜻이다.

  const [condition, setCondition] = useState<'AND' | 'OR' | undefined>('AND');

  const [ruleConditions, setRuleConditions] = useState<Map<number, RuleConditionValue>>(
    new Map<number, RuleConditionValue>(),
  );

  const [fieldErrors, setFieldErrors] = useState<Map<number, Map<number, string>>>(
    new Map<number, Map<number, string>>(),
  );

  const [submitError, setSubmitError] = useState('');

  const [targetRuleFieldEntityForm, setTargetRuleFieldEntityForm] = useState<RuleFieldEntityForm>();

  const { openBaseLoading, setOpenBaseLoading } = useLoadingStore();

  useEffect(() => {
    // 넘어온 props.value가 Map인지 확인
    if (props.value instanceof Map) {
      setRuleConditions(props.value);
    } else if (typeof props.value === 'object' && props.value !== null) {
      // 객체인 경우 Map으로 변환 시도
      const newMap = new Map<number, RuleConditionValue>(
        Object.entries(props.value).map(([key, value]) => [
          Number(key),
          value as RuleConditionValue,
        ]),
      );
      setRuleConditions(newMap);
    } else {
      // Map이 아니거나 변환이 불가능한 경우 빈 Map으로 설정
      setRuleConditions(new Map<number, RuleConditionValue>());
    }

    // 대상 엔티티폼이 하나 뿐이라면 굳이 바꿀 필요가 없다.
    if (props.entityForms.length === 1) {
      setTargetRuleFieldEntityForm(props.entityForms[0]);
    }
  }, []);

  if (props.entityForms.length === 0) {
    return null;
  }

  const hasConditions = ruleConditions !== undefined && ruleConditions.size > 0;

  const filtered = isFiltered();

  function getMaxRuleConditionId(): number {
    if (ruleConditions === undefined || ruleConditions.size === 0) {
      return 0;
    }

    const maxId = Math.max(...ruleConditions.keys());
    return maxId + 1;
  }

  const isButton = props.viewType !== 'field';

  function addNewRuleCondition() {
    if (condition !== undefined && targetRuleFieldEntityForm !== undefined) {
      const id = getMaxRuleConditionId();
      const ruleCondition = new RuleConditionValue(
        id,
        condition!,
        targetRuleFieldEntityForm.prefix,
      );
      const newRuleConditions: Map<number, RuleConditionValue> = new Map<
        number,
        RuleConditionValue
      >(ruleConditions);
      newRuleConditions.set(id, ruleCondition);
      setRuleConditions(newRuleConditions);

      if (!isButton) {
        // viewType 이 field 면 바뀔 때 마다 자동으로 onSubmit 을 처리한다.
        props.onSubmitField!(newRuleConditions);
      }
    }
  }

  const targetEntityOptions: SelectOption[] = [];

  for (const form of props.entityForms) {
    targetEntityOptions.push({ label: form.label, value: form.prefix });
  }

  function getTargetEntityForm(targetEntityPrefix: string) {
    for (const form of props.entityForms) {
      if (form.prefix === targetEntityPrefix) {
        return form;
      }
    }
    return props.entityForms[0]!;
  }

  return (
    <>
      <div className="rcm-rule-wrap">
        <div
          className={`rcm-rule-inner ${isButton ? 'rcm-rule-inner-button' : 'rcm-rule-inner-plain'}`}
        >
          {isButton && (
            <>
              <div className="rcm-rule-icon-badge">
                <IconBox className="rcm-rule-icon-badge-icon" />
              </div>
              <h5 className="rcm-rule-title">{props.label}</h5>
              {props.helpText && <ViewHelpText helpText={props.helpText}></ViewHelpText>}
            </>
          )}

          <div className={'flex gap-3 items-center'}>
            {props.entityForms.length > 1 && (
              <div className={'min-w-[200px]'}>
                <SelectBox
                  options={targetEntityOptions}
                  value={targetRuleFieldEntityForm?.prefix ?? ''}
                  required={true}
                  onChange={(prefix: string) => {
                    for (const form of props.entityForms) {
                      if (form.prefix === prefix) {
                        setTargetRuleFieldEntityForm(form);
                        break;
                      }
                    }
                  }}
                  name={'chooseTargetEntityForm'}
                ></SelectBox>
              </div>
            )}

            <div className={'min-w-[200px]'}>
              <SelectBox
                options={[
                  { label: 'AND', value: 'AND' },
                  { label: 'OR', value: 'OR' },
                ]}
                value={condition ?? 'AND'}
                required={true}
                onChange={(condition: string) => {
                  setCondition(condition as 'AND' | 'OR');
                }}
                name={'chooseCondition'}
              ></SelectBox>
            </div>

            <div>
              <button
                className={'btn btn-secondary h-[36px]'}
                disabled={condition === undefined || targetRuleFieldEntityForm === undefined}
                onClick={() => {
                  addNewRuleCondition();
                }}
              >
                추가
              </button>
            </div>
          </div>
        </div>
        {!isBlank(submitError) && (
          <div className={'px-2 mt-5'}>
            <ViewFieldError errors={[submitError]} />
          </div>
        )}
      </div>

      {(function () {
        if (hasConditions) {
          const conditionViews: React.ReactNode[] = [];

          ruleConditions.forEach((c) => {
            conditionViews.push(
              <RuleCondition
                key={c.id}
                id={c.id}
                condition={c.condition}
                targetEntityForm={getTargetEntityForm(c.targetEntityPrefix)}
                clearError={() => {
                  clearErrorById(c.id);
                }}
                fieldErrors={fieldErrors.get(c.id) ?? new Map<number, string>()}
                setFieldError={(error) => {
                  addError(c.id, error);
                }}
                fieldValues={c.values}
                clearCondition={() => {
                  clearCondition(c.id);
                }}
                addCondition={(value) => {
                  const newConditions = new Map<number, RuleConditionValue>(ruleConditions);
                  newConditions.set(c.id, value);
                  const newFieldErrors = new Map<number, Map<number, string>>(fieldErrors);
                  newFieldErrors.delete(c.id);
                  setSubmitError('');
                  setFieldErrors(newFieldErrors);
                  setRuleConditions(newConditions);
                  if (!isButton) {
                    // viewType 이 field 면 바뀔 때 마다 자동으로 onSubmit 을 처리한다.
                    props.onSubmitField!(newConditions);
                  }
                }}
              ></RuleCondition>,
            );
          });

          return conditionViews;
        }

        return null;
      })()}

      {props.viewType === 'selector' && (
        <div className={'flex gap-3 items-center justify-center mt-5'}>
          <button
            className={'btn btn-outline-secondary h-[34px]'}
            onClick={() => {
              props.onCancel();
            }}
          >
            닫기
          </button>
          <button
            className={'btn btn-secondary h-[34px]'}
            disabled={!filtered}
            onClick={() => {
              submit();
            }}
          >
            검색 후 {props.type === 'add' ? '등록' : '제거'}
          </button>
        </div>
      )}
    </>
  );

  function clearError() {
    setSubmitError('');
    setFieldErrors(new Map<number, Map<number, string>>());
  }

  /**
   * 각 컨디션 별 ID 제거
   * @param id
   */
  function clearErrorById(id: number) {
    setSubmitError('');
    const newFieldErrors = new Map<number, Map<number, string>>(fieldErrors);
    newFieldErrors.delete(id);
    setFieldErrors(newFieldErrors);
  }

  function addError(id: number, errors: Map<number, string>) {
    const newErrors: Map<number, Map<number, string>> = new Map(fieldErrors);
    newErrors.set(id, errors);
    setFieldErrors(newErrors);
  }

  function isFiltered(): boolean {
    if (ruleConditions !== undefined && ruleConditions.size > 0) {
      let filtered = true;

      ruleConditions.forEach((ruleCondition) => {
        if (ruleCondition.isEmpty()) {
          filtered = false;
          return;
        }
      });

      return filtered;
    }

    return false;
  }

  function clearCondition(id: number) {
    if (isEmpty(ruleConditions)) {
      return;
    }

    const newRuleConditions: Map<number, RuleConditionValue> = new Map(ruleConditions);
    newRuleConditions.delete(id);

    setRuleConditions(newRuleConditions);

    if (!isButton) {
      // viewType 이 field 면 바뀔 때 마다 자동으로 onSubmit 을 처리한다.
      props.onSubmitField!(newRuleConditions);
    }
  }

  function submit(ruleConditionValue?: Map<number, RuleConditionValue>) {
    setOpenBaseLoading(true);
    // fieldValues 를 조사한다.
    clearError();
    const errors: Map<number, Map<number, string>> = new Map<number, Map<number, string>>();

    const conditions = ruleConditionValue ?? ruleConditions;

    for (const key of conditions.keys()) {
      const ruleCondition = conditions.get(key)!;

      const ruleError: Map<number, string> = new Map<number, string>();

      ruleCondition.values.forEach((fieldValue) => {
        const field = getField(fieldValue.name);
        const currentQueryConditionType = fieldValue.queryConditionType;
        const currentValueType = getQueryConditionValueType(currentQueryConditionType);

        if (currentValueType !== 'NONE') {
          if (
            fieldValue.values === undefined ||
            fieldValue.values.length === 0 ||
            isBlank(fieldValue.values[0])
          ) {
            ruleError.set(ruleCondition.id, `${field?.getLabel()} 의 검색어를 입력하세요.`);
          }

          if (currentValueType === 'RANGE') {
            if (
              fieldValue.values === undefined ||
              fieldValue.values.length !== 2 ||
              isBlank(fieldValue.values[0]) ||
              isBlank(fieldValue.values[1])
            ) {
              ruleError.set(
                ruleCondition.id,
                `${field?.getLabel()} 의 검색 범위를 알맞게 입력하세요.`,
              );
            }
          }
        }
      });

      if (ruleError.size > 0) {
        errors.set(ruleCondition.id, ruleError);
      }
    }

    if (errors.size > 0) {
      setFieldErrors(errors);
      setSubmitError('검색 정보를 다시 확인해 주세요.');
      setOpenBaseLoading(false);
      return;
    }

    const searchForm = new SearchForm();

    const filterMap: Map<'AND' | 'OR', FilterItem[]> = new Map<'AND' | 'OR', FilterItem[]>();

    for (const key of conditions.keys()) {
      const ruleCondition = conditions.get(key)!;

      const fieldValues = ruleCondition.values;
      const filterItems: FilterItem[] = [];

      for (const fieldValue of fieldValues) {
        const queryConditionType = fieldValue.queryConditionType;

        const field = getField(fieldValue.name);

        if (field?.type === 'manyToOne') {
          // manyToOneField 인 경우에는 두가지 정보를 모두 서버로 보내자.
          // @ManyToOne 으로 매핑되었을 수도 있고, 단순 key 만 저장하고 있을 수도 있기 때문이다.
          filterItems.push({
            name: fieldValue.name,
            queryConditionType: queryConditionType,
            value: queryConditionType === 'EQUAL' ? fieldValue.values![0] : undefined,
            values: queryConditionType !== 'EQUAL' ? fieldValue.values : undefined,
          });

          if (!fieldValue.name.endsWith('Id')) {
            filterItems.push({
              name: fieldValue.name + 'Id',
              queryConditionType: queryConditionType,
              value:
                getQueryConditionValueType(queryConditionType) === 'SINGLE'
                  ? fieldValue.values![0]
                  : undefined,
              values:
                getQueryConditionValueType(queryConditionType) !== 'SINGLE'
                  ? fieldValue.values
                  : undefined,
            });
          }
        } else {
          filterItems.push({
            name: fieldValue.name,
            queryConditionType: queryConditionType,
            value: queryConditionType === 'EQUAL' ? fieldValue.values![0] : undefined,
            values: queryConditionType !== 'EQUAL' ? fieldValue.values : undefined,
          });
        }
      }

      const condition = ruleCondition.condition;

      if (filterMap.has(condition)) {
        const newFilters: FilterItem[] = [...filterMap.get(condition)!];
        newFilters.push(...filterItems);
        filterMap.set(condition, newFilters);
      } else {
        filterMap.set(condition, filterItems);
      }
    }

    if (filterMap.has('AND')) {
      searchForm.withFilterIgnoreDuplicate('AND', ...filterMap.get('AND')!);
    }

    if (filterMap.has('OR')) {
      searchForm.withFilterIgnoreDuplicate('OR', ...filterMap.get('OR')!);
    }

    searchForm.withIgnoreCache(true);

    if (searchForm.hasFilters()) {
      if (props.viewType === 'selector') {
        (async () => {
          const response = await getExternalApiDataWithError({
            url: props.apiUrl!,
            method: 'POST',
            formData: searchForm,
          });
          if (response.data !== undefined) {
            // 결과는 RuleMappingResult 의 형태로 넘어 온다.

            const affected = Number(response.data.affected);

            if (affected > 0) {
              props.onSubmitSelector!(affected);
            } else {
              if (isTrue(response.data.duplicated)) {
                const found = Number(response.data.found);
                setSubmitError(
                  found +
                    ' 건의 데이터가 검색되었으나 모두 이미 등록되었습니다. 검색 조건을 다시 설정하거나 닫기를 눌러 주세요.',
                );
              } else {
                setSubmitError(
                  '해당 검색 설정으로 검색된 데이터가 없습니다. 검색 조건을 다시 설정해 주세요.',
                );
              }
            }
          } else {
            setSubmitError(response.error ?? '오류가 발생했습니다.');
          }
          setOpenBaseLoading(false);
        })();
      } else {
        // RuleConditionMap 을 그대로 리턴한다.
        props.onSubmitField!(conditions);
        setOpenBaseLoading(false);
      }
    } else {
      setSubmitError('검색 정보를 설정해야 합니다.');
      setOpenBaseLoading(false);
    }
  }

  function getField(fieldName: string) {
    let field: FormField<any> | undefined = undefined;

    for (const form of props.entityForms) {
      if (props.entityForms.length === 1) {
        if (form.entityForm !== undefined) {
          for (const field of form.entityForm.getListFields()) {
            if (field.name === fieldName) {
              return field;
            }
          }
        }

        if (form.fields !== undefined) {
          for (const field of form.fields) {
            if (field.name === fieldName) {
              return field;
            }
          }
        }
      } else {
        const prefix = form.prefix;

        if (form.entityForm !== undefined) {
          for (const field of form.entityForm.getListFields()) {
            if (prefix + '.' + field.name === fieldName) {
              return field;
            }
          }
        }

        if (form.fields !== undefined) {
          for (const field of form.fields) {
            if (prefix + '.' + field.name === fieldName) {
              return field;
            }
          }
        }
      }
    }

    return field;
  }
};
