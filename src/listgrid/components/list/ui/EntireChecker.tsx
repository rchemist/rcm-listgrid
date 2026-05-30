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
    // 0.3.14 — onSelectionChange 의 stale closure fix. setCheckedItems(...)
    // 직후 callback 에 *이전* checkedItems 를 전달하던 버그 → host 가 빈 배열
    // 받음 → master checkbox + selectionOptions.onSelectionChange 패턴 동작 X
    // (project-manager Sprint 31h F.4 root cause). newCheckedItems 를 명시
    // 계산해서 setCheckedItems / onSelectionChange 양쪽에 동일 전달.
    let newCheckedItems: string[];
    if (!selectionOptions?.selectableFilter) {
      // 기존 로직 — 아무것도 안 체크면 전체, 아니면 클리어
      newCheckedItems = checkedItems.length === 0 ? [...listIds] : [];
    } else if (checkAll) {
      // 선택 가능한 항목들을 제거
      newCheckedItems = checkedItems.filter((id: string) => !selectableIds.includes(id));
    } else {
      // 선택 가능한 항목들을 추가
      newCheckedItems = [...new Set([...checkedItems, ...selectableIds])];
    }
    setCheckedItems?.(newCheckedItems);

    // 선택 변경 콜백
    if (selectionOptions?.onSelectionChange) {
      selectionOptions.onSelectionChange(newCheckedItems, rows || []);
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
