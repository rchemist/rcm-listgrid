'use client';

// Headless (zero-styling) UI primitive baseline.
//
// `<UIProvider components={...}>` requires the full 49-component {@link UIComponents}
// surface. Without a baseline, every consumer hand-wrote ~47 stubs per app. This module
// ships a proven, unstyled-but-functional set so a consumer can get a working grid/form
// in one line and override piecemeal:
//
// ```tsx
// import { headlessUIComponents } from '@rchemist/listgrid/headless';
// <UIProvider components={{ ...headlessUIComponents, ...myOverrides }}>…</UIProvider>
// ```
//
// Design: zero styling on purpose (pairs with `@rchemist/listgrid/styles.css` for the
// `rcm-*` look, or with the consumer's own design system via overrides). Exposed only on
// the `/headless` subpath — not in the core entry — so it never bloats the main bundle.

import React, { forwardRef } from 'react';
import type { UIComponents } from './UIProvider';

// Library code passes many non-DOM props (entityForm, clearError, helpText, …) and some
// non-standard-case DOM attrs (readonly, placeHolder). Strip/normalize them before they
// reach raw DOM elements so React doesn't warn.
const LIBRARY_INTERNAL_PROPS = new Set([
  'entityForm',
  'subCollectionEntity',
  'updateEntityForm',
  'resetEntityForm',
  'clearError',
  'helpText',
  'onError',
  'session',
  'field',
  'config',
  'viewType',
  'renderType',
]);

function stripLibraryProps(props: any): any {
  const out: any = {};
  for (const key of Object.keys(props)) {
    if (LIBRARY_INTERNAL_PROPS.has(key)) continue;
    if (key === 'readonly') {
      out.readOnly = props[key];
      continue;
    }
    if (key === 'placeHolder') {
      out.placeholder = props[key];
      continue;
    }
    out[key] = props[key];
  }
  return out;
}

const box = (tag: string = 'div') =>
  forwardRef<any, any>(({ children, ...props }, ref) =>
    React.createElement(tag as any, { ref, ...stripLibraryProps(props) }, children),
  );

const passthroughChildren =
  (tag: string = 'div'): any =>
  ({ children, ...rest }: any) =>
    React.createElement(tag as any, stripLibraryProps(rest), children);

const TextInput: any = forwardRef<any, any>(({ onChange, value, ...rest }, ref) => (
  <input
    ref={ref}
    value={value ?? ''}
    onChange={(e) => onChange?.(e.target.value, e)}
    {...stripLibraryProps(rest)}
  />
));

const Textarea: any = forwardRef<any, any>(({ onChange, value, ...rest }, ref) => (
  <textarea
    ref={ref}
    value={value ?? ''}
    onChange={(e) => onChange?.(e.target.value, e)}
    {...stripLibraryProps(rest)}
  />
));

const NumberInput: any = forwardRef<any, any>(({ onChange, value, ...rest }, ref) => (
  <input
    ref={ref}
    type="number"
    value={value ?? ''}
    onChange={(e) => onChange?.(Number(e.target.value), e)}
    {...stripLibraryProps(rest)}
  />
));

const SelectBox: any = forwardRef<any, any>(({ options, onChange, value, ...rest }, ref) => (
  <select
    ref={ref}
    value={value ?? ''}
    onChange={(e) => onChange?.(e.target.value, e)}
    {...stripLibraryProps(rest)}
  >
    <option value="" />
    {(options ?? []).map((o: any, i: number) => (
      <option key={i} value={o.value ?? o}>
        {o.label ?? o.value ?? String(o)}
      </option>
    ))}
  </select>
));

const CheckBox: any = forwardRef<any, any>(({ onChange, checked, ...rest }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    checked={!!checked}
    onChange={(e) => onChange?.(e.target.checked, e)}
    {...stripLibraryProps(rest)}
  />
));

const RadioInput: any = ({ onChange, checked, ...rest }: any) => (
  <input
    type="radio"
    checked={!!checked}
    onChange={(e) => onChange?.(e.target.checked, e)}
    {...stripLibraryProps(rest)}
  />
);

const Button: any = forwardRef<any, any>(({ children, onClick, ...rest }, ref) => (
  <button ref={ref} onClick={onClick} {...stripLibraryProps(rest)}>
    {children}
  </button>
));

