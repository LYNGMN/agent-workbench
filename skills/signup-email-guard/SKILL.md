---
name: signup-email-guard
description: Use when a service's email sign-up must refuse disposable or anonymous-forwarding addresses (일회용 메일, 익명 전달 메일, 임시 메일, 가입 막기) such as SimpleLogin, DuckDuckGo duck.com, Firefox Relay mozmail.com, addy.io, Proton Pass, Forward Email, mailinator or yopmail; when adding, refreshing or reviewing such a block list; or when deciding how Apple Hide My Email (privaterelay.appleid.com) should be treated.
argument-hint: "[적용할 서비스나 가입 코드]"
---

# 가입 메일 도메인 차단 (signup-email-guard)

## 개요
일회용 메일과 익명 전달 메일은 한 사람이 주소를 끝없이 만들 수 있다. 그래서 무료 한도 반복 사용, 초대·체험 남용, 차단 회피에 쓰인다.
이 스킬은 두 가지를 담는다.
- 막을 도메인 목록과 근거
- 서비스에 붙이는 규칙

목록은 여기 한 곳에서 관리한다. 각 서비스는 생성된 파일을 커밋해 쓴다.

## 들어 있는 것
| 파일 | 내용 |
|---|---|
| `data/alias-domains.json` | 직접 고른 익명 전달 서비스 도메인. 그룹(`relay`·`apple`)과 근거(MX), 출처, 확인한 날이 함께 있다. |
| `data/disposable-domains.txt` | 공개 일회용 목록 사본(약 9,900개). 출처는 [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains)의 `disposable_email_blocklist.conf`이고 CC0다. |
| `data/disposable-source.json` | 사본을 받은 커밋, 날짜, 개수 |
| `scripts/refresh.mjs` | 공개 목록을 다시 받아 바뀐 점을 보여 준다. 10% 넘게 줄었거나 gmail 같은 일반 메일이 끼어 있으면 거부한다. |
| `scripts/build-module.mjs <out.js>` | 서비스가 커밋할 ES 모듈을 만든다. |
| `scripts/check-mx.sh` | 직접 고른 도메인의 MX를 다시 조회한다. 근거가 낡았는지 확인할 때 쓴다. |
| `scripts/never-block.mjs` | 어떤 목록에도 들어가면 안 되는 일반 메일 도메인 |

공개 목록에는 덕덕고·심플로그인·Firefox Relay 같은 익명 전달 서비스가 **없다**. 그래서 `relay` 그룹을 따로 관리한다.

## 그룹과 기본값
| 그룹 | 무엇 | 기본 |
|---|---|---|
| `relay` | Forward Email(hash.fyi 등), SimpleLogin, Proton Pass, DuckDuckGo, Firefox Relay, addy.io, 33mail, Spamgourmet, Erine, BurnerMail | 막음 |
| `disposable` | 공개 일회용 목록 | 막음 |
| `apple` | Apple Hide My Email `privaterelay.appleid.com` | **허용**(스위치만 둠) |

- Apple을 따로 두는 이유
  - 평범한 아이폰 사용자도 많이 쓴다.
  - 'Apple로 로그인'을 붙이면 이 주소로 들어온다.
- Fastmail Masked Email은 넣지 않는다.
  - fastmail.com과 사용자 개인 도메인을 함께 쓰기 때문에, 막으면 실제 메일함까지 막힌다.

