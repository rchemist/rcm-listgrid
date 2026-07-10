// Prop shapes + the UIComponents registry type. Kept separate from the
// component implementations so a host can import just the types (e.g. to
// type its own override map) without pulling in React.
import type { ComponentType, ReactNode } from 'react';

export interface SelectOption {
  value: string | number | boolean;
  label: string;
}

export interface TextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export interface TextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  readOnly?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export interface CheckBoxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export interface SelectBoxProps {
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
  options?: SelectOption[];
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: ButtonVariant;
}

export interface ModalProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  children?: ReactNode;
}

export interface TableProps {
  children?: ReactNode;
}

export interface TableRowProps {
  children?: ReactNode;
}

export interface TableCellProps {
  children?: ReactNode;
  colSpan?: number;
}

export type TableComponent = ComponentType<TableProps> & {
  Thead: ComponentType<TableRowProps>;
  Tbody: ComponentType<TableRowProps>;
  Tr: ComponentType<TableRowProps>;
  Th: ComponentType<TableCellProps>;
  Td: ComponentType<TableCellProps>;
};

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange?: (page: number) => void;
}

export interface StackProps {
  children?: ReactNode;
  gap?: number | string;
}

export interface LoadingOverlayProps {
  visible?: boolean;
}

/** Registry shape the renderer injects components through (charter C7). */
export interface UIComponents {
  TextInput: ComponentType<TextInputProps>;
  Textarea: ComponentType<TextareaProps>;
  NumberInput: ComponentType<NumberInputProps>;
  DateInput: ComponentType<DateInputProps>;
  CheckBox: ComponentType<CheckBoxProps>;
  SelectBox: ComponentType<SelectBoxProps>;
  Button: ComponentType<ButtonProps>;
  Modal: ComponentType<ModalProps>;
  Table: TableComponent;
  Pagination: ComponentType<PaginationProps>;
  Stack: ComponentType<StackProps>;
  LoadingOverlay: ComponentType<LoadingOverlayProps>;
}
