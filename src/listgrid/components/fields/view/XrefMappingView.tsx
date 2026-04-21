'use client';

import { InputRendererProps } from '../../../config/Config';
import { EntityForm } from '../../../config/EntityForm';
import { useEffect, useState } from 'react';
import { Paper } from '../../../ui';
import { ViewListGrid } from '../../list/ViewListGrid';
import { ListGrid } from '../../../config/ListGrid';
import { FilterItem, SearchForm } from '../../../form/SearchForm';
import { isEmpty } from '../../../utils';
import { isTrue } from '../../../utils/BooleanUtil';
// TODO: Fix this import - should use ui package component
// import Loading from "@/app/loading";
import { LoadingOverlay as Loading } from '../../../ui';
import { useModalManagerStore } from '../../../store';

interface XrefMappingViewProps extends InputRendererProps {
  entityForm: EntityForm;
  excludeId?: string | undefined;
  add?: boolean | undefined;
  parentEntityForm?: EntityForm | undefined;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
}

export interface XrefMappingValue {
  mapped?: string[];
  deleted?: string[];
}

export const XrefMappingView = ({
  entityForm,
  excludeId,
  add,
  parentEntityForm,
  ...props
}: XrefMappingViewProps) => {
  const readonly = props.readonly ?? false;
  const label = props.label;

  const [loading, setLoading] = useState(true);
  const { openModal, closeModal } = useModalManagerStore();
  const [value, setValue] = useState<XrefMappingValue>(props.value);
  const [listKey, setListKey] = useState<string>('init');

  const mappingValue: XrefMappingValue = {};
  if (value !== undefined) {
    mappingValue.mapped = value.mapped ?? [];
    mappingValue.deleted = value.deleted ?? [];
  }

  const [filters, setFilters] = useState<FilterItem[]>([]);

  useEffect(() => {
    if (props.filters) {
      (async () => {
        if (typeof props.filters === 'function') {
          const filters = await props.filters(entityForm, parentEntityForm);
          setFilters(filters);
        } else {
          setFilters(props.filters ?? []);
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [props.filters]);

  // lookup 버튼을 눌렀을 때 선택할 수 있는 그리드를 표시할 때 사용한다.
  const searchForm: SearchForm = new SearchForm();
  if (excludeId) {
    // excludeId 값이 있다면 해당 조건을 추가한다.
    searchForm.withFilter('AND', { name: 'id', queryConditionType: 'NOT_EQUAL', value: excludeId });
  }

  // 현재 선택된 값을 리스트로 보여 주는 용도로 사용된다.
  const viewSearchForm: SearchForm = new SearchForm().withPageSize(1000);
  if (mappingValue.mapped !== undefined && mappingValue.mapped.length > 0) {
    // 이미 매핑된 정보는 확인할 수 없게 한다.
    searchForm.withFilter('AND', {
      name: 'id',
      queryConditionType: 'NOT_IN',
      values: mappingValue.mapped,
    });

    // viewSearchForm 에서는 이미 매핑된 정보만 표시되도록 한다.
    viewSearchForm.withFilter('AND', {
      name: 'id',
      queryConditionType: 'IN',
      values: mappingValue.mapped,
    });
  } else {
    // viewSearchForm 은 반드시 empty 를 리턴하게 한다.
    viewSearchForm.withShouldReturnEmpty(true);
  }

  if (filters.length > 0) {
    searchForm.withFilter('AND', ...filters);
    viewSearchForm.withFilter('AND', ...filters);
  }

  if (loading) {
    return (
      <div className={'w-full'}>
        <Loading />
      </div>
    );
  }

  return (
    <div className={'w-full'}>
      {/*현재 매핑된 필터만 표시하는 리스트 그리드*/}
      <ViewListGrid
        key={listKey}
        listGrid={new ListGrid(entityForm).withSearchForm(viewSearchForm)}
        options={{
          hideTitle: true,
          filterable: false,
          sortable: false,
          delete: {
            onDelete: async (_entityForm: EntityForm, _rows: any[], checkedItems: string[]) => {
              if (!isEmpty(checkedItems)) {
                onDelete(checkedItems);
              }
              return Promise.resolve({ entityForm: _entityForm });
            },
          },
          subCollection: {
            add: readonly ? false : isTrue(add),
            delete: !readonly,
            modifyOnView: false,
            buttons: [
              () =>
                readonly ? null : (
                  <button
                    type="button"
                    className={`btn btn-outline-secondary h-[34px]`}
                    disabled={readonly}
                    onClick={() => {
                      const modalId = `xref-mapping-${props.name}`;
                      openModal({
                        modalId,
                        title: String(label || '선택'),
                        size: '2xl',
                        content: (
                          <Paper>
                            <ViewListGrid
                              key={`${listKey}-modal`}
                              listGrid={new ListGrid(entityForm).withSearchForm(searchForm)}
                              options={{
                                readonly: true,
                                popup: true,
                                hideTitle: true,
                                onSelect: (item) => {
                                  // Single row click: add one item and close modal
                                  onChange(item.id);
                                  closeModal(modalId);
                                },
                                selection: {
                                  enabled: true,
                                  actions: [
                                    {
                                      label: '선택 완료',
                                      onClick: async (_entityForm, checkedItems) => {
                                        onChangeMultiple(checkedItems);
                                        closeModal(modalId);
                                      },
                                      color: 'primary',
                                    },
                                  ],
                                  deleteButton: false,
                                },
                              }}
                            />
                          </Paper>
                        ),
                      });
                    }}
                  >
                    선택
                  </button>
                ),
            ],
          },
        }}
      ></ViewListGrid>
    </div>
  );

  function onChange(id: string) {
    if (mappingValue.deleted === undefined) {
      mappingValue.deleted = [];
    }
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    mappingValue.mapped = mappingValue.mapped.filter((x) => x !== id);
    mappingValue.deleted = mappingValue.deleted.filter((x) => x !== id);

    mappingValue.mapped = [...mappingValue.mapped, id];

    setValue({ ...mappingValue });
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }

  function onChangeMultiple(ids: string[]) {
    if (mappingValue.deleted === undefined) {
      mappingValue.deleted = [];
    }
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    for (const id of ids) {
      mappingValue.mapped = mappingValue.mapped.filter((x) => x !== id);
      mappingValue.deleted = mappingValue.deleted.filter((x) => x !== id);
      mappingValue.mapped = [...mappingValue.mapped, id];
    }

    setValue({ ...mappingValue });
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }

  function onDelete(idList: string[]) {
    if (mappingValue.deleted === undefined) {
      mappingValue.deleted = [];
    }
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    mappingValue.mapped = mappingValue.mapped.filter((x) => !idList.includes(x));
    mappingValue.deleted = mappingValue.deleted.filter((x) => !idList.includes(x));

    mappingValue.deleted = [...mappingValue.deleted, ...idList];

    setValue({ ...mappingValue });
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }
};
