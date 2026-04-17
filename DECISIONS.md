# Decision Log

이 리포에서 내려진 모든 비자명한 결정의 기록.

## 규칙

- **Append-only**: 과거 엔트리는 수정/삭제하지 않는다. 틀린 결정도 기록으로 남겨야 학습된다.
- **결정이 번복되면 새 엔트리로 작성**하고 이전 엔트리를 참조(`Reverses: 2026-04-17 #3`).
- **결정 직후 작성**. "나중에 기록하자"는 대부분 기록 안 됨.
- **Why를 반드시 쓴다**. What만 쓰면 6개월 뒤 의미 없음.
- Open Questions 섹션에 미결 이슈를 쌓고, 결정되면 해당 날짜 로그로 옮긴다.

---

## 2026-04-17

### #1 납품 프로젝트와 분리, 단방향 sync
`gjcu-academic-front/packages/ui/listgrid`에 손대지 않고 별도 리포(`~/dev/rcm-listgrid`)로 작업.
동기화 방향: `gjcu` → 이 리포 (단방향, 수동 cherry-pick).
**Why**: 납품 일정 영향 차단. 범용화 실험이 제품 코드를 흔들지 않게.

### #2 패키지명 `@rcm/listgrid`, 단일 패키지 구조
모노레포/Turbo 도입 안 함. `src/` 하나짜리 단순 패키지.
**Why**: 과설계 방지. headless/adapter 분리가 실제 필요해지면 그때 쪼갠다.

### #3 React peerDep `>=18` (원본은 19 사용)
peerDependencies로만 react를 선언. 버전 범위는 18 이상.
**Why**: 이 라이브러리 도입 희망 프로젝트가 React 19 강제되면 채택 장벽이 생김. 19-only 문법을 쓰지 않는 한 18 호환 유지.

### #4 Stage 0→6 로드맵 (껍질 → 안쪽 순서)
리팩토링 순서: Scaffolding → Inert Copy → Auth 분리 → UI 프리미티브 추상화 → 외부 라이브러리 정리 → 백엔드 계약 명시화 → 필드/폼 로직 정리.
**Why**: 안쪽(필드 로직)부터 건드리면 바깥 껍질(UI 프리미티브) 변경 시 재작업 발생. 의존성 방향의 역순으로 푸는 것이 재작업 최소.

### #5 "Inert Copy" 단계를 첫 리팩토링 전에 별도 커밋
원본 파일을 수정 없이 `src/`로 복사만 한 상태를 `c227d2b` 커밋으로 박음.
**Why**: 이후 리팩토링에서 회귀 의심 시 "원본은 어땠지?"의 기준점 확보. `git diff c227d2b -- src/<file>`로 즉시 비교 가능.

### #6 Stage 1 마무리는 "빠른 길" 선택
외부 의존성은 원본 `package.json`에서 그대로 복사. `@gjcu/*` 임포트는 stub(타입만 any/unknown으로 선언)로 처리. 의존성 가지치기는 Stage 4의 일.
**Why**: Stage 1 목적은 "타입체크 통과하는 baseline 확보"이지 의존성 정리가 아님. 범위 섞으면 진척 판단 어려움.

### #7 DECISIONS.md 도입, README에 Stage 완료 기준 명시
모든 비자명한 결정을 append-only 로그로 기록. 각 Stage는 `Done when:` 체크리스트로 완료 판단.
**Why**: 장기 리팩토링에서 가장 흔한 실패는 "왜 그렇게 했는지 아무도 모르는 상태". 결정 직후 기록이 유일한 방어선.

---

## Open Questions

작업 중 떠오른 미결 이슈. 결정되면 날짜 로그로 이동.

- **UI 킷 주입 계약**: 첫 어댑터를 HeroUI / shadcn / tailwind-only 중 어디로 만들지. Stage 3에서 결정.
- **외부 라이브러리 분류**: flatpickr / tiptap / kakao-map / xlsx-js-style 등을 core 번들에 둘지 optional peer로 뺄지. Stage 4에서 결정.
- **rcm-framework 백엔드 API 계약**: 응답/요청 스키마를 어디서 어떻게 타입화할지. 백엔드 OpenAPI/Swagger 스펙이 있으면 그걸로 생성, 없으면 수동 정의. Stage 5에서 결정.
- **패키지 배포 채널**: 사내 npm registry / GitHub Packages / 그냥 git 의존성 중 무엇으로 배포할지. 첫 외부 소비자가 정해질 때 결정.
- **테스트 전략**: 원본에 있던 `config/__tests__`를 그대로 가져왔음. jest 설정을 새로 구성할지, Stage 6에서 재작성할지 미정.
