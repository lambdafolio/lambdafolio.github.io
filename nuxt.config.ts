// https://nuxt.com/docs/api/configuration/nuxt-config
// Node built-ins are used below (fs/path/url); the generated node tsconfig
// ships empty `types`, so reference them explicitly.
/// <reference types="node" />
// Nuxt Studio registers admin routes for the dev-mode editor; production
// editing requires SSR server routes (OAuth) which GitHub Pages cannot serve.
// Register Studio in dev only to keep the static bundle clean.
const isDev = process.env.NODE_ENV === 'development'

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

const configDir = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(configDir, 'content')

/** Canonical origin — one source of truth for `site.url` and the feed's absolute links. */
const SITE_URL = 'https://lambdafolio.github.io'

/**
 * Last-commit timestamp per content page, for the feed (server/plugins/feed.ts).
 *
 * The corpus has no `date:`/`updated:` frontmatter and adding one would be a
 * schema change plus per-edit upkeep that authors would forget. Git already
 * records exactly what the feed needs — when a page was added and last touched —
 * so the dates are derived at build time instead of stored.
 *
 * One `git log` pass over `content/`: output is newest-first, so the FIRST line
 * mentioning a path is its latest commit. Keys are route paths (`/languages/lox`)
 * so the plugin can join them against `queryCollection(...).path` without
 * re-deriving slugs.
 *
 * Shallow clones defeat this (only the tip commit is visible), which is why the
 * Pages workflow checks out with `fetch-depth: 0`. When that is missing the map
 * shrinks to a handful of entries; `gitHeadDate()` below then dates the rest so
 * the feed still renders, and the plugin warns.
 */
function contentCommitDates(): Record<string, string> {
  const dates: Record<string, string> = {}
  let log: string
  try {
    log = execFileSync(
      'git',
      ['-c', 'core.quotepath=false', 'log', '--format=@%ct', '--name-only', '--', 'content'],
      { cwd: configDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    )
  } catch {
    // No git binary, no repository, or no history — the plugin falls back.
    return dates
  }

  let stamp = 0
  for (const raw of log.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('@')) {
      stamp = Number(line.slice(1)) || 0
      continue
    }
    if (!stamp || !line.startsWith('content/') || !line.endsWith('.md')) continue
    // `content/<collection>/<slug>.md` -> `/<collection>/<slug>`; keep the first
    // (newest) sighting and skip `index.md`, which has no `/<dir>/index` route.
    const [, collection, file] = line.split('/')
    const slug = file?.slice(0, -'.md'.length)
    if (!collection || !slug || slug === 'index') continue
    const path = `/${collection}/${slug}`
    if (!(path in dates)) dates[path] = new Date(stamp * 1000).toISOString()
  }
  return dates
}

/** Timestamp of the checked-out commit, used only when per-file history is absent. */
function gitHeadDate(): string | undefined {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%ct'], {
      cwd: configDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
    })
    const stamp = Number(out.trim())
    return stamp ? new Date(stamp * 1000).toISOString() : undefined
  } catch {
    return undefined
  }
}

/**
 * Prerender-route discovery for collection pages
 * (docs/knowledgebase-plan.md §4).
 *
 * The homepage renders no global link table (the collection grows unbounded),
 * so default link-crawling never reaches `content/languages/*`. This inline
 * module enumerates the page-collection sources declared in
 * `content.config.ts` and seeds Nitro's prerender route list with every
 * `/<collection>/<slug>` path — no crawling dependency, no homepage payload
 * cost.
 *
 * Discovery is filesystem-based on purpose. An earlier version read the Nuxt
 * Content SQLite dump instead, but that database does not exist yet at
 * `nitro:config` time on a fresh checkout (i.e. on the CI runner), so it fell
 * back to link-crawling and silently omitted the 286 language pages the
 * homepage does not link to. The filesystem is available in every
 * environment, and a page-collection route is `<source dir>/<file stem>`.
 */
