# Pine 가격 차트 신호 배치 계약

## 1. 품질의 정의

좋은 신호 배치는 예쁜 간격이 아니라 다음 의미 계약을 동시에 지키는 배치다.

1. **기준 정합성**: 신호가 어느 봉·피벗·밴드·이평선에서 발생했는지 오해하지 않는다.
2. **wick 안전성**: 라벨의 좌표뿐 아니라 텍스트·말풍선 본체가 캔들 꼬리 반대 방향으로 펼쳐진다.
3. **결정적 계층**: 같은 활성 신호 조합은 언제나 같은 순서다.
4. **정보 보존**: 사용자가 켠 신호는 같은 봉에서 각각 보인다.
5. **근접성**: 첫 신호는 캔들과 관련 선 가까이, 뒤 신호는 실제 점유 높이만큼만 바깥에 둔다.
6. **축 동기화**: 캔들·가격선·신호가 같은 bar/price 좌표로 함께 움직인다.
7. **자원 보존**: 64 plot count, IL token, label/line ID 한도를 함께 관리한다.

이 계약은 신호 판정식과 배치식을 분리한다. 표시 충돌을 고치면서 신호 조건이나 알림 발생 시점을 바꾸면 안 된다.

## 2. Pine이 보장할 수 없는 것

Pine은 라벨의 실제 픽셀 bounding box, 패널 픽셀 높이, 현재 확대 배율을 제공하지 않는다. 따라서 서로 다른 여러 봉의 긴 텍스트가 극단적으로 축소된 화면에서도 절대 겹치지 않는다는 수학적 보장은 불가능하다. 동적 라벨도 무제한 보존할 수 없다.

정확한 완료 계약은 다음과 같다.

- 같은 봉의 활성 신호는 가격 좌표상 순서·점유 간격·wick 바깥 방향을 보장한다.
- 과거 피벗 신호는 같은 봉과 바로 이웃 봉의 등록된 스택을 제한적으로 피한다.
- 대표적인 Auto/zoom/가격축 화면 행렬에서 실제 가독성을 검증한다.
- 극단적 가로 압축과 플랫폼 객체 한도는 명시적 한계로 보고한다.

이 한계를 숨기기 위해 신호를 몰래 삭제하거나 `+N`으로 바꾸지 않는다. 요구가 물리적으로 충돌하면 약어, 글자 크기, 보존 구간 또는 최대 동시 신호 수 중 무엇을 조정할지 사용자와 결정한다.

## 3. 신호 인벤토리

각 신호를 다음 속성으로 정규화한다.

| 필드 | 의미 |
|---|---|
| `instanceKey` | `(anchorBar, id, occurrence)`처럼 중복 발생까지 구분하는 식별자 |
| `active` | 현재 봉에서 실제 표시할지 |
| `side` | `upper` 또는 `lower` |
| `anchorBar` | 발생 봉 또는 확정된 피벗 봉 |
| `referencePrice` | 캔들, 밴드, 이평선, 피벗 등 의미 기준 가격 |
| `priority` | 가까운 쪽부터의 고정 순서 |
| `style/size/lines` | 실제 표시 형태와 크기 |
| `inner/outerExtent` | 앵커 안쪽 꼬리와 바깥 본체의 비대칭 세로 점유 계수 |
| `widthClass` | 이웃 봉 회피용 `narrow/normal/wide` 휴리스틱 |

권장 앵커는 다음과 같다.

| 신호 | 의미 기준 | 화면 배치 기준 |
|---|---|---|
| RSI 침체·과열 수치/탈출 | 신호가 확정된 봉 | 과열은 `high` 위, 침체는 `low` 아래 |
| MACD·RSI 교차 | 교차 확정 봉 | 매도는 위, 매수는 아래 |
| 1B/2B·MTF BB 돌파 | 관련 상·하단 밴드와 확정 봉 | `high/low`와 관련 밴드의 로컬 외곽 |
| 이평선·VWAP 돌파 | 돌파한 선과 확정 봉 | wick 외곽, 가까운 해당 선만 회피 |
| GC/DC | 교차 봉과 교차 이평선 | GC 아래, DC 위 |
| 다이버전스 | 선택한 확정 피벗 또는 확정 봉 | 원래 X를 유지하고 해당 방향 스택에 등록 |

