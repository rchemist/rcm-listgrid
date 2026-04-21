import React from 'react';
import { hexHash } from '../../utils/hash';
import { CheckBoxChip } from '../../ui';
import { MultiSelectBox } from '../../ui';
import { RadioChip } from '../../ui';
import { RadioInput } from '../../ui';
import { SelectBox } from '../../ui';
import { SelectOption } from '../../form/Type';
import { FieldValue, RenderType } from '../../config/Config';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import {
  IListConfig,
  OptionalField,
  OptionalFieldProps,
  renderListOptionalField,
  UserListFieldProps as ListFieldProps,
  ViewListProps,
  ViewListResult,
  ViewRenderProps,
  ViewRenderResult,
} from './abstract';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { SelectFieldRenderer } from './SelectFieldRenderer';
import { EntityForm } from '../../config/EntityForm';
import { ValidateResult } from '../../validations/Validation';
import { Badge } from '../../ui';
import { ColorType } from '../../common/type';
import { DynamicSelectFieldView } from './view/DynamicSelectFieldView';

// SelectField loadOptions 캐시 (fieldName 기반, 동일 페이지 내에서 공유)
const selectFieldOptionsCache = new Map<string, SelectOption[]>();
// 진행 중인 loadOptions Promise 추적 (중복 호출 방지)
const selectFieldOptionsPending = new Map<string, Promise<SelectOption[]>>();

// Checkbox 그룹으로 표시할 최대 옵션 수 (10개 미만이면 Checkbox, 10개 이상이면 MultiSelectBox)
const CHECKBOX_THRESHOLD = 10;

/**
 * 상태 변경 사유 입력 필드 설정
 */
export interface StatusReason {
  /** 상태 변경 사유 입력 필드의 안내 메시지 */
  message: string;
  /** 상태 변경 사유가 저장될 필드명 (entityForm.getField로 찾을 수 있음) */
  fieldName: string;
  /** 상태 변경 사유 입력 필수 여부 */
  required?: boolean;
}

/**
 * 특정 상태로 변경 시 적용할 사유 입력 설정
 */
export interface StatusChangeReason {
  /**
   * 어떤 상태로 변경할 때 이 설정을 적용할지 지정.
   * 이 값이 없으면 모든 상태 변경에 대해 사유를 입력하게 함
   */
  targets?: string[];
  /** 사유 입력 설정 */
  config: StatusReason;
}

/**
 * 상태 변경 시 수행할 검증 로직
 */
export interface StatusChangeValidation {
  /** 상태 변경 시 실행할 검증 함수 */
  validate: (entityForm: EntityForm, value: FieldValue) => Promise<ValidateResult>;
  /** 검증 실패 시 표시할 에러 메시지 */
  message?: string;
  /** 검증 성공 후 실행할 콜백 */
  success?: (entityForm: EntityForm) => Promise<void>;
  /** 검증 실패 후 실행할 콜백 */
  fail?: (entityForm: EntityForm) => Promise<void>;
}

/**
 * 옵션 로드 함수 타입
 * EntityForm을 받아서 SelectOption 배열을 반환하는 async 함수
 */
export type OptionsLoader = (entityForm: EntityForm) => Promise<SelectOption[]>;

/**
 * 즉시 변경(withImmediateChange) 확장 설정.
 * "변경" 버튼 클릭 시 상태 필드 외에 추가 필드를 함께 전송하거나,
 * 커스텀 전처리 로직을 실행할 수 있습니다.
 */
export interface ImmediateChangeProps {
  /**
   * 즉시 변경 시 함께 전송할 필드명 목록.
   * EntityForm.validate({ fieldNames })로 표준 검증을 수행하고,
   * field.isDirty()인 필드의 값을 수집하여 API 요청에 포함합니다.
   */
  requiredFields?: string[];

  /**
   * 즉시 변경 전 커스텀 전처리 콜백.
   * requiredFields 검증/수집 및 withReason 사유 추가 이후에 호출됩니다.
   * - false 반환: 변경 취소
   * - Record 반환: 추가 데이터를 formData에 병합
   * - void 반환: 기본 동작 진행
   */
  onSubmit?: (
    entityForm: EntityForm,
    submitData: { targetValue: FieldValue; formData: Record<string, any> },
  ) => Promise<false | Record<string, any> | void>;
}

