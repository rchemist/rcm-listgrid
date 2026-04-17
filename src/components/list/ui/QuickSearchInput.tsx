import {isBlank} from '../../../../utils/StringUtil';
import {IconCircleX, IconSearch} from "@tabler/icons-react";

export interface QuickSearchInputProps {
  search: string;
  setSearch: (value: string) => void;
  onQuickSearch: (search: string) => void;
  quickSearchEnabled: boolean;
  quickSearchLabel: string;
  loading: boolean;
}

export const QuickSearchInput: React.FC<QuickSearchInputProps> = ({search, setSearch, onQuickSearch, quickSearchEnabled, quickSearchLabel, loading}) => {
  if (!quickSearchEnabled) return <div>&nbsp;</div>;

  return (
      <div className={'flex w-full max-w-full'}>
        <input
            type="text"
            id="quick-search"
            className="form-input peer form-input !pr-10 focus:!border-white-light py-3 max-w-[300px] min-w-[300px] disabled:pointer-events-none disabled:bg-[#f9f9f9] dark:disabled:bg-[#1b2e4b] placeholder:text-gray-400 dark:placeholder:text-gray-500 font-normal border-gray-300 dark:border-gray-600 dark:bg-gray-800"
            placeholder={`Search ${quickSearchLabel}`}
            value={search}
            readOnly={!quickSearchEnabled}
            disabled={loading || !quickSearchEnabled}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') onQuickSearch(search)
            }}
        />
        <div className="flex items-center justify-center dark:border-[#17263c] text-danger h-[40px] font-semibold -ml-8">
          <button className={'flex min-h-[24px] min-w-[24px] items-center justify-center'} onClick={() => {
            if (!isBlank(search)) onQuickSearch(search)
          }}>
            <IconSearch className={'w-3.5 h-3.5 text-gray-900 dark:text-gray-100'} stroke={1}/>
          </button>
        </div>
        {!isBlank(search) && (
            <div className="flex items-center justify-center dark:border-[#17263c] text-danger h-[40px] font-semibold -ml-11">
              <button className={'flex min-h-[24px] min-w-[24px] items-center justify-center'} onClick={() => {
                setSearch('');
                onQuickSearch('');
              }}>
                <IconCircleX className={'w-3.5 h-3.5 text-gray-900 dark:text-gray-100'} stroke={1}/>
              </button>
            </div>
        )}
      </div>
  );
};
