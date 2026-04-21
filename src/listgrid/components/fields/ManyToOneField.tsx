import {
  AbstractManyToOneField,
  AbstractManyToOneFieldProps,
  CardViewConfig,
  IListConfig,
  SelectBoxViewConfig,
  UserListFieldProps,
  ViewListProps,
  ViewListResult,
  ViewRenderProps,
  ViewRenderResult,
} from './abstract';
import React from 'react';
import { ManyToOneConfig } from '../../config/Config';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { ManyToOneView } from './view/ManyToOneView';
import { ManyToOneMultiFilterView } from './view/ManyToOneMultiFilterView';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { isBlank } from '../../utils/StringUtil';
import { ManyToOneListView } from './view/ManyToOneListView';
import { CardManyToOneView } from './view/CardManyToOneView';
import { SelectBoxManyToOneView } from './view/SelectBoxManyToOneView';
import { isTrue } from '../../utils/BooleanUtil';

// import {EntityForm} from "../../config/EntityForm"; // Removed - not used

export interface ManyToOneFieldProps extends AbstractManyToOneFieldProps {}

export class ManyToOneField extends AbstractManyToOneField<ManyToOneField> {
  constructor(name: string, order: number, manyToOne: ManyToOneConfig) {
    super(name, order, manyToOne);
  }

