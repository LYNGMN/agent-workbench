---
name: ui-alignment-check
description: "Use whenever you create or change any UI that has icons, buttons, labels, headers or toolbars (web pages, components, mockups, chat widgets, artifacts) and before you show it or report it done — measure, don't eyeball, that icons and text are centered inside buttons, siblings share a vertical centre, buttons never touch or overlap, button groups sit on one equal-width grid, names stay on one line, and icons in a group look the same size in light and dark at 320/375/desktop widths. Trigger on 아이콘 정렬, 중앙 정렬, 버튼 안 글자 중심, 닫기 X 어긋남, 아이콘 크기 균형, 버튼 간격·겹침, 줄바꿈, UI 검수, even if the user only says 'make it look right' or 'check the alignment'."
argument-hint: "[검수할 URL이나 HTML 파일]"
---

# UI 정렬 검수 (아이콘·글자·버튼)

UI를 만들거나 고친 뒤 **보여 주기 전에** 브라우저에 띄워 숫자로 잰다. "정렬이 맞아 보인다"는 완료 보고가 아니다. 사용자는 서브픽셀 단위로 눈으로 확인하는 사람이고, 한 번 어긋난 닫기 X나 붙은 버튼을 보면 같은 지적을 반복하게 된다. 이 스킬은 그 반복을 없애려고 사용자가 정한 기준과 고치는 법을 담았다.

## 기준 (이 숫자를 넘으면 실패)

| 항목 | 기준 |
|---|---|
| 버튼 안 내용 | 아이콘+글자를 합친 영역의 중심이 버튼 중심에서 가로·세로 **0.5px 이내**. 닫기 X, ⋯, +/− 같은 아이콘 전용 버튼도 같다. 왼쪽 정렬이 의도인 메뉴 줄은 세로만 잰다 |
| 같은 줄 요소 | 제목과 옆 버튼, 설정 이름과 −·+ 버튼은 세로 중심 차이 **0.5px 이내** |
| 버튼 간격 | 겹침 0. 기본 **8px**, 휴대폰에서 손가락으로 누르는 나란한 버튼 **12px**, 한 덩어리 탭 줄 안에서만 4px. **2px 미만은 늘 금지**. 한쪽만 있는 구분선과 가장 가까운 글자 사이는 최소 12px |
| 버튼 묶음 | 같은 폭 격자(`repeat(n, minmax(0,1fr))`). 줄마다 높이 같음. 끝 줄에 하나만 남기지 않는다(7개 = 4+3) |
| 이름(메뉴·버튼·탭·항목명) | 320·375px 기본 크기에서 **한 줄**. 먼저 문구를 줄이고 `<br>`·`&nbsp;`로 맞추지 않는다 |
| 같은 묶음의 아이콘 | 한 세트, 같은 선 굵기·크기·스타일. 선형과 채움을 섞지 않는다. 이모지·글자 기호(×, ▾, ☰)를 아이콘 대신 쓰지 않는다 |
| 아이콘 광학 균형 | 같은 묶음 안에서 보이는 크기 기준 아이콘의 **±5%**, 눈에 보이는 중심이 자리 중심에서 **0.5px 이내** |
| 두 테마 | 밝음·어두움 모두에서 안 보이는 부분이 없다. 글자 4.5:1, 아이콘·경계·초점 링 3:1 |

프로젝트 지침에 더 엄격한 값이 있으면 그 값을 따른다.

## 실행 순서

1. **자동 측정** — 320·375·1280px × 밝음·어두움으로 잰다.
   ```bash
   node scripts/run-align-check.mjs <url 또는 html 파일> --out shots/ [--open "<메뉴 버튼 selector>"] [--theme-storage <localStorage 키>] [--theme-attr data-theme]
   ```
   - 앱이 테마를 바꾸는 방식(저장값·속성·클래스)을 지정한다. 지정하지 않으면 시스템 설정만 바뀌어서 밝음·어두움 스크린샷이 똑같이 나온다. 같으면 방식을 잘못 고른 것이다.
   - 펼쳐야 보이는 메뉴·팝오버·시트는 `--open`으로 열어서도 잰다. 가장 오른쪽·아래 버튼에서 열어 화면 밖으로 나가는지 본다.
   - Playwright가 없으면 `scripts/align-check.js`를 페이지에 붙이고 `alignCheck()`를 호출한다(브라우저 콘솔, Puppeteer 등 어디서나). 결과는 `{summary, findings[{check, level, el, msg, data}]}`이다.
   - 도구를 아예 못 쓰는 환경이면 개발자 도구에서 `getBoundingClientRect()`로 직접 재고, 재지 못한 항목은 **'미측정'**으로 적는다. 통과로 쓰지 않는다.
