/**
 * Generate tier-0 identity stubs from PLDB (plan §3, §6.1).
 *
 * PLDB (https://pldb.io) is a public-domain compilation of programming-language
 * data. It is used here as a **candidate generator, never as a citation**: it
 * tells us which names exist and where their homepages claim to be, and every
 * one of those claims is either verified (`homepage`, by a live fetch) or dropped.
 *
 * Three filters, and each exists because of a specific hazard:
 *
 *   1. `isLanguage === true` and an in-scope `primaryTag`. PLDB also catalogues
 *      compilers, protocols, libraries and OSes; importing those would violate
 *      the skill's "do not stub a library, framework, tool, or data format" rule.
 *   2. ASCII name with a non-empty slug. The `name` field is lint-checked
 *      ASCII-only, and `#` names have no generic slug rule (`SLUG_OVERRIDES` is a
 *      schema decision), so those are reported rather than guessed.
 *   3. No slug collision with the corpus or within the batch. A duplicate `name`
 *      crashes the dev build via the UNIQUE index.
 *
 * `homepage` is deliberately NOT taken from PLDB. PLDB's `website` is a claim by
 * a secondary source; the skill's rule is that a stub carries a homepage "only
 * when a page already opened in this session attests it". So the import writes
 * `title` + `name` + the exempt seed body, and `scripts/check-homepages.mjs`
 * adds a homepage only after a live fetch proves identity (§6.5 gap 2).
 *
 * Usage:
 *   node scripts/import-pldb.mjs                      # dry run, prints the plan
 *   node scripts/import-pldb.mjs --max-rank 500      # limit by PLDB salience
 *   node scripts/import-pldb.mjs --max-rank 500 --write   # create the files
 *   node scripts/import-pldb.mjs --fetch              # re-download pldb.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ROOT } from './lib/taxonomy-vocab.mjs'
import { slugify, needsSlugOverride } from './lib/slugify.mjs'

const PLDB_URL = 'https://pldb.io/pldb.json'
const CACHE = '/tmp/pldb.json'
const CONTENT = resolve(ROOT, 'content/languages')

/**
 * PLDB `primaryTag` values that map to a `kind` this corpus supports.
 *
 * Excluded, with the reason: `compiler`, `interpreter`, `library`, `framework`,
 * `os`, `application`, `staticSiteGenerator`, `editor`, `packageManager`,
 * `protocol`, `characterEncoding`, `textEncodingFormat`, `barCodeFormat`,
 * `timeFormat`, `diffFormat`, `dataVis` — these are tools or artefacts, not
 * language-like rows. Including them would fill the corpus with things the
 * language-entry skill explicitly refuses to stub.
 */
const IN_SCOPE = new Set([
  'pl', 'esolang', 'queryLanguage', 'dataNotation', 'textMarkup',
  'stylesheetLanguage', 'template', 'hardwareDescriptionLanguage', 'idl',
  'assembly', 'grammarLanguage', 'visual', 'notation', 'diagramLang',
  'contractLanguage', 'dataFlow', 'schema', 'bytecode', 'ir', 'standard',
  'musicalNotation', 'numeralSystem', 'equation', 'shadingLanguage', 'isa',
  'plzoo', 'yamlFormat', 'xmlFormat', 'jsonFormat', 'textDataFormat',
  'configFormat', 'wikiMarkup', 'headerLang', 'dataValidationLanguage'
])

/** The exact seed body scripts/lint-body.mjs exempts. One extra word and the
 *  file becomes a prose entry owing the full four-section skeleton. */
const seed = name => `TODO: Write the wiki article for **${name}**.`

function loadPldb({ fetch: doFetch }) {
  if (doFetch || !existsSync(CACHE)) {
    if (!doFetch && !existsSync(CACHE)) {
      console.error(`no cached PLDB at ${CACHE}; re-run with --fetch`)
      process.exit(2)
    }
    console.log(`downloading ${PLDB_URL} …`)
    // Synchronous on purpose: this is a one-shot import script and a partial
    // download is worse than a slow one.
    const { execFileSync } = require('node:child_process')
    execFileSync('curl', ['-sSfL', PLDB_URL, '-o', CACHE], { stdio: 'inherit' })
  }
  return JSON.parse(readFileSync(CACHE, 'utf8'))
}

function existingSlugs() {
  return new Set(
    readdirSync(CONTENT).filter(f => f.endsWith('.md')).map(f => f.slice(0, -'.md'.length))
  )
}

