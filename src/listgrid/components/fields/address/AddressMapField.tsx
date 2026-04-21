'use client';
import { FormField, FormFieldProps } from '../abstract';
import { FieldRenderParameters } from '../../../config/EntityField';

import { getInputRendererParameters } from '../../helper/FieldRendererHelper';
import { AddressFieldView } from './AddressFieldView';

interface AddressMapFieldProps extends FormFieldProps {
  prefix?: string | undefined;
  showMap?: boolean | undefined;
}

export interface Address {
  state?: string | undefined;
  city?: string | undefined;
  address1: string;
  address2: string;
  postalCode: string;
  longitude?: number | undefined;
  latitude?: number | undefined;
}

export class AddressMapField extends FormField<AddressMapField> {
  showMap?: boolean | undefined;

  prefix?: string | undefined;

  constructor(name: string, order: number, showMap?: boolean, prefix?: string) {
    super(name, order, 'custom');
    this.showMap = showMap;
    this.prefix = prefix;
  }

  static create(props: AddressMapFieldProps): AddressMapField {
    return new AddressMapField(props.name, props.order, props.showMap, props.prefix);
  }

  /**
   * AddressMapField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(
    params: FieldRenderParameters,
  ): Promise<React.ReactNode | null | undefined> {
    return (async () => {
      const inputParams = await getInputRendererParameters(this, { ...params });
      return (
        <AddressFieldView
          {...(inputParams as React.ComponentProps<typeof AddressFieldView>)}
          showMap={this.showMap}
          prefix={this.prefix}
        />
      );
    })();
  }

  /**
   * AddressMapField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): AddressMapField {
    return new AddressMapField(name, order, this.showMap);
  }

  withPrefix(prefix: string): AddressMapField {
    this.prefix = prefix;
    return this;
  }

  protected copyFields(origin: AddressMapFieldProps, includeValue: boolean = true): this {
    super.copyFields(origin, includeValue);
    this.prefix = origin.prefix;
    this.showMap = origin.showMap;
    return this;
  }
}

export function appendLastDot(str?: string): string {
  if (!str || str.length === 0) {
    return '';
  }
  if (str.endsWith('.')) {
    return str;
  }
  return str + '.';
}
