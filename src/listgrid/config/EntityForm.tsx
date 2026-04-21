import { EntityFormActionResult, FieldType, STATUS_TAB_INFO, TabInfo } from './Config';
import { EntityField } from './EntityField';
import {
  AbstractManyToOneField,
  CheckButtonValidationField,
  FormField,
  ListableFormField,
} from '../components/fields/abstract';
import {
  callExternalHttpRequest,
  endsWith,
  getExternalApiDataWithError,
  isEmpty,
  isTrue,
  parse,
} from '../utils';
import { ResponseData } from '../api';
import { EntityTab } from './EntityTab';
import { SubCollectionField } from './SubCollectionField';
import { Session, useSession } from '../auth';
import { CustomOptionField, getCustomOptionValues } from '../components/fields/CustomOptionField';
import { delay, entityErrorToString } from './EntityFormMethod';
import { EntityFormExtensions } from './form/EntityFormExtensions';
import { FieldError, SubmitFormData } from './EntityFormTypes';
import { ExtensionPoint } from '../extensions/EntityFormExtension.types';
import { ValidateResult } from '../validations/Validation';
import { PhoneNumberField } from '../components/fields/PhoneNumberField';
import { createSmsHistoryField } from '../extensions/FieldExtensions';
import { hasAnyRole } from '../auth';

export class EntityForm<T extends object = any> extends EntityFormExtensions<T> {
  constructor(name: string, url: string) {
    super(name, url);
  }

  clone(includeValue?: boolean): EntityForm<T> {
    const cloned = new EntityForm<T>(this.name, this.url);
    return this.cloneWithEntityForm(cloned, includeValue);
  }

  cloneWithEntityForm(entityForm: EntityForm<T>, includeValue?: boolean): EntityForm<T> {
    entityForm.parentId = this.parentId;
    entityForm.id = this.id;
    entityForm.title = this.title;
    entityForm.menuUrl = this.menuUrl;
    entityForm.neverDelete = this.neverDelete;
    entityForm.revisionEntityName = this.revisionEntityName;
    entityForm.createStep = this.getCreateStep();
    entityForm.manageEntityForm = this.manageEntityForm;
    entityForm.session = this.session;

    // Extensions 복사
    entityForm.clientExtensions = new Map(this.clientExtensions);

    const tabs: Map<string, EntityTab> = new Map<string, EntityTab>();
    Array.from(this.tabs.values()).forEach((tab) => {
      tabs.set(tab.id, tab.clone());
    });
    entityForm.tabs = tabs;

    // clone errors
    if (isTrue(includeValue)) {
      entityForm.errors = this.errors === undefined ? undefined : [...this.errors];
    }

    // clone alert messages
    entityForm.alertMessages = [...this.alertMessages];

    // clone validation states
    entityForm.fieldValidationStates = new Map(this.fieldValidationStates);

    // clone fields
    const fields: Map<string, EntityField> = new Map<string, EntityField>();
    Array.from(this.fields.values()).forEach((field) => {
      fields.set(field.getName(), field.clone(includeValue));
    });
    entityForm.fields = fields;

    // clone subCollections
    const collections: Map<string, SubCollectionField> = new Map<string, SubCollectionField>();
    Array.from(this.collections.values()).forEach((collection) => {
      const c = collection.clone();
      collections.set(collection.getName(), c);
    });
    entityForm.collections = collections;

    entityForm.excludeListFields = this.excludeListFields ? [...this.excludeListFields] : undefined;
    entityForm.sessionRequired = this.sessionRequired;
    entityForm.attributes = this.attributes ? new Map<string, unknown>(this.attributes) : undefined;

    entityForm.cacheKeyFunc = this.cacheKeyFunc;
    entityForm.onChanges = this.onChanges ? [...this.onChanges] : undefined;
    entityForm.onFetchData = this.onFetchData ? [...this.onFetchData] : undefined;
    entityForm.onInitialize = this.onInitialize ? [...this.onInitialize] : undefined;
    entityForm.onFetchListData = this.onFetchListData ? [...this.onFetchListData] : undefined;
    entityForm.appendAdvancedSearchFields = this.appendAdvancedSearchFields
      ? [...this.appendAdvancedSearchFields]
      : undefined;

    entityForm.readonly = this.readonly;
    entityForm.dataPreloaded = this.dataPreloaded;
    entityForm.fetchedEntity = this.fetchedEntity;
    entityForm.onSave = this.onSave;
    entityForm.postSave = this.postSave;
    entityForm.postDelete = this.postDelete;
    entityForm.overrideSubmitData = this.overrideSubmitData;
    entityForm.overrideFetchData = this.overrideFetchData;
    entityForm.buttons = this.buttons;
    entityForm.headerArea = this.headerArea;

    if (this.dataTransferConfig !== undefined) {
      entityForm.withDataTransferConfig(this.dataTransferConfig);
    }

    Object.setPrototypeOf(entityForm, EntityForm.prototype);

    return entityForm;
  }

