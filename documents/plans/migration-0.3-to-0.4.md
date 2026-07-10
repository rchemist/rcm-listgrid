# 마이그레이션 가이드: 0.3 → 0.4 (리빙 문서)

**성격**: 리빙 문서(living document). 재기초(0.4) 작업이 진행되며 각 페이즈가 도입하는
호환성 영향과 이전 절차를 **발생 시점에** 누적한다. GA(P7) 시점에 이 문서를 정리해
사용자 대면 `docs/MIGRATION.md` + codemod 로 승격한다(로드맵 P7).

**왜 지금부터 쓰는가**: 마이그레이션 항목을 마지막에 몰아서 복원하면 누락·부정확이 생긴다.
변경이 일어나는 커밋에서 바로 여기에 한 항목을 추가하는 것이 규율이다([PROGRESS](../PROGRESS.md)
불변 규율 참조).

**읽는 법**: 지금 0.3.x 를 쓰는 host 는 먼저 **§1(0.3.26 하드닝)** 만 보면 된다 — 지금
당장 조치가 필요한 breaking 은 그게 전부다. **§2~** 는 0.4 가 실제로 나올 때 채워지는
골격이며, 지금은 "무엇이 바뀔 예정인지"의 예고다.

---

## 1. 0.3.25 → 0.3.26 (하드닝 릴리스) — 지금 조치 필요

0.4 이식 전, 검증된 버그를 원본에서 먼저 고치는 릴리스. 대부분 무행동(투명한 버그 수정)이나,
**보안 기본값 3종은 동작이 바뀌므로 아래를 확인**한다.

### 1.1 `simpleCrypt` — cryptKey 필수화 (필수 조치)

- **바뀐 것**: 공유 하드코딩 폴백 키(`'rcm-token-secret'`)를 제거했다. cryptKey 미설정 상태에서
  `encrypt`/`decrypt` 를 호출하면 이제 **에러를 던진다**.
- **왜**: 모든 소비자가 같은 기본 키를 공유하면 서로의 암호화 데이터를 복호화할 수 있었다.
- **조치**: 부트스트랩에서 host 고유 키를 주입한다.
  ```ts
  import { configureRuntime } from '@rchemist/listgrid';
  configureRuntime({ cryptKey: process.env.NEXT_PUBLIC_CRYPT_KEY /* host 고유 값 */ });
  ```
  이미 `configureRuntime({ cryptKey })` 를 호출 중이면 무행동.

### 1.2 HTML 싱크 — 새니타이저 미설정 시 텍스트 렌더 (조건부 조치)

- **바뀐 것**: `HtmlField` · `ShowNotifications` · `ViewHelpIcon` 이 host 제공 문자열을
  `dangerouslySetInnerHTML` 로 그대로 렌더하던 동작을 제거했다. 새니타이저 미설정 시
  **이스케이프된 텍스트로 렌더**하고 콘솔에 1회 경고한다.
- **왜**: 라이브러리가 임의 HTML 을 무검증 주입하던 XSS 표면 차단(ADR-0006).
- **조치**: HTML 렌더가 필요하면 부트스트랩에서 host 새니타이저를 주입한다.
  ```ts
  import { configureHtmlSanitizer } from '@rchemist/listgrid';
  import DOMPurify from 'dompurify';
  configureHtmlSanitizer((html) => DOMPurify.sanitize(html));
  ```
  HTML 렌더가 필요 없으면 무행동(텍스트로 안전하게 표시됨).

### 1.3 `ASSET_SERVER_URL` — localhost 폴백 제거 (조건부 조치)

- **바뀐 것**: 미설정 시 `http://127.0.0.1:8320` 으로 폴백하던 동작을 제거하고 빈 문자열
  + 1회 경고로 바꿨다.
- **조치**: 자산 서버를 쓰면 `NEXT_PUBLIC_ASSET_SERVER` 환경변수 또는
  `configureAssetServerUrl(url)` 로 설정한다. 자산 경로가 상대경로(빈 서버)로 충분하면 무행동.

### 1.4 무행동 버그 수정 (참고)

아래는 조치 불필요 — 잘못 동작하던 것이 바르게 동작하게 된 수정이다.

| 항목 | 이전(버그) | 이후 |
|---|---|---|
| min/max 검증 | falsy(0/false) 값에서 검증이 조용히 무력화 | 정상 검증 |
| DatetimeField Excel | export/import 왕복에서 시간 성분 유실 | 시간 보존 |
| FieldRenderer onChange | validate throw 시 에러/값 조용히 유실 | 에러를 사용자에게 표시 |
| 리스트 pageSize | 리스트별 `defaultPageSize` 가 전역값에 덮어써짐 | 명시값 우선 |
| useLoadingStore | 로딩 상태 변경이 리렌더 안 됨 | 반응성 확보 |
| EntityForm.clone | `manageEntityForm` 참조 공유(권한 누수) | 값 복사로 격리 |

### 1.5 Deprecated

- `AdvancedSearchForm`(v1) → `AdvancedSearchFormV2` 로 이전 예정. 내부 사용처 0.

---

## 2. 0.3 → 0.4 (재기초) — 예고 (골격, 페이즈 진행 시 채움)

> 아래는 [ADR-0008 재기초 전략](../adr/ADR-0008-refoundation-strategy.md) 과
> [개념 헌장](../prd/concept-charter.md) 이 확정한 방향의 **예고**다. 실제 이전 절차·codemod 는
> 해당 페이즈가 구현될 때 이 절 아래에 채워진다.

### 2.1 패키징 / import 경로 (P1·P6 확정 예정)

- 배포 형태는 **루트 단일 패키지 유지**(`@rchemist/listgrid`) 예정 — 내부는 워크스페이스로
  분해되나 사용자 import 경로 영향은 P6 exports 맵 확정 시 이 절에 기재.
- _(TBD: 서브패스 export 변경 목록, 제거되는 심볼 — P3-4 표면 감사표 착지 후)_

### 2.2 API 변화 (P3·P4 확정 예정)

- `EntityField.view()` 제거 → 렌더러 레지스트리 분리(ADR-0003). _(TBD: 이전 레시피)_
- 폼 상태의 store 기반 재구성(ADR-0002) — 대부분 내부 변경이나 공개 계약 영향은 P3 계약
  골격 확정 시 기재. _(TBD)_
- BackendAdapter / 에러 코드 재배선(ADR-0005). _(TBD)_

### 2.3 codemod (P7)

- _(TBD: 자동 이전 스크립트 — 심볼 rename / import 재작성 범위)_

---

## 부록: 이 문서 유지 규칙

- 호환성에 영향을 주는 커밋은 **같은 커밋에서** 해당 절에 한 항목을 추가한다.
- 각 항목은 **바뀐 것 / 왜 / 조치(코드 예시)** 3요소를 갖춘다.
- GA(P7)에서 §2 를 정리해 `docs/MIGRATION.md`(사용자 대면) + codemod 로 승격하고, 이 리빙
  문서는 `documents/` 이력으로 남긴다.
