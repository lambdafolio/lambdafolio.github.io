/**
 * Body lint for content/{languages,paradigms,features}/*.md — the prose-skeleton
 * drift control (docs/knowledgebase-plan.md; normative spec in
 * .github/skills/language-entry/references/contract.md §Prose).
 *
 * Skeleton (normative order):
 *   ## Overview   ≤ 60 words, 2 sentences
 *   ## Code       the "language tour": 1–4 fenced blocks, 4–20 lines each,
 *                 ≤ 45 tour lines total; fence language present; slot tags
 *                 (PLURAL form: primitives/combination/abstraction/idioms)
 *                 in ::code-group tab labels or in per-block captions
 *   ## Distinctive traits   3–6 bullets, ≤ 25 words each
 *   ## Status     ≤ 40 words
 *   ## History    optional; ≤ 80 words
 *
 * Errors: missing required section, out-of-order section, missing/oversized
 * code blocks, > 4 blocks, > 45 tour lines (10% grace), bullets out of range,
 * H1 in body, broken internal cross-link, prose link to an aggregator
 * (Wikipedia et al. — same rule as `references`).
 * Warnings: word-count near-cap (within 20% of a cap), untagged code caption,
 * caption carrying multiple slot tags, prose with no hyperlink at all,
 * declared-but-unwitnessed `features` (see featureWitnessed).
 *
 * TODO stubs (bodies that are exactly the conversion seed) are exempt.
 *
 * Usage: node scripts/lint-body.mjs [--fix]
 *   --fix inserts the skeleton into prose-less entries? No: fix mode only
 *   normalizes heading order/marker style. Content decisions stay human.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

// The content collections that carry prose. Languages, paradigms, and
// features follow the same skeleton (docs/knowledgebase-plan.md §5, control 3),
// so one lint implements it. Families are prose pages WITHOUT the code tour — a
// family is lineage, not a language, so there is no idiomatic program to walk —
// so they opt out of the skeleton but keep the link rules.
const COLLECTIONS = [
  { key: 'languages', dir: join(ROOT, 'content', 'languages'), label: 'content/languages' },
  { key: 'paradigms', dir: join(ROOT, 'content', 'paradigms'), label: 'content/paradigms' },
  { key: 'features', dir: join(ROOT, 'content', 'features'), label: 'content/features' },
  { key: 'families', dir: join(ROOT, 'content', 'families'), label: 'content/families', skeleton: false }
]

const SKELETON = ['Overview', 'Code', 'Distinctive traits', 'Status', 'History']
const REQUIRED = new Set(['Overview', 'Code', 'Distinctive traits', 'Status'])

const CAPS = { Overview: 60, Status: 40, History: 80 }
const BULLET_WORDS = 25
const BULLETS = { min: 3, max: 6 }
// The code tour: slots (primitives / combinations / abstractions / idioms) are
// content, blocks are presentation — see contract.md §The code tour.
// Slot tags are PLURAL, per the owner's rule (they name *a section* of the
// tour, not one example); singular forms were a batch-one oversight.
const CODE = { minLines: 4, maxLines: 20, maxBlocks: 4, tourTotal: 45, tourGrace: 1.1 }
const SLOT_TAGS = ['primitives', 'combinations', 'abstractions', 'idioms']

// Slug sets per collection, for cross-link resolution (a paradigm body may
// link to a language entry and vice versa).
const SLUGS = new Map(
  COLLECTIONS.map(c => [c.key, new Set(readdirSync(c.dir).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, '')))])
)

const TODO_RE = /^TODO: Write the wiki article for \*\*.+\*\*\.\s*$/

let errors = 0
let warnings = 0
const perFile = []

function wc(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Read a 2-space-indented quoted string list out of a frontmatter block.
 * Deliberately minimal: the corpus serialization is fixed (lint-frontmatter
 * owns the canonical form), so this only needs to read what `--fix` writes.
 */
