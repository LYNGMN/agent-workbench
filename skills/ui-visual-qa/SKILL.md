---
name: ui-visual-qa
description: "Use after creating or changing any web UI (pages, components, mockups, widgets, artifacts) and before showing it, to measure centering, button grids, overlap, off-screen menus, light/dark contrast, Korean line breaks at 320/375px, icon consistency, scrollbars and WCAG 2.2 AA basics (UI 검수, 정렬, 다크모드, 줄바꿈, 접근성)."
argument-hint: "[검수할 URL]"
---

# UI Visual QA

UI를 만들거나 바꾼 뒤, **보여 주기 전에** 브라우저에 띄워 숫자로 잰다. 눈대중 보고는 완료가 아니다. 시안·대화 위젯·아티팩트도 같다.

- 필수 의존성: 접근성 기준은 `wcag22-vibe-coding`(WCAG 2.2 AA)이 소유한다. 이 스킬은 자주 걸리는 항목을 재는 도구와 프로젝트 기준만 담는다.
- 아이콘 고르기·SVG 구현은 `icon-svg-implementation`이 맡고, 이 스킬은 일관성 검수만 한다.
- 기준 숫자는 사용자 결정·WCAG·프로젝트 기존 기준에서만 가져온다. 프로젝트 `AGENTS.md`에 더 엄격한 값이 있으면 그 값을 따른다.

## 7개 영역 (각 참조 문서에 기준과 고치는 법)

| 영역 | 핵심 기준 | 문서 |
|---|---|---|
| 1. 정렬·배열 | 버튼 내용 중심 ↔ 버튼 중심 0.5px 이내(닫기 X 포함), 제목–옆 버튼 세로 중심 0.5px, 겹침 0·간격 2px 이상, 묶음은 같은 폭 격자, 끝 줄 하나만 남기 금지 | [layout-and-alignment.md](references/layout-and-alignment.md) |
| 2. 밝음·어두움 | 두 테마 모두 글자 4.5:1, 큰 글자·아이콘·경계·초점 링 3:1 | [theme-contrast.md](references/theme-contrast.md) |
| 3. 줄바꿈 | 섹션명·메뉴명·항목명·버튼·탭은 한 줄, 설명은 단어 중간·조사 앞 끊김 0 | [korean-line-breaking.md](references/korean-line-breaking.md) |
| 4. 좁은 화면 조작 | 숨긴 조작(길게 누르기·세 번 누르기·우클릭·세 번 클릭)은 지름길, 보이는 경로·키보드 경로 필수 | [compact-interactions.md](references/compact-interactions.md) |
| 5. 스크롤·화면 밖 | 테마 색 얇은 스크롤바, 이중 스크롤 금지, 펼친 메뉴·토스트까지 화면 안·끝에서 8px | [scrolling.md](references/scrolling.md) |
| 6. 접근성·디자인 정책 | 시각·청각 장애인 이용(WCAG 2.2 AA), 상태 계약, 통제권 | [accessibility.md](references/accessibility.md), [design-policy.md](references/design-policy.md) |
| 7. 아이콘 일관성 | 한 세트, 같은 굵기·크기·스타일, 같은 뜻 = 같은 아이콘, 같은 묶음은 잉크 기준 광학 균형 | [icon-consistency.md](references/icon-consistency.md) |

## 실행 순서

> 이 스킬이 없는 환경(CI·컨테이너·다른 개발자 장치)에서는 같은 항목을 Playwright나 브라우저 개발자 도구로 직접 재고, 폭·테마마다 숫자와 스크린샷을 보고한다. 재지 못한 항목은 '미측정'으로 적고 통과로 쓰지 않는다.

1. **자동 측정**: `node ~/.agents/skills/ui-visual-qa/scripts/run-ui-audit.mjs <url> --out <폴더>`
   - 기본은 320·375·1280px × 밝음·어두움, 그리고 375px 글자 125%다. 줄임 동작 설정을 켜고, 스크롤바를 숨기지 않고 띄운다.
   - 앱의 테마 전환 방식을 지정한다. 지정하지 않으면 시스템 설정(`prefers-color-scheme`)만 바뀐다. 밝음·어두움 스크린샷이 같으면 방식을 잘못 고른 것이다.
     - `--theme-storage <localStorage 키>`: 불러오기 전에 저장값을 넣는다. 예: `app-theme`
     - `--theme-attr data-theme`
     - `--theme-class dark`, 또는 `light-mode=light`
     - `--theme-eval "<THEME을 쓰는 JS>"`
   - 아이콘 세트 클래스가 있으면 `--icon-class lucide`를 준다. 없으면 페이지에서 가장 많이 쓰는 굵기·viewBox를 기준 세트로 본다.
   - 펼쳐야 보이는 메뉴·팝오버·하단 시트·우클릭 메뉴는 `--open "<selector>"`로 연다. 스크립트가 첫 번째와 가장 오른쪽·아래 요소에서 각각 연다. `right:` 접두사는 우클릭, `long:` 접두사는 길게 누르기다.
   - 브라우저 패널에서는 `scripts/ui-audit.js` 내용을 `javascript_tool`에 붙이고 마지막에 `uiAudit({})`를 호출한다.
   - 스크린샷은 `--out` 폴더에 저장된다. 배포 폴더(dist 등) 안에는 두지 않는다.
