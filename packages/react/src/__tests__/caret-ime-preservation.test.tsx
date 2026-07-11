// EC-F2 — regression pins for the 0.3.x → 0.4 caret-loss fix (answers a user
// question, not a new bug hunt).
//
// In 0.3.x every keystroke on a string-shaped field ran `setEntityForm` —
// a WHOLE-FORM re-render with new props drilled down through every field —
// so a controlled <input>'s VALUE prop changed on a re-render that also
// recreated ancestor JSX, which is exactly the shape of change that can lose
// the caret (React reconciliation is node-identity-based; a remount, or even
// just an unlucky diff, resets selection to the end).
//
// 0.4 fixes this structurally, not by patching the symptom: field VALUE lives
// in the zustand store (ADR-0002), and each renderer subscribes to only its
// OWN slice via `useFieldValue`/`useFormField` (decision D4 — see
// FieldRenderer.tsx, form-store.tsx). A keystroke therefore re-renders ONLY
// that one FieldRenderer + its concrete <Renderer>, with the SAME component
// in the SAME position in the tree — no sibling, no ancestor, no whole-form
// re-render. This file pins that guarantee for the plain string-shaped
// fields (text/StringField, textarea/TextareaField, markdown/MarkdownField —
// the latter two both currently the Textarea fallback, default-renderers.tsx)
// and for Korean IME composition, so a future change that reintroduces
// per-keystroke whole-form re-rendering (or per-field remounting) fails a
// test instead of shipping silently.
//
// What jsdom CAN vs CANNOT prove about "the caret didn't move":
//   - CAN: DOM node identity across renders (the real root cause of 0.3.x's
//     caret loss — a remount always drops the caret, in every browser and in
//     jsdom alike). This is the load-bearing assertion in every test below.
//   - CAN, with a caveat: `input.selectionStart`/`selectionEnd` immediately
//     after a synthetic edit — but ONLY because `fireEvent.change`'s `target`
//     object is `Object.assign`-ed onto the node AFTER the value setter runs
//     (@testing-library/dom `events.js`), so we are explicitly forcing the
//     post-edit caret position, not observing a browser's natural
//     "typing advances the caret" behavior. A passing assertion here proves
//     "the framework's re-render does not clobber a caret position that
//     already matches the committed value" (the property node-identity +
//     single-slice re-rendering actually guarantees) — it does NOT prove
//     jsdom reproduces real browser typing/IME caret placement, which jsdom
//     does not implement.
//   - CANNOT: real IME composition-buffer rendering (jsdom has no native IME;
//     `fireEvent.compositionStart/compositionEnd` are plain DOM events with
//     no engine-level effect on `<input>`/`<textarea>` — jsdom never
//     suppresses or coalesces the `input` events we fire in between, unlike
//     a real browser mid-composition). So the composition test below proves
//     "a store write driven by a composition-shaped event sequence does not
//     remount the input and lands the correct final value" — it does not
//     (cannot, in jsdom) prove a real IME's on-screen composition underline
//     survives a store round-trip.

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EntityForm, MarkdownField, StringField, TextareaField } from '@listgrid/schema-core';
import { createFormStore } from '@listgrid/state';
import { defaultUIComponents } from '@listgrid/ui-default';
import { AuthProvider } from '../providers/auth';
import { UIProvider } from '../providers/ui';
import { FormStoreProvider } from '../providers/form-store';
import { registerDefaultRenderers } from '../registry/default-renderers';
import { ViewEntityForm } from '../components/ViewEntityForm';

registerDefaultRenderers();

const INITIAL = 'Hello World'; // caret target: right after "Hello" (index 5)
const MID_STRING_EDIT = 'Hello! World'; // '!' inserted at index 5; caret lands at 6

function fieldForm(field: StringField | TextareaField | MarkdownField): EntityForm {
  return new EntityForm('CaretEntityForm', '/caret').addFields({ items: [field] });
}

function renderField(field: StringField | TextareaField | MarkdownField, label: string) {
  const entityForm = fieldForm(field);
  const store = createFormStore(entityForm);
  render(
    <UIProvider components={defaultUIComponents}>
      <AuthProvider session={undefined}>
        <FormStoreProvider store={store}>
          <ViewEntityForm entityForm={entityForm} store={store} onSave={() => {}} />
        </FormStoreProvider>
      </AuthProvider>
    </UIProvider>,
  );
  return { store, labelPattern: new RegExp(`^${label}`) };
}

