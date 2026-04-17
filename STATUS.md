# @rcm/listgrid — 현재 상태

마지막 업데이트: 2026-04-17

이 문서는 **작업 재개용 단일 진입점**입니다. 아키텍처 결정과 과거 맥락은 `DECISIONS.md`에 있고, 이 문서는 **지금 어디에 있고 다음에 뭘 해야 하는지**만 정리합니다.

---

## 1. 프로젝트 개요

**목표**: 납품 프로젝트(gjcu-academic-front)의 `packages/ui/listgrid/`를 다른 프로젝트에서도 쓸 수 있는 범용 라이브러리 `@rcm/listgrid`로 추출.

**장기 제약**:
- React 전용 (Vue/Svelte 지원 안 함)
- Next.js는 선택적 (어댑터로 분리)
- UI 프레임워크(Tailwind/shadcn/HeroUI)에 강결합 금지 — 기본 UI는 라이브러리가 제공하되 호스트가 자유롭게 override 가능해야 함

**업계 표준 패턴 채택**:
- CSS 변수 (디자인 토큰) 
- scoped `rcm-*` 클래스
- `classNames` prop 슬롯 override
- `UIProvider.components` 프리미티브 교체
- Mantine/MUI/HeroUI와 동등한 4단계 override 경로

---

## 2. 리포지토리 / 워크트리 구조

| 역할 | 경로 | 브랜치 | 비고 |
|---|---|---|---|
| **라이브러리 소스** | `~/dev/rcm-listgrid` | `main` | `@rcm/listgrid` 패키지. TypeScript → `dist/`. |
| **릴리즈 repo** | `~/dev/rchemist-rcm-listgrid-release` | `main` | Maven-스타일 배포 repo. `deploy.sh`가 dist + 버전태그 push. github.com/rchemist/rchemist-rcm-listgrid-release |
| **실험용 호스트** | `~/IdeaProjects/gjcu-experiment/gjcu-academic-front` | `experiment/rcm-listgrid-swap` | gjcu 코드베이스에서 `@rcm/listgrid` 검증. |
| **메인 gjcu (참조)** | `~/IdeaProjects/gjcu-academic-backend/gjcu-academic-front` | `main` | 원본 참조용. 절대 수정하지 않음. |

---

## 3. 현재 단계: Stage 9 Phase 1.3 중간

**목표**: UI 프레임워크 독립(자체 CSS 기반) + 기본 UI 중립화.

**Phase 1.1 (완료)**: 자체 CSS 인프라
- `src/listgrid/styles/tokens.css` — CSS 변수 (색/폰트/간격/radius/shadow)
- `src/listgrid/styles/base.css` — scoped `rcm-*` 클래스 정의
- `utils/classNames.ts` — `mergeSlot` / `resolveSlots` 헬퍼
- `package.json` exports: `./styles.css`, `./styles/tokens.css`, `./styles/base.css`
- `build:styles` npm 스크립트 — `dist/styles.css` 합본 생성

**Phase 1.2 (진행 중)**: 필드 컴포넌트 `classNames` prop wiring — 아직 본격 시작 전, Phase 1.3에 병렬 진행

**Phase 1.3 (진행 중)**: Tailwind 문자열 → `rcm-*` 교체
- **최고 레버리지 완료**: `defaultListGridTheme.ts` + `defaultEntityFormTheme.ts` + variant 3종(main/modal/subCollection) **전면 중립화** — ViewListGrid/ViewEntityForm 하위 수십 컴포넌트가 자동 혜택
- **개별 완료**: InlineSubCollectionField/CardSubCollectionField/TableSubCollectionField 로딩 스피너, DataExporter, ExcelPasswordField, DynamicDataImporter, ViewEntityFormSkeleton, ViewListGridSkeleton
- **남음**: 약 527줄의 하드코딩 Tailwind 문자열이 개별 컴포넌트 JSX에 산재 (대부분 theme fallback 때문에 dead code 가능성)

---

## 4. 최근 커밋 (~/dev/rcm-listgrid, 최신순)

```
4e4a0b8 fix: FileFieldValue — 원본 전체 메서드 포팅 (isDirty/clone/addNewValue 등)
719bb8c fix: base.css @layer 제거 + 시각적 보강
bf23665 refactor: ListGrid theme variants (main/modal/subCollection) 중립화
93d0cab refactor: defaultEntityFormTheme 전면 중립화 — 폼 쪽 기본값도 rcm-*
f288cc1 docs: DECISIONS #58 — Phase 1.3 중간 진행 기록
a377114 refactor: defaultListGridTheme 전면 중립화 — 모든 기본값 rcm-* 로
c0a1080 refactor: ViewListGridSkeleton Tailwind/gjcu-커스텀 → rcm-skeleton 시스템
ed9cd01 refactor: ViewEntityFormSkeleton Tailwind/gjcu-커스텀 → rcm-skeleton 시스템
4afac28 refactor: 엑셀/임포터 로더 UI Tailwind → rcm-* 클래스
ea4e6a2 refactor: DataExporter Tailwind → scoped rcm-* 클래스
9aebd09 refactor: 서브컬렉션 필드 로딩 스피너 Tailwind → rcm-loading-overlay
c72fe0d feat: stage 9 baseline — misc.ts 원본 정렬 + Phase 1.1 자체 CSS 인프라
```

