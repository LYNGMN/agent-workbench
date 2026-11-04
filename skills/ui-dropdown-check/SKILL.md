---
name: ui-dropdown-check
description: "Use whenever you build, restyle or review a dropdown, select box, language/option picker, combobox, popover menu or context menu (native select element or custom listbox/menu) and before you show it or call it done — verify the arrow size/offset/room, that no choice or current value is cut with an ellipsis, that the open list starts at the current value's text and widens to the right, never leaves the screen, has no text-shrinking scrollbar, and that phone inputs are 16px+ with 44px tap targets, in light/dark at 320/375/desktop. Trigger on 드롭다운, 셀렉트, 선택 목록, 언어 선택, 화살표 위치, 줄임표 잘림, 메뉴 화면 밖, even when the user only says 'add a language picker' or 'the select looks off'."
argument-hint: "[검수할 URL이나 HTML 파일]"
---

# 드롭다운·선택 목록 검수

드롭다운은 작아 보이지만 사고가 자주 난다. 화살표가 테두리에 붙고, 긴 번역문이 "…"로 잘리고, 펼친 목록이 화면 밖으로 나가고, 휴대폰에서 눌렀더니 화면이 확대된다. 이 스킬은 사용자가 정한 기준과 고치는 법을 담았다. 만든 뒤에는 **보여 주기 전에** 브라우저에 띄워 숫자로 잰다. 눈대중 보고는 완료가 아니다.

## 기준 (넘으면 실패)

