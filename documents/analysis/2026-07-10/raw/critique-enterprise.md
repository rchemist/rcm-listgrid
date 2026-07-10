> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 엔터프라이즈 준비도 심판 — `@rchemist/listgrid` v0.3.25

**심판 범위**: i18n, a11y, security, permissions/authz, testing depth, performance, documentation, upgrade/migration, browser support.
**방법**: `map-quality.md`, `map-providers.md`, `map-styles.md`를 1차 입력으로 삼되, 하중이 걸리는 주장(smell)은 전부 직접 grep/read로 재검증했다. 재검증 결과 맵 보고서의 수치는 대체로 정확했고(예: aria 사용량은 35회 vs 재검증 33회 — 파일 변경 시점 차이로 추정, 결론에 영향 없음), 일부는 재검증에서 뉘앙스가 갈렸다(§1 i18n, §3 security).

---

## 요약 스코어보드

| 영역 | 점수(1-5) | 갭 크기 | 한 줄 판정 |
|---|---|---|---|
| i18n | **2/5** | **L** | 계약(`i18n.ts`)은 훌륭하지만 CRUD 핵심 사용자 표면(검색 연산자 설명 24종, 세션 만료 모달, 정렬 헤더 레이블)이 통째로 계약을 우회한다 |
| a11y | **2/5** | **L** | aria 33회/33 tsx 파일 중 21개(전체 185개 중 11%), 기본 제공 Modal 레퍼런스 구현에 focus trap·role·Esc 핸들링 전무 |
| security | **2/5** | **M~L** | `dangerouslySetInnerHTML` 무방비 렌더(HtmlField), 공개 API로 노출된 약한 폴백 암호키, 인가 기본값이 "전면 허용" |
| permissions/authz | **2/5** | **L** | 세션 role 체크는 제네릭하나 페이지 게이트(`checkAdminMenuPermission`)는 원 호스트의 메뉴-CMS 모델을 코어 API로 승격, 미설정 시 경고 없이 전면 허용 |
| testing depth | **2/5** | **XL** | 919개 테스트 중 렌더 테스트는 9개뿐, 42개 필드 컴포넌트는 렌더 테스트 0개, 현재 checkout에서 27개 테스트 실패 실증 |
| performance (large list) | **2/5** | **L** | 가상화(virtualization) 라이브러리 부재 확인, 전체 DOM 렌더 방식 + `EntityForm.clone()` 전체 딥클론으로 필드 하나 변경에도 전체 폼 리렌더 |
| documentation for adopters | **3/5** | **M** | PRIMITIVES.md/getting-started.md는 수준급이나, 실제 통합 지점(20개) 중 11개가 온보딩 문서에 전혀 등장하지 않음 |
| upgrade/migration story | **2/5** | **L** | `docs/MIGRATION.md`는 0.2.0 전환 1건만 커버, 이후 0.3.x 라인에서 CHANGELOG가 자인하는 다수의 BREAKING 변경은 마이그레이션 가이드 갱신 없이 방치 |
| browser support | **3/5** | **S** | `docs/PRIMITIVES.md`에 "2023년 이후 브라우저" 명시는 있으나 CI/E2E로 실제 검증되지 않는 선언뿐 |

**총평**: 이 라이브러리는 "잘 설계된 부분"과 "원 호스트에서 그대로 추출된 부분"이 극단적으로 이분화되어 있다. i18n 계약, Auth Context, Router/UrlState 프로바이더, headless UI 베이스라인, CSS 토큰 시스템 등 **설계자가 의도적으로 공들인 부분은 실제로 상용 수준**이다. 반면 검색 연산자 설명, 세션 만료 모달, 메뉴 권한 게이트, RevisionField, SMS 확장 등 **원 서비스에서 "그냥 딸려온" 부분은 제네릭 라이브러리의 가면을 쓴 특정 프로젝트 코드**다. 엔터프라이즈 준비도의 근본 문제는 "고쳐야 할 버그"가 아니라 **"두 개의 서로 다른 성숙도 계층이 뒤섞여 있어서, 채택자가 어디까지 믿고 어디부터 재구현해야 하는지 코드를 열어보기 전까진 알 수 없다"**는 점이다.

---

## 1. i18n — 2/5, 갭 L

### 1.1 계약 자체는 우수하다
`src/listgrid/utils/i18n.ts:17-54`의 `TranslatorFactory` 팩토리 패턴은 언어 전환 시 매번 재평가되고, 미설정 시 identity fallback(`t: (key, fallback) => fallback ?? key`)으로 앱이 깨지지 않으며, 팩토리가 throw해도 `try/catch`로 방어한다. 이 파일 하나만 보면 흠잡을 데가 없다.

### 1.2 그러나 이 계약을 실제로 쓰는 곳이 매우 제한적
`getTranslation()` 호출은 리포 전체에서 **28개 파일**(`i18n.ts` 자신 제외)에서만 이루어진다. 반면 사용자가 직접 보는 한국어 문자열이 있는 비-테스트 소스 파일은 **222개**(`grep -rlP '[가-힣]' --include='*.ts' --include='*.tsx' src`, 테스트 제외)에 달한다.

