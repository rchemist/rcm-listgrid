// AddressFieldRenderer — JSDOM integration test (EB2, plan §EB). Same harness shape as
// inline-map-field.test.tsx: real EntityForm + createFormStore + the full provider stack,
// registerDefaultRenderers(). react-daum-postcode is mocked (vi.mock) — no real Daum network
// call, jsdom-only, per task constraint.
//
// Covers: (a) applyFullAddressFields renders ONE address editor — the 5 flat siblings are
// suppressed from ViewEntityForm's standalone iteration (no standalone <FieldRenderer> for
// them), yet required validation on address1/postalCode still fires end-to-end on a save
// attempt (the EB1 "renderedBy, not hidden" posture); (b) the Daum picker's onComplete fans out
// zonecode/roadAddress/sido/sigungu to the 4 siblings, closes the modal, and leaves address2
// editable; (c) hydrating flat sibling data renders correctly in the composite display.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { EntityForm, applyFullAddressFields, type AddressFieldsProps } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

vi.mock('react-daum-postcode', () => ({
  default: (props: { onComplete: (data: unknown) => void }) => (
    <button
      type="button"
      onClick={() =>
        props.onComplete({
          zonecode: '06133',
          roadAddress: '테헤란로 1',
          sido: '서울',
          sigungu: '강남구',
        })
      }
    >
      mock-daum-complete
    </button>
  ),
}));

registerDefaultRenderers();

function addressForm(props?: AddressFieldsProps): EntityForm {
  return applyFullAddressFields(new EntityForm('StudentEntityForm', '/student'), props);
}

function renderForm(entityForm: EntityForm, onSave = vi.fn()) {
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={onSave} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store };
}

describe('AddressFieldRenderer — standalone-iteration suppression (renderedBy, not hidden)', () => {
  it('renders ONE composite address editor; the 5 flat siblings have no standalone <FieldRenderer>', async () => {
    renderForm(addressForm({ required: true }));
    await screen.findByText('주소 찾기');

    expect(document.querySelector('[data-field-name="address"]')).toBeInTheDocument();
    for (const sibling of ['state', 'city', 'address1', 'address2', 'postalCode']) {
      expect(document.querySelector(`[data-field-name="${sibling}"]`)).not.toBeInTheDocument();
    }

    // the composite renderer itself owns the postalCode/address1 display + address2 editor
    expect(document.getElementById('postalCode')).toBeInTheDocument();
    expect(document.getElementById('address1')).toBeInTheDocument();
    expect(document.getElementById('address2')).toBeInTheDocument();
  });

  it('required on address1/postalCode fires end-to-end on save attempt when blank', async () => {
    const { store } = renderForm(addressForm({ required: true }));
    await screen.findByText('주소 찾기');

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(store.getState().fields['address1']?.errors?.length ?? 0).toBeGreaterThan(0);
      expect(store.getState().fields['postalCode']?.errors?.length ?? 0).toBeGreaterThan(0);
    });

    // the composite renderer surfaces the sibling errors itself (siblings have no standalone
    // <FieldRenderer> of their own to render an error list).
    expect(document.getElementById('address1-error')).toBeInTheDocument();
    expect(document.getElementById('postalCode-error')).toBeInTheDocument();
  });

  it('non-required siblings never block save; filling address1/postalCode clears their errors', async () => {
    const { store } = renderForm(addressForm({ required: true }));
    await screen.findByText('주소 찾기');

    store.getState().setValue('address1', '테헤란로 1');
    store.getState().setValue('postalCode', '06133');

    const valid = await store.getState().validateAll();
    expect(valid).toBe(true);
  });
});

describe('AddressFieldRenderer — Daum picker onComplete fan-out (mocked react-daum-postcode)', () => {
  it('opens the modal, fans out zonecode/roadAddress/sido/sigungu to all 4 siblings, closes, leaves address2 editable', async () => {
    const { store } = renderForm(addressForm());
    await screen.findByText('주소 찾기');

    fireEvent.click(screen.getByRole('button', { name: '주소 찾기' }));
    const dialog = await screen.findByRole('dialog');
    const complete = within(dialog).getByRole('button', { name: 'mock-daum-complete' });
    fireEvent.click(complete);

    await waitFor(() => {
      expect(store.getState().getValue('postalCode')).toBe('06133');
      expect(store.getState().getValue('address1')).toBe('테헤란로 1');
      expect(store.getState().getValue('state')).toBe('서울');
      expect(store.getState().getValue('city')).toBe('강남구');
    });

    // modal closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // address2 is editable (not readOnly) and never written by onComplete
    expect(store.getState().getValue('address2')).toBeUndefined();
    const address2Input = document.getElementById('address2') as HTMLInputElement;
    expect(address2Input).not.toHaveAttribute('readonly');

    fireEvent.change(address2Input, { target: { value: '3층' } });
    await waitFor(() => expect(store.getState().getValue('address2')).toBe('3층'));
  });

  it('focuses address2 after a completed selection closes the modal', async () => {
    renderForm(addressForm());
    await screen.findByText('주소 찾기');

    fireEvent.click(screen.getByRole('button', { name: '주소 찾기' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'mock-daum-complete' }));

    await waitFor(() => expect(document.activeElement?.id).toBe('address2'));
  });
});

describe('AddressFieldRenderer — EB-R1 review-gate fixes', () => {
  it('focus-first-invalid moves focus into a suppressed sibling (postalCode/address1) on an address-only-invalid save', async () => {
    const { store } = renderForm(addressForm({ required: true }));
    await screen.findByText('주소 찾기');

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(store.getState().fields['postalCode']?.errors?.length ?? 0).toBeGreaterThan(0);
      expect(store.getState().fields['address1']?.errors?.length ?? 0).toBeGreaterThan(0);
    });
    await waitFor(() => expect(['postalCode', 'address1']).toContain(document.activeElement?.id));
  });

  it('setMeta(postalCode, { required: false }) clears the required indicator/attribute', async () => {
    const { store } = renderForm(addressForm({ required: true }));
    await screen.findByText('주소 찾기');

    const postalCodeInput = document.getElementById('postalCode') as HTMLInputElement;
    await waitFor(() => expect(postalCodeInput).toHaveAttribute('aria-required', 'true'));

    store.getState().setMeta('postalCode', { required: false });

    await waitFor(() => expect(postalCodeInput).not.toHaveAttribute('aria-required'));
  });
});

describe('AddressFieldRenderer — hydrate seeds the composite display from flat data', () => {
  it('hydrated flat sibling values render in postalCode/address1/address2 displays', async () => {
    const entityForm = addressForm();
    const store = createFormStore(entityForm);
    store.getState().hydrate({
      state: '서울',
      city: '강남구',
      address1: '테헤란로 1',
      address2: '3층',
      postalCode: '06133',
    });

    render(
      <UIProvider components={defaultUIComponents}>
        <AuthProvider session={undefined}>
          <FormStoreProvider store={store}>
            <ViewEntityForm entityForm={entityForm} store={store} />
          </FormStoreProvider>
        </AuthProvider>
      </UIProvider>,
    );
    await screen.findByText('주소 찾기');

    expect((document.getElementById('postalCode') as HTMLInputElement).value).toBe('06133');
    expect((document.getElementById('address1') as HTMLInputElement).value).toBe('테헤란로 1');
    expect((document.getElementById('address2') as HTMLInputElement).value).toBe('3층');
    expect(screen.getByText('서울 강남구')).toBeInTheDocument();
  });
});
