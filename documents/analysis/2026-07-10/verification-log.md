# 적대적 검증 로그 — 2026-07-10 제로베이스 분석

비평(critique) 에이전트의 high/critical 발견 18건을 독립 opus 검증자가 **반증 시도** 방식으로 재검증한 결과.
`raw/critique-*.md`의 원본 주장을 인용할 때는 반드시 이 표의 **정정 심각도**를 우선한다.
(18건 전원 "실재(real)" 판정 — 단, 심각도·표현이 정정된 항목이 다수다.)

## 표기

- **원판정** → **정정**: 검증자가 조정한 심각도. 동일하면 원판정 유지 확인.
- 정정 사유는 요약. 전문은 워크플로우 트랜스크립트 참조.

## 아키텍처 (critique-architecture)

| 발견 | 원판정 | 정정 | 핵심 정정 사유 |
|---|---|---|---|
| config 클래스 내 `useSession()` 호출 (EntityForm.tsx:613-615) | high | **high** | 진짜 Context 훅 확인(위장 훅 반증). 단 5개 호출부 전부 try/catch로 삼켜져 "크래시"가 아니라 sessionRequired=true 폼에서 **조용한 기능 파손**(데이터 미로딩)으로 degrade. 아키텍처 증거로는 high 타당 |
| 중첩 폼 상태 — SubViewEntityForm 분리는 증상 대응, 인스턴스 store가 정답 | high | **high** | 딥클론·unmount=false·광역 deps 전부 코드로 확인. 단 8~12pw 공수와 후보 A>B>C 랭킹은 사실이 아닌 **공학적 의견**으로 취급할 것 |

## API 표면·패키징 (critique-api-packaging)

| 발견 | 원판정 | 정정 | 핵심 정정 사유 |
|---|---|---|---|
| 순정 Node에서 require/import 양쪽 로드 불가 (ERR_UNSUPPORTED_DIR_IMPORT) | critical | **critical** | Node 26에서 직접 재현. dist 전반이 확장자 없는 디렉터리 재수출. CI는 `test -f`만 수행. 유일 소비처가 Next 번들러라 은폐돼 옴 |
| 배럴 580 export freeze 불가 — 경계·폐기 메커니즘 부재 | high | **high** | export * 67회·@deprecated 0건·Preset.tsx 도메인 잔재 확인. 단 "QrField 조용히 삭제"는 오기 — 실제로는 문서화된 서브패스 이전 |
| 필수 lib-peer 7개(아이콘 2종 이중 강제) | high | **high** | @iconify는 3개 파일만 사용하면서 필수 peer. 수치 경미 오차(tabler 43파일, 인터페이스 ~51필드) |
| 온보딩 표면 — 문서 6계약 vs 실제 20개 통합 지점 | high | **high** | UIProvider 필수 필드는 63이 아니라 **47**(옵셔널 2, 총 49). "11개 문서 부재"는 과장 — TypeDoc 페이지는 존재, **온보딩 가이드 부재**가 정확. fail-open 권한 + useLoadingStore 무구독 버그는 확정 |

## 코드 품질 (critique-code-quality)

| 발견 | 원판정 | 정정 | 핵심 정정 사유 |
|---|---|---|---|
| getValueAsNumber/Boolean 연산자 우선순위 버그 → update 모드 min/max 검증 무력화 | critical | **high** | node 재현으로 버그 확정(`??`보다 `===`가 먼저 평가). 단 해당 검증기는 public export일 뿐 **리포 내부 호출처 0건** — 실영향은 소비자 opt-in에 종속 |
| DatetimeField가 type='date'로 등록 → Excel 왕복 시 시간 유실 | high | **high** | 인과 사슬 전부 확인. 정밀 보정: 단일값 export는 무손실(raw pass-through), **range export와 import 전체**에서 유실 |
| EntityForm.clone()의 manageEntityForm 참조 공유(aliasing) | critical | **low** | 코드 사실은 맞음. 단 mutate하는 withCreatable/Updatable/Deletable의 **호출처가 리포 전체 0건**이고, 부모↔서브컬렉션은 별개 인스턴스라 "부모 권한 오염" 시나리오는 부정확. 잠재 결함(1줄 수정 가치)이며 실버그 아님 |
| FieldRenderer onChange 2벌 복제(~65줄) + IIFE 무 catch | high | **high** | 축자 중복·unhandled rejection 경로 확인(에러가 조용히 사라짐). "27% 중복"은 합산 수치(잉여만 세면 ~13%) |
| SubCollection 3변형 buildSearchForm 복붙 | high | **high(경계선 medium)** | 문자 그대로 3벌 확인, 부모에 이미 protected getMappedByFilter 존재 → 저위험 통합 가능. 순수 중복은 ~105줄(200줄+는 낙관적) |

## 엔터프라이즈 준비도 (critique-enterprise)

