import {
  BooleanField,
  DateField,
  EntityForm,
  FileField,
  FormField,
  ManyToOneField,
  SelectField,
  StringField,
  applyFullAddressFields,
  changeRequired,
  type FormMutator,
  type SelectOption,
} from '@listgrid/schema-core';
import { ProfessorEntityForm } from './professor';
import { StaffEntityForm } from './staff';
import { OrgEntityForm } from './org';

// Collabo — EC2 (plan §EC, documents/plans/e-track-field-parity.md), the
// reproduction target of the ec2-collabo-briefing.md scout report (read in
// full before this port; every branch below is re-verified against
// ~/dev/gjcu-academic-backend/gjcu-academic-front/packages/entities/Academic/
// Management/CollaboEntityForm.tsx line-for-line). Field set is §6's TRIMMED
// list, not §1's full inventory: representativeNumber/phoneNumber/
// emailAddress/collaboNumber/managerName/scholarshipRate/hasAsset/
// externalId/description/promotions are all dropped (EF2/EF3 exercise does
// not need them — §6 field-set fence + task instruction "fields per §6").

export const collaboFetchUrl = '/collabo';

// --- static option catalogs (CollaboEntityForm.tsx :331-358, byte-for-byte) ---
export const CollaboTypes: SelectOption[] = [
  { label: '공공기관', value: 'PUBLIC' },
  { label: '일반기업', value: 'CORP' },
  { label: '교육기관', value: 'EDUCATION' },
  { label: '군 기관', value: 'MILITARY' },
  { label: '연구기관', value: 'RESEARCH' },
  { label: '협회·단체', value: 'INSTITUTE' },
  { label: '해외기관', value: 'OVERSEAS' },
  { label: '기타', value: 'ETC' },
];

export const CollaboContractTypes: SelectOption[] = [
  { label: '비협약', value: 'NONE' },
  { label: '일반 협약', value: 'GENERAL' },
  { label: '위탁 협약', value: 'CONTRACTED' },
];

export const CollaboContractTypesCollaborated: SelectOption[] = [
  { label: '일반 협약', value: 'GENERAL' },
  { label: '위탁 협약', value: 'CONTRACTED' },
];

const CollaboContractTypesNoneOnly: SelectOption[] = [{ label: '비협약', value: 'NONE' }];

export const CollaboPromoterTypes: SelectOption[] = [
  { label: '교수', value: 'PROFESSOR' },
  { label: '교직원', value: 'STAFF' },
  { label: '기타', value: 'MANUAL' },
];

// Source fields §2's onInitialize branches 1/3/4 need to READ before the
// store/hydrate exist (see the withOnFetchData handler below).
const ONINITIALIZE_SOURCE_FIELDS = [
  'collaborated',
  'type',
  'promoterType',
  'professor',
  'staff',
  'promoterDepartment',
];

function asRecordWithId(value: unknown): { id?: string } | undefined {
  return value && typeof value === 'object' ? (value as { id?: string }) : undefined;
}

