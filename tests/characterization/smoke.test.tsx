// Harness smoke test — proves the characterization harness itself works
// end-to-end (P2-1). Every import below comes from the harness indirection
// (./harness, ./fixtures) — never from '../../src/...' directly. These tests
// exist purely to validate the harness's two load-bearing pieces —
// renderWithProviders+FieldRenderer, and the mockRcmFetch/configureApiClient
// seam — the same way every future characterization test will use them.
//
// Behavior assertions only — no snapshots (ADR-0007 §2 render-test recipe).

import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  renderWithProviders,
  FieldRenderer,
  FormField,
  mockRcmFetch,
  bareEntity,
  type EntityForm,
} from './harness';
import { createEmployeeForm } from './fixtures';

/**
 * Minimal controlled host — the same shape ViewEntityForm/ViewFieldGroup use
 * in the real engine: EntityForm lives in React state, FieldRenderer is
 * handed the current form + a setter, and re-renders when FieldRenderer
 * clones+updates the form after an onChange/validate cycle.
 */
function EmployeeNameFieldHost({ initialForm }: { initialForm: EntityForm }) {
  const [entityForm, setEntityForm] = useState<EntityForm | undefined>(initialForm);
  if (!entityForm) return null;

  const field = entityForm.getField('name');
  if (!(field instanceof FormField)) {
    throw new Error('fixture regression: Employee.name is expected to be a FormField');
  }

  return <FieldRenderer field={field} entityForm={entityForm} setEntityForm={setEntityForm} />;
}

describe('characterization harness smoke test', () => {
  it('renders Employee.name (StringField) via FieldRenderer, reflects typed input, and surfaces a validation error', async () => {
    renderWithProviders(<EmployeeNameFieldHost initialForm={createEmployeeForm()} />);

    const input = await screen.findByLabelText('이름');
    expect(input).toHaveValue('');

    // Type a value — assert it reflects back through the controlled EntityForm.
    fireEvent.change(input, { target: { value: '김도윤' } });
    await waitFor(() => expect(input).toHaveValue('김도윤'));

    // Clear it — Employee.name is required (withRequired(true) + a
    // RequiredValidation, see fixtures.ts) — FormField.validate() checks
    // the built-in `required` blank-check before the custom validations
    // array, so the surfaced message is the built-in
    // "<label>은 필수 값입니다." rather than RequiredValidation's own
    // message. That precedence is itself part of what this harness must
    // characterize faithfully — assert on the actual engine behavior.
    fireEvent.change(input, { target: { value: '' } });

    expect(await screen.findByText(/필수 값입니다/)).toBeInTheDocument();
  });
});

describe('characterization harness smoke test — mockRcmFetch', () => {
  it('resolves EntityForm.initialize() through the configureApiClient seam and records the request', async () => {
    const backendEmployee = { id: '1', name: '박서준', email: 'seojun.park@example.com' };
    const mock = mockRcmFetch([
      { method: 'GET', url: '/api/employee/1', handler: () => bareEntity(backendEmployee) },
    ]);

    try {
      const form = createEmployeeForm().withId('1');
      const result = await form.initialize({});

      expect(result.errors).toBeUndefined();
      expect(result.entityForm.getField('name')?.value?.fetched).toBe('박서준');
      expect(mock.requests).toEqual([{ url: '/api/employee/1', method: 'GET', body: undefined }]);
    } finally {
      mock.restore();
    }
  });
});