2. **아이콘 광학 균형** — 같은 묶음(도구 막대, 탭 줄, 카드 바닥 줄)은 상자가 아니라 잉크를 잰다. `scripts/icon-optics.js`를 붙이고 `iconOptics({ selector: '.toolbar button', ref: 0 })`를 호출한다. `size`(보이는 크기, 1 = 기준과 같음)와 `oxPx`·`oyPx`(눈에 보이는 중심 어긋남)를 본다. 같은 24px 상자와 같은 선 굵기여도 아이콘마다 보이는 크기와 자리가 다르기 때문이다.
3. **눈으로 확인** — 숫자만 맞추지 않는다. 4~8배 확대 캡처를 만들어 보정 전/후를 나란히 보고 고른다. 숫자만 맞춘 안이 눈에는 X는 크고 팔레트는 작아 보인 적이 있다.
4. **고침 → 다시 측정** — `fail`이 0이 될 때까지 반복한다. `warn`은 의도한 것인지 판단하고 이유를 적는다.
5. **보고** — 폭·테마별로 최대 어긋남(px), 두 줄 이름 수, 겹침 수, 최저 대비비, 아이콘 크기 편차와 스크린샷을 적는다. 잰 것과 못 잰 것을 나눠 쓴다.

## 고치는 법

```css
/* 아이콘 버튼: 글꼴 기준선 때문에 생기는 1~2px 어긋남 제거 */
.icon-button { display: inline-flex; align-items: center; justify-content: center; line-height: 1; padding: 0; }
.icon-button svg { display: block; flex: none; }
/* 버튼 묶음: 들쭉날쭉한 flex-wrap 대신 같은 폭 격자 */
.toolbar { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.toolbar > * { min-width: 0; white-space: nowrap; }
/* 제목 + 옆 버튼 */
.header { display: flex; align-items: center; gap: 8px; }
```

- 아이콘은 SVG로 쓴다. 문자 아이콘(×, ⋯ 글자)은 글꼴 기준선 때문에 늘 어긋난다.
- 좌우 패딩을 다르게 주지 않는다. 비대칭이 필요하면 아이콘과 글자를 감싼 안쪽 묶음을 가운데에 둔다.
- **광학 보정**: 실루엣 때문에 작거나 크게 보이는 아이콘만, 그 묶음 안에서만 path에 `transform`(scale·translate, `transform-box: view-box; transform-origin: center`)을 준다. 선 굵기는 `원래 굵기 ÷ scale`로 되돌려 같은 굵기로 보이게 한다. 대각선만 있는 X·↗는 외곽선보다 크게 느껴져서 기준의 0.93을 목표로 한다. 보정 전/후 측정값을 값 옆 주석으로 남기고, 같은 아이콘이 쓰이는 다른 화면은 바꾸지 않는다.
- 줄바꿈 문제는 문구 축약, `word-break: keep-all`, 격자 조정으로 고친다.

## 흔한 실수 (이전에 실제로 지적받은 것)

- **시안과 실제 환경의 차이**: 대화 위젯·미리보기 시안은 호스트의 button/input 스타일이 색과 높이를 덮어쓴다. 시안 색·높이는 `!important`로 고정하고, 검수 페이지에 **반대 테마의 호스트 스타일**을 씌워 잰다. 다크에서 글자가 안 보이는 일이 이렇게 났다. 시안을 다른 글꼴로 흉내 내면 실제와 달라지니 실제 앱을 그 크기로 렌더해서 본다.
- **헤드리스 렌더링 편차**: 헤드리스 Chromium은 글자를 실제 브라우저보다 약 0.3px 아래에 그린다. 0.3~0.5px 차이는 실제 브라우저에서 다시 본다. 아이콘이 낮아 보인다는 말을 들으면 아이콘을 0.3px 올려 본다.
- 닫기 X가 버튼 정중앙이 아닌데 "대충 맞다"고 보고했다 → 아이콘 전용 버튼도 0.5px 기준을 그대로 적용한다.
- 펼침 영역 위 구분선과 첫 글자 사이가 4px였다 → 한쪽만 있는 구분선과 글자는 최소 12px(보통 16–20px)이다. 자동 도구가 못 재므로 직접 잰다.
- 메뉴를 닫힌 상태로만 재서 화면 밖으로 나가는 팝오버를 놓쳤다. 다크만 보고 라이트를 놓치는 것도 같다.
- 빠른 설정 버튼이 두 줄로 넘어갔다 → 한 줄이 불가능하면 고르게 나눈다(4+3), 끝 줄에 하나만 남기지 않는다.
- 숫자 기준이 서로 다른 문서에 흩어져 있을 수 있다(8px / 12px / 4px). 위 표처럼 맥락(일반 / 휴대폰 나란한 버튼 / 붙은 탭 줄)으로 구분하고, 프로젝트가 다르게 정했으면 그 값을 따른다.

## 스크립트

- `scripts/run-align-check.mjs` — Playwright로 6가지 조합(3폭 × 2테마)을 돌려 findings를 출력, `fail`이 있으면 종료 코드 1. `CHROMIUM_PATH`로 설치된 Chromium을 지정할 수 있다.
- `scripts/align-check.js` — 페이지 안에서 도는 측정기. check 종류: `center`(내용 중심), `row`(같은 줄 세로 중심), `gap`(겹침·붙음), `label`(두 줄로 넘어간 이름), `iconset`(한 묶음 안 크기·굵기·채움 혼용). 의도한 여러 줄 라벨에는 `data-qa-multiline`을 붙인다.
- `scripts/icon-optics.js` — `iconOptics()`: 아이콘을 실제 화면 변환 그대로 캔버스에 다시 그려 보이는 크기와 중심을 잰다.
