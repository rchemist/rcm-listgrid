> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 서브시스템 지도+비평: 디자인 시스템 (CSS 5-layer + 테마)

대상: `src/listgrid/styles/*.css`, `docs/PRIMITIVES.md`, `src/listgrid/components/list/themes/**`, `src/listgrid/components/form/themes/**`, `src/listgrid/utils/cn.ts`, tailwind-merge 사용처

---

## 1. 요약

CSS 계층(`tokens → primitives → layouts → components → base`, 총 6,938줄)과 React 쪽 `classNames` 슬롯 테마 시스템(`ViewListGridClassNames` / `ViewEntityFormClassNames`, 각 130여 개 옵셔널 키)이 **동시에, 서로 겹치는 책임으로** 존재한다. CSS 레이어 자체는 토큰 설계·프리미티브 문서화 수준이 상용 디자인 시스템에 준할 만큼 잘 되어 있으나, "5-layer"라는 문서상 계약과 실제 CSS 사이에는 검증 가능한 균열(동일 셀렉터 중복 정의로 인한 실제 렌더링 값 불일치, 죽은 코드, 존재하지 않는 `@layer` 언급)이 있다. `tailwind-merge`는 "Tailwind 불필요"를 표방하는 라이브러리의 하드 런타임 의존성으로 남아 있고, 실질적으로는 라이브러리 자체 클래스(`rcm-*`)에는 충돌 해소 효과가 없다. 컨테이너 쿼리는 딱 한 곳(고급검색 그리드)에만 쓰이고 나머지 34개 반응형 브레이크포인트는 전부 뷰포트 미디어 쿼리라서, "어디에나 임베드 가능한 컴포넌트"라는 목표와 실제 반응형 구현 사이에 괴리가 있다.

독립 패키지로 분리하는 장기 비전은 **CSS 레이어만 놓고 보면 이미 거의 준비돼 있다** (외부 의존 없는 순수 CSS, 토큰 오버라이드 계약 문서화 양호). 그러나 `classNames` 테마 시스템은 React 컴포넌트 트리 구조와 강하게 결합되어 있어 CSS만 떼어낼 순 있어도 "테마 시스템"까지 분리하려면 상당한 재설계가 필요하다.

---

## 2. CSS 5-layer 구조 실사

### 2.1 레이어 구성 자체는 명확하게 문서화됨

`src/listgrid/styles/index.css:9-21`
```css
 * This pulls in five cascading layers of declarations:
 *   1. Design tokens (`tokens.css`) — :root CSS variables...
 *   2. Primitives (`primitives.css`) — low-level primitive classes...
 *   3. Layouts (`layouts.css`) — structural composite classes...
 *   4. Components (`components.css`) — residual component-specific styles...
 *   5. Base (`base.css`) — global `:where(.rcm-root)` settings...
```
import 순서도 문서와 일치한다 (`index.css:29-33`: tokens → primitives → layouts → components → base).

### 2.2 문서와 실제가 어긋나는 지점 — `@layer rcm-listgrid`는 존재하지 않는다

`defaultListGridTheme.ts:11`, `defaultTheme.ts:9`(주석), `docs/api/listgrid/variables/defaultListGridTheme.md:20`는 모두 커스터마이즈 경로로 `@layer rcm-listgrid 밖에서 .rcm-button { ... } 재정의`를 언급한다. 그러나 실제 CSS 어디에도 `@layer` 선언이 없다:

```
$ grep -rn "@layer" src/listgrid/styles/*.css
(결과 없음)
```

`base.css:11-13`은 오히려 반대로 명시한다:
```
 * Rules remain unlayered so they beat Tailwind's preflight universal reset.
 * Host apps override by writing CSS AFTER this file loads — plain cascade
 * order handles it without `!important`:
```
즉 실제 설계는 "레이어 없음 + 순수 소스 순서(cascade order) 의존"인데, 테마 파일 3곳의 JSDoc 주석은 지금은 없는 `@layer rcm-listgrid`를 안내하고 있다. 소규모지만 **문서-코드 드리프트**이며, 호스트 개발자가 실제로 없는 `@layer` 경계를 근거로 CSS 우선순위를 설계하면 예상과 다르게 동작한다.

### 2.3 레이어 간 셀렉터 중복 — "override"가 아니라 "충돌하는 재정의"

