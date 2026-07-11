import {
  EntityForm,
  FormField,
  ManyToOneField,
  NumberField,
  SelectField,
  StringField,
  XrefMappingField,
  type FilterItem,
  type FormMutator,
  type SelectOption,
} from '@listgrid/schema-core';
import { CollegeEntityForm } from './college';
import { ProfessorEntityForm } from './professor';
import { StaffEntityForm } from './staff';

// Major — EC3 (plan §EC, documents/plans/e-track-field-parity.md), the
// reproduction target of ea-d2-xref-major-briefing.md §1/§6 (read in full
// before touching this port; every branch below is re-verified line-for-line
// against ~/dev/gjcu-academic-backend/gjcu-academic-front/packages/entities/
// Academic/University/MajorEntityForm.tsx). Field set is the briefing §6
// TRIMMED proof surface (task instruction), not §1's full inventory:
// englishName/dean/alias/externalId/description/entranceFee/competencies/
// syncNameChange/degrees/graduationSubjects/majorInterviews/majorMovies are
// all dropped — this exercises exactly: type-driven tab-self-hidden (EC3-0)
// + college/parentMajor required/hidden cascade + mutual exclusion +
// self-referencing M2O (flat + NOT_EQUAL self-filter) + 2 XrefMapping fields
// (professors unfiltered, staffs with an async domain filter).

export const majorFetchUrl = '/major';

// --- static option catalog (MajorEntityForm.tsx :275-278, byte-for-byte) ---
export const MajorTypes: SelectOption[] = [
  { label: '학부', value: 'DEPARTMENT' },
  { label: '학과', value: 'MAJOR' },
];

const GRADUATE_TAB_ID = 'graduate';
// The graduate tab's fields (EC3-0 dual-write contract — FormMutator.
// setTabHidden doc: setTabHidden only ever touches the tab BAR button; a
// form that wants the old MAJOR-form behavior (hidden tab's fields also stop
// validating) must ALSO setMeta(name, {hidden}) on each field in that tab).
const GRADUATE_TAB_FIELDS = ['majorMandatory', 'majorSelective', 'minorMandatory'];

// Source field onInitialize needs to READ before the store/hydrate exist —
// same withOnFetchData pre-seed pattern as collabo.ts (ONINITIALIZE_SOURCE_FIELDS).
const ONINITIALIZE_SOURCE_FIELDS = ['type'];

/**
 * MajorEntityForm.tsx :192-246 (onChanges) — three branches, self-filtered by
 * `changedField` (0.3.x parity: every handler runs on every change).
 *
 * DEVIATION (documented, not silent) from the 0.3.x source, both here and in
 * the 'college'/'parentMajor' branches below: old code UNCONDITIONALLY reset
 * the sibling field's VALUE (and, for 'college', also its `required` meta)
 * on BOTH the truthy and falsy transition. Under the 0.3.x single-shot
 * dispatch engine that was safe (a handler's own `setValue` call never
 * re-triggered onChanges). Under this engine's EF2 sync-batch cascade (a
 * handler's nested setValue DOES re-dispatch the sibling's handler — see
 * form-store.ts loop-guard doc), porting that literally creates TWO distinct
 * self-destructive ping-pongs, fixed two different ways:
 *
 * (1) college<->parentMajor branches: picking college -> college handler
 * clears parentMajor (nested dispatch) -> parentMajor handler (now falsy)
 * clears college's value RIGHT BACK, wiping the selection the user just
 * made (symmetric the other direction too). Fix: only the TRUTHY branch
 * resets the sibling's value (the actual "mutual exclusion" semantic —
 * task description "pick one hides+resets the other"); the FALSY branch
 * only restores the sibling's visibility, never touches a value.
 *
 * (2) the 'type' branches below reset BOTH siblings' values in one go
 * (faithful to source — DEPARTMENT resets parentMajor AND college;
 * MAJOR resets parentMajor only) — each nested setValue cascades into (1)'s
 * handler, which (via its falsy branch) writes a STRAY hidden-meta value on
 * the OTHER sibling as a side effect. Left in source order, that stray write
 * can land AFTER (and so clobber) this handler's own intended setMeta call
 * on that same field (e.g. DEPARTMENT's `setValue('college', undefined)`
 * cascades into a falsy parentMajor-handler dispatch that would otherwise
 * overwrite the immediately-preceding `setMeta('parentMajor', {hidden:
 * true})` back to hidden:false). Fix: every setValue in a 'type' branch runs
 * FIRST (letting all cascades fully settle), and the branch's own setMeta
 * calls — the AUTHORITATIVE final state — run LAST, so they always win
 * over any stray write a nested cascade produced along the way.
 */
