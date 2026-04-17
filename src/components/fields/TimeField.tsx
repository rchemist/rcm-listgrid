/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {
  AbstractDateField,
  AbstractDateFieldProps
} from './abstract';
import React from "react";
import {FieldRenderParameters} from '../../config/EntityField';
import {RenderType} from '../../config/Config';
import {isTrue} from '../../../utils/BooleanUtil';
import {getFormattedTime} from "@gjcu/ui";
import {FlatPickrDateField} from "@gjcu/ui/form/FlatPickrDateField";
import {getInputRendererParameters} from '../helper/FieldRendererHelper';
import {MinMaxStringLimit} from "@gjcu/ui/form/Type";

interface TimeFieldProps extends AbstractDateFieldProps {
  
}

export class TimeField extends AbstractDateField<TimeField> {

  constructor(name: string, order: number, limit?: MinMaxStringLimit, range?: boolean) {
    super(name, order, 'time', limit, range);
  }

  async getCurrentValue(renderType?: RenderType): Promise<any> {
    const value = await super.getCurrentValue(renderType);

    if (value === 'now') {
      if (isTrue(this.range)) {
        const now: string = getFormattedTime();
        const after: string = getFormattedTime(new Date(), 12);
        return [
          now,
          after
        ];
      }
      return getFormattedTime();
    }

    return value;
  }

  /**
   * TimeField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    return (async () => {
      return <FlatPickrDateField type={'time'} limit={this.limit} range={this.range} {...await getInputRendererParameters(this, params)}/>
    })();
  }



  /**
   * TimeField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): TimeField {
    return new TimeField(name, order, this.limit, this.range);
  }

  static create(props: TimeFieldProps): TimeField {
    return new TimeField(props.name, props.order, props.limit, props.range)
      .copyFields(props, true);
  }
  
}
