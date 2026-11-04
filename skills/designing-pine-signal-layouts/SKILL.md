---
name: designing-pine-signal-layouts
description: Use when Pine Script overlay indicators show labels, text, balloons, icons, RSI values, divergence annotations, or breakout signals that overlap candles, wicks, plots, or each other, drift too far from their reference, or become unreadable under Auto scale and zoom; 특히 신호 알림이 캔들 꼬리·이평선·볼린저밴드와 겹치거나 멀어질 때 사용한다.
argument-hint: "[신호가 겹치는 파인 파일]"
---

# Designing Pine Signal Layouts

가격 차트의 신호를 “각 신호의 의미 기준점에 가깝고, wick 바깥이며, 같은 봉에서 결정적으로 겹치지 않게” 배치한다. 신호 판정과 화면 배치를 분리하고, Pine이 보장할 수 없는 픽셀 완전 무충돌은 약속하지 않는다.

코드 변경이나 리뷰 전에 [layout-contract.md](references/layout-contract.md)를 끝까지 읽는다. 다른 지표에 넘길 프롬프트가 필요할 때만 [reusable-prompt.md](references/reusable-prompt.md)를 읽는다. 구현 검증에는 [acceptance-tests.md](references/acceptance-tests.md)를 사용한다.

## 작업 순서

1. 대상 파일, Pine 버전, `overlay`/가격축, 현재 브랜치·미커밋 상태를 확인한다.
2. 기존 신호 조건, `alertcondition()`·동적 `alert()`, 모든 plot 계열·fill·hline·모습 탭 선언과 plot count를 스냅샷한다.
3. 모든 표시를 `instanceKey, active, side, anchorBar, referencePrice, priority, style, size, lines, inner/outerExtent, widthClass`로 목록화한다.
4. 구현보다 먼저 실패 검증을 추가한다: wick 안전, 활성 신호 전부 배치, 고정 순서, 점유 높이, 로컬 선 회피, 다이버전스 이웃 충돌, plot/alert/style 보존.
5. 신호를 즉시 그리지 말고 방향별 큐에 수집한다. 활성 항목만 연속 배치하고 각 슬롯의 최종 가격 좌표를 렌더러가 읽게 한다.
6. 첫 앵커는 캔들 wick와 실제 기준선의 로컬 경계에서 시작한다. 이후 좌표는 라벨 스타일·크기·줄 수의 점유 높이로 바깥쪽에 쌓는다.
7. 위쪽은 `label.style_label_down`, 아래쪽은 `label.style_label_up`을 사용한다. 투명 배경 텍스트·아이콘도 같은 방향형 스타일을 사용한다.
8. 로컬 검증 후 TradingView 서버 컴파일과 실제 차트 화면 행렬을 확인한다.

대상 파일이 여러 개로 좁혀지지 않거나 신호의 방향·기준점·우선순위를 코드에서 확정할 수 없으면 그 결정만 사용자에게 묻는다. 테스트 하네스가 없으면 작은 정적 검사와 순수 좌표 시뮬레이터를 먼저 만든다. 서버 컴파일에 접근하지 못하면 “로컬 검증 완료, 서버·화면 검증 대기”로 보고하고 완료라고 하지 않는다.

## 금지 사항

- 사용자 허용 없이 `+N`, 통합 배지, tooltip-only 처리로 지정 신호를 숨기지 않는다.
- wick 근처 신호에 `label.style_none`이나 `label.style_label_center`를 쓰지 않는다.
- 멀리 있는 이평선·밴드까지 쫓아 첫 신호를 화면 밖으로 밀지 않는다.
- 다이버전스 텍스트를 빈자리를 찾을 때까지 다른 봉으로 계속 이동하지 않는다.
- 캔들 세기나 조건 평가 순서로 신호 계층을 뒤섞지 않는다. 세기는 좁게 제한된 간격 배수에만 반영한다.
- “어떤 줌에서도 픽셀 단위 절대 무충돌”을 완료 조건으로 주장하지 않는다.

완료 보고에는 보장 범위, Pine 한계, plot count, 객체 보존 한도, 로컬 검증, 서버 컴파일, 실제 차트 검증을 구분한다.
