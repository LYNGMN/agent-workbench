# 스크롤과 화면 밖

## 스크롤이 생길 때
- **얇은 테마 색 스크롤바**
  ```css
  .scroller { scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; scrollbar-gutter: stable; overscroll-behavior: contain; }
  .scroller::-webkit-scrollbar { width: 8px; height: 8px; }               /* scrollbar-width를 지원하지 않는 WebKit용 */
  .scroller::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
  .scroller::-webkit-scrollbar-track { background: transparent; }
  ```
  - `--scroll-thumb`는 밝음·어두움 토큰으로 각각 정한다(배경 대비 3:1 안팎).
  - `scrollbar-gutter: stable`을 주면 스크롤바가 생겨도 레이아웃이 밀리지 않는다.
- **패널·모달·하단 시트**
  - `overscroll-behavior: contain`으로 바깥 페이지가 같이 스크롤되지 않게 한다.
  - 모달이 열리면 배경 스크롤을 잠근다.
- **가로로 넘치는 탭·칩**
  - 양 끝을 흐리게(`mask-image: linear-gradient(...)`) 처리하고 `scroll-snap-type: x proximity`를 준다.
  - 키보드 화살표로 이동할 수 있게 한다.
  - 스크롤바를 숨긴다면(`scrollbar-width: none`) 끝 흐림이 반드시 있어야 더 있다는 것을 알 수 있다.
- **고정 머리줄**: `scroll-padding-top`을 줘서 링크나 초점 이동 때 제목이 머리줄에 가려지지 않게 한다(2.4.11).
- **부드러운 스크롤**: `scroll-behavior: smooth`는 `@media (prefers-reduced-motion: no-preference)` 안에서만 쓴다.
- **금지**: 페이지와 안쪽 상자가 동시에 세로로 스크롤되는 이중 스크롤, 휴대폰 페이지 전체의 가로 스크롤
- **검사 환경**: 실제 브라우저나 `--hide-scrollbars`를 끈 헤드리스에서 확인한다. 기본 헤드리스는 스크롤바를 숨긴다.

## 화면 밖으로 벗어나는 요소
- 보이는 모든 요소는 `0 ~ document.documentElement.clientWidth`(스크롤바를 뺀 폭) 안에 있어야 한다. 의도된 가로 스크롤 상자 안쪽은 예외다.
- **펼친 층**(메뉴, 드롭다운, 팝오버, 툴팁, 우클릭 메뉴, 하단 시트, 토스트)
  - 화면 끝에서 8px 이상 떨어져 있어야 한다. 화면을 꽉 채우는 하단 시트는 예외다.
  - 위치는 `clientWidth - 8`로 제한하고, `window.innerWidth`를 쓰지 않는다. `innerWidth`에는 스크롤바가 포함된다.
  - **가장 오른쪽·가장 아래 버튼에서 열었을 때**를 반드시 잰다.
- **고정 요소**(머리줄, 하단 막대, 토스트): 화면 높이 안에 있어야 한다. 휴대폰에서는 `padding-bottom: env(safe-area-inset-bottom)`으로 홈 표시줄을 피한다. 실제 안전 영역은 에뮬레이션으로는 0이므로 실기기에서 본다.
- **스크롤 상자 안**(내용이 길어 안에서 스크롤하는 하단 시트·모달·패널): 스크롤해서 닿는 내용은 화면 밖 실패로 세지 않고, 스크롤 상자 자체가 화면 안에 있는지와 끝(아래 여백 포함)이 안전 영역 위에 오는지만 본다. 겹침은 같은 스크롤 상자 안 버튼끼리는 같이 움직이므로 스크롤 위치와 상관없이 재고, 상자 밖 버튼과는 상자의 보이는 부분만 재며, sticky 머리줄 밑으로 지나가는 내용은 그 머리줄의 버튼과 비교하지 않는다. 그러니 검수 스크립트에서 시트를 한 화면씩 내리며 잴 필요가 없다. 스크롤이 없는 고정 막대가 잘린 것은 그대로 실패다.
- **부모에 잘림**: `overflow: hidden`인 부모 때문에 버튼이나 글자가 반만 보이면 안 된다.
- 위 기준은 320px에서의 리플로(WCAG 1.4.10)와 200% 확대(1.4.4)에서도 지켜져야 한다.
