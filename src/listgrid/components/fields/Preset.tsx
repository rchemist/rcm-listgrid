import { FormField } from './abstract';
import { StringField } from './StringField';
import { TextareaField } from './TextareaField';
import { BooleanField } from './BooleanField';
import { NumberField } from './NumberField';
import { DatetimeField } from './DatetimeField';
import { MarkdownField } from './MarkdownField';
import { RevisionField } from '../revision/RevisionField';
import {
  ADD_ONLY,
  checkDuplicateValueProcess,
  MODIFY_ONLY,
  STATUS_TAB_INFO,
  VIEW_HIDDEN,
} from '../../config/Config';
import { RegexValidation } from '../../validations/RegexValidation';
import { RegexAlias, RegexUrlBody } from '../../misc';
import { EntityForm } from '../../config/EntityForm';
import { AddFieldItemProps } from '../../config/EntityFormTypes';
import { SelectOption } from '../../form/Type';
import { SelectField } from './SelectField';
import { ReactNode } from 'react';
import { isTrue } from '../../utils/BooleanUtil';

/*

*/

export const SeoMetadataFields: FormField<any>[] = [
  new StringField('metaTitle', 1100)
    .withLabel('Title')
    .withHelpText('Front 서비스에서 Html meta.title 태그 에 삽입됩니다.'),
  new TextareaField('metaDescription', 1200)
    .withLabel('Description')
    .withHelpText('Front 서비스에서 Html meta.description 태그 에 삽입됩니다.')
    .withLimit({ max: 500 }),
  new TextareaField('metaHeader', 1300)
    .withLabel('Meta')
    .withHelpText('Front 서비스에서 Html meta 태그의 content 에 삽입될 값을 입력합니다.'),
];

export interface CommonFieldProps {
  label?: string;
  order?: number;
  name?: string;
}

export const AliasField = (props: CheckDuplicatedFieldProps) => {
  const label = props.label ?? '시스템 ID';
  const order = props.order ?? 10;
  const name = props.name ?? 'alias';

  return new StringField(name, order)
    .withLabel(`${label}`)
    .withHelpText('시스템에서 사용하는 ID 입니다. 영문 소문자와 숫자, _만 입력할 수 있습니다.')
    .withRequired(true)
    .withCheckButtonValidation(
      checkDuplicateValueProcess({ url: props.fetchUrl, fieldName: 'alias', label: `${label}` }),
    )
    .withValidations(
      new RegexValidation(
        'regex-alias',
        RegexAlias,
        '영문 소문자와 숫자, _를 사용해 최소 3자리 이상 입력해야 합니다.',
      ),
    )
    .withViewPreset(ADD_ONLY)
    .useListField();
};

export const ExternalIdField = (props: ExternalIdFieldProps) => {
  const label = props.label ?? '외부 시스템 ID';
  const order = props.order ?? 200;

  return new StringField('externalId', order)
    .withLabel(`${label}`)
    .withHidden(true) // 외부 시스템 키는 기본 히든 처리한다.
    .withHelpText(
      '외부 시스템과 연동할 때 사용하는 외부 시스템의 ID 입니다. 영문 소문자와 숫자만 입력할 수 있습니다.',
    )
    .withCheckButtonValidation(
      checkDuplicateValueProcess({
        url: props.fetchUrl,
        fieldName: 'externalId',
        label: `${label}`,
      }),
    );
};

export const NameField = (props?: CommonFieldProps) => {
  const label = props?.label ?? '이름';
  const order = props?.order ?? 100;
  const name = props?.name ?? 'name';
  return new StringField(name, order)
    .withLabel(`${label}`)
    .withRequired(true)
    .withReadOnly(false)
    .useListField();
};

