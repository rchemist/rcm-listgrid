import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldRenderer } from './FieldRenderer';
import { EntityFormThemeProvider } from './context/EntityFormThemeContext';
import { CustomFieldRendererProps } from './types/ViewEntityFormTheme.types';
import { FieldRenderParameters } from '../../config/EntityField';
import { UIProvider } from '../../ui';
import { headlessUIComponents } from '../../ui/headless';

// P0-3: handleFieldChange 와 viewParams.onChange 는 원래 서로 거의 동일한 async IIFE 를
// 각자 들고 있었고, 둘 다 .catch 가 없어 validate() 가 reject 되면 unhandled rejection 이
// 되어 에러가 조용히 사라졌다 (필드 값/에러 피드백 모두 유실). 이제 두 경로 모두 공유 헬퍼
// applyFieldChange() 를 try/catch 로 감싸 setErrors() 를 보장한다. 두 진입점(커스텀 렌더러의
// handleFieldChange, 기본 뷰의 viewParams.onChange) 을 각각 검증한다.

type FieldRendererProps = React.ComponentProps<typeof FieldRenderer>;

const ERROR_MESSAGE = '필드 값을 처리하는 중 오류가 발생했습니다.';

function createMockEntityForm() {
  const clonedEntityForm = {
    setValue: vi.fn(),
    clearAlertMessages: vi.fn(),
    fields: new Map([['testField', { isDirty: () => true }]]),
    validate: vi.fn().mockRejectedValue(new Error('validate blew up')),
    mergeError: vi.fn(),
    onChanges: [],
    shouldReload: false,
    getField: vi.fn(() => undefined),
    getRenderType: vi.fn(() => 'form'),
  };

  const baseEntityForm = {
    version: 'v1',
    errors: [],
    fields: new Map([['testField', { isDirty: () => false }]]),
    getValue: vi.fn(() => undefined),
    getRenderType: vi.fn(() => 'form'),
    clone: vi.fn(() => clonedEntityForm),
  };

  return { baseEntityForm, clonedEntityForm };
}

function createMockField() {
  return {
    getName: () => 'testField',
    getLabel: () => 'Test Field',
    isRequired: async () => false,
    isReadonly: async () => false,
    getTooltip: async () => '',
    getHelpText: async () => '',
    getPlaceHolder: async () => '',
    view: async (params: FieldRenderParameters) => (
      <button type="button" onClick={() => params.onChange('new-value')}>
        trigger-change
      </button>
    ),
  };
}

describe('FieldRenderer — P0-3 onChange error surfacing', () => {
  it('surfaces the error via setErrors instead of swallowing it when the default view onChange handler fails', async () => {
    const { baseEntityForm, clonedEntityForm } = createMockEntityForm();
    const setEntityForm = vi.fn();

    render(
      <UIProvider components={headlessUIComponents}>
        <FieldRenderer
          field={createMockField() as unknown as FieldRendererProps['field']}
          entityForm={baseEntityForm as unknown as FieldRendererProps['entityForm']}
          setEntityForm={setEntityForm}
        />
      </UIProvider>,
    );

    const trigger = await screen.findByText('trigger-change');
    fireEvent.click(trigger);

    // 에러가 unhandled rejection 으로 사라지지 않고 화면에 표시되어야 한다
    expect(await screen.findByText(ERROR_MESSAGE)).toBeInTheDocument();
    expect(clonedEntityForm.validate).toHaveBeenCalled();
    // 검증 실패로 예외가 던져졌으므로 EntityForm 갱신까지 도달하지 않아야 한다
    expect(setEntityForm).not.toHaveBeenCalled();
  });

  it('surfaces the error via setErrors instead of swallowing it when the custom-renderer onChange handler fails', async () => {
    const { baseEntityForm, clonedEntityForm } = createMockEntityForm();
    const setEntityForm = vi.fn();

    const CustomRenderer: React.FC<CustomFieldRendererProps> = (props) => (
      <button type="button" onClick={() => props.onChange('new-value')}>
        custom-trigger
      </button>
    );

    render(
      <UIProvider components={headlessUIComponents}>
        <EntityFormThemeProvider fieldRenderers={{ testField: CustomRenderer }}>
          <FieldRenderer
            field={createMockField() as unknown as FieldRendererProps['field']}
            entityForm={baseEntityForm as unknown as FieldRendererProps['entityForm']}
            setEntityForm={setEntityForm}
          />
        </EntityFormThemeProvider>
      </UIProvider>,
    );

    const trigger = await screen.findByText('custom-trigger');
    fireEvent.click(trigger);

    expect(await screen.findByText(ERROR_MESSAGE)).toBeInTheDocument();
    expect(clonedEntityForm.validate).toHaveBeenCalled();
    expect(setEntityForm).not.toHaveBeenCalled();
  });
});
