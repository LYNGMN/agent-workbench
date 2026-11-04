# CE10117 컴파일 토큰 절감 절차

## 사실부터 고정한다

- 한 스크립트의 최적화 후 IL 한도는 100,256 토큰이다.
- 소스 글자 수·줄 수와 IL 토큰 수는 같지 않다.
- 성공한 스크립트의 IL 크기는 직접 조회할 수 없다.
- 로컬 lexical/source token proxy는 전후 비교용 보조 지표일 뿐 IL 측정기가 아니다.

공식 근거: [TradingView — Compiled code contains too many tokens](https://www.tradingview.com/pine-script-docs/errors/CE10117/)

## 효과가 거의 없는 변경

TradingView 컴파일러가 이미 처리하므로 다음은 CE10117 해결책으로 삼지 않는다.

- comments 삭제
- whitespace 제거 또는 한 줄 합치기
- identifiers와 함수·변수 이름 단축
- named arguments를 positional arguments로 바꾸기
- 같은 constant expression을 변수로 옮기기
- 컴파일러가 동일하다고 판정할 expressions/functions 수동 병합
- plots, drawings, alerts, logs 등 출력에 영향을 주지 않는 unused code 삭제

## 효과를 검증할 우선순위

1. 출력에 실제 연결된 중복 상태와 계산을 찾는다. 별도 배열·동일 데이터 재구축·매 봉 반복 스캔을 공용 캐시나 단일 계산으로 합친다.
2. 구조적으로 다른 반복문장을 loop 또는 재사용 함수로 바꾼다. 런타임 비용이 커지지 않는지 함께 확인한다.
3. custom code를 같은 의미의 built-in으로 바꾼다.
4. 대량 literal data와 긴 constant strings를 줄인다. 입력 도움말처럼 별도 메타데이터로 처리될 수 있는 문자열은 실제 서버 결과로 효과를 확인한다.
5. 기능 경계가 명확할 때만 여러 script 또는 library로 분리한다. 가져온 라이브러리 전체 합계는 별도 1,000,000 토큰 제한을 가진다.

## 한 번에 한 가설 검증

1. 원본을 보존하고 저장소의 규칙에 맞는 다음 버전을 만든다.
2. CE10117의 정확한 현재 토큰 수와 한도를 기록한다.
3. 한 종류의 구조만 바꾼다.
4. 매매 판정 함수, `alertcondition()` 선언, plot ledger, 입력 기본값을 전후 비교한다.
5. TradingView 서버에서 컴파일한다.
6. 토큰 수가 그대로면 그 가설을 중단한다. 다른 축약을 덧붙여 원인을 흐리지 않는다.
7. 결과를 [field-notes.md](field-notes.md)의 형식으로 기록한다.

## 회귀 방어

- 알림 개수뿐 아니라 선언 전문을 비교한다.
- plot/plotshape/bgcolor/fill의 title, color, display, editable을 비교한다.
- 매매 진입·종료·손절 계산 구간은 체크섬 또는 정적 구간 비교를 둔다.
- 히스토리 hover 값은 각 bar에서 계산되는 series인지 확인한다. `barstate.islast` 전용 값은 과거 캔들 상태라인에 나타나지 않는다.
- 정적 검사가 통과해도 서버 컴파일 전에는 “해결”이라고 보고하지 않는다.
