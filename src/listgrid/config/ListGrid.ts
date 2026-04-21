import { EntityForm } from '../config/EntityForm';
import { SearchForm } from '../form/SearchForm';
import { AbstractManyToOneField, ListableFormField } from '../components/fields/abstract';
import { LabelType } from '../config/Config';
import { isTrue } from '../utils/BooleanUtil';
import { PageResult } from '../form/Type';
import { ReactNode } from 'react';
import { SubCollectionBaseButtonProps } from '../components/list/types/SubCollectionButtons.type';

export class ListGrid {
  private readonly entityForm: EntityForm;
  private searchForm?: SearchForm | undefined;

  private listFields?: ListableFormField<any>[] | undefined;

  private overrideFetch?:
    | ((url: string, searchForm: SearchForm) => Promise<PageResult>)
    | undefined;

  private overrideFetchResult?: ((result: PageResult) => Promise<PageResult>) | undefined;

  constructor(entityForm: EntityForm) {
    this.entityForm = entityForm.clone(true);
  }

  withOverrideFetch(
    overrideFetch?: (url: string, searchForm: SearchForm) => Promise<PageResult>,
  ): this {
    this.overrideFetch = overrideFetch;
    return this;
  }

  withOverrideFetchResult(overrideFetchResult?: (result: PageResult) => Promise<PageResult>): this {
    this.overrideFetchResult = overrideFetchResult;
    return this;
  }

  getListFields(): ListableFormField<any>[] {
    if (this.listFields === undefined) {
      this.listFields = this.entityForm.getListFields();
    }
    return this.listFields;
  }

  getQuickSearchProperty(findAllFields: boolean = true): QuickSearchProps | undefined {
    let field: { name: string; label: LabelType; order: number } | undefined = undefined;

    const quickSearchFields: { name: string; label: LabelType; order: number }[] = [];
    const listableFields: { name: string; label: LabelType; order: number }[] = [];

    // 1. 먼저 모든 필드에서 quickSearch: true 가 명시적으로 설정된 필드를 수집
    // (support 값과 관계없이 quickSearch: true 설정이 있으면 대상이 됨)
    const allFields = this.entityForm.getFields();
    allFields.forEach((entityField, idx) => {
      if (entityField instanceof ListableFormField) {
        const listConfig = entityField.getListConfig();
        if (listConfig?.quickSearch) {
          // ManyToOneField인 경우 대상 EntityForm에 name 필드가 있으면 .name을 붙여서 검색
          if (entityField instanceof AbstractManyToOneField) {
            const targetEntityForm = entityField.config?.entityForm;
            if (targetEntityForm) {
              const nameField = targetEntityForm.getField('name');
              if (nameField) {
                quickSearchFields.push({
                  name: `${entityField.getName()}.name`,
                  label: entityField.getLabel(),
                  order: idx,
                });
              }
            }
          } else {
            quickSearchFields.push({
              name: entityField.getName(),
              label: entityField.getLabel(),
              order: idx,
            });
          }
        }
      }
    });

    // 2. listFields 수집 (listableFields 용도)
    let index = 0;
    this.getListFields().forEach((listField) => {
      listableFields.push({ name: listField.getName(), label: listField.getLabel(), order: index });
      index++;
    });

    if (quickSearchFields.length > 0) {
      field = quickSearchFields[0]!;
    }

    // Fallback: quickSearch: true 필드가 없으면 자동으로 퀵서치 대상 필드 수집
    // Phase 2: StringField(type=text)만 자동 포함. ManyToOneField는 명시적 quickSearch: true 설정 시에만 Phase 1에서 수집됨
    if (field === undefined && isTrue(findAllFields) && listableFields.length > 0) {
      const autoQuickSearchFields: { name: string; label: LabelType; order: number }[] = [];

      this.getListFields().forEach((listField, idx) => {
        // quickSearch: false가 명시적으로 설정된 필드는 자동탐색에서 제외
        const listConfig = listField.getListConfig();
        if (listConfig?.quickSearch === false) {
          return;
        }

        // filterable: false인 필드는 자동탐색에서 제외
        if (!listField.isFilterable()) {
          return;
        }

        // StringField (type === 'text')인 경우만 자동 포함
        // ManyToOneField는 명시적으로 quickSearch: true를 설정한 경우에만 Phase 1에서 수집됨
        if (listField.type === 'text') {
          autoQuickSearchFields.push({
            name: listField.getName(),
            label: listField.getLabel(),
            order: idx,
          });
        }
      });

      // 자동 수집된 필드가 있으면 사용
      if (autoQuickSearchFields.length > 0) {
        field = autoQuickSearchFields[0]!;

        // 여러 필드가 있으면 OR 조건으로 결합
        if (autoQuickSearchFields.length > 1) {
          const otherFields = autoQuickSearchFields.slice(1);
          return {
            ...field,
            orFields: otherFields.map((f) => f.name),
            orFieldLabels: otherFields.map((f) => f.label),
          };
        }
      }
    }

    // Build orFields from multiple quickSearch fields (OR condition support)
    if (field !== undefined && quickSearchFields.length > 1) {
      const otherFields = quickSearchFields.filter((f) => f.name !== field!.name);
      const orFields = otherFields.map((f) => f.name);
      const orFieldLabels = otherFields.map((f) => f.label);

      return {
        ...field,
        orFields: orFields.length > 0 ? orFields : undefined,
        orFieldLabels: orFieldLabels.length > 0 ? orFieldLabels : undefined,
      };
    }

    return field;
  }

