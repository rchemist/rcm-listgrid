import {
  BooleanField,
  DateField,
  EmailField,
  EntityForm,
  MinMaxNumberValidation,
  NumberField,
  PhoneNumberField,
  RegexValidation,
  SelectField,
  StringField,
} from '@listgrid/schema-core';

// Subject (과목) — a validation-rich form exercising the V1 capabilities the
// GJCU catalog leans on (charter C4/C5): the declared-validation model
// (Regex/MinMax/Email), Number/Select/Date field types, and a CROSS-FIELD
// conditional (onlineUrl shows + is required only for the ONLINE category —
// charter C2, resolved via dependsOn/D4 cascade).
export const subjectFetchUrl = '/subject';

export function SubjectEntityForm(): EntityForm {
  return new EntityForm('SubjectEntityForm', subjectFetchUrl).withTitle('과목').addFields({
    items: [
      new StringField('name', 100).withRequired(true).withLabel('과목명'),
      new StringField('code', 110)
        .withRequired(true)
        .withLabel('과목코드')
        .withValidations(
          new RegexValidation(
            'code-format',
            /^[A-Z]{2,4}\d{3,4}$/,
            '과목코드 형식이 올바르지 않습니다 (예: CS201)',
          ),
        ),
      new NumberField('credits', 120)
        .withLabel('학점')
        .withValidations(
          new MinMaxNumberValidation(
            'credits-range',
            { min: 1, max: 6 },
            '학점은 1~6 사이여야 합니다',
          ),
        ),
      new EmailField('contactEmail', 130).withLabel('담당자 이메일'),
      new PhoneNumberField('contactPhone', 135).withLabel('담당자 연락처'),
      new SelectField('category', 140, [
        { value: 'MAJOR', label: '전공' },
        { value: 'GENERAL', label: '교양' },
        { value: 'ONLINE', label: '온라인' },
      ])
        .withLabel('구분')
        .withDefaultValue('MAJOR'),
      // cross-field conditional: only shown + required when category === ONLINE.
      new StringField('onlineUrl', 150)
        .withLabel('온라인 강의 URL')
        .withHidden(async (ctx) => ctx.values?.['category'] !== 'ONLINE')
        .withRequired(async (ctx) => ctx.values?.['category'] === 'ONLINE')
        .withDependsOn('category'),
      new DateField('startDate', 160).withLabel('개강일'),
      new BooleanField('active', 900).withLabel('사용여부').withDefaultValue(true),
    ],
  });
}
