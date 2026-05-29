import { AdditionalColorType, ColorType } from '../common/type';
import { SearchForm } from './SearchForm';
import { callExternalHttpRequest, ResponseData } from '../misc';
import { isTrue } from '../utils/BooleanUtil';
import { signOut } from '../auth/SessionProvider';
import { showConfirm } from '../message';

export interface SelectOption {
  // 옵션 라벨
  label?: string;

  // 옵션 라벨이 긴 ~~~ 문자열인 경우 목록에 표시될 때는 좀 더 짧은 형태일 수 있다.
  listLabel?: string;

  // 옵션값
  value: any;

  // 이 옵션값이 목록에 표시될 때 Badge 색상
  color?: ColorType | AdditionalColorType;

  /**
   * 이 옵션값이 현재 필드의 값일 때 필드를 읽기 전용으로 설정할지 여부.
   * true이면 해당 값이 선택되었을 때 변경이 불가능합니다.
   */
  readonly?: boolean;

  /**
   * 이 옵션값에서 전이 가능한 대상 옵션 값 목록.
   * 이 값이 설정되면 현재 옵션에서 targets 배열에 포함된 값으로만 변경할 수 있습니다.
   * 이 값이 없으면 모든 옵션으로 변경 가능합니다.
   */
  targets?: string[];
}

export type MinMaxLimit = { min?: number; max?: number };

export type MinMaxStringLimit = { min?: string; max?: string };

export type EntityWithId = { id?: string | bigint; [key: string]: any };

export class PageResult {
  list: EntityWithId[] = [];
  totalCount: number;
  totalPage: number;
  searchForm: SearchForm = new SearchForm();
  errors?: string[];

  constructor(props: {
    list: EntityWithId[];
    totalCount: number;
    totalPage: number;
    searchForm: SearchForm;
  }) {
    this.list = props.list;
    this.totalCount = props.totalCount;
    this.totalPage = props.totalPage;
    this.searchForm = props.searchForm;
  }

  static createEmptyResult(searchForm?: SearchForm): PageResult {
    return new PageResult({
      list: [],
      totalCount: 0,
      totalPage: 0,
      searchForm: searchForm || new SearchForm(),
    });
  }

  withErrors(...errors: string[]): this {
    this.errors = errors;
    return this;
  }

  static async fetchListData(
    url: string,
    searchForm: SearchForm,
    extensionOptions?: {
      entityFormName?: string;
      extensionPoint?: string;
    },
    serverProxy: boolean = true,
  ) {
    // 정적 빌드 시 cookies 사용으로 인한 오류 방지
    try {
      /**
       * 만약 serverSide가 true 라면 넘어 온 url 을 파라미터로 포함해 내부 프록시 api 를 호출하고 그 결과를 response 로 받는다.
       */

      const response: ResponseData | null = await callExternalHttpRequest({
        url: url,
        method: 'POST',
        formData: searchForm,
        ...(extensionOptions?.entityFormName !== undefined
          ? { entityFormName: extensionOptions.entityFormName }
          : {}),
        ...(extensionOptions?.extensionPoint !== undefined
          ? { extensionPoint: extensionOptions.extensionPoint }
          : {}),
        serverProxy: serverProxy,
      });

      if (response.isError()) {
        if (
          response.error === 'Failed to fetch' &&
          response.status === 500 &&
          typeof window !== 'undefined'
        ) {
          await showConfirm({
            title: '세션이 만료되었습니다.',
            message: '서비스를 이용하려면 다시 로그인해야 합니다.',
            confirmButtonText: '다시 로그인 하기',
            cancelButtonText: '',
            onConfirm: async () => {
              await signOut();
            },
          });
        }

        if (response.entityError) {
          return PageResult.createEmptyResult(searchForm).withErrors(
            response.entityError.error.message ?? '데이터 로딩 중 오류가 발생했습니다.',
          );
        }

        return PageResult.createEmptyResult(searchForm).withErrors(
          response.error ?? '데이터 로딩 중 오류가 발생했습니다.',
        );
      }

      // 방어적 envelope 처리 — host adapter 가 payload 를 ResponseData.data 로 감싸지 않고
      // top-level 에 둔 경우에도 동작한다 (data 부재 시 response 자체를 payload 로 취급).
      // 정상 wrap(데이터가 .data 에 존재) 시 분기 없이 동일 동작 — zero regression.
      // host 가 raw json(.isError 미보유)을 반환하는 경우는 위 isError() 단계에서 throw → catch 로
      // 처리되며, ApiClient JSDoc 의 envelope 계약(ResponseData wrap 필수)을 따르도록 안내한다.
      // intentional: payload shape is the backend search response (arbitrary fields)
      const payload = (response.data ?? (response as unknown)) as Record<string, any>;

      const newSearchForm = SearchForm.deserialize(payload.searchForm);

      if (searchForm.hasPreservedFilters()) {
        searchForm.getPreservedFilters().forEach((filter) => {
          if (isTrue(filter.remove)) {
            newSearchForm.removeFilter(filter.name);
          } else if (isTrue(filter.excludePreserve)) {
            // TODO: Preserve exclusion logic
          } else {
            newSearchForm.handleAndFilter(filter.name, filter.value, filter.op);
          }
        });
      }

      // list 또는 content 필드 확인
      const listData = payload.list || payload.content || [];

      const responseList: EntityWithId[] = listData.map((item: EntityWithId) => ({
        ...item,
        id: String(item.id), // id를 문자열로 강제 변환
      }));

      return new PageResult({
        list: responseList,
        totalCount: payload.totalCount,
        totalPage: payload.totalPage,
        searchForm: newSearchForm,
      });
    } catch (error) {
      return PageResult.createEmptyResult(searchForm).withErrors(
        '데이터 로딩 중 오류가 발생했습니다.',
      );
    }
  }
}
