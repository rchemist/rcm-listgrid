'use client';

import React, { useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { ViewRowItemProps } from './types/RowItem.types';
import { ViewRows } from './ui/ViewRows';
import { useListGridTheme } from './context/ListGridThemeContext';

export const RowItem = (props: ViewRowItemProps) => {
  const { list, checkedItems, setCheckedItems } = props;

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

    return (
      <tbody className={themeClasses.table?.tbody ?? 'rcm-listgrid-tbody'}>
        <tr>
          <td colSpan={colspan}>
            <div className={themeClasses.empty?.container ?? 'rcm-listgrid-empty'}>
              {props.messages?.noData ?? '데이터가 없습니다.'}
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return <React.Fragment>{showList()}</React.Fragment>;

  function onDrag(list: any[]) {
    setSortableList(list);
    props.onDrag?.(list.map((item) => item.id));
  }

  function sortRowsPriority(list: any[]) {
    setSortableList(list);
    props.sortRowsPriority?.(list);
  }

  function showList() {
    const totalCount = sortableList.length - 1;

    if (props.managePriority) {
      return (
        <ReactSortable
          tag={'tbody'}
          list={sortableList}
          setList={(list) => sortRowsPriority(list)}
          animation={200}
          swap={true}
          swapThreshold={1}
          className={themeClasses.table?.tbody ?? 'rcm-listgrid-tbody'}
        >
          {sortableList.map((item, index) => {
            return (
              <ViewRows
                {...props}
                key={`view_row_${item.id}_${index}`}
                sortableList={sortableList}
                totalCount={totalCount}
                draggable={draggable}
                item={item}
                index={index}
                onDrag={onDrag}
                checkItem={checkItem}
                {...(props.selectionOptions !== undefined
                  ? { selectionOptions: props.selectionOptions }
                  : {})}
                {...(props.showCheckboxInput !== undefined
                  ? { showCheckboxInput: props.showCheckboxInput }
                  : {})}
              ></ViewRows>
            );
          })}
        </ReactSortable>
      );
    } else {
      return (
        <tbody className={themeClasses.table?.tbody ?? 'rcm-listgrid-tbody'}>
          {sortableList.map((item, index) => {
            return (
              <ViewRows
                {...props}
                key={`view_row_${item.id}_${index}`}
                sortableList={sortableList}
                totalCount={totalCount}
                draggable={draggable}
                item={item}
                index={index}
                onDrag={onDrag}
                checkItem={checkItem}
                {...(props.selectionOptions !== undefined
                  ? { selectionOptions: props.selectionOptions }
                  : {})}
                {...(props.showCheckboxInput !== undefined
                  ? { showCheckboxInput: props.showCheckboxInput }
                  : {})}
              ></ViewRows>
            );
          })}
        </tbody>
      );
    }
  }

  function checkItem(id: string) {
    const items: string[] = [...checkedItems];
    if (items.includes(id)) {
      setCheckedItems?.(items.filter((item) => item !== id));
    } else {
      setCheckedItems?.([...items, id]);
    }
  }
};
