'use client';
import {
  ALWAYS,
  InputRendererProps,
  ManyToOneConfig,
  NO_FILTER_SORT_ON_LIST,
  ViewPreset,
} from '../../../config/Config';
import { EntityForm } from '../../../config/EntityForm';
import { SubmitFormData } from '../../../config/EntityFormTypes';
import { useEffect, useState } from 'react';
import { Paper } from '../../../ui';
import { LoadingOverlay } from '../../../ui';
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
import { NumberField } from '../NumberField';
import { generateUUID } from '../../../utils/simpleCrypt';
import { isBlank } from '../../../utils/StringUtil';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface XrefPriceMappingViewProps extends InputRendererProps {
  entityForm: EntityForm;
  parentEntityForm?: EntityForm | undefined;
  initPrice: (entityForm: EntityForm, rowValue: any) => Promise<void>;
  priceHelpText?: string | undefined;
  filters?:
    | FilterItem[]
    | ((entityForm: EntityForm, parentEntityForm?: EntityForm) => Promise<FilterItem[]>)
    | undefined;
}

export interface XrefPriceMappingValue {
  mapped?: XrefPriceValue[] | undefined;
}

interface XrefPriceValue {
  id: string;
  price?: number | undefined;
}

const PriceMappingEntityForm = (
  label: string,
  mapping: {
    config: ManyToOneConfig;
    name: string;
    label: string;
    helpText?: string;
    exceptId?: any[];
    priceViewPreset: ViewPreset;
  },
): EntityForm => {
  return new EntityForm(label, '').addFields({
    items: [
      new ManyToOneField(mapping.name, 100, mapping.config)
        .withLabel(mapping.label)
        .withRequired(true),
      new NumberField('price', 200)
        .withLabel('가격')
        .withHelpText(mapping.helpText)
        .withViewPreset(mapping.priceViewPreset)
        .withDefaultValue(false)
        .withListConfig(NO_FILTER_SORT_ON_LIST),
    ],
  });
};

