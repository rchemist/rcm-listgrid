import { EntityForm } from '../../config/EntityForm';
import { AbstractAddFieldProps } from '../../config/EntityFormTypes';
import { AddressMapField, appendLastDot } from './address/AddressMapField';
import { NumberField } from './NumberField';
import { FormField, IListConfig } from './abstract';
import { isTrue } from '../../utils/BooleanUtil';
import { StringField } from './StringField';
import { RequiredValidation } from '../../validations/RequiredValidation';
import { isBlank } from '../../utils/StringUtil';

type AddressFieldType =
  | 'state'
  | 'city'
  | 'address1'
  | 'address2'
  | 'postalCode'
  | 'longitude'
  | 'latitude';
const AddressFieldTypes: AddressFieldType[] = [
  'state',
  'city',
  'address1',
  'address2',
  'postalCode',
  'longitude',
  'latitude',
];

// 각 필드의 label, helpText 등 메시지를 지정할 수 있다.
interface AddressFieldMessage {
  address?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  longitude?: string;
  latitude?: string;
}

// 목록에 표시할 필드를 정의하는 부분으로 address 필드는 아예 선택지에 없다.
interface AddressListFields {
  state?: boolean;
  city?: boolean;
  address1?: boolean;
  address2?: boolean;
  postalCode?: boolean;
  longitude?: boolean;
  latitude?: boolean;
}

interface AddressListOrder {
  address?: number;
  state?: number;
  city?: number;
  address1?: number;
  address2?: number;
  postalCode?: number;
  longitude?: number;
  latitude?: number;
}

interface FullAddressFieldsProps extends AbstractAddFieldProps {
  // 주소 입력시 지도를 표시할 것인지 여부
  showMap?: boolean;
  // 보여 주고 싶은 필드만 표시. 지정하지 않으면 모든 필드를 보여 준다.
  fields?: AddressFieldType[];
  // 주소 입력을 필수값으로 할 것인지 여부
  required?: boolean;
  // 각 필드의 helpText 정의
  helpText?: AddressFieldMessage;
  // 각 필드의 라벨을 오버라이드
  label?: AddressFieldMessage;
  // 필드를 리스트에 포함할 것인지
  list?: AddressListFields;
  // 각 필드의 표시 순서
  order?: AddressListOrder;
  // 위경도 표시 여부
  showLongitudeLatitude?: boolean;
  // 각 필드에 prefix 추가. 예) 'user' 를 입력하면 user.state, user.city, user.address1, user.address2, user.postalCode 등이 된다. 만약 prefix 가 '.'으로 끝나면 .을 제거한다.
  prefix?: string;
}

function getListConfig(): IListConfig {
  return {
    support: true,
    filterable: true,
    sortable: true,
  };
}

