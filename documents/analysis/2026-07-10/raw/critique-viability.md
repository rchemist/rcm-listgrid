> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 제품 가치·상용화 판정 — `@rchemist/listgrid` v0.3.25

> 차원 심사관(제품/상용화) 최종 보고. 입력: 시장분석(`undefined/market.md`), 10개 서브시스템 지도, README/ROADMAP 비전. 지도 요약을 그대로 집계하지 않고, 판정에 결정적인 코드는 직접 재검증했다(재검증 항목은 §6에 표기).

---

## 0. 최종 판정 (먼저 결론)

**판정: 조건부 GO = PIVOT.** "범용 상용 CRUD 엔진(react-admin/Refine 대항마)"을 목표로 하면 **NO-GO**에 가깝다. 그러나 스코프를 좁힌 **(내부 플랫폼 표준) + (한국·규제산업 니치 OSS)** 하이브리드로 재정의하면 **GO** 할 수 있는 실재 가치가 있다.

한 줄 요약: **엔지니어링 자산은 진짜지만, "지금 이대로 npm에서 아무나 설치해 쓰는 범용 라이브러리"라는 표방은 사실이 아니다.** 표방과 현실의 간극이 상용화의 핵심 리스크다.

세 가지 근거 축:
1. **소비 가능성 자체가 깨져 있다** — 배포된 패키지는 순수 Node에서 `require`도 `import`도 실패한다(§6-A, 재현 확인). "framework-free"를 표방하지만 실제로는 "번들러를 쓰는 React 프로젝트에서만 우연히 동작"한다.
2. **호스트 결합은 '대부분' 제거됐으나 '완전히'는 아니다** — RuntimeConfig detox/optional peer 분리는 진짜 잘 됐지만(칭찬), 도메인 리터럴 잔재가 코어에 남아 "새 프로젝트를 원 호스트 아키텍처로 강제한다"는 불만은 **부분적으로 참**이다.
3. **시장 공백은 실재하나 얕고 방어 곤란** — market.md의 결론(§4)대로 범용 시장에서 react-admin/Refine을 정면으로 이기는 그림은 비현실적이다. 승산은 좁은 니치 3곳뿐이다.

---

## 1. 세 가지 비전(ROADMAP 장기비전)의 실현 가능성

`docs/ROADMAP.md:32-36`이 선언한 세 목표를 각각 "현재 위치 / 남은 거리 / 판정"으로 채점한다.

### 1.1 Framework-free CRUD 엔진 — **판정: 절반 달성, "framework-free"는 아직 마케팅 문구**

**긍정 (진짜 잘 된 부분):**
- Provider 4종(Auth/UI/Router/UrlState)과 registry 싱글턴(RuntimeConfig)이 실제로 프레임워크 독립적으로 설계됐다. `RouterProvider`/`UrlStateProvider`는 Next 외 어댑터를 짜기 쉬운 최소 인터페이스다(map-providers strengths).
- 무거운 peer(kakao-map, xlsx, sweetalert2, nuqs, next)는 **전부 `optional: true` peer로 정확히 분리**됐다(§6-B 재검증: `react-kakao-maps-sdk`/`react-daum-postcode`/`xlsx-js-style`/`sweetalert2` 모두 `peerDependenciesMeta.optional=true`). 즉 map-fields.md의 "Kakao/Daum이 필수 하드 의존(critical)"이라는 스멜은 **현재 코드 기준 틀렸다** — 패키징 detox가 이미 고쳤다. 심사관으로서 이 점은 바로잡는다.

**부정 (표방을 무너뜨리는 부분):**
- **배포 산출물이 순수 Node에서 로드 불가.** `package.json`에 최상위 `"type"` 필드가 없는데(`"type":"git"`은 repository 필드), `dist/index.js:3`이 `export * from './listgrid'`(확장자 없는 배럴 ESM)를 방출한다. 재현: `require`/`import` 모두 `ERR_UNSUPPORTED_DIR_IMPORT`(§6-A). "어디에 떨어져도 동작하는 단일 엔진"이라는 ROADMAP:34 문구와 정면 배치.
- **Tailwind가 문서화되지 않은 암묵 의존.** `package.json` 어디에도 tailwindcss 선언이 없는데(§6-B 재검증) `common/func.ts`가 런타임에 Tailwind 유틸 클래스를 조립한다(map-aux). README:3은 "No Tailwind required"라고 명시 — 이 주장은 부분적으로 거짓.
- **아이콘 라이브러리 2개(@tabler 44곳 + @iconify 4곳)를 동시 필수 peer로 강제**(map-packaging). "framework-free"치고 의존 표면이 크다.

