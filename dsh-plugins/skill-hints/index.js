import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/**
 * 스킬 입력 힌트 — DSH는 스킬의 argument-hint를 입력창에 보여 주지 않는다.
 * 입력창 힌트(input.hint)는 호스트 명령에만 붙으므로, 힌트가 있는 스킬마다
 * 같은 이름의 명령을 등록하고, 실행하면 `/이름 인자`를 사용자 메시지로 보내
 * DSH가 원래 스킬을 그대로 불러오게 한다.
 */
export const name = 'skill-hints'
export const inject = ['commands']

const HOME = homedir()
// DSH가 스킬을 읽는 순서(rank 400 → 500). 같은 이름이면 앞쪽이 이긴다.
export const DEFAULT_ROOTS = [join(HOME, '.dsh', 'skills'), join(HOME, '.agents', 'skills')]
// 한국어 힌트·요약 한 곳(~/.agents/bin/skill-hints-sync가 원본에 넣는 것과 같은 목록)
export const DEFAULT_OVERLAY = join(HOME, '.agents', 'skill-hints.json')
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const DESCRIPTION_MAX = 160

function read(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return undefined
  }
}

function unquote(value) {
  const v = value.trim()
  if (v.length >= 2 && v[0] === v.at(-1) && (v[0] === '"' || v[0] === "'")) {
    return v[0] === '"' ? v.slice(1, -1).replace(/\\"/gu, '"').replace(/\\\\/gu, '\\') : v.slice(1, -1)
  }
  return v
}

/** SKILL.md 머리말에서 필요한 칸만 읽는다(YAML 라이브러리 없이). */
export function frontmatter(text) {
  if (typeof text !== 'string' || !text.startsWith('---')) return {}
  const end = text.indexOf('\n---', 3)
  if (end < 0) return {}
  const lines = text.slice(3, end).split('\n')
  const out = {}
  for (let i = 0; i < lines.length; i++) {
    const m = /^([A-Za-z][\w-]*):\s*(.*)$/u.exec(lines[i])
    if (!m) continue
    let value = m[2].trim()
    if (value === '' || /^[|>][+-]?$/u.test(value)) {
      const block = []
      while (i + 1 < lines.length && (/^\s/u.test(lines[i + 1]) || lines[i + 1] === '')) block.push(lines[++i].trim())
      value = block.filter(Boolean).join(' ')
    } else {
      value = unquote(value)
    }
    out[m[1]] = value
  }
  return out
}

/** 감싸개(.md)가 가리키는 실제 SKILL.md 경로. */
function wrappedSkill(text) {
  const m = /`(\/[^`\n]+\/SKILL\.md)`/u.exec(text)
  return m ? m[1] : undefined
}

function entries(root) {
  try {
    return readdirSync(root).sort()
  } catch {
    return []
  }
}

function isDir(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function shorten(text) {
  const t = String(text ?? '').replace(/\s+/gu, ' ').trim()
  return t.length > DESCRIPTION_MAX ? `${t.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…` : t
}

/**
 * 힌트가 있는 사람 호출 가능 스킬을 찾는다.
 * @returns {{ name: string, hint: string, description: string }[]}
 */
export function loadOverlay(path = DEFAULT_OVERLAY) {
  try {
    const skills = JSON.parse(read(path) ?? '{}').skills
    return skills && typeof skills === 'object' ? skills : {}
  } catch {
    return {}
  }
}

export function discover(roots = DEFAULT_ROOTS, overlay = loadOverlay()) {
  const seen = new Set()
  const found = []
  for (const root of roots) {
    for (const entry of entries(root)) {
      const path = join(root, entry)
      let own
      let real
      if (entry.endsWith('.md') && !isDir(path)) {
        own = read(path)
        const target = own === undefined ? undefined : wrappedSkill(own)
        real = target !== undefined && existsSync(target) ? read(target) : own
      } else if (isDir(path)) {
        own = read(join(path, 'SKILL.md'))
        real = own
      }
      if (own === undefined) continue
      const meta = frontmatter(own)
      const skillName = meta.name
      if (!skillName || !SKILL_NAME.test(skillName) || seen.has(skillName)) continue
      seen.add(skillName)
      if (meta['user-invocable'] === 'false') continue
      const source = frontmatter(real)
      const extra = overlay[source.name ?? skillName] ?? overlay[skillName] ?? {}
      const hint = source['argument-hint'] || extra.hint
      if (!hint) continue
      found.push({ name: skillName, hint, description: shorten(extra.summary || (source.description ?? meta.description)) })
    }
  }
  return found
}

function userMessage(text) {
  return Object.freeze({
    role: 'user',
    id: randomUUID(),
    content: Object.freeze([Object.freeze({ type: 'text', text })]),
    source: Object.freeze({ kind: 'user' }),
  })
}

export function skillLine(skillName, rawInput) {
  const args = String(rawInput ?? '').trim()
  return args === '' ? `/${skillName}` : `/${skillName} ${args}`
}

export function apply(ctx, config = {}) {
  const roots = Array.isArray(config?.roots) && config.roots.length > 0 ? config.roots : DEFAULT_ROOTS
  for (const skill of discover(roots, loadOverlay(config?.overlay ?? DEFAULT_OVERLAY))) {
    try {
      ctx.commands.register({
        name: skill.name,
        description: `스킬 · ${skill.description}`,
        input: { hint: skill.hint },
        handler: ({ agent, rawInput }) => {
          try {
            agent.steer(userMessage(skillLine(skill.name, rawInput)))
          } catch (error) {
            return { kind: 'error', text: `/${skill.name} 실행 실패: ${error instanceof Error ? error.message : String(error)}` }
          }
          return { kind: 'success', text: `/${skill.name} 스킬을 불러옵니다.` }
        },
      })
    } catch {
      // 같은 이름의 호스트 명령이 이미 있으면 그 명령을 그대로 둔다.
    }
  }
}