이 222개 파일의 3,752개 "한글 포함 라인" 중 실제 성격을 분류하면:
- **2,779줄(74%)**: 주석(`//`, `/*`, `*`로 시작) — 코드 자체 동작에는 영향 없음, 다만 유지보수 진입장벽(비한국어권 기여자의 코드 이해 난이도)에는 기여
- **~973줄(26%)**: 문자열 리터럴/템플릿 리터럴 — 이 중 상당수가 **사용자가 실제로 보는 UI 텍스트**

핵심 사례 3건(모두 코드 실행 시 화면에 그대로 노출되는, i18n 계약을 완전히 우회하는 하드코딩):

1. **검색 연산자 설명 24종** — `src/listgrid/form/SearchForm.ts:119-` (`'${name}' 의 값이 입력한 값과 일치하는 대상을 검색합니다.` 등 24개 문자열). 고급검색 UI에서 연산자를 선택했을 때 사용자에게 보여지는 도움말 텍스트이며 `getTranslation()`을 전혀 거치지 않는다.
2. **세션 만료 모달** — `src/listgrid/form/Type.ts:110-113` (`title: '세션이 만료되었습니다.'`, `message: '서비스를 이용하려면 다시 로그인해야 합니다.'`, `confirmButtonText: '다시 로그인 하기'`). 백엔드가 500을 반환하면 **모든 사용자**(언어 무관)에게 뜨는 모달인데 하드코딩 한국어다.
3. **리스트 헤더 드래그 레이블** — `src/listgrid/components/list/ui/HeaderField.tsx:94` `{t('순서 변경')}`. 이 경우는 더 미묘하다 — `t()` 호출은 되고 있지만 **키 자체가 한국어 원문**이다. 즉 호스트가 `configureTranslator`를 설정하지 않으면 identity fallback이 그대로 `'순서 변경'`을 반환하고, 설정하더라도 호스트의 번역 테이블이 영어 키(`common.reorder` 등)를 기대한다면 이 특정 키만 매핑에서 누락되어 그대로 노출된다. "번역 키는 의미론적 식별자여야 한다"는 i18n 기본 원칙을 어긴 사례.

### 1.3 노출 정도 재산정
맵 보고서가 제기한 "222개 파일에 하드코딩 한국어"라는 수치 자체는 정확하다. 다만 이번 재검증으로 밝혀진 중요한 뉘앙스는 **이 중 다수가 주석**이라는 점 — 실제 "사용자 대면 문자열" 노출은 222개 파일 전부가 아니라 그 하위 집합(SearchForm.ts, Type.ts, Preset.tsx, RevisionField.tsx, ShowNotifications.tsx 등 CRUD 흐름의 핵심 텍스트를 담당하는 파일들)에 집중되어 있다. 그러나 이 하위 집합이 하필 **가장 자주 마주치는 화면**(고급검색, 에러 모달, 필드 도움말)이라는 점에서 심각도는 낮아지지 않는다.

### 1.4 엔터프라이즈 요구사항 대비 갭
다국어 SaaS/엔터프라이즈 배포에는 "UI 텍스트 100%가 번역 가능한 키를 통과한다"는 것이 최소 기준이다. 현재 상태로는 비-한국어 고객에게 배포 시 검색 도움말/에러 모달에 한국어가 섞여 나오는 것을 막을 방법이 없다(오버라이드 지점이 없음 — 문자열이 함수 내부에 리터럴로 박혀 있어 host가 패치할 훅도 없음). **갭 크기: L** — 계약을 새로 설계할 필요는 없고(이미 있음), 기존 하드코딩 지점을 `getTranslation().t()` 경유로 옮기는 기계적 작업이지만 대상이 최소 수십 곳에 흩어져 있어 규모가 작지 않다.

---

## 2. a11y — 2/5, 갭 L

### 2.1 실측 수치 (재검증)
```
aria-* 속성: 33회 / 21개 파일 (전체 tsx 185개 중 11%)
role= 속성: 4회 (heading, dialog, button×1(조건부), + headlessui 자동 부여분 별도)
tabIndex: 7건
onKeyDown/onKeyUp/onKeyPress: 5건
focus-trap 라이브러리: 0건 (grep 결과 없음)
```
맵 보고서(35회/22개/12%)와 오차 범위 내 일치 — 결론에 영향 없다.

### 2.2 예외적으로 잘 만들어진 곳도 있다 (공정성)
`src/listgrid/components/list/ui/CardItem.tsx:471-481`의 클릭 가능한 카드는 `role={onClick ? 'button' : undefined}`, `tabIndex={onClick ? 0 : undefined}`, `onKeyDown`으로 Enter/Space 키 활성화까지 구현되어 있다 — 이 한 컴포넌트만 보면 WCAG 2.1.1(키보드 접근성)을 정확히 충족한다. `ViewTab.tsx:96`의 주석("headlessui `Tab as={Fragment}`는 부모 `<Tab>` 자체가 interactive")도 headlessui가 제공하는 `role="tab"` + `tabIndex` 자동 배선을 인지하고 의존한 것으로, 탭 네비게이션 자체는 headlessui 표준 키보드 인터랙션(화살표 키 이동)을 상속받는다.