| 발견 | 원판정 | 정정 | 핵심 정정 사유 |
|---|---|---|---|
| HtmlField 무방비 dangerouslySetInnerHTML — 저장형 XSS | critical | **critical** | sanitizer 부재 확인(리포 전체 grep 0건). ShowNotifications.tsx:90, ViewHelpIcon.tsx:28도 동일 패턴. 반증 실패 |
| simpleCrypt 하드코딩 폴백 키 | high | **low** | 코드 사실은 맞으나 **공개 API로 도달 불가**(메인 배럴 미노출, exports 맵에 와일드카드 없음). 게다가 클라이언트 AES는 키 설정 여부와 무관하게 난독화 수준. 위생 결함 |
| 메뉴 권한 게이트 fail-open(무경고 전면 허용) | high | **high** | 확정. 같은 계층 SessionProvider/MessageProvider는 경고를 내는데 이것만 침묵 — 비일관. 단 서버 인가가 아닌 **클라이언트 UI 게이트**임 |
| 렌더 테스트 0건 (필드 카탈로그·핵심 렌더 경로) | critical | **high** | 확정(렌더 테스트는 48개 중 9개, 필드·ViewEntityForm·ViewListGrid·FieldRenderer 0건). 기능 결함이 아닌 안전망 부재라 high — 단 상용화 목표 기준으론 critical 방어 가능 |
| 가상화 부재 — DOM이 행 수 비례 | high | **medium** | 사실이나 기본 pageSize=20 서버 페이지네이션이라 정상 사용에서 미발현. 대용량 opt-in 시의 확장성 한계 |

## 호스트 결합 (critique-host-coupling)

| 발견 | 원판정 | 정정 | 핵심 정정 사유 |
|---|---|---|---|
| CRUD URL 관례·envelope 파싱 하드와이어(오버라이드 지점 없음) | critical | **high** | 하드와이어 확인(RuntimeConfig.endpoints는 보조 경로만 커버). 단 onSave/overrideFetchData 등 per-form 훅으로 **포크 없는 우회가 가능**해 critical은 과장 |
| 토큰 만료 판별이 한국어 문자열 정확 일치 | critical | **low** | 리터럴은 실재하나 해당 throw는 **바로 바깥 catch에 삼켜져 사실상 no-op**(재로그인은 애초에 다른 경로 — form/Type.ts:104-118). 혼란스러운 죽은 결합 |
| SelectField 학원/결제 도메인 색상맵 코어 노출 | high | **medium** | 확정 + **CardItem.tsx:37-68에 두 번째 하드코딩 색상맵 추가 발견**. 영향은 cosmetic(fallback 존재) |
| Preset.tsx 전체가 export *로 코어 배럴 노출 | high | **medium** | 확정. 단 파일에 제네릭 프리셋(NameField/TitleField 등)도 섞여 있어 "전체가 도메인"은 과장. named export라 tree-shaking은 됨 |
| urlSync 미사용이어도 UrlStateProvider 강제 | high | **low** | 기술적 사실이나 Router Provider도 어차피 필수이고 NextListGridProvider가 둘을 한 번에 감싸 한계비용 ≈ 0. "호출 건너뛰기" 권고는 Rules of Hooks 위반 — no-op 폴백만 유효 |

## 제품 가치·상용화 (critique-viability)

| 발견 | 원판정 | 정정 | 핵심 정정 사유 |
|---|---|---|---|
| 배포 패키지 Node 로드 불가 = "framework-free" 표방의 근본 반증 | critical | **high** | 기술 사실은 전부 재현. 단 "framework-free"는 맥락상 메타프레임워크/Tailwind 비종속 의미라 "표방이 거짓"은 의미 혼동. 실제 주 소비 경로(번들러)는 동작. nodenext/CJS/비번들러 소비자를 깨는 정당한 패키징 결함 |
| 유일 차별점(깊은 서브컬렉션)이 성능·부채의 진원지 | high | **high** | 딥클론·unmount=false·213 순환·SubCollection 권한 부재 전부 확인. 단 unmount=false는 입력 보존이라는 정당 사유 존재, "리렌더 폭발"은 프로파일링 없는 추정 부분 포함 |
| 품질 게이트가 회귀 안전망으로 기능 못함 | high | **high** | 실행으로 확정: 이 체크아웃에서 27 failed/902 passed(Node 26, jsdom localStorage), engines/.nvmrc 부재, 커버리지 임계치는 "baseline 바로 아래" 고정 |

## 미검증 항목 주의

verify 단계는 critique당 최대 5건(high/critical)만 수행했다. **medium 이하 및 초과분은 미검증**이며,
특히 map 단계 산출물(raw/map-*.md)의 smell은 비평 단계에서 일부만 재검증되었다. 미검증 주장 중 이후 확인된 반례:
map 단계가 critical로 매긴 kakao/daum/xlsx/sweetalert2 결합은 이미 optional peer + 서브패스로 격리되어 있음
(critique-viability §6-B 정정). raw 문서를 근거로 쓸 때는 코드 재확인이 필요하다.
