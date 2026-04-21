import {
  AbstractDateField,
  AbstractDateFieldProps,
  ViewListProps,
  ViewListResult,
  ViewRenderProps,
  ViewRenderResult,
} from './abstract';
import React from 'react';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { RenderType } from '../../config/Config';
import { fDate, fToNow } from '../../misc';
import { FlatPickrDateField } from '../../ui';
import { IconCalendar } from '@tabler/icons-react';
import { isTrue } from '../../utils/BooleanUtil';
import { MinMaxStringLimit } from '../../form/Type';
import { TextInput } from '../../ui';

interface DateFieldProps extends AbstractDateFieldProps {}

export class DateField extends AbstractDateField<DateField> {
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
        return [fDate(today), fDate(tomorrow)];
      }

      return fDate(new Date());
    }

    return value;
  }

  /**
   * DateField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      const readonly = isTrue(this.readonly);

      let value = await this.getCurrentValue(params.entityForm.getRenderType());
      if (value) {
        if (this.range && Array.isArray(value)) {
          value = `${fDate(value[0]!)} ~ ${fDate(value[1]!)}`;
        } else {
          value = fDate(value + '');
        }
      }

      if (readonly) {
        return (
          <TextInput
            name={`${this.name}_${params.entityForm.id}`}
            readonly={true}
            onChange={(value: any) => {
              // do nothing
            }}
            value={value}
          ></TextInput>
        );
      }

      return (
        <FlatPickrDateField
          type={'date'}
          limit={this.limit}
          range={this.range}
          {...await getInputRendererParameters(this, params)}
        />
      );
    })();
  }

  /**
   * DateField 핵심 리스트 필터 렌더링 로직
   */
  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    return (async () => {
      return (
        <FlatPickrDateField
          type={'date'}
          name={this.getName()}
          onChange={(value: any) => {
            if (Array.isArray(value) && value.length === 2) {
              if (value[0] === value[1]) {
                const until: Date = new Date(value[1]);
                until.setDate(until.getDate() + 1);
                params.onChange([value[0], fDate(until, `yyyy-MM-dd`)], 'BETWEEN');
              } else {
                params.onChange(value, 'BETWEEN');
              }
              return;
            }
          }}
          limit={this.limit}
          range={true}
          value={params.value}
        />
      );
    })();
  }

  /**
   * DateField 핵심 리스트 아이템 렌더링 로직
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    const value = props.item[this.name];
    if (this.range && Array.isArray(value) && value.length === 2) {
      return Promise.resolve({
        result: `${fDate(value[0], 'yyyy-MM-dd')} ~ ${fDate(value[1], 'yyyy-MM-dd')}`,
      });
    }
    return Promise.resolve({ result: fDate(value ?? '', 'yyyy-MM-dd') });
  }

  /**
   * DateField View 모드 렌더링 - 날짜 포맷팅 및 캘린더 아이콘 적용
   * cardIcon이 설정된 경우 해당 아이콘을 우선 사용
   */
  protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
    const value = props.item[this.name];

    // null, undefined, 빈 문자열 처리
    if (value === null || value === undefined || value === '') {
      return { result: null };
    }

    // 아이콘 컴포넌트 결정 (cardIcon > 기본 캘린더 아이콘)
    const IconComponent = this.cardIcon || IconCalendar;
    const frameColor = this.cardIcon ? undefined : 'info';

    // range 타입인 경우 시작~끝 포맷
    if (this.range && Array.isArray(value) && value.length === 2) {
      const dateText = `${fDate(value[0], 'yyyy-MM-dd')} ~ ${fDate(value[1], 'yyyy-MM-dd')}`;
      return {
        result: (
          <span className="rcm-bool-wrap">
            <span className="rcm-icon-frame" data-color={frameColor}>
              <IconComponent className="rcm-icon" data-size="sm" stroke={1.75} />
            </span>
            <span className="rcm-text" data-weight="medium">
              {dateText}
            </span>
          </span>
        ),
      };
    }

    // 일반 날짜: yyyy-MM-dd 포맷으로 표시 (캘린더 아이콘 포함)
    const dateText = fDate(value, 'yyyy-MM-dd');
    return {
      result: (
        <span className="rcm-bool-wrap">
          <span className="rcm-icon-frame" data-color={frameColor}>
            <IconComponent className="rcm-icon" data-size="sm" stroke={1.75} />
          </span>
          <span className="rcm-text" data-weight="medium">
            {dateText}
          </span>
        </span>
      ),
    };
  }

  /**
   * DateField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): DateField {
    return new DateField(name, order, this.limit, this.range);
  }

  static create(props: DateFieldProps): DateField {
    return new DateField(props.name, props.order, props.limit, props.range).copyFields(props, true);
  }
}