export const applyFullAddressFields = (entityForm: EntityForm, props?: FullAddressFieldsProps) => {
  const addressMapFieldName = `${appendLastDot(props?.prefix)}address`;

  const fields = props?.fields ?? [...AddressFieldTypes];

  const required = isTrue(props?.required);

  const showLongitudeLatitude = isTrue(props?.showLongitudeLatitude);

  function getRequiredValidation(field: AddressFieldType): RequiredValidation | undefined {
    if (required && fields.includes(field)) {
      // required 로 체크하려면 필드가 포함되어 있어야 한다.
      return new RequiredValidation(
        `${field}-required-validation`,
        `주소 찾기 버튼을 눌러 주소를 입력하세요`,
      );
    }
    return undefined;
  }

  const AddressField = (fieldProps: {
    type?: 'number' | 'string' | undefined;
    name: AddressFieldType;
    order: number;
    label: string;
    prefix?: string | undefined;
  }): FormField<any> => {
    const type = fieldProps.type ?? 'string';
    const order = props?.order?.[fieldProps.name] ?? fieldProps.order;
    const name = fieldProps.prefix
      ? `${appendLastDot(fieldProps.prefix)}${fieldProps.name}`
      : fieldProps.name;
    const label = props?.label?.[fieldProps.name] ?? fieldProps.label;
    const helpText = props?.helpText?.[fieldProps.name];
    const supportList = isTrue(props?.list?.[fieldProps.name]);
    const validation = getRequiredValidation(fieldProps.name);
    const hidden = !fields.includes(fieldProps.name);
    const listConfig = supportList ? getListConfig() : undefined;
    const isFieldRequired = required && fields.includes(fieldProps.name);

    if (type === 'number') {
      return new NumberField(name, order)
        .withLabel(label)
        .withHelpText(helpText)
        .withReadOnly(true)
        .withHidden(hidden)
        .withRequired(isFieldRequired)
        .withValidations(validation)
        .withListConfig(listConfig);
    } else {
      return new StringField(name, order)
        .withLabel(label)
        .withHelpText(helpText)
        .withReadOnly(true)
        .withHidden(hidden)
        .withRequired(isFieldRequired)
        .withValidations(validation)
        .withListConfig(listConfig);
    }
  };

  entityForm.addFields({
    ...(props?.tab !== undefined ? { tab: props.tab } : {}),
    ...(props?.fieldGroup !== undefined ? { fieldGroup: props.fieldGroup } : {}),
    items: [
      new AddressMapField(
        `${addressMapFieldName}`,
        props?.order?.address ?? 1000,
        props?.showMap,
        props?.prefix,
      )
        .withLabel(props?.label?.address ?? '주소')
        .withHelpText(props?.helpText?.address)
        .withRequired(required),
      ...(showLongitudeLatitude
        ? [
            AddressField({
              name: 'longitude',
              order: 1010,
              type: 'number',
              label: '경도',
              prefix: props?.prefix,
            }),
            AddressField({
              name: 'latitude',
              order: 1010,
              type: 'number',
              label: '위도',
              prefix: props?.prefix,
            }),
          ]
        : []),
      AddressField({
        name: 'state',
        order: 1010,
        type: 'string',
        label: '시/도',
        prefix: props?.prefix,
      }),
      AddressField({
        name: 'city',
        order: 1010,
        type: 'string',
        label: '시/군/구',
        prefix: props?.prefix,
      }),
      AddressField({
        name: 'address1',
        order: 1010,
        type: 'string',
        label: '주소1',
        prefix: props?.prefix,
      }),
      AddressField({
        name: 'address2',
        order: 1010,
        type: 'string',
        label: '상세 주소',
        prefix: props?.prefix,
      }),
      AddressField({
        name: 'postalCode',
        order: 1010,
        type: 'string',
        label: '우편번호',
        prefix: props?.prefix,
      }),
    ],
  });

  entityForm.withOnChanges(async (entityForm, name) => {
    const prefix = appendLastDot(props?.prefix);

    if (name === `${prefix}address`) {
      const address = await entityForm.getValue(`${prefix}address`);

      if (address) {
        entityForm.setValue(`${prefix}state`, address.state);
        entityForm.setValue(`${prefix}city`, address.city);
        entityForm.setValue(`${prefix}address1`, address.address1);
        entityForm.setValue(`${prefix}address2`, address.address2);
        entityForm.setValue(`${prefix}postalCode`, address.postalCode);
        if (showLongitudeLatitude) {
          entityForm.setValue(`${prefix}longitude`, address.longitude);
          entityForm.setValue(`${prefix}latitude`, address.latitude);
        }
        entityForm.withShouldReload(true);
      }
    }

    return entityForm;
  });

  entityForm.withOnFetchData(async (entityForm: EntityForm, response: any) => {
    const prefix = appendLastDot(props?.prefix);

    // 주소 정보를 address 밑에 저장한다.
    const addressValue = {
      state: response[`${prefix}state`],
      city: response[`${prefix}city`],
      address1: response[`${prefix}address1`],
      address2: response[`${prefix}address2`],
      postalCode: response[`${prefix}postalCode`],
    };

    entityForm.setFetchedValue(addressMapFieldName, addressValue);

    // IMPORTANT:
    // - setFetchedValue only sets current when current is undefined.
    // - Some forms/pages can initialize current as empty, which makes required validation fail
    //   even though fetched data exists.
    // Here we force current address map value when fetched address fields exist.
    const currentAddress = (await entityForm.getValue(addressMapFieldName)) as
      | { address1?: unknown }
      | undefined
      | null;
    const shouldForceCurrent =
      !currentAddress ||
      typeof currentAddress !== 'object' ||
      (!isBlank(String(addressValue.address1 ?? '')) &&
        isBlank(String(currentAddress.address1 ?? '')));
    if (shouldForceCurrent) {
      entityForm.setValue(addressMapFieldName, addressValue);
    }

    return entityForm;
  });
};