**남은 거리:** 낮음~중간. `exports`에 `require`/`import` 조건 분리 + `.js` 확장자 방출(또는 `"type":"module"`) + CI import 스모크 테스트만 추가하면 소비 가능성 결함은 해소된다. 이건 **1~2주 작업**이고 반드시 v1.0 이전에 끝나야 한다. Tailwind 의존은 명시하거나 제거해야 표방과 일치한다.

### 1.2 Backend adapter 다변화(REST/GraphQL/tRPC/DRF) — **판정: 경계는 있으나 '얇은 어댑터'라는 표현은 낙관적**

- 주입 지점(`ApiClient.callExternalHttpRequest`)은 존재하고 문서화도 모범적이다(§6-D: envelope 계약 위반 실패모드를 JSDoc에 구체 예제로 남김).
- 그러나 소비자 코드가 **응답 shape의 특정 키(`response.data.list` / `.content` / `.searchForm`)를 하드코딩**해서 역참조한다(`ApiClient.ts:33-37` JSDoc이 이를 명시). 즉 "generic REST/GraphQL/tRPC 지원"은 어댑터가 **모든 백엔드 응답을 이 3-키 형태로 정규화해 넣어줘야** 성립한다. 진짜 어댑터 계층이 아니라 "호스트가 RCM envelope 모양으로 데이터를 빚어 넣어라"는 계약이다.
- 검색조건 왕복(`SearchForm.toJSON()`)도 특정 백엔드 400 에러를 근거로 다듬어진 흔적(map-list strengths) — 즉 서버 계약이 코드에 배어 있다.

**남은 거리:** 중간. ApiClient 위에 진짜 정규화 어댑터(response→{items,total,filters} 표준형)를 얹고, 소비자 측의 `.list/.content/.searchForm` 직접 참조를 그 표준형으로 갈아끼워야 한다. **"얇은 layer"가 아니라 소비 지점 전수 리팩터.**

### 1.3 Design system 독립 추출(`@rchemist/primitives`) — **판정: 세 비전 중 가장 실현 가능. CSS만 놓으면 거의 준비됨**

- CSS 5-layer(tokens→primitives→layouts→components→base, 6,938줄)는 외부 의존 없는 순수 CSS이고 토큰 오버라이드 계약 문서화가 상용 디자인시스템급이다(map-styles). 서브패스 export도 이미 있다.
- **단, 두 가지 균열:** (1) 문서가 언급하는 `@layer rcm-listgrid`가 실제 CSS에 존재하지 않는다(map-styles: `grep @layer` 0건) — 커스터마이즈 가이드가 허구. (2) `classNames` 테마 시스템(각 130여 키)은 React 트리에 강결합돼 CSS만 떼도 "테마 시스템"까지는 못 딸려온다.
- 컨테이너 쿼리는 **딱 1곳**에만 쓰이고 나머지 34개는 뷰포트 미디어쿼리(map-styles) — README:3의 "container-query responsive layouts" 표방과 실제의 괴리.

**남은 거리:** 낮음(CSS 코어만), 중간(테마 시스템 포함). 세 비전 중 **가장 빠르게 독립 가치를 낼 수 있는 후보** — 오히려 이걸 먼저 분리해 독립 배포하는 게 전략적일 수 있다.

**세 비전 종합:** 셋 다 "달성 가능"하지만 셋 다 "아직 안 됐고, 표방은 이미 다 됐다고 말한다." 이 **표방-현실 간극이 상용 신뢰도의 최대 적**이다. README/ROADMAP은 열망을 현재형으로 서술한다.

---

## 2. 진짜 차별점 스트레스 테스트

market.md §2 표는 "선언 하나로 리스트+폼+서브컬렉션+리비전+엑셀 한 번에"를 유일 공백으로 지목한다. 후보 4개를 회의적으로 압박한다.

### 후보 A — 깊은 중첩 서브컬렉션 인라인 편집: **가장 방어 가능한 실 차별점 (조건부)**
- react-admin은 트리/인라인 편집을 유료 EE로만 푼다(market.md 1.1). Refine은 조립 비용이 남는다(1.2). **이걸 OSS 기본값으로 주는 건 실재 우위.**
- 그러나 **구현 건강성이 이 우위를 갉아먹는다:** SubCollectionField 3변형(Card/Table/Inline)이 300줄 규모 보일러플레이트를 글자 그대로 복붙(map-core high), SubCollectionField에는 **권한 체크 자체가 미구현**(map-core high). 폼 런타임은 필드 하나 바뀌어도 `EntityForm.clone()`이 전체 폼을 딥클론(map-form critical) + 비활성 탭까지 항상 mount(critical) → 깊은 중첩일수록 리렌더 폭발. 즉 **차별 기능이 곧 성능·유지보수 부채의 진원지.** "깊은 서브컬렉션"을 세일즈 포인트로 내세우려면 이 코어를 먼저 재설계해야 한다.

