'use client';

import React, { createContext, useContext, ReactNode, ComponentType } from 'react';

// Stage 3b UI primitives contract.
//
// Host applications inject concrete implementations (HeroUI, shadcn, custom, etc.)
// via <UIProvider components={...}>. All props are typed as `any` to preserve the
// flexibility of the original the legacy UI kit API surface; precise per-component typing
// is a Stage 6 refinement.
//

export interface UIComponents {
  Alert: ComponentType<any>;
  Badge: ComponentType<any>;
  BooleanRadio: ComponentType<any>;
  Box: ComponentType<any>;
  Breadcrumb: ComponentType<any>;
  /** Optional — library never renders it, type alias kept for host contracts. */
  BreadcrumbItem?: ComponentType<any>;
  Button: ComponentType<any>;
  CheckBox: ComponentType<any>;
  CheckBoxChip: ComponentType<any>;
  CheckButtonValidationInput: ComponentType<any>;
  ColorInput: ComponentType<any>;
  Dropdown: ComponentType<any>;
  EmailDomainCheckButtonInput: ComponentType<any>;
  EmailDomainInput: ComponentType<any>;
  FileUploadInput: ComponentType<any>;
  Flex: ComponentType<any>;
  FlatPickrDateField: ComponentType<any>;
  Grid: ComponentType<any>;
  Group: ComponentType<any>;
  Indicator: ComponentType<any>;
  InlineMap: ComponentType<any>;
  LazyFileUploadInput: ComponentType<any>;
  LinearIndicator: ComponentType<any>;
  LoadingOverlay: ComponentType<any>;
  MarkdownEditor: ComponentType<any>;
  Modal: ComponentType<any>;
  MultiSelectBox: ComponentType<any>;
  NumberInput: ComponentType<any>;
  Pagination: ComponentType<any>;
  Paper: ComponentType<any>;
  /** Optional — the host kit exposes only PasswordStrengthView; type alias below. */
  PasswordStrength?: ComponentType<any>;
  PasswordStrengthView: ComponentType<any>;
  Popover: ComponentType<any>;
  RadioChip: ComponentType<any>;
  RadioInput: ComponentType<any>;
  SafePerfectScrollbar: ComponentType<any>;
  SelectBox: ComponentType<any>;
  SimpleGrid: ComponentType<any>;
  Skeleton: ComponentType<any>;
  Stack: ComponentType<any>;
  Stepper: ComponentType<any>;
  Table: ComponentType<any>;
  TagsInput: ComponentType<any>;
  Textarea: ComponentType<any>;
  TextInput: ComponentType<any>;
  Tooltip: ComponentType<any>;
  TooltipCard: ComponentType<any>;
  Tree: ComponentType<any>;
  UserView: ComponentType<any>;
}

const UIContext = createContext<UIComponents | null>(null);

export interface UIProviderProps {
  components: UIComponents;
  children: ReactNode;
}

export function UIProvider({ components, children }: UIProviderProps) {
  return <UIContext.Provider value={components}>{children}</UIContext.Provider>;
}

export function useUI(): UIComponents {
  const ctx = useContext(UIContext);
  if (ctx === null) {
    throw new Error(
      '[@rchemist/listgrid] useUI must be called within a <UIProvider>. ' +
        'Wrap your app with <UIProvider components={...}> imported from @rchemist/listgrid.',
    );
  }
  return ctx;
}

// Thin wrapper factory — each wrapper defers to the host-provided component
// at render time via Context lookup. Typed as `any` so wrappers can carry
// compound sub-components (e.g. Table.Th) as static properties without TS
// complaining, matching the original the legacy UI kit API surface.
// React inspects components for these properties during rendering. If our
// Proxy intercepts them and returns wrapper components, React mistakes the
// function component for a class component and emits noisy warnings. Only
// PascalCase names (conventional compound children like Table.Th) are
// forwarded through the compound mechanism; everything else falls through
// to the real wrapper function's own properties.
const REACT_INTROSPECTION_PROPS = new Set<string | symbol>([
  'childContextTypes',
  'contextTypes',
  'contextType',
  'getDerivedStateFromProps',
  'defaultProps',
  'propTypes',
  'displayName',
  'render',
  'type',
  '$$typeof',
  'compare',
  'name',
  'length',
  'prototype',
  'call',
  'apply',
  'bind',
  'toString',
]);

