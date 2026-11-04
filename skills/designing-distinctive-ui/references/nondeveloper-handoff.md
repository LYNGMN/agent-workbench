# Non-Developer Handoff

Explain decisions through user impact rather than implementation jargon.

## Before Implementation

```text
결정:
근거:
유지 범위:
변경 범위:
검증 계획:
배포 여부:
```

When the working tree is dirty, separate changes related to this request,
earlier leftovers, and changes requiring review.

## Audit

```text
판정:
P0–P3 발견사항:
Visual Readability:
Interaction Predictability:
System Cohesion:
Change Safety:
수정 순서:
```

Every finding includes observed evidence, user impact, and the smallest useful
correction. Do not invent file evidence for a concept-only review.

## Completion

```text
작업 결과
- 개선한 것:
- 바뀐 사용자 경험:
- 적용한 디자인 방향:
- 참고한 원칙:
- 복제하지 않은 것:
- 배포 여부:
- 운영 확인:
- 테스트 결과:
- 브라우저 확인:
- 자동 디자인 검사:
- 커밋 여부:
- 남은 미커밋:
- 추가 개선 후보:
- 사용자가 확인할 것:
```

Use `확인함` only for fresh commands, browser checks, or screenshots actually
reviewed. Use `코드 기준 확인` without browser evidence and `미확인` when the
environment blocks a check. Distinguish installed skills from project-enabled
hooks.