`priority`는 매매 점수와 별개인 시각적 근접 순서다. 기본적으로 배경 없는 숫자처럼 가려지기 쉬운 작은 요소를 안쪽에 두고, 중요한 말풍선, 확정 신호, 일반 돌파, 예비 신호를 바깥에 둔다. 제품 의미가 더 중요하면 명시적 우선순위 표로 바꾸되 봉마다 바꾸지 않는다.

## 4. 첫 앵커: 가깝지만 wick 밖

실전 기본값은 다음과 같은 좁은 적응 범위를 사용한다. 계수는 종목군별 시작점이지 절대값이 아니다.

```pine
candleRange = math.max(high - low, syminfo.mintick)
bodyRatio = math.abs(close - open) / candleRange
rangeRatio = math.min(candleRange / math.max(nz(atr14, candleRange), syminfo.mintick), 1.5) / 1.5
strength = ta.ema(bodyRatio * 0.55 + rangeRatio * 0.45, 3)
gapMultiplier = math.max(0.85, math.min(1.05, 0.85 + nz(strength, 0.5) * 0.20))

layoutScale = math.min(nz(atr14, candleRange), math.min(nz(ta.ema(candleRange, 3), candleRange), candleRange * 1.5))
stackScale = math.max(layoutScale, nz(atr14, candleRange) * 0.60)
candleGap = math.max(layoutScale * 0.15 * gapMultiplier, syminfo.mintick * 2)
stackGap = math.max(stackScale * 0.20 * gapMultiplier, syminfo.mintick * 2)
wickClearance = math.max(candleGap, stackGap * 0.35)
```

핵심은 두 스케일을 분리하는 것이다.

- 첫 신호는 현재 캔들 범위에 상한을 둬 가깝게 유지한다.
- 후속 스택은 ATR 하한을 둬 작은 봉·도지에서도 글자 간격이 무너지지 않게 한다.
- 캔들 세기는 3봉 평활과 `0.85~1.05` 같은 좁은 범위로 간격만 조절한다.

위쪽 기본 앵커는 `high + wickClearance`, 아래쪽은 `low - wickClearance`다. `lineClearance = max(stackGap * 0.25, syminfo.mintick)`를 시작점으로 삼고, 기본 앵커에서 그 거리 안에 있는 **소스에서 활성 조건을 만족하고 값이 `na`가 아닌 로컬 선만** 반영한다. 위쪽은 `high <= level <= baseAnchor + lineClearance`, 아래쪽은 `baseAnchor - lineClearance <= level <= low`처럼 회피 창을 명시적으로 자른다. 먼 선은 무시한다. 관련 밴드나 이평선이 신호 봉을 실제로 통과했다면 자연스럽게 로컬 범위에 들어온다.

Pine은 사용자가 설정 → 모습 탭에서 plot을 수동으로 숨겼는지 스크립트 안에서 읽지 못한다. 따라서 “표시 중”은 UI 상태가 아니라 입력·조건·`na` 여부로 판정한다. 모습 탭 수동 숨김까지 완전 동기화한다고 약속하지 않는다.

정확한 `yloc.price`, `xloc.bar_index`, 기존 `overlay`와 가격축을 유지한다. `location.top/bottom`, 화면 고정 table, 임의의 보조 패널 좌표로 바꾸지 않는다.

## 5. 실제 점유 높이로 방향별 큐 배치

조건문 안에서 바로 `label.new()` 하지 않는다. 하단 큐와 상단 큐를 따로 만들고 활성 신호만 고정 우선순위로 넣는다. 고정 신호 번호를 곧바로 슬롯 번호로 사용하면 비활성 항목만큼 빈 공간이 생긴다.

점유 높이는 정확한 픽셀 실측값이 아니라 소스에서 계산하고 대표 화면에서 보정한 **extent proxy**다. 최소한 다음을 반영한다.