---

## 5. 배포 상태

| 버전 | 내용 | gjcu 실험 설치됨? |
|---|---|---|
| v0.1.0-alpha.6 | Stage 8 완료 (pre-Stage 9) | — |
| v0.1.0-alpha.7 | Phase 1.1 인프라 + Phase 1.3 부분 | — |
| v0.1.0-alpha.8 | base.css @layer 제거 + 시각적 보강 | — |
| **v0.1.0-alpha.9** | FileFieldValue 전체 포팅 | ✅ 현재 설치됨 |

호스트 pin 형식: `"@rcm/listgrid": "github:rchemist/rchemist-rcm-listgrid-release#v0.1.0-alpha.9"`

---

## 6. 검증 상태 (Playwright 자동 캡처)

**서버**: `localhost:9261` (gjcu 실험 워크트리, alpha.9 설치 중)

**로그인**: `admin` / `Asdf4567!@#$` (메모리: `reference_gjcu_dev_credentials.md`)

| 페이지 | 상태 | 비고 |
|---|---|---|
| `/` 대시보드 | ✅ 정상 | gjcu 자체 UI + 라이브러리 skeleton |
| `/academic/course` 수강신청 관리 | ✅ 정상 | 36,628건 실데이터, 12 컬럼, 페이지네이션 |
| `/academic/admission/homepage/notice` 입학공지 목록 | ✅ 정상 | 5건 실데이터 |
| `/academic/admission/homepage/notice/5` 상세 | 🟡 데이터 조회 API 에러 | 라이브러리 이슈 아닌 백엔드/API 이슈 |

**이전에 있던 블로커 (모두 해결됨)**:
- ❌→✅ `useSession must be within AuthProvider` — `(defaults)/layout.tsx` + `(fullpage)/layout.tsx`에 `RcmListGridProviders` 마운트로 해결
- ❌→✅ thead border 사라짐 — `base.css`에서 `@layer` 래퍼 제거로 해결 (Tailwind preflight와 cascade 경쟁)
- ❌→✅ `fileValue.isDirty is not a function` — `FileFieldValue` 전체 메서드 포팅으로 해결

---

## 7. 남은 이슈 / TODO

### P0 (검증 필요)
- [ ] alpha.9 재설치 후 Playwright로 `/academic/course` 재캡처 → 원본과 시각 비교 (외곽선/thead bg/min-width 복원 확인)
- [ ] 다른 ListGrid 페이지 스캔 (학과관리/등록관리 등) — 추가 regression 없는지

### P1 (Phase 1.3 마무리)
- [ ] 개별 컴포넌트 JSX 내부 527줄의 하드코딩 Tailwind 문자열 제거 (theme fallback이 대부분 커버하지만 dead code 청소)
- [ ] `tailwind-merge` 런타임 의존 유지 여부 결정 (호스트가 Tailwind 안 쓰면 불필요하지만 `classNames` prop에 Tailwind 넣는 호스트는 필요)

### P2 (Phase 1.2 / Phase B)
- [ ] 필드 컴포넌트 48개에 `classNames={{ root, input, error }}` prop wiring
- [ ] `UIProvider.UIComponents` interface의 48개 `ComponentType<any>` → proper prop type 정의

### P3 (향후)
- [ ] 완전 headless `@rcm/listgrid/headless` 엔트리 추출 (Phase 3)
- [ ] gjcu 실험 워크트리에서 원본 `@gjcu/ui/listgrid/` 디렉토리 완전 삭제 검증

---

## 8. 자주 쓰는 명령어

### 라이브러리 개발 (`~/dev/rcm-listgrid`)
```bash
cd ~/dev/rcm-listgrid
npm run type-check          # tsc --noEmit
npm run build               # tsc + copy CSS → dist/
npm run clean               # rm -rf dist
echo "0.1.0-alpha.X" | ./deploy.sh   # 버전 bump + release repo push
```

### 실험 워크트리 (`~/IdeaProjects/gjcu-experiment/gjcu-academic-front`)
```bash
# alpha.X 재설치 (lockfile 리셋 필수 — github 태그가 캐시되기 때문)
cd ~/IdeaProjects/gjcu-experiment/gjcu-academic-front
sed -i '' 's|v0.1.0-alpha.8|v0.1.0-alpha.9|' apps/admin/package.json
rm -rf node_modules/@rcm package-lock.json
npm install --legacy-peer-deps

# dev 서버 재시작 (9261 포트 — env.local의 NEXT_PUBLIC_FRONT_SITE와 일치)
lsof -ti:9261 | xargs kill -9 2>/dev/null
rm -rf apps/admin/.next
cd apps/admin && NODE_OPTIONS='--max-old-space-size=8192' npx next dev --turbo -p 9261
```

