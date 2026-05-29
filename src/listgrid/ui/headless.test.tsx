import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { headlessUIComponents } from './headless';

// The full 49-key UIComponents surface (47 required + BreadcrumbItem / PasswordStrength).
const REQUIRED_KEYS = [
  'Alert',
  'Badge',
  'BooleanRadio',
  'Box',
  'Breadcrumb',
  'BreadcrumbItem',
  'Button',
  'CheckBox',
  'CheckBoxChip',
  'CheckButtonValidationInput',
  'ColorInput',
  'Dropdown',
  'EmailDomainCheckButtonInput',
  'EmailDomainInput',
  'FileUploadInput',
  'Flex',
  'FlatPickrDateField',
  'Grid',
  'Group',
  'Indicator',
  'InlineMap',
  'LazyFileUploadInput',
  'LinearIndicator',
  'LoadingOverlay',
  'MarkdownEditor',
  'Modal',
  'MultiSelectBox',
  'NumberInput',
  'Pagination',
  'Paper',
  'PasswordStrength',
  'PasswordStrengthView',
  'Popover',
  'RadioChip',
  'RadioInput',
  'SafePerfectScrollbar',
  'SelectBox',
  'SimpleGrid',
  'Skeleton',
  'Stack',
  'Stepper',
  'Table',
  'TagsInput',
  'Textarea',
  'TextInput',
  'Tooltip',
  'TooltipCard',
  'Tree',
  'UserView',
];

describe('headlessUIComponents', () => {
  it('provides the full UIComponents surface (all 49 keys, no holes)', () => {
    for (const key of REQUIRED_KEYS) {
      expect(headlessUIComponents[key as keyof typeof headlessUIComponents]).toBeTruthy();
    }
    expect(Object.keys(headlessUIComponents)).toHaveLength(REQUIRED_KEYS.length);
  });

  it('TextInput renders and reports value changes', () => {
    const onChange = vi.fn();
    const TextInput = headlessUIComponents.TextInput;
    const { container } = render(<TextInput value="hi" onChange={onChange} />);
    const input = container.querySelector('input')!;
    expect(input.value).toBe('hi');
    fireEvent.change(input, { target: { value: 'bye' } });
    expect(onChange).toHaveBeenCalledWith('bye', expect.anything());
  });

  it('strips library-internal props and maps readonly/placeHolder', () => {
    const TextInput = headlessUIComponents.TextInput;
    const { container } = render(
      <TextInput value="" onChange={() => {}} readonly placeHolder="ph" entityForm={{}} />,
    );
    const input = container.querySelector('input')!;
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('placeholder')).toBe('ph');
    // non-DOM internal prop must not leak to the element
    expect(input.getAttribute('entityForm')).toBeNull();
  });

  it('Table exposes compound sub-components', () => {
    const Table = headlessUIComponents.Table as any;
    const { container } = render(
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>H</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>C</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>,
    );
    expect(container.querySelector('table thead th')?.textContent).toBe('H');
    expect(container.querySelector('table tbody td')?.textContent).toBe('C');
  });

  it('Modal renders children when open and hides when closed', () => {
    const Modal = headlessUIComponents.Modal as any;
    const { queryByText, rerender } = render(<Modal opened={true}>body</Modal>);
    expect(queryByText('body')).not.toBeNull();
    rerender(<Modal opened={false}>body</Modal>);
    expect(queryByText('body')).toBeNull();
  });
});