  executeOnChanges(fieldName: string): Promise<void> {
    this.onChanges?.forEach((onChange) => {
      onChange(this, fieldName);
    });
    return Promise.resolve();
  }

  merge(origin: EntityForm<T>): this {
    // entityForm 의 모든 속성을 cloned 의 속성으로 덮어 쓴다.
    origin.cloneWithEntityForm(this, true);
    return this;
  }

  setFetchedValue<K extends keyof T & string>(fieldName: K, value: T[K]): this;
  setFetchedValue(fieldName: string, value: any): this;
  setFetchedValue(fieldName: string, value: any): this {
    const field = this.getField(fieldName);
    if (field) {
      let fieldValue = field.value ?? {};
      fieldValue['fetched'] = value;

      if (fieldValue.current === undefined) {
        fieldValue['current'] = value;
      }

      field.value = fieldValue;
      this.fields.set(field.getName(), field);
    }

    return this;
  }

  withAppendAdvancedSearchFields(...fields: ListableFormField<any>[]) {
    this.appendAdvancedSearchFields = fields;
    return this;
  }

  /**
   * ViewEntityForm 에서 최초 setEntityForm 을 할 때 initialize 를 호출해야 한다.
   */
  async initialize(props: { session?: Session; list?: boolean }): Promise<EntityFormActionResult> {
    let entityForm = this.clone(true);
    entityForm.session = this.session ?? props.session;
    const list = isTrue(props.list);

    // initialize 후 entityForm 에 id 가 있으면 fetch 도 해 온다.
    // dataPreloaded가 true이면 이미 setFetchedValues()로 데이터가 로드되었으므로 중복 fetch를 건너뛴다.
    let fetchedEntity: (T & Record<string, any>) | null = null;
    if (!list) {
      if (this.isAbleFetch() && !this.dataPreloaded) {
        try {
          const response = await this.fetchData();

          // fetch data and set values
          if (!response.isError()) {
            fetchedEntity = response.data.data;
            entityForm = await entityForm.setFetchedValues(fetchedEntity);
            entityForm.id = response.data.data.id;
          } else {
            try {
              if (response.entityError) {
                throw new Error(entityErrorToString(response.entityError));
              } else if (response.error) {
                throw new Error(response.error);
              }
              throw new Error('response error');
            } catch (e: unknown) {
              console.error(e);

              if (e instanceof Error && e.message === '만료된 토큰 정보 입니다.') {
                throw new Error('만료된 토큰 정보 입니다.', { cause: e });
              }

              return { entityForm: entityForm, errors: ['데이터를 조회할 수 없습니다.'] };
            }
          }
        } catch (e) {
          console.error('Error during fetchData:', e);
          return { entityForm: entityForm, errors: ['데이터를 조회할 수 없습니다.'] };
        }
      } else {
        // delay 0.1 sec
        // 여기서 딜레이를 주지 않으면 모달 창에서 탭 순서가 엉망이 되어 버린다.
        await delay(100);
      }
    }

    // fields 에 CustomOptionField 가 있다면 CustomOption 정보를 조회해 SelectOption 값을 넣어 준다.
    // 이 작업은 CustomOptionField 에서도 options 가 없다면 동일하게 이뤄지지만 listgrid 에서 최초 1회 실행하기 위해 여기에 넣어 준다.
    for (const field of entityForm.fields.values()) {
      if (field instanceof CustomOptionField) {
        const options = await getCustomOptionValues(field.alias);
        const newField = field.withOptions(options).clone(true);
        entityForm.fields.set(field.getName(), newField);
      }

      // PhoneNumberField 가 있다면 sourceType, enableSms 설정
      if (field instanceof PhoneNumberField) {
        // 만약 이 PhoneNumberField 의 enableSMS 가 true 라면, view 페이지에서 SMS 발송 이력 필드를 자동으로 추가한다.
        if (
          isTrue(field.enableSms) &&
          hasAnyRole(entityForm.session, 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STAFF')
        ) {
          // SMS 발송 이력 탭 정의 (STATUS_TAB_INFO.order - 10 = 999990)
          const SMS_HISTORY_TAB: TabInfo = {
            id: 'smsHistory',
            label: 'SMS 발송 이력',
            order: STATUS_TAB_INFO.order - 10,
            hidden: false,
          };

          const smsHistoryField = createSmsHistoryField(
            field.getName() + 'SmsHistory',
            field.getOrder() + 1,
            field.getName(),
          );

          if (smsHistoryField) {
            smsHistoryField.withLabel('SMS 발송 이력').withModifyOnly().withHideLabel(true);

            entityForm.addFields({
              tab: SMS_HISTORY_TAB,
              items: [smsHistoryField],
            });
          }
        }
      }
    }

    if (!list) {
      if (entityForm.onInitialize && !isEmpty(entityForm.onInitialize)) {
        for (const init of [...entityForm.onInitialize]) {
          try {
            entityForm = await init(entityForm, props.session);
          } catch (e) {
            // nothing to do
            console.error(e);
          }
        }
      }

      // onInitialize 에서 동적으로 추가된 필드에 대해 fetch 된 데이터를 바인딩한다.
      // setFetchedValues 시점에 존재하지 않았던 필드는 값이 누락되므로 여기서 보완한다.
      if (fetchedEntity) {
        entityForm.fields.forEach((field, key) => {
          // fetched 값이 없는 필드만 처리 (setFetchedValues 에서 이미 처리된 필드는 건너뜀)
          if (field.value?.fetched !== undefined) return;

          if (key.includes('.')) {
            const keyParts = key.split('.');
            let objectValue: any = fetchedEntity;
            for (let i = 0; i < keyParts.length - 1; i++) {
              objectValue = objectValue?.[keyParts[i]!];
              if (objectValue === undefined || objectValue === null) break;
            }
            if (objectValue !== undefined && objectValue !== null) {
              const fieldName = keyParts[keyParts.length - 1]!;
              if (objectValue[fieldName] !== undefined) {
                field.value = {
                  current: objectValue[fieldName],
                  fetched: objectValue[fieldName],
                  default: field.value?.default,
                };
              }
            }
          } else {
            if (fetchedEntity[key] !== undefined) {
              field.value = {
                current: fetchedEntity[key],
                fetched: fetchedEntity[key],
                default: field.value?.default,
              };
            }
          }
        });
      }
    }

    return { entityForm: entityForm };
  }

  /**
   * 필드, 필드그룹, 탭의 숨김 상태를 설정합니다.
   *
   * 이 메소드는 세 가지 타입의 숨김 처리를 통합하여 제공합니다:
   * - FIELD: 개별 필드나 컬렉션의 숨김 상태 설정
   * - GROUP: 특정 탭 내 필드그룹의 모든 필드를 일괄 숨김 처리
   * - TAB: 탭 전체와 그 하위 모든 필드를 일괄 숨김 처리
   *
   * @param props 숨김 설정 옵션 또는 필드명 (기존 호환성용)
   * @param props.type 숨김 대상 타입 ('FIELD' | 'GROUP' | 'TAB')
   * @param props.hidden 숨김 여부 (true: 숨김, false: 표시)
   * @param props.fieldName [FIELD 타입] 대상 필드 또는 컬렉션의 이름
   * @param props.tabId [GROUP/TAB 타입] 대상 탭 ID
   * @param props.fieldGroupId [GROUP 타입] 대상 필드그룹 ID
   * @param hidden 기존 API 호환성을 위한 숨김 여부 (props가 string일 때만 사용)
   *
   * @returns EntityForm 인스턴스 (메소드 체이닝 지원)
   *
   * @example
   * // 개별 필드 숨김
   * entityForm.withHidden({ type: 'FIELD', hidden: true, fieldName: 'email' });
   *
   * @example
   * // 필드그룹 전체 숨김
   * entityForm.withHidden({
   *   type: 'GROUP',
   *   hidden: true,
   *   tabId: 'education',
   *   fieldGroupId: 'university'
   * });
   *
   * @example
   * // 탭 전체 숨김
   * entityForm.withHidden({ type: 'TAB', hidden: true, tabId: 'advancedSettings' });
   *
   * @example
   * // 기존 API 호환성 (deprecated)
   * entityForm.withHidden('fieldName', true);
   *
   * @since 1.0.0
   */
  withHidden(
    props:
      | { type: 'FIELD'; hidden: boolean; fieldName: string }
      | { type: 'GROUP'; hidden: boolean; tabId: string; fieldGroupId: string }
      | { type: 'TAB'; hidden: boolean; tabId: string }
      | string,
    hidden?: boolean,
  ): this {
    if (typeof props === 'string') {
      const name = props;
      const hiddenValue = hidden ?? false;

      const field = this.getField(name);
      if (field) {
        this.fields.set(name, field.withHidden(hiddenValue));
        return this;
      }

      const collection = this.getCollection(name);
      if (collection) {
        this.collections.set(name, collection.withHidden(hiddenValue));
        return this;
      }

      return this;
    }

    const { type, hidden: hiddenValue } = props;

    switch (type) {
      case 'FIELD':
        const { fieldName } = props as { type: 'FIELD'; hidden: boolean; fieldName: string };
        const field = this.getField(fieldName);
        if (field) {
          this.fields.set(fieldName, field.withHidden(hiddenValue));
        } else {
          const collection = this.getCollection(fieldName);
          if (collection) {
            this.collections.set(fieldName, collection.withHidden(hiddenValue));
          }
        }
        break;

      case 'GROUP':
        const { tabId, fieldGroupId } = props as {
          type: 'GROUP';
          hidden: boolean;
          tabId: string;
          fieldGroupId: string;
        };

        const tab = this.getTab(tabId);
        if (tab) {
          const fieldGroup = tab.fieldGroups.find((group) => group.id === fieldGroupId);
          if (fieldGroup) {
            let affectedFields = 0;
            fieldGroup.fields.forEach((field) => {
              this.withHidden({ type: 'FIELD', hidden: hiddenValue, fieldName: field.name });
              affectedFields++;
            });
          }
        }
        break;

      case 'TAB':
        const { tabId: targetTabId } = props as { type: 'TAB'; hidden: boolean; tabId: string };

        const targetTab = this.getTab(targetTabId);
        if (targetTab) {
          targetTab.hidden = hiddenValue;
          let affectedFields = 0;
          targetTab.fieldGroups.forEach((fieldGroup) => {
            fieldGroup.fields.forEach((field) => {
              this.withHidden({ type: 'FIELD', hidden: hiddenValue, fieldName: field.name });
              affectedFields++;
            });
          });
        }
        break;
    }

    return this;
  }

  async delete(): Promise<EntityFormActionResult> {
    if (!(this instanceof EntityForm)) {
      throw new Error('EntityFormActions.delete() can only be called on EntityForm');
    }

    if (this.getRenderType() === 'create') {
      const result: EntityFormActionResult = { entityForm: this };
      result.errors = ['생성된 데이터만 삭제 가능합니다.'];
      return result;
    }

    return await this.deleteAll([this.id]);
  }

  async deleteAll(
    idList: (string | number | bigint | null | undefined)[],
  ): Promise<EntityFormActionResult> {
    if (!(this instanceof EntityForm)) {
      throw new Error('EntityFormActions.deleteAll() can only be called on EntityForm');
    }

    const result: EntityFormActionResult = { entityForm: this };

    if (isEmpty(idList)) {
      result.errors = ['삭제할 대상이 없습니다.'];
      return result;
    }

    const url = `${this.getUrl()}/delete`;
    const formData: Record<string, unknown> = {};
    formData['revisionEntityName'] = this.getRevisionEntityName();
    formData['ids'] = idList;

    const response = await getExternalApiDataWithError({
      url: url,
      method: 'DELETE',
      formData: formData,
    });

    if (response.data) {
      // 정상 삭제된 경우
      result.refreshOrList = true;
      // 성공 시 Alert 메시지 초기화
      this.clearAlertMessages(true);
    } else {
      result.errors = [response.error ?? '데이터 삭제 중 오류가 발생했습니다.'];
    }

    if (this.postDelete) {
      await this.postDelete(this, idList);
    }

    return result;
  }

  getFields(type?: FieldType, orderByView?: boolean): EntityField[] {
    if (!(this instanceof EntityForm)) {
      throw new Error('EntityFormActions.getFields() can only be called on EntityForm');
    }

    const fields: EntityField[] = [];

    Array.from(this.fields.values()).forEach((field) => {
      if (type === undefined || field.type === type) {
        const target = isTrue(orderByView)
          ? field.withOrder(
              this.getViewOrder(field.getTabId(), field.getFieldGroupId(), field.order),
            )
          : field;
        fields.push(target);
      }
    });

    fields.sort((a, b) => a.order - b.order); // sort by order

    return fields;
  }

  withOverrideSubmitData(
    fn: (
      entityForm: EntityForm<T>,
      data: any,
    ) => Promise<{
      data: any;
      modifiedFields?: string[];
      removePrevious?: boolean;
      error?: boolean;
      errors?: FieldError[];
    }>,
  ): this {
    this.overrideSubmitData = fn;
    return this;
  }

  public async setFetchedValues(entity: Partial<T> | any): Promise<EntityForm<T>> {
    // 원본 엔티티 객체를 저장 (등록된 필드 외 속성 접근용)
    this.fetchedEntity = entity;

    // 서버 응답에 manageEntityForm이 있으면 설정
    if (entity.manageEntityForm) {
      this.manageEntityForm = entity.manageEntityForm;
    }

    this.fields.forEach((field, key) => {
      // key 에 . 이 찍혀 있으면 객체가 값으로 들어와 있다는 뜻이다.
      if (key.includes('.')) {
        const keyParts = key.split('.');

        // 재귀적으로 중첩 객체에 접근한다. (score.student.name 같은 3단계 이상 중첩 지원)
        let objectValue: any = entity;
        for (let i = 0; i < keyParts.length - 1; i++) {
          objectValue = objectValue?.[keyParts[i]!];
          if (objectValue === undefined || objectValue === null) {
            break;
          }
        }

        if (objectValue !== undefined && objectValue !== null) {
          const fieldName = keyParts[keyParts.length - 1]!;
          field.value = {
            current: objectValue[fieldName],
            fetched: objectValue[fieldName],
            default: field.value?.default,
          };
        }
      } else {
        if (entity[key] !== undefined) {
          field.value = {
            current: entity[key],
            fetched: entity[key],
            default: field.value?.default,
          };
        } else {
          // json 에 데이터가 없다는 것은 해당 field 가 비어 있다는 뜻이다.
          field.value = { current: undefined, fetched: undefined, default: field.value?.default };
        }
      }
    });

    let entityForm = this as unknown as EntityForm<T>;
    // onFetchData 콜백 실행
    if (this.onFetchData && !isEmpty(this.onFetchData) && this instanceof EntityForm) {
      for (const postFetch of [...this.onFetchData]) {
        try {
          entityForm = await postFetch(this as unknown as EntityForm<T>, entity);
        } catch (e) {
          // nothing to do
          console.error(e);
        }
      }
    }

    // 데이터가 로드되었음을 표시 - initialize()에서 중복 fetch 방지
    entityForm.dataPreloaded = true;

    return entityForm;
  }

  public async fetchData(fetchUrl: string = this.getFetchUrl()): Promise<ResponseData> {
    if (this.overrideFetchData !== undefined) {
      return this.overrideFetchData(fetchUrl, this);
    }

    if (this.isSessionRequired()) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const session = useSession();

      if (session === undefined) {
        const response = new ResponseData();
        response.status = 500;
        response.error = 'Session is not valid';
        return Promise.resolve(response);
      }
    }

    try {
      return await callExternalHttpRequest({
        url: fetchUrl,
        method: 'GET',
      });
    } catch (error) {
      console.error('Error during external HTTP request:', error);
      const response = new ResponseData();
      response.status = 500;
      response.error = 'Failed to fetch data';
      return Promise.resolve(response);
    }
  }