export const XrefPriceMappingView = ({
  entityForm,
  parentEntityForm,
  ...props
}: XrefPriceMappingViewProps) => {
  const readonly = props.readonly ?? false;
  const priceViewPreset: ViewPreset = ALWAYS;
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
  const [value, setValue] = useState<XrefPriceMappingValue>(props.value);
  const [listKey, setListKey] = useState<string>('init');
  const [viewSearchForm, setViewSearchForm] = useState<SearchForm>();
  const [idList, setIdList] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const MySwal = withReactContent(Swal);

  const mappingValue: XrefPriceMappingValue = {};
  const [filters, setFilters] = useState<FilterItem[]>([]);

  if (value !== undefined) {
    mappingValue.mapped = value.mapped ?? [];
  }

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

  useEffect(() => {
    if (value.mapped === undefined || value.mapped.length === 0) {
      const newViewSearchForm = new SearchForm().withShouldReturnEmpty(true);
      setViewSearchForm(newViewSearchForm);
      setListKey(new Date().getTime().toString());
      return;
    }

    for (const mapped of value.mapped) {
      if (!idList.includes(mapped.id)) {
        idList.push(mapped.id);
      }
    }

    setIdList([...idList]);
    setListKey(new Date().getTime().toString());
    const newViewSearchForm = viewSearchForm
      ?.clone()
      .removeFilter('id')
      .withShouldReturnEmpty(false)
      .withFilter('AND', { name: 'id', values: idList, queryConditionType: 'IN' });
    setViewSearchForm(newViewSearchForm);
  }, [value]);

  useEffect(() => {
    const viewSearchForm: SearchForm = new SearchForm().withPageSize(1000);
    const idList: string[] = [];
    if (mappingValue.mapped !== undefined && mappingValue.mapped.length > 0) {
      // 이미 매핑된 정보는 확인할 수 없게 한다.
      idList.push(...mappingValue.mapped.map((mapped) => mapped.id).filter(Boolean));

      // viewSearchForm 에서는 이미 매핑된 정보만 표시되도록 한다.
      viewSearchForm.withFilter('AND', { name: 'id', queryConditionType: 'IN', values: idList });
      viewSearchForm.withIgnoreCache(true);
    } else {
      // viewSearchForm 은 반드시 empty 를 리턴하게 한다.
      viewSearchForm.withShouldReturnEmpty(true);
    }

    setIdList(idList);
    setViewSearchForm(viewSearchForm);
  }, [props.value]);

  if (filters.length > 0) {
    viewSearchForm?.withFilter('AND', ...filters);
  }

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

  const xrefEntityForm = PriceMappingEntityForm(labelText!, {
    config: {
      entityForm: entityForm,
      filter: isEmpty(idList)
        ? [
            (entityForm: EntityForm) => {
              const filterItems: FilterItem[] = [];
              if (filters.length > 0) {
                filterItems.push(...filters);
              }
              filterItems.push({ name: 'id', queryConditionType: 'NOT_NULL' });
              return Promise.resolve(filterItems);
            },
          ]
        : [
            (entityForm: EntityForm) => {
              const filterItems: FilterItem[] = [];
              if (filters.length > 0) {
                filterItems.push(...filters);
              }
              filterItems.push({ name: 'id', queryConditionType: 'NOT_IN', values: idList });
              return Promise.resolve(filterItems);
            },
          ],
    },
    name: 'mapping',
    label: labelText!,
    helpText: props.priceHelpText ?? '가격을 재설정할 수 있습니다.',
    exceptId: idList,
    priceViewPreset: priceViewPreset,
  })
    .withOnChanges(async (entityForm, name) => {
      if (name === 'mapping') {
        const mappingValue = await entityForm.getValue('mapping');
        await props.initPrice(entityForm, mappingValue);
        entityForm.withShouldReload(true);
      }

      return entityForm;
    })
    .withOnSave(async (entityForm) => {
      const form = entityForm.clone(true);

      const fieldErrors = await entityForm.validate();

      if (!isEmpty(fieldErrors)) {
        return {
          entityForm: form.withErrors(fieldErrors),
          errors: ['입력 값이 올바르지 않습니다.'],
        };
      }

      const formData: SubmitFormData = await form.getSubmitFormData();

      const target = formData.data['mappingId'];

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

      const price: any = await entityForm.getValue('price');

      mappingValue.mapped = mappingValue.mapped ?? [];
      let duplicated = false;
      for (const item of mappingValue.mapped!) {
        if (item.id === target) {
          item.price = price;
          duplicated = true;
          break;
        }
      }

      if (!duplicated) {
        mappingValue.mapped.push({ id: target, price: price });
      }

      setValue({ ...mappingValue });
      setListKey(generateUUID());

      props.onChange({ ...mappingValue });

      return Promise.resolve({ entityForm });
    });

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
            MySwal.fire({
              title:
                '계약 메뉴는 수정할 수 없습니다. 가격을 변경하려면 메뉴를 제거하고 다시 등록해 주세요.',
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              showCloseButton: true,
              customClass: {
                popup: `color-danger`,
              },
            });

            // View 를 지원하지 않는다.
            return;
          },
          fields: [
            new BooleanField('price', 10000)
              .withLabel(`${labelText} 최종 가격`)
              .withSortable(false)
              .withFilterable(false),
          ],
          onFetched: async (result: PageResult) => {
            // 필드의 값을 추가한다.
            if (mappingValue.mapped && mappingValue.mapped.length > 0) {
              result.list.forEach((item) => {
                for (const mapped of mappingValue.mapped!) {
                  if (item['id'] === mapped.id) {
                    item['price'] = mapped.price;
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
                  className={`btn btn-outline-secondary h-[34px]`}
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
      {!isBlank(error) && <></>}
    </div>
  );

  function onDelete(checkedItems: string[]) {
    if (mappingValue.mapped === undefined) {
      mappingValue.mapped = [];
    }

    const newIdList = [...idList];

    for (const id of checkedItems) {
      const index = mappingValue.mapped!.findIndex((mapped) => mapped.id === id);
      if (index > -1) {
        mappingValue.mapped!.splice(index, 1);
      }

      const idIndex = newIdList.indexOf(id);
      if (idIndex > -1) {
        newIdList.splice(idIndex, 1);
      }
    }

    if (mappingValue.mapped.length > 0) {
      let found = false;
      for (const item of mappingValue.mapped!) {
        if (isTrue(item.price)) {
          found = true;
          break;
        }
      }

      if (!found) {
        mappingValue.mapped[0]!.price = undefined;
      }
    }

    setIdList(newIdList);
    setValue({ ...mappingValue });
    props.onChange(mappingValue, false);
  }

  function handleOpenModal() {
    const modalId = `xref-price-mapping-${props.name}`;

    openModal({
      modalId,
      title: String(label || '기본값'),
      size: '5xl',
      content: (
        <Paper key={listKey}>
          <ViewEntityForm
            entityForm={xrefEntityForm}
            buttons={[
              new EntityFormButton('list')
                .withLabel('닫기')
                .withClassName('btn btn-outline-primary gap-2')
                .withOnClick(async (props) => {
                  closeModal(modalId);
                  return props.entityForm;
                }),
            ]}
            postSave={async (entityForm) => {
              closeModal(modalId);
              return entityForm;
            }}
          />
        </Paper>
      ),
    });
  }
};
