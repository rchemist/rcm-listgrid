# 저장소 작업 규칙

## 테스트 실행 비용

기본은 변경 영향 테스트 1회이며 `scripts/test-cost/affected_tests.py`가 JS 의존성 그래프로 범위를 정하고 공용 게이트를 획득한다. `TEST_BASE`로 비교 기준, `TEST_COST_TARGETS` JSON 배열로 실패 파일을 지정한다. 전체·coverage는 `TEST_GATE_FULL="병합 배치 사유"`로만 실행하며 같은 리비전 재실행에는 `TEST_GATE_RERUN="실패 원인과 재실행 사유"`가 필요하다. IT·Docker·별도 레인도 `sh scripts/test-cost/test_gate.sh <명령>`을 거친다. 실패는 해당 파일/패키지만 재실행하고 `sh scripts/test-cost/test_gate.sh report`로 시간·컨테이너 관측치를 확인한다. 범위를 알 수 없으면 전체로 폴백하지 않는다.