function collectionRoutes(): string[] {
  const configFile = resolve(configDir, 'content.config.ts')
  if (!existsSync(configFile)) return []

  // Collection directories, read from the `source: '<dir>/*.md'` globs rather
  // than hard-coded, so a new collection is picked up without editing this
  // file. Non-glob sources are ignored: they do not follow the one-file-per-
  // route shape this module reproduces.
  const dirs = [...readFileSync(configFile, 'utf8').matchAll(
    /source:\s*['"]([\w.-]+)\/\*\.md['"]/g
  )].flatMap(m => (m[1] ? [m[1]] : []))

  const routes: string[] = []
  for (const dir of dirs) {
    const abs = resolve(contentDir, dir)
    if (!existsSync(abs)) continue
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const slug = entry.name.slice(0, -'.md'.length)
      // `index.md` serves the collection root, not `/dir/index`.
      routes.push(slug === 'index' ? `/${dir}` : `/${dir}/${slug}`)
    }
  }
  return routes
}

const nuxtContentPrerenderRoutes = defineNuxtModule({
  meta: { name: 'lambdafolio-prerender-routes' },
  setup(_options, nuxt) {
    const paths = collectionRoutes()
    if (!paths.length) {
      console.warn('[lambdafolio] no content collections found at nitro:config; falling back to crawl-based prerender')
    }

    // The site prefix belongs to `app.baseURL` (empty for a root/org site,
    // `/pl-wiki/` for a GitHub Pages project site), not to this file: prefix
    // with whatever the app is configured with so the route list follows the
    // deployment shape instead of hard-coding a repository name.
    nuxt.hook('nitro:config', (nitroConfig) => {
      if (!paths.length) return
      nitroConfig.prerender ??= {}
      nitroConfig.prerender.routes ??= []
      const base = (nuxt.options.app.baseURL || '/').replace(/\/$/, '')
      for (const p of paths) {
        nitroConfig.prerender.routes.push(`${base}${p}`)
      }
    })
  }
})

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-module-feed',
    ...(isDev ? ['nuxt-studio' as const] : []),
    '@barzhsieh/nuxt-content-mermaid',
    nuxtContentPrerenderRoutes
  ],

  css: ['~/assets/css/main.css'],

  // Build-time facts for the feed (server/plugins/feed.ts). Private runtime
  // config is a build-time constant here, not an env override: it is derived
  // from the checked-out revision, and the static build bakes it in.
  runtimeConfig: {
    // Canonical origin, reused for absolute item links — the same string as
    // `site.url` below, so the two cannot drift.
    siteUrl: SITE_URL,
    // Route path -> ISO timestamp of the page's latest commit.
    contentDates: contentCommitDates(),
    // Used for pages missing from `contentDates` (shallow clone).
    contentDateFallback: gitHeadDate() ?? new Date().toISOString()
  },

  // GitHub Pages organization site, served from the domain root:
  // https://lambdafolio.github.io/ — no `baseURL` prefix.
  app: {
    head: {
      htmlAttrs: { lang: 'en-US' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/icons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/icons/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/icons/apple-touch-icon.png' },
        { rel: 'manifest', href: '/images/icons/site.webmanifest' },
        // Feed discovery: lets readers and browsers find /feed.xml without the
        // visible homepage icon. `@nuxtjs/sitemap`/robots do not emit this.
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'LambdaFolio',
          href: '/feed.xml'
        }
      ]
    }
  },

  // Canonical origin for sitemap/robots (site-config composes url + baseURL)
  site: {
    url: SITE_URL
  },

  // @nuxtjs/robots generates robots.txt at build time, including the
  // `Sitemap:` line from `site.url`. (v6 refused to emit it for base-URL
  // sites, which is why a static public/robots.txt used to be shipped.)
  robots: {
    robotsTxt: true
  },

  // nuxt-module-feed: config lives here (the module has no config-file loader).
  // Items are populated by the feed:generate hook in server/plugins/feed.ts.
  feed: {
    sources: [
      {
        path: '/feed.xml',
        type: 'rss2',
        cacheTime: 60 * 15
      }
    ]
  },

  devtools: { enabled: true },

  // nuxt-studio's module options augment the config type only when the module
  // is in `modules`; with the dev-only conditional spread the key is unknown
  // to the static type, so scope it (runtime behavior unchanged).
  ...(isDev ? { studio: {
    route: '/_studio',
    repository: {
      provider: 'github' as const,
      owner: 'lambdafolio',
      repo: 'lambdafolio.github.io'
    }
  } } : {})
})
