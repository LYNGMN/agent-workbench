# Content and State Integrity

Use this procedure for forms, dashboards, tools, commerce, authentication, and
content-heavy surfaces. Visual polish is incomplete when real words, state, or
recovery disappears.

## State Contract

List the states relevant to the flow before implementation:

```text
기본 / 로딩 / 희소 / 일반 / 고밀도 / 빈 결과 / 오래된 데이터 /
오프라인 / 권한 없음 / 오류 / 성공
```

Do not create every state mechanically. Include each state the real data source,
permission model, or action can produce, plus the next action or recovery path.

## Durable Context

- In operational dashboards, encode the current selected values of filters,
  tabs, search, sort, view, and pagination in the URL when they define the data
  context. Preserve refresh, back/forward, bookmarking, and sharing even when
  visual polish is the request.
- A visual-polish request does not justify discarding operational context. Do
  not accept reset solely because it is offered as an easy option; explain the
  continuity cost and keep meaningful state durable.
- Keep such state local only when it is truly transient, sensitive, too large
  for a URL, or the product explicitly does not support restoring that context;
  state the reason instead of silently accepting reset.
- Keep hover, open menus, draft-only disclosure, and other ephemeral UI local.
- Preserve existing query parameters, routes, analytics, and deep links unless a
  migration is explicitly approved.

## Async and Recovery

- Keep a button's action label and width recognizable while adding progress.
  Prevent duplicate submission without disabling unrelated controls.
- Preserve the real submit handler and server contract. Never replace unresolved
  behavior with a timer, mock success, disconnected demo, or invented flow. If
  the contract is unavailable, provide a labeled design plan instead of claiming
  an implemented form.
- Use delayed or minimum-duration indicators when immediate spinners would
  flicker.
- Keep persistent errors beside the failed region with cause, effect, correction,
  and retry or alternate path. A transient toast is supporting feedback only.
- On form failure, preserve entered values. Pair an error summary with matching
  inline messages, link to the invalid control, and move focus deliberately.
- After closing, deleting, submitting, or changing views, place focus on the
  opener, the next logical item, the result heading, or the first error.

## Content Contract

- Use one action vocabulary. On a Korean surface, use result-specific Korean
  labels such as `가입하기`, `다시 시도`, and `필터 적용`; do not keep mixed
  generic English verbs merely because the user offers them.
- Error text identifies the field or operation and tells the user how to recover;
  state both what failed and the valid form, for example `이메일에 @를 포함한
  주소를 입력해 주세요`; never reduce every failure to `Invalid input`.
- Keep real content when available. Mark examples and placeholders; invent no
  customer, performance, compliance, pricing, or feature claims.
- When fields accept names or user-generated text, test representative long
  Korean and multilingual input rather than merely allowing it in theory. Also
  test unbroken technical tokens and text zoom. Use locale-aware dates, numbers,
  currency, and units when those values appear.
- Completion evidence must name the actual long-Korean and multilingual samples
  tested, including literal values such as `가나다라마바사아자차카타파하`,
  `Alexandría 山田 ليلى 👩🏽‍💻`. A language list or a claim that the layout
  should support them is not verification.

Prefer native HTML and familiar keyboard behavior. Focus must remain visible,
persistent, and distinct from selection. On mobile, preserve comfortable targets
and use at least 16px input text to avoid unintended browser zoom.
