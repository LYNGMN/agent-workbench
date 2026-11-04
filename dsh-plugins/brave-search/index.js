import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { buildSearchUrl, mapBraveResponse, normalizeSettings } from './brave-core.js'

/**
 * The provider is deliberately self-contained: linked profile packages do not
 * resolve the installation's @deepseek-ai/* packages from a workspace path.
 * The web seam only needs an object with id/available/search, so a local error
 * type carrying a stable `code` is enough.
 */
class BraveSearchError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'BraveSearchError'
    this.code = code
  }
}

export const inject = ['web']

const PROVIDER_ID = 'brave'
const USER_AGENT = 'dsh-brave-search/0.1.0'

function expandHome(value) {
  if (value === '~') return homedir()
  if (value.startsWith('~/')) return join(homedir(), value.slice(2))
  return isAbsolute(value) ? value : join(homedir(), value)
}

function errorBody(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > 300 ? `${text.slice(0, 300)}…` : text
}

async function resolveApiKey(ctx, settings) {
  const credentials = ctx.get('credentials')
  if (credentials !== undefined) {
    try {
      const hit = await credentials.resolve(settings.apiKeyEnv)
      if (hit?.value) return hit.value
    } catch {
      // An unusable reference or store falls through to the other sources.
    }
  }

  const launchEnvironment = ctx.get('launchEnvironment')
  const fromEnvironment = launchEnvironment?.get?.(settings.apiKeyEnv)?.value ?? process.env[settings.apiKeyEnv]
  if (fromEnvironment) return fromEnvironment

  const file = expandHome(settings.apiKeyFile)
  try {
    const value = (await readFile(file, 'utf8')).trim()
    if (value) return value
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw new BraveSearchError(`Brave Search could not read "${file}": ${error.message}`, 'WEB_PROVIDER_ERROR')
    }
  }

  throw new BraveSearchError(
    `Brave Search has no API key for "${settings.apiKeyEnv}". Store it in ${file} (chmod 600), set ${settings.apiKeyEnv} in the launch environment or ~/.dsh/.env, or add it to the DSH credential store.`,
    'WEB_PROVIDER_CREDENTIAL_MISSING'
  )
}

class BraveSearchProvider {
  constructor(ctx, config) {
    this.ctx = ctx
    this.settings = normalizeSettings(config)
    this.id = PROVIDER_ID
  }

  available() {
    return true
  }

  async search(request, signal) {
    const query = String(request?.query ?? '').trim()
    if (query.length === 0) {
      throw new BraveSearchError('Brave Search requires a non-empty query', 'WEB_PROVIDER_ERROR')
    }
    if (signal?.aborted) throw new BraveSearchError('Brave Search aborted', 'WEB_ABORTED')

    const apiKey = await resolveApiKey(this.ctx, this.settings)
    if (signal?.aborted) throw new BraveSearchError('Brave Search aborted', 'WEB_ABORTED')

    const url = buildSearchUrl(this.settings, { ...request, query })
    let response
    try {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'error',
        signal,
        headers: {
          accept: 'application/json',
          'accept-encoding': 'gzip',
          'x-subscription-token': apiKey,
          'user-agent': USER_AGENT
        }
      })
    } catch (error) {
      if (signal?.aborted) throw new BraveSearchError('Brave Search aborted', 'WEB_ABORTED')
      throw new BraveSearchError(`Brave Search request failed: ${error.message}`, 'WEB_PROVIDER_ERROR')
    }

    if (!response.ok) {
      let body = ''
      try {
        body = await response.text()
      } catch {
        // Keep the status-only diagnostic when the error body cannot be read.
      }
      const detail = errorBody(body)
      const suffix = detail.length > 0 ? `: ${detail}` : ''
      if (response.status === 401 || response.status === 403) {
        throw new BraveSearchError(
          `Brave Search rejected the API key (HTTP ${response.status}). Check the Brave key and its plan.${suffix}`,
          'WEB_PROVIDER_ERROR'
        )
      }
      if (response.status === 429) {
        throw new BraveSearchError(
          `Brave Search rate limit or quota exceeded (HTTP 429). Check the Brave plan and retry later.${suffix}`,
          'WEB_PROVIDER_ERROR'
        )
      }
      throw new BraveSearchError(`Brave Search returned HTTP ${response.status}.${suffix}`, 'WEB_PROVIDER_ERROR')
    }

    let data
    try {
      data = await response.json()
    } catch (error) {
      throw new BraveSearchError(`Brave Search returned an unreadable response: ${error.message}`, 'WEB_PROVIDER_ERROR')
    }

    return mapBraveResponse(data)
  }
}

export function apply(ctx, config = {}) {
  ctx.web.registerSearchProvider(new BraveSearchProvider(ctx, config))
}