레이어별 최상위 클래스 셀렉터를 비교하면 동일 이름이 여러 레이어에서 **완전히 재정의**된다:

```
$ for f in primitives layouts components base; do grep -oE "^\.[a-zA-Z0-9_-]+" src/listgrid/styles/$f.css | sort -u; done | sort | uniq -d
.rcm-cursor-pointer  .rcm-field-input  .rcm-grid  .rcm-input-addon  .rcm-input-group
.rcm-modal-body  .rcm-modal-footer  .rcm-panel  .rcm-row  .rcm-stack  .rcm-surface
.rcm-tab-list  .rcm-truncate  .rcm-visually-hidden
```

가장 심각한 사례는 `.rcm-panel`이다:

- `primitives.css:1245-1250` (primitive 정의)
  ```css
  .rcm-panel {
    background: var(--rcm-color-surface);
    border: var(--rcm-border-width) solid var(--rcm-color-border);
    border-radius: var(--rcm-radius-lg);
    padding: var(--rcm-space-lg);
  }
  ```
- `layouts.css:2602-2607` (동일 셀렉터, "layouts loaded AFTER primitives" 규칙에 의해 이 값이 최종 적용됨)
  ```css
  .rcm-panel {
    background: var(--rcm-color-surface);
    border: var(--rcm-border-width) solid var(--rcm-color-border);
    border-radius: var(--rcm-radius-md);
    padding: var(--rcm-space-lg);
  }
  ```

`index.css`의 주석은 "layouts loaded AFTER primitives so composites can override primitive properties"(`index.css:15-16`)라고 정당화하지만, 이건 "합성 컴포넌트가 프리미티브 일부를 의도적으로 오버라이드"하는 게 아니라 **동일 셀렉터를 통째로 다시 선언해 `border-radius: lg`→`md`로 조용히 바뀌는 부작용**이다. `docs/PRIMITIVES.md:39-41`은 `.rcm-panel`의 공개 계약으로 `data-elevation` / `data-padding`만 언급할 뿐 `border-radius`가 레이어에 따라 달라진다는 사실은 어디에도 문서화되어 있지 않다 — 이 문서를 믿고 `.rcm-panel`을 사용하는 외부 소비자는 실제 렌더링되는 `radius-md`가 아니라 `primitives.css`에 쓰인 `radius-lg`를 기대하게 된다.

`.rcm-row`(`primitives.css:29-34` vs `layouts.css:20-25`)는 완전히 동일한 값이라 렌더링 버그는 아니지만 **순수한 죽은 코드/중복**이다. `.rcm-trutruncate`(`primitives.css:1520-1524` vs `base.css:103-107`), `.rcm-visually-hidden`(`primitives.css:1508-1517`, `!important` 포함 vs `base.css:87-96`, `!important` 없음)도 동일 패턴 — 후자(base.css)는 `!important`가 없어 항상 primitives.css 쪽이 이기므로 **base.css 버전은 100% 도달 불가능한 죽은 규칙**이다.

`components.css:1-8`, `base.css:1-3`의 주석("Phase 7 split")이 원인을 설명해 준다 — 원래 한 덩어리였던 CSS를 5개 파일로 기계적으로 쪼갠 리팩터였고, 쪼갠 뒤 중복 제거(dedup) 패스를 거치지 않았다. **"5-layer 디자인 시스템"이라는 표현이 함의하는 의도적 계층 설계라기보다, 사후적으로 파일만 나눈 흔적**이라는 근거다.

### 2.4 primitives.css는 실제로 잘 조직되어 있다 (긍정 평가)

`primitives.css`는 8개 번호 섹션으로 명확히 구획되어 있다:
```
26:     * 1. Layout primitives
211:     * 2. Text primitives
335:     * 3. Button primitives
614:     * 4. Input primitives
899:     * 5. Display primitives
1242:     * 6. Surface variants
1375:     * 7. Navigation primitives
1505:     * 8. Utility primitives
```
`docs/PRIMITIVES.md`도 이 구조와 1:1 대응하며 각 프리미티브의 `data-*` 계약을 표로 정리해 두었다(`docs/PRIMITIVES.md:12-192`) — 이 부분은 실제로 상용 디자인 시스템 문서 수준이다. 클래스 이름 접두사 `rcm-`도 전수 검사 결과 예외 없이 지켜지고 있다 (최상위 클래스 셀렉터 중 `rcm-` 없이 시작하는 것은 0건).

