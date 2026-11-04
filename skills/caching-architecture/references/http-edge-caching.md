# HTTP·엣지 캐싱

## 캐시 위치와 먼저 확인할 것

- **private cache**: 한 사용자의 브라우저 같은 전용 캐시
- **shared cache**: 여러 사용자가 공유하는 프록시·CDN 캐시
- **managed cache**: 공급자가 purge, cache key 같은 추가 기능을 제공하는 CDN

응답의 공개 범위, 인증·쿠키 의존성, 언어·인코딩 변형, 허용 stale 시간을 먼저 적는다. 인증 응답을 URL만으로 구분하는 공유 캐시에 넣으면 다른 사용자에게 노출될 수 있다.

## 핵심 지시어

| 지시어 | 의미와 사용 판단 |
|---|---|
| `no-cache` | 저장은 허용하지만 재사용 전에 원본 검증이 필요하다. “저장 금지”가 아니다. |
| `no-store` | 저장을 금지한다. 이전에 저장된 복사본을 지우는 지시어는 아니며 일반 HTML 최신성 해결책으로 남용하지 않는다. |
| `private` | 공유 캐시 저장을 막고 private cache만 허용한다. 개인화 응답의 기본 후보이다. |
| `public` | 원래 공유 불가능한 응답도 공유할 수 있음을 명시한다. 내용이 정말 공개인지 검증한다. |
| `max-age` | 응답 생성 시점부터의 freshness 수명이다. `Expires`보다 우선한다. |
| `s-maxage` | 공유 캐시에만 적용되는 freshness 수명이다. private cache의 `max-age`와 분리할 때 사용한다. |
| `must-revalidate` | stale 응답을 임의 재사용하지 말고 원본에 재검증하도록 한다. |
| `stale-while-revalidate`, `stale-if-error` | 가용성과 최신성의 명시적 절충이다. 허용 stale 예산 안에서만 사용한다. |

## 검증자와 조건부 요청

- `ETag` 응답은 다음 요청의 `If-None-Match`와 비교된다.
- `Last-Modified` 응답은 `If-Modified-Since`와 비교된다.
- 둘 다 있으면 `If-None-Match`가 우선한다. 가능하면 둘을 함께 제공해 호환성을 높인다.
- 변경이 없으면 `304 Not Modified`, 변경되면 새 본문과 `200` 응답이 와야 한다.

## HTML과 해시 자산

- 진입 HTML은 새 배포의 자산 해시를 발견해야 하므로 보통 `no-cache`와 validator로 매번 가볍게 재검증한다.
- 내용 해시가 파일명에 들어간 JS/CSS/이미지는 새 내용이 새 URL이 된다. 긴 `max-age`와 `immutable`이 적합하다.
- 배포는 새 자산 업로드 → 새 HTML 게시 순서로 하고, 롤백 중 이전 자산도 필요한 기간 유지한다.
- CDN purge가 필요한지는 HTML의 실제 cache key와 공급자 정책으로 판단한다. 파일명 해시만 믿고 고정 URL HTML을 방치하지 않는다.

## `Vary`와 개인화

- 표현이 `Accept-Encoding`이나 `Accept-Language`에 따라 달라지면 그 차원을 `Vary` 또는 정규화한 CDN cache key에 반영한다.
- `Vary: Cookie`는 모든 쿠키 조합을 갈라 hit ratio와 저장 효율을 크게 떨어뜨릴 수 있다.
- 사용자별 응답은 기본적으로 `private` 또는 CDN bypass를 사용한다. 공유해야 한다면 테넌트·사용자·권한·언어가 완전하게 격리되고 purge 경로가 있다는 것을 먼저 증명한다.

## 진단과 검증

1. 개발자 도구와 `curl -I`로 `Age`, `Cache-Control`, `ETag`, `Last-Modified`, `Vary`, CDN hit/miss 헤더를 확인한다.
2. 최초 요청, fresh 재요청, 만료 후 조건부 요청, 새 배포 요청을 각각 시험한다.
3. 로그인 사용자 둘과 언어 둘로 교차 요청해 응답 혼선을 확인한다.
4. purge가 공급자 전체 POP에 전파되는 시간과 실패 동작을 운영 전 검증한다.

## 공식 자료

- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
