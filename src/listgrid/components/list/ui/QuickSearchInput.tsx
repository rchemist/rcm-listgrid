import { isBlank } from '../../../utils/StringUtil';
import { IconCircleX, IconSearch } from '@tabler/icons-react';

export interface QuickSearchInputProps {
  search: string;
  setSearch: (value: string) => void;
  onQuickSearch: (search: string) => void;
  quickSearchEnabled: boolean;
  quickSearchLabel: string;
  loading: boolean;
}

export const QuickSearchInput: React.FC<QuickSearchInputProps> = ({
  search,
  setSearch,
  onQuickSearch,
  quickSearchEnabled,
  quickSearchLabel,
  loading,
}) => {
  if (!quickSearchEnabled) return <div>&nbsp;</div>;

  return (
    <div className="rcm-quick-search-wrap">
      <input
        type="text"
        id="quick-search"
        className="rcm-input rcm-quick-search-input"
        placeholder={`Search ${quickSearchLabel}`}
        value={search}
        readOnly={!quickSearchEnabled}
        disabled={loading || !quickSearchEnabled}
        onChange={(e) => setSearch(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === 'Enter') onQuickSearch(search);
        }}
      />
      <div className="rcm-quick-search-addon rcm-quick-search-addon-search">
        <button
          className="rcm-quick-search-btn"
          onClick={() => {
            if (!isBlank(search)) onQuickSearch(search);
          }}
        >
          <IconSearch className="rcm-quick-search-icon" stroke={1} />
        </button>
      </div>
      {!isBlank(search) && (
        <div className="rcm-quick-search-addon rcm-quick-search-addon-clear">
          <button
            className="rcm-quick-search-btn"
            onClick={() => {
              setSearch('');
              onQuickSearch('');
            }}
          >
            <IconCircleX className="rcm-quick-search-icon" stroke={1} />
          </button>
        </div>
      )}
    </div>
  );
};