### 2.5 layouts.css는 "구조적 합성 클래스"가 아니라 사실상 덤핑 그라운드

`layouts.css`(3,209줄)는 4개 CSS 파일 중 가장 크며, `primitives.css`(1,564줄)처럼 번호 섹션 구획이 없고 `/* ---- */` 형태의 24개 구획 주석만 있다(`grep "^/\* --" layouts.css` → 24건, 섹션 제목 없이 나열). 신규 기능(고급검색, 데이터 임포트, 우선순위 D&D 등) 대부분이 이 파일에 계속 추가돼 온 것으로 보이며, "구조적 합성"이라는 명목적 책임과 달리 실질적으로는 "primitives도 아니고 component도 아닌 모든 것"이 들어가는 캐치올 파일이 됐다.

### 2.6 다크 모드

`tokens.css`는 세 가지 다크 모드 경로를 모두 구현한다: `@media (prefers-color-scheme: dark)`(`tokens.css:134-159`), `[data-theme='dark']` 명시적 오버라이드(`tokens.css:163-186`), `[data-theme='light']` 강제 라이트(`tokens.css:193-218`). 세 블록이 표면/텍스트/보더/그림자 토큰만 뒤집고 브랜드 컬러(primary/secondary/success/warning/error/info)는 그대로 두는 정책도 `tokens.css:125-132`, `docs/PRIMITIVES.md:227`에 일관되게 문서화되어 있다. 세 블록의 실제 값도 서로 정확히 일치한다(라이트/다크 각각). **이 부분은 설계와 구현이 정확히 일치하는, 이 서브시스템에서 가장 견고한 부분이다.**

단, 브랜드 컬러가 다크에서 그대로 유지되는 정책은 실사용 시 대비(contrast) 문제를 야기할 수 있다 — 예를 들어 `--rcm-color-secondary-surface: #ebe4f7`(라이트 전용 밝은 배경, `tokens.css:52`)가 다크 모드 오버라이드 목록(`tokens.css:134-158`, `163-186`)에 전혀 포함되지 않아, 다크 테마에서도 밝은 라벤더색 배경이 어두운 표면 위에 그대로 남는다. 실제로 `#805dca` 위 흰 텍스트, 어두운 배경 위 `#ebe4f7` 밝은 서페이스가 공존하는 부조화가 코드상 확인된다(`tokens.css:50-53` vs 다크 오버라이드 블록에 secondary 토큰 부재). 문서(`PRIMITIVES.md:227`)는 이를 "의도된 정책"이라 명시하므로 버그는 아니지만, 커머셜 등급을 노린다면 다크 대비 커버리지가 완전하지 않다는 점은 실사용 검증이 필요하다.

### 2.7 컨테이너 쿼리 — 사실상 실험적 부분 도입 수준

컨테이너 쿼리는 리포 전체에서 단 3줄뿐이다:
```
layouts.css:857:  container-type: inline-size;
layouts.css:999:@container rcm-adv-search (min-width: 640px) {
layouts.css:1005:@container rcm-adv-search (min-width: 1200px) {
```
용도는 고급검색 필드 그리드 하나(`.rcm-adv-search-grid`, `layouts.css:988-1009`)뿐이며, 주석(`layouts.css:995-998`)은 "모달/팝업처럼 좁은 컨테이너에서는 뷰포트가 넓어도 2열까지만"이라는 정확한 문제의식을 담고 있어 **설계 의도 자체는 옳다**. 문제는 이 문제의식이 이 한 군데에만 적용됐다는 점이다. 나머지 반응형 분기 34곳은 전부 `@media (min-width: ...)` 뷰포트 쿼리다:
```
$ grep -n "@media" src/listgrid/styles/*.css | wc -l
34
```
예를 들어 `layouts.css:1835`, `1842`, `2037` 등 테이블/폼 반응형 레이아웃 대부분이 뷰포트 기준이다. 그러나 이 라이브러리의 핵심 컴포넌트(`ViewListGrid`의 SubCollection, `ViewEntityForm`의 `ManyToOneField`/`SubCollectionField` 재귀 렌더)는 정의상 **부모 폼/모달/사이드바 안에 임베드되는** 용도이며, 뷰포트 너비가 넓어도 실제 렌더 컨테이너는 좁을 수 있는 시나리오가 정확히 이 라이브러리의 주력 사용처다. 즉 "컨테이너 쿼리가 필요하다"는 것을 스스로 증명해 놓고(`layouts.css:995-998`의 주석) 나머지 33군데는 그 교훈을 적용하지 않은 상태 — 서브콜렉션 테이블이나 모달 내부 폼이 좁은 컨테이너에서도 데스크톱 브레이크포인트의 넓은 레이아웃으로 렌더링될 위험이 실재한다.

