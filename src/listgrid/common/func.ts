import {
  AdditionalColorType,
  AdditionalColorTypes,
  ColorType,
  ColorTypes,
  GutterType,
  ResponsiveValue,
  ShapeType,
  SizeType,
  VariantType,
  WindowPositionType,
} from './type';

const valign: Record<string, string> = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
};

const justifyAlign: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export function getWindowPositionClassName(position: WindowPositionType): string {
  // use tailwindCss
  switch (position) {
    case 'center':
      return `${valign.center} ${justifyAlign.center} `;
    case 'top':
      return `${valign.top} ${justifyAlign.center} `;
    case 'top-left':
      return `${valign.top} ${justifyAlign.left} `;
    case 'top-right':
      return `${valign.top} ${justifyAlign.right} `;
    case 'top-center':
      return `${valign.top} ${justifyAlign.center} `;
    case 'bottom':
      return `${valign.bottom} ${justifyAlign.center} `;
    case 'bottom-left':
      return `${valign.bottom} ${justifyAlign.left} `;
    case 'bottom-right':
      return `${valign.bottom} ${justifyAlign.right} `;
    case 'center-left':
      return `${valign.center} ${justifyAlign.left} `;
    case 'center-right':
      return `${valign.center} ${justifyAlign.right} `;
  }
}

export function isAdditionalColorType(color: string): color is AdditionalColorType | ColorType {
  return (
    AdditionalColorTypes.includes(color as AdditionalColorType) ||
    ColorTypes.includes(color as ColorType)
  );
}

export function getAdditionalColorClass(color: string) {
  color = isAdditionalColorType(color) ? color : 'primary';
  switch (color) {
    case 'dark':
      return 'bg-dark';
    case 'gray':
      return 'bg-gray';
    case 'red':
      return 'bg-red';
    case 'pink':
      return 'bg-pink';
    case 'grape':
      return 'bg-grape';
    case 'violet':
      return 'bg-violet';
    case 'indigo':
      return 'bg-indigo';
    case 'blue':
      return 'bg-blue';
    case 'cyan':
      return 'bg-cyan';
    case 'green':
      return 'bg-green';
    case 'lime':
      return 'bg-lime';
    case 'yellow':
      return 'bg-yellow';
    case 'orange':
      return 'bg-orange';
    case 'teal':
      return 'bg-teal';
    case 'black':
      return 'bg-black';
    case 'white':
      return 'bg-white border';
    case 'primary':
      return 'bg-primary';
    case 'info':
      return 'bg-info';
    case 'success':
      return 'bg-success';
    case 'warning':
      return 'bg-warning';
    case 'danger':
      return 'bg-danger';
    case 'secondary':
      return 'bg-secondary';
    default:
      return 'bg-indigo';
  }
}

export function getTextColorClass(color: string) {
  color = isAdditionalColorType(color) ? color : 'primary';
  switch (color) {
    case 'dark':
      return 'text-dark';
    case 'gray':
      return 'text-gray';
    case 'red':
      return 'text-red';
    case 'pink':
      return 'text-pink';
    case 'grape':
      return 'text-grape';
    case 'violet':
      return 'text-violet';
    case 'indigo':
      return 'text-indigo';
    case 'blue':
      return 'text-blue';
    case 'cyan':
      return 'text-cyan';
    case 'green':
      return 'text-green';
    case 'lime':
      return 'text-lime';
    case 'yellow':
      return 'text-yellow';
    case 'orange':
      return 'text-orange';
    case 'teal':
      return 'text-teal';
    case 'black':
      return 'text-black';
    case 'white':
      return 'text-white';
    case 'primary':
      return 'text-primary';
    case 'info':
      return 'text-info';
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'danger':
      return 'text-danger';
    case 'secondary':
      return 'text-secondary';
    default:
      return 'text-indigo';
  }
}

export function getOppositeTextColorClass(color: string) {
  color = isAdditionalColorType(color) ? color : 'primary';
  switch (color) {
    case 'dark':
      return 'text-white';
    case 'gray':
      return 'text-white';
    case 'red':
      return 'text-white';
    case 'pink':
      return 'text-white';
    case 'grape':
      return 'text-white';
    case 'violet':
      return 'text-white';
    case 'indigo':
      return 'text-white';
    case 'blue':
      return 'text-white';
    case 'cyan':
      return 'text-white';
    case 'green':
      return 'text-white';
    case 'lime':
      return 'text-white';
    case 'yellow':
      return 'text-white';
    case 'orange':
      return 'text-white';
    case 'teal':
      return 'text-white';
    case 'black':
      return 'text-white';
    case 'white':
      return 'text-dark';
    case 'primary':
      return 'text-white';
    case 'info':
      return 'text-white';
    case 'success':
      return 'text-white';
    case 'warning':
      return 'text-white';
    case 'danger':
      return 'text-white';
    case 'secondary':
      return 'text-white';
    default:
      return 'text-dark';
  }
}

