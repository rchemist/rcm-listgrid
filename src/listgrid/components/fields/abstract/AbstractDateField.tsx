import { ListableFormField, ListableFormFieldProps } from './ListableFormField';
import { FieldType } from '../../../config/Config';
import { MinMaxStringLimit } from '../../../form/Type';

export interface AbstractDateFieldProps<
  TValue = any,
  TForm extends object = any,
> extends ListableFormFieldProps<TValue, TForm> {
  limit?: MinMaxStringLimit;
  range?: boolean;
}

export abstract class AbstractDateField<
  TSelf extends AbstractDateField<TSelf, TValue, TForm>,
  TValue = any,
  TForm extends object = any,
> extends ListableFormField<TSelf, TValue, TForm> {
  limit?: MinMaxStringLimit;
  range?: boolean;

  protected constructor(
    name: string,
    order: number,
    type: FieldType,
    limit?: MinMaxStringLimit,
    range?: boolean,
  ) {
    super(name, order, type);
    if (limit !== undefined) this.limit = limit;
    if (range !== undefined) this.range = range;
  }

  /**
   * range 가 true 면, 시작 시각 ~ 종료 시각 두 가지를 입력받게 됩니다.
   * @param range
   */
  withRange(range?: boolean): this {
    if (range !== undefined) this.range = range;
    else delete this.range;
    return this;
  }

  /**
   * 최소, 최대값 설정
   * @param limit
   */
  withLimit(limit?: MinMaxStringLimit): this {
    if (limit !== undefined) this.limit = limit;
    else delete this.limit;
    return this;
  }

  /**
   * 최소값 설정
   * @param min
   */
  withMin(min?: string): this {
    const newLimit: MinMaxStringLimit = {};
    if (min !== undefined) newLimit.min = min;
    if (this.limit?.max !== undefined) newLimit.max = this.limit.max;
    this.limit = newLimit;
    return this;
  }

  /**
   * 최대값 설정
   * @param max
   */
  withMax(max?: string): this {
    const newLimit: MinMaxStringLimit = {};
    if (this.limit?.min !== undefined) newLimit.min = this.limit.min;
    if (max !== undefined) newLimit.max = max;
    this.limit = newLimit;
    return this;
  }

  protected copyFields(
    origin: ListableFormFieldProps<TValue, TForm>,
    includeValue: boolean = true,
  ): this {
    return super.copyFields(origin, includeValue).withLimit(this.limit).withRange(this.range);
  }
}