### 후보 B — UI킷 비의존 프리미티브 계약: **개념은 진짜, 온보딩 비용이 해자를 무력화**
- Refine이 이미 다중 UI킷을, shadcn-admin-kit이 신흥으로 UI-agnostic을 실현 중(market.md 1.2, 1.8). **개념적 신규성은 없다.**
- listgrid의 각도는 "임의 사내 디자인시스템에 붙는 ~50 프리미티브 계약." 그러나 `UIProvider` 65개 필드 중 옵셔널 2개뿐(map-providers) — 일부 기능만 쓰려는 채택자도 전 표면을 채워야 한다. **reference adapter(headless-tailwind)가 아직 미출하**(ROADMAP:9 "다음 마일스톤")라 "설치 후 바로 실행"이 불가. 차별점이 실증되지 않은 상태.

### 후보 C — 한국시장 필드: **좁지만 유일하게 '경쟁자 부재'가 확실한 틈**
- 카카오맵/다음우편번호 기본 내장 어드민 엔진은 글로벌 OSS에 사실상 전무(market.md §3-1). **방어 가능하나 시장이 작다** — 국내 SI/사내시스템 한정.
- 리스크: 이 필드들이 이미 optional 서브패스로 잘 분리돼 있어(§6-B) 오히려 "차별점"이 아니라 "곁가지 옵션"으로 취급되고 있다. 니치를 노린다면 이걸 **1급 세일즈 포인트로 승격**해야 한다.

### 후보 D — RCM 백엔드 수직 플랫폼 심비오시스: **가장 현실적 가치, 그러나 "상용 라이브러리"와는 다른 게임**
- 도메인 리터럴이 코어에 박혀 있다는 사실(SelectField ENROLLED/GRADUATED/EXPELLED 색상맵 §6-C 재검증, Preset.tsx의 CMS/이커머스 프리셋, RevisionField의 특정 리비전 스키마 전제, 배럴에 새는 AdjustmentTypes/SeoMetadataFields/DeviceTypes — map-api-surface)은 **범용 라이브러리로는 결함이지만, 원 호스트와의 수직 통합 자산으로는 강점**이다.
- 즉 "RCM 계열 백오피스를 초고속으로 찍어내는 사내 엔진"으로서의 가치는 **이미 실증된 것에 가깝다**(원 서비스에서 추출됨). 차별점이라기보다 **내부 생산성 자산**.

**차별점 종합:** market.md가 지목한 "조합의 유일성"은 맞지만, 그 조합의 **핵심(서브컬렉션·리비전)이 구현 품질·범용성에서 가장 약한 곳**이라는 게 뼈아프다. 진짜로 방어 가능한 건 후보 C(한국)와 D(수직 심비오시스)이고, 둘 다 "글로벌 범용 OSS"가 아니라 **좁은 수직·지역 시장**을 가리킨다.

---

## 3. 상용화 경로 랭킹 (effort-to-credibility)

market.md §4의 A/B/C/D를 코드 실태에 비춰 재평가한다. "credibility"는 "그 경로가 신뢰를 얻기까지 필요한 최소 엔지니어링 완성도."

| 순위 | 경로 | 노력→신뢰도 | 심사관 판단 |
|---|---|---|---|
| **1** | **(C) 내부 플랫폼 표준 + 채용 브랜딩** | **낮음** — 결합을 억지로 끊을 필요 없음. 지금 상태로도 사내 가치 실현 중 | 리스크 최저·ROI 즉시. 도메인 결합(§2-D)이 오히려 자산. **여기서 시작하는 게 정론.** |
| **2** | **(A) OSS + 한국·규제산업 구축/지원 용역** | **중간** — §1.1 소비결함 + §2-A 코어 재설계가 선결. 레퍼런스 고객=기존 RCM 고객사 전환이 가장 빠른 유료 첫걸음 | market.md 종합판단과 일치. 순수 OSS 자발 유료전환은 낮으니 **용역 매출**이 현실적 초기 수익. |
| **3** | **(B) Open-core / dual-license (react-admin식)** | **높음** — 커뮤니티 규모 격차(스타 2만~3만 vs 0) + 무엇을 유료벽에 둘지 재설계 + 무료판 단독 실사용 가능성 확보 필요 | 당장은 승산 낮음. 유료화하려면 리비전/감사로그/실시간/AI 입력 같은 **신규 부가모듈**을 만들어야지, 기존 무료 기능을 되무료화하면 반발만. **12~18개월 후 옵션.** |
| **4** | **(D) 로우코드 SaaS 피벗** | **비현실적** — Retool/Refine(YC) 자본과 경쟁 | market.md대로 **권장 안 함.** |

