/**
 * Wire-level helpers for the Brave Web Search API.
 *
 * This module deliberately has no DSH imports so it can be unit-tested with
 * plain Node before the bundle is installed into the Host process.
 */

const DEFAULT_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search'
const DEFAULT_COUNT = 8
const MAX_COUNT = 20

/** Normalize the bundle's YAML config into stable provider settings. */
export function normalizeSettings(config = {}) {
  const rawCount = Number(config.count)
  const count = Number.isInteger(rawCount) && rawCount > 0 ? Math.min(rawCount, MAX_COUNT) : DEFAULT_COUNT
  const safeSearch = ['off', 'moderate', 'strict'].includes(config.safeSearch) ? config.safeSearch : 'moderate'
  return {
    endpoint: typeof config.endpoint === 'string' && config.endpoint.trim() !== '' ? config.endpoint.trim() : DEFAULT_ENDPOINT,
    apiKeyEnv: typeof config.apiKeyEnv === 'string' && config.apiKeyEnv.trim() !== '' ? config.apiKeyEnv.trim() : 'BRAVE_API_KEY',
    apiKeyFile: typeof config.apiKeyFile === 'string' && config.apiKeyFile.trim() !== '' ? config.apiKeyFile.trim() : '~/.dsh/brave-api-key',
    count,
    country: typeof config.country === 'string' && config.country.trim() !== '' ? config.country.trim() : undefined,
    searchLang: typeof config.searchLang === 'string' && config.searchLang.trim() !== '' ? config.searchLang.trim() : undefined,
    uiLang: typeof config.uiLang === 'string' && config.uiLang.trim() !== '' ? config.uiLang.trim() : undefined,
    safeSearch
  }
}

/** Build the Brave Web Search request URL, honoring DSH's per-call result bound. */
export function buildSearchUrl(settings, request) {
  const url = new URL(settings.endpoint)
  const requested = Number(request?.maxResults)
  const count = Number.isInteger(requested) && requested > 0 ? Math.min(requested, MAX_COUNT) : settings.count
  url.searchParams.set('q', String(request?.query ?? ''))
  url.searchParams.set('count', String(count))
  url.searchParams.set('text_decorations', 'false')
  url.searchParams.set('safesearch', settings.safeSearch)
  if (settings.country !== undefined) url.searchParams.set('country', settings.country)
  if (settings.searchLang !== undefined) url.searchParams.set('search_lang', settings.searchLang)
  if (settings.uiLang !== undefined) url.searchParams.set('ui_lang', settings.uiLang)
  return url
}

/** Map Brave's `web.results` into DSH's normalized search sources. */
export function mapBraveResponse(data) {
  const results = Array.isArray(data?.web?.results) ? data.web.results : []
  const sources = []
  const seen = new Set()
  for (const item of results) {
    if (item === null || typeof item !== 'object') continue
    if (typeof item.url !== 'string' || item.url.length === 0 || seen.has(item.url)) continue
    seen.add(item.url)
    const source = { url: item.url }
    if (typeof item.title === 'string' && item.title.length > 0) source.title = item.title
    if (typeof item.description === 'string' && item.description.length > 0) source.snippet = stripHtml(item.description)
    if (typeof item.page_age === 'string' && item.page_age.length > 0) source.publishedAt = item.page_age
    sources.push(source)
  }
  return { sources, truncated: false }
}

/** Turn Brave's decorated description into plain text for the model. */
export function stripHtml(value) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