  async internalSave(
    session?: Session,
    skipValidation?: boolean,
    forceIncludeExceptOnSave?: boolean,
  ): Promise<EntityFormActionResult> {
    // 아래는 기본 저장 로직이다.
    const renderType = this.getRenderType();

    // 필드 에러 초기화
    this.errors = [];

    let form = this.clone(true) as EntityForm<T>;

    if (renderType === 'update' && !this.isDirty()) {
      // update 에서 변경된 정보가 전혀 없다면 수정할 내용이 없다는 에러를 낸다.
      return { actionType: renderType, entityForm: form, errors: ['수정된 항목이 없습니다.'] };
    }

    const fieldErrors = isTrue(skipValidation)
      ? []
      : await this.validate({ fieldNames: undefined, session });

    if (!isEmpty(fieldErrors)) {
      return {
        actionType: renderType,
        entityForm: form.withErrors(fieldErrors),
        errors: ['입력 값이 올바르지 않습니다.'],
      };
    }

    const submitFormData: SubmitFormData = await this.getSubmitFormData(forceIncludeExceptOnSave);

    if (submitFormData.error) {
      const errorMessages = submitFormData.errors?.flatMap((e) => e.errors).filter(Boolean);
      const errors = errorMessages?.length ? errorMessages : ['입력 값이 올바르지 않습니다.'];
      return { actionType: renderType, entityForm: form.withErrors(submitFormData.errors), errors };
    } else {
      const targetUrl =
        renderType === 'create' ? `${this.getUrl()}/add` : `${this.getUrl()}/${this.id}`;
      const method = renderType === 'create' ? 'POST' : 'PUT';

      // 서버 extension 처리를 위한 헤더 추가
      const extensionPoint =
        renderType === 'create' ? ExtensionPoint.PRE_CREATE : ExtensionPoint.PRE_UPDATE;
      const response = await getExternalApiDataWithError({
        url: targetUrl,
        method: method,
        formData: submitFormData.data,
        overrideHeaders: new Map([
          ['X-EntityForm-Name', this.name],
          ['X-Extension-Point', extensionPoint],
        ]),
      });

      if (response.data) {
        // entityForm 이 데이터로 넘어 온다.
        form.id = response.data.id;

        // 성공 시 Alert 메시지 초기화
        form.clearAlertMessages(true);

        form = await form.setFetchedValues(response.data);

        if (form.onInitialize && !isEmpty(form.onInitialize)) {
          for (const init of [...form.onInitialize]) {
            try {
              form = await init(form);
            } catch (e) {
              // nothing to do
              console.error(e);
            }
          }
        }

        const result: EntityFormActionResult = {
          actionType: renderType,
          entityForm: form,
          errors: [],
        };

        // 확장 포인트 처리
        await this.postSave?.(result);

        return result;
      } else {
        let jsonError = false;
        const fieldErrors: FieldError[] = [];
        let globalError;

        if (response.error) {
          try {
            // intentional: errorObject shape varies by backend error variant
            let errorObject: any;

            // entityError가 있으면 구조화된 정보 사용
            if (response.entityError) {
              // entityError.error가 객체인지 문자열인지 확인
              if (
                typeof response.entityError.error === 'object' &&
                response.entityError.error !== null
              ) {
                errorObject = response.entityError.error;
              } else if (typeof response.entityError.error === 'string') {
                // 문자열인 경우 message로 설정
                errorObject = { message: response.entityError.error };
              } else {
                // entityError 전체를 사용
                errorObject = response.entityError;
              }
              jsonError = true;
            } else if (typeof response.error === 'string') {
              // response.error가 문자열인 경우 JSON 파싱 시도
              try {
                const parsed = parse<{ error?: unknown } & Record<string, unknown>>(response.error);
                errorObject = parsed.error ?? parsed;
                jsonError = true;
              } catch (parseError) {
                // JSON이 아닌 단순 문자열인 경우
                globalError = response.error;
                jsonError = false;
              }
            } else {
              // response.error는 문자열 타입이므로 이 블록은 실행되지 않음
              errorObject = response.error;
            }

            if (errorObject) {
              // fieldError가 있는지 확인하고, 비어있지 않은 경우에만 처리
              let hasFieldErrors = false;

              if (errorObject.fieldError) {
                if (errorObject.fieldError instanceof Map) {
                  // Map의 경우 size가 0보다 큰지 확인
                  if (errorObject.fieldError.size > 0) {
                    errorObject.fieldError.forEach((fieldError: string[], fieldName: string) => {
                      const label = form.getLabel(fieldName) ?? '저장 오류';
                      fieldErrors.push({ name: fieldName, label: label, errors: fieldError });
                      hasFieldErrors = true;
                    });
                  }
                } else if (typeof errorObject.fieldError === 'object') {
                  // 일반 객체의 경우 빈 객체가 아닌지 확인
                  const entries = Object.entries(errorObject.fieldError);
                  if (entries.length > 0) {
                    entries.forEach(([fieldName, fieldError]) => {
                      const label = form.getLabel(fieldName) ?? '저장 오류';
                      fieldErrors.push({
                        name: fieldName,
                        label: label,
                        errors: fieldError as string[],
                      });
                      hasFieldErrors = true;
                    });
                  }
                }
              }

              // fieldError가 없거나 비어있는 경우에만 globalError 설정
              if (!hasFieldErrors && errorObject.message) {
                globalError = errorObject.message;
              }
              form.withErrors(fieldErrors);
              form.withShouldReload(true);

              jsonError = true;
            }
          } catch (e) {
            // 에러가 json 타입이 아니라면 실제 시스템 에러다.
            console.error('Error processing exception:', response.error, e);
          }
        }

        // fieldError가 있으면 에러 메시지를 표시하지 않음 (필드별로 표시되므로)
        let errorMessage;

        if (fieldErrors.length > 0) {
          // 필드 에러가 있으면 일반 에러 메시지는 표시하지 않지만, 에러 상태임은 표시
          return {
            actionType: renderType,
            entityForm: form.withErrors(fieldErrors),
            errors: ['입력 값이 올바르지 않습니다.'],
          };
        } else {
          // 필드 에러가 없을 때만 일반 에러 메시지 표시
          errorMessage =
            (!jsonError ? response.error : globalError ? globalError : undefined) ??
            '저장 중 오류가 발생했습니다.';
        }

        // errorMessage 가 있으면 errors 배열에 최소한 하나의 항목을 추가
        // 이렇게 해야 호출하는 쪽에서 에러 상태임을 인식할 수 있음
        const errors: string[] = [];
        if (errorMessage) {
          errors.push(errorMessage);
        }

        return { actionType: renderType, entityForm: form, errors };
      }
    }
  }

