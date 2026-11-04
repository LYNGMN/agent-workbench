/**
 * Directive texts for the /agy prompt commands.
 *
 * These strings become one ordinary user message through agent.steer(), so the
 * model reads them as the human's instruction. Keep them short, concrete, and
 * explicit about which tools to use and what evidence counts as done.
 */

export const HELP = [
  '/agy — Antigravity-style commands',
  '',
  '  /agy plan [off|message]     계획 모드 전환 (/plan과 동일)',
  '  /agy goal [objective|pause|resume|clear|edit <objective>]',
  '                              장기 목표 생성·관리 (/goal과 동일)',
  '  /agy grill-me [task]        시작 전 요구사항 인터뷰 (한 번에 질문 하나)',
  '  /agy boost <task>           어려운 문제를 다중 에이전트로 심층 추론',
  '  /agy teamwork <task>        며칠짜리 다중 에이전트 프로젝트',
  '',
  '직접 명령: /agy-plan, /agy-goal, /agy-grill-me, /agy-boost, /agy-teamwork',
  '',
  '추천 시퀀스 (DSH는 한 줄에 명령 하나만 실행합니다)',
  '  - 요구가 애매함: /agy-grill-me → 다음 턴에 /agy-plan',
  '  - 큰 변경: /agy-plan → 승인 → /agy-goal <승인된 목표>',
  '  - 며칠짜리 이전/연구: /agy-teamwork 단독 (자체 범위 인터뷰 포함 — /agy-grill-me 추가 금지)',
  '  - 가벼운 심층 작업: /agy-boost',
  '',
  '주의: /agy-plan /agy-goal ...처럼 겹쳐 쓰면 두 번째 명령은 계획서 본문으로 들어갑니다.',
  '',
  '참고: /agy-plan과 /agy-goal은 이 세션의 기본 /plan, /goal에 그대로 위임합니다.',
].join('\n')

const NOTHING = '(지정 없음 — 무엇을 할지 먼저 물어보세요)'

export function grillMe(task) {
  const target = task.trim() === '' ? NOTHING : task.trim()
  return [
    '[agy-grill-me] 구현 전에 요구사항 인터뷰를 진행하세요.',
    '',
    `작업: ${target}`,
    '',
    '규칙:',
    '1. 먼저 워크스페이스를 읽어, 코드나 문서로 답할 수 있는 것은 사용자에게 묻지 말고 직접 확인하세요.',
    '2. ask_user_question을 사용해 한 번에 질문 하나만 하세요. 선택지는 2~4개, 추천안을 맨 앞에 "(Recommended)"로 표시하세요.',
    '3. 답이 다음 질문을 결정하도록 의존성 순서로 진행하고, 이미 정해진 것은 다시 묻지 마세요.',
    '4. 열린 질문이 없거나 사용자가 "충분/그만"이라고 하면 인터뷰를 끝내고, 결정사항을 5줄 이내로 요약하세요.',
    '5. 인터뷰가 끝나기 전에는 파일을 수정하지 마세요. 큰 작업이면 요약 후 /agy-plan을 제안하세요.',
  ].join('\n')
}

export function boost(task) {
  const target = task.trim()
  return [
    '[agy-boost] 심층 다중 에이전트 추론으로 진행하세요.',
    '',
    `작업: ${target}`,
    '',
    '규칙:',
    '1. 목표와 성공 기준을 3줄로 고정하고, 검증에 쓸 실제 명령(테스트/빌드/벤치)을 적으세요.',
    '2. subagent 또는 workflow로 2~4개의 독립 트랙을 병렬 실행하세요. 각 트랙은 가설 하나씩 맡고, 조사 트랙은 파일을 수정하지 않습니다. 단순한 작업이라 트랙 하나로 충분하면 그 이유를 밝히고 진행하세요.',
    '3. 결과를 종합해 최소 수정안을 구현하고, 반대 가설을 하나 이상 검증하세요.',
    '4. 검증 명령을 직접 실행해 출력을 확인하세요. 출력 없이 "완료"라고 말하지 마세요.',
    '5. 보고: 근본 원인, 변경 파일, 실행한 검증과 결과, 남은 위험.',
  ].join('\n')
}

export function teamwork(task) {
  const target = task.trim()
  return [
    '[agy-teamwork] 장기 다중 에이전트 프로젝트로 진행하세요.',
    '',
    `작업: ${target}`,
    '',
    '1단계 — 범위 인터뷰: ask_user_question으로 범위/비범위, 완료 증거(테스트·벤치·데모), 작업 폴더, 금지할 지름길(개발/데모/벤치마크 모드)을 확인하세요. 답은 <workspace>/teamwork_projects/<slug>/BRIEF.md에 저장하세요.',
    '2단계 — 계획: 마일스톤 3~6개와 각 마일스톤의 검증 게이트를 PLAN.md에 쓰고, 사용자 승인 후 실행하세요.',
    '3단계 — 실행: workflow로 마일스톤별 워커를 실행하고, 같은 파일을 두 워커가 동시에 수정하지 않게 소유권을 나누세요. 진행은 PROGRESS.md에 기록하세요.',
    '4단계 — 검증: 마일스톤마다 별도 검증자(비평·공격 테스트·감사)를 두고, 실제 명령 출력으로 통과를 확인하세요.',
    '5단계 — 최종 감사: BRIEF.md의 인수 기준을 하나씩 증거에 매핑하고, 전부 통과할 때만 완료를 보고하세요.',
    '기본 작업 폴더는 워크스페이스 안으로 합니다. ~/teamwork_projects 같은 외부 경로는 승인된 경우에만 쓰세요.',
  ].join('\n')
}
