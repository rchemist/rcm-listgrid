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
import { useModalManagerStore } from '../../../store';

interface XrefPriorityMappingViewProps extends InputRendererProps {
  entityForm: EntityForm;
  excludeId?: string | undefined;
  add?: boolean | undefined; // 대상 entity 의 새로운 데이터를 추가할 수 있는지 여부
  parentEntityForm?: EntityForm | undefined;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
}

export interface XrefPriorityMappingValue {
  mapped?: XrefPriorityValue[] | undefined;
}

interface XrefPriorityValue {
  id: string;
  priority: number;
}

export const XrefPriorityMappingView = ({
  entityForm,
  excludeId,
  add,
  parentEntityForm,
  ...props
}: XrefPriorityMappingViewProps) => {
  const readonly = props.readonly ?? false;
  const label = props.label;

  const { openModal, closeModal } = useModalManagerStore();
  const [value, setValue] = useState<XrefPriorityMappingValue>(props.value);
  const [listKey, setListKey] = useState<string>('init');

  const mappingValue: XrefPriorityMappingValue = {};

  if (value !== undefined) {
    mappingValue.mapped = value.mapped ?? [];
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
      })();
    }
  }, [props.filters]);

  // Lookup 으로 찾기를 실행했을 때 표시할 그리드
  const searchForm: SearchForm = new SearchForm();
  if (excludeId) {
    // excludeId 값이 있다면 해당 조건을 추가한다.
    searchForm.withFilter('AND', { name: 'id', queryConditionType: 'NOT_EQUAL', value: excludeId });
  }

  // 현재 매핑된 정보만 표시하는 서치폼
  const viewSearchForm: SearchForm = new SearchForm().withPageSize(1000);
  if (mappingValue.mapped !== undefined && mappingValue.mapped.length > 0) {
    // 이미 매핑된 정보는 확인할 수 없게 한다.
    const idList: string[] = mappingValue.mapped.map((m) => m.id);

    searchForm.withFilter('AND', { name: 'id', queryConditionType: 'NOT_IN', values: idList });

    // viewSearchForm 에서는 이미 매핑된 정보만 표시되도록 한다.
    viewSearchForm.withFilter('AND', { name: 'id', queryConditionType: 'IN', values: idList });
  } else {
    // viewSearchForm 은 반드시 empty 를 리턴하게 한다.
    viewSearchForm.withShouldReturnEmpty(true);
  }

  if (filters.length > 0) {
    searchForm.withFilter('AND', ...filters);
    viewSearchForm.withFilter('AND', ...filters);
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
          onFetched: async (pageResult) => {
            if (!isEmpty(pageResult.list)) {
              // mappingValue 의 순서대로 결과를 재정렬한다.
              const newList: any[] = [];
              mappingValue.mapped?.forEach((mapped) => {
                for (const item of pageResult.list) {
                  if (mapped.id === item.id) {
                    newList.push(item);
                    break;
                  }
                }
              });
              pageResult.list = newList;
            }
            return pageResult;
          },
          onDrag: (idList: string[]) => {
            if (!isEmpty(idList)) {
              const newValue: XrefPriorityMappingValue = { mapped: value.mapped };

              // how to sort mapped.id === idList[index]
              newValue.mapped = newValue.mapped?.sort((a, b) => {
                const aIndex = idList.indexOf(a.id);
                const bIndex = idList.indexOf(b.id);
                return aIndex - bIndex;
                // return a.priority - b.priority;
              });
              newValue.mapped?.forEach((m, index) => {
                m.priority = index + 1;
              });
              setValue(newValue);

              props.onChange(newValue, false);
            }
          },
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
                      const modalId = `xref-priority-mapping-${props.name}`;
                      openModal({
                        modalId,
                        title: String(label || '선택'),
                        size: '2xl',
                        content: (
                          <Paper>
                            <ViewListGrid
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
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    mappingValue.mapped = mappingValue.mapped.filter((x) => x.id !== id);
    const newPriority = mappingValue.mapped.length + 1;
    mappingValue.mapped = [...mappingValue.mapped, { id: id, priority: newPriority }];

    setValue({ ...mappingValue });
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }

  function onChangeMultiple(ids: string[]) {
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    for (const id of ids) {
      mappingValue.mapped = mappingValue.mapped.filter((x) => x.id !== id);
      const newPriority: number = mappingValue.mapped.length + 1;
      mappingValue.mapped = [...mappingValue.mapped, { id: id, priority: newPriority }];
    }

    setValue({ ...mappingValue });
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }

  function onDelete(idList: string[]) {
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    mappingValue.mapped = mappingValue.mapped.filter((x) => !idList.includes(x.id));

    // priority 재설정
    mappingValue.mapped.forEach((m, index) => {
      m.priority = index + 1;
    });

    setValue({ ...mappingValue });
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }
};
