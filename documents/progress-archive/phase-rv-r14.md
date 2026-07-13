# Phase RV-R14 — 사후 전수리뷰 하드닝 (Complete)

**Status**: ✅ Complete
**Parent PROGRESS**: [../PROGRESS.md](../PROGRESS.md)
**Commits**: `0a12554`, `c7a8312`, `20b9f1d`, `50ce705`

## 완료 내용

- 저장 전 구간 input/action 잠금과 중복 save promise 병합.
- `react-daum-postcode`를 modal-open dynamic import로 전환하고 optional peer 소비자 smoke 추가.
- `file-saver` default interop으로 `/excel` native Node ESM 로드 수정.
- validation generation counter로 동일 값 중첩 async 결과의 최신 실행 우선 보장.
- `fieldErrors[]`와 `globalErrors[]`를 독립 복수 채널로 구현.
- reload의 fetched baseline을 store data로 옮겨 이후 동적 field도 최신 DB 값을 사용.
- custom-render action이 `enabled`와 saving 잠금을 준수.
- coverage를 `packages/*/src`와 sample lib까지 확대하고 threshold를 45/39/47/44로 상향.
- id가 없는 form은 store renderType과 무관하게 create만 호출하도록 `getId()!`를 제거.

## 검증

- Vitest: 192 files, 2509 passed, 1 todo.
- Coverage: statements 45.30%, branches 39.64%, functions 48.01%, lines 44.92%.
- Playwright: 71 passed.
- Next production build: 43 pages.
- package build/publint/attw/headless/codemod/type-check/format green.
- tarball smoke: optional address peer 없이 root CJS/ESM, `/excel` CJS/ESM 전건 load.
- lint: 0 errors, 기존 warnings만.

## 결정과 함정

- **Reuse**: `FormStoreState.saving/setSaving`.
- **Extend**: `fields[name].errors + globalErrors`, fetchedData closure→store data.
- **New**: validation generations. 값 비교만으로 동일 값의 두 async 실행 순서를 판별할 수 없다.
- Next build가 optional peer 경계의 함수 분산 타입 오류를 검출했다. 외부 component는 `unknown` 경계 단언 후 내부 최소 contract로 사용한다.
- `EntityForm.getRenderType()`은 원래 id 기반이었다. 호출부도 entityId 단일 분기를 사용해 불변식을 드러낸다.

## 다음 Phase 인계 (Handoff)

- 엔진 하드닝을 다시 설계하지 않는다. EF-SP는 현재 공개 동작을 sample에서 증명하고 결함만 red-first로 수정한다.
- `packages/state/src/form-controller.ts`의 saving snapshot/id 분기를 보존한다.
- address optional peer와 Excel native ESM smoke를 계속 full gate에 포함한다.
