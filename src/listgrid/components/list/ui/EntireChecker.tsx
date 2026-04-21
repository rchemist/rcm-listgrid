import { ItemCheckable, SelectionOptions } from '../types/ViewListGrid.types';
import { isTrue } from '../../../utils/BooleanUtil';
import { v1 } from 'uuid';

interface EntireCheckerProps extends ItemCheckable {
  total: number;
  listIds: string[];
  subCollection?: boolean;
  selectionOptions?: SelectionOptions;
  // rows: generic entity payload kept as any[]
  rows?: any[];
  showCheckboxInput?: boolean;
}

export const EntireChecker = ({
  total,
  listIds,
  checkedItems,
  setCheckedItems,
  subCollection,
  selectionOptions,
  rows,
  showCheckboxInput,
}: EntireCheckerProps) => {
  // 선택 가능한 항목 필터링
  const selectableIds: string[] =
    selectionOptions?.selectableFilter && rows
      ? rows.filter(selectionOptions.selectableFilter).map((item: { id: string }) => item.id)
      : listIds;

  const checkAll =
    selectableIds.length > 0 && selectableIds.every((id: string) => checkedItems.includes(id));

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
        const newCheckedItems = checkedItems.filter((id: string) => !selectableIds.includes(id));
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

  if (total < 1) return null;

  const id = isTrue(subCollection) ? v1() : 'entire-checker';

  // showCheckboxInput이 false면 체크박스 없이 '#' 표시
  if (!showCheckboxInput) {
    return <div className="rcm-entire-checker-placeholder">#</div>;
  }

  return (
    <input
      type={'checkbox'}
      aria-label="전체 선택"
      className="rcm-checkbox"
      id={id}
      checked={checkAll}
      onChange={() => checkAllItems()}
    />
  );
};
