import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { EntireChecker } from './EntireChecker';

// 0.3.14 — regression test for the stale-closure bug where checkAllItems
// passed the *previous* checkedItems to onSelectionChange instead of the
// newly computed list. Surfaced via project-manager Sprint 31h F.4 — host
// BulkToolbar gate (selectedIds.size > 0) never triggered on master-checkbox
// click because the callback always received the old [].

describe('EntireChecker — onSelectionChange propagation (0.3.14 regression)', () => {
  function renderChecker(props: {
    initialChecked: string[];
    listIds: string[];
    onChange: (next: string[], rows: any[]) => void;
  }) {
    function Host() {
      const [checked, setChecked] = React.useState<string[]>(props.initialChecked);
      return (
        <table>
          <thead>
            <tr>
              <th>
                <EntireChecker
                  total={props.listIds.length}
                  listIds={props.listIds}
                  checkedItems={checked}
                  setCheckedItems={setChecked}
                  showCheckboxInput={true}
                  selectionOptions={{
                    enabled: true,
                    onSelectionChange: props.onChange,
                  }}
                  rows={props.listIds.map((id) => ({ id }))}
                />
              </th>
            </tr>
          </thead>
        </table>
      );
    }
    return render(<Host />);
  }

  it('master checkbox click on an unchecked list fires onSelectionChange with ALL ids (not the old empty array)', () => {
    const onChange = vi.fn();
    const { container } = renderChecker({
      initialChecked: [],
      listIds: ['a', 'b', 'c'],
      onChange,
    });
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
    const [newChecked, rows] = onChange.mock.calls[0]!;
    expect(newChecked).toEqual(['a', 'b', 'c']);
    expect(rows).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  });

  it('master checkbox click on a fully-checked list fires onSelectionChange with [] (not the old all-checked array)', () => {
    const onChange = vi.fn();
    const { container } = renderChecker({
      initialChecked: ['a', 'b', 'c'],
      listIds: ['a', 'b', 'c'],
      onChange,
    });
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
    const [newChecked] = onChange.mock.calls[0]!;
    expect(newChecked).toEqual([]);
  });
});