function majorOnChanges(m: FormMutator, changedField: string): void {
  // MajorEntityForm.tsx :194-217 — type -> parentMajor/college/majorCode
  // required+hidden flips (symmetric both directions) + the graduate TAB
  // itself (EC3-0 setTabHidden, paired with the tab's fields' own hidden
  // meta per the dual-write contract). See DEVIATION (2) above for why every
  // setValue precedes every setMeta in each branch.
  if (changedField === 'type') {
    const type = m.getValue('type');
    if (type === 'DEPARTMENT') {
      m.setValue('parentMajor', undefined); // :198 setValue('parentMajor', '')
      m.setValue('college', undefined); // :200 getField('college')?.resetValue()
      m.setMeta('parentMajor', { hidden: true, required: false });
      m.setMeta('college', { required: true, hidden: false });
      m.setMeta('majorCode', { hidden: true, required: false });
      m.setTabHidden(GRADUATE_TAB_ID, true);
      for (const name of GRADUATE_TAB_FIELDS) m.setMeta(name, { hidden: true });
    } else {
      m.setValue('parentMajor', undefined); // :208 getField('parentMajor')?.resetValue()
      m.setMeta('parentMajor', { hidden: false, required: true });
      m.setMeta('college', { required: false, hidden: true });
      m.setMeta('majorCode', { hidden: false, required: true });
      m.setTabHidden(GRADUATE_TAB_ID, false);
      for (const name of GRADUATE_TAB_FIELDS) m.setMeta(name, { hidden: false });
    }
    return;
  }

  // MajorEntityForm.tsx :219-231 — college <-> parentMajor mutual exclusion,
  // college side. See the DEVIATION doc above re: the falsy branch.
  if (changedField === 'college') {
    const college = m.getValue('college');
    if (college) {
      m.setMeta('parentMajor', { hidden: true, required: false });
      m.setValue('parentMajor', undefined);
    } else {
      m.setMeta('parentMajor', { hidden: false });
    }
    return;
  }

  // MajorEntityForm.tsx :234-244 — mutual exclusion, parentMajor side.
  if (changedField === 'parentMajor') {
    const parentMajor = m.getValue('parentMajor');
    if (parentMajor) {
      m.setMeta('college', { hidden: true });
      m.setValue('college', undefined);
    } else {
      m.setMeta('college', { hidden: false });
    }
    return;
  }
}