function existingNames() {
  const names = new Map()
  for (const file of readdirSync(CONTENT)) {
    if (!file.endsWith('.md')) continue
    const raw = readFileSync(join(CONTENT, file), 'utf8')
    const name = raw.match(/^name:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim()
    if (name) names.set(name.toLowerCase(), file)
  }
  return names
}

function main() {
  const args = process.argv.slice(2)
  const get = flag => {
    const i = args.indexOf(flag)
    return i === -1 ? null : args[i + 1]
  }
  const write = args.includes('--write')
  // The plan's first batch (§3) required a website, which cut 4,071 eligible rows
  // to ~1,363 and kept the review diff to a sitting. That filter is a *scope*
  // choice, not a correctness one — a stub with no homepage is a valid row — so it
  // is opt-in rather than implicit.
  const requireWebsite = args.includes('--require-website')
  const maxRank = get('--max-rank') ? Number(get('--max-rank')) : Infinity
  const limit = get('--limit') ? Number(get('--limit')) : Infinity

  const all = loadPldb({ fetch: args.includes('--fetch') })
  const languages = all.filter(o => o.isLanguage === true && IN_SCOPE.has(o.primaryTag))

  const knownNames = existingNames()
  const takenSlugs = existingSlugs()

  const eligible = []
  const rejected = { nonAscii: [], emptySlug: [], overrideNeeded: [], duplicate: [], noWebsite: [], outOfBatch: [] }

  // Sorted by rank (PLDB's salience ordering) so `--limit` takes the most notable
  // first. `pldbScore` is useless here: it is above 10 for every one of the 4,400
  // in-scope rows, so it does not discriminate.
  const sorted = languages.slice().sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9))

  for (const o of sorted) {
    const name = String(o.name ?? '').trim()
    if (!name) continue
    if ((o.rank ?? Infinity) > maxRank) continue

    if (knownNames.has(name.toLowerCase())) {
      rejected.duplicate.push(name)
      continue
    }
    if (!/^[\x20-\x7e]+$/.test(name)) {
      rejected.nonAscii.push(name)
      continue
    }
    if (needsSlugOverride(name)) {
      // `#` has no generic rule; adding an override is a schema decision.
      rejected.overrideNeeded.push(name)
      continue
    }
    const slug = slugify(name)
    if (!slug) {
      rejected.emptySlug.push(name)
      continue
    }
    if (takenSlugs.has(slug)) {
      rejected.outOfBatch.push(`${name} -> ${slug}`)
      continue
    }
    if (requireWebsite && !o.website) {
      rejected.noWebsite.push(name)
      continue
    }

    takenSlugs.add(slug)
    eligible.push({ name, slug, rank: o.rank, website: o.website ?? null, appeared: o.appeared ?? null })
    if (eligible.length >= limit) break
  }

  const byBand = [100, 250, 500, 1000, 1500, Infinity].map(b => ({
    band: b === Infinity ? 'all' : `<= ${b}`,
    count: eligible.filter(e => (e.rank ?? Infinity) <= b).length
  }))

  console.log(`PLDB in-scope languages        ${languages.length}`)
  console.log(`already in the corpus          ${rejected.duplicate.length}`)
  console.log(`ELIGIBLE (ascii+slug+unique)   ${eligible.length}`)
  if (requireWebsite) console.log('  (website required)')
  else {
    const withSite = eligible.filter(e => e.website).length
    console.log(`  of those, PLDB lists a website  ${withSite}`)
    console.log('  pass --require-website for the plan\'s narrower first batch')
  }
  console.log()
  console.log('rejected:')
  for (const [k, v] of Object.entries(rejected)) {
    if (!v.length) continue
    console.log(`  ${k.padEnd(16)} ${String(v.length).padStart(4)}  ${v.slice(0, 5).join(', ')}${v.length > 5 ? ' …' : ''}`)
  }
  console.log()
  console.log('eligible by PLDB rank:')
  for (const b of byBand) console.log(`  ${b.band.padEnd(8)} ${b.count}`)

  if (!write) {
    console.log()
    console.log('first 15 by rank (dry run — pass --write to create files):')
    for (const e of eligible.slice(0, 15)) {
      console.log(`  ${String(e.rank).padStart(4)}  ${e.name.padEnd(24)} /languages/${e.slug}`)
    }
    console.log()
    console.log('no homepage is written: PLDB\'s `website` is a secondary claim.')
    console.log('run scripts/check-homepages.mjs afterwards to add verified ones.')
    return
  }

  mkdirSync(CONTENT, { recursive: true })
  let created = 0
  for (const e of eligible) {
    const path = join(CONTENT, `${e.slug}.md`)
    if (existsSync(path)) continue
    // `title` mirrors `name`; both ASCII-only. Omit homepage: it is added only
    // after a live identity check (§6.5 gap 2).
    const front = [
      '---',
      `title: "${e.name}"`,
      `name: "${e.name}"`,
      '---',
      seed(e.name),
      ''
    ].join('\n')
    writeFileSync(path, front)
    created++
  }
  console.log()
  console.log(`created ${created} stub file(s) in content/languages/`)

  // Record the source revision so a later run can tell whether the input moved.
  const meta = {
    source: PLDB_URL,
    captured: new Date().toISOString(),
    maxRank: maxRank === Infinity ? null : maxRank,
    created,
    eligible: eligible.length
  }
  writeFileSync(resolve(ROOT, 'scripts/.pldb-import.json'), JSON.stringify(meta, null, 2) + '\n')
  console.log('wrote scripts/.pldb-import.json')
}

main()