- 말풍선과 배경 없는 텍스트/아이콘의 기본 높이 차이
- `tiny`부터 `huge`까지의 크기 배수
- 줄 수
- 여러 줄 MACD·GC/DC 말풍선
- 긴 한 줄 다이버전스의 세로 높이는 그대로 두고 `widthClass=wide`로 별도 표시

방향형 라벨의 앵커는 본체 중심이 아니다. 포인터가 있는 안쪽과 본체가 펼쳐지는 바깥쪽을 나눠 인접 거리를 계산한다.

```pine
pairDistance(previousOuter, currentInner, minimumGap) =>
    previousOuter + currentInner + minimumGap

nextY = isUpper
    ? previousY + stackGap * pairDistance(previousOuter, currentInner, minimumGap)
    : previousY - stackGap * pairDistance(previousOuter, currentInner, minimumGap)
```

기존 코드가 중심점 기반 단일 extent를 사용한다면 `(previous + current) / 2`는 허용 가능한 단순화다. 단, 각 방향형 스타일과 크기의 실제 화면 표본에서 보수적 계수로 검증해야 한다. 새 범용 엔진은 `inner/outerExtent`를 우선한다.

모든 활성 항목을 `0..n-1`로 연속 배치한다. 한 ID가 봉당 한 번만 생기면 고정 `layout[signalId]`에, 같은 ID가 여러 번 생길 수 있으면 `instanceKey`별 좌표에 써서 각 기존 렌더러가 직접 읽게 한다. 큐는 문자열 상세정보를 다루지 말고 슬롯 ID와 extent만 다뤄 IL token과 런타임 비용을 제한한다.

## 6. wick 반대 방향으로 렌더링

가격 좌표가 wick 밖이어도 `label.style_none`의 텍스트는 좌표를 중심으로 위아래에 걸친다. 작은 가격 간격, Auto scale, 큰 글자에서는 글자 절반이 wick 안으로 들어갈 수 있다.

모든 가격 인접 신호는 다음 방향을 사용한다.

- 위쪽 신호: `label.style_label_down`
- 아래쪽 신호: `label.style_label_up`

배경 없는 숫자나 아이콘도 `color=#00000000`만 적용하고 방향형 스타일은 유지한다. `label.style_label_center`로 캔들 몸통 안에 넣는 fallback도 두지 않는다. 이렇게 하면 고정 픽셀 본체가 앵커에서 wick 반대 방향으로 펼쳐진다.

## 7. 다이버전스와 이웃 봉

다이버전스는 뒤늦게 과거 피벗에 표시될 수 있으므로 현재 봉 큐만으로는 충분하지 않다. 방향별로 최근 스택의 최외곽 꼬리를 `x, y, gap, extent` 레지스트리에 저장한다.

피벗 텍스트를 놓을 때 기본적으로 `targetX - 1 .. targetX + 1`에 등록된 항목 중 해당 방향의 가장 바깥 좌표를 찾고, 두 extent의 쌍별 거리만큼 더 바깥에 둔다. `widthClass`는 이 검사를 켜고 보수 계수를 고르는 힌트이지 픽셀 충돌 판정이 아니다. 텍스트의 X는 원 피벗에 유지한다.

- 같은 X만 보면 넓은 이웃 말풍선을 놓친다.
- 무제한 X 빈자리 탐색은 신호 시점을 왜곡하고 비용을 키운다.
- `±1` 검사는 픽셀 폭 완전 판정이 아니라 현실적인 제한 휴리스틱이다.

늦게 확정되는 다이버전스는 기존 스택을 재배치하는 별도 reflow 엔진이 없다면 항상 현재 등록된 최외곽 tail 뒤에 둔다. 레지스트리 보존 기간은 최소 `최대 피벗 확정 지연 + 이웃 검사 1봉`을 덮어야 하며, 개수는 `max_labels_count`와 실제 객체 보존 정책에 맞춰 제한한다. 레지스트리에서 만료된 과거 피벗은 이웃 회피 보장 밖이다.

