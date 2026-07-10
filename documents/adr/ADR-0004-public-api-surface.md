# ADR-0004 — 공개 API 표면 재단: 화이트리스트 배럴·프리셋 격리·peer 최소화

**Status**: accepted · **Date**: 2026-07-10 · **선행**: ADR-0001 (같은 0.4.0 breaking 창구에 동승)
**근거**: raw/critique-api-packaging, raw/map-api-surface, raw/critique-host-coupling · 검증: high 확정 (PRD 조건 C2)

## Context

- 메인 배럴(src/listgrid/index.ts, 411줄)이 `export *` 67회로 **~580 심볼**을 노출. `@deprecated`/`@experimental` 마커 0건 — 폐기 메커니즘 자체가 없어 semver freeze 불가능.
- 호스트 도메인 잔재가 코어 표면에 누수: Preset.tsx 442줄(MarketingField '주문서에 표시'·DeviceTypes '가입 채널'·PublishStatus·SeoMetadata — 제네릭 프리셋과 혼재), CommonType의 AdjustmentType(가격 정책), SelectField 하드코딩 색상맵(ENROLLED/PAID… + **CardItem.tsx:37-68 두 번째 사본**), RevisionField 고정 스키마 전제, AdvancedSearchForm V1(내부 사용처 0인 죽은 공개 API).
- 필수 lib-peer 7종(@headlessui/react·@tabler/icons-react·@iconify/react·react-select·react-sortablejs·sortablejs·date-fns) — **아이콘 생태계 2종 이중 강제**(@iconify는 3개 파일만 사용). UIProvider로 프리미티브를 추상화한다면서 8개 파일이 @headlessui를 직접 import하는 모순.
- 0.3.x 마이너 내 BREAKING 3회(0.3.1/0.3.21 등) — semver 규율 부재.

## Decision

1. **배럴 화이트리스트 재작성** (0.4.0): `export *` 전량을 **명시 재수출**로 교체, 목표 ~200 심볼. 분류 기준:
   - **유지(코어)**: ViewListGrid/ViewEntityForm/Wrapper, EntityForm/ListGrid/SearchForm, 제네릭 필드 클래스, 검증, provider/configure 계약, 테마/헤들리스
   - **이동**: 도메인 프리셋 → 신설 `@rchemist/listgrid/presets/rcm` 서브패스 (Preset.tsx의 제네릭 부분 — NameField/TitleField/ActiveField/PriorityField 등 — 은 `./presets` 코어 프리셋으로 분리)
   - **삭제(0.4에서 @deprecated 마킹 → 0.5 제거)**: AdvancedSearchForm V1, 도달 불가 유틸(simpleCrypt encrypt/decrypt — 검증 로그 참조), misc/utils 이중 API 중 한쪽
2. **@deprecated 정책 도입**: TSDoc `@deprecated` + 최소 1 MINOR 유예 후 다음 breaking 창구에서 제거. README Version policy에 명문화(이미 문구는 있음 — 이제 지킨다).
3. **semver 규율**: 0.x에서 BREAKING은 반드시 **MINOR 승격**(0.4→0.5). CHANGELOG 게이트는 ADR-0007.
4. **peer 최소화** (0.4.0):
   - @iconify/react 사용처 3파일을 @tabler로 통일 → **iconify peer 제거**
   - `@rchemist/listgrid/ui-default` 서브패스 신설: @headlessui/react-select/sortablejs 기반의 **공식 스타일드 프리미티브 셋**(react-admin의 MUI 번들과 동형). 코어의 @headlessui 직접 import 8개 파일을 UIProvider 프리미티브 경유로 교정.
   - 최종 목표: 코어 필수 peer = react/react-dom/date-fns(+@tabler — 렌더러가 아이콘을 직접 쓰는 한 유지, ui-default로 완전 이동 시 제거 재검토). 무거운 UI peer는 ui-default 설치 시에만.
5. **도메인 색상맵 주입화**: SelectField에 `withStatusColors(map)` 옵션 신설, 하드코딩 맵(SelectField.tsx:413-437 + CardItem.tsx:37-68)은 `presets/rcm`으로 이전.
6. **RevisionField 스키마 주입화**: 리비전 필터 키·감사 필드 세트를 생성자 옵션으로. Excel 다운로드 로깅은 `endpoints.excelDownloadHistory: null`이면 skip (호스트 결합 발견 대응).

## 기각한 대안

- **일괄 삭제(유예 없는 표면 축소)** — 프로덕션 소비자 2계열 존재. @deprecated 유예가 신뢰 회복 목적에 부합.
- **peer 0 (전부 번들)** — 아이콘/헤들리스 컴포넌트를 번들하면 호스트 중복 번들 문제. 서브패스 분리가 정답.

## Consequences

- 0.4.0은 소비자에게 실질 마이그레이션을 요구한다(import 경로 이동 다수) — MIGRATION.md 0.3→0.4 섹션 + codemod 스크립트(정규식 치환 수준) 제공을 로드맵에 포함.
- docs/api(TypeDoc)는 표면 재단 후 재생성해야 의미가 있다 — 재단 전 재생성 금지.

## 구현 계획

1. **표면 감사표 작성** (sonnet): 현재 580 심볼 전수 → 유지/이동/삭제 3분류 CSV. 판정 기준은 위 Decision 1. 이 표가 0.4 작업의 단일 체크리스트가 된다.
2. Preset.tsx 분해 → `./presets`(제네릭) + `./presets/rcm`(도메인) 서브패스. exports 맵 추가.
3. 배럴 재작성(화이트리스트) + @deprecated 마킹 + CHANGELOG BREAKING 절.
4. iconify→tabler 치환(3파일) + peer 재선언.
5. `ui-default` 서브패스: 기존 headless.tsx를 베이스로 스타일드 구현(rcm-* 클래스 입힌 버전) — 규모가 크므로 별도 이슈로 분리 가능, 0.4의 나머지와 독립.
6. SelectField/CardItem 색상맵 주입화 + RevisionField/Excel 로깅 옵션화.

## 수용 기준

- [ ] `src/listgrid/index.ts`에 `export *` 0건, 공개 심볼 수 ≤ 220 (스크립트로 계수해 CI 기록)
- [ ] 도메인 어휘(ENROLLED/PAID/MarketingField/DeviceTypes/SeoMetadata/AdjustmentType) grep → 코어 배럴 경로에서 0건, presets/rcm에만 존재
- [ ] 코어 필수 peer ≤ 4종 (react, react-dom, date-fns, @tabler/icons-react)
- [ ] `@headlessui` 직접 import가 ui-default 서브패스 밖에서 0건
- [ ] 기존 소비자 마이그레이션 가이드 + codemod가 MIGRATION.md에 존재
- [ ] 감사표의 "삭제" 항목 전부에 @deprecated TSDoc + CHANGELOG 고지
