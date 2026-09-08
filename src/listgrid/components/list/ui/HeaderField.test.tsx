import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { HeaderField } from './HeaderField';
import { SortField } from './SortField';
import { SearchForm } from '../../../form/SearchForm';
import { ListableFormField } from '../../fields/abstract/ListableFormField';
import { FieldType } from '../../../config/Config';
import { EntityForm } from '../../../config/EntityForm';

// project-manager PM-15 — the header label <span> had no click handler; only
// the SortField icon <button> toggled sort. Clicking the header text did
// nothing. These tests pin: (1) clicking the label toggles sort exactly like
// the icon, (2) the sort handler fires exactly once per click (no duplicate
// dispatch), (3) non-sortable columns stay inert.

class TestField extends ListableFormField<TestField> {
  constructor(name: string, order: number, type: FieldType = 'text') {
    super(name, order, type);
  }
  protected createInstance(name: string, order: number): TestField {
    return new TestField(name, order, this.type);
  }
  protected async renderInstance(): Promise<null> {
    return null;
  }
}

function makeSortableField(name = 'age', label = 'Age') {
  return new TestField(name, 1).useListField({ sortable: true, filterable: false }).withLabel(label);
}

function makeNonSortableField(name = 'note', label = 'Note') {
  return new TestField(name, 1).useListField({ sortable: false, filterable: false }).withLabel(label);
}

function renderHeader(opts: {
  fields: TestField[];
  searchForm: SearchForm;
  onChangeSearchForm: (searchForm: SearchForm, resetPage?: boolean) => void;
}) {
  // Host keeps searchForm in React state and re-renders with it — mirrors
  // how ViewListGrid actually drives HeaderField, so a sort click is visible
  // to the *next* assertion/click in the same test (e.g. icon toggling
  // DESC -> ASC -> off across clicks).
  function Host() {
    const [searchForm, setSearchForm] = React.useState(opts.searchForm);
    return (
      <table>
        <thead>
          <tr>
            <HeaderField
              fields={opts.fields}
              viewFields={[]}
              gridId="grid-1"
              searchForm={searchForm}
              entityForm={{} as EntityForm}
              sortable={true}
              onChangeSearchForm={(newSearchForm, resetPage) => {
                opts.onChangeSearchForm(newSearchForm, resetPage);
                setSearchForm(newSearchForm);
              }}
            />
          </tr>
        </thead>
      </table>
    );
  }
  return render(<Host />);
}

describe('HeaderField — whole header cell click target (PM-15)', () => {
  it('clicking the label text toggles sort, same as the icon', () => {
    const onChangeSearchForm = vi.fn();
    const field = makeSortableField('age', 'Age');
    const { getByText } = renderHeader({
      fields: [field],
      searchForm: SearchForm.create(),
      onChangeSearchForm,
    });

    fireEvent.click(getByText('Age'));

    expect(onChangeSearchForm).toHaveBeenCalledTimes(1);
    const [newSearchForm] = onChangeSearchForm.mock.calls[0]!;
    expect((newSearchForm as SearchForm).getSorts().get('age')).toBe('DESC');
  });

  it('label is rendered as a real <button> for keyboard access (Enter/Space)', () => {
    const onChangeSearchForm = vi.fn();
    const field = makeSortableField('age', 'Age');
    const { getByText } = renderHeader({
      fields: [field],
      searchForm: SearchForm.create(),
      onChangeSearchForm,
    });

    const label = getByText('Age');
    expect(label.tagName).toBe('BUTTON');
    expect(label.getAttribute('type')).toBe('button');
  });

  it('clicking the icon still toggles sort exactly once', () => {
    const onChangeSearchForm = vi.fn();
    const field = makeSortableField('age', 'Age');
    const { getByRole } = renderHeader({
      fields: [field],
      searchForm: SearchForm.create(),
      onChangeSearchForm,
    });

    const iconButton = getByRole('button', { name: '정렬 변경' });
    fireEvent.click(iconButton);

    expect(onChangeSearchForm).toHaveBeenCalledTimes(1);
    const [newSearchForm] = onChangeSearchForm.mock.calls[0]!;
    expect((newSearchForm as SearchForm).getSorts().get('age')).toBe('DESC');
  });

  it('label click and icon click are independent single dispatches (no double-fire)', () => {
    const onChangeSearchForm = vi.fn();
    const field = makeSortableField('age', 'Age');
    const { getByText, getByRole } = renderHeader({
      fields: [field],
      searchForm: SearchForm.create(),
      onChangeSearchForm,
    });

    fireEvent.click(getByText('Age'));
    expect(onChangeSearchForm).toHaveBeenCalledTimes(1);

    fireEvent.click(getByRole('button', { name: '정렬 변경 (현재 내림차순)' }));
    expect(onChangeSearchForm).toHaveBeenCalledTimes(2);
  });

  it('non-sortable column renders a plain <span> label and clicking it does nothing', () => {
    const onChangeSearchForm = vi.fn();
    const field = makeNonSortableField('note', 'Note');
    const { getByText, queryByRole } = renderHeader({
      fields: [field],
      searchForm: SearchForm.create(),
      onChangeSearchForm,
    });

    const label = getByText('Note');
    expect(label.tagName).toBe('SPAN');
    fireEvent.click(label);

    expect(onChangeSearchForm).not.toHaveBeenCalled();
    expect(queryByRole('button')).toBeNull();
  });
});

describe('SortField — sort handler called exactly once per click', () => {
  it('icon click calls onChangeSearchForm exactly once', () => {
    const onChangeSearchForm = vi.fn();
    const { getByRole } = render(
      <SortField
        name="age"
        searchForm={SearchForm.create()}
        onChangeSearchForm={onChangeSearchForm}
      />,
    );

    fireEvent.click(getByRole('button'));

    expect(onChangeSearchForm).toHaveBeenCalledTimes(1);
  });
});