2. **키보드**: Tab만으로 모든 기능에 닿는지, 초점이 보이고 고정 막대에 가려지지 않는지 본다. 러너가 Tab 60번까지 자동으로 확인한다.
3. **수동 확인**: 자동으로 못 보는 것을 직접 본다.
   - 스크린리더 이름 읽기(macOS VoiceOver ⌘F5)
   - 실기기의 안전 영역
   - 세 번 누르기·길게 누르기의 실제 감각
   - 아이콘의 광학적 크기: 눈짐작으로 끝내지 않는다. `scripts/measure-icon-optics.mjs`로 같은 묶음의 보이는 크기(±5%)와 눈에 보이는 중심(0.5px)을 재고, 확대 캡처로 나란히 비교한다([icon-consistency.md](references/icon-consistency.md) '광학 균형').
4. **보고**: 영역별 측정 숫자(최대 어긋남 px, 최저 대비비, 두 줄 라벨 수, 화면 밖 요소 수)와 스크린샷을 보고서에 적는다. 접근성 항목은 WCAG 기준 번호·영향·고친 내용·확인 방법으로 쓴다. 자동 검사와 수동 검사는 나눠 적는다. "WCAG 준수"라고 단정하지 않는다.
5. **실패 → 고침 → 다시 측정**: `fail`이 0이 될 때까지 반복한다. `warn`은 의도한 것인지 판단하고 그 이유를 적는다.

## 측정 스크립트가 보는 것

`scripts/ui-audit.js`는 결과를 `{summary, findings[{check, level, el, msg, data}]}` 형태로 돌려준다.

| check | 보는 것 |
|---|---|
| `center` | 버튼 내용의 중심과 버튼 중심 사이의 차이 |
| `overlap` | 버튼끼리 겹치거나 붙음. 스크롤 상자 밖 버튼과는 보이는 부분만 재고, sticky 머리줄 밑으로 지나가는 내용은 머리줄 버튼과 비교하지 않는다 |
| `row` | 버튼 묶음이 같은 폭 격자인지, 줄마다 높이가 맞는지, 끝 줄에 하나만 남았는지 |
| `label` | 이름이 두 줄로 넘어감 |
| `break` | 단어 중간·조사 앞에서 끊김 |
| `contrast` | 글자·아이콘·입력 경계의 대비 |
| `overflow` | 페이지 가로 넘침, 말줄임으로 잘린 글자(펼친 목록·메뉴 선택지면 실패) |
| `offscreen` | 화면 밖으로 나감, 고정 요소가 화면 아래로 벗어남, 펼친 층이 화면 끝에서 8px 미만. 안에서 스크롤하는 시트·모달은 내용이 아니라 스크롤 상자 자체가 화면 안인지 본다 |
| `clipped` | 부모 상자에 일부가 잘림 |
| `icon` | 아이콘 세트·굵기·크기·채움 혼용, 이모지 아이콘, 같은 이름에 다른 아이콘 |
| `scroll` | 기본 스크롤바, 바깥으로 이어지는 스크롤, 이중 스크롤, 줄임 동작 설정을 무시한 부드러운 스크롤 |
| `a11y` | 이름 없는 버튼, 키보드로 못 가는 클릭 요소, 조작 영역 24·44px, 대체 경로 없는 숨긴 조작, 자막, 상태 알림, alt, lang |
| `focus` | 초점 표시, 초점 가림. 러너만 확인한다. |

- 숨긴 조작이 있는 요소에는 `data-gesture="longpress|tripletap|contextmenu|swipe"`를 붙이고, 같은 기능을 하는 보이는 요소를 `data-gesture-alt="<selector>"`로 가리킨다.
- `center`·`label`은 화면에 보이는 글자만 잰다. 화면 읽기 전용 글자(1×1px로 잘린 `.sr-only`류, `clip: rect(0,0,0,0)`, `clip-path: inset(50%)`)는 줄 수와 내용 중심 계산에서 뺀다.
- 의도적으로 검사에서 뺄 요소에는 `data-qa-ignore`, 여러 줄이 의도된 라벨에는 `data-qa-multiline`을 붙인다.

## 흔한 실수

- 헤드리스 기본값(`--hide-scrollbars`) 그대로 재서 스크롤바 문제를 놓친다.
- 메뉴를 닫힌 상태로만 재서 화면 밖으로 나가는 팝오버를 놓친다. 가장 오른쪽 버튼에서 연 경우를 꼭 잰다.
- 다크 테마만 보고 라이트 테마를 놓친다. 그 반대도 같다.
- `aria-label`만 붙이고 실제로 읽어 보지 않는다.
- 줄바꿈 문제를 `&nbsp;`나 `<br>`로 덮는다. 고치는 법은 문구 축약, `keep-all`, 격자 조정이다.