const Modal: any = ({ children, opened, open, isOpen, onClose, ...rest }: any) => {
  const visible = opened ?? open ?? isOpen ?? true;
  if (!visible) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}
      onClick={onClose}
      {...stripLibraryProps(rest)}
    >
      <div
        style={{ background: '#fff', margin: '40px auto', padding: 16, maxWidth: 800 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// Table carries compound children (Table.Thead / Tbody / Tr / Th / Td).
const Table: any = Object.assign(
  forwardRef<any, any>(({ children, ...rest }, ref) => (
    <table ref={ref} {...stripLibraryProps(rest)}>
      {children}
    </table>
  )),
  {
    Thead: box('thead'),
    Tbody: box('tbody'),
    Tr: box('tr'),
    Th: box('th'),
    Td: box('td'),
  },
);

const SafePerfectScrollbar: any = ({ children, ...rest }: any) => (
  <div style={{ overflow: 'auto' }} {...stripLibraryProps(rest)}>
    {children}
  </div>
);

const Alert: any = ({ children, title, color, ...rest }: any) => (
  <div
    style={{
      padding: 8,
      border: '1px solid',
      borderColor: color === 'danger' ? '#f00' : '#888',
      margin: '4px 0',
    }}
    {...stripLibraryProps(rest)}
  >
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

const Tooltip: any = ({ children, label, content, ...rest }: any) => (
  <span title={label ?? content} {...stripLibraryProps(rest)}>
    {children}
  </span>
);

const Skeleton: any = ({ height, width, ...rest }: any) => (
  <div
    style={{ background: '#eee', height: height ?? 16, width: width ?? '100%', borderRadius: 4 }}
    {...stripLibraryProps(rest)}
  />
);

const LoadingOverlay: any = ({ visible, ...rest }: any) =>
  visible ? (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)' }}
      {...stripLibraryProps(rest)}
    >
      Loading…
    </div>
  ) : null;

const Breadcrumb: any = passthroughChildren('nav');
const BreadcrumbItem: any = passthroughChildren('span');
const Badge: any = passthroughChildren('span');
const Paper: any = passthroughChildren('div');
const Popover: any = passthroughChildren('div');
const Indicator: any = passthroughChildren('span');
const LinearIndicator: any = passthroughChildren('div');
const Flex: any = passthroughChildren('div');
const Grid: any = passthroughChildren('div');
const Group: any = passthroughChildren('div');
const SimpleGrid: any = passthroughChildren('div');
const Stack: any = passthroughChildren('div');
const Box: any = passthroughChildren('div');
const Stepper: any = passthroughChildren('div');
const Pagination: any = passthroughChildren('div');
const Tree: any = passthroughChildren('div');
const TooltipCard: any = passthroughChildren('div');
const Dropdown: any = passthroughChildren('div');
const InlineMap: any = passthroughChildren('div');

const UserView: any = ({ user, ...rest }: any) => (
  <span {...stripLibraryProps(rest)}>{user?.name ?? user?.id ?? '(user)'}</span>
);

const BooleanRadio: any = ({ value, onChange }: any) => (
  <span>
    <label>
      <input type="radio" checked={value === true} onChange={() => onChange?.(true)} /> Yes
    </label>
    <label>
      <input type="radio" checked={value === false} onChange={() => onChange?.(false)} /> No
    </label>
  </span>
);

const ColorInput: any = ({ onChange, value, ...rest }: any) => (
  <input
    type="color"
    value={value ?? '#000000'}
    onChange={(e) => onChange?.(e.target.value, e)}
    {...stripLibraryProps(rest)}
  />
);

const FileUploadInput: any = ({ onChange, ...rest }: any) => (
  <input type="file" onChange={(e) => onChange?.(e.target.files, e)} {...stripLibraryProps(rest)} />
);

const FlatPickrDateField: any = ({ onChange, value, ...rest }: any) => (
  <input
    type="date"
    value={value ?? ''}
    onChange={(e) => onChange?.(e.target.value, e)}
    {...stripLibraryProps(rest)}
  />
);

// Aliases — fields that share a baseline behavior with a primitive above.
const CheckBoxChip: any = CheckBox;
const CheckButtonValidationInput: any = TextInput;
const EmailDomainInput: any = TextInput;
const EmailDomainCheckButtonInput: any = TextInput;
const LazyFileUploadInput: any = FileUploadInput;
const MarkdownEditor: any = Textarea;
const MultiSelectBox: any = SelectBox;
const PasswordStrength: any = passthroughChildren('div');
const PasswordStrengthView: any = passthroughChildren('div');
const RadioChip: any = RadioInput;
const TagsInput: any = TextInput;

/**
 * Zero-styling baseline implementation of the full {@link UIComponents} surface.
 * Spread it into `<UIProvider components={{ ...headlessUIComponents, ...overrides }}>`.
 */
export const headlessUIComponents: UIComponents = {
  Alert,
  Badge,
  BooleanRadio,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  CheckBox,
  CheckBoxChip,
  CheckButtonValidationInput,
  ColorInput,
  Dropdown,
  EmailDomainCheckButtonInput,
  EmailDomainInput,
  FileUploadInput,
  Flex,
  FlatPickrDateField,
  Grid,
  Group,
  Indicator,
  InlineMap,
  LazyFileUploadInput,
  LinearIndicator,
  LoadingOverlay,
  MarkdownEditor,
  Modal,
  MultiSelectBox,
  NumberInput,
  Pagination,
  Paper,
  PasswordStrength,
  PasswordStrengthView,
  Popover,
  RadioChip,
  RadioInput,
  SafePerfectScrollbar,
  SelectBox,
  SimpleGrid,
  Skeleton,
  Stack,
  Stepper,
  Table,
  TagsInput,
  Textarea,
  TextInput,
  Tooltip,
  TooltipCard,
  Tree,
  UserView,
};
