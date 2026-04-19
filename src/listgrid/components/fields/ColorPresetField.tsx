'use client';
import { ReactNode, useEffect, useState } from 'react';
import { FieldRenderParameters } from '../../config/EntityField';
import { ListableFormField, ViewListProps, ViewListResult } from './abstract';
import { InputRendererProps } from '../../config/Config';
import { AdditionalColorType, AllColorTypes, ColorType } from '../../common/type';
import { getAdditionalColorClass, getOppositeTextColorClass } from '../../common/func';
import { Popover } from '../../ui';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';

export class ColorPresetField extends ListableFormField<ColorPresetField> {
  presets?: string[] | undefined;

  constructor(name: string, order: number, presets?: string[]) {
    super(name, order, 'text');
    this.presets = presets;
  }

  /**
   * ColorPresetField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<ReactNode | null> {
    return (async () => {
      const inputParam = { ...(await getInputRendererParameters(this, params)) };
      return (
        <ColorPresetFieldView
          presets={this.presets}
          {...(inputParam as ColorPresetFieldProps)}
        ></ColorPresetFieldView>
      );
    })();
  }

  /**
   * ColorPresetField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): ColorPresetField {
    return new ColorPresetField(name, order, this.presets);
  }

  /**
   * ColorPresetField 리스트 아이템 렌더링 (원본 renderListItem 로직 보존)
   */
  protected renderListItemInstance(props: ViewListProps): Promise<ViewListResult> {
    return renderColorListField(this, props);
  }
}

async function renderColorListField(
  field: ColorPresetField,
  props: ViewListProps,
): Promise<ViewListResult> {
  const value = props.item[field.name] ?? 'indigo';

  return {
    result: (
      <div>
        <div className={`w-5 h-5 ${getAdditionalColorClass(value)} rounded-full`}></div>
      </div>
    ),
  };
}

interface ColorPresetFieldProps extends InputRendererProps {
  presets?: string[] | undefined;
}

// 색상을 선택하는 버튼을 렌더링한다.
const ColorPresetFieldView = ({
  name,
  label,
  required = false,
  readonly = false,
  presets = [],
  ...props
}: ColorPresetFieldProps) => {
  const [selectedColor, setSelectedColor] = useState<ColorType | AdditionalColorType>('indigo');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (props.value) {
      setSelectedColor((props.value as AdditionalColorType) ?? 'indigo');
    }
  }, [props.value]);

  return (
    <div className="rcm-stack">
      <Popover
        position={'bottom'}
        shadow={'md'}
        opened={isOpen}
        onChange={setIsOpen}
        closeOnClickOutside={true}
      >
        <Popover.Target>
          <button
            className={`btn ${getAdditionalColorClass(selectedColor)} ${getOppositeTextColorClass(selectedColor)}`}
            disabled={readonly}
            onClick={() => setIsOpen(true)}
          >
            색상 선택
          </button>
        </Popover.Target>
        <Popover.Dropdown>
          <div className={`w-full grid grid-cols-6 gap-2`}>
            {AllColorTypes.map((color, index) => (
              <button
                key={index}
                type="button"
                className={`w-8 h-8 rounded-full ${getAdditionalColorClass(color)}`}
                onClick={() => {
                  setSelectedColor(color);
                  setIsOpen(false);
                  props.onChange(color);
                }}
              />
            ))}
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};
