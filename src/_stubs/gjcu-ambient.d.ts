// Stage 1 Inert Copy 전용 ambient 선언.
// @gjcu/* workspace 패키지 import를 any 타입으로 처리해 타입체크만 통과시키는 baseline stub.
//
// 각 module 블록 안에서 사용처의 named import를 모두 const + type으로 선언.
// Stage 2~3에서 Provider 주입으로 대체되면서 자연 소멸 예정 (DECISIONS.md #8).
//
// 자동 생성됨 — 원본 소스의 import 분석으로 추출. 수동 편집 금지, 원본 소스 변경 시 재생성.