---

## 3. classNames 테마 시스템 vs CSS 레이어 — 두 개의 경쟁하는 테마 메커니즘

`docs/PRIMITIVES.md:195-253`는 스타일 커스터마이즈 경로를 4가지로 제시한다: (1) 토큰 오버라이드, (2) `.rcm-button {...}` CSS 재정의, (3) `classNames` prop, (4) 테마 객체 전체 교체. 이 중 (1)(2)는 순수 CSS 레이어 메커니즘이고, (3)(4)는 React Context 기반 별도 시스템이다. 실제로 이 둘은 **같은 문제(변형/variant 스타일링)를 두 가지 다른 기술로 병행 해결**하고 있다.

### 3.1 variant 테마가 실제로 하는 일은 rcm-* 클래스 문자열 스와핑뿐

`ListGridThemeContext.tsx:57-71`의 `getVariantTheme`은 `variant` prop(`main`/`subCollection`/`modal`)에 따라 `Partial<ViewListGridClassNames>` 객체를 골라 `deepMerge`한다(`ListGridThemeContext.tsx:21-52`, `122-135`). 그런데 각 variant 프리셋을 열어 보면 전부 `rcm-*` CSS 클래스 이름 문자열만 조합해 반환한다:

`subCollectionTheme.ts:9-15`
```ts
export const subCollectionListGridTheme: Partial<ViewListGridClassNames> = {
  panel: {
    container: 'rcm-panel rcm-panel-muted rcm-panel-compact',
    ...
  },
  header: {
    container: 'rcm-visually-hidden',
    ...
  },
```
`mainTheme.ts:9-15`, `modalTheme.ts:9-15`도 동일 패턴 — `rcm-listgrid-panel-main`, `rcm-panel-muted`, `rcm-panel-compact` 등은 전부 이미 `layouts.css`/`components.css`에 정의된 CSS 클래스다(`layouts.css:1745`, `1754`, `2609`, `components.css:1363`). 즉 이 "테마 변형 시스템"은 실질적으로 **`variant` prop → CSS 클래스 이름 매핑 테이블**이며, 이 자체는 CSS만으로도(예: `data-variant="subCollection"` 같은 data-attr 하나로) 표현 가능한 것을 79~193줄짜리 `deepMerge` 로직 + React Context + `useMemo` + 130여 개 키를 가진 타입(`ViewListGridTheme.types.ts` 398줄, `ViewEntityFormTheme.types.ts` 556줄)으로 감싸 놓았다. CSS 프리미티브의 `data-*` 컨벤션(문서상 "일관된 계약"이라고 광고하는 바로 그 컨벤션, `docs/PRIMITIVES.md:7`)과 React 쪽 `classNames` 슬롯 API가 **서로 다른 확장 축**으로 병존하는 셈이다 — 신규 기여자는 "이 컴포넌트를 커스터마이징하려면 CSS data-attr을 볼까, classNames 슬롯을 볼까, variant 테마 프리셋을 볼까"를 매번 판단해야 한다.

### 3.2 슬롯 API 적용이 컴포넌트마다 일관되지 않음

컨텍스트가 노출하는 `cn(base, custom)` 병합 함수(`ListGridThemeContext.tsx:77-81`, `139-142`)를 실제로 쓰는 컴포넌트가 있는가 하면:

`ViewFieldGroup.tsx:212`
```ts
: cn('rcm-fieldgroup', classNames.fieldGroup?.container);
```

정반대로 컨텍스트 `cn`을 아예 구조 분해하지 않고 `??` 폴백만 쓰는 컴포넌트도 있다:

