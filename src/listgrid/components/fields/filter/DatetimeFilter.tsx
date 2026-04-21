'use client';

import React, { useEffect, useState } from 'react';
import { DefinedDateType, fDate, getDefinedDates } from '../../../misc';
import { FlatPickrDateField } from '../../../ui';
import { SafePerfectScrollbar } from '../../../ui';
import { FilterRenderParameters } from '../../../config/EntityField';
import { MinMaxStringLimit } from '../../../form/Type';

export interface DatetimeFilterProps extends FilterRenderParameters {
  name: string;
  limit?: MinMaxStringLimit | undefined;
}

export const DatetimeFilter = (props: DatetimeFilterProps) => {
  // value is either a Promise<any> from filter framework or Date[] from handleValueChange
  const [value, setValue] = useState<unknown>();

  function handleValueChange(type: DefinedDateType) {
    const values = getDefinedDates(type);
    props.onChange(values, 'BETWEEN');
    setValue(values);
  }

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <div>
      <FlatPickrDateField
        type={'date'}
        name={props.name}
        onChange={(val: any) => {
          if (Array.isArray(val) && val.length === 2) {
            if (val[0] === val[1]) {
              const until: Date = new Date(val[1]);
              until.setDate(until.getDate() + 1);
              props.onChange([val[0], fDate(until, `yyyy-MM-dd`)], 'BETWEEN');
            } else {
              props.onChange(val, 'BETWEEN');
            }
            return;
          }
        }}
        limit={props.limit}
        range={true}
        value={value}
      />

      <div className="rcm-show-below-md">
        <SafePerfectScrollbar className="perfect-scrollbar relative w-full -mr-3 pr-3">
          {showButtons()}
        </SafePerfectScrollbar>
      </div>
      <div className="rcm-show-from-md">{showButtons()}</div>
    </div>
  );

  function showButtons() {
    return (
      <div className={'flex gap-3 mt-2'}>
        <button
          className={
            'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'
          }
          onClick={() => {
            handleValueChange('TODAY');
          }}
        >
          오늘
        </button>
        <button
          className={
            'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'
          }
          onClick={() => {
            handleValueChange('WEEK');
          }}
        >
          1주일
        </button>
        <button
          className={
            'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'
          }
          onClick={() => {
            handleValueChange('MONTH');
          }}
        >
          1개월
        </button>
        <button
          className={
            'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'
          }
          onClick={() => {
            handleValueChange('MONTH3');
          }}
        >
          3개월
        </button>
        <button
          className={
            'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'
          }
          onClick={() => {
            handleValueChange('MONTH6');
          }}
        >
          6개월
        </button>
        <button
          className={
            'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'
          }
          onClick={() => {
            handleValueChange('YEAR');
          }}
        >
          1년
        </button>
      </div>
    );
  }
};