  async save(
    session?: Session,
    skipValidation?: boolean,
    forceIncludeExceptOnSave?: boolean,
  ): Promise<EntityFormActionResult> {
    // 저장 로직이 오버라이드 됐다면
    const actionType = this.getRenderType();

    if (this.onSave) {
      const form = this.clone(true);
      const result: EntityFormActionResult = await this.onSave(form);
      result.actionType = actionType;

      if (isEmpty(result.errors)) {
        // 성공한 것
        // 성공 시 Alert 메시지 초기화
        form.clearAlertMessages(true);
        await form.postSave?.(result);
      }

      return result;
    }

    return await this.internalSave(session, skipValidation, forceIncludeExceptOnSave);
  }

  public async getSubmitFormData(forceIncludeExceptOnSave?: boolean): Promise<SubmitFormData> {
    const renderType = this.getRenderType();

    // intentional: generic entity payload assembled from heterogeneous fields
    let data: any = {};
    let error: boolean = false;
    let modifiedFields: string[] = [];
    const errors: FieldError[] = [];

    try {
      // revisionEntityName 을 넣어 준다.
      data['revisionEntityName'] = this.getRevisionEntityName();

      const dataMap = new Map<string, any>();

      // ManyToOneField 처리를 위한 헬퍼 함수
      const processManyToOneField = (
        field: any,
        value: any,
        targetObject: any,
        fieldNameOverride?: string,
      ) => {
        if (field instanceof AbstractManyToOneField) {
          const manyToOneConfig = field.config;
          const baseFieldName = fieldNameOverride || field.getName();
          const lastPart = baseFieldName.includes('.')
            ? baseFieldName.substring(baseFieldName.lastIndexOf('.') + 1)
            : baseFieldName;
          const idFieldName = endsWith(lastPart, 'Id') ? lastPart : `${lastPart}Id`;

          if (value) {
            const relationId = manyToOneConfig.field?.id ?? 'id';
            targetObject[idFieldName] = value[relationId] ?? value;
          } else {
            targetObject[idFieldName] = null;
          }
          return true;
        }
        return false;
      };

      // 권한 체크를 위해 session에서 userPermissions를 가져온다.
      const userPermissions = this.session?.roles ?? this.session?.authentication?.roles;

      for (const field of this.fields.values()) {
        // 권한이 없는 필드는 저장 데이터에서 제외한다.
        if (!field.isPermitted(userPermissions)) {
          continue;
        }

        const value: any = await field.getSaveValue(this, renderType);

        const modifiedOnCreate = renderType === 'create' && value !== undefined;

        if (
          modifiedOnCreate ||
          (field.isDirty() && (!isTrue(field.exceptOnSave) || forceIncludeExceptOnSave))
        ) {
          modifiedFields.push(field.getName());

          // 만약 필드 이름에 . 가 있다면 특정 객체를 만들어야 한다.
          const fieldName = field.getName();
          const dotIndex = fieldName.indexOf('.');
          if (dotIndex !== -1) {
            const key = fieldName.substring(0, dotIndex);
            const objectFieldName = fieldName.substring(dotIndex + 1);

            if (!dataMap.has(key)) {
              dataMap.set(key, {});
            }

            const targetObject = dataMap.get(key);
            const targetValue = value != null ? (value[fieldName] ?? value) : value;

            // 중첩된 필드도 ManyToOneField인지 확인
            if (!processManyToOneField(field, targetValue, targetObject, objectFieldName)) {
              targetObject[objectFieldName] = targetValue;
            }
          } else {
            // ManyToOneField 처리
            if (!processManyToOneField(field, value, data)) {
              data[field.getName()] = value;
            }
          }

          if (dataMap.size > 0) {
            // dataMap 의 key 를 iteration 해서 각 value 를 data 에 추가한다.
            for (const key of dataMap.keys()) {
              data[key] = dataMap.get(key);
            }
          }
        }
      }

      if (renderType === 'update') {
        // update 때는 수정된 필드만 따로 지정한다.
        data['modifiedFields'] = modifiedFields;
      }
    } catch (e) {
      error = true;
      console.error(e);
    }

    if (this.overrideSubmitData !== undefined) {
      const result = await this.overrideSubmitData?.(this, data);
      data = result.data;

      if (isTrue(result.removePrevious)) {
        modifiedFields = [...(result.modifiedFields ?? [])];
      } else {
        if (result.modifiedFields) {
          for (const field of result.modifiedFields) {
            if (!modifiedFields.includes(field)) {
              modifiedFields.push(field);
            }
          }
        }
      }

      // overrideSubmitData 후 업데이트된 modifiedFields를 data에 반영
      if (renderType === 'update' && modifiedFields.length > 0) {
        data['modifiedFields'] = modifiedFields;
      }

      if (result.error !== undefined) {
        error = result.error;
      }
      if (result.errors !== undefined && result.errors.length > 0) {
        errors.push(...result.errors);
      }
    }

    return {
      data,
      modifiedFields,
      error,
      errors,
    };
  }

