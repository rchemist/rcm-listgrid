'use client';

import React, { useState } from 'react';
import { QueryConditionType } from '../../../form/SearchForm';
import { SelectBox } from '../../../ui';
import { TextInput } from '../../../ui';
import { isBlank } from '../../../utils/StringUtil';

interface NumberFilterProps {
  onRemove: () => void;
  onChange: (queryConditionType: QueryConditionType, value: number | number[]) => void;
}

export const NumberFilter = (props: NumberFilterProps) => {
  const [type, setType] = useState<QueryConditionType>('BETWEEN');
  const [start, setStart] = useState<number>();
  const [end, setEnd] = useState<number>();
  const [message, setMessage] = useState<string>();

  const filterType = getNumberFilterType(type);

  function setValue(valueType: 'start' | 'end', value: string) {
    let startValue = start;
    let endValue = end;

    if (valueType === 'start') {
      const start = value ? Number(value) : undefined;
      setStart(start);
      startValue = start;
    } else {
      const end = value ? Number(value) : undefined;
      setEnd(end);
      endValue = end;
    }

    if (filterType.showEnd) {
      if (startValue !== undefined && endValue !== undefined) {
        setMessage(undefined);
        props.onChange(type, [startValue, endValue]);
        return;
      } else {
        // Only one side filled means the range cannot be applied. Say so instead of
        // dropping the condition silently — an empty pair is simply "no filter".
        const halfFilled = (startValue !== undefined) !== (endValue !== undefined);
        setMessage(halfFilled ? RANGE_INCOMPLETE_MESSAGE : undefined);
        props.onRemove();
      }
    } else {
      setMessage(undefined);
      if (startValue !== undefined) {
        props.onChange(type, startValue);
      } else {
        props.onRemove();
      }
    }
  }

  function changeType(type: QueryConditionType) {
    setType(type);
    setStart(undefined);
    setEnd(undefined);
    setMessage(undefined);
    props.onRemove();
  }

  return (
    <div className={'w-full'}>
      <div className={'flex w-full space-x-2 items-center'}>
        <div className={'flex items-center space-x-1 shrink-0'}>
          <span className={'text-xs text-gray-500 whitespace-nowrap'}>조건</span>
          <div className={'w-[90px]'}>
            <SelectBox
              value={type}
              required={true}
              name={'type'}
              options={[...NumberFilterTypes]}
              onChange={(value: QueryConditionType) => {
                changeType(value);
              }}
            ></SelectBox>
          </div>
        </div>
        <div className={'flex-1 flex space-x-2 items-center'}>
          <TextInput
            name={'start'}
            type={'number'}
            value={start ?? ''}
            onChange={(value: string) => {
              if (!isBlank(value) && isNaN(Number(value))) {
                return;
              }
              setValue('start', value);
            }}
          ></TextInput>
          {filterType.showEnd && (
            <React.Fragment>
              <span>~</span>
              <TextInput
                name={'end'}
                type={'number'}
                value={end ?? ''}
                onChange={(value: string) => {
                  if (!isBlank(value) && isNaN(Number(value))) {
                    return;
                  }
                  setValue('end', value);
                }}
              ></TextInput>
            </React.Fragment>
          )}
        </div>
      </div>
      {message && <div className={'text-danger text-xs pt-1'}>{message}</div>}
    </div>
  );
};

const RANGE_INCOMPLETE_MESSAGE = '시작·끝 값을 모두 입력하세요.';

interface NumberFilterType {
  value: QueryConditionType;
  label: string;
  showEnd: boolean;
}

const NumberFilterTypes: NumberFilterType[] = [
  { value: 'BETWEEN', label: '범위', showEnd: true },
  { value: 'EQUAL', label: '일치', showEnd: false },
  { value: 'NOT_EQUAL', label: '불일치', showEnd: false },
  { value: 'LESS_THAN', label: '미만', showEnd: false },
  { value: 'LESS_THAN_EQUAL', label: '이하', showEnd: false },
  { value: 'GREATER', label: '초과', showEnd: false },
  { value: 'GREATER_THAN_EQUAL', label: '이상', showEnd: false },
];

function getNumberFilterType(type: QueryConditionType): NumberFilterType {
  return NumberFilterTypes.find((value) => value.value === type)!;
}
