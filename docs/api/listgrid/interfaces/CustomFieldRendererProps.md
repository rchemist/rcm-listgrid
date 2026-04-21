[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / CustomFieldRendererProps

# Interface: CustomFieldRendererProps

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:37](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L37)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:39](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L39)

렌더링할 필드 인스턴스

***

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L41)

EntityForm 인스턴스

***

### setEntityForm?

> `optional` **setEntityForm?**: `Dispatch`\<`SetStateAction`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\> \| `undefined`\>\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:43](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L43)

EntityForm setter

***

### value

> **value**: `any`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:45](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L45)

현재 필드 값

***

### onChange

> **onChange**: (`value`, `propagation?`) => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:47](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L47)

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

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:49](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L49)

에러 발생 핸들러

#### Parameters

##### message

`string`

#### Returns

`void`

***

### clearError

> **clearError**: () => `void`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L51)

에러 초기화 핸들러

#### Returns

`void`

***

### required

> **required**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:53](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L53)

필수 여부

***

### readonly

> **readonly**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:55](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L55)

읽기 전용 여부

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:57](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L57)

세션 정보

***

### helpText?

> `optional` **helpText?**: `ReactNode`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:59](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L59)

도움말 텍스트

***

### placeholder?

> `optional` **placeholder?**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L61)

플레이스홀더

***

### subCollectionEntity?

> `optional` **subCollectionEntity?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:63](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L63)

서브콜렉션 엔티티 여부

***

### resetEntityForm?

> `optional` **resetEntityForm?**: (`delay?`, `preserveState?`) => `Promise`\<`void`\>

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:65](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L65)

EntityForm 리셋 함수

#### Parameters

##### delay?

`number`

##### preserveState?

`boolean`

#### Returns

`Promise`\<`void`\>
