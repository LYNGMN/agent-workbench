---
name: developing-tradingview-pine-scripts
description: Use when creating, modifying, reviewing, or debugging TradingView Pine Script indicators, strategies, or libraries, especially CE10117, compiled-token limits, 64 plot-count limits, plotshape or alertcondition budgets, and status-line or price-scale outputs.
argument-hint: "[만들거나 고칠 파인 파일]"
---

# Developing TradingView Pine Scripts

Pine의 화면 요구사항, 매매 판정, 컴파일 자원 예산을 따로 관리한다. 로컬 정적 검사는 추정치이며 TradingView 서버 컴파일만이 토큰 수와 실제 플롯 수의 최종 판정이다.

## 먼저 읽을 자료

- 모든 Pine 변경 전: [references/limits.md](references/limits.md)
- CE10117 또는 큰 스크립트 최적화: [references/compiled-token-playbook.md](references/compiled-token-playbook.md)와 [references/field-notes.md](references/field-notes.md)
- 말풍선·아이콘·라벨 겹침이 핵심이면, 설치된 경우 `designing-pine-signal-layouts`로 다음 단계를 인계한다.

## 작업 계약

1. 대상 파일, Pine 버전, `indicator()`/`strategy()` 선언, 기존 오류 전문, 저장소 상태를 확인한다.
2. 변경 전 플롯 예산을 기록한다. 가능하면 다음 감사를 실행하고 `minimum`과 `maximum`을 모두 보고한다.

   ```bash
   node scripts/audit-pine-limits.mjs path/to/script.pine
   ```

3. 매매 조건·알림·출력 역할의 보존 기준을 먼저 만든다. 토큰 절감과 기능 삭제를 혼동하지 않는다.
4. 한 번에 한 구조만 바꾼다. 저장소가 번호형 불변 파일을 사용하면 기존 파일을 덮어쓰지 말고 다음 버전을 만든다. 단, 방금 작업한 버전의 동작 오류 수정이나 디버깅 단계에서는 매번 새 버전 파일을 만들지 않고 해당 파일에서 바로 수정(in-place)한다.
5. 로컬 검사 후 TradingView에서 저장 또는 차트 추가로 서버 컴파일한다. 성공한 스크립트의 IL 토큰 수는 직접 조회할 수 없다.
6. 실제 오류 수치와 변경 결과가 확인된 경우에만 `references/field-notes.md`에 기록한다. 추정과 미검증 결과는 명시한다.
7. **툴팁 및 UI 텍스트 단어 끊김 방지**: `input.*()`의 `tooltip`, `title`, 그룹명, 라벨 텍스트를 작성할 때는 **단어 중간에 줄바꿈 되지 않게 명료하게 작성하는 것을 원칙**으로 한다. 글자 분절을 방지하기 위해 어절 단위로 자연스럽게 정돈하고, 필요 시 명시적 줄바꿈(`\n`)을 적절히 배치한다.

## 완료 보고

다음을 분리한다: 플롯 하한/상한, 64개 대비 여유, 로컬 회귀 검사, TradingView 서버 컴파일, 실제 차트 확인, 커밋·배포 여부. 서버 컴파일을 실행하지 못했다면 “로컬 검증 완료, 서버 검증 대기”로 보고한다.

## 정적 감사의 한계

`audit-pine-limits.mjs`는 색상 식의 타입 한정자까지 컴파일할 수 없으므로 보수적 범위를 계산한다. `tokenProxy`는 버전 간 소스 구조 비교용일 뿐 TradingView IL 토큰 수가 아니다. 이 수치만으로 CE10117 해결을 주장하지 않는다.
