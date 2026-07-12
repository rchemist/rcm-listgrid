import {
  BooleanField,
  EntityForm,
  ManyToOneField,
  StringField,
  TextareaField,
} from '@listgrid/schema-core';
import { ProfessorEntityForm } from './professor';

// College — reimplemented on the new @listgrid/* engine, faithful to the GJCU
// production CollegeEntityForm (packages/entities/Academic/University/
// CollegeEntityForm.tsx) minus the dean ManyToOne (added in V0.4b) and the
// alias/externalId/status presets (V1). The declaration is the walking-skeleton
// proof: one factory yields both the list and the form (charter C1).

export const collegeFetchUrl = '/college';

export function CollegeEntityForm(): EntityForm {
  return (
    new EntityForm('CollegeEntityForm', collegeFetchUrl)
      .withTitle('단과대학')
      .addFields({
        items: [
          // withList (spec §5.1; W5-2) — College's own list page passes no
          // explicit `columns` prop, so it relies on this derivation (the
          // magic "first ~4 non-hidden fields" fallback it used to fall back
          // to is abolished). `label`/`sortable` on `name` and `align`/`width`
          // on `englishName` exercise the FieldListConfig overrides, not just
          // opt-in. `withFilter` (spec §5.1/§7, CAP-20; W5-3) opts `name` into
          // the advanced-search panel — `operator: 'LIKE'` (a valid
          // QueryConditionType) exercises the FieldFilterConfig.operator
          // passthrough into the panel's `addAndFilter` call.
          new StringField('name', 100)
            .withRequired(true)
            .withLabel('명칭')
            .withList({ label: '대학명', sortable: true })
            .withFilter({ label: '대학명', operator: 'LIKE' }),
          new StringField('englishName', 110)
            .withRequired(true)
            .withLabel('영문명')
            .withList({ align: 'left', width: 220 }),
          // dean — a ManyToOne reference to Professor via a LAZY thunk (decision
          // D1). Selecting opens a Modal ViewListGrid picker; save flattens to
          // deanId (charter C3).
          new ManyToOneField('dean', 115, {
            entityForm: () => ProfessorEntityForm(),
            labelField: 'name',
          }).withLabel('학장'),
          new BooleanField('active', 120)
            .withLabel('사용여부')
            .withDefaultValue(true)
            .withList({ align: 'center' }),
        ],
      })
      .addFields({
        group: { id: 'additional', label: '부가 정보', order: 200 },
        items: [new TextareaField('description', 210, 4).withLabel('대학 소개')],
      })
      // withDataTransfer (spec §3.5, CAP-16/17; W6-3) — empty `export`/`import`
      // objects trigger auto-derive over ALL of College's declared fields
      // (`resolveDataTransferSpec`, schema-core `data-transfer.ts`); the
      // `/excel` layer's TIER-3 filter (`field-resolution.ts`) then drops any
      // composite type with no flat xlsx-cell representation from what
      // actually reaches the export/import UI. `dean` (manyToOne) is TIER 2
      // (scalar passthrough, not TIER-3-excluded) and carries no seed value in
      // this sample's mock rows, so it round-trips as a harmless blank column —
      // the College list page's E2E fixture only populates the genuinely
      // scalar columns (name/englishName/active) to keep the import round-trip
      // deterministic (e2e/college-excel.spec.ts).
      .withDataTransfer({ export: {}, import: {} })
  );
}
