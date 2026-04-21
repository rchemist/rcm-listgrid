'use client';

import {
  ALWAYS,
  InputRendererProps,
  ManyToOneConfig,
  MODIFY_ONLY,
  NO_FILTER_SORT_ON_LIST,
  ViewPreset,
} from '../../../config/Config';
import { EntityForm } from '../../../config/EntityForm';
import { SubmitFormData } from '../../../config/EntityFormTypes';
import React, { useEffect, useState } from 'react';
import { Paper } from '../../../ui';
import { useModalManagerStore } from '../../../store';
import { ViewListGrid } from '../../list/ViewListGrid';
import { ListGrid } from '../../../config/ListGrid';
import { FilterItem, SearchForm } from '../../../form/SearchForm';
import { isEmpty } from '../../../utils';
import { ManyToOneField } from '../ManyToOneField';
import { ViewEntityForm } from '../../form/ViewEntityForm';
import { PageResult } from '../../../form/Type';
import { isTrue } from '../../../utils/BooleanUtil';
import { BooleanField } from '../BooleanField';
import { EntityFormButton } from '../../../config/EntityFormButton';
import { ShowNotifications } from '../../helper/ShowNotifications';
import { isBlank } from '../../../utils/StringUtil';

interface XrefPreferMappingViewProps extends InputRendererProps {
  entityForm: EntityForm;
  showPreferred?: boolean | undefined;
  parentEntityForm?: EntityForm | undefined;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
  preferredLabel?: string | undefined;
}

export interface XrefPreferMappingValue {
  mapped?: XrefPreferValue[] | undefined;
}

interface XrefPreferValue {
  id: string;
  preferred?: boolean | undefined;
}

const PreferredMappingEntityForm = (mapping: {
  config: ManyToOneConfig;
  value?: XrefPreferValue[] | undefined;
  name: string;
  label: string;
  exceptId?: any[] | undefined;
  preferredViewPreset: ViewPreset;
  preferredLabel?: string | undefined;
}): EntityForm => {
  return new EntityForm(mapping.label, '').addFields({
    items: [
      new ManyToOneField(mapping.name, 100, mapping.config)
        .withLabel(mapping.label)
        .withRequired(true),
      new BooleanField('preferred', 200)
        .withLabel(mapping.preferredLabel ?? '기본값')
        .withViewPreset(mapping.preferredViewPreset)
        .withDefaultValue(false)
        .withListConfig(NO_FILTER_SORT_ON_LIST),
    ],
  });
};