function fmArray(fm, key) {
  const block = fm.match(new RegExp(`^${key}:\\n((?:  - "[^"]*"\\n?)+)`, 'm'))
  if (!block) return []
  return [...block[1].matchAll(/"([^"]*)"/g)].map(x => x[1])
}

/**
 * Witness matching for the `features` coverage rule.
 *
 * A feature is "witnessed" when the prose names it: either the whole kebab
 * phrase ("pattern matching"), one of its distinctive segments
 * ("closure", "prototype"), or a known synonym for the mechanism
 * ("regular expression" for a `regex` tag). This is a heuristic, not a proof —
 * which is why the finding is a warning: it points a human at the entries
 * whose frontmatter claims more than their prose shows.
 */
const FEATURE_SYNONYMS = {
  'regex': ['regular expression', 'regular-expression'],
  'pattern-matching': ['match', 'matching', 'destructuring'],
  'first-class-functions': ['first-class', 'first class', 'function value', 'higher-order'],
  'closures': ['closure', 'captured', 'capture'],
  'prototypes': ['prototype', 'delegation'],
  'modules': ['module', 'import', 'namespace'],
  'macros': ['macro'],
  'reflection': ['reflect'],
  'lazy-evaluation': ['lazy', 'thunk'],
  'dependent-types': ['dependent type', 'dependent-type']
}

const stem = (word) => word.toLowerCase().replace(/(ies)$/, 'y').replace(/(es|s)$/, '')

