# @rcm/listgrid — 현재 상태

마지막 업데이트: 2026-04-17 (alpha.18 revert)

이 문서는 **작업 재개용 단일 진입점**입니다. 아키텍처 결정과 과거 맥락은 `DECISIONS.md`에 있고, 이 문서는 **지금 어디에 있고 다음에 뭘 해야 하는지**만 정리합니다.

---

## 0. 지금 당장 알아야 할 것

**배포된 현재 버전**: `v0.1.0-alpha.18` (gjcu-experiment에 설치 + dev 서버 9261 구동 중)

**alpha.18 = alpha.15 + revert**:
- alpha.16/17의 Tailwind CLI 빌드 파이프라인은 **잘못된 방향으로 판명 → 전면 revert**
- 두 Tailwind-compiled CSS가 같은 namespace(`flex`, `hidden`, `lg:flex`)를 공유하면 cascade 충돌이 원천적으로 불가피
- 원래 합의된 방향(라이브러리 JSX를 `rcm-*` scoped 클래스로 전수 교체)이 유일 정답으로 확정

**바로 이어서 할 일**: rcm-* 전수 마이그레이션 (63 파일 590줄 남음)

---

## 1. 프로젝트 개요

**목표**: 납품 프로젝트(gjcu-academic-front)의 `packages/ui/listgrid/`를 다른 프로젝트에서도 쓸 수 있는 범용 라이브러리 `@rcm/listgrid`로 추출.

**핵심 원칙 (재확인)**:
- React 전용 (Vue/Svelte 지원 안 함)
- Next.js는 선택적 (어댑터로 분리)
- **UI 프레임워크 독립** — 라이브러리 JSX는 Tailwind utility 쓰지 않음. `rcm-*` scoped 클래스 전용.
- 호스트는 `@rcm/listgrid/styles.css` 한 줄 import로 완전 동작. Tailwind 설치/설정 필수 아님.
- 브랜드 override는 CSS 변수 (`--rcm-color-primary` 등)

---

## 2. 리포지토리 / 워크트리 구조

| 역할 | 경로 | 브랜치 |
|---|---|---|
| **라이브러리 소스** | `~/dev/rcm-listgrid` | `main` |
| **릴리즈 repo** | `~/dev/rchemist-rcm-listgrid-release` | `main` |
| **private 저장소** | github.com/rchemist/rcm-listgrid | `main` |
| **실험용 호스트** | `~/IdeaProjects/gjcu-experiment/gjcu-academic-front` | `experiment/rcm-listgrid-swap` |
| **원본 참조** | `~/IdeaProjects/gjcu-academic-backend/gjcu-academic-front` | 수정 금지 |

**실험 워크트리 dev 서버**: `localhost:9261` (env.local의 PORT=9261)

**로그인**: admin / Asdf4567!@#$ (메모리의 `reference_gjcu_dev_credentials.md`)

---

## 3. 배포 이력

| 버전 | 내용 | 현재 상태 |
|---|---|---|
| 0.1.0-alpha.15 | rcm-* 작업 진행 중, 필드그룹 타이틀/라벨/helpText 등 교체 완료 | 직전 안정 |
| 0.1.0-alpha.16 | ❌ Tailwind CLI 시도 — 호스트 CSS 전부 깨먹음 | revert됨 |
| 0.1.0-alpha.17 | ❌ Tailwind utilities-only — cascade 충돌 여전, login 페이지 레이아웃 깨짐 | revert됨 |
| **0.1.0-alpha.18** | revert: Tailwind CLI 제거, alpha.15 상태로 복귀 | ✅ **현재 설치** |

---

## 4. 이미 완료된 rcm-* 전환 (유지되어 있음)

### 테마 파일 (중립화 완료)
- `src/listgrid/components/list/themes/defaultListGridTheme.ts` — ListGrid 기본 테마 전면 rcm-*
- `src/listgrid/components/list/themes/variants/{main,modal,subCollection}Theme.ts` — variant 3종
- `src/listgrid/components/form/themes/defaultTheme.ts` — EntityForm 기본 테마