`ListGridHeader.tsx:28,35,37`
```ts
const { classNames: themeClasses } = useListGridTheme();
...
<div className={themeClasses.header?.container ?? 'rcm-listgrid-header'}>
...
<div className={themeClasses.header?.buttonGroup ?? 'rcm-listgrid-button-group'}>
```
`CreateButton.tsx:30`도 동일 패턴(`themeClasses.subCollectionButtons?.deleteButton ?? 'rcm-button'`). 이 두 패턴은 실제로 다른 동작을 낳는다 — `cn()` 경로는 `classNames` prop으로 넘어온 커스텀 값과 base 클래스를 **합성**하지만, `??` 폴백 경로는 테마에 값이 있으면 그 값을 **완전히 대체**하고 base 클래스(`rcm-listgrid-header` 등)는 버린다. 즉 `ListGridThemeProvider`로 `header.container: 'my-class'`를 주입하면, `cn()`을 쓰는 컴포넌트는 `rcm-listgrid-header my-class`가 되지만 `ListGridHeader`처럼 `??` 폴백을 쓰는 컴포넌트는 `my-class`만 남고 원래 `rcm-listgrid-header`(레이아웃/스타일 기반 클래스)가 사라져 레이아웃이 깨질 수 있다. 13개 파일이 `useListGridTheme`을 쓰는데 그중 최소 2곳(`ListGridHeader.tsx`, `CreateButton.tsx`)이 이 계약을 위반한다 — 슬롯 API의 "일관된 합성 시맨틱"이 실제로는 컴포넌트별로 다르다.

### 3.3 슬롯 표면적이 과도하게 큼

```
$ grep -c "?:" ViewListGridTheme.types.ts ViewEntityFormTheme.types.ts
134  134
```
두 타입 정의 파일 합쳐 268개의 옵셔널 슬롯 키(`ViewListGridTheme.types.ts` 398줄, `ViewEntityFormTheme.types.ts` 556줄). 세밀한 제어라는 장점은 있지만, 컴포넌트 내부 구조가 바뀔 때마다(예: `ViewEntityForm`이 자식 컴포넌트를 리네임/재배치하면) 이 슬롯 맵과 타입, 4개의 variant 프리셋, `docs/api/**`의 typedoc 산출물까지 전부 동기화해야 하는 유지보수 비용이 크다. 실제로 이미 드리프트 사례(2.2절의 `@layer rcm-listgrid` 주석)가 존재한다.

---

## 4. `cn.ts` / tailwind-merge 하드 의존성

`utils/cn.ts:1-16`
```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
...
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};
```
`package.json:115-121`에서 `tailwind-merge`는 `peerDependencies`가 아니라 **일반 `dependencies`**로 선언돼 있다 — Tailwind 자체는 어디에도 peer/dependency로 선언돼 있지 않은데(`package.json:122-141` 전체 peerDependencies 목록에 tailwindcss 없음), tailwind-merge만 하드 의존성으로 번들에 포함된다.

실사용 패턴을 보면 `cn`은 리포 전체에서 딱 6개 파일에서만 직접 import된다(`grep -rl "utils/cn'" src/listgrid` → 6건: `index.ts`, `ClosePopupButton.tsx`, `DeleteButton.tsx`, `ListButton.tsx`, `EntityFormThemeContext.tsx`, `ListGridThemeContext.tsx`) 그리고 이 두 테마 컨텍스트가 각 컴포넌트에 `cn` 함수를 재노출해 실제 호출 지점은 훨씬 많다. 그런데 `cn()`에 넘기는 base 클래스는 거의 전부 `rcm-*`(예: `cn('rcm-button', buttonClassNames?.close)` — `ClosePopupButton.tsx:15`, `cn('rcm-fieldgroup', ...)` — `ViewFieldGroup.tsx:212`)이며, `tailwind-merge`는 `p-4 p-2`처럼 실제 Tailwind 유틸리티 클래스 이름 패턴을 인식해 충돌을 해소하는 라이브러리다. `rcm-*` 클래스는 tailwind-merge가 인식하는 어떤 클래스 그룹에도 속하지 않으므로, **base가 `rcm-*`인 한 twMerge는 사실상 `clsx`와 동일하게(충돌 해소 없이 단순 연결) 동작한다** — 실질 효과가 있는 유일한 경우는 호스트가 `classNames` prop으로 실제 Tailwind 유틸리티 클래스(`mt-8`, `p-2` 등, `defaultListGridTheme.ts` 자체 주석 예시 `ListGridThemeContext.tsx:110` 참고)를 넘겨 서로 충돌할 때뿐이다.