function featureWitnessed(feature, prose) {
  const hay = prose.toLowerCase().replace(/[`*_]/g, '')
  const phrase = feature.replace(/-/g, ' ')
  if (hay.includes(feature) || hay.includes(phrase)) return true
  for (const syn of FEATURE_SYNONYMS[feature] ?? []) {
    if (hay.includes(syn)) return true
  }
  // distinctive segments: "first-class-functions" is witnessed by "functions"
  // or "closures"-style stems; skip short/stopword segments
  return feature.split('-').some((part) => {
    const s = stem(part)
    return s.length >= 4 && new RegExp(`\\b${s}`).test(hay)
  })
}

// Flat list of every prose-bearing candidate across all collections.
const ENTRIES = COLLECTIONS.flatMap(collection =>
  readdirSync(collection.dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => ({ collection, file: f, path: join(collection.dir, f), rel: `${collection.label}/${f}` }))
)

for (const { collection, file: f, path, rel } of ENTRIES) {
  const raw = readFileSync(path, 'utf8')

  // split frontmatter vs body
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) continue // frontmatter lint reports this
  const body = raw.slice(m[0].length)

  if (body.trim().length === 0 || TODO_RE.test(body.trim())) continue // stub: exempt

  const fileIssues = []
  // Families opt out of the code-tour skeleton (§Prose is a language contract);
  // they still get heading sanity, link integrity, and feature witnesses.
  const wantSkeleton = collection.skeleton !== false

  // H1 in body
  if (/^# /m.test(body)) {
    fileIssues.push(['error', 'H1 in body (title is rendered by the page component)', 0])
  }

  // headings (##, ###) in order
  const headings = []
  const lines = body.split('\n')
  const sectionRanges = new Map()
  let current = null
  let currentStart = 0
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^## (.+)$/)
    if (h) {
      if (current) sectionRanges.set(current, [currentStart, i])
      current = h[1].trim()
      currentStart = i + 1
      headings.push(current)
    }
  }
  if (current) sectionRanges.set(current, [currentStart, lines.length])

  const sectionText = (name) => {
    const range = sectionRanges.get(name)
    if (!range) return ''
    return lines.slice(range[0], range[1]).join('\n')
  }

  // order check among known skeleton sections
  const present = headings.filter(h => SKELETON.includes(h))
  const knownPositions = present.map(h => SKELETON.indexOf(h))
  let inOrder = true
  for (let i = 1; i < knownPositions.length; i++) {
    if (knownPositions[i] < knownPositions[i - 1]) inOrder = false
  }
  if (present.length && inOrder) {
    // in order
  } else if (present.length && !inOrder) {
    fileIssues.push(['error', `section order wrong: got [${present.join(', ')}], expected skeleton order`, 0])
  }
  if (wantSkeleton) {
    for (const h of headings) {
      if (!SKELETON.includes(h)) {
        fileIssues.push(['error', `unknown section heading "## ${h}" (skeleton: ${SKELETON.join(', ')})`, 0])
      }
    }

    // required sections
    for (const s of REQUIRED) {
      if (!headings.includes(s)) fileIssues.push(['error', `missing required section "## ${s}"`, 0])
    }

    // prose presence in required sections
    for (const s of ['Overview', 'Status']) {
      if (headings.includes(s) && wc(sectionText(s)) === 0) {
        fileIssues.push(['error', `"## ${s}" has no content`, 0])
      }
    }
  }

  // word caps (warn within 20%, error beyond)
  const checkCap = (section, cap) => {
    if (!headings.includes(section)) return
    const n = wc(sectionText(section))
    if (n > cap * 1.2) {
      fileIssues.push(['error', `"## ${section}" is ${n} words (cap ${cap})`, n])
    } else if (n > cap) {
      fileIssues.push(['warn', `"## ${section}" is ${n} words (cap ${cap}, +20% grace)`, n])
    }
  }
  for (const [s, cap] of Object.entries(CAPS)) {
    if (wantSkeleton) checkCap(s, cap)
  }

  // Code section: the language tour — fences, language, block sizes,
  // tour-line totals, slot tags (code-group tab labels or captions)
  if (wantSkeleton && headings.includes('Code')) {
    const codeBody = sectionText('Code')
    const blockRe = /```([\w+-]*)(?:[ \t]+\[([^\]]*)\])?[ \t]*\r?\n([\s\S]*?)```/g
    const splitRe = /```[\w+-]*(?:[ \t]*\[[^\]]*\])?[\s\S]*?```/g
    const blocks = [...codeBody.matchAll(blockRe)]
      .map(m => ({ lang: m[1], label: (m[2] ?? '').trim(), lines: m[3].replace(/\n$/, '').split('\n') }))
    // residues: preface + text between blocks + concluding text; MDC wrapper
    // lines (::code-group, ::) are wrappers, not captions
    const residues = codeBody.split(splitRe)
    // A caption is now a Nuxt UI callout ("::note" ... "::"), not a
    // "Caption:" line. The wrapper lines themselves are not content.
    const CALLOUT_OPEN = /^::(note|tip|warning|caution|callout)\b/
    const captionLines = (s) => s
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('::') && !CALLOUT_OPEN.test(l))
    const findTags = (text) => {
      // count how many DIFFERENT slot tags occur
      const found = []
      for (const t of SLOT_TAGS) {
        const re = new RegExp(`(^|\\W)${t}:`, 'i')
        const bare = new RegExp(`(^|\\W)${t}(\\b|$)`, 'i')
        if (re.test(text) || bare.test(text.replace(/:/g, ''))) found.push(t)
      }
      return [...new Set(found)]
    }
    const tagShapeError = (text, where) => {
      // singular/hybrid forms are the historical oversight — require plural
      const singular = SLOT_TAGS.map(t => t.slice(0, -1))
        .filter(t => new RegExp(`(^|\\W)${t}:`, 'i').test(text) && !new RegExp(`(^|\\W)${t}s:`, 'i').test(text))
      return singular
    }
    if (blocks.length === 0) {
      fileIssues.push(['error', '"## Code" has no fenced code block', 0])
    } else {
      if (blocks.length > CODE.maxBlocks) {
        fileIssues.push(['error', `"## Code" has ${blocks.length} blocks (max ${CODE.maxBlocks})`, blocks.length])
      }
      let tourLines = 0
      for (const b of blocks) {
        if (!b.lang) fileIssues.push(['error', 'code block missing fence language', 0])
        if (b.label) {
          const tags = findTags(b.label.replace(/:/g, ''))
          if (tags.length === 0) {
            fileIssues.push(['warn', `tab label "[${b.label}]" lacks a slot tag (${SLOT_TAGS.join('/')})`, 0])
          } else if (tags.length > 1) {
            fileIssues.push(['error', `tab label "[${b.label}]" carries multiple slot tags (${tags.join(', ')}) — one tag per tab`, 0])
          } else {
            const singular = tagShapeError(b.label, 'tab label')
            if (singular.length) {
              fileIssues.push(['error', `tab label "[${b.label}]" uses singular slot tag (${singular.join(', ')}) — use plural form (${SLOT_TAGS.join('/')})`, 0])
            }
            const labelNorm = b.label.toLowerCase().trim()
            if (labelNorm !== tags[0]) {
              fileIssues.push(['warn', `tab label "[${b.label}]" ≠ bare plural tag "${tags[0]}" — prefer the bare tag for consistency`, 0])
            }
          }
        }
        const n = b.lines.length
        tourLines += n
        if (n < CODE.minLines || n > CODE.maxLines) {
          fileIssues.push(['error', `code block (${b.lang || 'no fence'}) has ${n} lines (allowed ${CODE.minLines}–${CODE.maxLines})`, n])
        }
      }
      // tour lines = in-code lines + caption lines; 10% grace before an error
      const tourTotal = tourLines + residues.flatMap(captionLines).length
      const hardCap = Math.round(CODE.tourTotal * CODE.tourGrace)
      if (tourTotal > hardCap) {
        fileIssues.push(['error', `"## Code" tour is ${tourTotal} lines (allowed ≤ ${hardCap}: blocks + captions under contract)`, tourTotal])
      } else if (tourTotal > CODE.tourTotal) {
        fileIssues.push(['warn', `"## Code" tour is ${tourTotal} lines (target ≤ ${CODE.tourTotal}, +10% grace)`, tourTotal])
      }
      // concluding caption after the last block
      const finalCaptions = captionLines(residues[residues.length - 1] ?? '')
      if (finalCaptions.length === 0) {
        fileIssues.push(['warn', '"## Code" has no caption after the code (state what to notice)', 0])
      }
      // slot tags: code-group tab labels when present; otherwise one tag per caption
      if (!blocks.some(b => b.label)) {
        for (const seg of residues.slice(1)) {
          const lines = captionLines(seg)
          if (lines.length === 0) continue
          const segText = lines.join(' ')
          const tags = findTags(segText)
          if (tags.length === 0) {
            fileIssues.push(['warn', `caption lacks a slot tag (${SLOT_TAGS.join('/')}) — label what the block demonstrates`, 0])
          } else if (tags.length > 1) {
            fileIssues.push(['error', `caption carries multiple slot tags (${tags.join(', ')}) — one tag per caption`, 0])
          } else {
            const singular = tagShapeError(segText, 'caption')
            if (singular.length) {
              fileIssues.push(['error', `caption uses singular slot tag (${singular.join(', ')}) — use plural form (${SLOT_TAGS.join('/')})`, 0])
            }
          }
        }
      }
    }
  }

  // Distinctive traits: bullet count + per-bullet caps
  if (wantSkeleton && headings.includes('Distinctive traits')) {
    const traitLines = sectionText('Distinctive traits').split('\n').filter(l => l.trim().startsWith('-'))
    if (traitLines.length < BULLETS.min || traitLines.length > BULLETS.max) {
      fileIssues.push(['error', `"## Distinctive traits" has ${traitLines.length} bullets (allowed ${BULLETS.min}–${BULLETS.max})`, traitLines.length])
    }
    for (const line of traitLines) {
      const n = wc(line.replace(/^\s*-\s*/, ''))
      if (n > BULLET_WORDS * 1.4) {
        fileIssues.push(['error', `trait bullet is ${n} words (cap ${BULLET_WORDS}): "${line.trim().slice(0, 60)}…"`, n])
      } else if (n > BULLET_WORDS) {
        fileIssues.push(['warn', `trait bullet is ${n} words (cap ${BULLET_WORDS}, +40% grace)`, n])
      }
    }
  }

  // internal cross-links resolve: /languages/<slug>, /paradigms/<slug>,
  // /features/<slug>, and /families/<slug> must exist in that collection.
  for (const link of body.matchAll(/\]\/(languages|paradigms|features|families)\/([^)]+)\)/g)) {
    const [, target, slug] = link
    const known = SLUGS.get(target)
    if (!known?.has(slug)) {
      fileIssues.push(['error', `cross-link to /${target}/${slug} does not exist`, 0])
    }
  }

  // Hyperlink rules (owner rule, Nov 2026). Prose is the *reading layer*: the
  // terms it names and the claims it attributes must be one click from their
  // source. Two failure modes are worth a gate:
  //   1. a prose entry with no link at all — the article hides its evidence;
  //   2. a link to an aggregator (Wikipedia et al.) — same rule as
  //      `references`: it is a research guide, never the citation.
  // Coverage is a WARNING while the pre-2026 backlog is retrofitted (the same
  // grandfathering as missing `references`); aggregator links are an error
  // because the corpus has none — a new one is always a regression.
  const proseLinks = [...body.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1])
  if (proseLinks.length === 0) {
    fileIssues.push(['warn', 'prose has no hyperlinks — link the named mechanisms to their source docs and cross-link sibling entries', 0])
  }
  for (const href of proseLinks) {
    const host = /^https?:\/\//.test(href) ? href.replace(/^https?:\/\/([^/?#]+).*/, '$1') : ''
    if (host && /(^|\.)(wikipedia|wikimedia|wikibooks|wikidata)\.org$/.test(host)) {
      fileIssues.push(['error', `prose links to aggregator "${host}" — link the primary page it led you to instead`, 0])
    }
  }

  // Feature coverage ("never overlook a core feature", made checkable): every
  // value the frontmatter claims must be witnessed somewhere in the prose —
  // the tour, a trait, or the callout. Unwitnessed claims are the failure mode
  // where an entry advertises a mechanism it never shows. Warning only: the
  // matcher is heuristic, and the pre-2026 backlog is grandfathered.
  const declaredFeatures = fmArray(m[1], 'features')
  if (declaredFeatures.length) {
    const unseen = declaredFeatures.filter(feat => !featureWitnessed(feat, body))
    if (unseen.length) {
      fileIssues.push([
        'warn',
        `${unseen.length}/${declaredFeatures.length} declared feature(s) never appear in the prose: ${unseen.join(', ')} — show it in the tour/traits, or drop it from frontmatter`,
        0
      ])
    }
  }

  errors += fileIssues.filter(i => i[0] === 'error').length
  warnings += fileIssues.filter(i => i[0] === 'warn').length
  if (fileIssues.length) perFile.push([rel, fileIssues])
}

for (const [rel, issues] of perFile) {
  console.log(`\n${rel}`)
  for (const [kind, msg, n] of issues) {
    const line = kind === 'error' ? console.error : console.warn
    line(`  ${kind === 'error' ? '✖' : '⚠'} ${msg}`)
    void n
  }
}

const totalFiles = ENTRIES.length
console.log(`\n${totalFiles} files, ${errors} error(s), ${warnings} warning(s)${perFile.length ? ` in ${perFile.length} prose-bearing file(s)` : ' (all prose-bearing files conform)'}`)
if (errors > 0) {
  console.error('body lint FAILED')
  process.exit(1)
}
console.log('body lint OK')