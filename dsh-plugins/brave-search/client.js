/**
 * Browser half of the Brave Search bundle.
 *
 * It adds a "Brave Search" card under Plugins → Built-in plugin settings.
 * The card writes BRAVE_API_KEY through the Host credential service, which the
 * Host half reads on every search; no configuration file or restart is needed.
 */
window.__ModuleLoader__.load({
  id: '@local/brave-search',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'braveSearchSettings'
    const REF = 'BRAVE_API_KEY'

    const en = {
      title: 'Brave Search',
      summary: 'Brave Search API key used by web_search.',
      description: 'The Brave Search provider uses this key for web_search. The key is stored in the DSH credential store and is never shown again.',
      apiKey: 'Brave Search API key',
      placeholder: 'Paste the Brave Search API key',
      hint: 'Get a key from the Brave Search API dashboard:',
      save: 'Save key',
      saving: 'Saving…',
      saved: 'Brave Search API key saved.',
      configured: 'A Brave Search API key is configured.',
      notConfigured: 'No Brave Search API key is configured yet.',
      readOnly: 'This credential store is read-only; the key cannot be saved here.',
      required: 'Enter a Brave Search API key first.',
      failed: 'The key could not be saved.',
      checkFailed: 'The host did not report the key as configured after saving.',
      loadFailed: 'Could not read the current Brave key state. You can still try saving a key.'
    }

    // The Web client currently ships English and Chinese dictionaries. Keep
    // Chinese as an English fallback rather than showing missing-key markers.
    const zh = en

    function BraveSettingsCard(props) {
      const { t, view } = props
      if (view === 'summary') return t('summary')

      const credentials = props.credentials
      const [draft, setDraft] = React.useState('')
      const [configured, setConfigured] = React.useState(false)
      const [writable, setWritable] = React.useState(true)
      const [saving, setSaving] = React.useState(false)
      const [status, setStatus] = React.useState(null)

      React.useEffect(() => {
        let alive = true
        if (!credentials || typeof credentials.describe !== 'function') {
          setWritable(false)
          return () => {
            alive = false
          }
        }
        ;(async () => {
          try {
            const response = await credentials.describe([REF])
            if (!alive) return
            const info = response?.ok ? response.value?.[REF] : undefined
            setConfigured(info?.configured === true)
            setWritable(info?.writable !== false)
          } catch {
            if (alive) setStatus({ kind: 'error', text: t('loadFailed') })
          }
        })()
        return () => {
          alive = false
        }
      }, [credentials])

      const save = async () => {
        const value = draft.trim()
        if (value.length === 0) {
          setStatus({ kind: 'error', text: t('required') })
          return
        }
        if (!credentials || typeof credentials.set !== 'function') {
          setStatus({ kind: 'error', text: t('failed') })
          return
        }
        setSaving(true)
        setStatus(null)
        try {
          const response = await credentials.set(REF, value)
          if (response && response.ok === false) throw new Error(response.message ?? t('failed'))
          const check = await credentials.describe([REF])
          if (!check?.ok || check.value?.[REF]?.configured !== true) throw new Error(t('checkFailed'))
          setConfigured(true)
          setDraft('')
          setStatus({ kind: 'ok', text: t('saved') })
        } catch (error) {
          setStatus({ kind: 'error', text: error?.message ?? t('failed') })
        } finally {
          setSaving(false)
        }
      }

      const labelStyle = {
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--dsw-alias-label-primary, #111827)'
      }
      const hintStyle = {
        margin: 0,
        fontSize: 12,
        lineHeight: 1.5,
        color: 'var(--dsw-alias-label-tertiary, #6b7280)'
      }
      const inputStyle = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid var(--dsw-alias-border-secondary, #d1d5db)',
        background: 'var(--dsw-alias-bg-base, #fff)',
        color: 'var(--dsw-alias-label-primary, #111827)',
        fontSize: 13
      }
      const buttonStyle = {
        justifySelf: 'start',
        padding: '8px 14px',
        borderRadius: 8,
        border: 'none',
        background: 'var(--dsw-alias-brand-primary, #2563eb)',
        color: '#fff',
        fontSize: 13,
        cursor: saving || !writable || draft.trim().length === 0 ? 'default' : 'pointer',
        opacity: saving || !writable || draft.trim().length === 0 ? 0.6 : 1
      }
      const statusStyle = {
        ...hintStyle,
        color: status?.kind === 'ok'
          ? 'var(--dsw-alias-label-success, #15803d)'
          : 'var(--dsw-alias-label-danger, #b91c1c)'
      }

      return h(
        'div',
        { style: { display: 'grid', gap: 10, maxWidth: 640 } },
        h(
          'p',
          { style: { ...hintStyle, fontSize: 13, color: 'var(--dsw-alias-label-secondary, #374151)' } },
          t('description')
        ),
        h('label', { htmlFor: 'brave-search-api-key', style: labelStyle }, t('apiKey')),
        h('input', {
          id: 'brave-search-api-key',
          type: 'password',
          autoComplete: 'new-password',
          value: draft,
          placeholder: t('placeholder'),
          disabled: saving || !writable,
          onChange: (event) => setDraft(event.target.value),
          style: inputStyle
        }),
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
          h(
            'button',
            {
              type: 'button',
              onClick: save,
              disabled: saving || !writable || draft.trim().length === 0,
              style: buttonStyle
            },
            saving ? t('saving') : t('save')
          ),
          h('span', { style: hintStyle }, configured ? t('configured') : t('notConfigured'))
        ),
        status === null
          ? null
          : h('p', { role: 'status', style: statusStyle }, status.text),
        writable ? null : h('p', { style: hintStyle }, t('readOnly')),
        h(
          'p',
          { style: hintStyle },
          t('hint'),
          ' ',
          h(
            'a',
            {
              href: 'https://api-dashboard.search.brave.com/register',
              target: '_blank',
              rel: 'noreferrer',
              style: { color: 'var(--dsw-alias-link, #2563eb)' }
            },
            'api-dashboard.search.brave.com'
          )
        )
      )
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.credentials'],
      apply(ctx) {
        const t = ctx.locale.bind(NS)
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'brave-search-settings: dictionaries')
        // Plugin display metadata renders as one paragraph. Details preserve
        // the bilingual line break; the installed card shows the English first
        // line without an ellipsis because the Korean line is intentionally clipped.
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = 'p[class*="detailDesc"]{white-space:pre-line}[data-plugin-package="@local/agy-commands"] span[class*="cardDesc"],[data-plugin-package="@local/brave-search"] span[class*="cardDesc"]{white-space:pre-line;display:block;max-height:18px;overflow:hidden}'
          document.head.append(style)
          return () => style.remove()
        }, 'brave-search: plugin description line breaks')
        // The Brave Search bundle's own detail page renders this keyed config
        // section, so the key is entered where the installed bundle is shown.
        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: '@local/brave-search',
          locale: NS,
          inject: () => ({ credentials: ctx.remote.credentials })
        }, BraveSettingsCard))
      }
    }
  }
})
