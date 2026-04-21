'use client';

import { InputRendererProps, ManyToOneConfig } from '../../../config/Config';
import { EntityForm } from '../../../config/EntityForm';
import { SubmitFormData } from '../../../config/EntityFormTypes';
import { useEffect, useState } from 'react';
import { LoadingOverlay } from '../../../ui';
import { useModalManagerStore } from '../../../store';
import { ViewListGrid } from '../../list/ViewListGrid';
import { ListGrid } from '../../../config/ListGrid';
import { FilterItem, SearchForm } from '../../../form/SearchForm';
import { isEmpty } from '../../../utils';
import { ManyToOneField } from '../ManyToOneField';
import { DatetimeField } from '../DatetimeField';
import { ViewEntityForm } from '../../form/ViewEntityForm';
import { PageResult } from '../../../form/Type';
import { StringField } from '../StringField';
import { EntityFormButton } from '../../../config/EntityFormButton';
import { fDate, fDateTime } from '../../../misc';
import { isTrue } from '../../../utils/BooleanUtil';
import { ViewListProps } from '../abstract';
import { Tooltip } from '../../../ui';
import { Paper } from '../../../ui';

interface XrefAvailableDateMappingViewProps extends InputRendererProps {
  entityForm: EntityForm;
  requiredAvailable?: boolean;
  parentEntityForm?: EntityForm;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>);
}

export interface XrefAvailableDateMappingValue {
  mapped?: XrefAvailableDateValue[];
}

export interface XrefAvailableDateValue {
  id: string;
  availableAt?: string;
  availableUntil?: string;
}

const AvailableMappingEntityForm = (mapping: {
  value?: XrefAvailableDateValue[] | undefined;
  config: ManyToOneConfig;
  name: string;
  label: string;
  requiredAvailable: boolean;
  filter?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
  parentEntityForm?: EntityForm | undefined;
}): EntityForm => {
  const mappingField = new ManyToOneField(mapping.name, 100, mapping.config)
    .withLabel(mapping.label)
    .withRequired(true);

  if (mapping.value !== undefined) {
    const exceptIds: string[] = [];
    mapping.value.forEach((value) => {
      exceptIds.push(value.id);
    });
    if (exceptIds.length > 0) {
      if (mappingField.config.filter === undefined) {
        mappingField.config.filter = [];
      }
      mappingField.config.filter.push(async (entityForm: EntityForm) => {
        const filterItems: FilterItem[] = [];
        if (!isEmpty(exceptIds)) {
          filterItems.push({ name: 'id', queryConditionType: 'NOT_IN', values: exceptIds });
        }
        if (mapping.filter !== undefined) {
          if (typeof mapping.filter === 'function') {
            const filterItems = await mapping.filter(entityForm, mapping.parentEntityForm);
            filterItems.push(...filterItems);
          } else {
            filterItems.push(...mapping.filter);
          }
        }

        return Promise.resolve(filterItems);
      });
    }
  }

  return new EntityForm('유효기간', '').addFields({
    items: [
      mappingField,
      new DatetimeField('available', 200, undefined, true)
        .withLabel('유효기간')
        .withRequired(mapping.requiredAvailable),
    ],
  });
};

function getDatetimeFromMappingValue(value?: string) {
  const available: Date[] = [];

  if (value) {
    const availableArrays = value.split(' ~ ');
    available.push(new Date(availableArrays[0]!));
    available.push(new Date(availableArrays[1]!));
  }

  return available;
}

function getCroppedDate(value: string): string {
  const available = getDatetimeFromMappingValue(value);

  return fDate(available[0]!) + ' ~ ' + fDate(available[1]!);
}

