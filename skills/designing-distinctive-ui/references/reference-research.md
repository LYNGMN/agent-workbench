# Reference Research

Choose evidence, not a template. Start with the product's own content, screens,
tokens, and user-provided references. Pick zero to three external sources and
give every source a different decision.

| Evidence | Role | Useful sources |
| --- | --- | --- |
| Strongest | Product truth and incumbent identity | Existing product, analytics, support evidence, user assets |
| Strong | Product flow and state behavior | [Refero](https://refero.design/), [Mobbin](https://mobbin.com/), [Page Flows](https://pageflows.com/) |
| Strong | Component behavior | [The Component Gallery](https://component.gallery/), [Design Systems Repo](https://designsystemsrepo.com/), official design systems |
| Supporting | Landing structure | [One Page Love](https://onepagelove.com/), [SaaSFrame](https://www.saasframe.io/) |
| Supporting | Composition and visual language | [SiteInspire](https://www.siteinspire.com/), [Minimal Gallery](https://minimal.gallery/), [CSS Design Awards](https://www.cssdesignawards.com/), [Awwwards](https://www.awwwards.com/websites/) |
| Experimental | Implementable interaction | [Codrops](https://tympanus.net/codrops/), [Design Spells](https://www.designspells.com/) |

Use user-provided URLs or screenshots first. Prefer direct item URLs over gallery
homepages. If a dynamic or gated page cannot be inspected, ask for a screenshot
or mark it unverified.

Award galleries support composition, typography, and art-direction decisions.
They are not evidence that a flow is usable, accessible, performant, or feasible.
For operational UI, prefer a real product flow or established component pattern.

## Feasibility Filter

Reject or simplify an idea that cannot:

- run in the locked stack without an unapproved dependency;
- preserve the page's single job;
- work without hover;
- reflow on narrow mobile;
- support reduced motion;
- retain readable text and visible focus;
- survive realistic Korean content.

For WebGL, Three.js, GSAP, heavy video, canvas, or scroll hijacking, reuse only
composition, palette logic, or a bounded interaction unless the user approves the
cost.

## Brief

For each source record:

```text
역할 / 관찰한 증거 / 재사용할 원칙 / 버릴 요소 / 현재 스택 구현 가능성 /
모바일·키보드·상태 적용 / URL
```

Then state:

```text
결합 방향 / 시그니처 결정 / 복제하지 않은 자산·문구·정체성
```

Never copy logos, claims, text, proprietary illustrations, or a complete visual
identity.