export const XrefPreferMappingView = ({ entityForm, ...props }: XrefPreferMappingViewProps) => {
  const readonly = props.readonly ?? false;
  const preferredViewPreset: ViewPreset = isTrue(props.showPreferred, true) ? ALWAYS : MODIFY_ONLY;
  const label = props.label;
  let labelText;
  if (label) {
    if (typeof label === 'string') {
      labelText = label ?? '기본값';
    } else {
      labelText = '기본값';
    }
  }

  const { openModal, closeModal } = useModalManagerStore();
  const [value, setValue] = useState<XrefPreferMappingValue>(props.value);
  const [listKey, setListKey] = useState<string>('init');
  const [onEditEntityForm, setOnEditEntityForm] = useState<EntityForm>();
  const [notification, setNotification] = useState('');

  const mappingValue: XrefPreferMappingValue = {};
  const [filters, setFilters] = useState<FilterItem[]>([]);

  useEffect(() => {
    if (props.filters) {
      (async () => {
        if (typeof props.filters === 'function') {
          const filters = await props.filters(entityForm, props.parentEntityForm);
          setFilters(filters);
        } else {
          setFilters(props.filters ?? []);
        }
      })();
    }
  }, [props.filters]);
  function setValueAndReload(val: XrefPreferMappingValue) {
    setValue(val);
    setOnEditEntityForm(undefined);
    setListKey(new Date().getTime().toString());
    setNotification('저장 버튼을 눌러야 실제 데이터에 반영됩니다.');
    props.onChange(val, false);
  }

  if (value !== undefined) {
    mappingValue.mapped = value.mapped ?? [];
  }

  const idList: string[] = [];

  const viewSearchForm: SearchForm = new SearchForm().withPageSize(1000);
  if (mappingValue.mapped !== undefined && mappingValue.mapped.length > 0) {
    // 이미 매핑된 정보는 확인할 수 없게 한다.
    idList.push(...mappingValue.mapped.map((mapped) => mapped.id).filter(Boolean));

    // viewSearchForm 에서는 이미 매핑된 정보만 표시되도록 한다.
    viewSearchForm.withFilter('AND', { name: 'id', queryConditionType: 'IN', values: idList });
  } else {
    // viewSearchForm 은 반드시 empty 를 리턴하게 한다.
    viewSearchForm.withShouldReturnEmpty(true);
  }

  if (filters.length > 0) {
    viewSearchForm.withFilter('AND', ...filters);
  }

  const xrefFilter =
    isEmpty(idList) && filters.length === 0
      ? undefined
      : [
          (entityForm: EntityForm) => {
            const filterItems: FilterItem[] = [];
            if (!isEmpty(idList)) {
              filterItems.push({ name: 'id', queryConditionType: 'NOT_IN', values: idList });
            }
            if (filters.length > 0) {
              filterItems.push(...filters);
            }
            return Promise.resolve(filterItems);
          },
        ];
  const xrefEntityForm = PreferredMappingEntityForm({
    value: mappingValue.mapped,
    config: {
      entityForm: entityForm,
      ...(xrefFilter !== undefined ? { filter: xrefFilter } : {}),
    },
    name: 'mapping',
    label: labelText!,
    exceptId: idList,
    preferredViewPreset: preferredViewPreset,
  }).withOnSave(async (entityForm) => {
    const form = entityForm.clone(true);

    const fieldErrors = await entityForm.validate();

    if (!isEmpty(fieldErrors)) {
      return { entityForm: form.withErrors(fieldErrors), errors: ['입력 값이 올바르지 않습니다.'] };
    }

    const formData: SubmitFormData = await form.getSubmitFormData();

    const target = formData.data['mapping'];

    if (!isEmpty(mappingValue.mapped)) {
      let duplicated = false;
      for (const item of mappingValue.mapped!) {
        if (item.id === target) {
          // 같은 값이 있으면 오류로 인식한다.
          duplicated = true;
          break;
        }
      }

      if (duplicated) {
        // 에러를 내야 한다.
        return {
          entityForm: form.withErrors([
            {
              name: 'mapping',
              label: labelText!,
              errors: ['이미 등록된 정보입니다.'],
            },
          ]),
          errors: ['이미 등록된 정보입니다.'],
        };
      }
    }

    const preferred: any = await entityForm.getValue('preferred');

    mappingValue.mapped = mappingValue.mapped ?? [];
    mappingValue.mapped.push({ id: target, preferred: isTrue(preferred) });

    if (mappingValue.mapped.length > 0) {
      // preferred 가 무조건 단 하나는 있어야 한다.
      let found = false;
      for (const item of mappingValue.mapped) {
        if (item.id === target) {
          found = true;
          break;
        }
      }
      if (!found) {
        mappingValue.mapped[0]!.preferred = true;
      }
    }

    return Promise.resolve({ entityForm });
  });

  return (
    <div className={'w-full'}>
      {!isBlank(notification) && (
        <ShowNotifications messages={[notification]} color={'info'} showClose={true} />
      )}
      {/*현재 매핑된 필터만 표시하는 리스트 그리드*/}
      <ViewListGrid
        key={listKey}
        listGrid={new ListGrid(entityForm).withSearchForm(viewSearchForm)}
        options={{
          hideTitle: true,
          filterable: false,
          sortable: false,
          onSelect: (item: any) => {
            const id = item['id'];

            xrefEntityForm.setValue('id', id);
            xrefEntityForm.setValue('preferred', [item['preferred']]);

            setOnEditEntityForm(xrefEntityForm);
            handleOpenModal(xrefEntityForm);
          },
          fields: [
            new BooleanField('preferred', 10000)
              .withLabel(`기본 ${labelText}`)
              .withSortable(false)
              .withFilterable(false),
          ],
          onFetched: async (result: PageResult) => {
            // 필드의 값을 추가한다.
            if (mappingValue.mapped && mappingValue.mapped.length > 0) {
              result.list.forEach((item) => {
                for (const mapped of mappingValue.mapped!) {
                  if (item['id'] === mapped.id) {
                    item['preferred'] = mapped.preferred;
                  }
                }
              });
            }
            return result;
          },
          delete: {
            onDelete: async (_entityForm: EntityForm, _rows, checkedItems: string[]) => {
              if (!isEmpty(checkedItems)) {
                onDelete(checkedItems);
              }
              return Promise.resolve({ entityForm: _entityForm });
            },
          },
          subCollection: {
            add: false,
            delete: true,
            modifyOnView: false,
            buttons: [
              () => (
                <button
                  type="button"
                  className={`btn btn-outline-secondary`}
                  disabled={readonly}
                  onClick={() => {
                    handleOpenModal();
                  }}
                >
                  불러오기
                </button>
              ),
            ],
          },
        }}
      ></ViewListGrid>
    </div>
  );

  function onDelete(idList: string[]) {
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    mappingValue.mapped = mappingValue.mapped.filter((x) => !idList.includes(x.id));

    if (mappingValue.mapped.length > 0) {
      let found = false;
      for (const item of mappingValue.mapped!) {
        if (isTrue(item.preferred)) {
          found = true;
          break;
        }
      }

      if (!found) {
        mappingValue.mapped[0]!.preferred = true;
      }
    }

    setValue({ ...mappingValue });
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }

  function handleOpenModal(editEntityForm?: EntityForm) {
    const modalId = `xref-prefer-mapping-${props.name}`;
    const currentEntityForm = editEntityForm ?? xrefEntityForm;

    openModal({
      modalId,
      title: String(label || '기본값'),
      size: '5xl',
      content: (
        <Paper key={listKey}>
          <ViewEntityForm
            entityForm={currentEntityForm}
            readonly={editEntityForm !== undefined}
            excludeButtons={editEntityForm !== undefined ? ['delete', 'save'] : ['delete']}
            buttons={[
              new EntityFormButton('list')
                .withLabel('닫기')
                .withClassName('btn btn-outline-primary gap-2')
                .withOnClick(async (props) => {
                  closeModal(modalId);
                  setOnEditEntityForm(undefined);
                  return props.entityForm;
                }),
            ]}
            postSave={async (entityForm) => {
              // onSave에서 이미 mappingValue.mapped에 추가 완료
              setValueAndReload({ ...mappingValue });
              closeModal(modalId);

              return entityForm;
            }}
          />
        </Paper>
      ),
      onClose: () => {
        setOnEditEntityForm(undefined);
      },
    });
  }
};
