import { Direction, SearchForm } from '../../../form/SearchForm';
// import {SearchFormState} from '../state/State';
import {
  IconSortAscendingLetters,
  IconSortDescending,
  IconSortDescendingLetters,
} from '@tabler/icons-react';

interface SortFieldProps {
  name: string;
  searchForm: SearchForm;
  onChangeSearchForm: (searchForm: SearchForm) => void;
}

export interface SortToggle {
  direction: Direction | undefined;
  ariaLabel: string;
  toggle: () => void;
}

function getNextDirection(direction: Direction | undefined): Direction | undefined {
  if (direction === undefined) {
    return 'DESC';
  } else if (direction === 'DESC') {
    return 'ASC';
  } else {
    return undefined;
  }
}

/**
 * Sort toggle 상태/동작을 계산하는 순수 헬퍼.
 * (React hook 이 아님 — 내부적으로 useState/useEffect 등을 사용하지 않으므로
 * `.map()` 루프 안에서 조건부로 호출해도 rules-of-hooks 위반이 아니다.)
 *
 * HeaderField(라벨 클릭)과 SortField(아이콘 클릭)가 동일한 토글 로직을 공유해
 * 두 클릭 타깃이 항상 같은 동작(단일 dispatch)을 보장한다.
 */
export function getSortToggle(
  name: string,
  searchForm: SearchForm,
  onChangeSearchForm: (searchForm: SearchForm) => void,
): SortToggle {
  const sorts = searchForm.getSorts();
  const sorted = sorts.has(name);
  const direction: Direction | undefined = sorted ? sorts.get(name) : undefined;

  const ariaLabel =
    direction === 'DESC'
      ? '정렬 변경 (현재 내림차순)'
      : direction === 'ASC'
        ? '정렬 변경 (현재 오름차순)'
        : '정렬 변경';

  function toggle() {
    const nextDirection = getNextDirection(direction);
    const newSearchForm = searchForm.clone().withSort(name, nextDirection);
    onChangeSearchForm(newSearchForm);
  }

  return { direction, ariaLabel, toggle };
}

export const SortField = ({ name, searchForm, onChangeSearchForm }: SortFieldProps) => {
  const { direction, ariaLabel, toggle } = getSortToggle(name, searchForm, onChangeSearchForm);

  const icon = () => {
    if (direction === undefined) {
      return <IconSortDescending className={`w-3.5`} />;
    } else if (direction === 'ASC') {
      return <IconSortDescendingLetters className={`w-3.5 text-primary`} />;
    } else {
      return <IconSortAscendingLetters className={`w-3.5 text-primary`} />;
    }
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => {
        toggle();
      }}
    >
      {icon()}
    </button>
  );
};