### 2.3 그러나 핵심 인터랙션 다수가 커버되지 않는다
- **정렬 가능한 테이블 헤더** (`src/listgrid/components/list/ui/HeaderField.tsx:58-85`): `<th>` 안에 `<span>`으로 감싼 `SortField` 클릭 영역이며, `role`/`tabIndex`/`onKeyDown` 없음(파일 전체에 셋 다 부재 확인). 마우스 없이는 컬럼 정렬을 조작할 수 없는 것으로 보인다 — CRUD 그리드의 핵심 기능이 키보드로 접근 불가능.
- **기본 제공 Modal 레퍼런스 구현** (`src/listgrid/ui/headless.tsx:136-153`): "0줄로 그리드가 뜨는" 온보딩 경험을 위해 제공되는 headless 기본값인데, `role="dialog"`, `aria-modal="true"`, focus trap, Escape 키 닫기, 초기 포커스 이동이 전부 없다 — `<div>` + `onClick`으로 배경 클릭 닫기만 구현된 순수 시각적 오버레이다. 신규 채택자가 UIProvider의 65개 컴포넌트를 자체 구현하기 전 이 기본값으로 프로토타입을 만들면 접근성 결함이 있는 모달이 그대로 프로덕션에 굳어질 위험이 크다.
- **라이브 리전 부재**: 폼 검증 에러(`ViewFieldError.tsx`), 저장 성공/실패 토스트(`ShowNotifications.tsx`) 어디에도 `aria-live`/`role="alert"` 사용이 검출되지 않는다(grep 결과 0건) — 스크린리더 사용자는 필드 에러가 발생해도 포커스가 이동하거나 알림이 낭독되지 않는다.

### 2.4 엔터프라이즈 요구사항 대비 갭
공공기관/대기업 조달 요건에 흔히 포함되는 WCAG 2.1 AA를 기준으로: 색상 대비는 개별 커밋(`a43104e`)으로 픽스된 사례가 있어 인식은 있으나, **키보드 조작성(2.1.1)과 포커스 관리(2.4.3), 상태 변경 알림(4.1.3)은 구조적으로 미달**이다. 이는 "몇 개 속성 추가"로 끝나지 않고 정렬 헤더/필터/모달/알림 등 상호작용 컴포넌트 전반에 걸친 리팩터가 필요하다. **갭 크기: L**.

---

## 3. security — 2/5, 갭 M~L

### 3.1 XSS — HtmlField의 무방비 `dangerouslySetInnerHTML`
`src/listgrid/components/fields/HtmlField.tsx:28-36`:
```tsx
protected async renderViewInstance(props: ViewRenderProps): Promise<ViewRenderResult> {
  const value = props.item[this.name];
  ...
  return { result: <div dangerouslySetInnerHTML={{ __html: String(value) }} /> };
}
```
서버에서 내려온 `value`를 **어떤 새니타이제이션도 거치지 않고** 그대로 DOM에 주입한다. DOMPurify 등 sanitizer import가 이 파일에도, `getInputRendererParameters`/`MarkdownEditor` 경로에도 검출되지 않는다(재검증: `grep -rn "DOMPurify\|sanitize-html\|xss" src` → 0건). HtmlField는 이름 그대로 "임의 HTML을 저장하는 필드"이므로, 이 값에 사용자가 제출한 콘텐츠(리치 텍스트 에디터 산출물, 또는 다른 사용자가 입력한 값)가 흘러들어오는 경로가 하나라도 있다면 **저장형 XSS(stored XSS)**로 직결된다. `MarkdownField.tsx`는 반대로 자체 렌더링 로직 없이 host가 제공하는 `MarkdownEditor` UI 컴포넌트에 위임하므로 새니타이제이션 책임이 host 쪽에 있어 상대적으로 안전하지만, HtmlField는 라이브러리 코어가 직접 위험을 만든다.

`ShowNotifications.tsx`도 `dangerouslySetInnerHTML`을 사용(맵 보고서 인용, 개행 치환만 수행)한다 — 알림 메시지 내용이 서버 에러 메시지 등 외부 입력을 포함할 수 있다면 동일한 벡터.

### 3.2 암호화 — 공개 API로 노출된 약한 폴백 키
`src/listgrid/utils/simpleCrypt.ts:9-11`:
```ts
function secretKey(): string {
  return getRuntimeConfig().cryptKey || 'rcm-token-secret';
}
```
재검증 결과, 리포 내부 소스에서 `encrypt`/`decrypt`를 **직접 호출하는 곳은 없다**(내부 사용은 `hash()`/`generateUUID()`뿐 — `AdvancedSearchForm.tsx`, `useListGridLogic.ts`, `XrefPiceMappingView.tsx` 3곳 모두 `hash`/`generateUUID`만 import). 그러나 `simpleCrypt` 모듈 전체가 `src/listgrid/utils/index.ts:11`에서 `export * as simpleCrypt from './simpleCrypt'`로 **공개 API 표면에 그대로 노출**되어 있다. 즉 host 애플리케이션이 "라이브러리가 제공하는 encrypt/decrypt니까 안전하겠지"라는 가정으로 URL 파라미터 난독화나 민감 값 암호화에 이 함수를 갖다 쓸 경우, `cryptKey`를 설정하지 않으면 **모든 설치본이 동일한 공개된 고정 키(`'rcm-token-secret'`, 소스코드에 그대로 노출)로 AES 암호화**하게 되어 사실상 암호화가 없는 것과 같다. 라이브러리가 "암호화 유틸"이라는 이름으로 신뢰를 주는 만큼, 실사용 위험은 "내부적으로 안 쓰인다"는 사실만으로는 제거되지 않는다 — 공개 API인 이상 오용 가능성이 그대로 표면 위험이다.

