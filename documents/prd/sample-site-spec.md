# apps/sample — 내장 샘플 사이트 명세

**작성**: 2026-07-10 · **Status**: active · **위치**: 모노레포 `apps/sample` (npm workspaces)
**사용자 요구(2026-07-10)**: "소비처에서 CSS나 provider나 wrapper 같은 걸 설정할 수 있게 확장 가능한 구조여야 하고, 프로젝트 내부에 sample 사이트가 있어야 해."

## 목적 (4가지 — 전부 상시 게이트)

1. **quick-start 검증**: getting-started 문서의 모든 단계가 이 앱에서 실제로 동작한다 — 문서와 앱이 어긋나면 문서 버그.
2. **alpha 데모 차량**(ADR-0008 방지장치 5): 매 `0.4.0-alpha.N`이 이 앱에서 돌아가야 한다 — "돌아가는 알파"의 정의가 곧 이 앱.
3. **개념 헌장 시연**: C1~C9 각각이 이 앱의 특정 페이지/시나리오로 시연 가능해야 GA(헌장 §보존 검증 2).
4. **확장성 증명**: 아래 §확장성 시연 6종 — 소비처 커스터마이즈가 포크 없이 됨을 코드로 증명.

## 스택·구조

- Next.js(App Router) + `@rchemist/listgrid` **workspace 참조** (npm 배포본이 아니라 로컬 패키지 — 이식 중 즉시 검증 루프).
- **목업 백엔드 내장**: Next route handlers가 rcm-backend-framework 0.1.0 envelope(POST {url}/search, bare-entity GET 등)로 fixture 데이터를 서빙 — `backend-rcm` 어댑터의 살아있는 통합 테스트를 겸한다. **외부 의존 0**: `npm run dev -w apps/sample` 단독 기동.
- fixture는 메모리 저장(재기동 시 리셋) — CRUD 왕복이 실제로 반영되어야 한다(읽기 전용 금지).

## 도메인 모델 (관계 3종 전부 커버 — C3 시연)

| 엔티티 | 역할 |
|---|---|
| `Department` | 트리 구조 — ManyToOne 트리뷰·자기참조 시연 |
| `Employee` | **필드 다양성 표본**: string/number/date/datetime/select/multiselect/boolean/phone/email/address/image/textarea/color… + M2O(department) + 조건부 정책(C2: 재직상태에 따른 hidden/readonly) + 검증(C5) |
| `Project` | O2M(tasks SubCollection 인라인) + M2M(members SubCollection ↔ Employee) + 탭/필드그룹/스텝(C6) |

## 페이지

- 엔티티 3종 × 리스트/상세/생성 (C1·C9: 검색·필터·정렬·페이지네이션·URL 동기화·컬럼선택·일괄작업 전부 동작)
- `/theming` — CSS 토큰 오버라이드 라이브 데모(브랜드 색·라운드·폰트 전환, 다크모드 토글)
- `/extensibility` — 아래 6종 시연을 한 화면씩
- 엑셀 import/export·리비전·자동저장은 Employee 상세에서 시연(C6)

## 확장성 시연 6종 (사용자 요구의 집행 형태 — GA 게이트)

| # | 시연 | 증명하는 것 |
|---|---|---|
| E1 | CSS 토큰만으로 브랜드 변경 (styles.css 뒤 `:root` 오버라이드) | 포크 없는 룩앤필 소유 1단 |
| E2 | `classNames` 슬롯으로 특정 인스턴스만 스타일 변경 | 2단 |
| E3 | UIProvider로 프리미티브 1종 교체 (예: Modal을 호스트 구현으로) | 3단 — UI킷 자유 |
| E4 | 커스텀 필드 타입 등록 (필드 클래스 1개 + 렌더러 등록 1회) | C4 "클래스 1 + 렌더러 1로 닫힘" |
| E5 | 자체 wrapper 작성 (권한 게이트를 호스트 정책으로 감싼 ViewListGrid 래퍼) | wrapper 확장 |
| E6 | BackendAdapter 교체 (rcm ↔ rest 목업 전환 스위치) | C8 in-out 어댑터 |

## 페이즈별 성장 (로드맵과 동기)

| 페이즈 | 이 앱의 상태 |
|---|---|
| P1 | 스캐폴드: 홈 + 목업 백엔드 + "패키지 로드 확인" 페이지 |
| P3 | 파일럿 필드(StringField) 렌더 데모 |
| P5 | 엔티티 3종 리스트/폼 완성 + /theming |
| P6 | /extensibility 6종 + 어댑터 스위치 |
| P7 (GA) | 헌장 C1~C9 대조표의 시연 열이 전부 이 앱의 페이지를 가리킴 |

## 수용 기준

- [ ] `npm run dev -w apps/sample` 단독 기동, 외부 서비스 의존 0
- [ ] CRUD 왕복(생성→리스트 반영→수정→삭제)이 3 엔티티 전부에서 동작
- [ ] E1~E6 각각 독립 페이지/토글로 시연 가능
- [ ] getting-started의 코드 블록이 이 앱의 실제 코드와 일치(복붙 검증)
