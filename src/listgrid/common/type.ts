export type WindowPositionType =
  | 'center'
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'center-left'
  | 'center-right';

export type PlacementType =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'right-start'
  | 'right-end'
  | 'left-start'
  | 'left-end';

export type ColorType =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary'
  | 'dark';

export type AdditionalColorType =
  | 'dark'
  | 'gray'
  | 'red'
  | 'pink'
  | 'grape'
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'lime'
  | 'yellow'
  | 'orange'
  | 'teal'
  | 'black'
  | 'white';

export type SizeType =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | 'full';

export type TextAlignType = 'left' | 'center' | 'right';

export type SpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

export type FlexJustify =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type GridAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline';

export type GridJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type GridDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export type GridWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type GutterType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export type SpacingType = number | string;

export type ResponsiveValue<T> = T | { base?: T; xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

export type PopoverPosition = PlacementType | 'top' | 'bottom' | 'left' | 'right';

export type PopoverShadow = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type VariantType = 'filled' | 'outline' | 'solid';

export type ShapeType = 'pill' | 'box' | 'rounded';

export const ColorTypes: ColorType[] = [
  'primary',
  'info',
  'success',
  'warning',
  'danger',
  'secondary',
  'dark',
];

export const AdditionalColorTypes: AdditionalColorType[] = [
  'dark',
  'gray',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'green',
  'lime',
  'yellow',
  'orange',
  'teal',
  'black',
  'white',
];

export const AllColorTypes: (ColorType | AdditionalColorType)[] = [
  ...ColorTypes,
  ...AdditionalColorTypes,
];

export const VariantTypes: VariantType[] = ['filled', 'outline', 'solid'];

export const ShapeTypes: ShapeType[] = ['pill', 'box', 'rounded'];

export const SizeTypes: SizeType[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  'full',
];
