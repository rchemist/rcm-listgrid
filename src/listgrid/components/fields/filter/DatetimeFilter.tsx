'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React, {useEffect, useState} from "react";
import {DefinedDateType, fDate, getDefinedDates} from "../../../misc";
import {FlatPickrDateField} from "../../../ui";
import { SafePerfectScrollbar } from "../../../ui";
import {FilterRenderParameters} from '../../../config/EntityField';
import {MinMaxStringLimit} from "../../../form/Type";

export interface DatetimeFilterProps extends FilterRenderParameters{
  name: string;
  limit?: MinMaxStringLimit;
}


export const DatetimeFilter = (props: DatetimeFilterProps) => {
  const [value, setValue] = useState<any>();

  function handleValueChange(type: DefinedDateType) {
    const values = getDefinedDates(type);
    props.onChange(values, 'BETWEEN');
    setValue(values)
  }

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);


  return <div>

    <FlatPickrDateField type={'date'}
                        name={props.name}
                        onChange={(val => {
                          if (Array.isArray(val) && val.length === 2) {
                            if (val[0] === val[1]) {
                              const until: Date = new Date(val[1]);
                              until.setDate(until.getDate() + 1);
                              props.onChange([val[0], fDate(until, `yyyy-MM-dd`)], "BETWEEN");
                            } else {
                              props.onChange(val, "BETWEEN");
                            }
                            return;
                          }
                        })}
                        limit={props.limit} range={true} value={value}/>

<div className="block md:hidden">
    <SafePerfectScrollbar className="perfect-scrollbar relative w-full -mr-3 pr-3">
      {showButtons()}
    </SafePerfectScrollbar>
    </div>
    <div className="hidden md:block">
      {showButtons()}
    </div>

  </div>

  function showButtons() {
    return <div className={'flex gap-3 mt-2'}>
    <button className={'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'} onClick={() => {
      handleValueChange('TODAY')
    }}>오늘</button>
    <button className={'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'} onClick={() => {handleValueChange('WEEK')}}>1주일</button>
    <button className={'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'} onClick={() => {handleValueChange('MONTH')}}>1개월</button>
    <button className={'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'} onClick={() => {handleValueChange('MONTH3')}}>3개월</button>
    <button className={'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'} onClick={() => {handleValueChange('MONTH6')}}>6개월</button>
    <button className={'btn-sm border rounded-md flex items-center max-h-[24px] btn-outline-primary whitespace-nowrap'} onClick={() => {handleValueChange('YEAR')}}>1년</button>
  </div>
  }
}