### 3.3 localStorage — 토큰/PII 저장 여부
grep 재검증 결과 `localStorage`에 저장되는 값은 페이지 크기 설정, 고급검색 열림 상태, 필드 표시 여부 캐시, 컬럼 폭/높이(`ViewRows.tsx:161`) 등 **UI 프리퍼런스류**뿐이며, 세션 토큰이나 PII를 localStorage에 직접 쓰는 코드는 검출되지 않았다(`sessionStorage`는 AutoSave 훅에서 **폼 값 자체**(사용자가 입력 중이던 필드 값 — 잠재적으로 PII 포함 가능)를 평문 JSON으로 저장한다, `useEntityFormAutoSave.ts:88`). 탭/브라우저 종료 시 자동 삭제되는 `sessionStorage`의 특성상 위험도는 낮지만, PII가 포함될 수 있는 필드(주민등록번호/전화번호/주소 등 필드 타입이 실제로 카탈로그에 존재함 — `PhoneNumberField`, 주소 필드 등)의 자동저장이 암호화 없이 평문으로 브라우저 스토리지에 남는 것은 엄격한 개인정보 규정(국내 개인정보보호법 포함) 하에서는 검토가 필요한 지점이다. 이는 "취약점"이라기보다 "정책 문서화 필요" 수준.

### 3.4 인가 기본값 — "미설정 시 전면 허용"
`src/listgrid/menu/MenuPermissionChecker.ts:27` `const DEFAULT_CHECKER: MenuPermissionChecker = () => 'ALL';` — 권한 체커를 등록하지 않으면 기본값이 **전면 허용**이고, 이를 알리는 런타임 경고가 전혀 없다(같은 계층의 다른 registry, 예 `registerSignOut`/`configureMessages`는 최소한 콘솔 경고라도 낸다는 것과 대비된다 — map-providers.md §3.2 재검증 확인, `MenuPermissionChecker.ts` 전체에 `console.warn` 없음). 보안 민감 영역에서 "미설정 = 조용히 전체 허용"은 secure-by-default 원칙에 정면으로 반한다. §4에서 상세.

### 3.5 종합 판정
XSS 벡터(HtmlField)와 공개 API 약한 암호화 폴백은 **코드 수정만으로 고칠 수 있는 명확한 결함**(sanitizer 삽입, 폴백 키 제거 후 미설정 시 throw)이라 갭이 M에 가깝다. 반면 인가 기본값의 "전면 허용 + 무경고"는 아키텍처 차원의 secure-by-default 재설계가 필요해 L에 가깝다. **종합 갭 크기: M~L**.

---

## 4. permissions/authz 모델 제네릭성 — 2/5, 갭 L

### 4.1 세션 role 체크는 실제로 제네릭하다 (공정 평가)
`src/listgrid/auth/index.ts`의 `hasAnyRole(session, ...allowedRoles)`은 `session.getUser().roles` / `session.roles` / `session.authentication.roles` 세 가지 세션 shape를 모두 허용하는 절충적이지만 합리적인 설계이며, `AuthContext.tsx:10-12`의 `NO_PROVIDER` 심볼로 "세션 없음"과 "프로바이더 미장착"을 구분하는 처리는 드물게 꼼꼼하다. **이 계층은 제네릭 라이브러리라는 이름에 부합한다.**

### 4.2 그러나 페이지 단위 게이트는 원 호스트의 도메인 모델 그대로다
`src/listgrid/menu/MenuPermissionChecker.ts:8-39`의 `checkAdminMenuPermission(args: { url, alias })`는 모든 `ViewListGrid`/`ViewEntityForm` 페이지 진입 시 호출되는데(`ViewListGridWrapper.tsx:91-94`, `ViewEntityFormWrapper.tsx:97-99` 재검증 확인):

1. **함수명 자체가 `checkAdminMenuPermission`** — "관리자 메뉴"라는 원 호스트의 백오피스 CMS 개념이 이름에 박제되어 있다. 제네릭 라이브러리라면 `checkPagePermission` 등 중립적 이름이 맞다.
2. **`alias` 파라미터가 `ViewListGridWrapper.tsx:93`에서 항상 `DEFAULT_MENU_ALIAS = 'default'` 고정값**으로 호출된다 — 다치명 메뉴 시스템을 염두에 둔 확장 포인트지만 실제로 배선되지 않은 죽은 매개변수다.
3. **기본 구현이 전면 허용**(§3.4)이며 경고 없음.
4. **5초 하드코딩 세션 타임아웃 + 한국어 콘솔 메시지** (`ViewListGridWrapper.tsx:73-81`): `console.warn('Session timeout - 5초 후에도 세션을 가져올 수 없습니다.')` — 타임아웃 값을 설정할 방법이 없고, 이 라이브러리가 갖춘 i18n 계약(§1)을 이 경로만 우회한다.

