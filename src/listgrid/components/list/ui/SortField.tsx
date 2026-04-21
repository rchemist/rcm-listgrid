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
export const SortField = ({ name, searchForm, onChangeSearchForm }: SortFieldProps) => {
  const sorts = searchForm.getSorts();

  const sorted = sorts.has(name);

  let direction: Direction | undefined = undefined;

  if (sorted) {
    // 이미 정렬 되어 있음
    direction = sorts.get(name);
  }

  function changeSort() {
    const nextDirection = getNextDirection();
    const newSearchForm = searchForm.clone().withSort(name, nextDirection);
    onChangeSearchForm(newSearchForm);
  }

  function getNextDirection(): Direction | undefined {
    if (direction === undefined) {
      return 'DESC';
    } else if (direction === 'DESC') {
      return 'ASC';
    } else {
      return undefined;
    }
  }

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
      onClick={() => {
        changeSort();
      }}
    >
      {icon()}
    </button>
  );
};
