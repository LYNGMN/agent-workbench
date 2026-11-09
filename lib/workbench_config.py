"""agent-workbench 도구들이 함께 쓰는 설정과 경로.

설정은 저장소의 config/defaults.json을 읽고, ~/.config/agent-workbench/config.json에 같은 칸이 있으면 그 칸을 통째로 바꾼다.
"""
import json
import os

HOME = os.path.expanduser('~')
REPO = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
USER_CONFIG = os.environ.get(
    'WORKBENCH_CONFIG',
    os.path.join(os.environ.get('XDG_CONFIG_HOME', os.path.join(HOME, '.config')), 'agent-workbench', 'config.json'),
)

# 세 동기화 도구가 만든 파일에 남기는 표시. 이 표시가 있는 것만 고치거나 지운다.
MARKS = {
    'pack-prefix-sync': '<!-- pack-prefix-sync가 만든 파일: 고치려면 원본 SKILL.md나 이 스크립트를 고친다 -->',
    'antigravity-sync-skills': '<!-- antigravity-sync-skills가 만든 말머리 감싸개: 고치려면 원본 SKILL.md나 이 스크립트를 고친다 -->',
    'dsh-sync-skills': '<!-- dsh-sync-skills가 만든 파일: 고치려면 원본 SKILL.md나 이 스크립트를 고친다 -->',
}


def load():
    with open(os.path.join(REPO, 'config', 'defaults.json'), encoding='utf-8') as f:
        config = json.load(f)
    try:
        with open(USER_CONFIG, encoding='utf-8') as f:
            config.update(json.load(f))
    except FileNotFoundError:
        pass
    return config


def agents_home():
    return os.environ.get('WORKBENCH_AGENTS_HOME', os.path.join(HOME, '.agents'))


def shelf():
    return os.path.join(agents_home(), 'skills')


def sources():
    return os.path.join(agents_home(), 'sources')


def hints_overlay():
    """스킬 입력 힌트 목록. 사용자 자리(~/.agents/skill-hints.json)에 없으면 이 저장소의 기본 목록."""
    path = os.path.join(agents_home(), 'skill-hints.json')
    return path if os.path.isfile(path) else os.path.join(REPO, 'config', 'skill-hints.json')


def hints_state():
    """skill-hints-sync가 원래 값을 적어 두는 파일."""
    return os.path.join(agents_home(), '.skill-hints-state.json')


def pstack_skills():
    """pstack 스킬 폴더. 설치기가 받는 자리를 먼저, 예전 자리(~/Dev/pstack)를 다음으로 본다."""
    env = os.environ.get('DSH_PSTACK_DIR')
    if env:
        return env
    for path in (os.path.join(sources(), 'backnotprop', 'pstack', 'skills'),
                 os.path.join(HOME, 'Dev', 'pstack', 'skills')):
        if os.path.isdir(path):
            return path
    return os.path.join(sources(), 'backnotprop', 'pstack', 'skills')


def codex_present():
    """Codex가 설치됐는가. gstack 실행 파일 자리(~/.codex/skills/gstack)만 있는 것은 설치로 치지 않는다."""
    root = os.environ.get('CODEX_HOME', os.path.join(HOME, '.codex'))
    try:
        return any(n not in ('skills', '.DS_Store') for n in os.listdir(root))
    except OSError:
        return False


def points_inside(link_path, roots):
    """심볼릭 링크가 roots 안을 가리키는지(링크 글자 그대로와 실제 경로 둘 다 본다)."""
    try:
        raw = os.readlink(link_path)
    except OSError:
        return False
    raw_abs = os.path.normpath(raw if os.path.isabs(raw) else os.path.join(os.path.dirname(link_path), raw))
    real = os.path.realpath(link_path)
    for root in roots:
        root = os.path.normpath(root)
        for p in (raw_abs, real):
            if p == root or p.startswith(root + os.sep):
                return True
    return False


def managed_roots():
    """이 패키지가 링크를 걸어 주는 원본 자리. 이 안을 가리키는 링크만 동기화 도구가 지운다."""
    roots = [agents_home(), REPO, os.path.realpath(agents_home())]
    pstack = pstack_skills()
    roots.append(os.path.dirname(pstack))
    return roots
