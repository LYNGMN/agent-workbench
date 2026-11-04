import { randomUUID } from 'node:crypto'
import { HELP, boost, grillMe, teamwork } from './prompts.js'

/**
 * Antigravity-style /agy commands for DeepSeek Harness.
 *
 * /agy-plan and /agy-goal are thin aliases: they resolve the session's own
 * agent-scoped /plan and /goal definitions and call their handlers, so plan
 * mode and the goal domain keep their exact shipped behavior. The three prompt
 * commands steer one ordinary user message into the agent and let the model use
 * the tools its preset exposes (ask_user_question, subagent, workflow, ...).
 */
export const name = 'agy-commands'
export const inject = ['commands']

const MISSING = (command) =>
  `/${command} is not available in this session's agent preset. ` +
  'Switch to the standard preset (or a preset that mounts it) and try again.'

/** Build the identified, frozen user message the Agent inbox expects. */
function steerMessage(text) {
  return Object.freeze({
    role: 'user',
    id: randomUUID(),
    content: Object.freeze([Object.freeze({ type: 'text', text })]),
    source: Object.freeze({ kind: 'user' }),
  })
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Call the session's own command handler with the same invocation.
 * The outer command owns its lifecycle log; the inner handler owns its domain
 * mutation, so this is a plain handler call rather than a nested registry run.
 */
async function delegate(ctx, invocation, commandName, rawInput) {
  const definition = ctx.commands.find(invocation.agent, commandName)
  if (definition === undefined) return { kind: 'error', text: MISSING(commandName) }
  try {
    return await definition.handler({ ...invocation, rawInput })
  } catch (error) {
    return { kind: 'error', text: `/${commandName} failed: ${messageOf(error)}` }
  }
}

function steer(agent, text) {
  agent.steer(steerMessage(text))
}

function startInterview(invocation, task) {
  try {
    steer(invocation.agent, grillMe(task))
  } catch (error) {
    return { kind: 'error', text: `/agy-grill-me failed: ${messageOf(error)}` }
  }
  return {
    kind: 'success',
    text: task === ''
      ? '요구사항 인터뷰를 시작합니다. 무엇을 할지 먼저 물어봅니다.'
      : '요구사항 인터뷰를 시작합니다. 한 번에 질문 하나씩 진행합니다.',
  }
}

function startBoost(invocation, task) {
  if (task === '') return { kind: 'error', text: 'Usage: /agy-boost <task>' }
  try {
    steer(invocation.agent, boost(task))
  } catch (error) {
    return { kind: 'error', text: `/agy-boost failed: ${messageOf(error)}` }
  }
  return { kind: 'success', text: '심층 다중 에이전트 추론을 시작합니다.' }
}

function startTeamwork(invocation, task) {
  if (task === '') return { kind: 'error', text: 'Usage: /agy-teamwork <task>' }
  try {
    steer(invocation.agent, teamwork(task))
  } catch (error) {
    return { kind: 'error', text: `/agy-teamwork failed: ${messageOf(error)}` }
  }
  return { kind: 'success', text: '장기 다중 에이전트 프로젝트를 시작합니다. 먼저 범위 인터뷰를 진행합니다.' }
}

async function route(ctx, invocation) {
  const input = invocation.rawInput.trim()
  if (input === '' || input.toLowerCase() === 'help') return { kind: 'success', text: HELP }

  const match = /^(\S+)(?:\s+([\s\S]*))?$/u.exec(input)
  const sub = match[1].toLowerCase()
  const rest = (match[2] ?? '').trim()

  switch (sub) {
    case 'plan':
      return delegate(ctx, invocation, 'plan', rest)
    case 'goal':
      return delegate(ctx, invocation, 'goal', rest)
    case 'grill-me':
    case 'grill':
      return startInterview(invocation, rest)
    case 'boost':
      return startBoost(invocation, rest)
    case 'teamwork':
      return startTeamwork(invocation, rest)
    default:
      return { kind: 'error', text: `Unknown /agy subcommand "${sub}".\n\n${HELP}` }
  }
}

export function apply(ctx) {
  ctx.commands.register({
    name: 'agy',
    description: '안티그래비티 스타일 명령 (plan/goal/grill-me/boost/teamwork)',
    input: { hint: '<plan|goal|grill-me|boost|teamwork> [task]' },
    handler: (invocation) => route(ctx, invocation),
  })

  ctx.commands.register({
    name: 'agy-plan',
    description: '계획 모드 전환 — /plan과 동일',
    input: { hint: '[off|message]', attachments: true },
    handler: (invocation) => delegate(ctx, invocation, 'plan', invocation.rawInput.trim()),
  })

  ctx.commands.register({
    name: 'agy-goal',
    description: '장기 목표 생성·관리 — /goal과 동일',
    input: { hint: '[<objective>|clear|edit <objective>|pause|resume]', attachments: true },
    handler: (invocation) => delegate(ctx, invocation, 'goal', invocation.rawInput.trim()),
  })

  ctx.commands.register({
    name: 'agy-grill-me',
    description: '시작 전 요구사항 인터뷰 (한 번에 질문 하나)',
    input: { hint: '[task]' },
    handler: (invocation) => startInterview(invocation, invocation.rawInput.trim()),
  })

  ctx.commands.register({
    name: 'agy-boost',
    description: '어려운 문제를 다중 에이전트로 심층 추론',
    input: { hint: '<task>' },
    handler: (invocation) => startBoost(invocation, invocation.rawInput.trim()),
  })

  ctx.commands.register({
    name: 'agy-teamwork',
    description: '며칠짜리 다중 에이전트 프로젝트 (마일스톤·감사)',
    input: { hint: '<task>' },
    handler: (invocation) => startTeamwork(invocation, invocation.rawInput.trim()),
  })
}
