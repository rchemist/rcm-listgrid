import { Session } from '../auth/types';
import { EntityForm } from '../config/EntityForm';

/**
 * Extension Context - Client에서 사용 가능한 정보
 * 제네릭 Session 타입 사용 - 프로젝트별로 구체 타입 확장 가능
 */
export interface ClientExtensionContext<TSession = Session, TUser = any> {
  session?: TSession;
  user?: TUser; // session에서 얻은 사용자 정보
  entityForm: EntityForm; // Client에서는 EntityForm 전체 접근 가능
  [key: string]: any; // 추가 컨텍스트 데이터
}

/**
 * Extension 실행 옵션
 */
export interface ExtensionOptions {
  /** 실행 우선순위 (낮은 숫자가 먼저 실행됨) */
  priority?: number;
  /** Extension 활성화 여부 (기본값: true) */
  enabled?: boolean;
  /** 에러 발생 시 계속 진행할지 여부 (기본값: true) */
  continueOnError?: boolean;
  /** Extension 설명 */
  description?: string;
}

/**
 * Client Extension 함수 타입 - EntityForm 접근 가능
 */
export type ClientExtensionFunction<TInput, TOutput = TInput> = (
  data: TInput,
  context: ClientExtensionContext,
) => Promise<TOutput> | TOutput;

/**
 * Extension Point 정의
 * 클라이언트와 서버 모두에서 사용되는 공통 enum
 */
export enum ExtensionPoint {
  // LIST 관련
  PRE_FETCH_LIST = 'preFetchList',
  POST_FETCH_LIST = 'postFetchList',

  // CRUD 관련
  PRE_CREATE = 'preCreate',
  POST_CREATE = 'postCreate',
  PRE_READ = 'preRead',
  POST_READ = 'postRead',
  PRE_UPDATE = 'preUpdate',
  POST_UPDATE = 'postUpdate',
  PRE_DELETE = 'preDelete',
  POST_DELETE = 'postDelete',
}

/**
 * Client Extension 설정
 */
export interface ClientExtensionConfig {
  handler: ClientExtensionFunction<any>;
  options?: Omit<ExtensionOptions, 'executionContext'>;
}