  async validate(props?: {
    fieldNames?: string[] | undefined;
    session?: Session | undefined;
  }): Promise<FieldError[]> {
    const fieldNames = props?.fieldNames;
    const session = props?.session;

    const fieldErrors: FieldError[] = [];

    const useExplicitFields = fieldNames !== undefined && fieldNames.length > 0;

    for (const field of this.fields.values()) {
      if (useExplicitFields && !fieldNames.includes(field.getName())) {
        continue;
      }

      const result = await field.validate(this, session);

      const errorMessages: string[] = [];

      if (Array.isArray(result)) {
        // 실제 오류가 난 것이다.
        for (const error of result) {
          errorMessages.push(error.message);
        }
      } else {
        // 단수로 넘어 온 경우에는 error 여부를 확인해야 한다.
        if (result.hasError()) {
          errorMessages.push(result.message);
        }
      }

      if (errorMessages.length > 0) {
        fieldErrors.push({
          name: field.getName(),
          label: field.getLabel(),
          errors: [...errorMessages],
          tabId: field.getTabId(),
        });
      }
    }

    return fieldErrors;
  }

  withCheckDuplicate(
    fieldName: string,
    checkDuplicate: (entityForm: EntityForm<T>, value: string) => Promise<ValidateResult>,
  ): this {
    const field = this.getField(fieldName);

    if (field && field instanceof CheckButtonValidationField) {
      field.withCheckButtonValidation(checkDuplicate);
    }

    return this;
  }

  withFieldToLayout(layout: 'full' | 'half') {
    this.fields.forEach((value, key, map) => {
      if (value instanceof FormField) {
        value.withLayout(layout);
      }
    });
    return this;
  }
}
