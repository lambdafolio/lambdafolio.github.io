// https://nuxt.com/docs/api/configuration/nuxt-config
// Node built-ins are used below (fs/path/url); the generated node tsconfig
// ships empty `types`, so reference them explicitly.
/// <reference types="node" />
// Nuxt Studio registers admin routes for the dev-mode editor; production
// editing requires SSR server routes (OAuth) which GitHub Pages cannot serve.
// Register Studio in dev only to keep the static bundle clean.
const isDev = process.env.NODE_ENV === 'development'

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

const configDir = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(configDir, 'content')

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

  // GitHub Pages organization site, served from the domain root:
  // https://lambdafolio.github.io/ — no `baseURL` prefix.
  app: {
    head: {
      htmlAttrs: { lang: 'en-US' }
    }
  },

  // Canonical origin for sitemap/robots (site-config composes url + baseURL)
  site: {
    url: 'https://lambdafolio.github.io'
  },

  // Windows workaround for nuxt/nuxt#36467 (Nuxt 4.6.0): Nitro's string-based
  // inline matcher doesn't match backslash paths, leaving the SSR renderer
  // external so prerendering throws "Either manifest or precomputed data must
  // be provided". A regex inline rule matches both separators. Remove once we
  // upgrade to a Nuxt release containing the #36506 hotfix.
  nitro: {
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/]
    }
  },

  // We ship a static robots.txt in public/ that points at the prerendered
  // sitemap rather than letting the module generate one — one less artifact to
  // reconcile when the deployment shape changes.
  robots: {
    robotsTxt: false
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
