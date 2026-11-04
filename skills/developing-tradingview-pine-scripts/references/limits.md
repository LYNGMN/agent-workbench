# Pine Script 자원 한도

이 문서는 Pine v6 공식 문서를 기준으로 한다. TradingView가 제한을 변경할 수 있으므로 오류 수치가 다르면 오류 메시지와 최신 공식 문서를 우선한다.

## 핵심 한도

| 항목 | 공식 한도 | 실무 해석 |
| --- | ---: | --- |
| 컴파일된 IL | 100,256 토큰 | 성공한 스크립트의 정확한 수치는 조회할 수 없다. CE10117이 날 때만 수치가 보인다. |
| 플롯 | 64 plot counts | 호출 개수와 같지 않을 수 있다. 동적 색상은 추가 count를 만든다. |
| 컴파일 요청 | 5 MB | 소스와 가져온 라이브러리 전체가 포함된다. |
| 변수 | scope당 1,000개 | 전역과 각 지역 scope에 별도로 적용된다. |
| 배열·행렬 | 100,000 elements | map은 key/value가 각각 한 element라 최대 50,000쌍이다. |
| line/box/label ID | 각 500개 | 기본 표시량은 최근 50개다. `na` 좌표도 생성된 ID를 소비한다. |
| polyline ID | 100개 | `max_polylines_count`로 표시량을 조정한다. |

공식 근거: [TradingView — Limitations](https://www.tradingview.com/pine-script-docs/writing/limitations/), [TradingView — CE10117](https://www.tradingview.com/pine-script-docs/errors/CE10117/)

## 플롯 계산표

아래 범위는 공식 예제의 타입 한정자 차이를 반영한다.

| 호출 | plot counts | 주의점 |
| --- | ---: | --- |
| `plot()` | 1–2 | `color`가 const가 아니면 1개가 추가된다. `input.color()`도 const가 아니다. |
| `plotarrow()` | 1–3 | `colorup`, `colordown`의 동적 series마다 추가된다. |
| `plotbar()` | 4–5 | OHLC 4개와 동적 `color`다. |
| `plotcandle()` | 4–7 | OHLC 4개와 동적 `color`, `wickcolor`, `bordercolor`다. |
| `plotchar()` | 1–3 | 본체 외 동적 `color`, `textcolor`가 추가될 수 있다. |
| `plotshape()` | 1–3 | 본체 외 동적 `color`, `textcolor`가 추가될 수 있다. |
| `alertcondition()` | 1 | 알림 조건도 플롯 예산을 사용한다. |
| `bgcolor()` / `barcolor()` | 1 | 호출마다 1개다. |
| `fill()` | 0–1 | `color`가 series 형식일 때만 1개다. |
| `hline()` | 0 | 플롯 count를 만들지 않는다. |
| `line.new()` / `label.new()` / `table.new()` / `box.new()` | 0 | 대신 drawing ID 한도를 사용한다. |

`display=display.none`이나 `display.pane`은 표시 위치를 바꾸지만 선언의 플롯 count를 없애지 않는다. 가격축·상태라인 전용 `plot()`도 플롯 예산을 사용한다.

## 크기 선택과 플롯 수

`plotshape()`의 `size`는 컴파일 타임 상수다. 런타임 입력으로 `tiny`, `small`, `normal`, `large`를 선택하게 하려면 방향별 호출을 분리해야 하므로 롱·숏 4크기는 최대 8개의 `plotshape()` 호출을 사용한다. 대안인 `label.new()`는 플롯 count를 쓰지 않지만 label ID 한도와 객체 수명 관리를 필요로 한다.

## 안전 예산

64는 실패 경계이지 목표값이 아니다. 이 스킬의 감사 도구는 향후 상태라인·알림 8개를 추가할 수 있도록 기본 reserve를 8로 잡아 56을 검토 경계로 표시한다. 프로젝트가 다른 여유를 정하면 `--reserve N`으로 바꾼다.

정적 계산은 변수의 `const`/`input`/`simple`/`series` 타입을 완전히 판별하지 못한다. 최종 count는 TradingView가 64 초과 오류에 표시하는 수치 또는 성공한 서버 컴파일로 확인한다.
