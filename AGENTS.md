# agent-workbench 작업 규칙

이 저장소를 고치는 AI 도구(Codex·Claude 등)와 사람이 함께 따르는 규칙입니다. 처음이라면 [README](README.md), [구조](docs/architecture.md), [작업·배포 흐름](docs/workflow.md)을 먼저 읽습니다.

## 1. 지킬 것

- 사용자에게 보이는 글(README·설치기 출력·문서)은 한국어로 씁니다. 코드·명령·식별자는 원래 표기를 유지합니다.
- 외부 스킬은 이 저장소에 복사하지 않습니다. [manifest/sources.json](manifest/sources.json)에 원본과 커밋을 적고 설치기가 받게 합니다. 새 원본을 더할 때는 라이선스를 확인하고 [THIRD_PARTY.md](THIRD_PARTY.md)에 같이 적습니다.
- 개인 정보·비밀값을 넣지 않습니다. 이름이 들어간 절대 경로(`/Users/<이름>/…`), 이메일, API 키, 토큰, 개인 서비스 이름이 들어가면 커밋하지 않습니다. 경로는 `~`나 `$HOME` 기준으로 씁니다.
- 설치기와 동기화 도구는 사용자 파일을 덮어쓰지 않습니다. 자기가 만든 것만 기록(상태 파일)이나 표시(MARK 주석)로 알아보고 고치거나 지웁니다.
- 미리보기(`--apply` 없음)는 아무것도 바꾸지 않아야 합니다.
- 설치는 두 번 돌려도 같은 결과여야 하고, 제거하면 설치 전과 같아야 합니다.
- macOS 기본 `python3`(3.9)로 돌아가야 합니다. 새 파이썬 문법(3.10 이상)과 외부 파이썬 패키지를 쓰지 않습니다.

## 2. 고친 뒤

- 설치기·동기화 도구·설정을 고쳤으면 `test/install-test.sh`를 돌려 "모두 통과"를 확인합니다.
- 책임·경계·상태 파일 모양이 바뀌면 [docs/architecture.md](docs/architecture.md)를 같은 PR에서 고칩니다.
- 사용자가 알아야 할 변경은 [CHANGELOG.md](CHANGELOG.md)에 적습니다.

## 3. Git

- `main`에서 직접 고치지 않습니다. `<도구>/<종류>/<목적>` 브랜치(예: `claude/fix/uninstall-codex-block`)를 만들고 PR로 합칩니다.
- 커밋 하나에는 의도 하나만 담습니다.

## 작업하며 배운 것

이 저장소에만 맞는 교훈입니다.

- 설치기가 `os.makedirs`로 만든 부모 폴더는 기록되지 않아 제거 뒤 빈 `~/.agents`가 남았다. 폴더는 `Plan.mkdir_quiet`로 만들어 없던 부모까지 하나씩 기록한다. — 처음 2026-11-04 — 지키는 방법: `test/install-test.sh` 7·8단계(제거 뒤 설치 전과 같음)
- `~/.codex`가 있는지만으로 Codex 설치를 판단하면, gstack 실행 파일 자리(`~/.codex/skills/gstack`)를 만든 것만으로 Codex가 있다고 잘못 본다. `codex_present()`로 `skills` 말고 다른 것이 있는지 본다. — 처음 2026-11-04 — 지키는 방법: 시험 8단계(Claude만 있는 맥)
- `gstack-sync-links`가 만든 `~/.agents/skills/gstack/gstack-*` 링크는 설치 기록에 없다. 제거기는 설치기가 만든 `gstack` 묶음 폴더에서 gstack 원본을 가리키는 링크만 지운다. — 처음 2026-11-04 — 지키는 방법: 시험 7단계