export function getOrderedColorType(num: number) {
  // num 은 0 부터 ColorTypes.length - 1 까지
  return ColorTypes[num % ColorTypes.length];
}

const bgColorClasses: Record<ColorType, string> = {
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  secondary: 'bg-secondary',
  dark: 'bg-dark',
};

export function getBgColor(color: ColorType | AdditionalColorType | string): string {
  if (bgColorClasses[color as ColorType]) {
    return bgColorClasses[color as ColorType];
  }
  if (AdditionalColorTypes.includes(color as AdditionalColorType)) {
    return getAdditionalColorClass(color as AdditionalColorType);
  }
  const colorValue = color.startsWith('#') ? color.slice(1) : color;
  return `bg-[#${colorValue}]`;
}

export function getColorSuffix(color: ColorType | string): string {
  return color.startsWith('#') ? `[${color}]` : color;
}

export function getMaxWidthClassName(size: SizeType | undefined): string {
  switch (size) {
    case 'xs':
      return 'max-w-xs';
    case 'sm':
      return 'max-w-sm';
    case 'md':
      return 'max-w-md';
    case 'lg':
      return 'max-w-lg';
    case 'xl':
      return 'max-w-xl';
    case '2xl':
      return 'max-w-2xl';
    case '3xl':
      return 'max-w-3xl';
    case '4xl':
      return 'max-w-4xl';
    case '5xl':
      return 'max-w-5xl';
    case '6xl':
      return 'max-w-6xl';
    case 'full':
      return 'max-w-full';
    default:
      return 'max-w-md';
  }
}

export function getAlignClassName(alignType: 'left' | 'center' | 'right', flex?: boolean) {
  if (flex) {
    return alignType === 'left'
      ? 'justify-start'
      : alignType === 'center'
        ? 'justify-center'
        : 'justify-end';
  }
  return alignType === 'left' ? 'text-left' : alignType === 'center' ? 'text-center' : 'text-right';
}

export function getGutterValue(gutter: GutterType): string {
  if (typeof gutter === 'number') {
    return gutter.toString();
  }
  switch (gutter) {
    case 'xs':
      return '0.5rem';
    case 'sm':
      return '1rem';
    case 'md':
      return '1.5rem';
    case 'lg':
      return '2rem';
    case 'xl':
      return '3rem';
    default:
      return '1rem';
  }
}

export function getResponsiveClasses(
  value: ResponsiveValue<string | number>,
  prefix: string,
  valueMap?: Record<string, string> | ((val: string | number) => string),
): string {
  const getValue = (val: string | number): string => {
    if (typeof valueMap === 'function') {
      return valueMap(val);
    }
    if (typeof valueMap === 'object' && valueMap !== null && val in valueMap) {
      return valueMap[val]!;
    }
    return val.toString();
  };

  if (typeof value === 'object' && value !== null) {
    const classes: string[] = [];
    if (value.base) classes.push(`${prefix}-${getValue(value.base)}`);
    if (value.xs) classes.push(`sm:${prefix}-${getValue(value.xs)}`);
    if (value.sm) classes.push(`sm:${prefix}-${getValue(value.sm)}`);
    if (value.md) classes.push(`md:${prefix}-${getValue(value.md)}`);
    if (value.lg) classes.push(`lg:${prefix}-${getValue(value.lg)}`);
    if (value.xl) classes.push(`xl:${prefix}-${getValue(value.xl)}`);
    return classes.join(' ');
  }

  return `${prefix}-${getValue(value)}`;
}

export function getShapeClassName(shape: ShapeType): string {
  switch (shape) {
    case 'pill':
      return 'rounded-full';
    case 'box':
      return 'rounded-none';
    case 'rounded':
      return 'rounded';
    default:
      return 'rounded';
  }
}

export function getSizeClassName(size: SizeType): string {
  switch (size) {
    case 'xs':
      return 'px-2 py-1 text-xs';
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'md':
      return 'px-4 py-2 text-sm';
    case 'lg':
      return 'px-6 py-3 text-base';
    case 'xl':
      return 'px-8 py-4 text-lg';
    case '2xl':
      return 'px-10 py-5 text-xl';
    case '5xl':
      return 'px-16 py-8 text-3xl';
    case 'full':
      return 'w-full h-full';
    default:
      return 'px-4 py-2 text-sm';
  }
}

export function getColorClass(color: ColorType | string, variant: VariantType): string {
  const baseColor = isAdditionalColorType(color) ? color : 'primary';

  switch (variant) {
    case 'filled':
      return `${getAdditionalColorClass(baseColor)} ${getOppositeTextColorClass(baseColor)}`;
    case 'outline':
      return `border border-${baseColor} ${getTextColorClass(baseColor)} bg-transparent`;
    case 'solid':
      return `bg-${baseColor} text-white`;
    default:
      return `${getAdditionalColorClass(baseColor)} ${getOppositeTextColorClass(baseColor)}`;
  }
}