## 8. 정보 보존과 밀집 한계

기본 계약은 “활성 신호 각각 표시”다. `+N`, 한 라벨에 여러 신호 합치기, tooltip에만 넣기는 사용자가 명시적으로 허용할 때만 쓴다. 신호가 너무 많아 멀어지는 경우 다음 순서로 비용을 줄인다.

1. 같은 신호의 문구를 짧은 고정 약어로 바꾸고 상세 설명은 tooltip에 둔다.
2. 불필요한 줄바꿈과 장식 문자를 줄인다.
3. 시각적 크기를 입력으로 조절하되 신호 식별자는 화면에 남긴다.
4. 그래도 “모두 표시”와 “최대 거리”가 충돌하면 임의로 숨기지 말고 계약 선택을 요청한다.

TradingView의 label/line ID 한도와 가비지 컬렉션은 현재 봉 신호 누락과 별개의 **과거 보존 한계**다. 둘을 혼동하지 않는다.

## 9. plot, token, 모습 탭

변경 전후에 plot ledger를 만든다. 실제 소스에 있는 모든 `plot*` 호출(`plot`, `plotshape`, `plotchar`, `plotarrow`, `plotbar`, `plotcandle` 등), `fill`, `hline`, `bgcolor`, `barcolor`, `alertcondition`, series color를 수집한다. 각 호출이 실제 plot count를 소비하는지는 Pine 규칙과 서버 컴파일로 구분하고, 선언 목록·스타일 스냅샷에서는 빠뜨리지 않는다. 라벨과 선은 64 plot count에는 들어가지 않지만 객체 한도와 실행비용은 사용한다. 64를 꽉 채우지 말고 유지보수 여유를 남긴다.

IL token 감량 원칙:

- 방향별로 같은 슬롯·extent 배열을 순차 재사용한다.
- 조합별 `if/else`와 긴 신호명 인자를 만들지 않는다.
- 좌표 큐에는 숫자와 불리언만 넣고 긴 tooltip 생성은 렌더러에 남긴다.
- 반복 신호는 작은 함수와 루프로 배치한다.
- 성공한 TradingView 서버 컴파일을 최종 token 증거로 사용한다.

기존 plot 계열·`fill`·`hline`의 제목, 고정 색, `editable`, `display`, offset, 선 두께·스타일을 바꾸지 않으면 모습 탭 계약을 보존하기 쉽다. `label.new()` 색상은 보통 입력 탭에서 관리되므로 모습 탭과 혼동하지 않는다.

## 10. 검증 순서

1. 기존 `alertcondition()`과 모든 동적 `alert()`의 선언 해시를 고정한다. 동적 알림은 메시지, `freq`, 실행 게이트, 호출 위치·횟수를 포함한다. 비대상 plot 계열·fill·hline 스타일 선언도 고정하고, 가능하면 대표 데이터에서 알림 발생 봉·횟수 trace를 고정해 상위 조건식 변경을 잡는다.
2. 실패 테스트를 먼저 추가한다.
3. 로컬 정적 계약과 결정적 수치 시뮬레이션을 실행한다.
4. 테스트 하네스가 없으면 작은 정적 검사와 순수 좌표 시뮬레이터를 만든다. 이후 `git diff --check`와 관련 프로젝트 테스트를 실행한다.
5. 정확한 파일을 새 TradingView Untitled script에서 서버 컴파일한다.
6. Auto, 가로 확대/축소, 세로 가격축 이동, 도지, 긴 wick, 장대봉, 저가·큰 호가 종목, 같은 봉 최대 밀집, 다이버전스 피벗 주변을 확인한다.
7. 저장 지표 덮어쓰기·공개·Push는 별도 승인 없이는 하지 않는다. 서버나 로그인 화면에 접근할 수 없으면 완료를 주장하지 말고 `로컬 검증 완료, 서버·화면 검증 대기`로 분리한다.

완료 보고에서 “같은 봉 논리적 무충돌”과 “대표 화면 시각 검증”을 분리한다.