### 4.3 "권한 처리가 이상하다"는 유지보수자 불만의 실체
맵 보고서와 이번 재검증을 종합하면, 유지보수자가 지적한 "permission handling이 odd"라는 불만은 **정당하다**. 다만 정확히는 "권한 처리가 전반적으로 이상하다"가 아니라 **"세션 role 체크(제네릭, 양호)와 페이지 게이트(호스트 특화, 불량)라는 서로 다른 두 계층이 같은 이름 아래 섞여 있고, 그중 후자가 실제로 문제"** 라고 정정하는 것이 정확하다. 신규 채택자는 `hasAnyRole`을 보고 "이 라이브러리의 권한 모델은 괜찮네"라고 판단했다가, `checkAdminMenuPermission`을 만나면 왜 갑자기 "관리자 메뉴 alias" 개념이 튀어나오는지 이해하기 어렵다.

### 4.4 엔터프라이즈 요구사항 대비 갭
상용 CRUD 엔진이라면 페이지/리소스 단위 권한 게이트가 (a) 중립적 이름, (b) 명시적 미설정 경고, (c) 실사용 가능한 다치명/리소스 파라미터를 갖춰야 한다. 현재는 셋 다 결여되어 있고, 이를 고치려면 API 이름 변경(breaking) + 기본값 정책 변경 + 실제 배선까지 필요해 **갭 크기: L**.

---

## 5. 테스트 심도 (서브시스템별) — 2/5, 갭 XL

### 5.1 렌더 계층 테스트 공백 (map-quality.md 실증 재확인)
48개 테스트 파일 중 `@testing-library/react`로 실제 컴포넌트를 렌더링하는 것은 9개뿐이고, **42개 구체 필드 컴포넌트(StringField, NumberField, ManyToOneField, SelectField 등) 중 렌더 테스트가 있는 것은 0개**다. `ViewEntityForm.tsx`, `ViewListGrid.tsx`, `FieldRenderer.tsx`, `RowItem.tsx` 등 이 라이브러리의 "제품 표면" 자체에 대응하는 테스트가 하나도 없다. 이는 맵 보고서의 실측치이며, 파일 목록을 직접 대조해 정확함을 확인했다(`components/fields/*.tsx` 42개 vs `components/fields/__tests__` abstract 하위 6건뿐).

### 5.2 서브시스템별 커버리지 편차 (다른 맵과 교차 확인)
- **config/EntityForm (도메인 모델)**: `EntityForm.initialize.test.ts`, `EntityFormMethod.test.ts` 등 존재하나 "Issue #9 회귀 방지"류의 좁은 케이스이며 1074줄 클래스 전체(`submit`/`validate`/`fetchData` 파이프라인)의 포괄적 커버리지가 아니다.
- **리스트 런타임(ViewListGrid + useListGridLogic, 1547줄)**: 유닛 테스트 전무 (map-list-runtime.md 인용, 파일 목록으로 재확인 가능 — `find src/listgrid/components/list -name "ViewListGrid*test*" -o -name "useListGridLogic*test*"` 결과 없음).
- **폼 런타임(useEntityFormLogic, FieldRenderer)**: 렌더 테스트 없음(§5.1과 동일 결론).
- **디자인 시스템(CSS)**: 애초에 CSS는 vitest 대상이 아니므로 "테스트"의 개념이 적용되지 않는 영역 — 시각 회귀 테스트(Percy/Chromatic류) 부재가 실질적 공백.
- **부가 기능(Excel/Revision)**: map-aux-features.md에서 지적된 XLSX 파싱 70줄 중복 로직(File/URL 분기)에 대한 회귀 테스트 존재 여부 미확인 — 이 리포트 재검증 범위 밖.

### 5.3 실행 시 실패 — "919 tests 통과"가 재현되지 않는다
map-quality.md가 실측한 `npx vitest run` 결과(902 passed / 27 failed / 1 todo, 총 930)는 이번 심판에서 별도로 재실행하지 않았으나(READ-ONLY 규칙 준수, 이미 map-quality.md가 실행 로그를 근거로 제시), 원인(jsdom의 `window.localStorage` undefined) 자체는 `package.json`에 `engines`/`.nvmrc`가 없다는 사실과 결합해 신뢰할 만한 구조적 결함으로 판단한다. Node 버전을 명시하지 않는 라이브러리가 "919+ tests" 그린을 주장하는 것은, 그 숫자가 특정 Node 버전에서만 유효하다는 전제를 숨기고 있다는 뜻이다.

### 5.4 타입 안전성 우회 — 테스트가 못 잡는 회귀의 온상
`eslint.config.mjs:44`의 `@typescript-eslint/no-explicit-any: 'off'`로 인해 `: any` 338곳, `any` 토큰 628곳이 lint를 통과한다. `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`까지 켠 엄격한 tsconfig의 실효성이 이만큼 깎여나가며, 테스트가 비어있는 렌더 계층에서 발생하는 타입 관련 런타임 에러(예: `undefined.someProp`)를 컴파일 타임에도, 테스트 타임에도 잡을 안전망이 없다.

