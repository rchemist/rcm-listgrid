# ADR-0006 — 보안·엔터프라이즈 기준선: XSS·권한 기본값·i18n·a11y

**Status**: accepted · **Date**: 2026-07-10 · **선행**: 없음 (P0 항목 포함 — 즉시 착수 가능)
**근거**: raw/critique-enterprise(XSS critical 확정, simpleCrypt high→low 정정), raw/critique-host-coupling · PRD 조건 C4의 보안 절반

## Context (검증 정정 반영)

| 항목 | 실태 | 검증 판정 |
|---|---|---|
| XSS | HtmlField.tsx:34가 서버 값을 sanitizer 없이 `dangerouslySetInnerHTML` 렌더. ShowNotifications.tsx:90·ViewHelpIcon.tsx:28 동일 패턴. 리포 전체에 sanitize 라이브러리 0건 | **critical 확정** |
| 권한 게이트 | MenuPermissionChecker 미설정 시 무경고 `() => 'ALL'`(fail-open). 같은 계층 SessionProvider/MessageProvider는 경고를 내는데 이것만 침묵. 클라이언트 UI 게이트임(서버 인가 아님) | high 확정 |
| simpleCrypt | 하드코딩 폴백 키 'rcm-token-secret' — 단 공개 API로 도달 불가, 클라이언트 AES는 본질상 난독화 | high→**low** 정정 |
| 자동저장 | useEntityFormAutoSave.ts:88이 폼 값 원본 JSON을 sessionStorage 평문 저장 — PII 필드(전화/주소) 포함 가능 | low |
| i18n | 계약(configureTranslator)은 모범적이나 222개 파일 한국어 하드코딩. 검색 연산자 24종(SearchForm.ts:119-), 세션만료 모달(Type.ts:110-113), 한국어 원문이 키(`t('순서 변경')`) | high |
| a11y | headless Modal에 focus trap/role/aria-modal/Esc 없음(headless.tsx:136-153), 정렬 헤더 키보드 조작 불가(HeaderField.tsx:58-85), 에러 영역 aria-live 없음 | medium |

## Decision

1. **HTML sanitizer 주입 계약** (P0): `configureHtmlSanitizer((html: string) => string)` 신설. **미설정 시 HtmlField/ShowNotifications/ViewHelpIcon은 raw HTML 렌더를 거부**하고 이스케이프된 텍스트 + 개발 모드 console.warn으로 degrade한다 (secure-by-default). DOMPurify를 optional peer 예시로 문서화하되 번들하지 않는다. 기존 소비자 마이그레이션: 부트스트랩 1줄(`configureHtmlSanitizer(DOMPurify.sanitize)`).
2. **권한 게이트 기본값 단계 전환**: 0.3.x/0.4.x — 미설정 상태에서 첫 호출 시 console.warn 1회("메뉴 권한 검사가 설정되지 않아 전면 허용으로 동작") + 코드 주석의 'WRITE' 오기를 'ALL'로 정정. **v1.0 — 기본값을 deny로 전환**하고 명시적 permissive 옵트인(`registerMenuPermissionChecker(allowAll)`)을 요구. 이름도 `checkPagePermission`으로 중립화(@deprecated 별칭 유지).
3. **simpleCrypt**: encrypt/decrypt를 공개 표면에서 제거(ADR-0004 삭제 목록), cryptKey 미설정 시 폴백 대신 throw. hash/generateUUID만 유지.
4. **자동저장 PII**: `withAutoSaveExcluded()` 필드 옵션 신설 + PhoneNumber/Address 계열 기본 제외. 문서에 평문 저장임을 명시.
5. **i18n 전면화(코어 사용자 표면 우선)**: ① SearchForm 연산자 설명 24종 ② 세션만료 모달 ③ 리스트/폼 공통 문구(버튼/빈 상태/확인 다이얼로그) 를 `getTranslation().t('listgrid.…', fallbackKorean)` 로 이관 — **fallback을 한국어로 유지**하므로 기존 소비자 무변경. 키 네임스페이스 `listgrid.*` 확정, 한국어 원문 키 패턴 금지(lint: t() 인자 한글 검출 스크립트). 222개 파일 전체가 아니라 **사용자 가시 표면**부터 — 주석/로그는 범위 외.
6. **a11y 기준선**: headless Modal에 role="dialog"+aria-modal+Esc+초기 포커스, HeaderField 정렬에 tabIndex+Enter/Space(기존 CardItem 패턴 준용), 에러/알림에 aria-live. WCAG 2.1 AA를 목표 선언하되 이 3종을 v1 게이트로 한정.

## 기각한 대안

- **DOMPurify 하드 의존 번들** — 번들 크기 + 호스트가 이미 sanitizer를 가진 경우 중복. 주입 계약이 라이브러리의 기존 DI 철학과 정합.
- **권한 기본값 즉시 deny 전환** — 기존 소비자 화면이 일제히 잠기는 파괴적 변경. 경고→v1 전환의 2단계가 정직한 경로.
- **i18n 222개 파일 일괄 소탕** — 대부분 비가시(주석/내부 로그). 가시 표면 우선이 ROI 정답.

## 구현 계획 & 수용 기준

| 항목 | 계획 | 수용 기준 |
|---|---|---|
| sanitizer | configureHtmlSanitizer + 3개 싱크 교정 + 테스트(`<img onerror>` 페이로드가 미설정 시 텍스트로 렌더) | 미설정 시 raw HTML 렌더 경로 0 (테스트 고정) |
| 권한 경고 | DEFAULT_CHECKER 최초 호출 warn + 주석 정정 | 미설정 첫 호출에 warn 1회 (테스트) |
| simpleCrypt | 표면 제거 + throw | 공개 표면 grep 0건 |
| autosave | withAutoSaveExcluded + 기본 제외 | PII 필드 기본 미저장 (테스트) |
| i18n | 키 이관(가시 표면 3그룹) + 한글 키 검출 스크립트 | `t()` 한글 키 0건 · en 번역 맵 예제 제공 시 영어 화면 렌더 가능 |
| a11y | Modal/정렬/aria-live 3종 | vitest+testing-library로 포커스 트랩·키보드 정렬·role 존재 고정 |

전 항목 sonnet 실행 가능. 규모 합산 2~3pw (i18n 제외 시 1pw).
