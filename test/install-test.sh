#!/usr/bin/env bash
# install-test.sh — 빈 임시 HOME에 설치·재실행·점검·제거를 해 보고 결과를 대조한다.
#
# 실제 HOME은 건드리지 않는다. 외부 원본은 WORKBENCH_TEST_MIRROR(기본 실제 ~/.agents/sources)에 있으면
# 거기서 받고(빠름), 없으면 GitHub에서 받는다. gstack 브라우저 빌드는 오래 걸려서 건너뛴다.
#
# 사용법: test/install-test.sh [--keep]   (--keep이면 임시 폴더를 남겨 둔다)
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
REAL_HOME="$HOME"
KEEP=0; [ "${1:-}" = "--keep" ] && KEEP=1
T="$(mktemp -d "${TMPDIR:-/tmp}/workbench-test.XXXXXX")"
H="$T/home"
FAIL=0
pass() { echo "  ✓ $1"; }
fail() { echo "  ✗ $1"; FAIL=$((FAIL + 1)); }
check() { if eval "$2"; then pass "$1"; else fail "$1"; fi; }

# 시험용 원본 거울: owner/repo -> 실제 위치
M="$T/mirror"
mkdir -p "$M"
SRC="${WORKBENCH_TEST_MIRROR:-$REAL_HOME/.agents/sources}"
for d in "$SRC"/*/*; do
  [ -d "$d" ] || continue
  owner="$(basename "$(dirname "$d")")"; mkdir -p "$M/$owner"
  ln -s "$(cd "$d" && pwd -P)" "$M/$owner/$(basename "$d")"
done
if [ -d "$REAL_HOME/Dev/pstack/.git" ] && [ ! -e "$M/backnotprop/pstack" ]; then
  mkdir -p "$M/backnotprop"; ln -s "$REAL_HOME/Dev/pstack" "$M/backnotprop/pstack"
fi

# 빈 HOME에 도구 네 개가 설치된 것처럼 꾸민다. 사용자가 원래 둔 것(지켜야 할 것)도 넣는다.
mkdir -p "$H/.claude/skills/my-own-skill" "$H/.codex" "$H/.gemini/config/skills" "$H/.dsh/skills" "$H/.dsh/profiles/desktop"
printf -- '---\nname: my-own-skill\ndescription: 사용자가 직접 둔 스킬\n---\n' > "$H/.claude/skills/my-own-skill/SKILL.md"
printf '{\n  "skillOverrides": {\n    "brainstorming": "user-invocable-only"\n  }\n}\n' > "$H/.claude/settings.json"
printf 'model = "test"\n' > "$H/.codex/config.toml"
ln -s /tmp "$H/.gemini/config/skills/my-link"
ln -s /tmp "$H/.dsh/skills/my-link"
printf '{\n  "name": "desktop",\n  "private": true,\n  "dependencies": {},\n  "dsh": {"profile": {"bundles": []}}\n}\n' > "$H/.dsh/profiles/desktop/package.json"
if [ -d "$REAL_HOME/.dsh/dsh-runtimes" ]; then ln -s "$REAL_HOME/.dsh/dsh-runtimes" "$H/.dsh/dsh-runtimes"; fi
cp "$H/.claude/settings.json" "$T/settings.before"; cp "$H/.codex/config.toml" "$T/config.before"
cp "$H/.dsh/profiles/desktop/package.json" "$T/dsh-package.before"

# 도구 캐시(bun·pnpm 등)와, 가짜 DSH 프로필에 pnpm이 처음 만드는 node_modules·잠금 파일은 비교에서 뺀다
# (실제 DSH 프로필에는 원래 있음. package.json 내용은 아래에서 따로 대조).
snapshot() { (cd "$H" && find . \( -path ./.bun -o -path ./.cache -o -path ./Library -o -path ./.gstack -o -path ./.npm -o -path ./.local \
  -o -path ./.dsh/profiles/desktop/node_modules -o -path ./.dsh/profiles/desktop/pnpm-lock.yaml \) -prune -o -print | LC_ALL=C sort); }
snapshot > "$T/tree.before"

export HOME="$H" WORKBENCH_MIRROR="$M" PATH="$H/.agents/bin:$PATH"
cd "$REPO"

echo "1) 미리보기는 아무것도 바꾸지 않는다"
./install.sh --with all > "$T/preview.log" 2>&1; echo "  (종료 코드 $?)"
snapshot > "$T/tree.preview"
check "미리보기 뒤 HOME 그대로" "cmp -s '$T/tree.before' '$T/tree.preview'"

echo "2) 설치(--apply --with all --no-gstack-build)"
./install.sh --apply --with all --no-gstack-build > "$T/install.log" 2>&1; rc=$?
tail -3 "$T/install.log" | sed 's/^/    /'
check "설치 종료 코드 0" "[ $rc -eq 0 ]"
grep '^  !' "$T/install.log" | sed 's/^/    /'

echo "3) 결과 대조"
check "Claude: 사람용 /gstack-browse 감싸개" "grep -q 'disable-model-invocation: true' '$H/.claude/skills/gstack-browse/SKILL.md'"
check "Claude: 모델용 browse 감싸개" "grep -q 'user-invocable: false' '$H/.claude/skills/browse/SKILL.md'"
check "Claude: /superpowers-brainstorming" "[ -f '$H/.claude/skills/superpowers-brainstorming/SKILL.md' ]"
check "Claude: 미리 정한 brainstorming 설정 → off(사람은 말머리 이름)" "python3 -c \"import json,sys;sys.exit(0 if json.load(open('$H/.claude/settings.json'))['skillOverrides']['brainstorming']=='off' else 1)\""
check "Claude: using-superpowers 기본 off" "python3 -c \"import json,sys;sys.exit(0 if json.load(open('$H/.claude/settings.json'))['skillOverrides'].get('using-superpowers')=='off' else 1)\""
check "Claude: 내 스킬 ui-visual-qa 연결" "[ -f '$H/.claude/skills/ui-visual-qa/SKILL.md' ]"
check "Claude: 감싸개 taste 스킬 연결" "[ -f '$H/.claude/skills/design-taste-frontend/SKILL.md' ]"
check "Codex: /gstack-browse 감싸개" "[ -f '$H/.codex/skills/gstack-browse/SKILL.md' ]"
check "Codex: /superpowers-brainstorming 감싸개" "[ -f '$H/.codex/skills/superpowers-brainstorming/SKILL.md' ]"
check "Codex: 원래 이름 끄는 자동 블록" "grep -q 'pack-prefix-sync: 끝' '$H/.codex/config.toml'"
check "gstack 실행 파일 자리(~/.codex/skills/gstack/bin)" "[ -d '$H/.codex/skills/gstack/bin' ]"
check "Antigravity: superpowers-brainstorming" "[ -e '$H/.gemini/config/skills/superpowers-brainstorming/SKILL.md' ]"
check "DeepSeek Harness: gstack-browse.md" "[ -f '$H/.dsh/skills/gstack-browse.md' ]"
check "DeepSeek Harness: pstack 스킬" "ls '$H/.dsh/skills' | grep -q '^pstack-'"
check "도구 링크 ~/.agents/bin/pack-prefix-sync" "[ -x '$H/.agents/bin/pack-prefix-sync' ]"
if [ -d "$H/.dsh/dsh-runtimes" ]; then
  check "DeepSeek Harness 플러그인 3개 bundles" "python3 -c \"import json,sys;b=json.load(open('$H/.dsh/profiles/desktop/package.json'))['dsh']['profile']['bundles'];sys.exit(0 if len([x for x in b if x.startswith('@local/')])==3 else 1)\""
fi

echo "4) 다시 돌리면 바꿀 것이 없다"
for tool in "gstack-sync-links --check" pack-prefix-sync antigravity-sync-skills dsh-sync-skills; do
  out="$($H/.agents/bin/$tool 2>&1)"; rc=$?
  check "$tool: 종료 코드 0, $(echo "$out" | tail -1)" "[ $rc -eq 0 ]"
done
again="$(./install.sh --apply --with all --no-gstack-build 2>&1)"
check "설치를 한 번 더 적용해도 바꾼 것 0건" "echo \"\$again\" | grep -q '바꾼 것 0건'"

echo "5) 점검(doctor)"
./doctor.sh > "$T/doctor.log" 2>&1; rc=$?
grep '^✗' "$T/doctor.log" | sed 's/^/    /'
check "doctor: 브라우저 빌드 말고는 문제 없음" "[ \$(grep '^✗' '$T/doctor.log' | grep -v 'gstack 브라우저 실행 파일' | wc -l) -eq 0 ]"

echo "6) 사용자가 둔 것은 그대로"
check "my-own-skill" "[ -f '$H/.claude/skills/my-own-skill/SKILL.md' ]"
check "Antigravity my-link" "[ -L '$H/.gemini/config/skills/my-link' ]"
check "DSH my-link" "[ -L '$H/.dsh/skills/my-link' ]"

echo "7) 제거(--apply --purge-sources) 뒤 설치 전과 같다"
./uninstall.sh --apply --purge-sources > "$T/uninstall.log" 2>&1; rc=$?
check "제거 종료 코드 0" "[ $rc -eq 0 ]"
snapshot > "$T/tree.after"
if cmp -s "$T/tree.before" "$T/tree.after"; then pass "파일 목록이 설치 전과 같음"; else fail "파일 목록이 다름:"; diff "$T/tree.before" "$T/tree.after" | head -20 | sed 's/^/    /'; fi
check "Claude 설정이 설치 전과 같음" "python3 -c \"import json,sys;sys.exit(0 if json.load(open('$H/.claude/settings.json'))==json.load(open('$T/settings.before')) else 1)\""
check "Codex 설정이 설치 전과 같음" "cmp -s '$H/.codex/config.toml' '$T/config.before'"
check "DSH 프로필 bundles가 설치 전과 같음" "python3 -c \"import json,sys;a=json.load(open('$H/.dsh/profiles/desktop/package.json'));b=json.load(open('$T/dsh-package.before'));sys.exit(0 if a['dsh']==b['dsh'] and a.get('dependencies',{})==b.get('dependencies',{}) else 1)\""

echo "8) Claude만 있는 맥에 기본 설치(다른 도구 자리는 만들지 않는다)"
H="$T/home2"; mkdir -p "$H/.claude"; export HOME="$H" PATH="$H/.agents/bin:$PATH"
snapshot > "$T/tree2.before"
./install.sh --apply --no-gstack-build > "$T/install2.log" 2>&1; rc=$?
check "설치 종료 코드 0" "[ $rc -eq 0 ]"
check "Claude: /gstack-browse" "[ -f '$H/.claude/skills/gstack-browse/SKILL.md' ]"
check "Claude 설정 파일을 새로 만듦" "[ -f '$H/.claude/settings.json' ]"
check "Codex 설정은 만들지 않음(gstack 실행 파일 자리만)" "[ ! -e '$H/.codex/config.toml' ] && [ \"\$(ls '$H/.codex')\" = skills ]"
check "Antigravity·DSH 자리는 만들지 않음" "[ ! -e '$H/.gemini' ] && [ ! -e '$H/.dsh' ]"
check "기본 설치에는 extra 원본 없음(cloudflare)" "[ ! -e '$H/.agents/sources/cloudflare' ]"
check "점검: 브라우저 빌드 말고는 문제 없음" "./doctor.sh > '$T/doctor2.log' 2>&1; [ \$(grep '^✗' '$T/doctor2.log' | grep -v 'gstack 브라우저 실행 파일' | wc -l) -eq 0 ]"
./uninstall.sh --apply --purge-sources > "$T/uninstall2.log" 2>&1
snapshot > "$T/tree2.after"
if cmp -s "$T/tree2.before" "$T/tree2.after"; then
  pass "제거 뒤 설치 전과 같음(새로 만든 settings.json도 지움)"
else
  fail "제거 뒤 다름:"; diff "$T/tree2.before" "$T/tree2.after" | head -20 | sed 's/^/    /'
fi

echo
if [ "$FAIL" -eq 0 ]; then echo "모두 통과"; else echo "실패 ${FAIL}건 (기록: $T)"; KEEP=1; fi
[ "$KEEP" -eq 1 ] && echo "임시 폴더: $T" || rm -rf "$T"
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
