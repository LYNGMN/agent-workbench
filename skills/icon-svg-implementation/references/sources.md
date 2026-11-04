# Icon Sources

## React Icons

Use React Icons when the project is React or Next.js and needs generic interface icons.

- Docs: `https://react-icons.github.io/react-icons/`
- The bare `https://react-icons.github.io/` path may return 404; use `/react-icons/`.
- Package: `react-icons`
- Import pattern: `import { IconName } from "react-icons/<pack>";`
- Example: `import { LuSearch } from "react-icons/lu";`

Useful packs:

- `lu`: Lucide. Clean default for modern SaaS and dashboard UI.
- `fa6`: Font Awesome 6. Broad coverage, heavier visual personality.
- `hi2`: Heroicons 2. Good with Tailwind-style interfaces.
- `tb`: Tabler Icons. Broad, consistent stroke icon set.
- `si`: Simple Icons. Brand glyphs, but verify brand usage and color needs.

Selection rules:

- Prefer an icon family already used in the project.
- Do not mix filled and outline styles in the same control group unless the UI already establishes that convention.
- Import only named icons that are actually used.
- Check the package is already installed before adding it.

## SVGL

Use SVGL for brand and product logos.

- Site: `https://svgl.app/`
- API base: `https://api.svgl.app`
- Categories: `https://api.svgl.app/categories`
- Search: `https://api.svgl.app?search=<term>`
- Raw SVG: `https://api.svgl.app/svg/<name>.svg`
- Unoptimized raw SVG: `https://api.svgl.app/svg/<name>.svg?no-optimize`

SVGL search responses include:

- `title`: product or logo name.
- `category`: string or array of strings.
- `route`: either a string SVG URL or an object with `light` and `dark`.
- `wordmark`: optional string or light/dark object.
- `url`: product website.

SVGL's site notes that each SVG links to its product and permission may be required before using a logo. Treat this as a brand usage warning: do not imply endorsement, and prefer official brand resources when the app is public-facing or legally sensitive.

## Official Brand Assets

Use official brand assets when:

- The user names a specific company/product and pixel accuracy matters.
- SVGL has no match or only an outdated match.
- The product has strict brand guidelines.
- The use is public-facing, commercial, or high-visibility.

When using official assets, record the source URL in the implementation summary without printing secrets or private tokens.