**권장 시퀀스:** (C)로 자산화하며 소비결함(§1.1)과 코어 재설계(§2-A)를 갚는다 → 그 과정에서 나온 안정판으로 (A) 니치 OSS(한국+규제산업 딥 서브컬렉션/리비전)를 띄운다 → 커뮤니티가 임계점을 넘으면 (B) 부가모듈 유료화를 검토. **(A)+(C) 하이브리드가 결론이고, 이는 market.md §4 종합판단과 독립적으로 수렴한다.**

---

## 4. "상업적 무가치" 시나리오 — 언제 이게 참인가

다음 조건이 **동시에** 성립하면 이 코드베이스는 상업적으로 무가치하다(냉정하게):

1. **소비 결함을 안 고친다** — `require`/`import` 실패(§6-A)가 남으면 "누구나 npm install해서 쓴다"가 영원히 거짓이라, OSS 신뢰(A/B)의 전제가 무너진다. 이건 협상 불가 선결조건.
2. **코어 재설계를 안 한다** — clone 전체 딥클론(map-form critical) + 비활성탭 상시 mount + 213개 순환의존(§6-E 재검증: config↔fields 213건)이 남으면, 유일 차별점(깊은 서브컬렉션)이 실사용 규모에서 성능·유지보수로 붕괴한다. 파셜 재사용·tree-shaking도 구조적으로 막혀 "가벼운 라이브러리" 주장 불가.
3. **니치를 안 좁힌다** — 범용 react-admin 대항마로 남으면(market.md §2 표: 생태계·문서·플러그인 격차 "압도적") 성숙도 격차에 그대로 짓눌린다.
4. **품질 게이트가 허위다** — 커버리지 ~17%에서 임계치가 "현 baseline 유지"용으로만 설정(map-packaging/quality), 핵심 렌더 경로(ViewListGrid/ViewEntityForm/FieldRenderer/42개 필드) 테스트 0건(map-quality critical), 이 checkout에서 27개 테스트 실패(map-quality). 상용 신뢰 = 회귀 안전망인데 그게 없다.

**바꿔 말하면:** 위 4개 중 하나라도 미해결이면 (A)/(B) OSS 상용화는 무가치. **단 (C) 내부 자산 경로는 위 조건과 무관하게 계속 가치가 있다** — 그래서 "완전 무가치"는 아니고, "외부 상용화 무가치"가 정확한 표현이다. 진짜 완전 무가치는 **원 호스트가 이 엔진을 더는 안 쓰게 되는 경우**뿐인데, 그건 코드 문제가 아니라 조직 문제다.

---

## 5. 최종 판정 + 조건

### 판정: **PIVOT (조건부 GO)**

- **범용 상용 라이브러리로서: NO-GO** (현 상태·현 표방 기준). react-admin/Refine 대항마는 자원 대비 비현실적이고, 소비 결함·코어 부채·17% 커버리지가 "상용급"과 거리가 멀다.
- **(C)+(A) 하이브리드로 재정의하면: GO.** 내부 플랫폼 표준으로 자산화하면서, 좁은 니치(한국 필드 + 규제산업 딥 서브컬렉션/리비전 OSS)로 커뮤니티·용역 매출을 노린다.

### GO를 성립시키는 필수 조건 (순서 = 우선순위)