export interface SelectFieldProps extends OptionalFieldProps {
  /**
   * 즉시 변경 기능 활성화 여부.
   * true로 설정하면 옵션 선택 즉시 API를 호출하여 상태를 변경합니다.
   */
  enableImmediateChange?: boolean;

  /**
   * 즉시 변경 확장 설정 (requiredFields, onSubmit 등).
   */
  immediateChangeProps?: ImmediateChangeProps;

  /**
   * 상태 변경 시 사유 입력 설정.
   * 특정 상태로 변경 시 사유 입력을 요구할 수 있습니다.
   */
  reason?: StatusChangeReason[];

  /**
   * 상태 변경 시 검증 로직 설정.
   * 상태 변경 전에 추가적인 검증을 수행할 수 있습니다.
   */
  validateStatusChange?: StatusChangeValidation;

  /**
   * 옵션을 동적으로 로드하는 함수.
   * 설정하면 options 대신 이 함수를 통해 옵션을 비동기로 로드합니다.
   */
  loadOptions?: OptionsLoader;
}

export class SelectField extends OptionalField<SelectField> {
  /** 즉시 변경 기능 활성화 여부 */
  enableImmediateChange?: boolean;

  /** 즉시 변경 확장 설정 */
  immediateChangeProps?: ImmediateChangeProps;

  /** 상태 변경 시 사유 입력 설정 */
  reason?: StatusChangeReason[];

  /** 상태 변경 시 검증 로직 */
  validateStatusChange?: StatusChangeValidation;

  /** 옵션을 동적으로 로드하는 함수 */
  loadOptions?: OptionsLoader;

  constructor(
    name: string,
    order: number,
    options?: SelectOption[],
    reason?: StatusChangeReason[],
    validateStatusChange?: StatusChangeValidation,
  ) {
    super(name, order, 'select');
    this.options = options ?? [];
    if (reason !== undefined) this.reason = reason;
    if (validateStatusChange !== undefined) this.validateStatusChange = validateStatusChange;
  }

  /**
   * SelectField 핵심 렌더링 로직
   * - loadOptions가 설정되면 DynamicSelectFieldView 사용 (동적 옵션 로드)
   * - enableImmediateChange가 true이면 SelectFieldRenderer 사용 (즉시 변경 기능)
   * - combo 설정이 있으면 RadioInput 사용
   * - useChip(true)이고 조건 충족 시 RadioChip 사용
   * - 그 외에는 SelectBox 사용
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    // 동적 옵션 로드가 설정된 경우 DynamicSelectFieldView 사용
    if (this.loadOptions) {
      return (async () => {
        const inputParams = await getInputRendererParameters(this, params);
        let renderType: 'select' | 'chip' | 'radio' = 'select';

        if (this.combo !== undefined && this.combo.direction !== undefined) {
          renderType = 'radio';
        } else if (this.shouldRenderAsChip()) {
          renderType = 'chip';
        }

        return (
          <DynamicSelectFieldView
            name={this.getName()}
            fieldName={this.getName()}
            entityForm={params.entityForm}
            loadOptions={this.loadOptions!}
            staticOptions={this.options}
            renderType={renderType}
            combo={this.combo}
            value={inputParams.value}
            onChange={inputParams.onChange}
            readonly={inputParams.readonly ?? false}
            required={inputParams.required ?? false}
            placeHolder={inputParams.placeHolder ?? ''}
          />
        );
      })();
    }

    // 즉시 변경 기능이 활성화된 경우 SelectFieldRenderer 사용
    if (this.enableImmediateChange) {
      return (async () => {
        const currentValue = await this.getCurrentValue();
        const fetchedValue = await this.getFetchedValue();
        const cacheKey = this.createStatusCacheKey(currentValue);

        return (
          <SelectFieldRenderer
            key={cacheKey}
            name={this.getName()}
            value={currentValue}
            fetchedValue={fetchedValue}
            options={this.options!}
            onChange={params.onChange}
            entityForm={params.entityForm}
            reason={this.reason}
            validateStatusChange={this.validateStatusChange}
            immediateChangeProps={this.immediateChangeProps}
            disabled={params.readonly}
          />
        );
      })();
    }

    const cacheKey = this.createCacheKey();
    return (async () => {
      // combo 설정이 있으면 RadioInput 우선
      if (this.combo !== undefined && this.combo.direction !== undefined) {
        return (
          <RadioInput
            key={cacheKey}
            options={this.options!}
            combo={this.combo}
            {...await getInputRendererParameters(this, params)}
          ></RadioInput>
        );
      }

      // Chip UI 조건 충족 시 RadioChip 사용
      if (this.shouldRenderAsChip()) {
        return (
          <RadioChip
            key={cacheKey}
            options={this.options!}
            combo={{ direction: 'row' }}
            {...await getInputRendererParameters(this, params)}
          ></RadioChip>
        );
      }

      return (
        <SelectBox
          key={cacheKey}
          options={this.options!}
          {...await getInputRendererParameters(this, params)}
        ></SelectBox>
      );
    })();
  }

  /**
   * 즉시 변경 기능용 캐시 키 생성
   */
  private createStatusCacheKey(value?: any): string {
    let key: string = `status_`;
    for (const option of this.options!) {
      key += `_${option.value}`;
    }
    return `${this.getName()}_${value}_${key}`;
  }

