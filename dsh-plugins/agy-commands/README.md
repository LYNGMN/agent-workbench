# agy-commands

안티그래비티(Google Antigravity)의 슬래시 명령을 DeepSeek Harness Web GUI에서 `agy` 접두사로 쓰기 위한 로컬 플러그인입니다.

## 명령

| 명령 | 동작 |
|---|---|
| `/agy` | 라우터 + 도움말. `/agy plan ...`처럼 하위 명령을 받습니다. |
| `/agy-plan [off\|message]` | 계획 모드 전환. 세션의 `/plan` 핸들러에 그대로 위임합니다. |
| `/agy-goal [...]` | 장기 목표 생성·편집·일시정지·재개·삭제. 세션의 `/goal`에 위임합니다. |
| `/agy-grill-me [task]` | 시작 전 요구사항 인터뷰. `ask_user_question`으로 한 번에 질문 하나, 추천안 우선. |
| `/agy-boost <task>` | `subagent`/`workflow`로 2~4개 트랙을 병렬 실행하고 교차 검증합니다. |
| `/agy-teamwork <task>` | 범위 인터뷰 → 마일스톤 계획 → 워커 실행 → 검증·감사까지 진행합니다. |

`/agy-plan`과 `/agy-goal`은 새로운 상태를 만들지 않고, 현재 세션의 에이전트 스코프에 마운트된 `/plan`·`/goal` 정의를 찾아 그 핸들러를 호출합니다. 따라서 계획 모드 대기, goal 라운드 드라이버, 오류 문구가 기본 명령과 동일합니다.

나머지 세 명령은 지시문을 담은 사용자 메시지 하나를 `agent.steer()`로 넣고 턴을 시작합니다. 모델은 해당 세션 프리셋이 제공하는 도구(`ask_user_question`, `subagent`, `workflow` 등)를 사용합니다.

## 추천 시퀀스

DSH는 **한 줄에 명령 하나만** 실행합니다. 안티그래비티처럼 `/teamwork /goal /plan`을 한 줄에 겹쳐 쓰는 방식은 여기서 동작하지 않습니다. 대신 순서로 조합하세요.

| 상황 | 순서 | 이유 |
|---|---|---|
| 요구가 애매함 | `/agy-grill-me` → 다음 턴에 `/agy-plan` | 인터뷰로 결정을 고정한 뒤 계획서를 받습니다. 한 줄에 겹치면 두 번째 명령이 인터뷰 지시문의 일부가 됩니다. |
| 큰 변경을 끝까지 | `/agy-plan` → 계획 승인 → `/agy-goal <승인된 목표>` | 계획 검토를 먼저 통과시킨 뒤 goal로 자동 계속 실행을 겁니다. 승인 전에 goal을 걸면 계획 검토 중에 라운드가 돌 수 있습니다. |
| 며칠짜리 이전·연구 | `/agy-teamwork <작업>` 단독 | Phase 1 범위 인터뷰와 검증 감사를 이미 내장합니다. `/agy-grill-me`를 더하면 인터뷰가 중복됩니다. |
| 가벼운 심층 작업 | `/agy-boost <작업>` | teamwork보다 짧게 다중 트랙 조사·검증만 수행합니다. |

## 안티그래비티 글과 다른 점

- **겹쳐 쓰기**: DSH 파서는 첫 번째 `/명령`만 실행하고 나머지를 `rawInput`으로 넘깁니다. `/agy-plan /agy-goal ...`의 두 번째 명령은 계획서 본문이 됩니다.
- **`/plan` + `/grill-me`**: Antigravity 공식 문서는 오히려 두 명령을 함께 쓰라고 안내합니다(`/plan /grill-me <task>`). 다만 실제 체감은 버전에 따라 다를 수 있으므로, DSH에서는 인터뷰와 계획을 분리해 확실하게 갑니다.
- **`/boost`**: 단일 에이전트가 아니라 다중 에이전트 추론입니다. Antigravity 문서도 "three-phase multi-agent"로 설명합니다.
- **`/teamwork`**: 자체 범위 인터뷰(Phase 1)를 포함하므로 요구 정렬 명령을 추가로 붙이지 않습니다.

## 설치

가장 쉬운 방법은 저장소 맨 위에서 `./install.sh --apply --with dsh-plugins`입니다. 손으로 넣을 때는 아래를 따릅니다.

### Plugins 페이지 (권장)

1. DSH Web GUI → **Plugins** → **Add plugin**.
2. 아래 절대 경로를 입력:
   ```
   <agent-workbench 폴더>/dsh-plugins/agy-commands
   ```
3. **Install** → **Enable now**.
4. 재시작 안내가 뜨면 DSH를 재시작합니다.

### 수동 설치

```bash
WORKBENCH=~/agent-workbench   # 이 저장소를 받은 폴더
NODE=$HOME/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node
PNPM=$HOME/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/pnpm/bin/pnpm.mjs

$NODE $PNPM add "link:$WORKBENCH/dsh-plugins/agy-commands" \
  --dir $HOME/.dsh/profiles/desktop
```

그다음 `~/.dsh/profiles/desktop/package.json`의 `dsh.profile.bundles` 배열에 `"@local/agy-commands"`를 추가하고 DSH를 재시작합니다.

## 롤백

- Plugins 페이지에서 `agy-commands` 번들을 비활성화하거나 제거합니다.
- 수동 설치였다면 `dsh.profile.bundles`와 `dependencies`에서 `@local/agy-commands`를 지운 뒤 프로필에서 `pnpm install`을 실행합니다.

## 제약

- 슬래시 명령은 **Web GUI(호스트 명령 어댑터)** 표면입니다. 헤드리스/CLI에는 노출되지 않습니다.
- `/agy-plan`·`/agy-goal`은 해당 프리셋에 `/plan`·`/goal`이 있어야 동작합니다. 기본 `standard` 프리셋에는 있습니다.
- `boost`/`teamwork`는 실제 서브에이전트와 모델 턴을 소모합니다. 작은 작업에 남용하지 마세요.
- 플러그인은 호스트 프로세스에서 실행됩니다. 코드는 네트워크·파일 접근 없이 명령 등록과 메시지 주입만 합니다.

## 파일

- `index.js` — 명령 등록, 위임, 라우터, steer
- `prompts.js` — grill-me / boost / teamwork 지시문과 도움말
- `cordis.patch.yml` — 프로필 로더에 행을 추가하는 번들 패치
- `package.json` — `dsh.bundle.patch` 선언