export const LabelField = (props?: CommonFieldProps) => {
  const label = props?.label ?? 'Label';
  const order = props?.order ?? 110;
  const name = props?.name ?? 'label';

  return new StringField(name, order)
    .withLabel(`${label}`)
    .withHelpText(
      'Front 서비스에 표시할 때 이름 대신 사용할 수 있습니다. 이 값을 입력하지 않으면 `이름` 값을 그대로 사용합니다.',
    )
    .useListField();
};

export const DescriptionField = (props?: CommonFieldProps) => {
  const label = props?.label ?? '설명';
  const order = props?.order ?? 200;
  const name = props?.name ?? 'description';
  return new MarkdownField(name, order)
    .withLabel(`${label}`)
    .withRequired(false)
    .withHelpText(`관리자도구에서 이 데이터를 식별하기 위한 설명입니다.`)
    .withReadOnly(false);
};

export const TitleField = (props?: CommonFieldProps) => {
  const label = props?.label ?? '제목';
  const order = props?.order ?? 100;
  const name = props?.name ?? 'title';

  return new StringField(name, order)
    .withLabel(`${label}`)
    .withRequired(true)
    .useListField()
    .withReadOnly(false);
};

export const ContentField = (props?: CommonFieldProps) => {
  const label = props?.label ?? '내용';
  const order = props?.order ?? 200;
  const name = props?.name ?? 'content';

  return new MarkdownField(name, order)
    .withLabel(`${label}`)
    .withRequired(true)
    .withReadOnly(false);
};

interface CheckDuplicatedFieldProps extends CommonFieldProps {
  fetchUrl: string;
  entity: string; // article
  entityName: string; // 게시물
}

interface ExternalIdFieldProps extends CommonFieldProps {
  fetchUrl: string;
}

export const SlugField = (props: CheckDuplicatedFieldProps) => {
  const label = props?.label ?? 'Slug';
  const order = props?.order ?? 300;
  const name = props?.name ?? 'slug';

  return new StringField('slug', order)
    .withLabel(`${label}`)
    .withHelpText({
      onUpdate: `Front 서비스에서 이 ${props.entityName} 데이터를 제공할 URL 을 /${props.entity}/{Slug} 로 지정할 수 있습니다. 한글,영문,숫자,-만 입력 가능합니다.`,
    })
    .withRequired(true)
    .withCheckButtonValidation(
      checkDuplicateValueProcess({ url: props.fetchUrl, fieldName: 'slug', label: `${label}` }),
    )
    .withValidations(
      new RegexValidation(
        'role-slug',
        RegexUrlBody,
        '영문,숫자,한글,-로 2~100자 이내로 입력할 수 있습니다.',
      ),
    )
    .useListField();
};

interface AvailableDatetimeFieldProps extends CommonFieldProps {
  fieldName?: { availableAt: string; availableUntil: string };
  fieldLabel?: { availableAt: string; availableUntil: string };
}

export const AvailableDatetimeFields = (
  target: string,
  props?: AvailableDatetimeFieldProps,
): DatetimeField[] => {
  const label = props?.label ?? '유효기간';
  const availableAtLabel = props?.fieldLabel?.availableAt ?? `${label} 시작일`;
  const availableUntilLabel = props?.fieldLabel?.availableUntil ?? `${label} 종료일`;
  const availableAtOrder = props?.order ?? 300;
  const availableUntilOrder = availableAtOrder + 10;
  const availableAtName = props?.fieldName?.availableAt ?? 'availableAt';
  const availableUntilName = props?.fieldName?.availableUntil ?? 'availableUntil';

  return [
    new DatetimeField(availableAtName, availableAtOrder)
      .withLabel(`${availableAtLabel}`)
      .withListConfig({
        support: true,
        sortable: true,
        filterable: true,
        viewRaw: true,
        order: availableAtOrder,
      })
      .withHelpText(
        `이 ${target} ${label}의 시작일을 설정합니다. 시작일을 설정하지 않으면 현재 시점부터 사용 가능합니다. 시작일 ~ 종료일 사이에 있지 않은 경우 Front 사이트에서 이 ${target} 데이터에 접근할 수 없습니다.`,
      ),

    new DatetimeField(availableUntilName, availableUntilOrder)
      .withLabel(`${availableUntilLabel}`)
      .withListConfig({
        support: true,
        sortable: true,
        filterable: true,
        viewRaw: true,
        order: availableUntilOrder,
      })
      .withHelpText(
        `이 ${target} ${label}의 종료일을 설정합니다. 종료일을 설정하지 않으면 시작일 이후부터 계속 사용할 수 있습니다.`,
      ),
  ];
};