  /**
   * SelectField 핵심 리스트 필터 렌더링 로직
   * - loadOptions가 설정된 경우: 옵션을 먼저 로드한 후 렌더링
   * - 옵션 1-9개: Checkbox 그룹으로 모든 옵션을 한눈에 표시
   * - 옵션 10개 이상: MultiSelectBox(드롭다운)로 표시
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      // 동적 옵션이 설정되고 아직 옵션이 로드되지 않은 경우
      if (this.loadOptions && (!this.options || this.options.length === 0)) {
        const options = await this.loadOptions(params.entityForm);
        this.options = options;
      }

      const cacheKey = this.createCacheKey();
      const optionsCount = this.options?.length ?? 0;

      // singleFilter가 true이면 RadioChip 사용 (단일 선택만 허용)
      if (this.singleFilter) {
        return (
          <RadioChip
            key={cacheKey}
            options={this.options!}
            combo={{ direction: 'row' }}
            {...await getInputRendererParameters(this, {
              ...params,
              required: false,
              onChange: (value) => params.onChange(value),
            })}
          ></RadioChip>
        );
      }

      // 옵션이 10개 이상이면 MultiSelectBox 사용
      if (optionsCount >= CHECKBOX_THRESHOLD) {
        return (
          <MultiSelectBox
            key={cacheKey}
            options={this.options!}
            {...await getInputRendererParameters(this, {
              ...params,
              required: false,
              onChange: (value) => params.onChange(value),
            })}
          ></MultiSelectBox>
        );
      }

      // 옵션이 10개 미만이면 Chip 스타일 Checkbox 그룹 사용 (모든 옵션을 한눈에 볼 수 있음)
      return (
        <CheckBoxChip
          key={cacheKey}
          options={this.options!}
          combo={{ direction: 'row' }}
          {...await getInputRendererParameters(this, {
            ...params,
            required: false,
            onChange: (value) => params.onChange(value),
          })}
        ></CheckBoxChip>
      );
    })();
  }

  /**
   * SelectField 핵심 리스트 아이템 렌더링 로직
   * loadOptions가 설정된 경우 캐시에서 옵션을 가져오거나 로드 후 renderListOptionalField 사용
   * N+1 문제 방지를 위해 prefetchSelectFieldOptions가 미리 호출되어야 함
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    // 동적 옵션이 설정되고 아직 옵션이 로드되지 않은 경우
    if (this.loadOptions && (!this.options || this.options.length === 0)) {
      return (async () => {
        // 캐시에서 먼저 확인
        const cacheKey = this.getLoadOptionsCacheKey();
        if (selectFieldOptionsCache.has(cacheKey)) {
          this.options = selectFieldOptionsCache.get(cacheKey)!;
          return renderListOptionalField(this, props);
        }

        // 진행 중인 요청이 있으면 대기
        if (selectFieldOptionsPending.has(cacheKey)) {
          this.options = await selectFieldOptionsPending.get(cacheKey)!;
          return renderListOptionalField(this, props);
        }

        // 새로운 요청 시작 (prefetch가 호출되지 않은 경우 fallback)
        const loadPromise = this.loadOptions!(props.entityForm);
        selectFieldOptionsPending.set(cacheKey, loadPromise);

        try {
          const options = await loadPromise;
          this.options = options;
          selectFieldOptionsCache.set(cacheKey, options);
          return renderListOptionalField(this, props);
        } finally {
          selectFieldOptionsPending.delete(cacheKey);
        }
      })();
    }

    return renderListOptionalField(this, props);
  }

  /**
   * loadOptions 캐시 키 생성
   * 필드명 기반으로 캐시 키 생성 (동일 필드는 동일한 옵션을 반환한다고 가정)
   */
  getLoadOptionsCacheKey(): string {
    return `selectField_${this.getName()}`;
  }

