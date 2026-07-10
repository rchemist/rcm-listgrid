import { describe, it, expect } from 'vitest';
import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';
import { ValidateResult, ValidationItem } from './Validation';
import { MinMaxNumberValidation } from './MinMaxNumberValidation';

/**
 * P0-1 회귀 테스트 — getValueAsNumber / getValueAsBoolean 의 연산자 우선순위 버그.
 *
 * 버그: `(value?.current ?? entityForm.getRenderType() === 'update') ? value?.fetched : value?.default`
 * `===` 가 `??` 보다 먼저 묶여 `value?.current ?? (renderType === 'update')` 로 평가되고,
 * 그 결과(현재값 자체가 아니라 boolean 화된 값)가 다시 삼항의 조건으로 쓰여
 * current 가 falsy(0, false) 이거나 truthy 이거나 상관없이 fetched/default 로 덮어써진다.
 *
 * 수정: getValueAsString 과 동일하게 삼항 전체를 괄호로 묶어
 * `value?.current ?? (renderType === 'update' ? value?.fetched : value?.default)` 로 평가한다.
 */

// getValueAsNumber / getValueAsBoolean 는 ValidationItem 의 concrete 메소드이므로
// validate() 만 최소 구현한 테스트용 서브클래스로 직접 호출한다.
class TestValidation extends ValidationItem {
  constructor() {
    super('TestValidation');
  }

  validate(): Promise<ValidateResult> {
    return Promise.resolve(ValidateResult.success());
  }
}

const make = () => new TestValidation();

describe('ValidationItem.getValueAsNumber / getValueAsBoolean — P0-1 연산자 우선순위 회귀', () => {
  it('update 모드에서 current 가 있으면 current 를 사용한다 (number)', () => {
    const form = new EntityForm('test', '/api/test').withId('1');
    const value: FieldValue<number> = { current: 5, fetched: 10, default: 1 };
    expect(make().getValueAsNumber(form, value)).toBe(5);
  });

  it('current === 0 은 fetched/default 로 덮어써지지 않는다 (숫자 falsy 엣지)', () => {
    const form = new EntityForm('test', '/api/test').withId('1');
    const value: FieldValue<number> = { current: 0, fetched: 99, default: 1 };
    expect(make().getValueAsNumber(form, value)).toBe(0);
  });

  it('current 가 없으면 update 모드에서 fetched 로 폴백한다', () => {
    const form = new EntityForm('test', '/api/test').withId('1');
    const value: FieldValue<number> = { fetched: 42, default: 1 };
    expect(make().getValueAsNumber(form, value)).toBe(42);
  });

  it('current === false 는 fetched/default 로 덮어써지지 않는다 (boolean falsy 엣지)', () => {
    const form = new EntityForm('test', '/api/test').withId('1');
    const value: FieldValue<boolean> = { current: false, fetched: true, default: true };
    expect(make().getValueAsBoolean(form, value)).toBe(false);
  });

  it('MinMaxNumberValidation 이 resolved current === 0 에 대해 min 위반을 실제로 감지한다', async () => {
    const form = new EntityForm('test', '/api/test').withId('1');
    const validation = new MinMaxNumberValidation(undefined, { min: 1 });
    const value: FieldValue<number> = { current: 0, fetched: 5, default: 99 };

    const result = await validation.validate(form, value);

    expect(result.hasError()).toBe(true);
  });

  it('MinMaxNumberValidation 이 min/max 범위 내 current 값은 통과시킨다', async () => {
    const form = new EntityForm('test', '/api/test').withId('1');
    const validation = new MinMaxNumberValidation(undefined, { min: 1, max: 10 });
    const value: FieldValue<number> = { current: 5, fetched: 0, default: 0 };

    const result = await validation.validate(form, value);

    expect(result.hasError()).toBe(false);
  });
});
