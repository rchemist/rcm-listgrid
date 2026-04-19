[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewEntityFormClassNames

# Interface: ViewEntityFormClassNames

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:101](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L101)

ViewEntityForm 컴포넌트 테마 타입 정의

이 타입을 사용하여 EntityForm의 모든 스타일 요소를 커스터마이징할 수 있습니다.
모노리포 환경에서 사이트별로 다른 디자인을 적용할 때 사용합니다.

## Example

```tsx
const myTheme: ViewEntityFormClassNames = {
  header: {
    container: 'mt-2 bg-blue-50',
  },
  title: {
    text: 'text-2xl text-blue-800',
  },
};
```

## Properties

### root?

> `optional` **root?**: `string`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:105](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L105)

최상위 컨테이너 스타일

***

### loading?

> `optional` **loading?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:110](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L110)

로딩 상태 스타일

#### container?

> `optional` **container?**: `string`

로딩 컨테이너

#### skeleton?

> `optional` **skeleton?**: `string`

로딩 스켈레톤

***

### header?

> `optional` **header?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:120](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L120)

헤더 영역 스타일 (제목 + 버튼)

#### container?

> `optional` **container?**: `string`

헤더 전체 컨테이너

#### desktop?

> `optional` **desktop?**: `string`

데스크톱 레이아웃

#### mobile?

> `optional` **mobile?**: `string`

모바일 레이아웃

#### titleWrapper?

> `optional` **titleWrapper?**: `string`

제목 wrapper

#### buttonWrapper?

> `optional` **buttonWrapper?**: `string`

버튼 wrapper

***

### title?

> `optional` **title?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:136](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L136)

제목 스타일

#### container?

> `optional` **container?**: `string`

제목 컨테이너

#### text?

> `optional` **text?**: `string`

제목 텍스트

***

### buttons?

> `optional` **buttons?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:146](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L146)

버튼 스타일

#### container?

> `optional` **container?**: `string`

버튼 그룹 컨테이너

#### innerWrapper?

> `optional` **innerWrapper?**: `string`

버튼 inner wrapper

#### save?

> `optional` **save?**: `string`

저장 버튼

#### list?

> `optional` **list?**: `string`

목록 버튼

#### delete?

> `optional` **delete?**: `string`

삭제 버튼

#### close?

> `optional` **close?**: `string`

닫기 버튼 (팝업)

#### custom?

> `optional` **custom?**: `string`

커스텀 버튼 기본값

***

### alerts?

> `optional` **alerts?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:166](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L166)

Alert 메시지 스타일

#### singleContainer?

> `optional` **singleContainer?**: `string`

단일 알림 컨테이너

#### multiContainer?

> `optional` **multiContainer?**: `string`

다중 알림 컨테이너

#### header?

> `optional` **header?**: `string`

헤더 (접힘/펼침 버튼)

#### headerExpanded?

> `optional` **headerExpanded?**: `string`

헤더 - 펼쳐진 상태

#### headerCollapsed?

> `optional` **headerCollapsed?**: `string`

헤더 - 접힌 상태

#### listContainer?

> `optional` **listContainer?**: `string`

알림 목록 컨테이너

#### listExpanded?

> `optional` **listExpanded?**: `string`

알림 목록 - 펼쳐진 상태

#### listCollapsed?

> `optional` **listCollapsed?**: `string`

알림 목록 - 접힌 상태

#### listContent?

> `optional` **listContent?**: `string`

알림 목록 내부

***

### alertItem?

> `optional` **alertItem?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:190](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L190)

개별 AlertItem 스타일

#### container?

> `optional` **container?**: `string`

알림 아이템 컨테이너

#### icon?

> `optional` **icon?**: `string`

아이콘

#### contentWrapper?

> `optional` **contentWrapper?**: `string`

콘텐츠 wrapper

#### message?

> `optional` **message?**: `string`

메시지 텍스트

#### description?

> `optional` **description?**: `string`

설명 텍스트

#### closeButton?

> `optional` **closeButton?**: `string`

닫기 버튼

#### colorVariants?

> `optional` **colorVariants?**: `object`

색상별 스타일 (동적) - success, danger, warning, info 등

##### colorVariants.success?

> `optional` **success?**: `string`

##### colorVariants.danger?

> `optional` **danger?**: `string`

##### colorVariants.warning?

> `optional` **warning?**: `string`

##### colorVariants.info?

> `optional` **info?**: `string`

##### colorVariants.primary?

> `optional` **primary?**: `string`

##### colorVariants.secondary?

> `optional` **secondary?**: `string`

##### colorVariants.dark?

> `optional` **dark?**: `string`

***

### errors?

> `optional` **errors?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:218](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L218)

에러 표시 스타일

#### container?

> `optional` **container?**: `string`

에러 컨테이너

#### header?

> `optional` **header?**: `string`

에러 헤더 버튼

#### headerExpanded?

> `optional` **headerExpanded?**: `string`

에러 헤더 - 펼쳐진 상태

#### headerCollapsed?

> `optional` **headerCollapsed?**: `string`

에러 헤더 - 접힌 상태

#### headerIcon?

> `optional` **headerIcon?**: `string`

