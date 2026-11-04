# 외부 원본과 라이선스

이 저장소는 외부 스킬을 **복사해 싣지 않습니다.** 설치기가 아래 원본 저장소를 [manifest/sources.json](manifest/sources.json)에 적힌 커밋으로 받아 `~/.agents/sources`에 두고, 링크만 겁니다. 받은 원본의 저작권과 라이선스는 각 원본 저장소의 `LICENSE`를 따릅니다.

## 설치기가 받는 원본

| 묶음 | 원본 | 라이선스 | 쓰임 |
|---|---|---|---|
| 기본 | [obra/superpowers](https://github.com/obra/superpowers) | MIT | 계획·디버깅·테스트 주도 개발 같은 개발 과정 스킬 |
| 기본 | [garrytan/gstack](https://github.com/garrytan/gstack) | MIT | 브라우저 확인·리뷰·QA·배포 같은 실행형 스킬 |
| 기본 | [backnotprop/pstack](https://github.com/backnotprop/pstack) | MIT | 일하는 원칙 스킬(DeepSeek Harness에만 연결) |
| 기본 | [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | MIT | 코드 작성 안전망 |
| `extra` | [cloudflare/skills](https://github.com/cloudflare/skills) | Apache-2.0 | Cloudflare 공식 스킬 |
| `extra` | [trailofbits/skills](https://github.com/trailofbits/skills) | CC-BY-SA-4.0 | 보안 검토 스킬 7개 |
| `extra` | [agamm/claude-code-owasp](https://github.com/agamm/claude-code-owasp) | MIT | OWASP 기준 보안 코딩 검토 |
| `extra` | [BehiSecc/VibeSec-Skill](https://github.com/BehiSecc/VibeSec-Skill) | Apache-2.0 | 바이브코딩 보안 검토 |
| `extra` | [beefiker/superloopy](https://github.com/beefiker/superloopy) | MIT | 반복 작업 루프 스킬 |
| `extra` | [jpantsjoha/pinescript-plugin](https://github.com/jpantsjoha/pinescript-plugin) | MIT | TradingView Pine Script v6 |
| `extra` | [typesafe-ai/skills](https://github.com/typesafe-ai/skills) | MIT | TypeSafe AI 안내 |
| `extra` | [LYNGMN/security-foundations-plugin](https://github.com/LYNGMN/security-foundations-plugin) | MIT | 보안 기초 진단 |
| `extra` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 | 화면 디자인 점검(`designing-distinctive-ui`가 씀) |
| `extra` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), [taste-skill-classics](https://github.com/Leonxlnx/taste-skill-classics), [imagegen-skills](https://github.com/Leonxlnx/imagegen-skills) | MIT | 디자인 취향 스킬(`taste-skill` 감싸개가 읽음) |
| `catalog` | [affaan-m/ECC](https://github.com/affaan-m/ECC) | MIT | 보관용 카탈로그(`ecc` 입구 스킬이 한 파일씩 읽음) |
| `catalog` | [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | Apache-2.0 | 보관용 보안 카탈로그 |

Trail of Bits 스킬(CC-BY-SA-4.0)은 고쳐서 다시 배포하면 같은 라이선스로 공개해야 합니다. 이 저장소는 고치지 않고 원본을 그대로 연결합니다.

## 이 저장소에 함께 실은 것

| 파일 | 출처 | 라이선스 |
|---|---|---|
| [skills/signup-email-guard/data/disposable-domains.txt](skills/signup-email-guard/data/disposable-domains.txt) | [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains)의 `disposable_email_blocklist.conf` 사본. 받은 커밋은 같은 폴더 `disposable-source.json` | CC0-1.0 |

## 감싸개와 참고만 한 것

- `skills/taste-skill/*`, `skills/designing-distinctive-ui`, `skills/ecc`는 위 원본의 `SKILL.md`를 **경로로 읽으라고 안내하는 짧은 감싸개**입니다. 원본 내용은 싣지 않습니다.
- `skills/korean-natural-writing`은 여러 공개 스킬의 접근법을 참고해 새로 쓴 것입니다. 참고한 곳과 독립 작성 범위는 [references/sources.md](skills/korean-natural-writing/references/sources.md)에 있습니다.
- `skills/ui-visual-qa/references/design-policy.md`는 토스의 공개 발표와 Frontend Fundamentals를 일반화한 개인 기준이며, 토스의 공식 표준이 아닙니다.