function makeWrapper<K extends keyof UIComponents>(name: K): any {
  const Wrapper: any = (props: any) => {
    const comps = useUI();
    const Component = comps[name];
    if (!Component) {
      throw new Error(`[@rchemist/listgrid] UI component "${String(name)}" missing from UIProvider.`);
    }
    return <Component {...props} />;
  };
  Wrapper.displayName = `rcm.${String(name)}`;
  return new Proxy(Wrapper, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver);
      if (REACT_INTROSPECTION_PROPS.has(prop)) return undefined;
      // Only treat PascalCase names as compound children. Lowercase access
      // (React internal checks, stray property access) returns undefined.
      const key = prop as string;
      if (!/^[A-Z]/.test(key)) return undefined;
      const SubWrapper: any = (subProps: any) => {
        const comps = useUI();
        const Parent: any = comps[name];
        if (!Parent) {
          throw new Error(
            `[@rchemist/listgrid] UI component "${String(name)}" missing from UIProvider.`,
          );
        }
        const Sub = Parent[key];
        if (!Sub) {
          throw new Error(
            `[@rchemist/listgrid] Compound "${String(name)}.${key}" missing on host component.`,
          );
        }
        return <Sub {...subProps} />;
      };
      SubWrapper.displayName = `rcm.${String(name)}.${key}`;
      return SubWrapper;
    },
  });
}

export const Alert = makeWrapper('Alert');
export const Badge = makeWrapper('Badge');
export const BooleanRadio = makeWrapper('BooleanRadio');
export const Box = makeWrapper('Box');
export const Breadcrumb = makeWrapper('Breadcrumb');
export const BreadcrumbItem = makeWrapper('BreadcrumbItem');
export const Button = makeWrapper('Button');
export const CheckBox = makeWrapper('CheckBox');
export const CheckBoxChip = makeWrapper('CheckBoxChip');
export const CheckButtonValidationInput = makeWrapper('CheckButtonValidationInput');
export const ColorInput = makeWrapper('ColorInput');
export const Dropdown = makeWrapper('Dropdown');
export const EmailDomainCheckButtonInput = makeWrapper('EmailDomainCheckButtonInput');
export const EmailDomainInput = makeWrapper('EmailDomainInput');
export const FileUploadInput = makeWrapper('FileUploadInput');
export const Flex = makeWrapper('Flex');
export const FlatPickrDateField = makeWrapper('FlatPickrDateField');
export const Grid = makeWrapper('Grid');
export const Group = makeWrapper('Group');
export const Indicator = makeWrapper('Indicator');
export const InlineMap = makeWrapper('InlineMap');
export const LazyFileUploadInput = makeWrapper('LazyFileUploadInput');
export const LinearIndicator = makeWrapper('LinearIndicator');
export const LoadingOverlay = makeWrapper('LoadingOverlay');
export const MarkdownEditor = makeWrapper('MarkdownEditor');
export const Modal = makeWrapper('Modal');
export const MultiSelectBox = makeWrapper('MultiSelectBox');
export const NumberInput = makeWrapper('NumberInput');
export const Pagination = makeWrapper('Pagination');
export const Paper = makeWrapper('Paper');
export const PasswordStrength = makeWrapper('PasswordStrength');
export const PasswordStrengthView = makeWrapper('PasswordStrengthView');
export const Popover = makeWrapper('Popover');
export const RadioChip = makeWrapper('RadioChip');
export const RadioInput = makeWrapper('RadioInput');
export const SafePerfectScrollbar = makeWrapper('SafePerfectScrollbar');
export const SelectBox = makeWrapper('SelectBox');
export const SimpleGrid = makeWrapper('SimpleGrid');
export const Skeleton = makeWrapper('Skeleton');
export const Stack = makeWrapper('Stack');
export const Stepper = makeWrapper('Stepper');
export const Table = makeWrapper('Table');
export const TagsInput = makeWrapper('TagsInput');
export const Textarea = makeWrapper('Textarea');
export const TextInput = makeWrapper('TextInput');
export const Tooltip = makeWrapper('Tooltip');
export const TooltipCard = makeWrapper('TooltipCard');
export const Tree = makeWrapper('Tree');
export const UserView = makeWrapper('UserView');

// Shared types used as prop/value types across the library. Kept as `any` for
// Stage 3b; tighter typing is a Stage 6 concern.
// Some names are used as BOTH value (component) and type annotation in the
// original source, so they have matching `const` and `type` declarations.
export type TooltipColor = any;
export type TreeNodeData = any;
export type InlineMapPendingRef = any;
export type KeyValue = any;
export type BreadcrumbItem = any;
export type Tree = any;
export type Currency = any;
export type Double = any;
export type PasswordStrength = any;

// FileFieldValue — full port of the class that library code (FileField.tsx,
// FormField initialization, etc.) calls on at runtime. Previously stubbed as
// a minimal any-shape holder, which broke `fileValue.isDirty()` / `.clone()` /
// `.addNewValue()` at render time. Mirrors the original
// `packages/ui/form/FileUploadInput.tsx` semantics exactly.

export interface FileInfo {
  url: string;
  id: string;
  deleteType?: 'new' | 'exist' | 'none';
  fileSize?: number;
  fileName?: string;
}

export interface IFileField {
  existFiles?: FileInfo[];
  newFiles?: FileInfo[];
  deleteFiles?: FileInfo[];
}

export class FileFieldValue implements IFileField {
  existFiles: FileInfo[] = [];
  newFiles: FileInfo[] = [];
  deleteFiles: FileInfo[] = [];

