[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewEntityFormProps

# Interface: ViewEntityFormProps

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:16](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L16)

Props for ViewEntityForm component.
ViewEntityForm 컴포넌트에 전달되는 모든 속성 정의

## Properties

### entityForm

> **entityForm**: [`EntityForm`](../classes/EntityForm.md)

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:21](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L21)

EntityForm instance to be managed and rendered.
관리 및 렌더링할 EntityForm 인스턴스

***

### buttons?

> `optional` **buttons?**: [`EntityFormButton`](../classes/EntityFormButton.md)[]

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:26](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L26)

Custom buttons to be added to the form.
폼에 추가할 커스텀 버튼 배열

***

### excludeButtons?

> `optional` **excludeButtons?**: `string`[]

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:31](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L31)

Types of buttons to exclude (e.g., 'save', 'list', 'delete').
제외할 버튼 타입 (예: 'save', 'list', 'delete')

***

### title?

> `optional` **title?**: `string`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:36](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L36)

Custom title for the form.
폼의 커스텀 제목

***

### hideTitle?

> `optional` **hideTitle?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:41](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L41)

Whether to hide the title area.
제목 영역 숨김 여부

***

### postSave?

> `optional` **postSave?**: (`entityForm`) => `Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:46](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L46)

Callback after saving the entity form.
저장 후 호출되는 콜백 (비동기)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

***

### postDelete?

> `optional` **postDelete?**: (`entityForm`) => `Promise`\<`void`\>

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:51](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L51)

Callback after deleting the entity form.
삭제 후 호출되는 콜백 (비동기)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>

***

### buttonLinks?

> `optional` **buttonLinks?**: [`EntityButtonLinkProps`](../type-aliases/EntityButtonLinkProps.md)

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L56)

Button link handlers for navigation.
버튼 클릭 시 라우팅 등 링크 핸들러

***

### subCollection?

> `optional` **subCollection?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:61](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L61)

Whether this is a sub-collection entity form (e.g., modal).
서브 콜렉션(모달 등) 여부

***

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:66](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L66)

Readonly mode flag.
읽기 전용 모드 여부

***

### apiSpec?

> `optional` **apiSpec?**: `ReactNode` \| [`ApiSpecification`](ApiSpecification.md)

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:71](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L71)

API specification or custom ReactNode for API docs.
API 명세 또는 커스텀 ReactNode

***

### session?

> `optional` **session?**: [`Session`](Session.md)

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:76](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L76)

Session info (optional, overrides default session).
세션 정보 (선택, 기본 세션을 덮어씀)

***

### onInitialize?

> `optional` **onInitialize?**: (`entityForm`) => `Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:81](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L81)

Callback after initializing the entity form.
EntityForm 초기화 후 호출되는 콜백 (비동기)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<[`EntityForm`](../classes/EntityForm.md)\<`any`\>\>

***

### onLoad?

> `optional` **onLoad?**: (`entityForm`) => `Promise`\<`void`\>

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:86](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L86)

Callback after the component is fully rendered and loaded.
컴포넌트가 완전히 렌더링되고 로드된 후 호출되는 콜백 (비동기)

#### Parameters

##### entityForm

[`EntityForm`](../classes/EntityForm.md)

#### Returns

`Promise`\<`void`\>

***

### popupMode?

> `optional` **popupMode?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:91](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L91)

Popup mode flag for new window display.
새창(팝업) 모드 여부 - true일 때 목록 버튼 대신 닫기 버튼 표시

***

### buttonPosition?

> `optional` **buttonPosition?**: `"header"` \| `"bottom"`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:98](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L98)

Position of the action buttons.
버튼 위치 설정
- 'header': 상단 헤더 영역 (기본값)
- 'bottom': 폼 하단 영역

***

### autoSave?

> `optional` **autoSave?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:105](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L105)

Enable auto-save to sessionStorage.
sessionStorage 자동 저장 활성화 (새로고침 시 입력값 유지)
- true: 자동 저장 활성화
- false: 자동 저장 비활성화 (기본값)

***

### autoSaveKey?

> `optional` **autoSaveKey?**: `string`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:112](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L112)

Custom key for auto-save storage.
자동 저장 스토리지 키 (동일 엔티티 다른 컨텍스트 구분용)
- 미지정 시: entityName + id 조합으로 자동 생성
- 지정 시: entityName + id + autoSaveKey 조합

***

### inlineMode?

> `optional` **inlineMode?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:119](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L119)

Inline mode flag for SubCollection inline expansion.
SubCollection 인라인 확장 모드 여부
- true: 패널 배경/테두리 없이 인라인으로 표시
- false: 일반 패널 스타일 적용 (기본값)

***

### hideMappedByFields?

> `optional` **hideMappedByFields?**: `string`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:126](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L126)

MappedBy field name to hide related fields in SubCollection.
SubCollection에서 부모 참조 필드 자동 숨김을 위한 mappedBy 필드명
- 예: 'studentId' 지정 시 'studentId', 'student', 'student.name' 등 자동 숨김
- 빈 문자열이나 undefined일 경우 모든 필드 표시

***

### hideAllButtons?

> `optional` **hideAllButtons?**: `boolean`

Defined in: [listgrid/components/form/types/ViewEntityForm.types.ts:133](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/form/types/ViewEntityForm.types.ts#L133)

Hide all buttons including custom buttons.
모든 버튼 숨김 (커스텀 버튼 포함)
- true: 모든 버튼 숨김 (리비전 모드 등에서 사용)
- false: 버튼 정상 표시 (기본값)
