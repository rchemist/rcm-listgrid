'use client';
import { ReactNode, useEffect, useState } from 'react';
import { FieldRenderParameters } from '../../config/EntityField';
import { ListableFormField, ViewListProps, ViewListResult } from './abstract';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { InputRendererProps } from '../../config/Config';
import { ColorInput } from '../../ui';

export class ColorField extends ListableFormField<ColorField> {
  constructor(name: string, order: number) {
    super(name, order, 'custom');
  }

  /**
   * ColorField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<ReactNode | null> {
    return (async () => {
      const inputParam = { ...(await getInputRendererParameters(this, params)) };
      return <ColorInputField {...(inputParam as ColorInputFieldProps)}></ColorInputField>;
    })();
  }

  /**
   * ColorField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): ColorField {
    return new ColorField(name, order);
  }

  /**
   * ColorField 리스트 아이템 렌더링
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return renderColorListField(this, props);
  }
}

async function renderColorListField(
  field: ColorField,
  props: ViewListProps,
): Promise<ViewListResult> {
  const value = props.item[field.name] ?? '#fff';

  return {
    result: (
      <div>
        <div className={`w-5 h-5 !bg-[${value}] rounded-full`}></div>
      </div>
    ),
  };
}

interface ColorInputFieldProps extends InputRendererProps {
  withAlpha?: boolean | undefined;
}

const ColorInputField = ({
  name,
  label,
  required = false,
  readonly = false,
  withAlpha = false,
  ...props
}: ColorInputFieldProps) => {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <ColorInput
      name={name}
      value={value}
      onChangeEnd={(color: string) => {
        setValue(color);
        props.onChange(color);
      }}
      format={'hex'}
      swatches={[
        '#2e2e2e',
        '#868e96',
        '#fa5252',
        '#e64980',
        '#be4bdb',
        '#7950f2',
        '#4c6ef5',
        '#228be6',
        '#15aabf',
        '#12b886',
        '#40c057',
        '#82c91e',
        '#fab005',
        '#ffffff',
      ]}
      disabled={readonly}
      withAlpha={withAlpha}
    />
  );
};
