# §Needs Review 전건 처분 기록 (2026-07-11 — 사용자 지시 "미결사항 정리해서 확정")

> 처분 주체: fable 세션(모델 자동 확정 — 전 항목이 기술 편차 기록으로 도메인 의도 불요 판정). 사용자 veto 가능 — 이의 시 해당 항목만 재개.

| # | 항목 | 처분 |
|---|---|---|
| 1 | P0-7 Breaking 소비자 영향 (最우선) | **검증 완료 → 해소**: 영향권 4소비자(edustack·egov-cms 2앱·project-manager·showcase — `^0.3.x` pin) 전원 cryptKey 설정 확인(edustack env+폴백, egov/pm 리터럴), HTML 렌더 3종(HtmlField/ShowNotifications/ViewHelpIcon) 사용 0, asset 서버 사용 0. gjcu는 `^0.2.x`라 비영향. → **0.3.26 배포 실행**(main merge+태그) |
| 2 | P0-7 API 범위 (encrypt/decrypt 잔존) | 확정: 제거는 v1.0 창구(ADR-0006 §3 정합) — 이번엔 폴백키 제거+throw만. 의도 일치 |
| 3 | P0-3 신규 사용자 문구 | 확정: 리포 관례('~하는 중 오류가 발생했습니다.') 준수. i18n 키화는 P5 이월 유지 |
| 4 | P0-4 최소범위 초과(1→3파일) | 확정: 브리핑의 우선순위 정렬 지시상 불가피 — 적절 |
| 5 | P0-8 동결 방식(eslint override 블록) | 확정: 인라인 주석 대비 우월(1파일 diff·whittle-down 용이) |
| 6 | P1-2 ESM 메인배럴 caveat | 확정: **(a) 수용+MIGRATION 명시**. 0.4는 재설계 패키지 계약(스펙 §2 — react-sortablejs 미포함)으로 자연 해소 |
| 7 | P2 렌더 파일수 게이트(9→25+ vs 5파일 68테스트) | 확정: 행동밀도로 게이트 의도 충족 — 문자적 파일수 목표 폐기 |
| 8 | P3-1 조건부 컨텍스트 협소화 | 확정: `FieldEvalContext`가 규범(스펙 L5·ADR-0003§4·헌장 C2). MIGRATION 1:1 대응은 W7 전수표에 포함 |
| 9 | P3-1 권한추출 협소화(2-way) | 확정: canonical 유지 — EG1/EG2 출하로 실증, 인스턴스 폴백 제거 무영향 확인 |
| 10 | EF2 meta options 확장(`\| undefined`) | 확정 — 스펙 r2(L4)가 상위 규범으로 흡수 |
| 11 | EF2 빌더 자체필터(skip 최적화) | 확정 — settled state 동일, 동작 동등 |
| 12 | EF2 미이식 2건(defaultValue dead·withShouldReload) | 확정 — dead 확인/스펙 §3.6 삭제 목록 |
| 13 | EF2 onChanges 내부표현(private 빈배열) | 확정 — 공개 계약 무영향 |
| 14 | EF3 withId 전파 | 확정 — sample idiom 정합, fetch-error 경로 개선 |
| 15 | EF3 hydrate dotted 수정(공유코드) | 확정 — EC2 실브라우저 검증 완료로 위험 해소 |
| 16 | EF4 fieldDefs=단일 진실 | 확정 — Handoff Do-NOT 등재 유지(콜사이트 0 확인) |
| 17 | EA-A MultiOptions validate 특성 | 확정 — base 설계 수용(hidden+limited 케이스는 W3 가시성 작업 시 재확인 포인트로만) |
| 18 | EA-A Password 참조 push | 확정 — 구 shallow-copy가 latent bug, 의도적 개선 |
| 19 | EA-A Time 브리핑 정정(+12시간) | 확정 — 기록 완료 |
| 20 | EA-A Month min/max 미전달 | 확정 — validate가 실게이트. 렌더러 min/max는 W5 개선 후보 |
| 21 | EA-A Checkbox combo 추가 | 확정 — 스펙 §5.1에 withComboType 등재됨 |
| 22 | EA-B Telephone round-trip | 확정 — 미편집 원본 보존이 우월(방어 strip은 serializeValue에서 재고 가능) |
| 23 | EA-B CustomOption layout own-property | 확정 — 레이아웃 시스템 도입 시 재정렬 후보 유지 |
| 24 | EA-C ContentAsset 연기 | 확정 — 스펙 CAP-29 descope(양 소비자 실사용 0·구엔진 스텁) |
| 25 | EA-D Dead 3종 연기(Rule/XrefPrice/XrefAvailableDate) | 확정 — CAP-29 descope |
| 26 | EA-D Map compare 갭(시스테믹) | 확정 — latent 기록. 장래 Map 값 필드 도입 시 선결(스펙 §5.2 serializeValue가 완화) |
| 27 | EF2 changeSelectOptions 배열-clause 레이스 (risk: med) | **W2-8 태스크로 전환** — 실코드 결함이므로 원장이 아닌 wave에서 수리(waves 브리프 §W2 추가) |
| 28 | EA-D2 Prefer 재편집 미이식 | 확정 — 구조적 방지(NOT_IN)+가드로 동등 |
| 29 | XrefPrefer/postFetch 실브라우저 증명 부재 | 확정 — 실사용 폼 이식 시(W5+) E2E 추가 |
| 30 | EA-C 값 shape 다운그레이드(FileFieldValue→plain) | 확정 — **W7 MIGRATION 전수표에 "구 envelope wire 계약 호스트용 어댑터 변환" 절 필수 등재** |

## Open Questions 동시 처분

- **0.3.26 실배포**: 실행 완료(2026-07-11) — 소비자 검증(#1) → main ff-merge `853660b` → `v0.3.26` 태그 push → publish.yml latest 자동배포. CI 결과는 PROGRESS Last updated에 기록.
- **0.4.0-alpha.N**: **W2 착지 후로 보류(모델 결정)** — 현 표면은 W1이 즉시 대개명(readOnly/placeholder/name·url prop 등)할 표면이라, 지금 알파를 내면 소비자가 폐기 예정 이름에 통합하게 됨. W2(훅+컨트롤러) 착지 시점에 자동 재개.
- **apps/sample 실백엔드 연결**: fixture 단독 유지(모델 결정) — GA 데모 요구 발생 시 재검토(§Backlog).
- **업로드 backend seam**: 사용자 질문 아님으로 재분류 — W5/W6 착수 시 GJCU 관례 확인 후 모델 자동 결정.
