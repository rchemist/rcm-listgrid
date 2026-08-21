import { QueryConditionType } from '../../../form/SearchForm';
import { MultipleOptionalField, OptionalField } from '../../fields/abstract';

/**
 * 목록 필터 값의 직렬화 연산자를 결정한다.
 *
 * - singleFilter 지정 OptionalField → EQUAL (단일 선택 전용, RadioChip 으로 렌더된다)
 * - MultipleOptionalField → 항상 IN
 * - 그 외 OptionalField → 값이 배열이면 IN (체크박스/멀티셀렉트 다중 선택)
 *
 * 옵션 개수(`options.length > 2`)로 판단하던 이전 구현은 렌더 임계값
 * (SelectField CHECKBOX_THRESHOLD = 10)과 어긋났다. 옵션이 1~2개인 필터는 체크박스로 렌더되어
 * 배열 값을 만들면서도 EQUAL 로 직렬화됐고, backend EqualQueryProvider 가
 * `values[0]` 로 폴백하는 탓에 **2개 이상 선택하면 첫 값만 적용되는 조용한 오답**이 됐다.
 * (gjcu #1941 — 옵션 1~2개 목록 필터 32곳 공통)
 */
export function resolveFilterOperator(
  field: unknown,
  value: unknown,
  op: QueryConditionType,
): QueryConditionType {
  if (field instanceof OptionalField && field.singleFilter) {
    return 'EQUAL';
  }
  if (field instanceof MultipleOptionalField) {
    return 'IN';
  }
  if (field instanceof OptionalField && Array.isArray(value)) {
    return 'IN';
  }
  return op;
}