| 항목 | 기준 | 왜 |
|---|---|---|
| 화살표 | 크기 **16px**, 세로 가운데, 오른쪽 안쪽 여백 **14px**. 테두리 끝에 붙이지 않는다 | 붙으면 눌리는 영역처럼 안 보이고 답답하다 |
| 글자와 화살표 | 글자 끝에서 화살표까지 여백 **44px 이상**(`padding-right`) | 긴 값이 화살표와 겹친다 |
| 겹침·가로챔 | 커스텀 화살표와 브라우저 기본 화살표가 같이 보이지 않는다. 장식 아이콘은 `pointer-events:none`이라 클릭·키보드 선택을 가로채지 않는다 | |
| 선택지·현재 값 | **"…"로 자르지 않는다.** 언어 이름 같은 선택지도 마찬가지. 자유 글(채널 이름)만 줄임표 허용 | 잘린 이름은 고를 수 없다(中文(简… 사건) |
| 펼친 목록 시작선 | 다 들어가면 목록 글자의 시작선 = 닫힌 칸의 현재 값 글자 시작선 | 눈이 같은 자리에서 읽는다 |
| 넘칠 때 | 시작선은 그대로 두고 **오른쪽으로** 넓힌다. 화면 끝에 닿을 때만 왼쪽으로 민다. 아이콘 쪽으로 당기지 않는다 | 정렬보다 온전한 표기가 먼저, 그래도 아이콘 위치는 안 흔든다 |
| 목록 스크롤바 | 높이 한도 때문에 생긴 스크롤바가 글자 칸을 줄이면 `max-height`부터 늘린다 | 스크롤바가 글자를 밀어 다시 잘린다 |
| 화면 안 | 펼친 목록·팝오버·하단 시트는 화면 끝에서 **8px 이상** 띄운다. 가장 오른쪽·아래 트리거에서 열어서도 확인. 부모 상자에 잘리지 않는다 | |
| 휴대폰 입력 | 글자 **16px 이상**(iOS는 16px 아래면 확대한다). 조작 높이 **44px 이상** | |
| 접근성 | 네이티브 `select`/ARIA 의미 보존, 키보드(↑↓·Enter·Esc·Tab)와 보이는 초점, 접근 가능한 이름은 현재 UI 언어, 두 테마에서 경계·화살표 3:1 | |
| 줄 수 | 칸 이름·메뉴명은 320·375px에서 한 줄 | |

프로젝트 지침에 더 엄격한 값이 있으면 그 값을 따른다.

## 실행 순서

1. **자동 측정** (320·375·1280px × 밝음·어두움)
   ```bash
   node scripts/run-dropdown-check.mjs <url 또는 html> --out shots/ [--open "<열기 버튼 selector>"] [--theme-storage <키>] [--theme-attr data-theme]
   ```
   - `--open`이 있으면 마지막(가장 오른쪽·아래) 트리거를 눌러 **펼친 상태**를 잰다. 닫힌 상태만 재면 화면 밖으로 나가는 목록을 놓친다.
   - Playwright가 없으면 `scripts/dropdown-check.js`를 페이지에 붙이고 `dropdownCheck()`를 호출한다. 결과는 `{summary, findings[{check, level, el, msg, data}]}`. 도구가 전혀 없으면 개발자 도구에서 직접 재고 못 잰 항목은 '미측정'으로 쓴다.
   - 테마 전환 방식(저장값·속성)을 지정하지 않으면 시스템 설정만 바뀐다. 두 스크린샷이 같으면 방식을 잘못 고른 것이다.
2. **네이티브 `select`의 펼친 목록은 자동으로 못 본다.** 브라우저가 그리는 목록이라 DOM에 없다. 긴 번역문을 넣어 닫힌 칸 폭(`cut` 검사)을 믿고, 목록 모양이 중요하면 커스텀 목록(popover + `role=listbox`)을 쓴다.
3. **긴 값으로 시험** — 독일어·프랑스어·中文(简体中文)·긴 채널 이름 같은 가장 긴 선택지로 다시 잰다. 짧은 영어 값으로만 재면 통과한다.
4. **키보드·확대** — Tab·↑↓·Enter·Esc로 열고 고르고 닫히는지, 닫힐 때 초점이 트리거로 돌아오는지, 200% 확대에서 잘림·가로 스크롤이 없는지 본다.
5. **눈으로 확인** — 열기 전/후 확대 캡처로 화살표 여백, 시작선, 오른쪽 확장을 본다. 헤드리스 Chromium은 글자를 실제보다 약 0.3px 아래에 그린다.
6. **고침 → 다시 측정** — `fail`이 0이 될 때까지. `warn`은 의도인지 판단하고 이유를 적는다. 보고에는 폭·테마별 숫자와 스크린샷, 잰 것/못 잰 것을 나눠 쓴다.

## 고치는 법

```css
select.field {
  appearance: none; -webkit-appearance: none;        /* 브라우저 기본 화살표 제거 */
  height: 44px; font-size: 16px;                      /* 휴대폰 확대 방지 + 조작 높이 */
  padding: 0 44px 0 12px;                             /* 글자 끝~화살표 44px */
  background: var(--surface) url("data:image/svg+xml,...16px chevron...") no-repeat right 14px center / 16px 16px;
  text-overflow: clip;                                /* 선택지는 줄임표 금지 */
}
/* 커스텀 화살표를 요소로 그릴 때 */
.select-wrap { position: relative; }
.select-wrap .chev { position: absolute; right: 14px; top: 50%; width: 16px; height: 16px; translate: 0 -50%; pointer-events: none; }
```
```js
// 열 때·창 크기가 바뀔 때만 가장 긴 선택지를 재서 목록 폭을 정한다(매 렌더 측정 금지)
const need = Math.max(...options.map(o => measure(o.label)));          // Range 또는 canvas measureText
panel.style.minWidth = `${Math.max(trigger.width, need + padding)}px`;  // 오른쪽으로 넓어진다
// 화면 끝에 닿을 때만 왼쪽으로 민다: left = min(left, innerWidth - 8 - panelWidth)
```
- 다 들어가면 목록 안쪽 여백을 조절해 글자 시작선을 현재 값 글자에 맞춘다.
- 높이는 화면 안에서 최대한 주고(`max-height: calc(100dvh - 16px - top)`), 그다음에 스크롤을 쓴다. 스크롤바는 테마 색으로 얇게, `overscroll-behavior: contain`.
- 휴대폰은 하단 시트로 바꾸고 안전 영역(`env(safe-area-inset-bottom)`)을 피한다.
- 같은 목록에서 원문/번역처럼 묶음이 있으면 `<optgroup>`을 쓰고, 닫힌 칸 표기는 한 덩어리로 쓴다(예: "영어 원문"). 항목이 하나뿐이라 고를 게 없으면 드롭다운을 그리지 않는다.
- 표기 방식이 여러 가지로 갈리면 말로 묻지 말고 **시안 그림**으로 비교해 보여 준다.

## 흔한 실수 (실제로 지적받은 것)

- 긴 번역문에서 선택지가 "中文(简…"로 잘렸다. 처음 낸 안은 목록을 아이콘 쪽으로 끌어당기는 것이었는데, 사용자가 "아이콘까지 당기지 않는 방법"을 원해 오른쪽으로 넓히는 안을 택했다.
- 화살표를 테두리 끝에 붙였다 / 브라우저 기본 화살표와 커스텀 화살표가 겹쳤다.
- 닫힌 메뉴만 재서 가장 오른쪽 버튼에서 연 팝오버가 화면 밖으로 나갔다.
- 영어 짧은 값으로만 시험했다 → 독일어·中文으로 다시 시험한다.
- 스크롤바가 글자 칸을 줄여 목록이 다시 잘렸다 → 높이를 먼저 늘린다.

## 스크립트

- `scripts/run-dropdown-check.mjs` — 3폭 × 2테마를 돌려 findings를 출력, fail이 있으면 종료 코드 1. `CHROMIUM_PATH`로 설치된 Chromium 지정 가능.
- `scripts/dropdown-check.js` — 페이지 안 측정기. check: `arrow`(화살표 크기·여백·세로 가운데), `cut`(잘림·줄임표), `input`(16px·44px), `edge`(화면 8px 안), `start`(시작선), `scroll`(스크롤바). 자유 글이라 줄임표가 허용된 트리거에는 `data-qa-free-text`를 붙인다.