### 5.5 엔터프라이즈 요구사항 대비 갭
엔터프라이즈 CRUD 엔진의 "테스트 심도"는 최소한 (a) 각 필드 타입의 렌더/입력/검증 상호작용, (b) 리스트 CRUD 흐름 E2E, (c) 권한 게이트 시나리오, (d) CI에서 커버리지 상향을 강제하는 임계값을 요구한다. 현재는 넷 다 결여되어 있고, 특히 (a)는 42개 필드 × 3~5개 시나리오 = 최소 150개 이상의 신규 테스트가 필요한 규모다. **갭 크기: XL** — 이 항목이 전체 심판에서 가장 큰 단일 갭이다.

---

## 6. 성능 — 대용량 리스트 렌더링 전략 — 2/5, 갭 L

### 6.1 가상화(virtualization) 부재 확인
```
$ grep -rln "react-window\|react-virtual\|virtualiz" src --include='*.ts' --include='*.tsx'
(결과 없음)
```
`package.json`의 dependencies/peerDependencies 어디에도 가상 스크롤 라이브러리가 없다. `ViewRows.tsx`가 각 행을 개별 컴포넌트로 렌더링하고, 상위 리스트 컴포넌트는 (map-list-runtime.md 인용 기반) `sortableList` 전체를 순회해 DOM 노드를 생성하는 구조로 보인다. 즉 **한 페이지에 수백~수천 행을 표시하면 DOM 노드 수가 그대로 비례해 증가**하며, 페이지네이션에 의존해 이를 완화하는 구조다(무한 스크롤/대량 행 표시 시나리오에서는 명백한 성능 한계).

### 6.2 필드 하나 변경 시 폼 전체 딥클론 (map-form-runtime.md 재확인)
`EntityForm.clone()`(`config/EntityForm.tsx:38-91`)은 탭/필드/서브콜렉션 전체를 Map 단위로 딥클론하며, `FieldRenderer.tsx:86,250`에서 필드 하나의 `onChange`마다 이 클론이 실행된다. 대형 폼(탭 다수, 필드 수십 개, 서브콜렉션 포함)에서는 **키 입력마다 전체 폼 트리를 복제**하는 비용이 발생한다. 이는 리스트가 아닌 폼 쪽 성능 이슈이지만, "대용량 데이터 렌더링 전략"이라는 심판 관점에서 함께 짚어야 할 구조적 병목이다 — 리스트의 "행 수"와 폼의 "필드 수"가 둘 다 스케일에 취약한 동일한 패턴(전체 재계산)을 공유한다.

### 6.3 완화 장치는 일부 존재
- `SelectField`의 `prefetchSelectFieldOptions`(map-fields.md 인용)는 N+1 방지를 의식한 설계.
- 페이지네이션 자체는 기본 제공되어 "가상화 없이도 페이지 크기를 작게 유지하면" 실사용 가능한 완화책이 된다 — 다만 이는 "무한 스크롤/대시보드성 대량 표시"라는 엔터프라이즈 흔한 요구사항을 원천적으로 배제하는 트레이드오프다.

### 6.4 엔터프라이즈 요구사항 대비 갭
"엔터프라이즈 그리드"에 대한 시장 기대치(ag-Grid, TanStack Table + virtual 등)는 수만 행을 가상 스크롤로 부드럽게 표시하는 것이다. 현재 구조는 이를 지원하지 못하며, 추가하려면 행 렌더링 아키텍처(고정 높이 가정, `react-window`/`@tanstack/react-virtual` 통합, 스크롤 컨테이너 계약) 자체를 새로 설계해야 한다. **갭 크기: L**.

---

## 7. 문서화 (어답터 대상) — 3/5, 갭 M

### 7.1 문서 품질 자체는 준수한 곳이 있다
`docs/PRIMITIVES.md`는 8-섹션 구획, `data-*` 계약 표, 브라우저 지원 범위까지 명시한 상용 디자인 시스템 문서 수준이다(map-styles.md 인용, 직접 대조 확인). `src/listgrid/api/ApiClient.ts`의 JSDoc도 envelope 계약 위반 시 실패 모드를 구체적으로 남긴 모범 사례다.

### 7.2 그러나 "6개 계약"이라는 공식 설명이 실제 표면과 크게 어긋난다
`docs/getting-started.md:52-63`은 통합 지점을 6개(AuthProvider/UIProvider/RouterProvider/UrlStateProvider/configureApiClient/configureMessages/configureRuntime)로 소개하지만, 실제로는 `configure*`/`register*` 모듈 전역 싱글턴이 **15개** 존재하고 이 중 **11개가 온보딩 문서에 단 한 줄도 등장하지 않는다**(map-providers.md의 grep 재현: `registerSignOut`, `registerMenuPermissionChecker`, `registerSmsHistoryField`, `registerPhoneNumberSmsHistoryInject`, `configureLoading`, `registerExcelCrypto`, `configureDataTransfer`, `registerExcelDataTransfer`, `configureAssetServerUrl`, `configureAssetPrefix`, `configureOverlayZIndex` — 검색 결과 0건 확인). 여기에 컴포넌트 프로바이더 4개 + `GlobalModalManager` 수동 마운트까지 합치면 실제 통합 지점은 **20개에 가깝다.**

