import { describe, it, expect } from 'vitest';
import { resolveFilterOperator } from './filterOperator';
import { SelectField } from '../../fields/SelectField';
import { MultiSelectField } from '../../fields/MultiSelectField';
import { StringField } from '../../fields/StringField';
import { SelectOption } from '../../../form/Type';

const TWO: SelectOption[] = [
  { label: '신입학', value: 'FRESHMAN' },
  { label: '편입학', value: 'TRANSFER' },
];

const FOUR: SelectOption[] = [
  ...TWO,
  { label: '시간제', value: 'PART_TIME' },
  { label: '학점교류', value: 'EXCHANGE' },
];

/**
 * gjcu #1941 회귀 가드.
 *
 * 옵션 개수(`options.length > 2`) 기준으로 돌아가면 T1/T2 가 실패한다.
 */
describe('resolveFilterOperator', () => {
  it('T1 옵션 2개 셀렉트에서 1개를 고르면 IN 이다 (#1941 핵심)', () => {
    const field = new SelectField('admissionType', 100, TWO);
    expect(resolveFilterOperator(field, ['FRESHMAN'], 'EQUAL')).toBe('IN');
  });

  it('T2 옵션 2개 셀렉트에서 2개를 고르면 IN 이다 — EQUAL 이면 첫 값만 적용된다', () => {
    const field = new SelectField('admissionType', 100, TWO);
    expect(resolveFilterOperator(field, ['FRESHMAN', 'TRANSFER'], 'EQUAL')).toBe('IN');
  });

  it('T3 옵션 3개 이상 + 배열은 기존대로 IN 이다', () => {
    const field = new SelectField('admissionType', 100, FOUR);
    expect(resolveFilterOperator(field, ['FRESHMAN', 'PART_TIME'], 'EQUAL')).toBe('IN');
  });

  it('T4 값이 스칼라면 EQUAL 을 유지한다', () => {
    const field = new SelectField('admissionType', 100, TWO);
    expect(resolveFilterOperator(field, 'FRESHMAN', 'EQUAL')).toBe('EQUAL');
  });

  it('T5 singleFilter 필드는 배열이어도 EQUAL 이다', () => {
    const field = new SelectField('admissionType', 100, FOUR).withSingleFilter(true);
    expect(resolveFilterOperator(field, ['FRESHMAN'], 'EQUAL')).toBe('EQUAL');
  });

  it('T6 MultipleOptionalField 는 스칼라여도 IN 이다', () => {
    const field = new MultiSelectField('tags', 100, TWO);
    expect(resolveFilterOperator(field, 'FRESHMAN', 'EQUAL')).toBe('IN');
  });

  it('T7 OptionalField 가 아니면 입력 연산자를 그대로 돌려준다', () => {
    const field = new StringField('name', 100);
    expect(resolveFilterOperator(field, ['a', 'b'], 'LIKE')).toBe('LIKE');
    expect(resolveFilterOperator(undefined, ['a'], 'EQUAL')).toBe('EQUAL');
  });
});
