[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / ViewListGridClassNames

# Interface: ViewListGridClassNames

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:19](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L19)

ViewListGrid 컴포넌트 테마 타입 정의

ListGrid와 하위 컴포넌트들의 모든 스타일 요소를 커스터마이징할 수 있습니다.
EntityFormTheme과 함께 통합 테마 시스템의 일부로 사용됩니다.

## Example

```tsx
const myListGridTheme: ViewListGridClassNames = {
  panel: {
    container: 'mt-5 border rounded-xl',
  },
  table: {
    container: 'table-hover w-full',
  },
};
```

## Properties

### root?

> `optional` **root?**: `string`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:23](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L23)

최상위 컨테이너 스타일

***

### loading?

> `optional` **loading?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L28)

로딩 상태 스타일

#### container?

> `optional` **container?**: `string`

로딩 컨테이너

#### overlay?

> `optional` **overlay?**: `string`

로딩 오버레이 영역

#### skeleton?

> `optional` **skeleton?**: `string`

로딩 스켈레톤

***

### header?

> `optional` **header?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:40](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L40)

헤더 영역 스타일 (ListGridHeader)

#### container?

> `optional` **container?**: `string`

헤더 전체 컨테이너

#### titleContainer?

> `optional` **titleContainer?**: `string`

제목 영역 외부 컨테이너

#### titleWrapper?

> `optional` **titleWrapper?**: `string`

제목 영역 내부 래퍼

#### titleText?

> `optional` **titleText?**: `string`

제목 텍스트

#### buttonGroup?

> `optional` **buttonGroup?**: `string`

버튼 그룹 컨테이너

***

### panel?

> `optional` **panel?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:56](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L56)

패널 스타일 (메인 컨텐츠 영역)

#### container?

> `optional` **container?**: `string`

패널 컨테이너

#### mainEntity?

> `optional` **mainEntity?**: `string`

Main Entity 스타일

#### subCollection?

> `optional` **subCollection?**: `string`

SubCollection 스타일

#### default?

> `optional` **default?**: `string`

기본 스타일 (isMainEntity, isSubCollection 모두 false)

***

### subCollectionButtons?

> `optional` **subCollectionButtons?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:70](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L70)

서브콜렉션 버튼 영역 (SubCollectionButtons)

#### container?

> `optional` **container?**: `string`

컨테이너

#### buttonGroup?

> `optional` **buttonGroup?**: `string`

버튼 그룹

#### addButton?

> `optional` **addButton?**: `string`

추가 버튼

#### deleteButton?

> `optional` **deleteButton?**: `string`

삭제 버튼

#### actionButton?

> `optional` **actionButton?**: `string`

기타 액션 버튼

***

### searchBar?

> `optional` **searchBar?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:86](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L86)

검색바 스타일 (QuickSearchBar)

#### container?

> `optional` **container?**: `string`

검색바 전체 컨테이너

#### innerWrapper?

> `optional` **innerWrapper?**: `string`

내부 래퍼

#### layoutWrapper?

> `optional` **layoutWrapper?**: `string`

레이아웃 래퍼 (flex)

***

### searchInput?

> `optional` **searchInput?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:98](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L98)

검색 인풋 스타일 (QuickSearchInput)

#### container?

> `optional` **container?**: `string`

인풋 컨테이너

#### input?

> `optional` **input?**: `string`

인풋 필드

#### icon?

> `optional` **icon?**: `string`

검색 아이콘

#### button?

> `optional` **button?**: `string`

검색 버튼

#### clearButton?

> `optional` **clearButton?**: `string`

클리어 버튼

***

### searchBarActions?

> `optional` **searchBarActions?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:114](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L114)

검색바 액션 버튼 (SearchBarActions)

#### container?

> `optional` **container?**: `string`

컨테이너

#### pageSizeSelect?

> `optional` **pageSizeSelect?**: `string`

페이지 사이즈 셀렉트

#### filterButton?

> `optional` **filterButton?**: `string`

필터 버튼

#### fieldSelectorButton?

> `optional` **fieldSelectorButton?**: `string`

필드 선택기 버튼

#### advancedSearchButton?

> `optional` **advancedSearchButton?**: `string`

고급 검색 버튼

