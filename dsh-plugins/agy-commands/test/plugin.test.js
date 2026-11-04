import assert from 'node:assert/strict'
import test from 'node:test'

import { apply } from '../index.js'

const COMMAND_NAME = /^[a-z][a-z0-9_-]*$/u

function makeHarness(definitions = {}) {
  const registered = new Map()
  const ctx = {
    commands: {
      register(definition) {
        registered.set(definition.name, definition)
      },
      find(agent, name) {
        return agent.definitions[name]
      },
    },
  }

  const agent = {
    steered: [],
    definitions,
    steer(message) {
      this.steered.push(message)
    },
  }

  apply(ctx)

  const invoke = (name, rawInput, extra = {}) => {
    const command = registered.get(name)
    assert.ok(command, `command /${name} is registered`)
    return command.handler({
      commandId: 'cmd-test-1',
      agent,
      rawInput,
      attachments: [],
      signal: new AbortController().signal,
      ...extra,
    })
  }

  return { registered, agent, invoke }
}

test('registers the agy command set with valid names', () => {
  const { registered } = makeHarness()
  assert.deepEqual(
    [...registered.keys()].sort(),
    ['agy', 'agy-boost', 'agy-goal', 'agy-grill-me', 'agy-plan', 'agy-teamwork'],
  )
  for (const name of registered.keys()) assert.match(name, COMMAND_NAME)
})

test('every definition satisfies the host registry contract', () => {
  const { registered } = makeHarness()
  for (const definition of registered.values()) {
    assert.match(definition.name, COMMAND_NAME)
    assert.equal(typeof definition.description, 'string')
    assert.ok(definition.description.trim().length > 0, `${definition.name} has a description`)
    assert.equal(typeof definition.handler, 'function')
    assert.equal(typeof definition.input?.hint, 'string')
    assert.ok(definition.input.hint.trim().length > 0, `${definition.name} has an input hint`)
  }
})

test('/agy without input shows help and lists direct commands', async () => {
  const { invoke } = makeHarness()
  const result = await invoke('agy', '   ')
  assert.equal(result.kind, 'success')
  assert.match(result.text, /\/agy-plan/)
  assert.match(result.text, /\/agy-teamwork/)
})

test('help teaches the recommended sequence and the one-command limit', async () => {
  const { invoke } = makeHarness()
  const { text } = await invoke('agy', '')
  for (const fragment of [
    '추천 시퀀스',
    '한 줄에 명령 하나',
    '/agy-grill-me',
    '/agy-plan',
    '/agy-goal',
    '/agy-teamwork',
    '/agy-boost',
    '자체 범위 인터뷰',
  ]) {
    assert.ok(text.includes(fragment), `help mentions ${fragment}`)
  }
  assert.match(text, /겹쳐 쓰면 두 번째 명령은 계획서 본문/)
})

test('/agy plan delegates to the session plan handler', async () => {
  const seen = []
  const { invoke } = makeHarness({
    plan: {
      handler: (invocation) => {
        seen.push(invocation)
        return { kind: 'success', text: `plan:${invocation.rawInput}` }
      },
    },
  })

  const result = await invoke('agy', 'plan off')
  assert.deepEqual(result, { kind: 'success', text: 'plan:off' })
  assert.equal(seen.length, 1)
  assert.equal(seen[0].commandId, 'cmd-test-1')
})

test('/agy-plan passes the raw input and attachments through', async () => {
  const seen = []
  const { invoke } = makeHarness({
    plan: {
      handler: (invocation) => {
        seen.push(invocation)
        return { kind: 'success', text: 'ok' }
      },
    },
  })
  const attachment = Object.freeze({ type: 'text', text: 'x' })
  await invoke('agy-plan', '  hello world  ', { attachments: [attachment] })

  assert.equal(seen[0].rawInput, 'hello world')
  assert.deepEqual(seen[0].attachments, [attachment])
})

test('/agy-goal delegates clear/pause/resume grammar unchanged', async () => {
  const { invoke } = makeHarness({
    goal: { handler: (invocation) => ({ kind: 'success', text: `goal:${invocation.rawInput}` }) },
  })
  assert.deepEqual(await invoke('agy-goal', ' pause '), { kind: 'success', text: 'goal:pause' })
  assert.deepEqual(await invoke('agy', 'goal'), { kind: 'success', text: 'goal:' })
})

test('a missing plan definition returns a direct error instead of throwing', async () => {
  const { invoke } = makeHarness()
  const result = await invoke('agy-plan', 'off')
  assert.equal(result.kind, 'error')
  assert.match(result.text, /\/plan is not available/)
})

test('a throwing delegated handler becomes a command error', async () => {
  const { invoke } = makeHarness({
    plan: {
      handler: () => {
        throw new Error('boom')
      },
    },
  })
  const result = await invoke('agy-plan', '')
  assert.equal(result.kind, 'error')
  assert.match(result.text, /\/plan failed: boom/)
})

test('/agy-grill-me steers one identified user message', async () => {
  const { invoke, agent } = makeHarness()
  const result = await invoke('agy-grill-me', ' rate limit API ')

  assert.equal(result.kind, 'success')
  assert.equal(agent.steered.length, 1)
  const [message] = agent.steered
  assert.equal(message.role, 'user')
  assert.equal(typeof message.id, 'string')
  assert.equal(message.source.kind, 'user')
  assert.equal(message.content.length, 1)
  assert.match(message.content[0].text, /\[agy-grill-me\]/)
  assert.match(message.content[0].text, /rate limit API/)
  assert.match(message.content[0].text, /ask_user_question/)
  assert.match(message.content[0].text, /Recommended/)
})

test('/agy-grill-me without a task still starts an interview', async () => {
  const { invoke, agent } = makeHarness()
  const result = await invoke('agy-grill-me', '')
  assert.equal(result.kind, 'success')
  assert.equal(agent.steered.length, 1)
})

test('/agy-boost requires a task and steers a multi-agent directive', async () => {
  const { invoke, agent } = makeHarness()
  const empty = await invoke('agy-boost', '')
  assert.equal(empty.kind, 'error')
  assert.equal(agent.steered.length, 0)

  const result = await invoke('agy', 'boost the race in the cache')
  assert.equal(result.kind, 'success')
  assert.equal(agent.steered.length, 1)
  assert.match(agent.steered[0].content[0].text, /\[agy-boost\]/)
  assert.match(agent.steered[0].content[0].text, /subagent 또는 workflow/)
})

test('/agy-teamwork requires a task and steers the project directive', async () => {
  const { invoke, agent } = makeHarness()
  assert.equal((await invoke('agy-teamwork', '   ')).kind, 'error')
  const result = await invoke('agy-teamwork', 'migrate the API')
  assert.equal(result.kind, 'success')
  assert.match(agent.steered[0].content[0].text, /teamwork_projects/)
})

test('an unknown subcommand returns an error and help', async () => {
  const { invoke } = makeHarness()
  const result = await invoke('agy', 'nope')
  assert.equal(result.kind, 'error')
  assert.match(result.text, /Unknown \/agy subcommand "nope"/)
  assert.match(result.text, /\/agy-plan/)
})

test('steer failures surface as command errors', async () => {
  const { invoke, agent } = makeHarness()
  agent.steer = () => {
    throw new Error('inbox closed')
  }
  const result = await invoke('agy-boost', 'x')
  assert.equal(result.kind, 'error')
  assert.match(result.text, /inbox closed/)
})