export const StatusDateAndRevisionPreset = (
  useUpdatedAt: boolean = true,
  useRevision: boolean = true,
): AddFieldItemProps => {
  const items: FormField<any>[] = [
    new DatetimeField('createdAt', 100000)
      .withLabel('등록일')
      .withViewPreset(MODIFY_ONLY)
      .withReadOnly(true)
      .useListField(),
  ];

  if (useUpdatedAt) {
    items.push(
      new DatetimeField('updatedAt', 100100)
        .withLabel('수정일')
        .withViewPreset(MODIFY_ONLY)
        .withReadOnly(true),
    );
  }

  if (useRevision) {
    items.push(
      new RevisionField('entityForm-revision', 100200)
        .withLabel('변경 내역')
        .withViewPreset(MODIFY_ONLY)
        .withReadOnly(true),
    );
  }

  return {
    tab: STATUS_TAB_INFO,
    items: items,
  };
};

export const StatusCreatedAtFieldPreset: AddFieldItemProps = StatusDateAndRevisionPreset(
  false,
  true,
);

export const StatusCreatedAndUpdatedAtFieldPreset: AddFieldItemProps = StatusDateAndRevisionPreset(
  true,
  true,
);

export const XrefAtFieldPreset: AddFieldItemProps = {
  tab: STATUS_TAB_INFO,
  items: [
    new DatetimeField('xrefAt', 110000)
      .withLabel('지정일')
      .withViewPreset(VIEW_HIDDEN)
      .withReadOnly(true)
      .useListField(),
  ],
};

export const DeviceTypes: SelectOption[] = [
  { label: '웹', value: 'PC' },
  { label: '모바일', value: 'MOBILE' },
  { label: '앱', value: 'MOBILE_APP' },
  { label: '기타', value: 'UNDEFINED' },
];

export const DeviceTypeField = (props?: CommonFieldProps) => {
  const label = props?.label ?? '가입 채널';
  const order = props?.order ?? 600;

  return new SelectField('deviceType', order, [...DeviceTypes])
    .withLabel(label)
    .withRequired(false)
    .withViewPreset(MODIFY_ONLY)
    .withReadOnly(true)
    .useListField();
};

export const HiddenField = (props?: CommonFieldProps) => {
  const label = props?.label ?? '숨김 여부';
  const order = props?.order ?? 700;

  return new BooleanField('hidden', order).withLabel(label).withRequired(false).withReadOnly(false);
};

export const PriorityField = (props?: CommonFieldProps) => {
  const label = props?.label ?? '우선순위';
  const order = props?.order ?? 800;

  return new NumberField('priority', order)
    .withLabel(label)
    .withRequired(false)
    .withReadOnly(false)
    .useListField();
};

interface ActiveFieldProps extends CommonFieldProps {
  defaultValue?: boolean;
}

export const ActiveField = (props?: ActiveFieldProps) => {
  const label = props?.label ?? '사용 여부';
  const order = props?.order ?? 900;
  const value = isTrue(props?.defaultValue);

  return new BooleanField('active', order)
    .withLabel(label)
    .withRequired(true)
    .withDefaultValue(value)
    .withHelpText('이 값을 `아니오`로 설정하면 사용할 수 없습니다.')
    .withReadOnly(false)
    .useListField({ order: 10000000000 });
};

