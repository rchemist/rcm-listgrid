# 테스트 실행

정본: `rchemist/harness`의 `scripts/test_gate.{sh,py}`와 `scripts/test-cost/affected_tests.py`. 런타임은 리포에 포함되어 CI와 다른 체크아웃에서도 같은 호스트 잠금을 사용한다(Python 3, macOS/Linux).

- 개발: 기존 npm/pnpm 테스트 명령 → 변경 영향만, 기본 worker 2개. `TEST_BASE=<commit>` 또는 `TEST_COST_TARGETS='["path.test.ts"]'`로 범위를 지정한다.
- 전체/coverage: `TEST_GATE_FULL="배치와 사유" npm test`. 같은 입력 재실행: `TEST_GATE_RERUN="원인·수리·범위"` 추가.
- `TEST_COST_DRY_RUN=1 npm test`: 실행 없이 선택된 명령 확인.
- `sh scripts/test-cost/test_gate.sh report`: 리포별 실측 시간·관측 컨테이너 수.
- pytest는 리포 선택기 또는 정확한 테스트 파일을 사용한다. 의존성을 추측해서 전체로 폴백하지 않는다.

Vitest `--changed`, Jest `--changedSince`, Playwright `--only-changed`의 런너 의존성 그래프를 사용한다. 동적 로딩·외부 fixture 영향은 명시적 타깃으로 보완한다. 전체 coverage는 개발 기본 경로에서 수행하지 않는다. Windows native에서는 이 POSIX 게이트를 사용할 수 없으므로 WSL의 Linux Python 환경에서 실행한다.