  static create(data?: any): FileFieldValue {
    const value = new FileFieldValue();
    if (!data) return value;

    if (data instanceof FileFieldValue) {
      value.newFiles = [...(data.newFiles || [])];
      value.existFiles = [...(data.existFiles || [])];
      value.deleteFiles = [...(data.deleteFiles || [])];
      return value;
    }

    value.newFiles = data.newFiles ?? [];
    value.existFiles = data.existFiles ?? [];
    value.deleteFiles = data.deleteFiles ?? [];
    return value;
  }

  addNewValue(fileInfo: FileInfo): boolean {
    if (fileInfo.id === undefined || fileInfo.id === null || fileInfo.id === '') return false;
    const exist = this.newFiles.some((v) => v.url === fileInfo.url);
    if (!exist) {
      this.newFiles.push(fileInfo);
      return true;
    }
    return false;
  }

  addExistValue(fileInfo: FileInfo): boolean {
    if (fileInfo.id === undefined || fileInfo.id === null || fileInfo.id === '') return false;
    const inNew = this.newFiles.some((v) => v.url === fileInfo.url);
    if (inNew) return false;
    const inExist = this.existFiles.some((v) => v.url === fileInfo.url);
    if (inExist) return false;
    this.existFiles.push(fileInfo);
    return true;
  }

  addDeleteValue(fileInfo: FileInfo): FileInfo | undefined {
    const already = this.deleteFiles.some((v) => v.url === fileInfo.url);
    if (already) return undefined;

    let exist = false;
    let result: 'new' | 'exist' | 'none' = 'none';

    for (let i = 0; i < this.existFiles.length; i++) {
      if (this.existFiles[i]!.url === fileInfo.url) {
        fileInfo.id = this.existFiles[i]!.id;
        this.existFiles.splice(i, 1);
        exist = true;
        result = 'exist';
        break;
      }
    }

    for (let i = 0; i < this.newFiles.length; i++) {
      if (this.newFiles[i]!.url === fileInfo.url) {
        fileInfo.id = this.newFiles[i]!.id;
        this.newFiles.splice(i, 1);
        exist = true;
        result = 'new';
        break;
      }
    }

    if (exist) {
      this.deleteFiles.push({ ...fileInfo, deleteType: result });
    }

    return { ...fileInfo, deleteType: result };
  }

  getValue(): string {
    try {
      return JSON.stringify(this);
    } catch {
      return '';
    }
  }

  getCurrentFileList(): FileInfo[] {
    const all = [...this.existFiles, ...this.newFiles];
    return all.filter((file) => !this.deleteFiles.some((d) => d.url === file.url));
  }

  isDirty(): boolean {
    return this.newFiles.length > 0 || (this.deleteFiles.length > 0 && this.existFiles.length > 0);
  }

  hasValue(): boolean {
    return this.existFiles.length > 0 || this.newFiles.length > 0 || this.deleteFiles.length > 0;
  }

  rollbackDeleteFile(file: FileInfo): void {
    for (let i = 0; i < this.deleteFiles.length; i++) {
      if (this.deleteFiles[i]!.url === file.url) {
        this.deleteFiles.splice(i, 1);
        {
          const { deleteType: _dt, ...rest } = file;
          void _dt;
          if (file.deleteType === 'new') {
            this.newFiles.push(rest);
          } else if (file.deleteType === 'exist') {
            this.existFiles.push(rest);
          }
        }
        break;
      }
    }
  }

  getRenderKey(): string {
    let key = '';
    this.existFiles.forEach((v) => {
      key += 'exist_' + v.id;
    });
    this.newFiles.forEach((v) => {
      key += 'new_' + v.id;
    });
    this.deleteFiles.forEach((v) => {
      key += 'delete_' + v.id;
    });
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash = hash & hash;
    }
    return String(hash);
  }

  clone(): FileFieldValue {
    const c = new FileFieldValue();
    c.deleteFiles = [...this.deleteFiles];
    c.existFiles = [...this.existFiles];
    c.newFiles = [...this.newFiles];
    return c;
  }
}

// Constants whose concrete values host apps may override through other means.
export const DEFAULT_EMAIL_DOMAINS: string[] = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'kakao.com',
  'hanmail.net',
  'nate.com',
];
// Previously returned the Tailwind string "bg-gray-100 opacity-60 cursor-not-allowed".
// Now returns the library's scoped class so hosts without Tailwind still get
// the readonly visual via @rchemist/listgrid/styles.css.
export function readonlyClass(readonly: boolean | undefined, extra: string = ''): string {
  return readonly ? `rcm-readonly ${extra}`.trim() : extra;
}

// NumberInput-adjacent value helpers. Kept as any wrappers.
export const Currency: any = {};
export const Double: any = {};

// Tiptap-adjacent helper used in validations.
export function getPlainText(html: string | null | undefined): string {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, '');
}
