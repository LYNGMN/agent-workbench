#!/usr/bin/env python3
"""agent-workbench 설치·점검·제거.

    python3 lib/workbench.py install   [--apply] [--with extra,catalog,dsh-plugins,templates|all] [--no-gstack-build] [--update-sources]
    python3 lib/workbench.py doctor    [--json]
    python3 lib/workbench.py uninstall [--apply] [--purge-sources]

install과 uninstall은 --apply가 없으면 할 일을 보여 주기만 한다.
만든 것은 ~/.agents/.workbench/state.json에 적어 두고, uninstall은 거기 적힌 것과 동기화 도구 표시(MARK)가 있는 것만 지운다.
"""
import hashlib
import json
import os
import platform
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.realpath(__file__)))
import workbench_config as wc  # noqa: E402

HOME = wc.HOME
REPO = wc.REPO
AGENTS = wc.agents_home()
SHELF = wc.shelf()
SOURCES = wc.sources()
BIN = os.path.join(AGENTS, 'bin')
STATE_DIR = os.path.join(AGENTS, '.workbench')
STATE = os.path.join(STATE_DIR, 'state.json')
CLAUDE = os.path.join(HOME, '.claude')
CLAUDE_SKILLS = os.path.join(CLAUDE, 'skills')
CLAUDE_SETTINGS = os.path.join(CLAUDE, 'settings.json')
CODEX = os.path.join(HOME, '.codex')
GEMINI = os.path.join(HOME, '.gemini')
DSH = os.environ.get('DSH_HOME', os.path.join(HOME, '.dsh'))
DSH_PROFILE = os.path.join(DSH, 'profiles', 'desktop')
DSH_RUNTIME = os.path.join(DSH, 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies')
GSTACK = os.path.join(SOURCES, 'garrytan', 'gstack')
GSTACK_RUNTIME = os.path.join(SOURCES, 'garrytan', 'gstack-runtime')
TOOLS = ['skill-hints-sync', 'pack-prefix-sync', 'antigravity-sync-skills', 'dsh-sync-skills', 'gstack-sync-links', 'skill-inventory']
HINTS_FILE = os.path.join(AGENTS, 'skill-hints.json')
HINTS_STATE = wc.hints_state()
HINTS_TOOL = [sys.executable, os.path.join(REPO, 'bin', 'skill-hints-sync')]
DSH_PLUGINS = ['skill-hints', 'agy-commands', 'brave-search']
OPTIONAL = ['extra', 'catalog', 'dsh-plugins', 'templates']
TARGET_DIRS = {
    'claude': CLAUDE_SKILLS,
    'codex': os.path.join(CODEX, 'skills'),
    'antigravity': os.path.join(GEMINI, 'config', 'skills'),
    'dsh': os.path.join(DSH, 'skills'),
}


def say(msg=''):
    print(msg, flush=True)


def load_json(path, default):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.workbench-tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    os.replace(tmp, path)


def manifest():
    return load_json(os.path.join(REPO, 'manifest', 'sources.json'), {})['sources']


def own_skills():
    return load_json(os.path.join(REPO, 'manifest', 'own-skills.json'), {'skills': []})['skills']


def tools_present():
    return {
        'claude': os.path.isdir(CLAUDE),
        'codex': wc.codex_present(),
        'antigravity': os.path.isdir(GEMINI),
        'dsh': os.path.isdir(DSH),
    }


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        h.update(f.read())
    return h.hexdigest()


def git(args, cwd=None, check=True):
    return subprocess.run(['git'] + args, cwd=cwd, check=check, capture_output=True, text=True)


def src_dir(source):
    owner, name = source['repo'].split('/')
    return os.path.join(SOURCES, owner, name)


def selected_sources(groups):
    return [s for s in manifest() if s['group'] == 'core' or s['group'] in groups]


def source_url(source):
    mirror = os.environ.get('WORKBENCH_MIRROR')
    local = os.path.join(mirror, source['repo']) if mirror else None
    return local if local and os.path.isdir(local) else f'https://github.com/{source["repo"]}.git'


def source_changes(dest):
    """받은 뒤 고친 파일 목록. macOS가 저절로 만드는 .DS_Store는 뺀다."""
    out = git(['--no-optional-locks', 'status', '--porcelain'], cwd=dest, check=False).stdout
    return [line for line in out.splitlines() if not line.endswith('.DS_Store')]


def hinted_files():
    """skill-hints-sync가 힌트를 넣은 파일(실제 경로)."""
    return set(load_json(HINTS_STATE, {}))


def not_hints(dest, changes):
    """고친 파일 목록에서 skill-hints-sync가 넣은 힌트만 바뀐 파일을 뺀다(미리보기용: 적용 때는 먼저 힌트를 뺀다)."""
    hinted, real = hinted_files(), os.path.realpath(dest)
    out = []
    for line in changes:
        p = os.path.join(real, line[3:].strip('"').rstrip('/'))
        if p in hinted or any(h.startswith(p + os.sep) for h in hinted):
            continue
        out.append(line)
    return out


def fetch_commit(dest, url, commit):
    """고정 커밋을 받아 둔다. 얕게 받지 못하면 전체를 받는다."""
    if git(['cat-file', '-e', commit + '^{commit}'], cwd=dest, check=False).returncode == 0:
        return
    shallow = git(['rev-parse', '--is-shallow-repository'], cwd=dest, check=False).stdout.strip() == 'true'
    has_head = git(['rev-parse', '-q', '--verify', 'HEAD'], cwd=dest, check=False).returncode == 0
    # 전체 기록을 가진 원본에 --depth를 쓰면 얕은 저장소로 바뀌므로 그때는 쓰지 않는다.
    depth = [] if has_head and not shallow else ['--depth', '1']
    if git(['fetch', '-q'] + depth + [url, commit], cwd=dest, check=False).returncode != 0:
        git(['fetch', '-q'] + (['--unshallow'] if shallow else []) + [url], cwd=dest)


# ---------------------------------------------------------------- 설치 계획 실행기
class Plan:
    """할 일을 모아 보여 주고, --apply면 하나씩 실행하며 만든 것을 상태 파일에 적는다."""

    def __init__(self, apply):
        self.apply = apply
        self.count = 0
        self.problems = []
        self.state = load_json(STATE, {'version': 1, 'created': [], 'claude_overrides_before': None,
                                       'preexisting_links': {}, 'dsh_plugins': [], 'templates': []})
        self.state['repo'] = REPO
        self.state.setdefault('agents_existed', os.path.isdir(AGENTS))

    def record(self, item):
        if not self.apply:
            return
        if item not in self.state['created']:
            self.state['created'].append(item)
        self.save()

    def save(self):
        if self.apply:
            save_json(STATE, self.state)

    def step(self, msg):
        self.count += 1
        say(f'  - {msg}')

    def problem(self, msg):
        self.problems.append(msg)
        say(f'  ! {msg}')

    def mkdir(self, path):
        if os.path.isdir(path):
            return
        self.step(f'폴더 만들기 {short(path)}')
        if self.apply:
            self.mkdir_quiet(path)

    def link(self, path, target, note=''):
        """path에 target을 가리키는 링크를 둔다. 이미 다른 것이 있으면 건드리지 않고 알린다."""
        if os.path.islink(path):
            if os.readlink(path) == target:
                return True
            if os.path.realpath(path) == os.path.realpath(os.path.join(os.path.dirname(path), target)):
                return True
            say(f'  · 그대로 둠(다른 곳을 가리킴) {short(path)} -> {os.readlink(path)}')
            return False
        if os.path.exists(path):
            say(f'  · 그대로 둠(같은 이름이 이미 있음) {short(path)}')
            return False
        self.step(f'연결 {short(path)} -> {short(target)}{note}')
        if self.apply:
            self.mkdir_quiet(os.path.dirname(path))
            os.symlink(target, path)
            self.record({'kind': 'link', 'path': path, 'target': target})
        return True

    def mkdir_quiet(self, path):
        """없는 상위 폴더부터 하나씩 만들고 모두 적어 둔다(제거할 때 빈 폴더를 지울 수 있게)."""
        missing = []
        while path and not os.path.isdir(path):
            missing.append(path)
            path = os.path.dirname(path)
        for p in reversed(missing):
            os.mkdir(p)
            self.record({'kind': 'dir', 'path': p})

    def run(self, desc, cmd, cwd=None, env=None, allow_fail=False):
        self.step(desc)
        if not self.apply:
            return True
        result = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
        if result.returncode != 0:
            tail = (result.stdout + result.stderr).strip().splitlines()[-8:]
            msg = f'{desc} 실패(종료 코드 {result.returncode})\n      ' + '\n      '.join(tail)
            if allow_fail:
                self.problem(msg)
            else:
                raise SystemExit(f'설치 중단: {msg}')
            return False
        for line in (result.stdout.strip().splitlines()[-3:] if result.stdout.strip() else []):
            say(f'      {line}')
        return True


def short(path):
    return path.replace(HOME, '~', 1) if isinstance(path, str) and path.startswith(HOME) else path


# ---------------------------------------------------------------- 설치 단계
def check_prereq(groups):
    say('[1/9] 준비물 확인')
    ok = True
    if sys.version_info < (3, 8):
        say(f'  ! Python 3.8 이상이 필요합니다(지금 {platform.python_version()})')
        ok = False
    if not shutil.which('git'):
        say('  ! git이 없습니다. macOS면 터미널에서 xcode-select --install')
        ok = False
    present = tools_present()
    names = {'claude': 'Claude Code·VS Code(~/.claude)', 'codex': 'Codex(~/.codex)',
             'antigravity': 'Antigravity(~/.gemini)', 'dsh': 'DeepSeek Harness(~/.dsh)'}
    for key, label in names.items():
        say(f'  {"✓" if present[key] else "·"} {label}{"" if present[key] else " — 없음, 건너뜀"}')
    if not any(present.values()):
        say('  ! 연결할 AI 도구가 하나도 없습니다. 도구를 먼저 설치하고 한 번 실행한 뒤 다시 돌리세요.')
    if not shutil.which('bun'):
        say('  · bun 없음 — gstack 스킬 문서를 만들 수 없어 gstack은 건너뜁니다(https://bun.sh 설치 후 다시 실행)')
    if 'dsh-plugins' in groups and not os.path.isfile(os.path.join(DSH_PROFILE, 'package.json')):
        say('  · DeepSeek Harness 프로필이 없어 플러그인은 건너뜁니다')
    return ok


def is_repo(dest):
    return os.path.isdir(os.path.join(dest, '.git')) or os.path.isfile(os.path.join(dest, '.git'))


def head_of(dest):
    return git(['rev-parse', 'HEAD'], cwd=dest, check=False).stdout.strip()


def move_source(plan, source, head):
    """받아 둔 원본을 고정 커밋으로 옮긴다. 옮겼으면(미리보기는 옮길 예정이면) True."""
    dest = src_dir(source)
    changes = source_changes(dest) if plan.apply else not_hints(dest, source_changes(dest))
    if changes:
        plan.problem(f'건너뜀 {source["repo"]}: 받은 뒤 고친 파일 {len(changes)}개가 있어 옮기지 않았습니다'
                     f'(예: {changes[0][3:]}). 고친 내용을 따로 보관하고 되돌린 뒤 다시 돌리세요')
        return False
    plan.step(f'옮기기 {source["repo"]}: {head[:7]} -> {source["commit"][:7]}')
    if not plan.apply:
        return True
    try:
        fetch_commit(dest, source_url(source), source['commit'])
        git(['checkout', '-q', source['commit']], cwd=dest)
    except subprocess.CalledProcessError as e:
        plan.problem(f'{source["repo"]} 옮기기 실패: {(e.stderr or "").strip()[:300]}')
        return False
    return True


def clone_sources(plan, groups, update=False):
    """원본을 받고, update면 받아 둔 원본도 고정 커밋으로 옮긴다. 옮긴 원본 id를 돌려준다."""
    say('[2/9] 외부 스킬 원본 받기(복사본을 싣지 않고 원본 저장소에서 받음)')
    moved = set()
    if update and plan.apply and os.path.isfile(HINTS_STATE) and any(
            is_repo(src_dir(s)) and head_of(src_dir(s)) != s['commit'] for s in selected_sources(groups)):
        # 힌트는 원본 SKILL.md를 고치므로, 빼 두지 않으면 고친 원본으로 보이고 checkout도 막힌다. 옮긴 뒤 [7/9]에서 다시 넣는다.
        plan.run('스킬 입력 힌트 잠시 빼기(skill-hints-sync --remove, 옮긴 뒤 다시 넣음)', HINTS_TOOL + ['--remove'], allow_fail=True)
    for source in selected_sources(groups):
        dest = src_dir(source)
        if is_repo(dest):
            head = head_of(dest)
            if head == source['commit']:
                continue
            if update:
                if move_source(plan, source, head):
                    moved.add(source['id'])
            else:
                say(f'  · 그대로 둠 {source["repo"]}: 이미 받아 둔 다른 커밋 {head[:7]} (시험한 커밋 {source["commit"][:7]}, 옮기려면 --update-sources)')
            continue
        if os.path.exists(dest):
            plan.problem(f'{short(dest)}가 git 저장소가 아니라서 받지 않았습니다')
            continue
        plan.step(f'받기 {source["repo"]} @ {source["commit"][:7]} ({source["license"]}) -> {short(dest)}')
        if not plan.apply:
            continue
        plan.mkdir_quiet(SOURCES)
        plan.mkdir_quiet(os.path.dirname(dest))
        try:
            git(['init', '-q', dest])
            plan.record({'kind': 'clone', 'path': dest, 'repo': source['repo']})
            git(['remote', 'add', 'origin', f'https://github.com/{source["repo"]}.git'], cwd=dest)
            fetch_commit(dest, source_url(source), source['commit'])
            git(['checkout', '-q', source['commit']], cwd=dest)
        except subprocess.CalledProcessError as e:
            plan.problem(f'{source["repo"]} 받기 실패: {(e.stderr or "").strip()[:300]}')
    return moved


def prune_broken_links(plan):
    """원본을 옮기며 사라진 스킬의 링크를 지운다. 이 설치기가 만들었고 지금 깨진 링크만 지운다."""
    for item in plan.state['created']:
        p = item['path']
        if item['kind'] == 'link' and os.path.islink(p) and os.readlink(p) == item['target'] and not os.path.exists(p):
            plan.step(f'깨진 연결 지우기 {short(p)} (원본에서 사라진 스킬)')
            os.unlink(p)


def prepare_gstack(plan, build, refresh=False):
    """refresh는 gstack 원본을 옮겼을 때다. 문서와 실행 파일을 다시 만든다(실패해도 다른 일은 계속)."""
    if not os.path.isdir(GSTACK) and not plan.apply:
        say('[3/9] gstack 준비: 받은 뒤 bun으로 스킬 문서를 만듭니다')
        return
    say('[3/9] gstack 준비(스킬 문서 만들기, 실행 파일 자리 잇기)')
    if not os.path.isdir(GSTACK):
        return
    docs = os.path.join(GSTACK, '.agents', 'skills')
    has_docs = os.path.isdir(docs) and any(n.startswith('gstack-') for n in os.listdir(docs))
    bun = shutil.which('bun')
    if not has_docs or refresh:
        if bun:
            if refresh or not os.path.isdir(os.path.join(GSTACK, 'node_modules')):
                plan.run('gstack 의존성 설치(bun install)', [bun, 'install', '--frozen-lockfile'], cwd=GSTACK,
                         allow_fail=refresh)
            plan.run('gstack 스킬 문서 만들기(bun run gen:skill-docs --host codex)',
                     [bun, 'run', 'gen:skill-docs', '--host', 'codex'], cwd=GSTACK, allow_fail=refresh)
        else:
            plan.problem('bun이 없어 gstack 스킬 문서를 만들지 못했습니다. bun 설치 후 install.sh를 다시 돌리세요')
            if not has_docs:
                return
    browse = os.path.join(GSTACK, 'browse', 'dist', 'browse')
    need_build = refresh or not os.path.exists(browse)
    if build and bun and need_build:
        plan.run('gstack 브라우저 실행 파일 만들기(bun run build, 몇 분 걸림)', [bun, 'run', 'build'],
                 cwd=GSTACK, allow_fail=True)
    elif need_build:
        say('  · gstack 브라우저 실행 파일은 만들지 않았습니다(/gstack-browse 등은 나중에: cd ~/.agents/sources/garrytan/gstack && bun run build)')

    # 실행 파일 자리: gstack 스킬은 ~/.codex/skills/gstack/bin 등을 찾는다. 원본 폴더를 통째로 두면
    # 원본 안의 SKILL.md가 한 번 더 읽히므로, SKILL.md를 뺀 실행 파일만 이은 곁 폴더를 만든다.
    plan.mkdir(GSTACK_RUNTIME)
    for name in ('ETHOS.md', 'bin', 'lib'):
        if os.path.exists(os.path.join(GSTACK, name)):
            plan.link(os.path.join(GSTACK_RUNTIME, name), os.path.join(GSTACK, name))
    for sub in ('browse', 'qa', 'review'):
        base = os.path.join(GSTACK, sub)
        if not os.path.isdir(base):
            continue
        plan.mkdir(os.path.join(GSTACK_RUNTIME, sub))
        for child in sorted(os.listdir(base)):
            if child.startswith('SKILL.md') or child.startswith('.'):
                continue
            if sub == 'browse' and child not in ('bin', 'dist'):
                continue
            plan.link(os.path.join(GSTACK_RUNTIME, sub, child), os.path.join(base, child))
    group = os.path.join(SHELF, 'gstack')
    plan.mkdir(group)
    for name in sorted(os.listdir(GSTACK_RUNTIME)) if os.path.isdir(GSTACK_RUNTIME) else []:
        plan.link(os.path.join(group, name), os.path.join('..', '..', 'sources', 'garrytan', 'gstack-runtime', name))
    plan.link(os.path.join(CODEX, 'skills', 'gstack'), GSTACK_RUNTIME, ' (gstack 실행 파일 자리)')
    if os.path.isdir(CLAUDE):
        plan.link(os.path.join(CLAUDE_SKILLS, 'gstack'), GSTACK_RUNTIME, ' (gstack 실행 파일 자리)')


def shelf_entries(groups):
    """선반에 둘 것: (선반 안 경로, 링크 대상, Claude 이름 또는 None)."""
    out = []
    for source in selected_sources(groups):
        base = src_dir(source)
        rel_base = os.path.join('..', 'sources', *source['repo'].split('/'))
        for entry in source.get('shelf', []):
            if entry.get('kind') != 'group':
                rel = os.path.normpath(os.path.join(rel_base, entry['path']))
                out.append((os.path.join(SHELF, entry['name']), rel, entry['name']))
                continue
            children = entry.get('pick')
            if children is None:
                root = os.path.join(base, entry['path'])
                children = {c: os.path.join(entry['path'], c) for c in sorted(os.listdir(root))
                            if os.path.isfile(os.path.join(root, c, 'SKILL.md'))} if os.path.isdir(root) else {}
            for child, path in children.items():
                rel = os.path.normpath(os.path.join('..', rel_base, path))
                out.append((os.path.join(SHELF, entry['name'], child), rel, child))
    have = {s['id'] for s in selected_sources(groups)}
    for skill in own_skills():
        if not set(skill.get('requires', [])) <= have:
            continue
        src = os.path.join(REPO, 'skills', skill['name'])
        if skill.get('kind') == 'group':
            for child in sorted(os.listdir(src)):
                if os.path.isfile(os.path.join(src, child, 'SKILL.md')):
                    out.append((os.path.join(SHELF, skill['name'], child), os.path.join(src, child),
                                child if skill.get('claude', True) else None))
        else:
            out.append((os.path.join(SHELF, skill['name']), src, skill['name'] if skill.get('claude', True) else None))
    return out


def link_shelf(plan, groups):
    say('[4/9] 공용 선반(~/.agents/skills)에 스킬 잇기')
    plan.mkdir(SHELF)
    entries = shelf_entries(groups)
    for path, target, _ in entries:
        if os.path.dirname(path) != SHELF:
            plan.mkdir(os.path.dirname(path))
        plan.link(path, target)
    if not entries:
        say('  · 원본을 받은 뒤 다시 돌리면 이어집니다')
    return entries


def link_tools(plan):
    say('[5/9] 동기화 도구를 ~/.agents/bin에 잇기, 스킬 입력 힌트 목록 두기')
    plan.mkdir(BIN)
    for tool in TOOLS:
        plan.link(os.path.join(BIN, tool), os.path.join(REPO, 'bin', tool))
    copy_hints_list(plan)
    if BIN not in os.environ.get('PATH', '').split(os.pathsep):
        say('  · 짧은 이름으로 부르려면 ~/.zshrc에 한 줄 추가: export PATH="$HOME/.agents/bin:$PATH"')


def copy_hints_list(plan):
    """~/.agents/skill-hints.json이 없으면 둔다. 이 설치기가 둔 뒤 고치지 않은 목록만 새 판으로 바꾼다."""
    src = os.path.join(REPO, 'config', 'skill-hints.json')
    rec = next((i for i in plan.state['created'] if i['kind'] == 'file' and i['path'] == HINTS_FILE), None)
    verb = '두기'
    if os.path.exists(HINTS_FILE):
        current = sha256(HINTS_FILE)
        if not rec or current != rec['sha256']:
            say(f'  · 그대로 둠 {short(HINTS_FILE)}: 이미 있는 힌트 목록은 덮어쓰지 않습니다')
            return
        if current == sha256(src):
            return
        verb = '새 판으로 바꾸기'
    plan.step(f'스킬 입력 힌트 목록 {verb} {short(HINTS_FILE)}')
    if not plan.apply:
        return
    plan.mkdir_quiet(AGENTS)
    shutil.copyfile(src, HINTS_FILE)
    if rec:
        rec['sha256'] = sha256(HINTS_FILE)
        plan.save()
    else:
        plan.record({'kind': 'file', 'path': HINTS_FILE, 'sha256': sha256(HINTS_FILE)})


def link_claude(plan, entries):
    say('[6/9] Claude Code·VS Code에 잇기(~/.claude/skills)')
    if not os.path.isdir(CLAUDE):
        say('  · ~/.claude가 없어 건너뜀')
        return
    plan.mkdir(CLAUDE_SKILLS)
    for path, _, name in entries:
        if name is None:
            continue
        dest = os.path.join(CLAUDE_SKILLS, name)
        ours = os.path.isfile(os.path.join(dest, 'SKILL.md')) and wc.MARKS['pack-prefix-sync'] in \
            open(os.path.join(dest, 'SKILL.md'), encoding='utf-8').read(4000)
        if ours:
            continue  # pack-prefix-sync가 이미 감싸개로 바꿔 둔 자리
        plan.link(dest, path)
    preset = wc.load().get('claude_overrides_preset', {})
    settings = load_json(CLAUDE_SETTINGS, {})
    overrides = settings.get('skillOverrides', {})
    if plan.state.get('claude_overrides_before') is None:
        plan.state['claude_overrides_before'] = dict(overrides)
        plan.state['claude_settings_existed'] = os.path.isfile(CLAUDE_SETTINGS)
        plan.save()
    missing = {k: v for k, v in preset.items() if k not in overrides}
    for key, value in missing.items():
        plan.step(f'Claude 설정 skillOverrides.{key} = {value} (기본값, 이미 정해 둔 값은 건드리지 않음)')
    if plan.apply and missing:
        settings.setdefault('skillOverrides', {}).update(missing)
        save_json(CLAUDE_SETTINGS, settings)


def snapshot_links(plan):
    """설치 전부터 있던 링크 이름을 적어 둔다. 제거할 때 이 이름은 지우지 않는다."""
    if plan.state.get('preexisting_links'):
        return
    snap = {}
    for key, root in TARGET_DIRS.items():
        snap[key] = sorted(n for n in os.listdir(root) if os.path.islink(os.path.join(root, n))) if os.path.isdir(root) else []
    plan.state['preexisting_links'] = snap
    plan.save()


def sync_tools(plan):
    say('[7/9] 도구별 이름 맞추기(말머리 <팩>-<이름>)')
    present = tools_present()
    calls = []
    if os.path.isdir(os.path.join(GSTACK, '.agents', 'skills')):
        calls.append(('gstack 연결', [os.path.join(REPO, 'bin', 'gstack-sync-links')] + ([] if plan.apply else ['--check'])))
    # 감싸개가 원본의 힌트를 복사하므로 힌트를 먼저 넣는다.
    calls.append(('스킬 입력 힌트', HINTS_TOOL + (['--apply'] if plan.apply else [])))
    if present['claude'] or present['codex']:
        calls.append(('Claude·Codex 말머리', [sys.executable, os.path.join(REPO, 'bin', 'pack-prefix-sync')] + (['--apply'] if plan.apply else [])))
    if present['antigravity']:
        calls.append(('Antigravity', [sys.executable, os.path.join(REPO, 'bin', 'antigravity-sync-skills')] + (['--apply'] if plan.apply else [])))
    if present['dsh']:
        calls.append(('DeepSeek Harness', [sys.executable, os.path.join(REPO, 'bin', 'dsh-sync-skills')] + (['--apply'] if plan.apply else [])))
    for label, cmd in calls:
        if not plan.apply:
            plan.step(f'{label}: {os.path.basename(cmd[1] if cmd[0] == sys.executable else cmd[0])}{" --apply" if label != "gstack 연결" else ""}')
            continue
        result = subprocess.run(cmd, capture_output=True, text=True)
        lines = (result.stdout + result.stderr).strip().splitlines()
        say(f'  - {label}: {lines[-1] if lines else "끝"}')
        if result.returncode not in (0,):
            plan.problem(f'{label} 도구가 종료 코드 {result.returncode}로 끝났습니다: ' + ' / '.join(lines[-3:]))


def install_dsh_plugins(plan, groups):
    say('[8/9] DeepSeek Harness 플러그인(선택: --with dsh-plugins)')
    if 'dsh-plugins' not in groups:
        say('  · 고르지 않음')
        return
    pkg_path = os.path.join(DSH_PROFILE, 'package.json')
    node = os.path.join(DSH_RUNTIME, 'node', 'bin', 'node')
    pnpm = os.path.join(DSH_RUNTIME, 'pnpm', 'bin', 'pnpm.mjs')
    if not os.path.isfile(pkg_path):
        say('  · DeepSeek Harness 프로필이 없어 건너뜀')
        return
    if not (os.path.isfile(node) and os.path.isfile(pnpm)):
        plan.problem('DeepSeek Harness에 들어 있는 node·pnpm을 찾지 못해 플러그인을 넣지 못했습니다')
        return
    pkg = load_json(pkg_path, {})
    deps = pkg.get('dependencies', {})
    bundles = pkg.get('dsh', {}).get('profile', {}).get('bundles', [])
    for name in DSH_PLUGINS:
        full = f'@local/{name}'
        spec = f'link:{os.path.join(REPO, "dsh-plugins", name)}'
        if deps.get(full) and deps[full] != spec:
            say(f'  · 그대로 둠 {full}: 이미 다른 곳에서 넣은 플러그인({deps[full]})')
            continue
        if deps.get(full) != spec:
            ok = plan.run(f'플러그인 넣기 {full}', [node, pnpm, 'add', spec, '--dir', DSH_PROFILE], allow_fail=True)
            if not ok:
                continue
            if plan.apply and full not in plan.state['dsh_plugins']:
                plan.state['dsh_plugins'].append(full)
                plan.save()
        if full not in bundles:
            plan.step(f'DSH 프로필 bundles에 {full} 추가')
            if plan.apply:
                pkg = load_json(pkg_path, {})
                lst = pkg.setdefault('dsh', {}).setdefault('profile', {}).setdefault('bundles', [])
                if full not in lst:
                    lst.append(full)
                save_json(pkg_path, pkg)
                if full not in plan.state['dsh_plugins']:
                    plan.state['dsh_plugins'].append(full)
                    plan.save()
    say('  · 플러그인을 바꿨으면 DeepSeek Harness를 다시 시작하세요. brave-search는 Brave Search API 키가 있어야 동작합니다(README 참고)')


TEMPLATE_TARGETS = [
    ('global-CLAUDE.md', os.path.join(CLAUDE, 'CLAUDE.md'), 'claude'),
    ('global-AGENTS.md', os.path.join(CODEX, 'AGENTS.md'), 'codex'),
    ('global-AGENTS.md', os.path.join(GEMINI, 'GEMINI.md'), 'antigravity'),
    ('global-AGENTS.md', os.path.join(DSH, 'AGENTS.md'), 'dsh'),
]


def install_templates(plan, groups):
    say('[9/9] 지침 틀(선택: --with templates)')
    if 'templates' not in groups:
        say('  · 고르지 않음(templates/ 폴더의 틀을 직접 열어 보고 필요한 부분만 옮겨도 됩니다)')
        return
    present = tools_present()
    for template, dest, tool in TEMPLATE_TARGETS:
        if not present[tool]:
            continue
        if os.path.exists(dest):
            say(f'  · 그대로 둠 {short(dest)}: 이미 있는 지침은 덮어쓰지 않습니다')
            continue
        src = os.path.join(REPO, 'templates', template)
        plan.step(f'지침 틀 복사 {template} -> {short(dest)}')
        if plan.apply:
            shutil.copyfile(src, dest)
            plan.state['templates'].append({'path': dest, 'sha256': sha256(dest)})
            plan.save()


def parse_groups(args):
    groups = set()
    for i, a in enumerate(args):
        if a == '--with' and i + 1 < len(args):
            groups |= set(x.strip() for x in args[i + 1].split(',') if x.strip())
        elif a.startswith('--with='):
            groups |= set(x.strip() for x in a.split('=', 1)[1].split(',') if x.strip())
    if 'all' in groups:
        groups = set(OPTIONAL)
    unknown = groups - set(OPTIONAL)
    if unknown:
        raise SystemExit(f'모르는 선택: {", ".join(sorted(unknown))} (고를 수 있는 것: {", ".join(OPTIONAL)}, all)')
    return groups


def install(args):
    apply = '--apply' in args
    update = '--update-sources' in args
    groups = parse_groups(args)
    say(f'agent-workbench 설치 {"(적용)" if apply else "(미리보기: 아무것도 바꾸지 않음)"} — 저장소 {short(REPO)}')
    say(f'  고른 것: 기본{"" if not groups else " + " + ", ".join(sorted(groups))}')
    if not check_prereq(groups):
        return 2
    plan = Plan(apply)
    if apply:
        snapshot_links(plan)
    # 옮길 때는 전에 고른 묶음의 원본까지 함께 본다. --with를 다시 적지 않아도 빠지지 않게.
    source_groups = groups | set(plan.state.get('groups', [])) if update else groups
    moved = clone_sources(plan, source_groups, update)
    prepare_gstack(plan, build='--no-gstack-build' not in args, refresh='gstack' in moved)
    if apply and moved:
        prune_broken_links(plan)
    entries = link_shelf(plan, source_groups)
    link_tools(plan)
    link_claude(plan, entries)
    sync_tools(plan)
    install_dsh_plugins(plan, groups)
    install_templates(plan, groups)
    if apply:
        plan.state['groups'] = sorted(set(plan.state.get('groups', [])) | groups)
        plan.save()
    say()
    if plan.problems:
        say(f'끝났지만 확인할 것 {len(plan.problems)}건이 있습니다(위의 ! 줄).')
    if not apply:
        say(f'할 일 {plan.count}건. 실제로 바꾸려면: ./install.sh --apply' + (' --update-sources' if update else '')
            + (f' --with {",".join(sorted(groups))}' if groups else ''))
    else:
        say(f'설치를 마쳤습니다(바꾼 것 {plan.count}건). 상태 점검: ./doctor.sh   제거: ./uninstall.sh')
    return 1 if plan.problems else 0


# ---------------------------------------------------------------- 점검
def doctor(args):
    as_json = '--json' in args
    state = load_json(STATE, None)
    report = {'checks': [], 'level': 'ready'}

    def check(name, ok, detail='', level='action-required'):
        report['checks'].append({'name': name, 'ok': ok, 'detail': detail})
        if not ok:
            if level == 'blocked' or report['level'] == 'blocked':
                report['level'] = 'blocked'
            else:
                report['level'] = 'action-required'

    check('git', bool(shutil.which('git')), 'xcode-select --install', 'blocked')
    check('Python 3.8 이상', sys.version_info >= (3, 8), platform.python_version(), 'blocked')
    check('설치 기록', state is not None, f'{short(STATE)} 없음 — ./install.sh --apply' if state is None else short(STATE))
    groups = set(state.get('groups', [])) if state else set()
    if state and os.path.realpath(state.get('repo', '')) != os.path.realpath(REPO):
        check('저장소 위치', False, f'설치는 {short(state.get("repo"))}에서 했습니다. 그 폴더를 옮기거나 지웠다면 다시 설치하세요', 'blocked')
    for source in selected_sources(groups):
        dest = src_dir(source)
        if not os.path.isdir(dest):
            check(f'원본 {source["repo"]}', False, '받지 않음 — ./install.sh --apply')
            continue
        head = git(['rev-parse', 'HEAD'], cwd=dest, check=False).stdout.strip()
        check(f'원본 {source["repo"]}', True, head[:7] + ('' if head == source['commit'] else f' (시험한 커밋 {source["commit"][:7]}와 다름 — 옮기려면 ./install.sh --apply --update-sources)'))
    if os.path.isdir(GSTACK):
        docs = os.path.join(GSTACK, '.agents', 'skills')
        check('gstack 스킬 문서', os.path.isdir(docs), '없음 — bun 설치 후 ./install.sh --apply')
        check('gstack 브라우저 실행 파일', os.path.exists(os.path.join(GSTACK, 'browse', 'dist', 'browse')),
              '없음 — /gstack-browse를 쓰려면 cd ~/.agents/sources/garrytan/gstack && bun run build')
    broken = []
    for root in [SHELF, BIN] + list(TARGET_DIRS.values()):
        for dirpath, dirnames, filenames in os.walk(root) if os.path.isdir(root) else []:
            for n in dirnames + filenames:
                p = os.path.join(dirpath, n)
                if os.path.islink(p) and not os.path.exists(p) and wc.points_inside(p, wc.managed_roots() + [SHELF]):
                    broken.append(short(p))
            dirnames[:] = [d for d in dirnames if not os.path.islink(os.path.join(dirpath, d))]
    check('깨진 링크', not broken, ', '.join(broken[:5]) + (f' 외 {len(broken) - 5}개' if len(broken) > 5 else ''))
    present = tools_present()
    tool_checks = [('스킬 입력 힌트', HINTS_TOOL + ['--check'], True),
                   ('gstack 연결', [os.path.join(REPO, 'bin', 'gstack-sync-links'), '--check'], os.path.isdir(os.path.join(GSTACK, '.agents', 'skills'))),
                   ('Claude·Codex 말머리', [sys.executable, os.path.join(REPO, 'bin', 'pack-prefix-sync')], present['claude'] or present['codex']),
                   ('Antigravity 연결', [sys.executable, os.path.join(REPO, 'bin', 'antigravity-sync-skills')], present['antigravity']),
                   ('DeepSeek Harness 연결', [sys.executable, os.path.join(REPO, 'bin', 'dsh-sync-skills')], present['dsh'])]
    for name, cmd, wanted in tool_checks:
        if not wanted:
            continue
        r = subprocess.run(cmd, capture_output=True, text=True)
        last = (r.stdout + r.stderr).strip().splitlines()
        check(name, r.returncode == 0, last[-1] if last else '')
    check('PATH에 ~/.agents/bin', BIN in os.environ.get('PATH', '').split(os.pathsep),
          'export PATH="$HOME/.agents/bin:$PATH"를 ~/.zshrc에 추가(선택)')
    if 'dsh-plugins' in groups:
        pkg = load_json(os.path.join(DSH_PROFILE, 'package.json'), {})
        bundles = pkg.get('dsh', {}).get('profile', {}).get('bundles', [])
        missing = [p for p in DSH_PLUGINS if f'@local/{p}' not in bundles]
        check('DeepSeek Harness 플러그인', not missing, '빠짐: ' + ', '.join(missing) if missing else '3개')
    if as_json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        for c in report['checks']:
            mark = '✓' if c['ok'] else '✗'
            say(f'{mark} {c["name"]}' + (f' — {c["detail"]}' if c['detail'] else ''))
        label = {'ready': '바로 쓸 수 있음', 'action-required': '조치가 필요한 항목 있음', 'blocked': '먼저 고쳐야 하는 문제 있음'}
        say(f'\n결과: {report["level"]} ({label[report["level"]]})')
    return {'ready': 0, 'action-required': 1, 'blocked': 2}[report['level']]


# ---------------------------------------------------------------- 제거
def has_mark(path):
    candidates = [os.path.join(path, 'SKILL.md')] if os.path.isdir(path) and not os.path.islink(path) else []
    if path.endswith('.md') and os.path.isfile(path) and not os.path.islink(path):
        candidates.append(path)
    for c in candidates:
        try:
            with open(c, encoding='utf-8') as f:
                head = f.read(4000)
        except OSError:
            continue
        if any(m in head for m in wc.MARKS.values()):
            return True
    return False


def uninstall(args):
    apply = '--apply' in args
    purge = '--purge-sources' in args
    state = load_json(STATE, None)
    say(f'agent-workbench 제거 {"(적용)" if apply else "(미리보기: 아무것도 바꾸지 않음)"}')
    if state is None:
        say('설치 기록이 없습니다. 지울 것이 없습니다.')
        return 0
    count = 0

    def act(msg, fn):
        nonlocal count
        count += 1
        say(f'  - {msg}')
        if apply:
            fn()

    # 0) 스킬 입력 힌트를 원본에서 뺀다(원본이 받은 그대로여야 --purge-sources가 지운다)
    if os.path.isfile(HINTS_STATE):
        def remove_hints():
            r = subprocess.run(HINTS_TOOL + ['--remove'], capture_output=True, text=True)
            if r.returncode != 0:
                say('  ! 힌트를 빼지 못했습니다: ' + ' / '.join((r.stdout + r.stderr).strip().splitlines()[-3:]))
        act('스킬 입력 힌트를 원본에서 빼기(skill-hints-sync --remove)', remove_hints)

    # 1) DeepSeek Harness 플러그인
    pkg_path = os.path.join(DSH_PROFILE, 'package.json')
    node = os.path.join(DSH_RUNTIME, 'node', 'bin', 'node')
    pnpm = os.path.join(DSH_RUNTIME, 'pnpm', 'bin', 'pnpm.mjs')
    for full in state.get('dsh_plugins', []):
        def drop(full=full):
            pkg = load_json(pkg_path, {})
            lst = pkg.get('dsh', {}).get('profile', {}).get('bundles', [])
            if full in lst:
                lst.remove(full)
                save_json(pkg_path, pkg)
            if full in load_json(pkg_path, {}).get('dependencies', {}) and os.path.isfile(node):
                subprocess.run([node, pnpm, 'remove', full, '--dir', DSH_PROFILE], capture_output=True, text=True)
        act(f'DeepSeek Harness 플러그인 빼기 {full}', drop)

    # 2) 동기화 도구가 만든 감싸개(MARK)와 선반·원본을 가리키는 링크
    pre = state.get('preexisting_links', {})
    roots = wc.managed_roots() + [SHELF]
    for key, root in TARGET_DIRS.items():
        if not os.path.isdir(root):
            continue
        for name in sorted(os.listdir(root)):
            p = os.path.join(root, name)
            if os.path.islink(p):
                if name in pre.get(key, []) or not wc.points_inside(p, roots):
                    continue
                act(f'링크 지우기 {short(p)}', lambda p=p: os.unlink(p))
            elif has_mark(p):
                act(f'감싸개 지우기 {short(p)}', lambda p=p: shutil.rmtree(p) if os.path.isdir(p) else os.unlink(p))

    # 2-1) gstack-sync-links가 선반 gstack 묶음에 만든 링크(묶음 폴더를 이 설치기가 만들었을 때만)
    gstack_group = os.path.join(SHELF, 'gstack')
    if {'kind': 'dir', 'path': gstack_group} in state.get('created', []) and os.path.isdir(gstack_group):
        for name in sorted(os.listdir(gstack_group)):
            p = os.path.join(gstack_group, name)
            if name.startswith('gstack-') and os.path.islink(p) and wc.points_inside(p, [GSTACK]):
                act(f'링크 지우기 {short(p)}', lambda p=p: os.unlink(p))

    # 3) Claude skillOverrides를 설치 전 값으로
    before = state.get('claude_overrides_before')
    if before is not None and os.path.isfile(CLAUDE_SETTINGS):
        settings = load_json(CLAUDE_SETTINGS, {})
        overrides = settings.get('skillOverrides', {})
        managed = set(wc.load().get('claude_overrides_preset', {}))
        for item in state.get('created', []):
            if item['kind'] == 'link' and item['path'].startswith(CLAUDE_SKILLS + os.sep):
                managed.add(os.path.basename(item['path']))
        for d in (os.path.join(SHELF, p) for p in wc.load()['packs']):
            for n in os.listdir(d) if os.path.isdir(d) else []:
                managed.add(n[len('gstack-'):] if n.startswith('gstack-') else n)
        changed = {k for k in managed if overrides.get(k) != before.get(k)}
        if changed:
            def restore():
                s = load_json(CLAUDE_SETTINGS, {})
                o = s.setdefault('skillOverrides', {})
                for k in changed:
                    if k in before:
                        o[k] = before[k]
                    else:
                        o.pop(k, None)
                if not state.get('claude_settings_existed', True) and s in ({}, {'skillOverrides': {}}):
                    os.unlink(CLAUDE_SETTINGS)  # 설치기가 새로 만든 빈 설정 파일
                else:
                    save_json(CLAUDE_SETTINGS, s)
            act(f'Claude 설정 skillOverrides {len(changed)}개를 설치 전 값으로', restore)

    # 4) Codex 설정의 자동 블록
    codex_config = os.path.join(CODEX, 'config.toml')
    if os.path.isfile(codex_config):
        with open(codex_config, encoding='utf-8') as f:
            text = f.read()
        start = '# pack-prefix-sync: 말머리 감싸개가 대신하는 원래 이름(자동 생성, 손으로 고치지 않음)'
        end = '# pack-prefix-sync: 끝'
        if start in text and end in text:
            a, b = text.index(start), text.index(end) + len(end)
            new = (text[:a].rstrip('\n') + '\n' + text[b:].lstrip('\n')).strip('\n')
            new = new + '\n' if new else ''

            def write_codex(new=new):
                with open(codex_config, 'w', encoding='utf-8') as f:
                    f.write(new)
            act('Codex 설정에서 말머리 자동 블록 빼기', write_codex)

    # 5) 지침 틀(설치 뒤 고치지 않은 것만)
    for item in state.get('templates', []):
        p = item['path']
        if os.path.isfile(p) and sha256(p) == item['sha256']:
            act(f'지침 틀 지우기 {short(p)}', lambda p=p: os.unlink(p))
        elif os.path.isfile(p):
            say(f'  · 그대로 둠 {short(p)}: 설치 뒤 고친 지침입니다')

    # 6) 설치기가 만든 링크·폴더(만든 순서의 반대로)
    for item in reversed(state.get('created', [])):
        p = item['path']
        if item['kind'] == 'link':
            if os.path.islink(p) and os.readlink(p) == item['target']:
                act(f'링크 지우기 {short(p)}', lambda p=p: os.unlink(p))
        elif item['kind'] == 'dir':
            if os.path.isdir(p) and not os.path.islink(p):
                def rmdir_if_empty(p=p):
                    junk = [n for n in os.listdir(p) if n == '.DS_Store']
                    for n in junk:
                        os.unlink(os.path.join(p, n))
                    if not os.listdir(p):
                        os.rmdir(p)
                    else:
                        say(f'  · 그대로 둠 {short(p)}: 안에 다른 파일이 있음')
                if apply or not os.listdir(p):
                    act(f'빈 폴더 지우기 {short(p)}', rmdir_if_empty)
        elif item['kind'] == 'file':
            if os.path.isfile(p) and sha256(p) == item['sha256']:
                act(f'파일 지우기 {short(p)}', lambda p=p: os.unlink(p))
            elif os.path.isfile(p):
                say(f'  · 그대로 둠 {short(p)}: 설치 뒤 고친 파일입니다')
        elif item['kind'] == 'clone':
            if not purge:
                continue
            if not os.path.isdir(p):
                continue
            if source_changes(p):
                say(f'  · 그대로 둠 {short(p)}: 받은 뒤 고친 파일이 있음')
                continue
            act(f'받은 원본 지우기 {short(p)}', lambda p=p: shutil.rmtree(p))
    if not purge and any(i['kind'] == 'clone' for i in state.get('created', [])):
        say('  · 받은 외부 원본(~/.agents/sources)은 남겨 둡니다. 함께 지우려면 --purge-sources')

    if apply:
        os.unlink(STATE)
        for d in [STATE_DIR] + ([] if state.get('agents_existed', True) else [AGENTS]):
            try:
                os.rmdir(d)
            except OSError:
                pass
        say(f'\n제거를 마쳤습니다({count}건).')
    else:
        say(f'\n할 일 {count}건. 실제로 지우려면: ./uninstall.sh --apply' + (' --purge-sources' if purge else ''))
    return 0


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ('install', 'doctor', 'uninstall'):
        print(__doc__)
        return 2
    cmd, args = sys.argv[1], sys.argv[2:]
    return {'install': install, 'doctor': doctor, 'uninstall': uninstall}[cmd](args)


if __name__ == '__main__':
    sys.exit(main())