  /**
   * SelectField View 모드 렌더링 - Badge 컴포넌트로 상태 표시
   * options에서 value에 해당하는 label을 찾아 Badge로 렌더링
   * cardIcon이 설정된 경우 아이콘과 함께 표시
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = props.item[this.name];

    // null, undefined, 빈 문자열 처리
    if (value === null || value === undefined || value === '') {
      return { result: null };
    }

    // options에서 해당 value의 label 찾기
    const option = this.options?.find((opt) => opt.value === value);
    const displayLabel = option?.label ?? String(value);

    // 상태값에 따른 색상 매핑 (ColorType 사용)
    const colorMap: Record<string, ColorType> = {
      // 활성/성공 상태
      ACTIVE: 'success',
      ENROLLED: 'success',
      PAID: 'success',
      COMPLETED: 'success',
      APPROVED: 'success',
      GRADUATED: 'info',

      // 대기/경고 상태
      PENDING: 'warning',
      ON_LEAVE: 'warning',
      PARTIAL: 'warning',

      // 비활성/취소/위험 상태
      INACTIVE: 'secondary',
      CANCELLED: 'danger',
      GIVE_UP: 'danger',
      EXPELLED: 'danger',
      UNPAID: 'danger',
      DISCARDED: 'secondary',

      // 기본 상태
      ENTERED: 'primary',
    };

    const color: ColorType = colorMap[String(value).toUpperCase()] ?? 'secondary';

    // cardIcon이 있으면 아이콘과 함께 Badge 표시
    if (this.cardIcon) {
      const IconComponent = this.cardIcon;
      return {
        result: (
          <span className="rcm-bool-wrap">
            <span className="rcm-icon-frame">
              <IconComponent className="rcm-icon" data-size="sm" stroke={1.75} />
            </span>
            <Badge color={color}>{displayLabel}</Badge>
          </span>
        ),
      };
    }

    return {
      result: <Badge color={color}>{displayLabel}</Badge>,
    };
  }

  /**
   * SelectField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): SelectField {
    const instance = new SelectField(
      name,
      order,
      this.options ?? [],
      this.reason,
      this.validateStatusChange,
    );
    if (this.enableImmediateChange !== undefined) {
      instance.enableImmediateChange = this.enableImmediateChange;
    }
    if (this.immediateChangeProps !== undefined) {
      instance.immediateChangeProps = this.immediateChangeProps;
    }
    if (this.loadOptions !== undefined) instance.loadOptions = this.loadOptions;
    return instance;
  }

  private createCacheKey(renderType?: RenderType) {
    let key: string = ``;
    for (const option of this.options!) {
      key += `_${option.value}`;
    }
    return hexHash(`${this.getName()}_${this.getCurrentValue(renderType)}_${key}`);
  }

  static create(props: SelectFieldProps): SelectField {
    const field = new SelectField(
      props.name,
      props.order,
      props.options ?? [],
      props.reason,
      props.validateStatusChange,
    );
    if (props.enableImmediateChange !== undefined) {
      field.enableImmediateChange = props.enableImmediateChange;
    }
    if (props.immediateChangeProps !== undefined) {
      field.immediateChangeProps = props.immediateChangeProps;
    }
    if (props.loadOptions !== undefined) field.loadOptions = props.loadOptions;
    return field.copyFields(props, true);
  }

  /**
   * 옵션을 동적으로 로드하는 함수 설정.
   * 설정하면 options 대신 이 함수를 통해 옵션을 비동기로 로드합니다.
   *
   * @example
   * ```tsx
   * new SelectField('country', 100)
   *   .withLabel('국가')
   *   .withLoadOptions(async (entityForm) => {
   *     const response = await fetch('/api/countries');
   *     const data = await response.json();
   *     return data.map((item: any) => ({
   *       label: item.name,
   *       value: item.code,
   *     }));
   *   })
   * ```
   */
  withLoadOptions(loader: OptionsLoader): this {
    this.loadOptions = loader;
    return this;
  }

