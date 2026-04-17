'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import React, {useEffect, useState} from "react";
import {ReactSortable} from "react-sortablejs";
import {ViewRowItemProps} from "./types/RowItem.types";
import {ViewRows} from "./ui/ViewRows";
import {useListGridTheme} from "./context/ListGridThemeContext";


export const RowItem = (props: ViewRowItemProps) => {

  const {list, checkedItems, setCheckedItems} = props;

  const [sortableList, setSortableList] = useState<any[]>([]);
  const { classNames: themeClasses } = useListGridTheme();

  useEffect(() => {
    setSortableList(list);
  }, [list]);

  const draggable = props.onDrag !== undefined;

  if (sortableList.length === 0) {

    let colspan = props.viewFields.length === 0 ? props.fields.length : props.viewFields.length;
    if (draggable || props.managePriority) {
      colspan++;
    }
    // 새창으로 보기 컬럼
    if (props.openInNewWindow?.enabled && props.isAdmin && !props.onSelect) {
      colspan++;
    }
    // 선택 버튼 컬럼
    if (props.onSelect) {
      colspan++;
    }

    return <tbody className={themeClasses.table?.tbody ?? "overflow-auto p-0 !border-0"}>
      <tr>
        <td colSpan={colspan}>
          <div
            className={themeClasses.empty?.container ?? "flex h-full !border-0 min-h-[400px] items-center whitespace-nowrap justify-center text-md sm:min-h-[300px]"}>
            {props.messages?.noData ?? '데이터가 없습니다.'}
          </div>
        </td>
      </tr>
    </tbody>
  }

  return <React.Fragment>
    {showList()}
  </React.Fragment>;

  function onDrag(list: any[]) {
    setSortableList(list);
    props.onDrag?.(list.map(item => item.id));
  }

  function sortRowsPriority(list: any[]) {
    setSortableList(list);
    props.sortRowsPriority?.(list);
  }

  function showList() {
    const totalCount = sortableList.length - 1;

    if (props.managePriority) {
      return <ReactSortable tag={'tbody'} list={sortableList} setList={list => sortRowsPriority(list)} animation={200} swap={true} swapThreshold={1} className={themeClasses.table?.tbody ?? "overflow-auto p-0 !border-0"}>
        {sortableList.map((item, index) => {
          return <ViewRows {...props}
                           key={`view_row_${item.id}_${index}`}
                           sortableList={sortableList}
                           totalCount={totalCount}
                           draggable={draggable} item={item} index={index} onDrag={onDrag}
                           checkItem={checkItem}
                           selectionOptions={props.selectionOptions}
                           showCheckboxInput={props.showCheckboxInput}></ViewRows>
        })}
      </ReactSortable>
    } else {
      return <tbody className={themeClasses.table?.tbody ?? "overflow-auto p-0 !border-0"}>
        {sortableList.map((item, index) => {
          return <ViewRows {...props}
            key={`view_row_${item.id}_${index}`}
                          sortableList={sortableList}
                           totalCount={totalCount}
                           draggable={draggable} item={item} index={index} onDrag={onDrag}
                           checkItem={checkItem}
                           selectionOptions={props.selectionOptions}
                           showCheckboxInput={props.showCheckboxInput}></ViewRows>
        })}
      </tbody>;
    }

  }

  function checkItem(id: any) {
    const items: string[] = [...checkedItems];
    if (items.includes(id)) {
      setCheckedItems?.(items.filter(item => item !== id));
    } else {
      setCheckedItems?.([...items, id]);
    }
  }

}



