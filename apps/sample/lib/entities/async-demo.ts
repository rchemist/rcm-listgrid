import { AsyncValidation, EntityForm, StringField, ValidateResult } from '@listgrid/schema-core';

// AsyncDemo — W4-3 E2E fixture ONLY (documents/plans/entityform-public-api-
// spec.md §5.3, CAP-05): a dedicated minimal entity proving AsyncValidation's
// trigger:'button' 중복확인 (duplicate-check) flow — button affordance, the
// checking/valid/invalid asyncState display, and the ValidateResult message —
// through a real browser. Isolated from college/major/etc. (perm-demo.ts/
// action-demo.ts precedent) so this fixture can never perturb their own E2E
// assertions. `check` is a client-side in-memory lookup against a tiny
// taken-alias set (no `/api/async-demo/*` route — action-demo.ts precedent).
// The E2E DOES click Save (W4-3a save-gating acceptance), but every tested
// save is BLOCKED by validateAll before the adapter call, so no backend round
// trip is exercised. `check` has a short artificial delay so the 'checking'
// asyncState is actually observable by Playwright rather than resolving within
// the same tick.
export const asyncDemoFetchUrl = '/async-demo';

const TAKEN_ALIASES = new Set(['taken-alias']);

export function AsyncDemoEntityForm(): EntityForm {
  return new EntityForm('AsyncDemoEntityForm', asyncDemoFetchUrl)
    .withTitle('중복확인 데모')
    .addFields({
      items: [
        new StringField('alias', 100).withLabel('별칭').withValidations(
          new AsyncValidation(
            async (value) => {
              await new Promise((resolve) => setTimeout(resolve, 300));
              const alias = typeof value === 'string' ? value : '';
              return TAKEN_ALIASES.has(alias)
                ? ValidateResult.fail('이미 사용 중인 별칭입니다')
                : ValidateResult.success();
            },
            { trigger: 'button', buttonLabel: '중복확인' },
          ),
        ),
      ],
    });
}