// §3 (:117-230) branches collaborated / promoterType / staff / professor —
// hand-written FormMutator logic (self-filtered by `changedField`, matching
// the ONE-dispatched-handler shape of the 0.3.x original, which self-filtered
// the same way). The 5th branch (type → representative required, :119-130)
// is registered separately below via the `changeRequired` builder — it is a
// clean single-field boolean-flip fit (§3 table: "changeRequired 빌더 또는
// hand-written"); these four are NOT — the contracted options swap targets
// one field from two directions (changeSelectOptions's revert-on-no-match
// would race the matched clause when both clauses target the same field —
// see the collaborated branch below), and promoterType is a 4-field mutual
// exclusion no builder in the EF2 catalog expresses.
function collaboOnChanges(m: FormMutator, changedField: string): void {
  // §3 :132-151 — collaborated → collaboratedAt hidden/required flip;
  // contracted options swap + readOnly + required + value reset to 'NONE'
  // when turning off; collaboratedAt value reset when turning off.
  if (changedField === 'collaborated') {
    const collaborated = Boolean(m.getValue('collaborated'));
    m.setMeta('collaboratedAt', { hidden: !collaborated, required: collaborated });
    if (collaborated) {
      m.setMeta('contracted', {
        options: CollaboContractTypesCollaborated,
        readonly: false,
        required: true,
      });
    } else {
      m.setMeta('contracted', {
        options: CollaboContractTypesNoneOnly,
        readonly: true,
        required: false,
      });
      m.setValue('contracted', 'NONE');
      // 0.3.x `entityForm.resetValue('collaboratedAt')` (:147) — FormMutator
      // has no resetValue (schema-core purity, ADR-0003); setValue(undefined)
      // is the closest achievable equivalent without a library change.
      m.setValue('collaboratedAt', undefined);
    }
    return;
  }

  // §3 :153-183 — promoterType → exactly one of professor/staff/promoterName
  // un-hidden+required, the other three hidden+reset. Nested setValue(...,
  // undefined) below DOES re-dispatch the staff/professor branches (EF2
  // sync-batch loop-guard, not the 0.3.x single-shot dispatch) — safe/
  // idempotent here (briefing §3 loop-guard note: "신엔진 sync-batch 가드로
  // 더 안전 — 기록만").
  if (changedField === 'promoterType') {
    const promoterType = m.getValue('promoterType');
    m.setMeta('professor', { hidden: true, required: false });
    m.setMeta('staff', { hidden: true, required: false });
    m.setMeta('promoterName', { hidden: true, required: false });
    m.setMeta('promoterDepartment', { hidden: true, required: false });

    if (promoterType === 'PROFESSOR') {
      m.setMeta('professor', { hidden: false, required: true });
      m.setValue('staff', undefined);
      m.setValue('promoterName', undefined);
      m.setValue('promoterDepartment', undefined);
    } else if (promoterType === 'STAFF') {
      m.setMeta('staff', { hidden: false, required: true });
      m.setValue('professor', undefined);
      m.setValue('promoterName', undefined);
      m.setValue('promoterDepartment', undefined);
    } else if (promoterType === 'MANUAL') {
      m.setMeta('promoterName', { hidden: false, required: true });
      m.setValue('professor', undefined);
      m.setValue('staff', undefined);
      m.setValue('promoterDepartment', undefined);
    } else {
      m.setValue('staff', undefined);
      m.setValue('professor', undefined);
      m.setValue('promoterName', undefined);
      m.setValue('promoterDepartment', undefined);
    }
    return;
  }

  // §3/§4 :186-207 — staff selected: if promoterDepartment isn't already set,
  // auto-fill it from the nested `staff.organization.id` the picker row
  // carried in (§4 mechanism — no extra fetch) + un-hide. Deselected: hide +
  // clear.
  if (changedField === 'staff') {
    const staff = asRecordWithId(m.getValue('staff')) as
      | { id?: string; organization?: { id?: string } }
      | undefined;
    if (staff) {
      const dept = asRecordWithId(m.getValue('promoterDepartment'));
      if (!dept || !dept.id) {
        if (staff.organization?.id) {
          m.setValue('promoterDepartment', staff.organization.id);
        }
      }
      m.setMeta('promoterDepartment', { hidden: false });
    } else {
      m.setMeta('promoterDepartment', { hidden: true });
      m.setValue('promoterDepartment', undefined);
    }
    return;
  }

  // §3 :210-226 — professor selected: un-hide promoterDepartment; if it
  // already holds a full row object (id present), collapse it to a bare id
  // (0.3.x :217-219 — "dead-looking", faithfully ported as-is, not fixed).
  // Deselected: hide + clear.
  if (changedField === 'professor') {
    const professor = m.getValue('professor');
    if (professor) {
      m.setMeta('promoterDepartment', { hidden: false });
      const dept = asRecordWithId(m.getValue('promoterDepartment'));
      if (dept?.id) {
        m.setValue('promoterDepartment', dept.id);
      }
    } else {
      m.setMeta('promoterDepartment', { hidden: true });
      m.setValue('promoterDepartment', undefined);
    }
  }
}

