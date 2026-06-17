import { describe, it, expect } from 'vitest';
import { EntityForm } from './EntityForm';
import { NumberField } from '../components/fields/NumberField';
import { ResponseData } from '../api';

/**
 * Issue #9 — EntityForm.initialize() 단건 fetch 가 response.data.data(2-depth) 로 언랩하던 버그 회귀 방지.
 *
 * 정상 ApiClient 봉투 계약은 `response.data === backend payload`(1-depth) 이며 save/list/delete 가 이미 따른다.
 * 기존 코드(2-depth)는 봉투가 `{ data: ENTITY }` 일 때 `response.data.data === undefined` →
 * `setFetchedValues(undefined)` → `undefined.manageEntityForm` 크래시였다.
 */
function buildForm() {
  return new EntityForm('test', '/api/test')
    .withId('42')
    .addFields({ items: [new NumberField('amount', 1)] });
}

describe('EntityForm.initialize — Issue #9 단건 fetch 언랩 깊이', () => {
  it('1-depth 봉투({ data: ENTITY })에서 필드/ID 가 채워지고 크래시하지 않는다', async () => {
    const form = buildForm();
    // 표준 어댑터 봉투: ResponseData.data = bare entity (rcm-framework 0.1.0 AbstractCrudController)
    form.overrideFetchData = async () =>
      new ResponseData({ data: { id: '42', amount: 1000, manageEntityForm: { foo: 'bar' } } });

    const result = await form.initialize({});

    expect(result.errors).toBeUndefined();
    expect(result.entityForm.id).toBe('42');
    expect(result.entityForm.getField('amount')?.value?.fetched).toBe(1000);
    expect(result.entityForm.manageEntityForm).toEqual({ foo: 'bar' });
  });

  it('manageEntityForm 이 없는 bare entity 봉투에서도 정상 동작한다', async () => {
    const form = buildForm();
    form.overrideFetchData = async () => new ResponseData({ data: { id: '7', amount: 0 } });

    const result = await form.initialize({});

    expect(result.entityForm.id).toBe('7');
    // 0 은 유효값 — fetched 로 채워져야 한다
    expect(result.entityForm.getField('amount')?.value?.fetched).toBe(0);
  });
});

describe('EntityForm.setFetchedValues — Issue #9 nullish 방어선', () => {
  it('entity 가 undefined 여도 throw 하지 않고 현 form 을 반환한다', async () => {
    const form = buildForm();
    const result = await form.setFetchedValues(undefined as unknown as object);
    expect(result).toBe(form);
    expect(result.dataPreloaded).toBe(true);
  });

  it('entity 가 null 이어도 throw 하지 않는다', async () => {
    const form = buildForm();
    await expect(form.setFetchedValues(null as unknown as object)).resolves.toBeDefined();
  });
});