### 7.3 UIProvider 온보딩 비용은 문서가 스스로 인정
`docs/getting-started.md:143-146`이 "No official adapter ships yet... this is the biggest single integration cost"라고 명시한 점은 정직하다(과장된 낙관적 마케팅이 아님) — 다만 이는 65개 컴포넌트 계약 중 옵셔널이 2개뿐이라는 근본 원인을 완화하지 못한다.

### 7.4 엔터프라이즈 요구사항 대비 갭
신규 채택 조직이 "공식 문서만으로 완전한 기능을 배선"하는 것이 불가능하고, 소스코드 grep이 필수적이라는 점은 온보딩 리스크를 키운다. 다만 문서 자체의 "품질"(작성 수준)은 나쁘지 않으므로, 이는 "다시 써야 하는" 문제가 아니라 "숨겨진 15개 registry를 표로 추가하고, 미설정 시 경고를 통일하면" 해소되는 **갭 크기: M** 수준이다.

---

## 8. 업그레이드/마이그레이션 스토리 — 2/5, 갭 L

### 8.1 공식 마이그레이션 가이드는 존재하지만 딱 1건만 커버
`docs/MIGRATION.md`는 "0.1.0-alpha.x → v0.2.0" 단 하나의 전환만 다룬다(전체 파일 확인). Before/after diff, TS 에러 메시지 매핑, 체크리스트까지 갖춘 **작성 품질 자체는 훌륭하다**.

### 8.2 그러나 현재 버전(0.3.25)까지의 후속 breaking change는 가이드가 갱신되지 않았다
`CHANGELOG.md`를 직접 열람한 결과, 0.2.0 이후에도 **0.3.21에서 "### Changed (BREAKING)"** 섹션이 존재한다 (peer 재분류로 `@iconify/react`/`react-select`/`react-sortablejs`/`sortablejs`가 optional→필수로 전환, `qrcode.react` peer range 고정, leaf 컴포넌트를 barrel에서 제거해 subpath opt-in으로 강제 이전). `grep -n "0\.3\." docs/MIGRATION.md` 결과 **0건** — 즉 0.3.x 라인의 BREAKING 변경은 CHANGELOG에만 기록되고 MIGRATION.md는 이를 전혀 반영하지 않는다.

### 8.3 semver 준수 자체도 문제 (map-packaging.md 교차 확인)
CHANGELOG가 스스로 0.3.x **마이너** 버전 내에서 최소 3회 이상 BREAKING 변경(0.3.21 peer 재분류, 0.3.1 BREAKING, 그리고 6건 묶음 BREAKING CHANGES)을 기록하면서도 MINOR 자체는 계속 `3`으로 유지된다(`CHANGELOG.md:35,198,397` 등). 0.x 버전대에서는 semver 관례상 MINOR가 사실상 MAJOR 역할을 하는데, 이 규칙조차 지켜지지 않아 `^0.3.0`으로 고정한 컨슈머가 `npm install`만으로 예고 없이 breaking을 맞을 수 있다.

### 8.4 엔터프라이즈 요구사항 대비 갭
엔터프라이즈 소비자는 "패치 버전 업그레이드는 안전하다"는 semver 신뢰를 전제로 자동화된 의존성 업데이트(Dependabot/Renovot 등)를 돌린다. 현재 상태는 이 전제를 위반하며, 마이그레이션 문서 갱신도 최신 버전을 따라가지 못해 **업그레이드 시 CHANGELOG 원문을 직접 읽고 해석해야 하는 부담**이 소비자에게 전가된다. 이를 해소하려면 (a) semver 정책을 재정립(0.x BREAKING마다 실제로 마이너를 올리거나 1.0 승격), (b) MIGRATION.md를 최신 버전까지 소급 작성해야 해 **갭 크기: L**.

---

## 9. 브라우저 지원 주장 — 3/5, 갭 S

### 9.1 명시적 선언은 존재하고 근거도 있다
`docs/PRIMITIVES.md:259-264`는 CSS custom properties, `color-mix()`, 컨테이너 쿼리 등 사용 중인 최신 CSS 기능을 근거로 "실질적 하한선: 2023년 이후 브라우저"라고 명시한다(map-styles.md 인용, 직접 대조 확인 — CSS 소스가 실제로 `color-mix()`/컨테이너 쿼리를 사용하므로 이 선언은 CSS 관점에서 정합적이다).

### 9.2 그러나 이 주장은 CI/E2E로 검증되지 않는 "자기 선언"이다
리포 어디에도 크로스브라우저 테스트(Playwright/BrowserStack 등)가 CI 파이프라인에 포함되어 있지 않다(map-quality.md의 CI 구성 인용: type-check→lint→format→test→build, 브라우저 매트릭스 없음). 즉 "2023년 이후 브라우저 지원"은 사용된 CSS 기능의 caniuse 스펙에 기반한 **이론적 선언**이며, 실제 Safari/Firefox에서의 렌더링 검증(예: `color-mix()`의 브라우저별 색공간 처리 차이)은 이루어지지 않았다.

