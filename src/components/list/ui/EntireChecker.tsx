/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {ItemCheckable} from "../types/ViewListGrid.types";
import {isTrue} from '../../../../utils/BooleanUtil';
import {v1} from "uuid";

interface EntireCheckerProps extends ItemCheckable {
  total: number;
  listIds: any[];
  subCollection?: boolean;
  selectionOptions?: any; // SelectionOptions
  rows?: any[];
  showCheckboxInput?: boolean;
}

export const EntireChecker = ({ total, listIds, checkedItems, setCheckedItems, subCollection, selectionOptions, rows, showCheckboxInput }: EntireCheckerProps) => {

  // 선택 가능한 항목 필터링
  const selectableIds = selectionOptions?.selectableFilter && rows
    ? rows.filter(selectionOptions.selectableFilter).map((item: any) => item.id)
    : listIds;

  const checkAll = selectableIds.length > 0 && selectableIds.every((id: any) => checkedItems.includes(id));

  function checkAllItems() {
    if (!selectionOptions?.selectableFilter) {
      // 기존 로직
      if (checkedItems.length === 0) {
        setCheckedItems?.([...listIds]);
      } else {
        setCheckedItems?.([]);
      }
    } else {
      // selectableFilter가 있을 때
      if (checkAll) {
        // 선택 가능한 항목들을 제거
        const newCheckedItems = checkedItems.filter((id: any) => !selectableIds.includes(id));
        setCheckedItems?.(newCheckedItems);
      } else {
        // 선택 가능한 항목들을 추가
        const newCheckedItems = [...new Set([...checkedItems, ...selectableIds])];
        setCheckedItems?.(newCheckedItems);
      }
    }
    
    // 선택 변경 콜백
    if (selectionOptions?.onSelectionChange) {
      selectionOptions.onSelectionChange(checkedItems, rows || []);
    }
  }

  if (total < 1)
    return null;

  const id = isTrue(subCollection) ? v1() : 'entire-checker';

  // showCheckboxInput이 false면 체크박스 없이 '#' 표시
  if (!showCheckboxInput) {
    return <div className="text-center font-medium">#</div>;
  }

  return <input type={"checkbox"} aria-label="전체 선택" className="form-checkbox"
    id={id}
    checked={checkAll}
    onChange={() => checkAllItems()} />
}
