# 다음 세션 실행 가이드 — v0.2 backlog (테스트 포팅 완성 + `any` 정리)

> 목표: alpha.44 에서 연기된 2 개 backlog 항목을 한 세션에서 완료.
> 전제: alpha.44 배포 완료. OSS 공개 준비 완료 (Apache-2 / 테스트 infra / CI / README / 린트).
> 스타일: 메인 context 보호 + 에이전트 병렬 dispatch (alpha.36 에서 검증된 패턴).

---

## 0. 세션 시작 시 메인이 먼저 할 일

1. **이 문서 끝까지 읽기**.
2. `STATUS.md` 0-1 섹션 (배포 이력) 빠르게 훑기.
3. `DECISIONS.md` 최근 엔트리 (#59~#63) 훑어 메인 context 보호 원칙 복습.
4. 아래 "§ 2 에이전트 dispatch 플랜" 그대로 실행.

**메인 세션 context 보호 원칙** (alpha.36 에서 확립):
- 큰 파일 (base.css, primitives.css, EntityForm.tsx 등) 은 메인이 직접 읽지 말 것
- 에이전트가 읽고 고정 포맷 리포트 반환
- 메인은 **집계 + 빌드 + 커밋 + 배포** 만 담당
- 블록별 commit 분리로 롤백 가능성 유지

---

## 1. 현재 상태 요약 (alpha.44 기준, 2026-04-19)

### OSS 공개 준비 완료
- ✅ LICENSE Apache-2.0
- ✅ `package.json`: `license: "Apache-2.0"`, `private: false`, description / keywords / author
- ✅ README.md 소비자용 (Install / Quick start / Theming / Architecture)
- ✅ `docs/PRIMITIVES.md` primitive 카탈로그 (272줄)
- ✅ `docs/ROADMAP.md` 내부 로드맵 (구 README)
- ✅ `.github/workflows/ci.yml` (type-check / lint / test / build)
- ✅ `.eslintrc.json` + `.prettierrc.json`
- ✅ vitest + testing-library 설치, `npm test` 스크립트
- ✅ console.log/debug 69 → 9 (performanceLogger 의 gated 만 유지)
- ✅ `@ts-ignore` 3 → 0
- ✅ 루트 정리 (PNG/`=`/.mcp.json/.idea/.claude 제거 + gitignore 보강)
- ✅ CSS 아키텍처 (tokens → primitives → layouts → components → base)
- ✅ 다크 모드 토큰 (`@media prefers-color-scheme: dark` + `[data-theme="dark"]`)
- ✅ framework-free (Tailwind 하드코딩 0건)

### 이번 세션 목표 (v0.2 backlog)

#### Task A — 포팅 실패 테스트 5 파일 완성
현재 `vitest.config.ts` 에서 exclude 처리된 파일:
1. `src/listgrid/config/__tests__/InlineSubCollectionField.test.ts`
2. `src/listgrid/config/__tests__/CardSubCollectionField.test.ts`
3. `src/listgrid/components/list/ui/__tests__/InlineSubCollectionView.test.tsx`
4. `src/listgrid/components/list/ui/__tests__/CardSubCollectionView.test.tsx`
5. `src/listgrid/components/list/hooks/__tests__/useCardSubCollectionData.test.ts`

**실패 원인** (에이전트가 해결해야 함):
- `require('../../ViewListGrid')` CJS 사용 — ESM import 로 전환
- vitest mock hoisting 규칙 (vi.mock 은 import 문보다 상단에 위치해야 함)
- mock 구조가 vitest 와 맞지 않음 (일부 케이스)

**완료 기준**: 5 파일 모두 `npm test` 에서 pass, vitest.config.ts 의 exclude 블록 삭제.

#### Task B — `any` 타입 451개 정리

**전체 통계** (grep 기준):
- 총 457개 (parameter/return/assertion 포함, 테스트 파일 포함)
- 상위 10 파일 (개수 순):
  1. `src/listgrid/transfer/Type.ts` (24)
  2. `src/listgrid/components/fields/view/CardManyToOneView.tsx` (16)
  3. `src/listgrid/message/MessageProvider.ts` (15)
  4. `src/listgrid/misc/index.ts` (14)
  5. `src/listgrid/form/SearchForm.ts` (14)
  6. `src/listgrid/config/EntityForm.tsx` (14)
  7. `src/listgrid/config/Config.ts` (14)
  8. `src/listgrid/components/fields/view/SelectBoxManyToOneView.tsx` (13)
  9. `src/listgrid/config/OnChangeEntityForm.ts` (11)
  10. `src/listgrid/components/list/types/ViewListGrid.types.ts` (10)

**분류** (에이전트가 판단):
- **의도된 any (유지)**:
  - Generic EntityForm / FormField 의 data payload 는 설계상 `any` (임의 entity 스키마)
  - UIProvider wrappers (`ComponentType<any>`) — DECISIONS #21 명시
  - Stub 파일 (`src/_stubs/*.d.ts`) 있다면 유지
- **개선 가능 (제거 또는 concrete type)**:
  - 함수 parameter `any` 중 호출처가 단일 타입이면 추론 가능
  - Return type `any` 중 내부 로직이 한 가지 타입 반환이면 추론 가능
  - `catch (e: any)` → `catch (e: unknown)` + type guard
  - `as any` 중 불필요한 캐스트

**실용적 목표**: 457 → 200 미만. "의미 없는 any" 제거. `noImplicitAny: true` 활성화 가능 여부 평가.

**완료 기준**: 
- type-check PASS
- any count 측정 후 STATUS.md 에 기록
- `tsconfig.json` 의 `noImplicitAny: false` → 가능하면 `true` 승격

---

## 2. 에이전트 dispatch 플랜

### 단계 1 — Task A (테스트 포팅) 에이전트 1 개 → 순차 실행

```
@rcm/listgrid 테스트 포팅 마무리.

전제:
- alpha.44 에서 vitest + testing-library 설정 완료
- 일부 테스트는 이미 통과 중 (3 파일 / 33 tests)
- 5 파일이 포팅 미완 상태로 vitest.config.ts 에서 exclude 됨

대상 파일 (모두 /Users/kunner/IdeaProjects/rcm-listgrid/ 기준):
1. src/listgrid/config/__tests__/InlineSubCollectionField.test.ts
2. src/listgrid/config/__tests__/CardSubCollectionField.test.ts
3. src/listgrid/components/list/ui/__tests__/InlineSubCollectionView.test.tsx
4. src/listgrid/components/list/ui/__tests__/CardSubCollectionView.test.tsx
5. src/listgrid/components/list/hooks/__tests__/useCardSubCollectionData.test.ts

알려진 이슈:
- 각 파일 상단에 `import { ... , vi } from 'vitest'` 이미 추가되어 있음
- jest.mock/jest.fn 은 vi.mock/vi.fn 으로 이미 치환됨
- 실패 원인: require('...') 사용, vi.mock hoisting, mock 구조 불일치

작업 규칙:
1. 각 파일을 읽고 실패 원인 파악 (vitest 실행 결과: `npx vitest run <file>`)
2. require() → import 변환 (모듈 레벨로 이동)
3. vi.mock('...', () => (...)) 은 파일 상단에 배치 (hoisting)
4. 필요 시 beforeEach(() => { vi.clearAllMocks(); }) 추가
5. 한 파일씩 통과 시키면서 진행 (실패 원인 파악 → 수정 → 실행 → 반복)
6. 5 파일 모두 통과하면 vitest.config.ts 의 exclude 블록에서 5 줄 제거

검증:
- cd /Users/kunner/IdeaProjects/rcm-listgrid && npm test → 모든 테스트 pass
- npm run type-check → PASS

반환 포맷:
```
## Task A — 테스트 포팅 완료

### Files modified
- ... (수정 파일 나열)

### Fix summary per file
- InlineSubCollectionField: require → import (3 곳), vi.mock hoisting 수정, beforeEach 추가
- ...

### Before / after
- Passing tests: 33 → N
- Test files: 3 / 3 → M / M
- vitest.config.ts exclude 항목: 5 → 0

### Build status
- npm test: PASS / N passed
- npm run type-check: PASS
```

끝.
```

### 단계 2 — Task B (`any` 정리) 에이전트 3 개 → 병렬 dispatch

파일을 3 개 영역으로 분담:

- **에이전트 B-1** — `config/` + `form/` + `misc/` + `message/`
- **에이전트 B-2** — `components/fields/` + `components/form/` + `components/helper/`
- **에이전트 B-3** — `components/list/` + `transfer/` + `ui/` + `revision/`

각 에이전트 프롬프트 (공통 템플릿, 담당 파일만 교체):

```
@rcm/listgrid 의 `any` 타입 정리. 담당 영역: [X].

배경:
- alpha.44 기준 src/ 내 any 457 개
- v0.2 로 noImplicitAny: true 승격 목표
- Stage 3 stub 잔재 + generic entity form 의 의도된 any 혼재

담당 파일 / 디렉토리 (존재하는 것만):
- [에이전트별 파일 목록]

작업 규칙:
1. 각 `: any` 또는 `as any` 에 대해 판단:
   - (A) 의도된 any (유지): generic entity/field 의 data payload, UIProvider wrapper props, catch (e: any) 가 필요한 레거시 케이스
   - (B) 추론 가능 (제거): 호출처가 단일 타입 / return 이 단일 타입 / 불필요한 assertion
   - (C) unknown + type guard 로 승격: catch (e), 외부 입력 검증, JSON.parse 결과
2. (B), (C) 만 수정. (A) 는 유지하되 짧은 주석으로 이유 명시
3. 파일별 type-check: `npm run type-check` (전체), 증분은 `tsc --noEmit <file>`
4. 관련 consumer 가 깨지면 (다른 파일의 expected any 로 인해) 해당 파일 공유 인터페이스 조정 가능. 단 scope 밖 파일은 건드리지 말 것
5. 완료 후 `npm run type-check` 전체 PASS

반환 포맷:
```
## Task B — any 정리 (영역: [X])

### Files modified
- ... (파일별)

### Any count before / after (per file)
- src/listgrid/X/Y.ts: N → M
- ... (합계)

### Patterns applied
- catch (e: any) → catch (e: unknown) + type guard (N 곳)
- parameter any → concrete type (호출처 분석, M 곳)
- as any → 제거 (K 곳)
- 의도된 any 유지 (사유: generic entity payload, L 곳)

### Build status
- npm run type-check: PASS
```

끝. 다른 영역 건드리지 말 것.
```

### 단계 3 — 메인 집계
- 4 개 에이전트 리포트 수신
- `grep -rE ":\s*any\b|as\s+any\b" src --include='*.ts' --include='*.tsx' | wc -l` 로 최종 수치
- `tsconfig.json` 의 `noImplicitAny: false` → `true` 시도. 실패 시 에러 목록 정리 후 재-dispatch
- npm run type-check + npm run build 통과 확인
- 블록별 commit:
  - Task A (tests): 단일 commit
  - Task B-1/B-2/B-3: 에이전트별 commit 또는 합친 commit

### 단계 4 — 배포 + 문서 업데이트
```bash
echo "0.1.0-alpha.45" | ./deploy.sh
git add package.json package-lock.json && git commit -m "chore: bump to 0.1.0-alpha.45"

cd /Users/kunner/dev/gjcu-experiment/gjcu-academic-front
sed -i '' 's|v0.1.0-alpha.44|v0.1.0-alpha.45|' apps/admin/package.json
rm -rf node_modules/@rcm package-lock.json
npm install --legacy-peer-deps

lsof -ti:9261 | xargs kill -9 2>/dev/null
rm -rf apps/admin/.next
cd apps/admin && NODE_OPTIONS='--max-old-space-size=8192' npx next dev --turbo -p 9261 > /tmp/rcm-admin-dev.log 2>&1 &
disown
sleep 4
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:9261   # 303 기대
```

STATUS.md, DECISIONS.md 업데이트:
- alpha.45 이력 추가
- noImplicitAny: true 결과 기록
- any 최종 수치 기록
- 테스트 최종 수치 기록
- DECISIONS.md 새 엔트리: "#64 v0.2 backlog 소진 — strict 타입 + 테스트 커버리지"

---

## 3. 위험 요소

1. **테스트 `require()` 를 다 import 로 변환하면 순환 의존 발생 가능성** — 에이전트 리포트 확인 필요
2. **any 제거 시 consumer breakage** — 예: `SearchForm` 의 generic 파라미터가 any 인데 concrete type 으로 바꾸면 수십 파일에서 타입 에러. 에이전트가 scope 밖 파일 건드리지 않도록 강조
3. **noImplicitAny: true 가 수십 개 에러 유발 가능성** — Stage 1 에서 의도적으로 false 로 설정. 승격 시 추가 any 명시 또는 stub 수정 필요
4. **에이전트 리포트 구조 이탈** — alpha.36 세션에서 한 번 경험. 프롬프트에 "정확히 이 구조" 강조
5. **시각 회귀** — 이번 작업은 CSS 영향 없으므로 시각 회귀 위험 낮음. HTTP 303 만 확인

---

## 4. 롤백

각 alpha 는 독립 commit:
```bash
git reset --hard <commit_of_alpha.44>
cd /Users/kunner/dev/gjcu-experiment/gjcu-academic-front
sed -i '' 's|v0.1.0-alpha.45|v0.1.0-alpha.44|' apps/admin/package.json
```

---

## 5. 성공 기준 (한 세션 완료)

- [ ] 모든 테스트 파일이 `npm test` 에서 pass (exclude 목록 0)
- [ ] `any` 수치 457 → 200 미만
- [ ] `tsconfig.json`: `noImplicitAny: true` 시도 결과 기록 (성공 시 승격, 실패 시 남은 에러 목록 이슈화)
- [ ] deploy.sh alpha.45 + gjcu 재설치 + HTTP 303
- [ ] STATUS.md + DECISIONS.md 업데이트

---

## 6. 새 세션 진입 프롬프트

아래를 새 세션에 그대로 붙여넣기:

```
@rcm/listgrid v0.2 backlog 정리. 현재 alpha.44 배포 완료.

먼저 docs/NEXT_SESSION.md 끝까지 읽고 그대로 실행:
1. Task A — 테스트 5 파일 포팅 (에이전트 1개, § 2 단계 1 프롬프트)
2. Task B — any 457개 정리 (에이전트 3개 병렬, § 2 단계 2 프롬프트, 영역 분담)
3. 집계 + type-check + build + commit (블록별)
4. noImplicitAny: true 승격 시도
5. deploy.sh alpha.45 → gjcu 재설치 → HTTP 303
6. STATUS.md + DECISIONS.md 최종 업데이트

목표: 한 턴에서 v0.2 backlog 2 개 항목 소진, alpha.45 배포.
메인 컨텍스트 보호 원칙 준수 (큰 파일은 에이전트가 읽음). 블록별 commit 분리.

막히면 STATUS.md + DECISIONS.md + NEXT_SESSION.md 참조.
```