export const MarketingField = (props?: CommonFieldProps) => {
  const messageOrder = props?.order !== undefined ? props.order + 10 : 100;

  const linkOrder = props?.order !== undefined ? props.order + 20 : 110;

  return [
    new TextareaField('marketingMessage', messageOrder)
      .withLabel('마케팅 메시지')
      .withRequired(false)
      .withReadOnly(false)
      .withHelpText('이 오퍼가 적용될 때 주문서에 표시되는 메시지 입니다.'),
    new StringField('marketingLink', linkOrder)
      .withLabel('마케팅 링크')
      .withRequired(false)
      .withHelpText(
        '주문서에 표시되는 메시지에 링크를 연결할 수 있습니다. 마케팅 메시지를 입력하지 않으면 적용되지 않습니다.',
      )
      .withReadOnly(false),
  ];
};

export const TooltipDiv = (props: { children: ReactNode | ReactNode[] }) => {
  return <div className={'max-w-[300px] break-words whitespace-normal'}>{props.children}</div>;
};

export const PublishStatusTypes: SelectOption[] = [
  { label: '등록', value: 'PUBLISHED' },
  { label: '임시 저장', value: 'DRAFT' },
];

export const DraftPublishStatusTypes: SelectOption[] = [
  { label: '임시 저장', value: 'DRAFT' },
  { label: '등록', value: 'PUBLISHED' },
];

export const PublishedPublishStatusTypes: SelectOption[] = [
  { label: '등록', value: 'PUBLISHED' },
  { label: '폐기', value: 'DISCARDED' },
];

export const DiscardedPublishStatusTypes: SelectOption[] = [{ label: '폐기', value: 'DISCARDED' }];

export const PublishStatusFieldPreset: AddFieldItemProps = {
  tab: STATUS_TAB_INFO,
  items: [
    new SelectField('publishStatus', 100000, PublishStatusTypes)
      .withLabel('게시 상태')
      .withHelpText(
        '게시 상태를 선택합니다. 게시 상태를 `등록`으로 선택한 후에는 주요 정보를 변경할 수 없으니 주의하세요.',
      )
      .withRequired(true)
      .withModifyOnly()
      .useListField()
      .withDefaultValue('DRAFT'),
  ],
};

export function applyPublishStatusEntityForm(
  entityForm: EntityForm,
  ...readonlyOnPublishedFields: string[]
): EntityForm {
  entityForm.addFields(PublishStatusFieldPreset);

  entityForm.withOnInitialize(async (entityForm) => {
    if (entityForm.getRenderType() === 'update') {
      const publishStatus = entityForm.getField('publishStatus');
      const publishStatusValue = await entityForm.getValue('publishStatus');
      if (publishStatus && publishStatus instanceof SelectField) {
        if (publishStatusValue === 'PUBLISHED') {
          publishStatus
            .withOptions(PublishedPublishStatusTypes)
            .withHelpText(
              '현재 사용중인 상태 입니다. 게시 상태를 `폐기`로 변경하면 더 이상 사용할 수 없습니다.',
            );

          if (readonlyOnPublishedFields.length > 0) {
            for (const field of readonlyOnPublishedFields) {
              entityForm.getField(field)?.withReadOnly(true);
            }
          }
        } else if (publishStatusValue === 'DRAFT') {
          publishStatus
            .withOptions(DraftPublishStatusTypes)
            .withHelpText(
              '게시 상태를 선택합니다. 게시 상태를 `등록`으로 선택한 후에는 주요 정보를 변경할 수 없으니 주의하세요.',
            );
        } else if (publishStatusValue === 'DISCARDED') {
          publishStatus
            .withOptions(DiscardedPublishStatusTypes)
            .withHelpText('게시 상태를 변경할 수 없습니다.');
          entityForm.setReadOnly();
        }
        entityForm.fields.set('publishStatus', publishStatus);
      }
      return entityForm.withShouldReload(true);
    }
    return entityForm;
  });

  return entityForm;
}