1. **[선결·1~2주] 소비 결함 제거** — `exports` require/import 조건 분리 + 확장자/`type:module` 정리 + **CI에 실제 import 스모크 테스트**(§6-A). 이거 없이는 어떤 외부 경로도 시작 불가.
2. **[선결] 표방-현실 정렬** — README에서 미구현("container-query 전면", "No Tailwind", "framework-free")을 열망이 아니라 현재 상태로 정직하게 수정. 580개 심볼·`@deprecated` 마커 0건(map-api-surface)인 공개 표면을 **버저닝하기 전에** 축소·안정화.
3. **[3~6주] 코어 재설계** — clone 딥클론/상시 mount/213 순환의존을 손대 유일 차별점(서브컬렉션)의 성능·재사용성을 확보. 여기에 clone aliasing 권한 버그(§6-F 재검증: `manageEntityForm`만 얕은 참조 복사)도 포함.
4. **[병행] 도메인 리터럴 소탕** — SelectField 색상맵(§6-C)·Preset.tsx·RevisionField 스키마·배럴 누수를 코어에서 분리(호스트 프리셋 패키지로). "새 프로젝트를 원 호스트로 강제한다"는 불만의 실체.
5. **[병행] 니치 확정** — "한국형 필드 + 규제산업 딥 서브컬렉션/리비전 OSS"로 포지션 문서화. 범용 어드민 프레임워크 마케팅 폐기.
6. **[지속] 커버리지** — 핵심 렌더 경로 테스트 도입, 임계치를 상향 강제로 전환.

### 만약 위 1~3을 향후 6개월 내 실행할 자원이 없다면
→ **(C) 내부 자산 경로로만 유지하고 외부 상용화 계획은 보류가 정직한 선택.** 억지로 OSS를 띄우면 "깨진 채 공개된 라이브러리"라는 평판 리스크가 자산 가치보다 크다.

---

## 6. 심사관 직접 재검증 로그 (지도 집계가 아닌 직접 확인)

- **A. 배포 소비 결함 (critical, 확인):** `node -e "require('./dist/index.js')"` → `ERR_UNSUPPORTED_DIR_IMPORT` (Node 26). 동적 `import()`도 동일 실패 + `MODULE_TYPELESS_PACKAGE_JSON` 경고. `package.json` 최상위 `"type"` 부재(`grep '"type"'` → repository.type만), `dist/index.js:3` `export * from './listgrid'`. **market.md/README가 표방하는 "어디에나" 소비성이 순수 Node에서 거짓.**
- **B. 의존성 실태 (map-fields 스멜 정정):** `react-kakao-maps-sdk`/`react-daum-postcode`/`xlsx-js-style`/`sweetalert2` 모두 `peerDependenciesMeta.optional=true` — **하드 의존 아님(map-fields의 critical 스멜은 현행 코드 기준 틀림).** 반면 tailwindcss는 dep/peer/dev 어디에도 미선언(암묵 의존 확인).
- **C. SelectField 도메인 하드코딩 (확인):** `SelectField.tsx:413-437` ENROLLED/GRADUATED/EXPELLED/PAID/UNPAID 색상맵 실재. 단 `?? 'secondary'` 폴백이 있어 크래시가 아닌 **점진적 열화** — critical보다 "미완 추출" 성격.
- **D. Envelope 계약 (확인):** `ApiClient.ts:33-49` — `.data.list/.content/.searchForm` 직접 역참조를 JSDoc이 명시. 어댑터는 얇지 않고 응답 정규화 책임을 호스트에 전가.
- **E. 순환의존 (확인):** `npx madge --circular src/listgrid/config/EntityForm.tsx` → **213 circular dependencies.** config↔components/fields 삼각 순환 실재 → 파셜 재사용·tree-shaking 구조적 차단.
- **F. clone aliasing 권한 버그 (확인):** `config/EntityForm.tsx:50` `entityForm.manageEntityForm = this.manageEntityForm` — tabs/fields는 딥클론(`:55-60`)하면서 권한 객체만 얕은 참조 공유. clone된 폼과 원본이 create/update/delete 권한을 공유하는 aliasing 버그 재확인.
- **G. MenuPermissionChecker (map 스멜 완화):** `MenuPermissionChecker.ts:27` 기본값 `() => 'ALL'`(전면 허용) + `registerMenuPermissionChecker`로 주입 가능 → map-providers의 "critical 호스트 결합"은 **injectable registry라 medium이 타당.** 다만 미설정 시 경고 부재는 실 함정.
- **H. ASSET_SERVER_URL (map 스멜 완화):** `misc/index.ts:423-425` — `NEXT_PUBLIC_ASSET_SERVER` 먼저 읽고 `127.0.0.1:8320`은 폴백. env 오버라이드 가능 → medium이 아니라 low(추출 흔적/미관 문제).

> 정정 요약: 지도들이 critical로 매긴 것 중 (Korea 필드 하드의존, Menu 권한 결합, ASSET_SERVER)은 현행 코드에서 **이미 완화/해결**됐다. 반대로 **가장 치명적인 건 지도가 정확히 짚은 배포 소비 결함(§A)과 코어 부채(§E,F)** 다. 상용화 판정은 후자에 걸려 있다.