결론적으로 "Tailwind 불필요"를 표방하는 라이브러리(`docs/PRIMITIVES.md:3`: "host apps can build with these primitives alone (no Tailwind required)", `defaultListGridTheme.ts:7`: "호스트의 Tailwind/shadcn/HeroUI 설정과 무관하게 동작") 임에도, Tailwind를 전혀 쓰지 않는 소비자도 `tailwind-merge`(gzip 수 KB, 파싱에 필요한 Tailwind 클래스명 테이블 포함)를 런타임에 반드시 로드하게 된다. 트리셰이킹으로 완화될 여지는 있으나 `cn`이 라이브러리 곳곳(테마 컨텍스트 2곳 포함)에서 호출되는 한 사실상 항상 번들에 포함된다. 독립 디자인 시스템 패키지로 분리한다는 장기 비전과도 마찰이 있다 — "프레임워크 프리"를 내세우면서 Tailwind 생태계 전용 유틸리티를 하드 의존시키는 것은 포지셔닝 모순이다.

---

## 5. 독립 디자인 시스템 추출 가능성 평가

**CSS 레이어만 놓고 보면 실현 가능성이 높다.** 근거:
- 외부 CSS 프레임워크 의존 없음 (Tailwind/PostCSS 플러그인 불필요, 순수 CSS 커스텀 프로퍼티 + `color-mix()` + 컨테이너 쿼리만 사용, `docs/PRIMITIVES.md:257-264`에 브라우저 지원 범위까지 명시).
- `rcm-` 접두사 규율이 100% 준수됨 (leak 0건).
- 토큰 계약이 명확하고 다크모드가 정확히 구현됨.
- 빌드 스크립트가 이미 CSS를 별도 산출물로 합치고 있음(`package.json:102`: `build:styles`가 5개 CSS를 `dist/styles.css`로 concat).

**그러나 실제로 분리하려면 다음을 먼저 해결해야 한다:**
1. 2.3절의 레이어 간 중복/충돌 셀렉터 정리 — 지금 분리하면 버그(`.rcm-panel` radius 불일치 등)를 그대로 별도 패키지에 고정하게 된다.
2. `layouts.css`가 실질적으로 "합성 레이아웃"과 "컴포넌트별 특수 스타일"을 뒤섞은 덤핑 그라운드이므로, 분리 전에 `components.css`와의 책임 재划정이 필요하다.
3. `classNames` 테마 시스템(3장)은 React 컴포넌트 트리 구조에 강결합돼 있어 CSS 패키지만으로는 분리되지 않는다 — "디자인 시스템 = CSS + 테마"라는 프레임에서 후자는 이 라이브러리의 리스트/폼 컴포넌트 트리 자체와 함께 이동해야 하므로, 독립 디자인 시스템(예: 다른 프로젝트의 리스트/폼이 아닌 곳)에서 재사용하려면 슬롯 타입 268개를 다시 설계해야 함.
4. `tailwind-merge` 하드 의존성(4장)은 "프레임워크 프리 디자인 시스템"이라는 브랜드와 상충하므로 분리 시점에 peerDependency 전환 또는 제거를 검토해야 한다.

즉 **CSS 자체는 8부 능선을 이미 넘었지만, "테마 시스템까지 포함한 디자인 시스템"을 분리하려면 React 결합을 끊는 재설계가 필요**하다는 것이 정확한 평가다.

---

## 6. 근거 목록 (citations)