***

### advancedSearch?

> `optional` **advancedSearch?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:130](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L130)

고급 검색 폼 스타일 (AdvancedSearchForm)

#### container?

> `optional` **container?**: `string`

폼 컨테이너

#### panel?

> `optional` **panel?**: `string`

폼 패널

#### fieldGrid?

> `optional` **fieldGrid?**: `string`

필드 그리드

#### buttonArea?

> `optional` **buttonArea?**: `string`

버튼 영역

#### searchButton?

> `optional` **searchButton?**: `string`

검색 버튼

#### resetButton?

> `optional` **resetButton?**: `string`

초기화 버튼

#### closeButton?

> `optional` **closeButton?**: `string`

닫기 버튼

***

### table?

> `optional` **table?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:150](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L150)

테이블 스타일

#### responsiveWrapper?

> `optional` **responsiveWrapper?**: `string`

테이블 responsive 래퍼

#### container?

> `optional` **container?**: `string`

테이블 컨테이너

#### table?

> `optional` **table?**: `string`

테이블 요소

#### thead?

> `optional` **thead?**: `string`

테이블 헤더 (thead)

#### headerRow?

> `optional` **headerRow?**: `string`

헤더 행 (tr)

#### tbody?

> `optional` **tbody?**: `string`

테이블 바디 (tbody)

#### contentWrapper?

> `optional` **contentWrapper?**: `string`

컨텐츠 래퍼 (비-팝업 모드)

***

### headerCell?

> `optional` **headerCell?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:170](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L170)

테이블 헤더 셀 스타일 (HeaderField)

#### cell?

> `optional` **cell?**: `string`

헤더 셀 (th)

#### sortable?

> `optional` **sortable?**: `string`

정렬 가능 헤더

#### sorted?

> `optional` **sorted?**: `string`

정렬 중인 헤더

#### sortIcon?

> `optional` **sortIcon?**: `string`

정렬 아이콘

#### filterIcon?

> `optional` **filterIcon?**: `string`

필터 아이콘

#### checkboxCell?

> `optional` **checkboxCell?**: `string`

체크박스 헤더 셀

#### dragHandleCell?

> `optional` **dragHandleCell?**: `string`

드래그 핸들 헤더 셀

#### openNewWindowCell?

> `optional` **openNewWindowCell?**: `string`

새창 열기 헤더 셀

#### selectCell?

> `optional` **selectCell?**: `string`

선택 버튼 헤더 셀

***

### row?

> `optional` **row?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:194](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L194)

테이블 행 스타일 (ViewRows)

#### row?

> `optional` **row?**: `string`

행 (tr)

#### hover?

> `optional` **hover?**: `string`

호버 상태

#### selected?

> `optional` **selected?**: `string`

선택된 행

#### even?

> `optional` **even?**: `string`

짝수 행

#### odd?

> `optional` **odd?**: `string`

홀수 행

#### dragging?

> `optional` **dragging?**: `string`

드래그 중인 행

#### clickable?

> `optional` **clickable?**: `string`

클릭 가능한 행

***

### cell?

> `optional` **cell?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:214](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L214)

테이블 셀 스타일 (ViewColumn)

#### cell?

> `optional` **cell?**: `string`

셀 (td)

#### checkboxCell?

> `optional` **checkboxCell?**: `string`

체크박스 셀

#### numberCell?

> `optional` **numberCell?**: `string`

번호 셀

#### dragHandleCell?

> `optional` **dragHandleCell?**: `string`

드래그 핸들 셀

#### openNewWindowCell?

> `optional` **openNewWindowCell?**: `string`

새창 열기 셀

#### selectCell?

> `optional` **selectCell?**: `string`

선택 버튼 셀

#### dataCell?

> `optional` **dataCell?**: `string`

데이터 셀

***

### checkbox?

> `optional` **checkbox?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:234](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L234)

체크박스 스타일 (EntireChecker)

#### container?

> `optional` **container?**: `string`

체크박스 컨테이너

#### input?

> `optional` **input?**: `string`

체크박스 인풋

#### selectAll?

> `optional` **selectAll?**: `string`

전체 선택 체크박스

#### item?

> `optional` **item?**: `string`

개별 체크박스

#### checked?

