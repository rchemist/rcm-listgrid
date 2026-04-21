import {
  AbstractDateField,
  AbstractDateFieldProps,
  ViewListProps,
  ViewListResult,
} from './abstract';
import React from 'react';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { RenderType } from '../../config/Config';
import { fDate, fDateTime, fToNow } from '../../misc';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { FlatPickrDateField } from '../../ui';
import { isTrue } from '../../utils/BooleanUtil';
import { MinMaxStringLimit } from '../../form/Type';
import { DatetimeFilter } from './filter/DatetimeFilter';
import { isBlank } from '../../utils/StringUtil';
import { Tooltip } from '../../ui';
import { TextInput } from '../../ui';

interface DatetimeFieldProps extends AbstractDateFieldProps {}

export class DatetimeField extends AbstractDateField<DatetimeField> {
  constructor(name: string, order: number, limit?: MinMaxStringLimit, range?: boolean) {
    super(name, order, 'date', limit, range);
  }

  async getCurrentValue(renderType?: RenderType): Promise<string | undefined | string[]> {
    const value = await super.getCurrentValue(renderType);

    if (value === 'today') {
      if (isTrue(this.range)) {
        const today: Date = new Date();
        const tomorrow: Date = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return [fDate(today, `yyyy-MM-dd HH:mm`), fDate(tomorrow, `yyyy-MM-dd HH:mm`)];
      }
      return fDate(new Date(), `yyyy-MM-dd'T'HH:mm`);
    }

    return value;
  }

  /**
   * DatetimeField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const readonly = isTrue(this.readonly);
      const value = (await this.getCurrentValue(params.entityForm.getRenderType())) + '';

      if (readonly) {
        return (
          <TextInput
            name={`${this.name}_${params.entityForm.id}`}
            readonly={true}
            onChange={() => {
              // do nothing
            }}
            value={fDateTime(value)}
          ></TextInput>
        );
      } else {
        return (
          <FlatPickrDateField
            type={'datetime'}
            limit={this.limit}
            range={this.range}
            {...await getInputRendererParameters(this, params)}
          />
        );
      }
    })();
  }

  /**
   * DatetimeField 핵심 리스트 필터 렌더링 로직
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      return <DatetimeFilter {...params} name={this.getName()} limit={this.limit} />;
    })();
  }

  /**
   * DatetimeField 핵심 리스트 아이템 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    if (this.range) {
      const value = props.item[this.name];
      if (value == undefined) {
        return Promise.resolve({ result: '' });
      } else {
        return Promise.resolve({ result: `${fDateTime(value[0])} ~ ${fDateTime(value[1])}` });
      }
    } else {
      const viewRaw = isTrue(this.listConfig?.viewRaw);
      if (viewRaw) {
        return Promise.resolve({ result: fDate(props.item[this.name]) });
      } else {
        const value = fToNow(props.item[this.name]) ?? '';
        if (isBlank(value)) {
          return Promise.resolve({ result: '' });
        } else {
          return Promise.resolve({
            result: (
              <Tooltip label={`${fDateTime(props.item[this.name])}`}>
                <span>{value}</span>
              </Tooltip>
            ),
          });
        }
      }
    }
  }

  /**
   * DatetimeField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): DatetimeField {
    return new DatetimeField(name, order, this.limit, this.range);
  }

  static create(props: DatetimeFieldProps): DatetimeField {
    return new DatetimeField(props.name, props.order, props.limit, props.range).copyFields(
      props,
      true,
    );
  }
}
