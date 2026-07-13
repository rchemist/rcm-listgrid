# EntityForm 설정 전수 샘플 증명 결과

**판정**: PASS · **완료일**: 2026-07-13 · **브랜치**: `v0.4`

## 결론

EntityForm 공개 instance member 53개를 정적 manifest와 TypeScript AST로 양방향 exact 대조했고, 설정 원자 분기 EFS-01~24와 필수 pairwise P-01~14를 모두 실제 sample case와 Playwright 관찰에 연결했다. 최종 상태는 public inventory 53/53, P 14/14, implemented anchors 163, `planned` 구현 행 0, 빈 branch 0이다.

proof lab은 `/entityform-proof`에서 탐색할 수 있다. form/list 흐름은 기존 `ViewEntityForm`·`ViewListGrid`·state controller/store·RCM adapter를 그대로 사용하고, Next Node.js Route Handler가 격리 SQLite transaction에 CRUD/import를 커밋한다.

## ID 커버리지

| 실행 task | 소화 ID | 실제 관찰 |
|---|---|---|
| EFSP-0 | EFS-24 inventory 골격, P-13 | query 4종 red→green, AST 53 exact, generic CRUD/search, process restart SQLite |
| EFSP-1 | EFS-01/03/05/20/23/24, P-01/02/03/12 | title/readOnly/id/meta/clone/query DOM·HTTP·diagnostics |
| EFSP-2 | EFS-14~19, P-05/06 | field/tab/group/step DOM·payload·validation focus |
| EFSP-3 | EFS-06~11/21, P-04/07/08/10/14 | lifecycle order/cancel/throw, CRUD body, revision, plural validation |
| EFSP-4 | EFS-02/04/12/13, P-09 | capability/action DOM·session, list search request·hooked rows |
| EFSP-5 | EFS-22, P-11 | 실제 xlsx sheet/cell, query-time field 파생, import 후 SQLite GET |
| EFSP-6 | 전체 | manifest closure, coverage, production runtime, package/headless 전 게이트 |

## 실행 증거

### xlsx와 SQLite

- EFS-22c가 브라우저에서 `EntityForm Proof.xlsx`를 실제 다운로드했다.
- Node에서 다운로드 Blob을 다시 열어 sheet 이름 `EntityForm Proof`, 열 순서 `id,name,status,category,note`, seed row `1/Proof One/Active/Category A/seed`를 확인했다.
- 같은 workbook의 두 번째 행을 id `88`로 수정해 Import하고 list refetch 뒤 표 셀을 확인했다. `GET /api/entityform-proof/88`은 `INACTIVE/B/xlsx roundtrip` row를 반환했다.
- P-11은 `withDataTransfer({export:{},import:{}})` 뒤 추가한 `late`와 제거한 `note`가 export header와 import SQLite row 양쪽에 반영됨을 확인했다.

### process restart

`npm run test:e2e:persistence`가 격리 임시 DB와 같은 DB 경로로 Next dev server를 세 차례 기동했다. id `2`의 create/update 값이 재기동 뒤 유지됐고, delete 뒤 item GET은 404였으며, 모든 row를 삭제한 namespace는 다음 재기동에도 빈 상태를 유지했다. 개발 기본 DB에는 접근하지 않았다.

### 적대 감사에서 잡힌 결함

| RED | 원인 | 봉인 |
|---|---|---|
| EFS-18 `open:false` | renderer가 group disclosure 초기값을 소비하지 않음 | 기존 fieldset 최소 배선 + DOM regression |
| P-06 invalid focus | step 이동 뒤 field mount 전에 focus 시도 | 다음 frame focus 복원 + Chromium assertion |
| EFS-02g POST 0회 | view는 Auth session을 보지만 controller는 session을 받지 않음 | proof `useEntityForm`에 같은 session 전달 |
| EFS-22c sheet=`Sheet1` | Excel exporter가 workbook sheet 이름을 고정 | fileName 기반 금지문자/31자 정규화 + Blob unit/E2E |
| coverage statements 44.56% | proof fixture가 unit coverage에 0%로 편입 | manifest 전 sampleCase factory closure test, threshold 유지 |
| production smoke strict locator | diagnostics와 table cell이 같은 row 이름을 포함 | 실제 `td`로 관찰점 한정 |

공개 API를 테스트 편의로 추가하거나 threshold를 낮춘 수정은 없다.

## 최종 게이트

| 명령 | 결과 |
|---|---|
| `npm run check:entityform-sample-proof` | 53/53, P 14/14, anchors 163, synthetic red 2종 PASS |
| `npm run type-check` / `npm run typecheck:packages` | green |
| `npm run test:coverage` | 193 files, 2517 passed, 1 todo; 45.55/40.22/47.77/45.22 |
| `npm run lint` / `npm run format:check` | 0 errors / format green |
| `npm run build` | ESM/CJS/DTS/styles green |
| `npm --prefix apps/sample run build` | production build, static pages 44/44 green |
| `npm run test:e2e` | Chromium 182/182 green |
| `npm run test:e2e:persistence` | restart create/update/delete/empty namespace PASS |
| `npm run test:sample-production-smoke` | `next start`, Chromium CRUD + item 404 PASS |
| `npm run check:surface` | EntityForm 53/55, root 61/120, `/schema` 188/190 |
| `npm run check:exports` | attw 전 entrypoint Node/CJS/ESM/bundler green |
| `npm run check:publint` | All good |
| `npm run smoke:load` | root/schema/state/utils/excel CJS+ESM load green |
| `npm run check:headless` | React runtime 없이 schema/state typecheck+CJS+ESM green |

## 남은 경계

EF-SP 자체의 미소화 ID나 미결 설계 판단은 없다. `main` 반영과 npm `latest` 전환은 별도 GA-L 정책이며, PROGRESS의 OQ-GA-L에 따라 사용자 `GA-latest go` 전에는 수행하지 않는다.
