import { describe, it, expect, vi } from 'vitest';
import { buildQuickViewForm } from './ViewRows';

/**
 * Regression coverage for project-manager PM-4: the search-mode / mobile
 * inline "quick view" modal (built via `handleViewEntity` /
 * `toggleInlineExpansion` in ViewRows.tsx) used to call
 * `entityForm.clone(true).withId(item.id).withTitle('상세 정보')`, which
 * replaced the whole `title` config object and dropped an app-provided
 * `title.view` / `title.field`. `useEntityFormTitle`'s fallback then showed
 * `'정보 조회 > <uuid>'` — a raw entity id in the modal chrome.
 *
 * `buildQuickViewForm` must preserve `title.view`/`title.field` on the
 * cloned quick-view form, and resolve `title.view` (when present) into the
 * modal chrome title instead of the hard-coded `'${titleStr} 조회'`.
 */
describe('buildQuickViewForm', () => {
  function makeEntityForm(title: unknown) {
    const clonedForm: Record<string, unknown> = { title };
    const withId = vi.fn().mockReturnValue(clonedForm);
    const withTitle = vi.fn().mockImplementation((t: unknown) => {
      clonedForm.title = t;
      return clonedForm;
    });
    clonedForm.withId = withId;
    clonedForm.withTitle = withTitle;

    const entityForm: Record<string, unknown> = {
      title,
      clone: vi.fn().mockReturnValue(clonedForm),
    };
    return { entityForm, clonedForm, withTitle };
  }

  it('preserves title.view / title.field on the quick-view form and resolves the modal title', async () => {
    const view = vi.fn().mockResolvedValue('커스텀 상세 제목');
    const { entityForm, withTitle } = makeEntityForm({
      title: '기본',
      field: 'name',
      view,
    });

    const { viewEntityForm, modalTitle } = await buildQuickViewForm(entityForm, 'item-1');

    // title.view / title.field survive the clone — only the string `title`
    // gets a default, never a hard `withTitle('상세 정보')` overwrite.
    expect(withTitle).toHaveBeenCalledWith({
      title: '기본',
      field: 'name',
      view,
    });
    expect(viewEntityForm.title.view).toBe(view);
    expect(viewEntityForm.title.field).toBe('name');

    // the resolved view() result becomes the modal chrome title — never
    // '정보 조회 > <uuid>'.
    expect(view).toHaveBeenCalledWith(viewEntityForm);
    expect(modalTitle).toBe('커스텀 상세 제목');
  });

  it('falls back to `${title} 조회` when there is no title.view (plain string title unchanged)', async () => {
    const { entityForm, withTitle } = makeEntityForm('공지사항');

    const { modalTitle } = await buildQuickViewForm(entityForm, 'item-2');

    expect(withTitle).toHaveBeenCalledWith({ title: '공지사항' });
    expect(modalTitle).toBe('공지사항 조회');
  });

  it('falls back to `${title} 조회` when title.view rejects', async () => {
    const view = vi.fn().mockRejectedValue(new Error('boom'));
    const { entityForm } = makeEntityForm({ title: '문의', view });

    const { modalTitle } = await buildQuickViewForm(entityForm, 'item-3');

    expect(modalTitle).toBe('문의 조회');
  });

  it('defaults a missing title to 상세 정보 / 정보 조회, matching prior behaviour for untitled forms', async () => {
    const { entityForm, withTitle } = makeEntityForm(undefined);

    const { modalTitle } = await buildQuickViewForm(entityForm, 'item-4');

    expect(withTitle).toHaveBeenCalledWith({ title: '상세 정보' });
    expect(modalTitle).toBe('정보 조회');
  });
});