describe('EC-F2 — mid-string edit preserves node identity + merges correctly (text/textarea/markdown)', () => {
  it.each([
    [
      'text (StringField)',
      () => new StringField('name', 1).withDefaultValue(INITIAL).withLabel('Name'),
    ],
    [
      'textarea (TextareaField)',
      () => new TextareaField('bio', 1).withDefaultValue(INITIAL).withLabel('Bio'),
    ],
    [
      'markdown (MarkdownField, Textarea fallback)',
      () => new MarkdownField('notes', 1).withDefaultValue(INITIAL).withLabel('Notes'),
    ],
  ] as const)('%s', async (_desc, makeField) => {
    const field = makeField();
    const { store, labelPattern } = renderField(field, field.getLabel() as string);
    const name = field.getName();

    const input = (await screen.findByLabelText(labelPattern)) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    expect(input.value).toBe(INITIAL);
    const nodeBefore = input;

    // A mid-string keystroke: caret was after "Hello" (index 5), user typed
    // '!', so the new value has it inserted there and the caret should now
    // sit right after it (index 6) — NOT jumped to the end (index 12), which
    // is what the 0.3.x whole-form-remount bug looked like to a user.
    input.setSelectionRange(5, 5);
    fireEvent.change(input, {
      target: { value: MID_STRING_EDIT, selectionStart: 6, selectionEnd: 6 },
    });

    await waitFor(() => expect(store.getState().fields[name]?.current).toBe(MID_STRING_EDIT));

    // Node identity: the renderer was NOT remounted by this edit (the actual
    // structural guarantee — D4 single-slice subscription, FieldRenderer.tsx).
    // A remount here is exactly what would have reset the caret in 0.3.x.
    expect(screen.getByLabelText(labelPattern)).toBe(nodeBefore);

    // Merged value is correct — the insert landed at the right position, not
    // e.g. appended/prepended by some stale-closure bug.
    expect(input.value).toBe(MID_STRING_EDIT);

    // See file header for what this selectionStart assertion does/doesn't
    // prove in jsdom: it confirms the post-edit re-render (same value coming
    // back down from the store) did not reset a caret that already matched.
    expect(input.selectionStart).toBe(6);
    expect(input.selectionEnd).toBe(6);
  });
});

describe('EC-F2 — Korean IME composition does not remount the input or lose intermediate/final values', () => {
  it('compositionstart → interim input events → compositionend: store receives the final composed value, node identity holds throughout', async () => {
    const field = new StringField('name', 1).withDefaultValue(INITIAL).withLabel('Name');
    const { store } = renderField(field, 'Name');
    const name = field.getName();

    const input = (await screen.findByLabelText(/^Name/)) as HTMLInputElement;
    const nodeBefore = input;
    input.setSelectionRange(INITIAL.length, INITIAL.length);

    // Current TextRenderer (default-renderers.tsx) has no
    // onCompositionStart/onCompositionEnd handling — it is a plain
    // controlled <input>. That is deliberate here: the composition buffer
    // itself lives in the BROWSER (native IME), not in this component; React
    // only ever sees committed `input`/`change` events. This test drives
    // that exact interim-then-final `input`-event shape a real Korean IME
    // produces (조합 중 값 → 조합 완료 값) and asserts the single-slice
    // re-render path does not fight it.
    fireEvent.compositionStart(input, { data: '' });

    // interim composition buffer: 'ㅎ' → '하' (조합 중)
    fireEvent.change(input, { target: { value: `${INITIAL}ㅎ` } });
    await waitFor(() => expect(store.getState().fields[name]?.current).toBe(`${INITIAL}ㅎ`));
    // NOT remounted mid-composition — a remount here would drop the native
    // IME's in-progress composition state in a real browser.
    expect(screen.getByLabelText(/^Name/)).toBe(nodeBefore);

    fireEvent.change(input, { target: { value: `${INITIAL}하` } });
    await waitFor(() => expect(store.getState().fields[name]?.current).toBe(`${INITIAL}하`));
    expect(screen.getByLabelText(/^Name/)).toBe(nodeBefore);

    // 조합 완료
    fireEvent.compositionEnd(input, { data: '하' });
    fireEvent.change(input, { target: { value: `${INITIAL}하` } });

    await waitFor(() => expect(store.getState().fields[name]?.current).toBe(`${INITIAL}하`));
    expect(screen.getByLabelText(/^Name/)).toBe(nodeBefore);
    expect(input.value).toBe(`${INITIAL}하`);
  });
});