  /**
   * ManyToOneField 핵심 렌더링 로직 (원본 render 로직 보존)
   * useCardView가 활성화된 경우 CardManyToOneView로 렌더링
   * useSelectBoxView가 활성화된 경우 SelectBoxManyToOneView로 렌더링
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      // 카드뷰 옵션이 활성화된 경우
      if (this.useCardView) {
        return (
          <CardManyToOneView
            field={this}
            entityForm={params.entityForm}
            value={await this.getCurrentValue(params.entityForm.getRenderType())}
            onChange={(value, propagation) => params.onChange?.(value, propagation)}
            onError={params.onError ?? (() => {})}
            clearError={params.clearError ?? (() => {})}
            required={params.required ?? false}
            readonly={params.readonly ?? false}
            {...(params.session !== undefined && { session: params.session })}
            {...(this.cardViewConfig?.columns !== undefined && {
              columns: this.cardViewConfig.columns,
            })}
            {...(this.cardViewConfig?.mobileColumns !== undefined && {
              mobileColumns: this.cardViewConfig.mobileColumns,
            })}
            {...(this.cardViewConfig?.pageSize !== undefined && {
              pageSize: this.cardViewConfig.pageSize,
            })}
            {...(this.cardViewConfig?.showSearchButton !== undefined && {
              showSearchButton: this.cardViewConfig.showSearchButton,
            })}
            {...(this.cardViewConfig?.showAllWhenEmpty !== undefined && {
              showAllWhenEmpty: this.cardViewConfig.showAllWhenEmpty,
            })}
            {...(this.cardViewConfig?.emptyMessage !== undefined && {
              emptyMessage: this.cardViewConfig.emptyMessage,
            })}
            {...(this.cardViewConfig?.gridClassName !== undefined && {
              gridClassName: this.cardViewConfig.gridClassName,
            })}
            {...(this.cardViewConfig?.cardConfig !== undefined && {
              cardConfig: this.cardViewConfig.cardConfig,
            })}
            {...(this.cardViewConfig?.searchFirst !== undefined && {
              searchFirst: this.cardViewConfig.searchFirst,
            })}
            {...(this.cardViewConfig?.searchPlaceholder !== undefined && {
              searchPlaceholder: this.cardViewConfig.searchPlaceholder,
            })}
            {...(this.cardViewConfig?.searchFields !== undefined && {
              searchFields: this.cardViewConfig.searchFields,
            })}
          />
        );
      }

      // 셀렉트박스뷰 옵션이 활성화된 경우
      if (this.useSelectBoxView) {
        return (
          <SelectBoxManyToOneView
            field={this}
            entityForm={params.entityForm}
            value={await this.getCurrentValue(params.entityForm.getRenderType())}
            onChange={(value, propagation) => params.onChange?.(value, propagation)}
            onError={params.onError ?? (() => {})}
            clearError={params.clearError ?? (() => {})}
            required={params.required ?? false}
            readonly={params.readonly ?? false}
            {...(params.session !== undefined && { session: params.session })}
            {...(this.selectBoxViewConfig?.labelField !== undefined && {
              labelField: this.selectBoxViewConfig.labelField,
            })}
            {...(this.selectBoxViewConfig?.valueField !== undefined && {
              valueField: this.selectBoxViewConfig.valueField,
            })}
            {...(this.selectBoxViewConfig?.placeholder !== undefined && {
              placeholder: this.selectBoxViewConfig.placeholder,
            })}
            {...(this.selectBoxViewConfig?.nullValueLabel !== undefined && {
              nullValueLabel: this.selectBoxViewConfig.nullValueLabel,
            })}
            {...(this.selectBoxViewConfig?.isSearchable !== undefined && {
              isSearchable: this.selectBoxViewConfig.isSearchable,
            })}
            {...(this.selectBoxViewConfig?.menuPosition !== undefined && {
              menuPosition: this.selectBoxViewConfig.menuPosition,
            })}
            {...(this.selectBoxViewConfig?.menuPlacement !== undefined && {
              menuPlacement: this.selectBoxViewConfig.menuPlacement,
            })}
          />
        );
      }

      // 기존 ManyToOneView 사용
      const inputParams = await getInputRendererParameters(this, params);
      const { attributes: _ignoredAttrs, ...restInput } = inputParams;
      return (
        <ManyToOneView
          config={this.config}
          parentEntityForm={params.entityForm}
          {...restInput}
          {...(inputParams.attributes !== undefined && { attributes: inputParams.attributes })}
        />
      );
    })();
  }

  /**
   * ManyToOneField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): ManyToOneField {
    const instance = new ManyToOneField(name, order, { ...this.config });
    // 카드뷰 속성 복사
    if (this.useCardView !== undefined) {
      instance.useCardView = this.useCardView;
    }
    if (this.cardViewConfig !== undefined) {
      instance.cardViewConfig = { ...this.cardViewConfig };
    }
    // 셀렉트박스뷰 속성 복사
    if (this.useSelectBoxView !== undefined) {
      instance.useSelectBoxView = this.useSelectBoxView;
    }
    if (this.selectBoxViewConfig !== undefined) {
      instance.selectBoxViewConfig = { ...this.selectBoxViewConfig };
    }
    return instance;
  }

  /**
   * ManyToOneField 리스트 필터 렌더링
   * multiFilter가 true이면 다중 선택 UI를 렌더링
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    // multiFilter가 true이면 다중 선택 UI 렌더링
    if (isTrue(this.listConfig?.multiFilter)) {
      return (async () => {
        return (
          <ManyToOneMultiFilterView
            name={this.name}
            label={typeof this.label === 'string' ? this.label : this.name}
            config={this.config}
            parentEntityForm={params.entityForm}
            value={params.value as string[] | undefined}
            onChange={(values) => params.onChange(values, 'IN')}
          />
        );
      })();
    }

    // 기본 단일 선택 UI 렌더링
    return this.render({
      ...params,
      required: false,
      onChange: (value, propagation) => params.onChange(value),
    } as FieldRenderParameters);
  }

  /**
   * ManyToOneField 리스트 아이템 렌더링 (원본 renderListItem 로직 보존)
   * 중첩 경로 지원: score.course.semester 같은 경로를 처리할 수 있음
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    if (isBlank(props.item)) {
      return Promise.resolve({ result: null, linkOnCell: true });
    }

    return (async (): Promise<ViewListResult> => {
      // 중첩 경로 파싱: score.course.semester -> parentPath: score.course, fieldName: semester
      const { parentObject, fieldName } = parseNestedPath(this.name, props.item);

      const targetEntity: any = await getManyToOneEntityValue(fieldName, parentObject, this.config);

      if (targetEntity === undefined) {
        return { result: '' };
      }

      let value: any = undefined;
      let id: any = undefined;

      if (this.config.field?.id) {
        id = targetEntity[fieldName]?.[this.config.field?.id];
      }

      if (this.config.field?.name) {
        if (this.config.field?.name instanceof Function) {
          value = this.config.field?.name(targetEntity);
        } else {
          const displayProperty: string = this.config.field?.name
            ? this.config.field.name.toString()
            : 'name';

          if (targetEntity[fieldName]?.[displayProperty]) {
            value = parentObject[fieldName]?.[displayProperty];
          } else if (parentObject?.[fieldName]?.[displayProperty]) {
            value = parentObject[fieldName]?.[displayProperty];
          }
        }
      }

      // 기본 값인 name 으로 찾기
      if (value === undefined) {
        if (parentObject?.[fieldName]?.['name']) {
          value = parentObject[fieldName]['name'];
        }
      }

      if (value !== undefined) {
        return {
          result:
            id === undefined ? (
              value
            ) : (
              <ManyToOneListView id={id} value={value} entityForm={this.config.entityForm} />
            ),
        };
      }

      if (this.config.displayFunc !== undefined) {
        // 목록 같은 경우 이 값을 참조할 때 targetEntity 가 해당 row 일 수 있다.
        // 이걸 감지해 내야 한다.
        const entity = targetEntity[fieldName];

        if (entity === undefined) {
          return { result: await this.config.displayFunc(targetEntity) };
        }

        return { result: await this.config.displayFunc(entity) };
      }

      // config.field 의 재정의가 되지 않은 경우 - 기본 값 반환
      return { result: '' };
    })();
  }

  /**
   * ManyToOneField View 모드 렌더링 - 연관 엔티티의 이름/제목 표시
   * 중첩 경로 지원: score.course.semester 같은 경로를 처리할 수 있음
   * cardIcon이 설정된 경우 아이콘과 함께 표시
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    if (isBlank(props.item)) {
      return { result: null };
    }

    // 중첩 경로 파싱: score.course.semester -> parentPath: score.course, fieldName: semester
    const { parentObject, fieldName } = parseNestedPath(this.name, props.item);

    const targetEntity: any = await getManyToOneEntityValue(fieldName, parentObject, this.config);

    if (targetEntity === undefined) {
      return { result: null };
    }

    let displayValue: string | undefined = undefined;

    // config.field?.name이 설정된 경우 해당 속성 사용
    if (this.config.field?.name) {
      if (this.config.field.name instanceof Function) {
        displayValue = this.config.field.name(targetEntity);
      } else {
        const displayProperty: string = this.config.field.name.toString();

        if (targetEntity[fieldName]?.[displayProperty]) {
          displayValue = parentObject[fieldName]?.[displayProperty];
        } else if (parentObject?.[fieldName]?.[displayProperty]) {
          displayValue = parentObject[fieldName]?.[displayProperty];
        }
      }
    }

    // 기본 'name' 속성으로 찾기
    if (displayValue === undefined) {
      if (parentObject?.[fieldName]?.['name']) {
        displayValue = parentObject[fieldName]['name'];
      } else if (parentObject?.[fieldName]?.['title']) {
        // 'title' 속성도 fallback으로 지원
        displayValue = parentObject[fieldName]['title'];
      }
    }

    if (displayValue !== undefined) {
      // cardIcon이 설정된 경우 아이콘과 함께 표시
      if (this.cardIcon) {
        const IconComponent = this.cardIcon;
        return {
          result: (
            <span className="rcm-bool-wrap">
              <span className="rcm-icon-frame">
                <IconComponent className="rcm-icon" data-size="sm" stroke={1.75} />
              </span>
              <span className="font-medium">{displayValue}</span>
            </span>
          ),
        };
      }
      return { result: displayValue };
    }

    // displayFunc가 설정된 경우 사용
    if (this.config.displayFunc !== undefined) {
      const entity = targetEntity[fieldName];
      let funcResult: string;

      if (entity === undefined) {
        funcResult = await this.config.displayFunc(targetEntity);
      } else {
        funcResult = await this.config.displayFunc(entity);
      }

      // cardIcon이 설정된 경우 아이콘과 함께 표시
      if (this.cardIcon && funcResult) {
        const IconComponent = this.cardIcon;
        return {
          result: (
            <span className="rcm-bool-wrap">
              <span className="rcm-icon-frame">
                <IconComponent className="rcm-icon" data-size="sm" stroke={1.75} />
              </span>
              <span className="font-medium">{funcResult}</span>
            </span>
          ),
        };
      }

      return { result: funcResult };
    }

    // 기본값 반환
    return { result: null };
  }

  useListField(props?: number | UserListFieldProps): this {
    if (typeof props === 'number') {
      props = { order: props };
    }
    const base: IListConfig = { ...this.listConfig, support: true };
    if (props?.order !== undefined) base.order = props.order;
    this.listConfig = base;
    // quickSearch가 명시적으로 true로 설정된 경우에만 true로 설정
    this.listConfig.quickSearch = props?.quickSearch === true;
    this.listConfig.sortable = false;
    // filterable이 명시적으로 false일 때만 false로 설정, undefined면 기본값(true) 사용
    if (props?.filterable !== undefined) {
      this.listConfig.filterable = props.filterable;
    }
    if (props?.multiFilter !== undefined) {
      this.listConfig.multiFilter = props.multiFilter;
    }
    return this;
  }

  static create(props: ManyToOneFieldProps): ManyToOneField {
    return new ManyToOneField(props.name, props.order, props.config).copyFields(props, true);
  }

  withManyToOneConfig(config: ManyToOneConfig): this {
    this.config = config;
    return this;
  }

  /**
   * 카드뷰 렌더링 활성화
   * EntityFormThemeProvider 없이도 CardManyToOneView로 렌더링 가능
   *
   * @example
   * ```tsx
   * ManyToOneField.create({
   *   name: 'syllabus',
   *   order: 1,
   *   config: { entityForm: SyllabusEntityForm() }
   * })
   * .withCardView({
   *   columns: 3,
   *   mobileColumns: 2,
   *   cardConfig: {
   *     titleField: 'name',
   *     descriptionField: (item) => `입학지원기간: ${formatDate(item.availableDate[0])}`,
   *   }
   * })
   * ```
   */
  withCardView(config?: CardViewConfig): this {
    this.useCardView = true;
    if (config !== undefined) this.cardViewConfig = config;
    else delete this.cardViewConfig;
    return this;
  }