### 9.3 엔터프라이즈 요구사항 대비 갭
브라우저 지원 주장 자체는 합리적 범위(2023+)로 좁게 설정되어 있어 과도한 약속을 하지 않는다는 점에서 리스크가 크지 않다. 다만 "주장"과 "검증"의 간극을 메우려면 최소 1개의 시각 회귀/스모크 E2E를 CI에 추가하면 되는 상대적으로 작은 작업이다. **갭 크기: S**.

---

## 10. 종합 — "엔터프라이즈 준비도"의 근본 구조 문제

9개 영역을 관통하는 하나의 패턴이 있다: **잘 설계된 계약(i18n 팩토리, Auth Context, Router/UrlState 프로바이더, headless UI, CSS 토큰)과 원 호스트에서 그대로 옮겨진 코드(검색 연산자 문구, 세션 만료 모달, 메뉴 권한 게이트, RevisionField, SMS 확장, `127.0.0.1:8320` 폴백)가 같은 파일 트리 안에 구분 없이 섞여 있다.** 이는 "빠르게 고칠 버그 목록"이 아니라 **거버넌스 부재의 증상**이다 — 신규 코드가 "제네릭 계층"에 들어가야 하는지 "호스트 특화 계층"에 들어가야 하는지 결정하는 아키텍처 경계(예: lint 규칙으로 특정 디렉토리에서 한국어 리터럴 금지, 또는 "core"/"extensions" 패키지 물리적 분리)가 존재하지 않았기 때문에, 매 기능 추가마다 그때그때 편한 곳에 코드가 안착한 것으로 보인다.

**고칠 수 있는 것 vs 근본적인 것**:
- **고칠 수 있음(코드 레벨 수정)**: HtmlField 새니타이제이션 추가, `simpleCrypt` 폴백 키 제거, `checkAdminMenuPermission` 미설정 시 경고 추가, i18n 우회 지점(SearchForm/Type.ts) 이관, MIGRATION.md 소급 작성, 온보딩 문서에 15개 registry 추가.
- **근본적(아키텍처 재설계 필요)**: 42개 필드 컴포넌트의 렌더 테스트 인프라 신설(XL 규모), 대용량 리스트 가상화 도입(리스트 렌더링 계약 자체 변경), `EntityForm.clone()` 전체 딥클론을 부분 업데이트로 전환(폼 런타임 재설계), 키보드 접근성을 전 컴포넌트에 소급 적용(설계 검토 프로세스 필요), semver 정책 재정립(1.0 승격 여부 의사결정).

이 두 축을 구분해 로드맵을 짜지 않으면, "엔터프라이즈 등급으로 업그레이드"라는 목표는 산발적 패치의 연속이 되어 원 호스트 흔적을 걷어내는 속도보다 새로운 흔적이 쌓이는 속도가 더 빠를 위험이 있다.

---

## 근거 파일 목록 (citations 요약)

- i18n: `src/listgrid/utils/i18n.ts:17-54`, `src/listgrid/form/SearchForm.ts:119-`, `src/listgrid/form/Type.ts:110-113`, `src/listgrid/components/list/ui/HeaderField.tsx:94`
- a11y: `src/listgrid/components/list/ui/CardItem.tsx:471-481`(양호 사례), `src/listgrid/components/list/ui/HeaderField.tsx:58-85`(미비 사례), `src/listgrid/ui/headless.tsx:136-153`(Modal 레퍼런스 결함), `src/listgrid/components/form/ViewTab.tsx:96`
- security: `src/listgrid/components/fields/HtmlField.tsx:28-36`, `src/listgrid/utils/simpleCrypt.ts:9-11`, `src/listgrid/utils/index.ts:11`, `src/listgrid/menu/MenuPermissionChecker.ts:8-39`, `src/listgrid/components/form/hooks/useEntityFormAutoSave.ts:88`
- permissions: `src/listgrid/auth/index.ts`(hasAnyRole), `src/listgrid/auth/AuthContext.tsx:10-12`, `src/listgrid/menu/MenuPermissionChecker.ts:27`, `src/listgrid/view/ViewListGridWrapper.tsx:73-94`
- testing: `map-quality.md` 전체(§2-§6 재확인), `src/listgrid/config/EntityForm.tsx`(clone), CI 로그(902 passed/27 failed/1 todo)
- performance: grep 결과(react-window/react-virtual 부재), `src/listgrid/config/EntityForm.tsx:38-91`, `src/listgrid/components/form/FieldRenderer.tsx:86,250`
- documentation: `docs/getting-started.md:52-63,143-146`, `docs/PRIMITIVES.md`, `map-providers.md` §2 (15개 registry grep)
- migration: `docs/MIGRATION.md`(전체), `CHANGELOG.md:35,198,397`
- browser: `docs/PRIMITIVES.md:259-264`, `.github/workflows/ci.yml`(브라우저 매트릭스 부재)

**심판 수행**: Sonnet 5, 1차 입력(map-quality.md, map-providers.md, map-styles.md) 전체 열람 + 9개 영역 각각 targeted grep/read 재검증 완료. 모든 severity·critical 주장은 실제 파일 열람으로 1차 확인했으며, i18n 노출 정도(§1.3)와 세션 role 체크 제네릭성(§4.1)에 대해서는 맵 보고서보다 더 미묘한(nuanced) 결론으로 조정했다.
