#!/usr/bin/env node
/**
 * Generate the page-backed vocabularies from the content collections.
 *
 * Four vocabularies in `app/utils/taxonomy.ts` carry no information the content
 * tree does not already hold: a paradigm, family, generation, or promoted
 * feature key IS the file name of its page in `content/<collection>/`. The
 * hand-maintained arrays were exact mirrors of those directories, so they could
 * only ever be stale copies — and a copy is a bug waiting to happen.
 *
 * This script makes the directories the source of truth: it enumerates
 * `content/{paradigms,families,generations,features}/*.md` and writes the four
 * arrays to `app/data/taxonomy.generated.ts`. `taxonomy.ts` re-exports them, so
 * every consumer (the Zod schema, the lint, the /schema page, Studio) sees one
 * derived list and nobody maintains it by hand.
 *
 * The five *fact axes* (PARADIGMS is derived, but TYPE_SYSTEM / MEMORY /
 * EXECUTION / CONCURRENCY plus KINDS / STATUSES / TYPING are not) stay
 * hand-authored on purpose: they encode sanctioned intent, including values the
 * curated corpus does not yet witness. A closed vocabulary whose members are
 * derived from the corpus it validates cannot judge new entries — the gap
 * between the two is exactly the curation backlog.
 *
 * Usage:
 *   node scripts/generate-taxonomy.mjs           # write the file
 *   node scripts/generate-taxonomy.mjs --check   # exit 1 if it is stale
 *   node scripts/generate-taxonomy.mjs --why     # list what each value witnesses
 */
import { readdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content')
// NOT under app/utils: Nuxt auto-imports that tree, and a generated module
// there would be picked up as a duplicate of the taxonomy.ts re-export.
const OUT = join(ROOT, 'app', 'data', 'taxonomy.generated.ts')

/** collection directory -> exported constant name. */
const DERIVED = [
  { dir: 'paradigms', name: 'PARADIGMS' },
  { dir: 'families', name: 'FAMILIES' },
  { dir: 'generations', name: 'GENERATIONS' },
  { dir: 'features', name: 'FEATURES' }
]

/** Page keys in a collection: the file stems, sorted. */
function keysOf(dir) {
  const abs = join(CONTENT, dir)
  if (!existsSync(abs)) return []
  return readdirSync(abs)
    .filter(f => f.endsWith('.md'))
    .map(f => f.slice(0, -'.md'.length))
    .sort((a, b) => a.localeCompare(b))
}

function render() {
  const lines = [
    '// GENERATED FILE — do not edit. Run `npm run generate:taxonomy`.',
    '//',
    '// These four vocabularies are DERIVED from the content collections: a key is',
    '// the file name of its page, so the directory is the source of truth and this',
    '// list can never drift from what actually has a page.',
    '//',
    '// The fact axes (KINDS, STATUSES, TYPING, TYPE_SYSTEM, MEMORY, EXECUTION,',
    '// CONCURRENCY) stay hand-authored in taxonomy.ts — they encode intent,',
    '// including values the curated corpus does not yet witness.',
    ''
  ]
  for (const { dir, name } of DERIVED) {
    const keys = keysOf(dir)
    lines.push(`/** content/${dir}/*.md — ${keys.length} ${keys.length === 1 ? 'page' : 'pages'} */`)
    if (keys.length === 0) {
      lines.push(`export const ${name} = [] as const`)
    } else {
      lines.push(`export const ${name} = [`)
      for (const k of keys) lines.push(`  '${k}',`)
      lines.push('] as const')
    }
    lines.push('')
  }
  return lines.join('\n')
}

const wanted = render()

if (process.argv.includes('--why')) {
  for (const { dir, name } of DERIVED) {
    const keys = keysOf(dir)
    console.log(`\n${name} (${keys.length}) from content/${dir}/`)
    for (const k of keys) console.log(`  ${k}`)
  }
  console.log('')
  process.exit(0)
}

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
  if (current !== wanted) {
    console.error(
      'taxonomy.generated.ts is stale — run `npm run generate:taxonomy`.\n' +
      'The page-backed vocabularies are derived from content/, so a hand edit to\n' +
      'this file is always overwritten; add or remove a page instead.'
    )
    process.exit(1)
  }
  console.log('taxonomy.generated.ts is up to date')
  process.exit(0)
}

writeFileSync(OUT, wanted, 'utf8')
const summary = DERIVED.map(({ dir, name }) => `${name}=${keysOf(dir).length}`).join('  ')
console.log(`wrote app/data/taxonomy.generated.ts  (${summary})`)
