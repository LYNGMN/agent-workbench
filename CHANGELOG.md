# 변경 기록

## 0.2.0 — 2026-11-07

이미 설치한 사용자도 외부 원본을 새 고정 커밋으로 옮길 수 있습니다. 0.1.0에서는 고정 커밋을 올려도 받아 둔 원본이 바뀌지 않아, 폴더를 지우고 다시 설치해야 했습니다.

- `./install.sh --apply --update-sources`: 받아 둔 원본이 고정 커밋과 다르고 고친 파일이 없으면 그 커밋으로 옮긴다. `--apply`가 없으면 보여 주기만 하고, 옵션이 없으면 지금처럼 그대로 둔다.
- 전에 `--with`로 고른 묶음의 원본도 함께 옮긴다.
- 고친 파일이 있는 원본은 건너뛰고 이유를 알린다(이때 종료 코드 1). `.DS_Store`만 있으면 고친 것으로 치지 않는다.
- gstack을 옮기면 의존성 설치·스킬 문서·브라우저 빌드를 다시 한다. 실패해도 나머지는 계속한다.
- 옮긴 원본에서 사라진 스킬의 연결을 지운다.
- `./doctor.sh`의 "시험한 커밋과 다름"과 README "업데이트"가 새 옵션을 안내한다.
- 임시 HOME 설치 시험에 원본 옮기기 단계(9단계)를 더했다.
- 스킬 입력 힌트: 외부 스킬 163개의 한국어 힌트 목록(`config/skill-hints.json`)과 넣는 도구 `skill-hints-sync`를 더했다. 설치가 원본에 넣고(목록이 이미 있으면 그대로 씀), 원본을 옮길 때는 뺐다가 다시 넣고, 제거할 때는 빼서 받은 그대로 돌려놓는다. `doctor`가 힌트 상태도 본다.

## 0.1.0 — 2026-11-04

처음 판입니다.

- 설치·점검·제거(`install.sh`, `doctor.sh`, `uninstall.sh`). 미리보기가 기본이고 `--apply`로 적용, `--with extra,catalog,dsh-plugins,templates|all`로 더 넣기.
- 동기화 도구 5개: `pack-prefix-sync`, `antigravity-sync-skills`, `dsh-sync-skills`, `gstack-sync-links`, `skill-inventory`. 묶음 스킬을 모든 도구에서 `<팩>-<이름>`으로 맞춘다.
- 직접 만든 스킬 18개와 DeepSeek Harness 플러그인 3개(`skill-hints`, `agy-commands`, `brave-search`).
- 전역 지침 틀(`templates/global-AGENTS.md`, `templates/global-CLAUDE.md`).
- 외부 원본 18개를 시험한 커밋으로 고정([manifest/sources.json](manifest/sources.json)).
- 임시 HOME 설치 시험(`test/install-test.sh`).