> `optional` **checked?**: `string`

선택된 상태

#### indeterminate?

> `optional` **indeterminate?**: `string`

부분 선택 상태

***

### empty?

> `optional` **empty?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:252](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L252)

빈 상태 스타일

#### container?

> `optional` **container?**: `string`

빈 상태 컨테이너

#### message?

> `optional` **message?**: `string`

빈 상태 메시지

#### icon?

> `optional` **icon?**: `string`

빈 상태 아이콘

***

### pagination?

> `optional` **pagination?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:264](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L264)

페이지네이션 스타일

#### container?

> `optional` **container?**: `string`

페이지네이션 컨테이너

#### wrapper?

> `optional` **wrapper?**: `string`

페이지네이션 래퍼

***

### notifications?

> `optional` **notifications?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:274](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L274)

알림 메시지 스타일

#### container?

> `optional` **container?**: `string`

알림 컨테이너

#### error?

> `optional` **error?**: `string`

에러 알림

#### success?

> `optional` **success?**: `string`

성공 알림

#### warning?

> `optional` **warning?**: `string`

경고 알림

#### info?

> `optional` **info?**: `string`

정보 알림

***

### fieldSelector?

> `optional` **fieldSelector?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:290](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L290)

필드 선택기 스타일 (FieldSelector)

#### container?

> `optional` **container?**: `string`

선택기 컨테이너

#### dropdown?

> `optional` **dropdown?**: `string`

드롭다운 패널

#### item?

> `optional` **item?**: `string`

필드 아이템

#### selectedItem?

> `optional` **selectedItem?**: `string`

선택된 필드

#### checkbox?

> `optional` **checkbox?**: `string`

체크박스

***

### filterDropdown?

> `optional` **filterDropdown?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:306](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L306)

필터 드롭다운 스타일 (FilterDropdown)

#### container?

> `optional` **container?**: `string`

드롭다운 컨테이너

#### panel?

> `optional` **panel?**: `string`

드롭다운 패널

#### input?

> `optional` **input?**: `string`

필터 인풋

#### applyButton?

> `optional` **applyButton?**: `string`

적용 버튼

#### resetButton?

> `optional` **resetButton?**: `string`

초기화 버튼

***

### modal?

> `optional` **modal?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:322](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L322)

모달 스타일 (SubCollectionViewModal 등)

#### overlay?

> `optional` **overlay?**: `string`

모달 오버레이

#### container?

> `optional` **container?**: `string`

모달 컨테이너

#### header?

> `optional` **header?**: `string`

모달 헤더

#### body?

> `optional` **body?**: `string`

모달 바디

#### footer?

> `optional` **footer?**: `string`

모달 푸터

#### closeButton?

> `optional` **closeButton?**: `string`

닫기 버튼

***

### dataTransferModal?

> `optional` **dataTransferModal?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:340](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L340)

데이터 전송 모달 스타일 (DataTransferModal)

#### container?

> `optional` **container?**: `string`

모달 컨테이너

#### optionGrid?

> `optional` **optionGrid?**: `string`

옵션 그리드

#### optionItem?

> `optional` **optionItem?**: `string`

옵션 아이템

#### progressBar?

> `optional` **progressBar?**: `string`

진행률 바

***

### priority?

> `optional` **priority?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:354](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L354)

우선순위 조절 스타일 (PriorityButton, 드래그 핸들)

#### dragHandle?

> `optional` **dragHandle?**: `string`

드래그 핸들

#### dragHandleIcon?

> `optional` **dragHandleIcon?**: `string`

드래그 핸들 아이콘

#### button?

> `optional` **button?**: `string`

우선순위 버튼

#### active?

> `optional` **active?**: `string`

활성화 상태

***

### popup?

> `optional` **popup?**: `object`

Defined in: [listgrid/components/list/types/ViewListGridTheme.types.ts:368](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/components/list/types/ViewListGridTheme.types.ts#L368)

팝업 모드 스타일 (options.popup이 true일 때)

#### container?

> `optional` **container?**: `string`

팝업 컨테이너

#### scrollArea?

> `optional` **scrollArea?**: `string`

스크롤 영역

#### table?

> `optional` **table?**: `string`

팝업 테이블