## 서비스에 붙이는 규칙
1. **서버에서만 검사한다.** 목록(약 145KB)은 방문자 번들에 넣지 않는다. 화면은 서버가 돌려준 오류 코드만 보여 준다.
2. **도메인과 그 상위 도메인을 모두 비교한다.** `a@b.mozmail.com`은 `b.mozmail.com`, `mozmail.com` 순서로 찾는다. 소문자로 바꾸고 끝의 점은 뗀다. 프리미엄 사용자는 `이름.aleeas.com`, `이름.anonaddy.com`, `이름.33mail.com` 같은 하위 도메인을 쓴다.
   ```js
   function domainGroup(email, sets) { // sets: {relay:Set, apple:Set, disposable:Set}
     let host = email.slice(email.lastIndexOf('@') + 1).toLowerCase().replace(/\.+$/, '');
     for (; host.includes('.'); host = host.slice(host.indexOf('.') + 1))
       for (const [group, set] of Object.entries(sets)) if (set.has(host)) return group;
     return null;
   }
   ```
   - **새 가입은 ASCII 도메인만 받는다.** 전각(`ｄｕｃｋ.com`)이나 폭 0 공백(`duck.com\u200b`)이 섞인 주소는 흔한 주소 형식 검사(`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)를 통과하지만 목록에는 걸리지 않는다. 그런데 메일 서버는 이런 주소를 목록의 도메인으로 배달할 수 있다. 그래서 가입 단계에서는 `/^[a-z0-9-]+(\.[a-z0-9-]+)+\.?$/`에 맞지 않는 도메인을 형식 오류로 거부한다. 한글 도메인을 쓰려면 퓨니코드(`xn--…`)로 받는다. 기존 계정의 로그인은 건드리지 않는다.
3. **막는 곳:**
   - 이메일 가입 요청: 확인 메일을 보내기 전에 막는다.
   - 가입 링크를 열어 계정을 만드는 순간: 스위치를 켜기 전에 나간 링크를 막기 위해 한 번 더 확인한다.
4. **막지 않는 곳:**
   - 이미 있는 계정의 로그인과 비밀번호 찾기
   - Google·Apple 같은 OAuth 로그인: 공급자가 메일함 소유를 증명한다.
     - 알고 남기는 틈: duck.com·mozmail.com 주소로 만든 Google 계정은 Google 로그인으로 들어올 수 있다. 막으려면 OAuth 가입에도 같은 검사를 따로 붙여야 하고, 서비스마다 정한다.
   - 관리자가 미리 승인한 **정확한 주소**
5. **화면 문구는 분명하게 쓴다.** 예: "일회용·익명 전달 메일로는 가입할 수 없습니다. 평소 쓰는 메일이나 Google로 가입해주세요. 이미 계정이 있으면 로그인해주세요."
   - 서버 오류 문구와 화면 문구는 띄어쓰기까지 똑같이 맞춘다.
   - 막힌 요청은 메일을 보내지 않으므로 하루·한 달 메일 한도도 쓰지 않게 한다(시험으로 확인).
   - 도메인 차단은 계정이 있는지를 드러내지 않으므로 숨길 필요가 없다.
   - 계정 존재와 엮인 검사(별칭 중복 가입 등)는 반대로 모두에게 같은 답을 준다.
6. **관리자 스위치:** 전체 스위치 하나와 그룹 스위치(relay·disposable·apple)를 둔다. 리비전 확인으로 동시 저장을 막고, 저장할 때 감사 기록을 남긴다. 설정 표가 없으면(마이그레이션 전) 아무것도 막지 않는다.
7. **비용:** 메모리 안의 Set만 조회한다. DB에서는 정책 한 줄만 읽고 외부 API는 부르지 않는다. 실행 중에 목록을 내려받지 않는다. 그래야 GitHub 장애나 누가 목록을 잘못 고친 일이 가입 장애로 번지지 않는다.

## 목록 갱신 (석 달에 한 번, 또는 새 서비스를 볼 때)
```bash
cd ~/.agents/skills/signup-email-guard
node scripts/refresh.mjs --dry-run      # 바뀐 점만 보기
node scripts/refresh.mjs                # 사본·출처 갱신
bash scripts/check-mx.sh                # 직접 고른 도메인의 MX 다시 확인
node scripts/build-module.mjs <서비스>/src/email-domain-blocklist.js
```
그다음 서비스 저장소에서 시험을 돌리고, 생성 파일의 diff를 PR로 올린다.

새 익명 전달 도메인을 넣을 때는 근거를 남긴다.
1. `dig +short MX <도메인>`으로 그 서비스의 메일 서버인지 확인한다(같은 서비스면 MX 이름이나 IP가 같다).
2. `alias-domains.json`에 `evidence`와 `source`를 함께 적는다.
3. 확인하지 못한 것은 `notListed`에 이유와 함께 둔다.

## 흔한 실수
| 실수 | 바로잡기 |
|---|---|
| 주소 형식만 검사하고 유니코드 도메인을 받음 | 전각·폭 0 공백으로 목록을 비켜 간다. 새 가입은 ASCII 도메인만 받는다. |
| 정확히 같은 도메인만 비교 | 하위 도메인도 비교해야 한다. 프리미엄 별칭은 하위 도메인을 쓴다. |
| 웹사이트 도메인만 넣음(relay.firefox.com) | 실제 메일은 mozmail.com으로 온다. MX로 확인한다. |
| 목록을 화면 번들에 넣음 | 서버에서만 검사하고, 화면은 오류 코드를 보여 준다. |
| 실행 중에 GitHub에서 목록을 받음 | 검토한 사본을 커밋한다. |
| Google 로그인까지 막음 | OAuth는 막지 않는다. |
| Apple 주소를 기본으로 막음 | 서비스 성격에 맞춰 정하되, 기본은 허용이다. |
