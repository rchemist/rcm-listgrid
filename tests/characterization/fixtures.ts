// Characterization fixtures — 3 representative EntityForm declarations built
// with the REAL EntityForm/field builder API (see documents/prd/sample-site-spec.md
// §도메인 모델). Every import comes from the harness indirection — see
// tests/characterization/harness.ts — never from '../../src/...' directly.
//
// Each entity is exported as a factory function (not a shared singleton) so
// every test gets an independent instance — EntityForm/fields are mutable
// builders and .clone() is shallow in places (see EntityForm.clone.p0.test.ts),
// so sharing one instance across tests would leak state between them.

import {
  EntityForm,
  StringField,
  NumberField,
  BooleanField,
  SelectField,
  DateField,
  DatetimeField,
  EmailField,
  PhoneNumberField,
  ManyToOneField,
  RequiredValidation,
  TableSubCollectionField,
  excludeSelfOnManyToOneLookup,
  type TabInfo,
} from './harness';

// ============================================================================
// Department — tree structure. ManyToOne self-reference (parentDepartment)
// demonstrates the tree-view / self-ref M2O relation (C3: 관계 3종 중 1종).
// ============================================================================

export function createDepartmentForm(): EntityForm {
  const form = new EntityForm('department', '/api/department');

  form.addFields({
    items: [
      new StringField('name', 1)
        .withLabel('부서명')
        .withRequired(true)
        .withValidations(new RequiredValidation('department-name-required')),
      // Self-ref M2O: parentDepartment points back at this same form. Real
      // deployments would render this as a tree picker (ManyToOneConfig.tree);
      // the fixture keeps the config minimal (no fetch/treeData wiring) since
      // the characterization tests exercise field construction + rendering
      // contracts, not a live tree widget.
      new ManyToOneField('parentDepartment', 2, {
        entityForm: form,
        filter: [excludeSelfOnManyToOneLookup()],
      }).withLabel('상위 부서'),
    ],
  });

  return form;
}

// ============================================================================
// Employee — field-diversity sample: string/number/date/datetime/select/
// boolean/email/phone + ManyToOne(department) + a validation (C5).
// ============================================================================

export function createEmployeeForm(
  departmentForm: EntityForm = createDepartmentForm(),
): EntityForm {
  const form = new EntityForm('employee', '/api/employee');

  form.addFields({
    items: [
      new StringField('name', 1)
        .withLabel('이름')
        .withRequired(true)
        .withValidations(new RequiredValidation('employee-name-required')),
      // EmailField carries an EmailValidation by default (see EmailField.tsx
      // constructor) — no need to attach one explicitly here.
      new EmailField('email', 2).withLabel('이메일'),
      new PhoneNumberField('phone', 3).withLabel('전화번호'),
      new NumberField('salary', 4).withLabel('연봉').withMin(0),
      new DateField('hireDate', 5).withLabel('입사일'),
      new DatetimeField('lastLoginAt', 6).withLabel('최근 로그인'),
      new SelectField('status', 7, [
        { value: 'ACTIVE', label: '재직중' },
        { value: 'ON_LEAVE', label: '휴직' },
        { value: 'RESIGNED', label: '퇴직' },
      ]).withLabel('재직 상태'),
      new BooleanField('remoteEligible', 8).withLabel('재택근무 가능'),
      new ManyToOneField('department', 9, { entityForm: departmentForm }).withLabel('부서'),
    ],
  });

  return form;
}

// ============================================================================
// Project — subcollection tabs: an inline "tasks" TableSubCollectionField
// (O2M) rendered on its own tab (C6: 탭/필드그룹/서브컬렉션).
// ============================================================================

const TASKS_TAB: TabInfo = { id: 'tasks', label: '작업', order: 10 };

function createProjectTaskChildForm(): EntityForm {
  const form = new EntityForm('projectTask', '/api/project-task');

  form.addFields({
    items: [
      new StringField('title', 1)
        .withLabel('제목')
        .withRequired(true)
        .withValidations(new RequiredValidation('task-title-required')),
      new BooleanField('done', 2).withLabel('완료'),
    ],
  });

  return form;
}

export function createProjectForm(): EntityForm {
  const form = new EntityForm('project', '/api/project');

  form.addFields({
    items: [
      new StringField('name', 1)
        .withLabel('프로젝트명')
        .withRequired(true)
        .withValidations(new RequiredValidation('project-name-required')),
      new DateField('dueDate', 2).withLabel('마감일'),
    ],
  });

  // Inline O2M subcollection: the child template form's tasks are related
  // back to this project via the child's `project` ManyToOne field name.
  const tasksField = new TableSubCollectionField({
    entityForm: createProjectTaskChildForm(),
    relation: { mappedBy: 'project' },
    order: 1,
    name: 'tasks',
  });

  form.addFields({ tab: TASKS_TAB, items: [tasksField] });

  return form;
}
