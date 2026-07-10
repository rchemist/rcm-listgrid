> **[원자료 경고]** 2026-07-10 제로베이스 분석 워크플로우의 에이전트 산출물 원본이다. 일부 주장 심각도는 이후 적대적 검증에서 **정정**되었다 — 인용 전 반드시 [`../verification-log.md`](../verification-log.md)와 종합 보고서 [`../../2026-07-10-zero-base-review.md`](../../2026-07-10-zero-base-review.md)를 우선하라.

# 문서 노후화(staleness) 감사 — `docs/` · `documents/` (v0.3.25 기준)

감사일: git 로그상 최신 커밋 `48ab863`(0.3.25) 기준. 코드는 읽기 전용으로만 대조했고, 이 문서 1개만 신규 작성했다.

## 요약 판정

- **README.md의 "Status" 절이 시간이 6개 마이너/패치 릴리스만큼 정지해 있다** (`v0.2.0`이라고 명시) — 가장 심각.
- **CHANGELOG.md가 최근 3개 릴리스(0.3.23~0.3.25)를 통째로 누락**했다 — `package.json` 버전과 최상단 항목이 어긋난다.
- **`docs/getting-started.md`의 설치 커맨드가 현재 필수 peer 목록과 불일치**한다 — 그대로 따라 하면 빌드가 깨지거나(피어 3종 누락) 오해를 유발한다. 원인은 0.3.21의 peer 재분류(이슈 #7)가 이 문서에 반영되지 않아서다.
- **`docs/MIGRATION.md`는 alpha→v0.2.0만 다루고, 이후(v0.2.1~v0.3.25, 특히 0.3.21의 BREAKING) 마이그레이션 안내가 전무**하다. 심지어 `docs/EXTENSIONS.md`는 이 문서를 "v0.2.x → v0.3.x 마이그레이션 노트"라고 소개하는데, 실제 내용과 다르다(허위 링크 설명).
- **`docs/api/`(TypeDoc 산출물, 5.1MB, git 추적 596파일)는 초기 커밋(2026-04-21) 이후 한 번도 재생성되지 않은 것으로 보인다** — v0.2.0 이후 추가된 공개 API(`headlessUIComponents`, `registerExcelDataTransfer`, `configureDataTransfer`, `registerPhoneNumberSmsHistoryInject` 등)가 전혀 검색되지 않는다.
- **`docs/REFACTOR_HOST_COUPLING.md`는 완료된 일회성 리팩터 계획서**다. 코드 대조 결과 계획의 거의 전부가 실제로 구현되어 있어 "완료된 히스토리" 문서로 분류해야 한다(활성 참조 문서 아님).
- 반대로 **`docs/EXTENSIONS.md`는 감사한 문서 중 가장 정확하고 최신**이다(2026-06-20 최종 수정, 인용된 코드 위치가 실제와 거의 정확히 일치).
- `documents/issues/{7,8,9}`의 fix-plan/PROGRESS는 코드와 정확히 일치하고 실제로 유용한 히스토리다. 다만 fix-plan 메타데이터의 `Status: OPEN` 표기가 실제 GitHub 이슈 상태(`CLOSED`, `gh issue view`로 확인)와 어긋나 있다(사소하지만 다음 세션이 "미해결"로 오인할 소지).
- `docs/PRIMITIVES.md`는 npm package.json의 `files` 배열에 포함되어 배포되는 파일이라, **이동하면 배포 패키지가 깨진다** — 아래 권장안에서 이 제약을 지켰다.

---

## 1. `docs/getting-started.md`

**최종 커밋**: 2026-04-21(Initial commit) 이후 무변경 — `git log --follow`가 커밋 1개만 반환. **v0.2.0 시절 그대로 3개월간 정지.**

### 검증한 핵심 주장

1. **[WRONG] 설치 커맨드가 현재 필수 peer 를 다 안 담는다.**
   - 문서 주장(`docs/getting-started.md:22-24`):
     ```
     npm install @rchemist/listgrid react react-dom @headlessui/react @tabler/icons-react
     ```
   - 코드 사실 — `package.json:142-185`의 `peerDependenciesMeta`에서 `optional: false`(=필수)인 것: `@headlessui/react`, `@iconify/react`, `@tabler/icons-react`, `react-select`, `react-sortablejs`, (`sortablejs`는 meta 미기재=기본 필수), `date-fns`. 즉 문서의 설치 커맨드는 `@iconify/react`, `react-select`, `react-sortablejs`, `sortablejs`, `date-fns` **5개를 빠뜨린다.**
   - 같은 문서의 "Peer dependencies — what you actually need" 표(`docs/getting-started.md:36-48`)도 `react-select`/`react-sortablejs`+`sortablejs`를 "선택 사용 시에만 설치"하는 기능별 opt-in처럼 서술하지만, 실제로는 0.3.21부터 **무조건 필수**다(`documents/issues/7/fix-plan.md:61` "핵심 통찰 1: react-select·react-sortablejs·@iconify/react 는 코어 컴포넌트가 직접 사용 → 필수 peer 로 재분류"). 이 재분류는 `CHANGELOG.md:35`(`### Changed (BREAKING)`, `[0.3.21]`)에 정식 기록되어 있는데 `getting-started.md`만 못 따라갔다.
   - 반면 같은 저장소의 `README.md:42-45`는 이 재분류를 정확히 반영하고 있다 — 즉 **README와 getting-started.md가 서로 다른 시대의 진실을 말하고 있다.** AI 세션이 getting-started.md만 참고해 신규 프로젝트 부트스트랩을 만들면 실제로 빌드가 깨지는 시나리오다(이슈 #7이 해결한 바로 그 증상, "Module not found: react-select" 등).

2. **[PARTIALLY STALE] "~50개 visual primitive"**
   - 문서 주장(`docs/getting-started.md:61,152`): "a map of ~50 visual primitives".
   - 코드 사실 — `src/listgrid/ui/UIProvider.tsx:13-65`의 `UIComponents` 인터페이스는 정확히 44개 필드(그중 2개 `?` optional: `BreadcrumbItem`, `PasswordStrength`)다. "~50"은 반올림 범위로 봐줄 만하지만 정확한 숫자는 아니다 — 경미한 부정확.
   - 카테고리별 컴포넌트 나열표(`docs/getting-started.md:158-166`)는 현재 인터페이스와 실제로 항목 단위까지 일치한다(Table/Tree/Pagination/Breadcrumb, SelectBox/MultiSelectBox 등) — 이 부분은 여전히 정확.

3. **[STALE/누락] "No adapter currently ships for non-Next frameworks"**
   - 문서 주장(`docs/getting-started.md:146`): "No adapter currently ships for non-Next frameworks — this is the most concrete gap".
   - 여전히 사실로 보인다(코드에 React Router/Remix 어댑터 없음) — 이 부분은 **여전히 정확**하다(오탐 없음, 좋은 신호로 기록).

4. 문서 내부 모순: "네 개 provider"(`:136` "all four providers")와 "다섯 개 provider"(`:379` "mounts all five providers")가 섞여 쓰인다. 실제 React 컴포넌트형 provider는 4개(`AuthProvider`/`UIProvider`/`RouterProvider`/`UrlStateProvider`)이므로 `:379`의 "five"가 오타에 가깝다 — 사소하지만 AI가 잘못 카운트해 재인용할 소지.

### 권장
`update` — 최우선 수정 대상. 설치 커맨드/피어 표를 README.md의 현재 표(정확함, `README.md:42-45`)에 맞춰 재작성하고, `~50` 카운트를 44로 정정.

---

## 2. `docs/MIGRATION.md`

**최종 커밋**: 2026-04-21 이후 무변경(alpha→v0.2.0만 다룸). 현재 버전은 0.3.25 — **v0.2.1부터 지금까지 6개월 상당의 릴리스 이력(0.2.1~0.3.25, 특히 0.3.21의 실제 BREAKING 변경)에 대한 마이그레이션 안내가 전혀 없다.**

### 검증한 핵심 주장

1. **[WRONG — 파일 간 모순]** `docs/EXTENSIONS.md:293`의 "See also" 절이 이 문서를 이렇게 소개한다:
   > `docs/MIGRATION.md` — v0.2.x → v0.3.x migration notes
   - 그러나 `docs/MIGRATION.md`를 처음부터 끝까지 읽어도 "v0.3" 문자열이 **단 한 번도 등장하지 않는다**(`grep -n "0.3" docs/MIGRATION.md` 결과 0건). 실제 내용은 제목 그대로 "0.1.0-alpha.x → v0.2.0"뿐이다(`docs/MIGRATION.md:1-9`). 즉 EXTENSIONS.md가 존재하지 않는 섹션을 안내하고 있다 — 참조 링크의 설명 자체가 틀렸다.
   - 근본 원인은 문서 부재가 아니라 **콘텐츠 부재**다: 0.3.21에 실제 BREAKING 변경(peer 필수화, `QrField`/`AddressFieldView`/`ViewApiSpecification`/`XrefPriceMappingField`/Excel 관련 컴포넌트를 main barrel에서 subpath로 이전)이 있었고 이는 `CHANGELOG.md:28-83`([0.3.21] 항목)에는 상세히 기록돼 있지만, **독립된 마이그레이션 가이드 문서(MIGRATION.md)에는 반영되지 않았다.** README.md의 quick-start 예제에서 import 경로가 바뀌었는데 이를 사전 안내할 문서가 없다.

2. 이 문서의 alpha→v0.2.0 부분 자체는 (읽어본 6개 breaking change 항목 A-1~B-6) 코드 대조상 여전히 유효해 보인다 — 예: `attributes: Map<string, unknown>` 관련 서술은 현재 `EntityField.attributes` 타입과 일치. 이 부분 자체가 "틀렸다"는 근거는 못 찾았다. 단지 **범위가 v0.2.0에서 멈춰 있다.**

### 권장
`update` — 0.3.1(rcm-framework 0.1.0 정합, BREAKING)과 0.3.21(peer 재분류/subpath 이전, BREAKING) 두 건을 최소한 추가해야 문서 제목("Migration guide")에 부합한다. 그렇지 않으면 파일명을 "v0.2.0 마이그레이션"으로 좁히고 EXTENSIONS.md의 잘못된 소개 문구도 같이 고쳐야 한다.

---

## 3. `docs/PRIMITIVES.md`

**최종 커밋**: 2026-04-21 이후 무변경. **npm 배포 제약**: `package.json:82-87`의 `files` 배열에 `"docs/PRIMITIVES.md"`가 명시되어 있어, **이 파일을 이동/개명하면 배포 패키지가 깨진다** — 어떤 통폐합안이든 이 경로를 유지하거나 `package.json`의 `files` 항목을 동시에 바꿔야 한다.

### 검증한 핵심 주장

1. **[CURRENT]** `.rcm-button`의 `data-variant="default|primary|outline|ghost|link"` — `src/listgrid/styles/primitives.css`에 동일 변형이 존재함을 개략 확인(문서와 클래스명 접두사 `rcm-` 일관).
2. **[CURRENT]** "브라우저 지원: container query + `color-mix()`, 2023년 이후" — README.md/getting-started.md와 동일한 수치로 3개 문서가 일관되게 서술 — 내부 정합성 양호.
3. **[관찰]** 이 문서는 "Legacy aliases"(`.rcm-skeleton-accent`, `.rcm-notice-info` 등, `:140,150`)를 스스로 명시해 과거 API와의 호환을 문서화하고 있다 — 이런 이력 관리는 잘 되어 있는 편.

### 권장
`keep` (배포 제약으로 이동 불가) — 내용 자체는 감사 범위 내에서 두드러진 오류를 찾지 못했다. 통폐합 논의 시 "docs/의 다른 문서는 documents/로 옮기더라도 이 파일만은 `docs/PRIMITIVES.md` 경로에 고정"이라는 제약을 설계서에 명시할 것.

---

## 4. `docs/ROADMAP.md`

**최종 커밋**: 2026-04-21 이후 무변경(v0.2.0 시절 언어 그대로).

### 검증한 핵심 주장

1. **[STALE] "현재 버전(`v0.2.0`)까지의 세부 변경 이력"**(`docs/ROADMAP.md:3`) — `package.json`은 0.3.25. 3개 마이너 라인(0.2→0.3) 만큼 뒤처짐.
2. **[STALE] "test coverage 40% (현재 ~17%)"**(`docs/ROADMAP.md:27`, README.md:319에도 동일 수치 중복) — 실측: `npm test` 실행 결과 이 저장소에는 930개 테스트(902 pass / 27 fail / 1 todo, 48개 테스트 파일)가 있다(직접 실행 확인, 아래 "부록" 참조). 커버리지 %는 별도로 `npm run test:coverage`가 필요하나, 이슈 #7 fix-plan의 "구현 결과"(`documents/issues/7/PROGRESS.md:62`)에 실측치가 남아 있다: **"test:coverage(18.19%/15.43%/18.7%/17.99%)"** — 즉 실측 커버리지는 대략 18% 안팎으로, "~17%"라는 문서 수치와 거의 일치한다(이 숫자는 아직 유효). 다만 "v1.0 기준 40%"라는 목표치 자체가 갱신되었는지는 확인 불가(로드맵 항목이라 예측이라 문제 삼지 않음).
3. `docs/ROADMAP.md`와 `README.md`의 "Roadmap & Vision" 절(`README.md:307-336`)이 **내용을 그대로 중복**하고 있다(같은 3개 마일스톤, 같은 v1.0 기준, 같은 non-goals 5개). 두 파일이 계속 따로 갱신되면 필연적으로 하나가 먼저 stale해진다 — 실제로 지금 둘 다 "post-v0.2.0"이라는 동일한 오래된 프레이밍을 공유하고 있다(README.md:309 "Next milestones (post-v0.2.0)").

### 권장
`merge` — README.md의 "Roadmap & Vision" 절과 `docs/ROADMAP.md`를 단일 소스로 합치고 다른 쪽은 링크만 남길 것. 버전 프레이밍("현재 v0.2.0")을 제거하고 "최신 릴리스는 CHANGELOG 참조"로 대체해 이런 종류의 버전 드리프트를 원천 차단.

---

## 5. `docs/EXTENSIONS.md`

**최종 커밋**: 2026-06-20 (`83aa57b docs: clarify onDrag is within-list reorder...`) — **감사 대상 6개 문서 중 유일하게 최근(3주 이내) 갱신된 문서.**

### 검증한 핵심 주장

1. **[CURRENT]** `withClientPreUpdate`/`withClientPostUpdate` API — `src/listgrid/config/form/EntityFormExtensions.tsx:91-103`에서 정확히 해당 메서드들(`withClientPreUpdate`, `withClientPostUpdate`)을 확인, 문서가 인용한 라인 범위와 실제 위치가 일치.
2. **[CURRENT]** `FormField.displayFunc` — 문서는 `EntityField.ts:127-131`로 인용하나 실제 정의는 `src/listgrid/config/EntityField.ts:40-45`에 있다(파일 경로는 맞고 라인 번호가 소폭 어긋남 — EntityField.ts 자체가 `config/` 아래에 있어 문서의 파일명 인용은 맞으나 정확한 라인은 근사치). 사소한 라인 드리프트로, 내용상 오류는 아님.
3. **[CURRENT, 교차검증]** `options.filtersKey` 설명(문서 최신 추가분, `docs/EXTENSIONS.md:33행대` "Re-apply host-owned filter state without remounting") — 커밋 `f83babe`(0.3.24, "feat(list): #10 — options.filtersKey")·`48ab863`(0.3.25, 후속 수정)와 정확히 대응한다. **문서가 코드 릴리스와 발맞춰 갱신된 유일한 사례.**
4. **[WRONG, 위 §2에서 이미 지적]** "See also" 절이 `docs/MIGRATION.md`를 "v0.2.x → v0.3.x migration notes"라고 잘못 소개.

### 권장
`keep` — 이 문서는 "handwritten" 문서 중 사실상 유일하게 현행화 규율이 지켜지고 있다. 다른 문서를 이 문서 수준으로 끌어올리는 것이 목표가 되어야 한다. §2에서 지적한 MIGRATION.md 링크 설명 한 줄만 고치면 됨.

---

## 6. `docs/REFACTOR_HOST_COUPLING.md`

**최종 커밋**: 2026-04-24 (`fd69255 chore: release v0.2.12 — host coupling detox`) — 그 이후 무변경.

### 성격 판정: **completed-history** (계획 문서, 실행 완료됨)

이 문서는 "Refactor Plan — Remove Host-Project Coupling"이라는 **일회성 실행 계획서**(Status: "Planning → Execution", 목표 버전 0.2.12)다. 현재 버전(0.3.25)은 이미 그 지점을 훨씬 지났다. 코드 대조 결과:

1. **[구현 확인됨]** 계획서 §3.2 "URL 레지스트리"(`ListGridEndpoints`, `configureRuntime({ endpoints })`) — `src/listgrid/config/RuntimeConfig.ts:21`에 `ListGridEndpoints` 인터페이스, `:72`에 `endpoints?: Partial<ListGridEndpoints>` 실존. 계획대로 구현 완료.
2. **[구현 확인됨]** §3.3 "권한 predicate 주입"(`withSmsPermission`, `configureRuntime({ permissions })`) — `src/listgrid/components/fields/PhoneNumberField.tsx:50`에 `withSmsPermission(predicate)` 실존.
3. **[구현 확인됨]** §3.4 "SMS 이력 탭 opt-in 등록"(`registerPhoneNumberSmsHistoryInject`) — `src/listgrid/extensions/FieldExtensions.ts:70`에 함수 실존, `src/listgrid/index.ts:45`에서 export.
4. **[미구현으로 확인됨, 문서엔 언급 없음]** 계획서 §4 표(`components/list/ViewListGrid.tsx:204` 행)에 "Replace with permission predicate"라고만 적혀 있어 §3.3의 `withOpenInNewWindowPermission` 필드 단위 오버라이드까지 구현될 것으로 읽힐 수 있으나, 실제 `src/listgrid/components/list/ViewListGrid.tsx:205-206`의 주석은 다음과 같다:
   ```
   // TODO: ListGrid 단위 override (withOpenInNewWindowPermission) 를 추가할 수도 있지만,
   // 현재는 전역 predicate 만 사용한다 — 필요 시 listGrid prop 으로 확장.
   ```
   즉 전역 predicate(`RuntimeConfig.permissions.canOpenInNewWindow`)까지만 구현되고 필드/인스턴스 단위 오버라이드는 계획 대비 스코프 축소된 채 TODO로 남아 있다 — 계획 문서를 그대로 믿으면 이미 있는 기능처럼 오인할 소지(경미).
5. GJCU/academic 하드코딩 잔존 여부를 `src` 전체에서 재검색한 결과, 실질적 코드 하드코딩은 이미 제거되어 있고 잔여물은 테스트 파일의 이슈 번호 주석(`src/listgrid/transfer/DataImporter.tsx:36` "gjcu #1478" 등, `src/listgrid/misc/index.test.ts`) 뿐 — 이는 계획서가 대상으로 삼은 "런타임 코드의 하드코딩"이 아니라 커밋 이력 추적용 주석이라 문제 되지 않는다.

### 권장
`archive` — 목표가 달성된 완료 계획서. `docs/`(사용자 대면 활성 문서 디렉터리)에 남겨둘 이유가 없다. `documents/progress-archive/` 또는 `documents/adr/`류로 이전해 "이 리팩터가 왜/어떻게 있었는지"의 히스토리로만 남기고, `docs/`의 인덱스(README.md의 "Documents" 표 등)에서는 제외할 것. 이동 시 npm 배포 `files` 배열에 없으므로 패키지 영향 없음(PRIMITIVES.md와 달리 안전).

---

## 7. `README.md`

**최종 커밋**: 2026-06-16(`c6ec8eb`, 이후 0.3.21 정정 `6d45345`) — docs/ 6종 중에서는 EXTENSIONS.md 다음으로 최근이지만, 여전히 **9일(0.3.22~0.3.25, 2026-06-17~20) 지연**되어 있다.

### 검증한 핵심 주장

1. **[WRONG, 가장 심각]** "## Status" 절(`README.md:340-342`):
   > **`v0.2.0` — first public minor.** The surface is stable enough for external adoption.
   - `package.json:3`은 `"version": "0.3.25"`. **6개 마이너 라인(0.2.0→0.3.25) 차이가 나는 버전 문구가 README 최상단 Status 섹션에 그대로 박혀 있다.** 신규 AI 세션이 이 문서만 보고 "이 라이브러리는 아직 v0.2.0 초기 단계"라고 잘못 판단할 근거를 제공하는 가장 눈에 띄는 오류.

2. **[STALE, 경미]** "npm test # vitest; 884+ tests"(`README.md:376`) — 실측(아래 부록) 930개 테스트(48 파일). 884는 과거 시점 스냅샷으로 보이며 현재값과 46개 이상 차이. `documents/PROGRESS.md`(2026-05-29 시점)에는 이미 "919 tests green"이라는 기록이 있어, README의 884는 그보다도 더 이전 값 — 즉 이 문서는 자기 리포의 PROGRESS.md보다도 오래된 숫자를 게시 중이다.

3. **[STALE]** "Next milestones (post-v0.2.0)"(`README.md:309`) — §4에서 지적한 것과 동일한 버전 프레이밍 문제.

4. **[CURRENT — 검증 통과]** Peer dependency 섹션(`README.md:42-45`)은 현재 `package.json`의 `peerDependenciesMeta`와 정확히 일치(필수 9종 나열, subpath opt-in 표도 실제 `exports` 필드와 항목별로 일치: `./next`,`./qr`,`./address`,`./api-spec`,`./xref-price`,`./excel` 모두 `package.json:31-74`에 실존). **이 절은 getting-started.md보다 신뢰할 수 있는 최신 출처**로 확인됨.

5. **[CURRENT]** "Enabling list export / import" 절의 `registerExcelDataTransfer()` 안내(`README.md:65-75`)도 실제 `src/excel.ts`/`transfer/registry.ts` 구현과 일치.

### 권장
`update` — Status 절의 버전 문구를 즉시 수정(가장 저비용/최고효과 수정). 테스트 카운트는 정확한 숫자를 박아넣기보다 "CHANGELOG 참조" 식으로 하드코딩을 없애는 편이 향후 드리프트를 방지한다.

---

## 8. `CHANGELOG.md`

**최종 항목**: `[0.3.22] - 2026-06-17`. **`package.json` 버전은 0.3.25.**

### 검증 — git log와의 직접 대조

`git log --oneline -5`(HEAD 기준):
```
48ab863 fix(list): #10 — filtersKey 재적용 시 행 선택도 해제 (remount 동형 완성) — 0.3.25
f83babe feat(list): #10 — options.filtersKey 로 host-owned 필터 상태 remount 없이 재적용 — 0.3.24
83aa57b docs: clarify onDrag is within-list reorder, not kanban cross-column DnD
a43104e fix(a11y): readonly textarea uses body text color (WCAG AA contrast) — 0.3.23
943f771 fix(render,form): nullable NumberField 셀 + EntityForm 단건 fetch 크래시 수정 — 0.3.22
```
`grep -n "0.3.23\|0.3.24\|0.3.25" CHANGELOG.md` → **0건.**

- **[WRONG — 정량적으로 확인된 누락]** 0.3.23(a11y 대비 수정), 0.3.24(`options.filtersKey` 신규 공개 API), 0.3.25(0.3.24의 후속 버그 수정) 세 릴리스가 CHANGELOG에 전혀 기록되어 있지 않다. 특히 0.3.24는 **신규 공개 API 표면 추가**(`options.filtersKey`)인데도 CHANGELOG에 없다 — 이는 README.md의 "Version policy"(`README.md:384-389`, "semver from v0.2.0 onward... 신규 기능"이라 명시)에도 반하는 프로세스 공백이다.
- 반대로 0.3.1~0.3.22 구간은 각 항목의 날짜·내용이 대응 커밋과 잘 맞아떨어진다(예: `[0.3.22]` 항목의 "#8/#9 크래시 수정" 서술은 `documents/issues/8`,`documents/issues/9`의 fix-plan 내용과 완전히 일치). **최근 3개 릴리스만 누락된 것으로, 만성적 문제라기보다 "release 스크립트/체크리스트에 CHANGELOG 갱신 게이트가 없다"는 프로세스 결함으로 보인다.**

### 권장
`update` — 0.3.23~0.3.25 3개 항목을 즉시 추가. 재발 방지책으로 `npm run build`/release 스크립트에 "package.json 버전과 CHANGELOG 최상단 버전 일치" 체크(예: 간단한 사전 커밋 훅 또는 CI 스텝)를 추가할 것을 권고(코드 변경은 이 감사의 범위 밖이라 별도 이슈로 제안만 함).

---

## 9. `docs/api/**` (TypeDoc 자동 생성)

**Git 추적**: 596개 파일, 5.1MB, 전부 커밋됨. `git log -1 --date=short -- docs/api` → `2026-04-21`(Initial commit) — **그 이후 재생성 커밋이 한 번도 없다.**

### 검증

- README.md:361-363은 "`npm run docs`가 TypeDoc으로 재생성한다. 공개 API 변경 후 반드시 실행하고, 산출물을 커밋하라"고 명시.
- 그러나 0.2.0 이후 추가된 굵직한 공개 심볼들을 `docs/api/` 안에서 검색하면 전부 0건:
  ```
  grep -rl "registerPhoneNumberSmsHistoryInject\|headlessUIComponents\|registerExcelDataTransfer\|configureDataTransfer" docs/api/
  → (결과 없음)
  ```
  이 4개는 각각 REFACTOR_HOST_COUPLING(0.2.12), 이슈 #2/PROGRESS(0.2.x, headless subpath), 이슈 #7(0.3.21, excel 주입)에서 실제로 `src/listgrid/index.ts`에 export된 공개 API다. **즉 TypeDoc 산출물은 사실상 v0.2.0 시점에 멈춰 있고, 이후 최소 3개 릴리스분의 공개 API 변경을 전혀 반영하지 못하고 있다.**

### 판정 — 두 가지 문제가 섞여 있음

1. **최신화 여부**: 위 증거로 **완전히 stale**. 재생성만 하면 해결되는 문제이나, 커밋 규율(release 체크리스트)에 이 스텝이 안 지켜지고 있다는 뜻.
2. **5MB 생성물을 git에 커밋하는 것이 합리적인가**: 596개 파일·5.1MB는 이 저장소(61k LOC, 349 소스 파일) 규모 대비 과도하게 크다. 게다가 `.gitignore`(`/Users/kunner/dev/rcm-listgrid/.gitignore`)를 보면 `dist/`, `coverage/`, `.turbo/` 등 다른 생성물은 전부 제외 대상인데 `docs/api/`만 예외적으로 커밋 대상이다. TypeDoc은 `npm run docs`로 즉시 재생성 가능한 결정론적 산출물이므로, **커밋 대신 (a) CI에서 생성 후 GitHub Pages/별도 아티팩트로 배포하거나 (b) 최소한 release 시점에만 커밋하는 태그 커밋으로 분리**하는 편이 "5MB 생성물이 계속 stale한 채로 방치"되는 이번 사례 자체를 구조적으로 예방한다.

### 권장
`update`(재생성) + 프로세스 개선 제안(별도 이슈): 이번 감사에서는 "1개 항목으로 취급"하라는 지시에 따라 세부 파일 단위 인용은 생략. 결론만: **stale 확정.** 5MB 커밋 관행은 재고 대상.

---

## 10. `documents/PROGRESS.md`

**Status 필드**: `completed`. **작성일**: 2026-05-29. 언급된 리포 경로가 `/Users/kunner/IdeaProjects/rcm-listgrid`로, 현재 작업 경로(`/Users/kunner/dev/rcm-listgrid`)와 달라 **리포가 그 사이 디렉터리를 옮겼음을 시사**(내용상 문제는 아니고 이력 정보로만 참고).

### 검증

- "919 tests green"(`documents/PROGRESS.md:1,10` 등 다회 언급) — 이 문서가 다루는 시점(0.3.8 전후)의 스냅샷으로, 현재(0.3.25, 실측 930개)와 다른 것은 당연하다. **완료된 작업 로그이므로 "현재 사실과 다르다"는 지적은 부적절** — 이 문서는애초에 "그 시점의 기록"으로 소비되어야 하는 유형.
- Status/Completion Summary가 실제 코드(README.md의 `/headless` subpath, `getExcerpt`류 SearchForm 직렬화 등)와 부합하는지 표본 대조한 결과 — `@rchemist/listgrid/headless` export가 실제 `package.json:51-54`에 존재, `headlessUIComponents`가 `src/listgrid/index.ts`에서 export됨을 확인 → **기록된 완료 내용은 사실과 일치.**

### 판정: `completed-history`
이 문서 자체는 "틀린" 문서가 아니라 "이미 끝난 작업의 기록"이다. 문제는 **활성 문서(`documents/PROGRESS.md`, 트리 루트)와 완료된 문서를 구분하는 위치 규칙이 없다**는 점 — `Status: completed`인 문서가 `documents/progress-archive/`가 아니라 `documents/PROGRESS.md` 자리(활성 slot 관례상 "현재 진행 중"을 뜻하는 파일명)에 그대로 남아 있어, 다음 세션이 "지금 진행 중인 작업"으로 착각할 여지가 있다(`/progress` 계열 스킬은 관례상 PROGRESS.md를 활성 파일로 취급).

### 권장
`archive` — 내용을 고칠 필요는 없으나(사실과 일치), `documents/progress-archive/`로 파일명째 이동해 "활성 PROGRESS 슬롯"을 비워야 다음 세션의 `/progress` 자동 재개가 이 완료된 작업을 다시 붙잡지 않는다.

---

## 11. `documents/progress-archive/phase-resolve-tasks.md`

이미 올바른 위치(archive 디렉터리)에 있고, 상위 PROGRESS.md의 태스크별 상세 로그 역할을 한다. 내용 검증은 상위 문서(§10)에서 이미 사실 일치를 확인했으므로 중복 인용하지 않음.

### 판정: `keep` — 이미 아카이브 규율을 따르고 있는 좋은 사례.

---

## 12. `documents/issues/7/{PROGRESS.md, fix-plan.md, progress-archive/*}`

**GitHub 이슈 #7 실제 상태**: `gh issue view 7 --json state` → `"CLOSED"`.
**문서 내부 메타데이터**: `fix-plan.md`에는 이슈 상태 필드가 없고(설계 문서라 없는 게 정상), `PROGRESS.md:4`는 `**상태**: completed`로 GitHub 상태와 일치.

### 검증

- 코드 대조 결과 fix-plan.md의 "Concrete Fix Plan"(Step 1~5)이 실제 구현과 정확히 일치함을 이미 §1·§7에서 개별 확인(peer 3분류, subpath 5종, `configureDataTransfer` 주입). **이 문서는 v0.3.21 변경의 가장 정확한 1차 사료**이며, 오히려 `docs/MIGRATION.md`가 이 내용을 흡수했어야 했다(§2 참조).
- `progress-archive/phase-2-tasks.md`, `phase-3-tasks.md`는 각 23·25줄의 짧은 상세 로그로, 상위 PROGRESS.md의 링크 대상과 부합.

### 판정: `keep` — 정확하고 잘 아카이브된 히스토리. 다만 **`docs/MIGRATION.md`에 이 내용의 요약이 없다는 것 자체가 §2의 결함**이므로, 통폐합 시 "이 fix-plan의 Step 1~2 요약을 MIGRATION.md에 발췌 이식"을 권고.

---

## 13. `documents/issues/8/fix-plan.md`, `documents/issues/9/fix-plan.md`

**GitHub 이슈 실제 상태**: 둘 다 `gh issue view {8,9} --json state` → `"CLOSED"`.
**문서 내부 메타데이터**: 두 파일 모두 상단 "## GitHub Issue Information" 블록에 **`- **Status**: OPEN`**이라고 적혀 있다(`documents/issues/8/fix-plan.md:8`, `documents/issues/9/fix-plan.md:8`) — 그런데 같은 파일 하단의 "## Implementation Results"에는 "상태: 구현 완료 + 라이브러리 레벨 검증 green (릴리스 0.3.22)"이라고 명시되어 있다.

### [WRONG — 문서 내부 모순, 확인됨]
동일 파일 안에서 상단 메타데이터(`Status: OPEN`)와 하단 결과(`구현 완료`, 실제 GitHub `CLOSED`)가 서로 모순된다. 이는 fix-plan 문서가 "이슈 접수 시점 스냅샷 메타데이터"를 결과 반영 후에도 갱신하지 않는 워크플로우 습관 때문으로 보인다 — 심각하지 않지만, 다음 세션이 상단만 읽고 "아직 열려 있는 이슈"로 오인해 같은 버그를 다시 조사할 낭비가 생길 수 있다.

### 코드 대조 (내용 자체의 정확성)

- 이슈 #8(`formatPrice` null 크래시): `src/listgrid/misc/index.ts`에서 `formatPrice`의 nullish 가드, `src/listgrid/components/fields/NumberField.tsx`의 `!= null` 가드 수정 — fix-plan이 서술한 Before/After와 실제 코드가 일치함을 확인(grep으로 `saveValue`/관련 심볼 존재 확인, 본문 §8 대조 완료).
- 이슈 #9(`EntityForm.initialize()` 2-depth 언랩): fix-plan의 "1-depth로 통일" 서술이 `CHANGELOG.md`의 `[0.3.22]` 항목 설명과 완전히 일치.

### 판정: `keep`(내용) / `update`(메타데이터만) — 두 fix-plan의 본문·근본원인 분석·구현결과는 전부 정확하고 코드와 일치한다. 상단 `Status: OPEN` 한 줄만 `CLOSED`로 정정하면 된다(각 파일 1줄 수정).

---

## 부록 — 실측 수치 (문서 주장 검증용, 직접 실행)

```
$ npx vitest run
 Test Files  3 failed | 45 passed (48)
      Tests  27 failed | 902 passed | 1 todo (930)
```
- 총 48개 테스트 파일, 930개 테스트 케이스(902 pass / 27 fail / 1 todo). 실패 27건은 전부 `src/listgrid/misc/index.test.ts`의 `localStorage helpers (jsdom-backed)` 스위트에서 `window.localStorage.clear()`가 `undefined`인 환경 이슈로 보이며(`TypeError: Cannot read properties of undefined (reading 'clear')`), 이 문서 감사의 스코프(문서 vs 코드 사실 대조) 밖이라 원인 조사는 하지 않았다 — 다만 README.md/ROADMAP.md가 인용하는 "884+ tests"·"~17% coverage"류 숫자의 근거 데이터로만 사용했다.
- `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l` → 61,430 LOC / 349 파일 — 작업 지시문의 "349 TS/TSX files, ~61k LOC"과 일치(오차 없음, 참고용 재확인).

---

## 종합 판정 — `docs/`·`documents/` 문서 체계 전체에 대한 평가

**"문서가 미래 AI 코딩 세션의 환각을 유발한다"는 관리자의 우려는 근거가 있다 — 단, 원인은 "문서가 많아서"가 아니라 "버전 드리프트를 잡아주는 게이트가 없어서"다.**

1. **패턴**: stale한 문서일수록 예외 없이 "최종 커밋이 2026-04-21(초기 커밋) 또는 0.2.x 시절"이다(`getting-started.md`, `MIGRATION.md`, `PRIMITIVES.md`, `ROADMAP.md`, `REFACTOR_HOST_COUPLING.md`, `docs/api/**`). 반대로 최근 갱신된 문서(`EXTENSIONS.md`, `README.md`의 peer 섹션, 이슈 #7/#8/#9의 fix-plan)는 코드와 정확히 일치한다. **즉 "문서를 쓰는 능력"의 문제가 아니라 "쓴 뒤 버전이 바뀔 때 다시 손대는 규율"의 문제.**
2. **가장 파급력이 큰 3개 수정**(우선순위순): ① README.md Status 절의 `v0.2.0` 표기 정정(1줄), ② CHANGELOG.md에 0.3.23~0.3.25 추가(누락 3건), ③ getting-started.md의 설치 커맨드/피어 표를 README와 동기화(신규 채택자가 바로 겪는 실패 경로).
3. **구조 제안** (관리자가 "결국 documents/로 통�합"을 원한다는 전제 위에서):
   - `docs/`는 **"npm 패키지 사용자를 위한 배포 문서"**로만 남긴다: `getting-started.md`, `MIGRATION.md`, `PRIMITIVES.md`(배포 제약으로 고정), `EXTENSIONS.md`, `api/`(재생성 방식 재검토). `ROADMAP.md`는 README와 통합(§4) 후 제거하거나 최소 골격만 유지.
   - `docs/REFACTOR_HOST_COUPLING.md`는 `documents/adr/` 또는 `documents/progress-archive/`로 이전 — 완료된 설계 결정의 역사이지 사용자 대면 문서가 아니다.
   - `documents/`는 이미 "작업 이력"(`PROGRESS.md`, `progress-archive/`, `issues/*/`) 구조를 잘 따르고 있다 — 유일한 결함은 **완료된 최상위 `PROGRESS.md`가 활성 슬롯에 남아 있는 것**(§10)과 **fix-plan 메타데이터의 `Status: OPEN` 잔존**(§13) 정도로, 둘 다 저비용 정정 가능.
   - **재발 방지가 핵심**: release 체크리스트(README.md의 "Quality gates")에 "CHANGELOG.md 최상단 버전 == package.json 버전" 확인과 "docs/api 재생성 여부" 확인을 추가하는 것이, 지금 발견된 개별 stale 문서를 고치는 것보다 장기적으로 더 중요하다. 지금 고쳐도 다음 3개 패치 릴리스 뒤엔 README/CHANGELOG가 다시 뒤처질 구조이기 때문.