export function CollaboEntityForm(): EntityForm {
  const entityForm = new EntityForm('CollaboEntityForm', collaboFetchUrl)
    .withNeverDelete()
    .withTitle('산학협력기관')
    .addFields({
      items: [
        new StringField('name', 1).withRequired(true).withLabel('기관명'),
        new StringField('representative', 100).withRequired(true).withLabel('대표자명'),
        new StringField('officer', 300).withRequired(true).withLabel('담당자명'),
        new BooleanField('socialEnterprise', 600)
          .withLabel('사회적 기업 여부')
          .withDefaultValue(false),
      ],
    })
    .addFields({
      fieldGroup: { id: 'promoter', label: '추진자 정보', order: 200 },
      items: [
        new SelectField('promoterType', 100, CollaboPromoterTypes).withLabel('추진자 유형'),
        new ManyToOneField('professor', 200, {
          entityForm: () => ProfessorEntityForm(),
          labelField: 'name',
        })
          .withLabel('교수')
          .withHidden(true),
        new ManyToOneField('staff', 210, {
          entityForm: () => StaffEntityForm(),
          labelField: 'name',
        })
          .withLabel('교직원')
          .withHidden(true),
        new StringField('promoterName', 220).withLabel('추진자명').withHidden(true),
        new ManyToOneField('promoterDepartment', 300, {
          entityForm: () => OrgEntityForm(),
          labelField: 'name',
        })
          .withLabel('추진 부서')
          .withHidden(true),
      ],
    })
    .addFields({
      fieldGroup: { id: 'collaborated', label: '협약 현황', order: 300 },
      items: [
        new BooleanField('showOnApply', 100).withLabel('지원서 검색 가능 여부').withRequired(true),
        new BooleanField('collaborated', 200)
          .withLabel('협약 체결 여부')
          .withDefaultValue(false)
          .withRequired(true)
          .withHelpText(
            '협약 체결 여부는 협약 현황에서 유효한 협약 정보가 있으면 자동으로 설정됩니다.',
          ),
        new SelectField('contracted', 300, CollaboContractTypes)
          .withLabel('대분류')
          .withDefaultValue('NONE'),
        new SelectField('type', 400, CollaboTypes).withLabel('중분류').withRequired(true),
        new DateField('collaboratedAt', 500).withLabel('협약 체결 일자').withHidden(true),
        new FileField('asset', 800).withLabel('협약서 사본'),
      ],
    });

  applyFullAddressFields(entityForm, { order: 900, required: false });

  entityForm
    .withOnChanges(changeRequired('type', { value: 'ETC', result: { representative: false } }))
    .withOnChanges(collaboOnChanges)
    .withOnFetchData((ef, data) => {
      // Pre-store value seeding — NOT the dropped §2 branch-2 value-fixup
      // side channel. onInitialize below runs BEFORE the store/hydrate exist
      // (initializeFormStore order: onFetchData → onInitialize → build →
      // hydrate), so it has no direct access to fetched `data`; seeding the
      // SAME raw value onto each field's declaration here lets onInitialize
      // read it via `field.value.current`. hydrate() unconditionally
      // overwrites the store slice with this SAME raw value afterward (no
      // transform), so there is no clobber risk — unlike a value TRANSFORM
      // (branch 2, dropped), which hydrate WOULD clobber.
      for (const name of ONINITIALIZE_SOURCE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(data, name)) {
          ef.getField(name)?.withValue(data[name]);
        }
      }
      return ef;
    })
    .withOnInitialize((ef) => {
      // §2 (:232-308) — update-mode gated (:234), never runs on create.
      if (ef.getRenderType() !== 'update') return ef;

      const seeded = (name: string): unknown => ef.getField(name)?.value?.current;

      // §2 branch 1 (:236-259) — collaborated → collaboratedAt hidden/
      // required + contracted options swap + readOnly/required, re-derived
      // onto the field DECLARATIONS directly (pre-store, no FormMutator yet
      // — same withHidden/withRequired/withOptions grammar as the top-level
      // addFields calls above).
      const collaborated = Boolean(seeded('collaborated'));
      const collaboratedAtField = ef.getField('collaboratedAt') as FormField | undefined;
      collaboratedAtField?.withHidden(!collaborated).withRequired(collaborated);
      const contractedField = ef.getField('contracted') as SelectField | undefined;
      if (collaborated) {
        contractedField?.withOptions(CollaboContractTypesCollaborated).withReadOnly(false);
        contractedField?.withRequired(true);
      } else {
        contractedField?.withOptions(CollaboContractTypesNoneOnly).withReadOnly(true);
        contractedField?.withRequired(false);
      }
      // §2 branch 2 (:247-252, backend Boolean → Select string fixup)
      // intentionally DROPPED — see ec2-collabo-briefing.md §2 gap note:
      // hydrate() runs AFTER onInitialize and unconditionally overwrites the
      // store slice's `current` from the raw fetched value, clobbering any
      // value onInitialize sets here (no clean hook for a value-transform
      // exists yet — tracked as EF7). The sample fixture stores `contracted`
      // as the string enum directly (§2 recommendation), so this fixup is
      // never needed here.

      // §2 branch 3 (:261-267) — type → representative required.
      const type = seeded('type');
      (ef.getField('representative') as FormField | undefined)?.withRequired(type !== 'ETC');

      // §2 branch 4 (:269-299) — promoterType → professor/staff/
      // promoterName hidden/required + the promoterDepartment-required
      // ASYMMETRY (§2.4): loading a record with professor/staff ALREADY set
      // makes promoterDepartment REQUIRED, not just visible — onChanges
      // (above) never does this, only un-hides it. Preserved faithfully, not
      // "fixed" (task instruction).
      const promoterType = seeded('promoterType');
      const professorField = ef.getField('professor') as FormField | undefined;
      const staffField = ef.getField('staff') as FormField | undefined;
      const promoterNameField = ef.getField('promoterName') as FormField | undefined;
      const promoterDepartmentField = ef.getField('promoterDepartment') as FormField | undefined;

      if (promoterType === 'PROFESSOR') {
        staffField?.withHidden(true).withRequired(false);
        promoterNameField?.withHidden(true).withRequired(false);
        professorField?.withHidden(false).withRequired(true);
        if (seeded('professor')) {
          promoterDepartmentField?.withHidden(false).withRequired(true);
        } else {
          promoterDepartmentField?.withHidden(true).withRequired(false);
        }
      } else if (promoterType === 'STAFF') {
        professorField?.withHidden(true).withRequired(false);
        promoterNameField?.withHidden(true).withRequired(false);
        staffField?.withHidden(false).withRequired(true);
        const staff = seeded('staff') as { organization?: { id?: string } } | undefined;
        if (staff) {
          // 0.3.x also auto-fills `promoterDepartment` from
          // `staff.organization.id` here (:288) when it isn't already set —
          // NOT reproduced as a VALUE write: it would be silently clobbered
          // by hydrate() straight after (same gap as dropped branch 2, just
          // a second occurrence of it — see the withOnFetchData comment
          // above). Only the hidden/required META flips below survive.
          promoterDepartmentField?.withHidden(false).withRequired(true);
        } else {
          promoterDepartmentField?.withHidden(true).withRequired(false);
        }
      } else if (promoterType === 'MANUAL') {
        professorField?.withHidden(true).withRequired(false);
        staffField?.withHidden(true).withRequired(false);
        promoterDepartmentField?.withHidden(true).withRequired(false);
        promoterNameField?.withHidden(false).withRequired(true);
      }

      return ef;
    });

  return entityForm;
}