export function MajorEntityForm(currentId?: string): EntityForm {
  // Self-ref exclude filter (EA-D2-0 M2O filter channel, conductor decision
  // ⑤ — flat picker + NOT_EQUAL self id, tree UI deferred). Baked into the
  // closure at FACTORY-call time (not read off `entityForm.getId()` later —
  // initializeFormStore's `entityForm.clone(true)` produces a NEW EntityForm
  // instance before `.withId(id)` runs, so a closure over the pre-clone
  // instance would never see it; the id must come in as this factory's own
  // parameter instead, same as `.clone().withId(id)` conveys it to the
  // college/student sync-createFormStore edit pages). On create there is no
  // id yet — `filter` stays undefined, so the picker shows every major
  // unfiltered (nothing to self-exclude yet).
  const parentMajorFilter = currentId
    ? async (): Promise<FilterItem[]> => [
        { name: 'id', queryConditionType: 'NOT_EQUAL', value: currentId },
      ]
    : undefined;

  const entityForm = new EntityForm('MajorEntityForm', majorFetchUrl)
    .withNeverDelete()
    .withTitle('학부/학과')
    .addFields({
      tab: { id: 'main', label: '기본정보', order: 0 },
      items: [
        new StringField('name', 100).withRequired(true).withLabel('학과명'),
        new SelectField('type', 200, MajorTypes)
          .withLabel('유형')
          .withRequired(true)
          .withDefaultValue('MAJOR'),
        new StringField('majorCode', 210).withLabel('학과코드').withRequired(true),
        new ManyToOneField('college', 300, {
          entityForm: () => CollegeEntityForm(),
          labelField: 'name',
        })
          .withLabel('소속 대학')
          .withRequired(true),
        new ManyToOneField('parentMajor', 310, {
          entityForm: () => MajorEntityForm(),
          labelField: 'name',
          ...(parentMajorFilter ? { filter: parentMajorFilter } : {}),
        }).withLabel('상위 학부'),
      ],
    })
    .addFields({
      tab: { id: 'main' },
      fieldGroup: { id: 'professors', label: '소속 교수 정보', order: 400 },
      items: [
        new XrefMappingField('professors', 400, {
          entityForm: () => ProfessorEntityForm(),
        }).withLabel('소속 교수'),
      ],
    })
    .addFields({
      tab: { id: 'main' },
      fieldGroup: { id: 'staffs', label: '조교 정보', order: 500 },
      items: [
        // MajorEntityForm.tsx :121-127 — single async function form
        // (decision ③ — corrects the gjcu `filters:[fn]` array-of-one-
        // function anomaly the briefing flags).
        new XrefMappingField('staffs', 500, {
          entityForm: () => StaffEntityForm(),
          filters: async () => [{ name: 'assistant', queryConditionType: 'EQUAL', value: true }],
        }).withLabel('조교'),
      ],
    })
    .addFields({
      tab: { id: GRADUATE_TAB_ID, label: '입학/졸업 설정', order: 100 },
      items: [
        // Order numbers deliberately HIGH (600+), not tab-local 100/200/300 —
        // EntityForm.getFields() sorts GLOBALLY across every tab (entity-
        // form.ts), and ViewListGrid's default-column derivation
        // (deriveDefaultColumnNames) reads off that same global order for
        // ANY ViewListGrid of this entity with no explicit `columns` prop
        // (e.g. the parentMajor self-ref M2O picker) — colliding with the
        // 'main' tab's low order numbers (100/200/210) would interleave
        // these NumberFields into that picker's default columns.
        new NumberField('majorMandatory', 600).withLabel('전공필수 이수 학점 제한'),
        new NumberField('majorSelective', 610).withLabel('전공선택 이수 학점 제한'),
        new NumberField('minorMandatory', 620).withLabel('부전공 이수 학점'),
      ],
    });

  entityForm
    .withOnChanges(majorOnChanges)
    .withOnFetchData((ef, data) => {
      // Pre-store seeding for onInitialize (same pattern as collabo.ts) — 'type'
      // is the only field MajorEntityForm.tsx's onInitialize (:248-266) reads.
      for (const name of ONINITIALIZE_SOURCE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(data, name)) {
          ef.getField(name)?.withValue(data[name]);
        }
      }
      return ef;
    })
    .withOnInitialize((ef) => {
      // MajorEntityForm.tsx :248-266 — deliberately NOT update-gated (unlike
      // Collabo's onInitialize): re-verified against source, the old handler
      // runs unconditionally on EVERY render (create too), so a freshly
      // created record's default type ('MAJOR') gets its college/parentMajor/
      // majorCode/graduate-tab flips applied on first paint too, not just on
      // load-an-existing-record.
      const type = (ef.getField('type') as FormField | undefined)?.value?.current;
      const collegeField = ef.getField('college') as FormField | undefined;
      const parentMajorField = ef.getField('parentMajor') as FormField | undefined;
      const majorCodeField = ef.getField('majorCode') as FormField | undefined;

      if (type === 'DEPARTMENT') {
        // :250-255 — college is untouched here: its STATIC declaration
        // (required:true, hidden:false above) already matches DEPARTMENT's
        // desired state, same as the old code relying on the field's
        // undisturbed default (only 'parentMajor'/majorCode/tab are touched).
        parentMajorField?.withHidden(true).withRequired(false);
        ef.setTabHidden(GRADUATE_TAB_ID, true);
        for (const name of GRADUATE_TAB_FIELDS) {
          (ef.getField(name) as FormField | undefined)?.withHidden(true);
        }
        majorCodeField?.withHidden(true).withRequired(false);
      } else {
        // :256-263
        collegeField?.withHidden(true).withRequired(false);
        parentMajorField?.withHidden(false).withRequired(true);
        ef.setTabHidden(GRADUATE_TAB_ID, false);
        for (const name of GRADUATE_TAB_FIELDS) {
          (ef.getField(name) as FormField | undefined)?.withHidden(false);
        }
        majorCodeField?.withHidden(false).withRequired(true);
      }
      return ef;
    });

  return entityForm;
}