export const XrefAvailableDateMappingView = ({
  entityForm,
  ...props
}: XrefAvailableDateMappingViewProps) => {
  const requiredAvailable = isTrue(props.requiredAvailable);
  const readonly = props.readonly ?? false;
  const label = props.label;
  let labelText;
  if (label) {
    if (typeof label === 'string') {
      labelText = label ?? '유효기간 관리';
    } else {
      labelText = '유효기간 관리';
    }
  }

  const { openModal, closeModal } = useModalManagerStore();
  const [value, setValue] = useState<XrefAvailableDateMappingValue>(props.value);
  const [listKey, setListKey] = useState<string>('init');
  const [onEditEntityForm, setOnEditEntityForm] = useState<EntityForm>();

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

  const mappingValue: XrefAvailableDateMappingValue = {};

  function setValueAndReload(val: XrefAvailableDateMappingValue) {
    setValue(val);
    setOnEditEntityForm(undefined);
    setListKey(new Date().getTime().toString());
    props.onChange(val, false);
  }

  if (value !== undefined) {
    mappingValue.mapped = value.mapped ?? [];
  }

  const viewSearchForm: SearchForm = new SearchForm().withPageSize(1000);
  if (mappingValue.mapped !== undefined && mappingValue.mapped.length > 0) {
    const idList: string[] = [];

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

  const xrefEntityForm = AvailableMappingEntityForm({
    value: mappingValue.mapped,
    config: {
      entityForm: entityForm,
    },
    name: 'mapping',
    label: labelText!,
    requiredAvailable: requiredAvailable,
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

    const availableValue = await entityForm.getValue('available');

    if (
      requiredAvailable &&
      (availableValue === undefined ||
        !Array.isArray(availableValue) ||
        availableValue.length !== 2)
    ) {
      // 값이 잘못 들어왔다.
      return {
        entityForm: form.withErrors([
          {
            name: 'available',
            label: labelText!,
            errors: ['시작일과 종료일을 정확히 선택하세요.'],
          },
        ]),
        errors: ['유효기간을 잘못 입력했습니다.'],
      };
    }

    return Promise.resolve({ entityForm });
  });

  if (viewSearchForm === undefined) {
    return (
      <div className={'relative'}>
        <div
          className={`panel p-4 flex-1 gap-2.5 mt-5 border dark:border-[#17263c] rounded-xl shadow-none space-y-2`}
        >
          <LoadingOverlay visible={true} />
          <div className={'w-full h-[400px]'}></div>
        </div>
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
          onSelect: (item: any) => {
            const available: Date[] = getDatetimeFromMappingValue(item['mapping-available']);

            xrefEntityForm.id = item['id'];
            xrefEntityForm.setValue('mapping', item); // mapping 에 item 을 통째로 넣는다.
            xrefEntityForm.setValue('available', available);

            setOnEditEntityForm(xrefEntityForm);

            handleOpenModal(xrefEntityForm);
          },
          fields: [
            new StringField('mapping-available', 10000)
              .withLabel('유효기간')
              .withListConfig({
                support: true,
                filterable: false,
                sortable: false,
                align: 'center',
              })
              .withOverrideRenderListItem(async (props: ViewListProps) => {
                return {
                  result: (
                    <div className={'w-full flex items-center justify-center'}>
                      {props.item['mapping-available'] === undefined ? (
                        '항상'
                      ) : (
                        <Tooltip label={`${props.item['mapping-available']}`}>
                          <div>{getCroppedDate(props.item['mapping-available'])}</div>
                        </Tooltip>
                      )}
                    </div>
                  ),
                };
              }),
          ],
          onFetched: async (result: PageResult) => {
            // 필드의 값을 추가한다.
            if (mappingValue.mapped && mappingValue.mapped.length > 0) {
              result.list.forEach((item) => {
                for (const mapped of mappingValue.mapped!) {
                  if (item['id'] === mapped.id) {
                    if (mapped.availableAt !== undefined && mapped.availableUntil !== undefined) {
                      item['mapping-available'] =
                        `${fDateTime(mapped.availableAt)} ~ ${fDateTime(mapped.availableUntil)}`;
                    }
                  }
                }
              });
            }
            return result;
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
            add: false,
            delete: true,
            modifyOnView: false,
            buttons: [
              () => (
                <button
                  type="button"
                  className={`btn btn-outline-secondary h-[34px]`}
                  disabled={readonly}
                  onClick={() => {
                    handleOpenModal();
                  }}
                >
                  등록
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

    setValue({ ...mappingValue });
    setOnEditEntityForm(undefined);
    setListKey(new Date().getTime().toString());
    props.onChange(mappingValue, false);
  }

  function handleOpenModal(editEntityForm?: EntityForm) {
    const modalId = `xref-available-date-mapping-${props.name}`;
    const currentEntityForm = editEntityForm ?? xrefEntityForm;

    openModal({
      modalId,
      title: String(label || '유효기간 관리'),
      size: '2xl',
      content: (
        <Paper key={listKey}>
          <ViewEntityForm
            entityForm={currentEntityForm}
            hideTitle={true}
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
              const mappedValue = await entityForm.getValue('mapping');
              const availableValue = await entityForm.getValue('available');

              mappingValue.mapped = mappingValue.mapped ?? [];
              if (mappedValue.id) {
                if (
                  availableValue !== undefined &&
                  Array.isArray(availableValue) &&
                  availableValue.length === 2
                ) {
                  mappingValue.mapped.push({
                    id: mappedValue.id,
                    availableAt: availableValue[0],
                    availableUntil: availableValue[1],
                  });
                } else {
                  mappingValue.mapped.push({ id: mappedValue.id });
                }
              }

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