  /**
   * 셀렉트박스뷰 렌더링 활성화
   * ManyToOne 필드를 드롭다운 SelectBox로 렌더링
   *
   * @example
   * ```tsx
   * ManyToOneField.create({
   *   name: 'country',
   *   order: 1,
   *   config: { entityForm: CountryEntityForm() }
   * })
   * .withSelectBoxView({
   *   labelField: 'name',
   *   placeholder: '국가를 선택하세요',
   *   isSearchable: true,
   * })
   * ```
   */
  withSelectBoxView(config?: SelectBoxViewConfig): this {
    this.useSelectBoxView = true;
    if (config !== undefined) this.selectBoxViewConfig = config;
    else delete this.selectBoxViewConfig;
    return this;
  }
}

/**
 * 중첩 경로를 파싱하여 부모 객체와 최종 필드명을 반환한다.
 * 예: parseNestedPath('score.course.semester', item)
 *   -> { parentObject: item.score.course, fieldName: 'semester' }
 *
 * @param path dot notation 경로 (예: 'score.course.semester')
 * @param item 대상 객체
 * @returns { parentObject: 부모 객체, fieldName: 최종 필드명 }
 */
function parseNestedPath(path: string, item: any): { parentObject: any; fieldName: string } {
  if (!path.includes('.')) {
    // 단순 필드명인 경우 (예: 'course')
    return { parentObject: item, fieldName: path };
  }

  // dot notation 경로를 파싱 (예: 'score.course.semester')
  const keys = path.split('.');
  const fieldName = keys.pop()!; // 마지막 키가 필드명 (예: 'semester')

  // 나머지 경로를 traverse하여 부모 객체를 가져옴
  let parentObject = item;
  for (const key of keys) {
    if (parentObject === null || parentObject === undefined) {
      return { parentObject: undefined, fieldName };
    }
    parentObject = parentObject[key];
  }

  return { parentObject, fieldName };
}

