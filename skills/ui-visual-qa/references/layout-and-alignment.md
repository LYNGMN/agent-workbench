# 정렬·배열

## 기준
- **버튼 속 요소**: 버튼 안 아이콘과 글자를 합친 영역의 중심이 버튼 중심에서 가로·세로 0.5px 이내여야 한다. 닫기 X, ⋯, +/− 같은 아이콘만 있는 버튼도 같다.
  - 왼쪽 정렬이 의도인 메뉴 항목·목록 줄은 세로만 잰다.
- **세로 중심**: 머리줄 제목과 옆 버튼(닫기 등), 설정 줄의 이름과 −·+ 버튼은 중심 차이가 0.5px 이내여야 한다.
- **간격**
  - 보이는 버튼·링크·입력끼리 겹침 0, 간격 2px 이상. 권장 간격은 8px이다.
  - 조작 영역은 프로젝트 기준 44px(WCAG 2.5.8 최소는 24px)이다.
- **묶음**
  - 같은 묶음의 버튼은 같은 폭 격자(`grid-template-columns: repeat(n, minmax(0, 1fr))`)에 둔다.
  - 한 줄에 들어가면 한 줄로 두고, 넘치면 고르게 나눈다. 예: 7개는 4+3.
  - 들쭉날쭉한 `flex-wrap`과 끝 줄에 하나만 남는 배치는 금지다.
  - 줄마다 top이 같아야 한다. 320px과 글자 125%에서도 확인한다.
- **휴대폰 도구**: 흩어 두지 않고 하단 메뉴바처럼 한 덩어리로 묶는다.

## 고치는 법
```css
.icon-button { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
.icon-button svg { display: block; flex: none; }          /* 글꼴 기준선 때문에 생기는 1~2px 어긋남 제거 */
.toolbar { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.toolbar > * { min-width: 0; white-space: nowrap; }
```
- 아이콘 글꼴(문자 아이콘)은 기준선 때문에 어긋난다. SVG(Lucide)를 쓴다.
- 패딩을 좌우로 다르게 주지 않는다. 비대칭이 필요하면 아이콘과 글자를 감싼 안쪽 묶음을 가운데에 둔다.
- 실루엣 때문에 작아 보이는 아이콘(예: 태그, 북마크)만 `transform`으로 광학 보정한다. 이때 그 값을 주석으로 남긴다.
- 헤드리스 렌더링에서는 글자가 실제보다 약 0.3px 아래에 그려진다. 0.3~0.5px 차이는 실제 브라우저에서 다시 본다.
