// https://nuxt.com/docs/api/configuration/nuxt-config
// Node built-ins are used below (fs/path/module/url); the generated node
// tsconfig ships empty `types`, so reference them explicitly.
/// <reference types="node" />
// Nuxt Studio registers admin routes for the dev-mode editor; production
// editing requires SSR server routes (OAuth) which GitHub Pages cannot serve.
// Register Studio in dev only to keep the static bundle clean.
const isDev = process.env.NODE_ENV === 'development'

import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

const configDir = dirname(fileURLToPath(import.meta.url))

/**
 * Prerender-route discovery for language and paradigm pages
 * (docs/knowledgebase-plan.md §4).
 *
 * The homepage renders no global link table (the collection grows unbounded),
 * so default link-crawling never reaches `content/languages/*`. This inline
 * module reads the Content SQLite dump (written during build init, before
 * prerendering starts) and seeds Nitro's prerender route list with every
 * `/languages/<slug>` and `/paradigms/<slug>` path — no crawling
 * dependency, no homepage payload cost.
 */
const nuxtContentPrerenderRoutes = defineNuxtModule({
  meta: { name: 'pl-wiki-prerender-routes' },
  setup(_options, nuxt) {
    const dbFile = resolve(configDir, '.data/content/contents.sqlite')
    let paths: string[] = []
    if (existsSync(dbFile)) {
      const Database = createRequire(import.meta.url)('better-sqlite3') as {
        new (file: string, options: { readonly: boolean }): {
          prepare: (sql: string) => { all: () => { path: string }[] }
          close: () => void
        }
      }
      const db = new Database(dbFile, { readonly: true })
      // The collection tables are `_content_<collection>`. Discover them
      // rather than hard-coding one, so a new collection is picked up
      // without editing this file. `_content_info` (the manifest table)
      // matches the pattern but has no `path` column, so filter on the
      // column list rather than on the name.
      const tables = (db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '_content_%'"
      ).all() as unknown as { name: string }[]).map(r => r.name)
      for (const table of tables) {
        // `table` comes from sqlite_master, not user input.
        const columns = db.prepare(`PRAGMA table_info("${table}")`).all() as unknown as { name: string }[]
        if (!columns.some(c => c.name === 'path')) continue
        const rows = db.prepare(`SELECT path FROM "${table}"`).all()
        paths.push(...rows.map(r => r.path))
      }
      db.close()
    } else {
      console.warn('[pl-wiki] content DB not found at nitro:config; falling back to crawl-based prerender')
    }

    nuxt.hook('nitro:config', (nitroConfig) => {
      if (!paths.length) return
      nitroConfig.prerender ??= {}
      nitroConfig.prerender.routes ??= []
      for (const p of paths) {
        nitroConfig.prerender.routes.push(`/pl-wiki${p}`)
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

  // GitHub Pages project site: https://mlhaufe.github.io/pl-wiki/
  app: {
    baseURL: '/pl-wiki/',
    head: {
      htmlAttrs: { lang: 'en-US' }
    }
  },

  // Canonical origin for sitemap/robots (site-config composes url + baseURL)
  site: {
    url: 'https://mlhaufe.github.io'
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

  // The robots module refuses robots.txt generation for base-URL sites (GitHub
  // Pages project pages). We ship a static robots.txt in public/ that points
  // at the prerendered sitemap instead.
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
      owner: 'mlhaufe',
      repo: 'pl-wiki'
    }
  } } : {})
})