// UUID 형식 검사 (URL 필터에서 ID만 넘어온 경우 감지용)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidString(value: any): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export async function getManyToOneEntityValue(name: string, value: any, config: ManyToOneConfig) {
  let targetEntity: any = undefined;

  if (config.fetch !== undefined) {
    return await config.fetch(value);
  }

  if (name.endsWith('Id')) {
    // 객체가 아니라 id 타입인 경우
    // 넘어 온 값이 id 뿐이라는 뜻이다.

    if (typeof value === 'string') {
      // value 가 곧 id 값이라는 것을 의미한다.
      const fetchEntityForm = config.entityForm.clone(true);
      fetchEntityForm.id = value;

      try {
        targetEntity = (await fetchEntityForm.fetchData()).data.data;
      } catch (e) {
        // nothing to do
      }
    } else {
      const entityName = name.substring(0, name.length - 2);
      if (value[entityName]) {
        // 객체값이 존재하면
        targetEntity = value[entityName];
      } else {
        // id 밖에 없다면 해당 ID 로 fetch 를 해 온 다음 targetEntity 에 해당 값을 넣어 준다.
        const fetchEntityForm = config.entityForm.clone(true);
        fetchEntityForm.id = value[name];

        try {
          targetEntity = (await fetchEntityForm.fetchData()).data.data;
        } catch (e) {
          // nothing to do
        }
      }
    }
  } else {
    // URL 필터에서 ID만 넘어온 경우 (예: filters=curriculum.id:UUID)
    // value가 UUID 문자열이면 엔티티를 조회해야 함
    if (isUuidString(value)) {
      const fetchEntityForm = config.entityForm.clone(true);
      fetchEntityForm.id = value;

      try {
        targetEntity = (await fetchEntityForm.fetchData()).data.data;
      } catch (e) {
        // nothing to do
      }
    } else {
      // 객체가 들어 왔다면 처음부터 원하는대로 데이터가 들어왔다는 뜻이다.
      targetEntity = value;
    }
  }

  return targetEntity;
}