### 개별 컴포넌트 완료
- `InlineSubCollectionField` / `CardSubCollectionField` / `TableSubCollectionField` 로딩 스피너
- `DataExporter` / `ExcelPasswordField` / `DynamicDataImporter`
- `ViewEntityFormSkeleton` / `ViewListGridSkeleton` (rcm-skeleton 시스템)
- `ViewFieldGroup` 타이틀/description/collapse
- `FieldRenderer` 라벨/required/dirty/tooltip/value
- `ViewHelpText` / `ViewHelpIcon` / `ViewFieldError`
- `ViewEntityFormButtons` 우측 정렬
- `ViewEntityForm` panel 구조 (rcm-form-panel/inner)
- `PhoneNumberFieldView` copy/SMS 버튼
- `SaveButton` / `DeleteButton` / `ListButton` / `ClosePopupButton` 스타일

### CSS 시스템 완성
- `src/listgrid/styles/tokens.css` — 디자인 토큰 (색/폰트/간격/radius/shadow/z-index)
- `src/listgrid/styles/base.css` — scoped `rcm-*` 클래스 + @layer 제거 + form/fieldgroup/tab/notice/skeleton/button/input-group 등 (700+ 줄)
- `utils/classNames.ts` — mergeSlot/resolveSlots 헬퍼

### GlobalModalManager 포팅
- `src/listgrid/ui/GlobalModalManager.tsx` — ManyToOneField 모달 렌더러

### FileFieldValue 완전 포팅
- `src/listgrid/ui/UIProvider.tsx` — 원본 메서드 전부 (isDirty/clone/addNewValue/...)

### 테마 신호: blue primary
- `--rcm-color-primary: #2563eb` (Mantine/MUI/Chakra 스타일)

---

## 5. 남은 작업 — rcm-* 전수 마이그레이션

### 통계
- 비-rcm className 현재 **~590줄 / 63 파일** (실측 명령어는 섹션 9 참조)
- 이 중 상당수는 `className={cn('하드코딩-tailwind', classNames.X)}` 패턴 — 하드코딩 Tailwind 부분 제거해야 함

### 전체 대상 파일 (Top offenders, 수작업 순서)

| Rank | 파일 | 스타일 줄 수 |
|---|---|---|
| 1 | `components/list/ui/TableSubCollectionView.tsx` | 59 |
| 2 | `components/list/ui/CardSubCollectionView.tsx` | 47 |
| 3 | `components/fields/view/CardManyToOneView.tsx` | 38 |
| 4 | `components/list/AdvancedSearchFormV2.tsx` | 29 |
| 5 | `components/list/ui/CardItem.tsx` | 28 |
| 6 | `components/fields/contentasset/components/ContentAssetItemUI.tsx` | 21 |
| 7 | `components/revision/RevisionField.tsx` | 20 |
| 8 | `components/list/ui/FieldSelector.tsx` | 19 |
| 9 | `transfer/DataImportSample.tsx` | 15 |
| 10 | `components/list/ui/CardFieldSection.tsx` | 14 |
| 11 | `components/fields/view/SmsModal.tsx` | 13 |
| 12 | `components/fields/view/ManyToOneView.tsx` | 11 |
| 13 | `components/form/ViewEntityForm.tsx` | 10 (잔여) |
| 14 | `components/fields/view/ManyToOneMultiFilterView.tsx` | 10 |
| 15 | `components/fields/view/PhoneNumberListView.tsx` | 8 |
| 16 | `components/fields/view/LinkFieldView.tsx` | 8 |
| 17 | `components/fields/contentasset/components/AddContentDialog.tsx` | 8 |
| 18 | `components/list/ui/FilterDropdown.tsx` | 7 |
| 19 | `components/form/ui/AlertItem.tsx` | 7 |
| 20 | `components/fields/BooleanField.tsx` | 7 |
| ... | (추가 43 파일, 각 1~6 줄) | ~245 |

### 접근 방법

**각 파일당 수행**:
1. 파일 열고 `className=` 모든 줄 확인
2. Tailwind utility → rcm-* 시맨틱 또는 레이아웃 클래스로 교체
3. 필요한 rcm-* 클래스가 base.css에 없으면 추가
4. `cn('tailwind 하드코딩', classNames.X)` 패턴의 Tailwind 부분 제거
5. 복잡한 커스텀 스타일(`bg-[#fafafa]`, `h-[30px]` 같은 arbitrary)은 inline style로 옮기거나 신규 rcm-* 클래스 생성