### Playwright 검증
1. Playwright MCP 도구 로드: `ToolSearch "select:mcp__playwright__browser_navigate,..."`
2. 로그인: `admin` / `Asdf4567!@#$` (자동 채워짐)
3. 페이지 네비게이션 → 스크린샷

---

## 9. 주요 파일 맵

### 라이브러리 (`~/dev/rcm-listgrid/src/listgrid/`)
- `styles/tokens.css` — CSS 변수 (브랜드 color는 여기만 바꾸면 됨)
- `styles/base.css` — scoped `rcm-*` 클래스 정의. **`@layer` 밖에 있음** (Tailwind preflight 회피)
- `ui/UIProvider.tsx` — 48개 UIComponents contract + `FileFieldValue` class + `readonlyClass`
- `utils/classNames.ts` — `mergeSlot`/`resolveSlots` 헬퍼
- `utils/cn.ts` — `cn()` (clsx + tailwind-merge)
- `auth/AuthContext.tsx` — `AuthProvider`/`useSession` (엄격 체크)
- `components/list/themes/defaultListGridTheme.ts` — **중립화된 기본 테마**
- `components/list/themes/variants/{main,modal,subCollection}Theme.ts` — 중립 variant
- `components/form/themes/defaultTheme.ts` — **중립화된 기본 폼 테마**
- `misc/index.ts` — 원본 `@gjcu/ui` 시맨틱 정확히 이식된 유틸 모음

### 호스트 어댑터 (`~/IdeaProjects/gjcu-experiment/gjcu-academic-front/apps/admin/src/rcm-adapters/`)
- `RcmAdapters.ts` — 런타임 서비스(API/messages/i18n/auth) 주입. 부팅 시 1회.
- `UIAdapter.ts` — gjcu `@gjcu/ui` 컴포넌트 48개 → `UIComponents` 매핑.
- `RcmProviders.tsx` — `<RouterProvider>+<UrlStateProvider>+<AuthProvider>+<UIProvider>` 콤보.

### 호스트 레이아웃 (`~/IdeaProjects/gjcu-experiment/gjcu-academic-front/apps/admin/src/app/`)
- `layout.tsx` — 루트. `@rcm/listgrid/styles.css` import.
- `(defaults)/layout.tsx` — 인증된 admin 페이지. **`RcmListGridProviders` 마운트**.
- `(fullpage)/layout.tsx` — 풀페이지 UI. **`RcmListGridProviders` 마운트**.
- `(auth)/layout.tsx` — 로그인/가입. `RcmListGridProviders` 없음 (불필요).

---

## 10. 아키텍처 결정 요약 (상세는 DECISIONS.md)

| # | 결정 | 핵심 |
|---|---|---|
| #57 | 자체 CSS 기반 도입 (Phase 1.1) | `styles/{tokens,base}.css` + scoped `rcm-*` + `@layer` → 이후 제거 |
| #58 | Phase 1.3 중간 진행 | 테마 파일 전면 중립화가 최고 레버리지 |
| (#59 예정) | base.css `@layer` 제거 | Tailwind preflight와의 cascade 경쟁에서 지는 문제 해결 |

---

## 11. 재개 시 체크리스트

새 세션 시작 시:

1. 이 STATUS.md 읽기
2. `~/dev/rcm-listgrid`: `git log --oneline -15` 로 최근 변경 확인
3. `~/IdeaProjects/gjcu-experiment/gjcu-academic-front`: 설치된 @rcm/listgrid 버전 확인
   ```bash
   grep version ~/IdeaProjects/gjcu-experiment/gjcu-academic-front/node_modules/@rcm/listgrid/package.json
   ```
4. dev 서버 상태: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9261`
5. 남은 Tailwind 카운트: 
   ```bash
   cd ~/dev/rcm-listgrid/src && grep -rEc 'className="[^"]*\btext-(red|blue|gray|amber|indigo)-' --include="*.tsx" | awk -F: '{s+=$2}END{print s}'
   ```

---

## 12. 참고

- 메모리 (`~/.claude/projects/.../memory/MEMORY.md`): 
  - `project_rcm_listgrid_extraction.md` — 이 프로젝트 메모
  - `feedback_long_session_style.md` — 끝까지 밀어붙이는 스타일 선호
  - `reference_gjcu_dev_credentials.md` — admin / Asdf4567!@#$
- `DECISIONS.md` — 아키텍처 결정 이력 (진실원)
- `README.md` — 라이브러리 사용자용 문서 (아직 Phase 1 반영 전)