에러 아이콘

#### headerTitle?

> `optional` **headerTitle?**: `string`

에러 타이틀

#### headerBadge?

> `optional` **headerBadge?**: `string`

에러 카운트 뱃지

#### content?

> `optional` **content?**: `string`

에러 콘텐츠 영역

#### item?

> `optional` **item?**: `string`

에러 아이템 컨테이너

#### tabName?

> `optional` **tabName?**: `string`

탭 이름

#### fieldErrors?

> `optional` **fieldErrors?**: `string`

필드별 에러 목록

#### fieldErrorButton?

> `optional` **fieldErrorButton?**: `string`

필드 에러 버튼

***

### tabs?

> `optional` **tabs?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:248](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L248)

탭 스타일

#### list?

> `optional` **list?**: `string`

탭 리스트 컨테이너

#### tab?

> `optional` **tab?**: `string`

탭 버튼

#### tabSelected?

> `optional` **tabSelected?**: `string`

탭 버튼 - 선택된 상태

#### tabDisabled?

> `optional` **tabDisabled?**: `string`

탭 버튼 - 비활성화 상태

***

### tabPanel?

> `optional` **tabPanel?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:262](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L262)

탭 패널 스타일

#### panel?

> `optional` **panel?**: `string`

Tab.Panel 자체에 적용되는 클래스

#### empty?

> `optional` **empty?**: `string`

빈 상태 메시지

#### content?

> `optional` **content?**: `string`

콘텐츠 영역

***

### panel?

> `optional` **panel?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:274](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L274)

패널/스크롤 영역 스타일

#### scrollContainer?

> `optional` **scrollContainer?**: `string`

스크롤 컨테이너

#### layoutWrapper?

> `optional` **layoutWrapper?**: `string`

레이아웃 wrapper

#### container?

> `optional` **container?**: `string`

패널 컨테이너

#### inner?

> `optional` **inner?**: `string`

패널 내부

***

### fieldGroup?

> `optional` **fieldGroup?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:288](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L288)

필드 그룹 스타일

#### container?

> `optional` **container?**: `string`

그룹 컨테이너 (panel)

#### header?

> `optional` **header?**: `string`

그룹 헤더 영역

#### title?

> `optional` **title?**: `string`

그룹 제목

#### actions?

> `optional` **actions?**: `string`

액션 영역 (도움말, 접기/펼치기)

#### collapseToggle?

> `optional` **collapseToggle?**: `string`

접기/펼치기 토글

#### content?

> `optional` **content?**: `string`

필드 목록 컨테이너

***

### field?

> `optional` **field?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:306](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L306)

개별 필드 스타일

#### container?

> `optional` **container?**: `string`

필드 컨테이너

#### labelWrapper?

> `optional` **labelWrapper?**: `string`

레이블 wrapper

#### label?

> `optional` **label?**: `string`

레이블 텍스트

#### requiredIcon?

> `optional` **requiredIcon?**: `string`

필수 아이콘

#### dirtyIcon?

> `optional` **dirtyIcon?**: `string`

수정됨 아이콘

#### tooltipIcon?

> `optional` **tooltipIcon?**: `string`

도움말 아이콘

#### valueContainer?

> `optional` **valueContainer?**: `string`

필드 값 컨테이너

***

### fieldError?

> `optional` **fieldError?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:326](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L326)

필드 에러 스타일

#### message?

> `optional` **message?**: `string`

에러 메시지

***

### helpText?

> `optional` **helpText?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:334](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L334)

도움말 텍스트 스타일

#### text?

> `optional` **text?**: `string`

도움말 텍스트

***

### createStep?

> `optional` **createStep?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:342](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L342)

CreateStep (단계별 생성) 스타일

#### container?

> `optional` **container?**: `string`

전체 컨테이너

#### panel?

> `optional` **panel?**: `string`

패널

#### stepperWrapper?

> `optional` **stepperWrapper?**: `string`

스텝퍼 wrapper

#### stepLabel?

> `optional` **stepLabel?**: `string`

스텝 라벨

#### buttonGroup?

> `optional` **buttonGroup?**: `string`

버튼 그룹

#### prevButton?

> `optional` **prevButton?**: `string`

이전 버튼

#### nextButton?

> `optional` **nextButton?**: `string`

다음 버튼

#### saveButton?

> `optional` **saveButton?**: `string`

저장 버튼

#### toggleButton?

> `optional` **toggleButton?**: `string`

토글 버튼

***

### headerArea?

> `optional` **headerArea?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:367](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L367)

헤더 영역 스타일 (withHeaderArea로 추가된 커스텀 영역)
헤더 버튼과 Alert 영역 사이에 표시되는 sticky 고정 영역

#### container?

> `optional` **container?**: `string`

헤더 영역 컨테이너

***

### footer?

> `optional` **footer?**: `object`

Defined in: [listgrid/components/form/types/ViewEntityFormTheme.types.ts:375](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/components/form/types/ViewEntityFormTheme.types.ts#L375)

푸터 영역 스타일 (buttonPosition: 'bottom' 일 때 사용)

#### container?

> `optional` **container?**: `string`

푸터 컨테이너