- `src/listgrid/styles/index.css:9-33` — 5-layer 순서/철학 주석과 실제 import 순서
- `src/listgrid/styles/base.css:11-21` — "unlayered" 명시적 설계 결정, `@layer` 부재의 이유
- `src/listgrid/styles/primitives.css:1245-1276` vs `src/listgrid/styles/layouts.css:2599-2614` — `.rcm-panel` 중복/충돌 정의 (border-radius lg→md)
- `src/listgrid/styles/primitives.css:29-34` vs `src/listgrid/styles/layouts.css:15-25` — `.rcm-row` 중복(죽은 코드)
- `src/listgrid/styles/primitives.css:1508-1524` vs `src/listgrid/styles/base.css:87-107` — `.rcm-visually-hidden`/`.rcm-truncate` 중복, base.css 쪽 도달 불가
- `src/listgrid/components/list/themes/defaultListGridTheme.ts:11`, `src/listgrid/components/form/themes/defaultTheme.ts:9`, `docs/api/listgrid/variables/defaultListGridTheme.md:20` — 존재하지 않는 `@layer rcm-listgrid` 언급
- `src/listgrid/styles/layouts.css:843-1009` — 컨테이너 쿼리 유일 사용처, 문제의식 자체는 타당
- `src/listgrid/styles/*.css` (`grep "@media"` 34건) — 뷰포트 기준 반응형이 지배적
- `src/listgrid/styles/tokens.css:20-218` — 토큰/다크모드 3-way 구현, 견고함의 근거
- `src/listgrid/styles/tokens.css:50-53` vs `134-186` — secondary surface 토큰이 다크 오버라이드에서 누락
- `src/listgrid/components/list/context/ListGridThemeContext.tsx:21-71,122-148` — deepMerge + variant 프리셋 메커니즘
- `src/listgrid/components/list/themes/variants/subCollectionTheme.ts:9-15`, `mainTheme.ts:9-15`, `modalTheme.ts:9-15` — variant 테마가 CSS 클래스 문자열 매핑에 불과함
- `src/listgrid/components/form/ViewFieldGroup.tsx:212` vs `src/listgrid/components/list/ListGridHeader.tsx:28,35,37`, `src/listgrid/components/list/ui/buttons/CreateButton.tsx:30` — `cn()` 병합 vs `??` 대체, 슬롯 API 비일관성
- `src/listgrid/components/list/types/ViewListGridTheme.types.ts`(398줄, 134개 옵셔널 키), `src/listgrid/components/form/types/ViewEntityFormTheme.types.ts`(556줄, 134개 옵셔널 키) — 슬롯 API 표면적 과다
- `src/listgrid/utils/cn.ts:1-16` — tailwind-merge 하드 의존
- `package.json:115-121` (dependencies) vs `122-141` (peerDependencies, tailwindcss 부재) — "Tailwind 불필요" 주장과 배치되는 의존성 배치
- `docs/PRIMITIVES.md:3,257-264` — 공개 계약 문서(대체로 정확하고 잘 작성됨), 브라우저 지원 명시
- `src/listgrid/styles/components.css:1-8`, `src/listgrid/styles/base.css:1-3` — "Phase 7 split" 기계적 분할 이력, dedup 미수행의 정황 증거

---

## 7. 종합 판정

- **강점**: 토큰 설계, 다크모드 3-way 구현, `rcm-` 네이밍 규율 100% 준수, `primitives.css`의 8-섹션 문서화 품질, `docs/PRIMITIVES.md`의 공개 계약 문서화 수준 — 이 네 가지는 실제로 상용 수준이라 평가할 수 있다.
- **구조적 결함**: "5-layer"는 설계 다이어그램상으로만 깨끗하고, 실제로는 최소 4개 셀렉터가 레이어 경계를 넘어 충돌·중복 정의되어 있으며 그중 하나(`.rcm-panel`)는 실제 렌더링 값이 문서와 다르다. `layouts.css`는 이름과 달리 컴포넌트별 특수 스타일까지 흡수한 덤핑 그라운드다.
- **아키텍처 중복**: CSS `data-*` variant 컨벤션과 React `classNames` 슬롯 테마가 같은 문제(컴포넌트 변형)를 두 축으로 풀고 있고, variant 테마 프리셋 3종은 실질적으로 CSS 클래스 이름 매핑표에 불과한데 이를 위해 deepMerge/Context/268개 슬롯 타입이라는 무거운 인프라가 존재한다.
- **포지셔닝 모순**: "Tailwind 불필요"를 표방하면서 `tailwind-merge`를 하드 dependency로 강제하고, 정작 Tailwind 클래스가 아닌 `rcm-*` 클래스에는 그 라이브러리의 핵심 기능(충돌 해소)이 작동하지 않는다.
- **독립 추출 가능성**: CSS 레이어 단독으로는 실현 가능성이 높음(8부 능선). 테마 시스템까지 포함하려면 React 결합을 끊는 재설계가 선행돼야 한다.
