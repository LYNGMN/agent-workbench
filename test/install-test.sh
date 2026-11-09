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
check "스킬 입력 힌트 목록 ~/.agents/skill-hints.json" "cmp -s '$H/.agents/skill-hints.json' '$REPO/config/skill-hints.json'"
check "힌트: 외부 원본 superpowers의 SKILL.md에 argument-hint" "grep -q '^argument-hint: \"\[만들 기능' '$H/.agents/sources/obra/superpowers/skills/brainstorming/SKILL.md'"
check "힌트: Claude 감싸개 /superpowers-brainstorming에도 복사됨" "grep -q '^argument-hint:' '$H/.claude/skills/superpowers-brainstorming/SKILL.md'"
check "힌트: 직접 만든 스킬(이 저장소)은 고치지 않음" "[ -z \"\$(git -C '$REPO' status --porcelain -- skills)\" ]"
if [ -d "$H/.dsh/dsh-runtimes" ]; then
  check "DeepSeek Harness 플러그인 3개 bundles" "python3 -c \"import json,sys;b=json.load(open('$H/.dsh/profiles/desktop/package.json'))['dsh']['profile']['bundles'];sys.exit(0 if len([x for x in b if x.startswith('@local/')])==3 else 1)\""
fi

echo "4) 다시 돌리면 바꿀 것이 없다"
for tool in "gstack-sync-links --check" "skill-hints-sync --check" pack-prefix-sync antigravity-sync-skills dsh-sync-skills; do
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
check "제거가 힌트를 먼저 빼서 받은 원본이 원래대로(고친 원본으로 남지 않음)" "grep -q '스킬 입력 힌트를 원본에서 빼기' '$T/uninstall.log' && ! grep -q '고친 파일이 있음' '$T/uninstall.log'"
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

echo "9) 받아 둔 원본을 고정 커밋으로 옮긴다(--update-sources)"
H="$T/home3"; mkdir -p "$H/.claude"; export HOME="$H" PATH="$H/.agents/bin:$PATH"
snapshot > "$T/tree3.before"
./install.sh --apply --with extra --no-gstack-build > "$T/install3.log" 2>&1; rc=$?
check "설치 종료 코드 0" "[ $rc -eq 0 ]"
S="$H/.agents/sources"
SP="$S/obra/superpowers"; GS="$S/garrytan/gstack"; KP="$S/multica-ai/andrej-karpathy-skills"; OW="$S/agamm/claude-code-owasp"; TS="$S/Leonxlnx/taste-skill"
pin() { python3 -c "import json,sys;print(next(s['commit'] for s in json.load(open('manifest/sources.json'))['sources'] if s['id']==sys.argv[1]))" "$1"; }
at() { [ "$(git -C "$1" rev-parse HEAD)" = "$2" ]; }
tgit() { git -c user.name=workbench-test -c user.email=test@example.invalid "$@"; }
head_of() { git -C "$1" rev-parse HEAD; }
# 고정 커밋이 올라간 때를 흉내 낸다. 받아 둔 원본은 옛 커밋에 있고 고정 커밋만 다르다.
#   superpowers: 옛 커밋에만 있는 스킬이 있다(옮기면 사라짐)
#   gstack: 문서를 다시 만들어야 한다
#   owasp(extra 묶음): 고정 커밋이 저장소에 아예 없어서 받아 와야 한다
#   taste-skill: .DS_Store만 있다(고친 것이 아님)
#   karpathy: 파일을 고쳤다(건너뛰어야 함)
mkdir -p "$SP/skills/workbench-test-gone"
printf -- '---\nname: workbench-test-gone\ndescription: 원본에서 사라질 스킬\n---\n' > "$SP/skills/workbench-test-gone/SKILL.md"
tgit -C "$SP" add skills/workbench-test-gone; tgit -C "$SP" commit -qm old
tgit -C "$GS" commit -q --allow-empty -m old
tgit -C "$OW" checkout -q "$(tgit -C "$OW" commit-tree -m old 'HEAD^{tree}')"
git -C "$OW" reflog expire --expire=now --all; rm -f "$OW/.git/FETCH_HEAD"; git -C "$OW" gc -q --prune=now
tgit -C "$TS" commit -q --allow-empty -m old; touch "$TS/.DS_Store"
tgit -C "$KP" commit -q --allow-empty -m old
KP_FILE="$(git -C "$KP" ls-files | head -1)"; echo 'workbench-test 고침' >> "$KP/$KP_FILE"
SP_OLD="$(head_of "$SP")"; KP_OLD="$(head_of "$KP")"
check "(준비) 힌트가 들어간 원본" "grep -q '^argument-hint:' '$SP/skills/brainstorming/SKILL.md'"
check "(준비) owasp 고정 커밋이 저장소에 없음" "! git -C '$OW' cat-file -e '$(pin owasp)^{commit}' 2>/dev/null"

./install.sh --apply --with extra --no-gstack-build > "$T/noupdate.log" 2>&1
check "옵션이 없으면 원본을 그대로 둠" "at '$SP' '$SP_OLD' && grep -q '그대로 둠 obra/superpowers.*--update-sources' '$T/noupdate.log'"
check "(준비) 사라질 스킬이 이어져 있음" "[ -L '$H/.agents/skills/superpowers/workbench-test-gone' ] && [ -f '$H/.claude/skills/superpowers-workbench-test-gone/SKILL.md' ]"
./doctor.sh > "$T/doctor3-before.log" 2>&1
check "doctor: 옮기는 명령을 안내" "grep -q 'obra/superpowers.*시험한 커밋.*install.sh --apply --update-sources' '$T/doctor3-before.log'"
rm -rf "$GS/.agents/skills/gstack-browse"