  /**
   * 즉시 변경 기능 활성화.
   * 옵션을 선택하면 즉시 API를 호출하여 상태를 변경합니다.
   *
   * @param propsOrEnable
   *   - boolean: 활성화 여부 (하위호환, 기본값: true)
   *   - ImmediateChangeProps: 확장 설정 (requiredFields, onSubmit)
   *
   * @example
   * // 기존 방식 (하위호환)
   * .withImmediateChange()
   * .withImmediateChange(true)
   *
   * @example
   * // 확장 방식: 변경 버튼 클릭 시 rejectReason 필드도 함께 검증/전송
   * .withImmediateChange({
   *   requiredFields: ['rejectReason'],
   *   onSubmit: async (entityForm, { targetValue, formData }) => {
   *     // 커스텀 전처리 로직
   *     // return false; // 취소
   *     // return { additionalField: 'value' }; // 추가 데이터 병합
   *   }
   * })
   */
  withImmediateChange(propsOrEnable?: boolean | ImmediateChangeProps): this {
    if (typeof propsOrEnable === 'object' && propsOrEnable !== null) {
      this.enableImmediateChange = true;
      this.immediateChangeProps = propsOrEnable;
    } else {
      this.enableImmediateChange = propsOrEnable ?? true;
    }
    return this;
  }

  /**
   * 상태 변경 시 사유 입력 설정.
   * 특정 상태로 변경할 때 사유 입력을 요구합니다.
   * @param reason 사유 입력 설정 배열
   */
  withReason(reason?: StatusChangeReason[]): this {
    if (reason !== undefined) this.reason = reason;
    else delete this.reason;
    return this;
  }

  /**
   * 상태 변경 시 검증 로직 설정.
   * 상태 변경 전에 추가적인 검증을 수행합니다.
   * @param validateStatusChange 검증 로직 설정
   */
  withValidateStatusChange(validateStatusChange?: StatusChangeValidation): this {
    if (validateStatusChange !== undefined) this.validateStatusChange = validateStatusChange;
    else delete this.validateStatusChange;
    return this;
  }

  useListField(props?: number | ListFieldProps): this {
    if (typeof props === 'number') {
      props = { order: props };
    }
    const base: IListConfig = { ...this.listConfig, support: true, sortable: false };
    if (props?.order !== undefined) base.order = props.order;
    this.listConfig = base;
    this.listConfig.filterable = props?.filterable ?? true;
    return this;
  }
}

/**
 * 여러 SelectField의 loadOptions를 일괄 실행하여 캐시에 저장
 * ViewListGrid에서 목록 렌더링 전에 호출하여 N+1 문제 방지
 *
 * @param fields loadOptions가 설정된 SelectField 배열
 * @param entityForm 옵션 로드에 사용할 EntityForm
 */
export async function prefetchSelectFieldOptions(
  fields: SelectField[],
  entityForm: EntityForm,
): Promise<void> {
  const fieldsToLoad = fields.filter((field) => {
    if (!field.loadOptions) return false;
    const cacheKey = field.getLoadOptionsCacheKey();
    // 이미 캐시에 있거나 로딩 중이면 제외
    return !selectFieldOptionsCache.has(cacheKey) && !selectFieldOptionsPending.has(cacheKey);
  });

  if (fieldsToLoad.length === 0) {
    return;
  }

  // 모든 loadOptions를 병렬로 실행
  const loadPromises = fieldsToLoad.map(async (field) => {
    const cacheKey = field.getLoadOptionsCacheKey();
    const loadPromise = field.loadOptions!(entityForm);
    selectFieldOptionsPending.set(cacheKey, loadPromise);

    try {
      const options = await loadPromise;
      selectFieldOptionsCache.set(cacheKey, options);
      field.options = options;
    } finally {
      selectFieldOptionsPending.delete(cacheKey);
    }
  });

  await Promise.all(loadPromises);
}

/**
 * SelectField 옵션 캐시 초기화
 */
export function clearSelectFieldOptionsCache(): void {
  selectFieldOptionsCache.clear();
}