  getSearchForm(): SearchForm {
    if (this.searchForm === undefined) {
      this.searchForm = SearchForm.create();
    }

    return this.searchForm;
  }

  getEntityForm(): EntityForm {
    return this.entityForm;
  }

  withSearchForm(searchForm: SearchForm): this {
    this.searchForm = searchForm;
    return this;
  }

  async fetchData(
    fetchSearchForm?: SearchForm,
    extensionOptions?: {
      entityFormName?: string;
      extensionPoint?: string;
    },
  ): Promise<PageResult> {
    const searchForm = fetchSearchForm ?? this.getSearchForm().clone();

    if (searchForm.isShouldReturnEmpty()) {
      // should return empty 라면 서버로 굳이 fetch 처리할 필요가 없다.
      return new PageResult({
        list: [],
        totalCount: 0,
        totalPage: 1,
        searchForm: searchForm.withPage(0),
      });
    }

    const url = this.getEntityForm().getUrl();

    /**
     * 기본 Fetch 로직에 대한 오버라이드가 있다면 해당 로직으로
     */
    let result: PageResult;
    if (this.overrideFetch !== undefined) {
      result = await this.overrideFetch(url, searchForm);
    } else {
      result = await PageResult.fetchListData(url, searchForm, extensionOptions);
    }

    if (this.overrideFetchResult !== undefined) {
      result = await this.overrideFetchResult(result);
    }

    return result;
  }

  getAdvancedSearchFields(): ListableFormField<any>[] {
    const fields: ListableFormField<any>[] = [];

    const listFields = this.entityForm.getFilterableFields();

    fields.push(...listFields);

    if (this.entityForm.appendAdvancedSearchFields) {
      const appendFields: ListableFormField<any>[] = [];

      for (const appendField of this.entityForm.appendAdvancedSearchFields) {
        let duplicated = false;
        for (const field of fields) {
          if (appendField.name === field.name) {
            duplicated = true;
            break;
          }
        }
        if (!duplicated) {
          appendFields.push(appendField);
        }
      }

      if (appendFields.length > 0) {
        fields.push(...appendFields);
        fields.sort((a, b) => a.order - b.order);
      }
    }

    return fields;
  }
}

export interface SubCollectionProps {
  name?: string; // collection 의 이름
  /**
   * 이 콜렉션의 엔티티에 상위 엔티티가 어떤 필드명으로 매핑되어 있는지.
   * 예를 들어 one Plant : many Transceivers 관계에서
   * Transceiver 엔티티에 plantId = 1 이라는 값으로 매핑되어 있다고 하면 mappedBy 는 plantId 가 되고 mappedValue 는 1이 된다.
   */
  mappedBy?: string;
  mappedValue?: any;
  buttons?: ((props: SubCollectionBaseButtonProps) => ReactNode)[];
  add?: boolean; // subcollection 에서 신규 등록을 지원하는지. 상위 Field 설정에서 readonly 를 설정했더라도 이 값이 true 면 신규 등록 버튼을 표시한다.
  delete?: boolean; // subCollection 에서 삭제를 지원하는지. 상위 Field 설정에서 readonly 를 설정했더라도 이 값이 true 면 삭제 버튼을 표시한다.
  modifyOnView?: boolean; // 서브콜렉션에서 리스트를 클릭했을 때 수정을 지원하는지. 이 값은 기본 true 이다.
}

export interface QuickSearchProps {
  name: string;
  label: LabelType;
  /**
   * Additional fields to search with OR condition
   * When specified, quick search will search across all fields using OR condition
   * @example ['name', 'email', 'phone'] - searches all three fields
   */
  orFields?: string[] | undefined;
  /**
   * Labels for orFields, used to generate combined placeholder text
   * @example ['이메일', '전화번호'] for orFields ['email', 'phone']
   */
  orFieldLabels?: LabelType[] | undefined;
}