snapshot > "$T/tree3.a"
./install.sh --update-sources > "$T/preview3.log" 2>&1
snapshot > "$T/tree3.b"
check "미리보기는 파일을 바꾸지 않음" "cmp -s '$T/tree3.a' '$T/tree3.b'"
check "미리보기는 원본을 옮기지 않음" "at '$SP' '$SP_OLD'"
check "미리보기: 옮길 원본과 고친 원본을 보여 줌" "grep -q '옮기기 obra/superpowers' '$T/preview3.log' && grep -q '건너뜀 multica-ai/andrej-karpathy-skills' '$T/preview3.log'"
check "미리보기: 적용 명령에 옵션을 붙여 안내" "grep -q 'install.sh --apply --update-sources' '$T/preview3.log'"

# 빌드는 몇 분 걸리므로 가짜 bun으로 "다시 빌드하고, 실패해도 계속"만 본다. 다른 명령은 진짜 bun이 한다.
mkdir -p "$T/fakebin"
cat > "$T/fakebin/bun" <<EOF
#!/bin/sh
if [ "\$1 \$2" = "run build" ]; then echo called >> "$T/bun-build.log"; echo fake build failure; exit 1; fi
exec "$(command -v bun)" "\$@"
EOF
chmod +x "$T/fakebin/bun"
PATH="$T/fakebin:$PATH" ./install.sh --apply --update-sources > "$T/update3.log" 2>&1; rc=$?
check "고친 원본이 남아 종료 코드 1" "[ $rc -eq 1 ]"
check "힌트를 빼고 옮긴 뒤 다시 넣음" "grep -q '스킬 입력 힌트 잠시 빼기' '$T/update3.log' && grep -q '^argument-hint:' '$SP/skills/brainstorming/SKILL.md'"
check "superpowers가 고정 커밋으로 돌아옴" "at '$SP' '$(pin superpowers)'"
check "gstack이 고정 커밋으로 돌아옴" "at '$GS' '$(pin gstack)'"
check "--with 없이도 고른 묶음을 옮기고, 없던 커밋을 받아 옴(owasp)" "at '$OW' '$(pin owasp)'"
check "받을 때 전체 기록을 가진 원본을 얕게 바꾸지 않음(owasp)" "[ \"\$(git -C '$OW' rev-parse --is-shallow-repository)\" = false ]"
check ".DS_Store만 있으면 옮김(taste-skill)" "at '$TS' '$(pin taste-skill)'"
check "고친 원본은 옮기지 않음(karpathy)" "at '$KP' '$KP_OLD' && grep -q 'workbench-test 고침' '$KP/$KP_FILE'"
check "고친 원본을 건너뛴 이유를 알림" "grep -q '건너뜀 multica-ai/andrej-karpathy-skills: 받은 뒤 고친 파일 1개' '$T/update3.log'"
check "사라진 스킬의 연결을 지움" "[ ! -L '$H/.agents/skills/superpowers/workbench-test-gone' ] && [ ! -e '$H/.claude/skills/superpowers-workbench-test-gone' ]"
check "gstack 문서를 다시 만듦" "[ -f '$GS/.agents/skills/gstack-browse/SKILL.md' ] && [ -f '$H/.claude/skills/gstack-browse/SKILL.md' ]"
check "gstack 빌드를 다시 하고 실패해도 끝까지 진행" "[ -f '$T/bun-build.log' ] && grep -q '브라우저 실행 파일 만들기.* 실패' '$T/update3.log' && grep -q '^\[9/9\]' '$T/update3.log'"

git -C "$KP" checkout -- "$KP_FILE"
./install.sh --apply --update-sources --no-gstack-build > "$T/update3b.log" 2>&1; rc=$?
check "되돌린 뒤 다시 돌리면 옮기고 종료 코드 0" "[ $rc -eq 0 ] && at '$KP' '$(pin karpathy)'"
check "한 번 더 돌리면 바꾼 것 0건" "./install.sh --apply --update-sources --no-gstack-build 2>&1 | grep -q '바꾼 것 0건'"
./doctor.sh > "$T/doctor3.log" 2>&1
grep '^✗' "$T/doctor3.log" | sed 's/^/    /'
check "doctor: 브라우저 빌드 말고는 문제 없음" "[ \$(grep '^✗' '$T/doctor3.log' | grep -v 'gstack 브라우저 실행 파일' | wc -l) -eq 0 ]"
check "doctor: 다른 커밋 안내가 사라짐" "! grep -q '시험한 커밋' '$T/doctor3.log'"
./uninstall.sh --apply --purge-sources > "$T/uninstall3.log" 2>&1
check "옮긴 뒤 제거해도 힌트를 빼서 원본이 원래대로" "! grep -q '고친 파일이 있음' '$T/uninstall3.log'"
snapshot > "$T/tree3.after"
if cmp -s "$T/tree3.before" "$T/tree3.after"; then
  pass "옮긴 뒤에도 제거하면 설치 전과 같음"
else
  fail "제거 뒤 다름:"; diff "$T/tree3.before" "$T/tree3.after" | head -20 | sed 's/^/    /'
fi

echo
if [ "$FAIL" -eq 0 ]; then echo "모두 통과"; else echo "실패 ${FAIL}건 (기록: $T)"; KEEP=1; fi
[ "$KEEP" -eq 1 ] && echo "임시 폴더: $T" || rm -rf "$T"
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
