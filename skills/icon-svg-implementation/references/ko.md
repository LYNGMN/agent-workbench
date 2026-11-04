# 아이콘 SVG 구현 가이드

이 문서는 React Icons, SVGL, 공식 브랜드 SVG를 활용해 UI 아이콘과 로고를 보기 좋게 구현할 때 사용하는 한국어 가이드다.

## 기본 원칙

먼저 프로젝트를 확인한다. 아이콘 패키지를 바로 추가하지 말고, 현재 프로젝트가 이미 쓰는 아이콘 라이브러리, 컴포넌트 규칙, CSS 방식, 버튼/툴팁 패턴을 찾는다.

우선순위:

1. 기존 프로젝트 아이콘 컴포넌트 또는 이미 설치된 아이콘 라이브러리
2. React/Next.js UI 아이콘은 React Icons
3. 브랜드 로고와 제품 마크는 SVGL 또는 공식 브랜드 리소스
4. 필요한 경우에만 inline SVG

새 의존성은 꼭 필요할 때만 추가한다. 이미 `react-icons`, `lucide-react`, 자체 `Icon` 컴포넌트가 있으면 그것을 우선 사용한다.

## React Icons 사용 기준

React Icons는 검색, 메뉴, 설정, 업로드, 다운로드, 복사, 캘린더, 사용자, 차트, 화살표 같은 일반 UI 아이콘에 적합하다.

사용 전 확인:

- `package.json`에 `react-icons`가 있는지 확인한다.
- 주변 코드에서 어떤 아이콘 팩을 쓰는지 확인한다.
- 한 화면 안에서 아이콘 스타일이 섞이지 않도록 같은 계열을 우선한다.
- 실제 사용하는 아이콘만 named import 한다.

예시:

```tsx
import { LuSearch } from "react-icons/lu";

<LuSearch aria-hidden="true" className="h-4 w-4 shrink-0" />
```

아이콘만 있는 버튼은 반드시 접근성 이름을 넣는다.

```tsx
<button type="button" aria-label="검색" title="검색">
  <LuSearch aria-hidden="true" className="h-4 w-4" />
</button>
```

## SVGL 사용 기준

SVGL은 OpenAI, Google, Stripe, GitHub, Vercel, Discord 같은 브랜드/제품 로고를 가져올 때 적합하다.

검색:

```bash
python3 ~/.agents/skills/icon-svg-implementation/scripts/fetch-svgl.py search codex
```

다운로드:

```bash
python3 ~/.agents/skills/icon-svg-implementation/scripts/fetch-svgl.py fetch codex --variant light --out /private/tmp/codex.svg
```

SVGL 결과의 `route`는 하나의 SVG 주소일 수도 있고, `light`/`dark` 변형 객체일 수도 있다. 배경이 밝으면 보통 `light`, 어두우면 `dark` 변형을 선택한다. 단, 실제 SVG 색상과 배경 대비를 보고 최종 선택한다.

브랜드 로고는 색상과 비율을 함부로 바꾸지 않는다. 공개 서비스나 상업적 화면에서는 공식 브랜드 가이드를 우선 확인한다.

## Inline SVG 정리 기준

SVG를 직접 컴포넌트에 붙일 때:

- `viewBox`는 유지한다.
- React/TSX에서는 `fill-rule`을 `fillRule`, `clip-rule`을 `clipRule`처럼 바꾼다.
- 일반 선 아이콘은 가능하면 `currentColor`를 사용한다.
- 브랜드 로고는 공식 색상을 유지한다.
- `<script>`, 이벤트 핸들러, 외부 참조, 불필요한 편집기 메타데이터는 제거한다.
- 같은 SVG가 여러 번 렌더링될 수 있으면 `clipPath`, `mask`, `filter`, gradient ID 충돌을 피한다.

## 보기 좋게 만드는 체크리스트

완료 전 확인:

- 아이콘 크기가 주변 텍스트와 맞는가
- 버튼 안에서 아이콘이 중앙 정렬되는가
- hover, active, disabled, focus 상태가 깨지지 않는가
- 모바일과 데스크톱에서 레이아웃이 흔들리지 않는가
- 아이콘만 있는 버튼에 `aria-label` 또는 명확한 툴팁이 있는가
- 장식용 아이콘은 `aria-hidden="true"`로 처리했는가
- 브랜드 로고 색상과 비율을 유지했는가
- 다크 모드가 있으면 light/dark 로고 변형을 확인했는가

## 비개발자에게 설명할 때

아이콘 구현 결과를 설명할 때는 패키지명보다 화면 효과를 먼저 말한다.

좋은 설명:

- "검색 버튼은 Lucide 계열 아이콘으로 맞춰서 기존 UI와 선 두께가 같게 정리했습니다."
- "Codex 로고는 SVGL의 light 변형을 사용했고, 원본 비율과 색상은 유지했습니다."
- "아이콘만 있는 버튼에는 스크린리더가 읽을 수 있는 이름을 추가했습니다."

피해야 할 설명:

- "SVG path를 수정했습니다."
- "fillRule을 바꿨습니다."
- "라이브러리 import를 교체했습니다."

필요하면 기술 세부사항은 마지막에 짧게 덧붙인다.
