// MessageViewFieldRenderer — JSDOM integration test (EA-A fan-out —
// MessageView). Same harness style as field-a11y.test.tsx: real EntityForm +
// createFormStore + provider stack + ViewEntityForm, asserting real DOM
// output. Registers ITS OWN renderer via registerFieldRenderer('messageView',
// ...) directly here (default-renderers.tsx is untouched, per the fan-out
// contract).
//
// NOTE (barrel dependency, fan-out isolation): `MessageViewField` is not yet
// re-exported from @listgrid/schema-core's index.ts — that barrel wiring is
// the orchestrator's job (this agent must not edit shared files, incl.
// index.ts). @listgrid/schema-core's package.json `exports` map is
// exact-match-only ("." -> ./src/index.ts), so a bare-specifier deep import
// (`@listgrid/schema-core/src/...`) would fail Node/Vite package resolution.
// A plain RELATIVE filesystem import bypasses the package "exports" map
// entirely (it never goes through node_modules), so it reaches the real
// class today; once the orchestrator adds the barrel export this import can
// be switched to `@listgrid/schema-core` with no behavior change.
import { MessageViewField } from '../../../schema-core/src/field/message-view-field';

import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntityForm } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerFieldRenderer } from '../registry/field-renderer-registry';
import { MessageViewFieldRenderer } from '../registry/message-view-renderer';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerFieldRenderer('messageView', MessageViewFieldRenderer);

function noticeForm(message: unknown): EntityForm {
  return new EntityForm('NoticeEntityForm', '/notice').addFields({
    items: [new MessageViewField('notice', 200, message as never)],
  });
}

function renderForm(entityForm: EntityForm, renderType: 'create' | 'update' = 'create') {
  const store = createFormStore(entityForm, { renderType });
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('MessageViewFieldRenderer', () => {
  it('renders a plain string message inside a data-field="messageView" wrapper', async () => {
    renderForm(noticeForm('안내 메시지입니다'));
    const wrapper = await screen.findByText('안내 메시지입니다');
    expect(wrapper).toHaveAttribute('data-field', 'messageView');
    expect(wrapper.tagName).toBe('DIV');
  });

  it('renders no <label> — hideLabel is constructor-forced (message-view-field.ts)', async () => {
    renderForm(noticeForm('안내 메시지입니다'));
    await screen.findByText('안내 메시지입니다');
    expect(document.querySelector('label')).toBeNull();
  });

  it('renders no editable control for the field — it is display-only (constructor-forced readonly)', async () => {
    renderForm(noticeForm('안내 메시지입니다'));
    await screen.findByText('안내 메시지입니다');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(document.querySelector('input, textarea, select')).toBeNull();
  });

  it('resolves an {onCreate, onUpdate} conditional message by the store renderType — create', async () => {
    renderForm(noticeForm({ onCreate: '생성 안내', onUpdate: '수정 안내' }), 'create');
    await screen.findByText('생성 안내');
    expect(screen.queryByText('수정 안내')).not.toBeInTheDocument();
  });

  it('resolves an {onCreate, onUpdate} conditional message by the store renderType — update', async () => {
    renderForm(noticeForm({ onCreate: '생성 안내', onUpdate: '수정 안내' }), 'update');
    await screen.findByText('수정 안내');
    expect(screen.queryByText('생성 안내')).not.toBeInTheDocument();
  });

  it('resolves a function-valued message against the FieldEvalContext (async, ctx.renderType)', async () => {
    const message = async (ctx: { renderType?: string }) => `현재 렌더타입: ${ctx.renderType}`;
    renderForm(noticeForm(message), 'update');
    await screen.findByText('현재 렌더타입: update');
  });

  it('a falsy message resolves to empty (getConditionalReactNode transplant — Config.ts branch order)', async () => {
    renderForm(noticeForm(undefined));
    const wrapper = document.querySelector('[data-field="messageView"]');
    expect(wrapper).not.toBeNull();
    await waitFor(() => expect(wrapper?.textContent).toBe(''));
  });
});
