[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CustomFieldRendererProps

# Interface: CustomFieldRendererProps

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:44](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L44)

커스텀 필드 렌더러에 전달되는 Props

## Example

```tsx
const MyCardRenderer: React.FC<CustomFieldRendererProps> = ({
  field,
  entityForm,
  value,
  onChange,
  required,
  readonly,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(item => (
        <Card
          key={item.id}
          selected={value?.id === item.id}
          onClick={() => onChange(item)}
        />
      ))}
    </div>
  );
};
```

## Extended by

- [`CardManyToOneViewProps`](CardManyToOneViewProps.md)

## Properties

### field

> **field**: [`FormField`](../classes/FormField.md)\<`any`\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:46](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L46)

렌더링할 필드 인스턴스

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:48](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L48)

EntityForm 인스턴스

***

### setEntityForm?

> `optional` **setEntityForm?**: `Dispatch`\<`SetStateAction`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\> \| `undefined`\>\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:50](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L50)

EntityForm setter

***

### value

> **value**: `any`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:52](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L52)

현재 필드 값

***

### onChange

> **onChange**: (`value`, `propagation?`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:54](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L54)

값 변경 핸들러

#### Parameters

##### value

`any`

##### propagation?

`boolean`

#### Returns

`void`

***

### onError

> **onError**: (`message`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:56](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L56)

에러 발생 핸들러

#### Parameters

##### message

`string`

#### Returns

`void`

***

### clearError

> **clearError**: () => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:58](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L58)

에러 초기화 핸들러

#### Returns

`void`

***

### required

> **required**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:60](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L60)

필수 여부

***

### readonly

> **readonly**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:62](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L62)

읽기 전용 여부

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:64](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L64)

세션 정보

***

### helpText?

> `optional` **helpText?**: `ReactNode`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:66](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L66)

도움말 텍스트

***

### placeholder?

> `optional` **placeholder?**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:68](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L68)

플레이스홀더

***

### subCollectionEntity?

> `optional` **subCollectionEntity?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:70](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L70)

서브콜렉션 엔티티 여부

***

### resetEntityForm?

> `optional` **resetEntityForm?**: (`delay?`, `preserveState?`) => `Promise`\<`void`\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:72](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L72)

EntityForm 리셋 함수

#### Parameters

##### delay?

`number`

##### preserveState?

`boolean`

#### Returns

`Promise`\<`void`\>