/**
 * §5 submit-transform workaround (ec2-collabo-briefing.md :313-325 —
 * `withOverrideSubmitData`, contracted string→Boolean; gap① — EntityForm has
 * no equivalent hook yet, tracked as EF6). GJCU's `contracted` column is a
 * Boolean; the SelectField's value is the string enum the `collaborated`
 * cascade swaps in ('NONE'|'GENERAL'|'CONTRACTED'). Applied by the
 * page-level `onSave` (apps/sample/app/collabo/new + [id] pages) before
 * POST/PUT — the only place available until EF6 lands a form-level hook.
 *
 * NOTE (residual, EF6+EF7 composition — see the §2-branch-2 comment inside
 * `withOnInitialize` above): this converts the OUTBOUND payload only. A
 * record saved through this transform, if reopened for edit, would show its
 * `contracted` Select unmatched (raw boolean vs. the string-valued options) —
 * the dropped onInitialize fixup (EF7 gap) and this submit workaround (EF6
 * gap) compose into that residual; reconciling the two is out of EC2's
 * scope. None of EC2's 5 E2E scenarios round-trips a saved `contracted`
 * value through edit, so it is inert for this port but worth flagging to the
 * conductor for EF6/EF7 sequencing.
 */
export function toCollaboSaveData(data: Record<string, unknown>): Record<string, unknown> {
  return { ...data, contracted: data.contracted === 'CONTRACTED' };
}
