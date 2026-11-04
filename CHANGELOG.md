# 변경 기록

## 0.1.0 — 2026-11-04

처음 판입니다.

- 설치·점검·제거(`install.sh`, `doctor.sh`, `uninstall.sh`). 미리보기가 기본이고 `--apply`로 적용, `--with extra,catalog,dsh-plugins,templates|all`로 더 넣기.
- 동기화 도구 5개: `pack-prefix-sync`, `antigravity-sync-skills`, `dsh-sync-skills`, `gstack-sync-links`, `skill-inventory`. 묶음 스킬을 모든 도구에서 `<팩>-<이름>`으로 맞춘다.
- 직접 만든 스킬 18개와 DeepSeek Harness 플러그인 3개(`skill-hints`, `agy-commands`, `brave-search`).
- 전역 지침 틀(`templates/global-AGENTS.md`, `templates/global-CLAUDE.md`).
- 외부 원본 18개를 시험한 커밋으로 고정([manifest/sources.json](manifest/sources.json)).
- 임시 HOME 설치 시험(`test/install-test.sh`).
