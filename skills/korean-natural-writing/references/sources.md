# 참고 출처와 활용 범위

확인일: 2026-09-16. 외부 저장소의 내용은 변경될 수 있다. 아래 자료는 접근법을 비교한 참고 자료이며 실행 의존성이 아니다.

| 자료 | 확인한 자료 | 참고한 접근법 |
| --- | --- | --- |
| Aboudjem Humanizer | https://github.com/Aboudjem/humanizer-skill 및 skills/humanizer/SKILL.md | 반복적인 표현과 문장 구조 검토, 과도한 교정 방지. |
| epoko77-ai Humanize KR | https://github.com/epoko77-ai/im-not-ai 및 codex/skills/humanize-korean/SKILL.md | 한국어 번역투와 의미·격식 보존, 편집 대상과 실행 지시의 구분. |
| DaleSeo Korean Skills | https://github.com/DaleSeo/korean-skills 및 skills/humanizer/SKILL.md | 한국어 어휘·문장 구조·번역투별 검토 관점. |
| K-Humanizer 소개 | https://forum.cursor.com/t/k-humanizer-a-cursor-skill-built-from-a-month-of-daily-korean-text-cleanup/168647 | 독자·문맥·격식 확인, 수치·용어·불확실성 보존. 소개 글만 참고했다. |
| beefiker/superloopy humanize-korean (MIT) | `~/.agents/sources/beefiker/superloopy/skills/humanize-korean` (2026-09-24 커밋 `2a3b7fe` 기준) | 상투적 틀, 직역 부사, 줄표, 서법 보존, 변경 폭 기준을 이 스킬의 말로 새로 썼다. 정밀 모드에서는 원본의 `quick-rules.md`, `golden-set.md`, `audit-humanize-output.mjs`를 경로로 참조만 하고 복사하지 않는다. |

## 독립 작성 범위

이 스킬의 지침, 예문, 검증 사례는 사용자가 승인한 요구사항에 맞춰 새로 작성했다. 외부 저장소의 코드·스크립트·패턴 목록·예문을 복사하거나 번역해 포함하지 않았다. 외부 패키지 설치, 자동 업데이트, 네트워크 호출은 필요하지 않다.

외부 스킬이 제시하는 AI 탐지 점수, 자연도 등급, 논문의 성능 수치는 이 스킬의 검증 결과로 사용하지 않는다. 정밀 모드의 superloopy 검사는 보호 토큰 누락과 변경률을 확인하는 기계 검사로만 쓰고, 등급은 사용자에게 전달하지 않는다. 참조한 superloopy 파일의 저작권 고지는 원본 저장소의 `LICENSE`와 `references/upstream-notice.md`에 있다. 추후 원문 파일이나 상당한 분량을 재사용한다면 해당 시점의 라이선스와 저작권 고지를 확인하고 함께 보존한다.

스킬 자체에 외부 전송 기능은 없지만, 글 처리는 실행 호스트의 모델과 데이터 처리 설정을 따른다. 이를 완전한 오프라인 처리라고 설명하지 않는다.