**주의 포인트**:
- `lg:col-start-1`, `col-span-full` 같은 grid 관련: 이미 `rcm-col-span-full`, `rcm-col-start-1-lg` 존재
- `md:flex`, `md:justify-end`: 이미 `rcm-form-buttons-row` 같은 시맨틱 클래스에 흡수됨
- `panel`, `btn btn-primary`, `btn-outline-primary` (gjcu 커스텀): rcm-fieldgroup, rcm-button 시리즈로 교체

---

## 6. 자주 쓰는 명령어

### 라이브러리 개발 (`~/dev/rcm-listgrid`)
```bash
npm run type-check          # tsc --noEmit
npm run build               # tsc + copy CSS → dist/
echo "0.1.0-alpha.X" | ./deploy.sh   # 버전 bump + release repo push
git push origin main        # private repo에 소스 push
```

### 실험 워크트리 (`~/IdeaProjects/gjcu-experiment/gjcu-academic-front`)
```bash
# alpha.X 재설치 (lockfile 리셋 필수)
sed -i '' 's|v0.1.0-alpha.OLD|v0.1.0-alpha.NEW|' apps/admin/package.json
rm -rf node_modules/@rcm package-lock.json
npm install --legacy-peer-deps

# dev 서버 재시작 (9261 포트)
lsof -ti:9261 | xargs kill -9 2>/dev/null
rm -rf apps/admin/.next
cd apps/admin && NODE_OPTIONS='--max-old-space-size=8192' npx next dev --turbo -p 9261
```

### 남은 Tailwind 줄 수 체크
```bash
cd ~/dev/rcm-listgrid/src && \
  grep -rEc 'className="[^"]*\b(bg-|text-|flex|grid|p-[0-9]|m-[0-9]|w-|h-|rounded|border|shadow)[^"]*"' \
  --include="*.tsx" 2>/dev/null | awk -F: 'BEGIN{c=0} {if($2>0) c+=$2} END{print c}'
```

### Playwright 시각 검증
1. MCP 도구 로드: `ToolSearch "select:mcp__playwright__browser_navigate,..."`
2. 로그인 페이지 캡처 (변경 전후 비교용)
3. `/academic/course`, `/academic/admission/homepage/notice`, detail 페이지 각각 확인

---

## 7. 사용자와의 합의된 설계 원칙 (중요!)

1. **절대 호스트에게 Tailwind 강요 금지**. alpha.16/17의 Tailwind CLI 방향은 **잘못된 시도**로 판명되어 revert됨. 다시 시도하지 말 것.
2. **Library JSX는 Tailwind utility 쓰지 않음**. 모든 스타일은 `rcm-*` scoped 클래스.
3. **cascade 충돌 원천 차단**: 호스트와 같은 namespace(`flex`, `hidden` 등) 절대 재정의 안 함.
4. **느리더라도 수작업 전수 마이그레이션이 유일 정답**. 지름길 없음.

---

## 8. 재개 시 체크리스트

1. 이 STATUS.md 끝까지 읽기
2. `~/dev/rcm-listgrid`: `git log --oneline -10` 로 최근 작업 확인
3. 실험 워크트리에 alpha.18 설치되어 있는지 확인:
   ```bash
   grep version ~/IdeaProjects/gjcu-experiment/gjcu-academic-front/node_modules/@rcm/listgrid/package.json
   ```
4. dev 서버 상태: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9261`
5. 서버 안 뜨면 섹션 6의 "dev 서버 재시작" 실행
6. **본 작업 시작**: 섹션 5의 Top offenders 중 rank 1번 파일부터 순차 rcm-* 교체

---

## 9. 참고 자료

- `DECISIONS.md` — 설계 결정 이력 #1~#58
- 메모리: `~/.claude/projects/.../memory/`
  - `project_rcm_listgrid_extraction.md`
  - `feedback_long_session_style.md` — "끝까지 밀어붙이기"
  - `reference_gjcu_dev_credentials.md` — 로그인
- 이전 세션 전체 transcript: `~/.claude/projects/.../{session-id}.jsonl`
