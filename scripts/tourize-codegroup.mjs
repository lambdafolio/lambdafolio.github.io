// One-shot migration: wrap every prose-bearing entry's `## Code` section in
// the standard ::code-group template (per owner rule: consistent template
// application), and normalize slot tags to plural.
// Usage: node scripts/tourize-codegroup.mjs
//
// NOTE: captions are Nuxt UI callouts now ("::note" ... "::"), not
// "Caption:" lines — see scripts/migrate-captions-to-callouts.mjs. A
// callout must sit OUTSIDE the group: inside, ProseCodeGroup swallows it
// as a tab slot and the tab strip loses its labels.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANG_DIR = join(ROOT, 'content', 'languages')
const TODO_RE = /^TODO: Write the wiki article for \*\*.+\*\*\.\s*$/

// skip entries already fully conforming with their own multi-tab structure
const SKIP = new Set(['javascript.md'])

const TAG_MAP = [
  [/`primitive:`/g, '`primitives`'],
  [/`idiom:`/g, '`idioms`'],
  [/primitive\/combination\/abstraction\/idiom\b/g, 'primitives/combination/abstraction/idioms'],
  [/label the slot: primitive\/combination\/abstraction\/idiom/g, 'label the slot (plural tags)'],
]

const files = readdirSync(LANG_DIR).filter(f => f.endsWith('.md')).sort()
let changed = []

for (const f of files) {
  const raw = readFileSync(join(LANG_DIR, f), 'utf8')
  if (SKIP.has(f)) continue
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!fmMatch) continue
  const body = raw.slice(fmMatch[0].length)
  if (body.trim().length === 0 || TODO_RE.test(body.trim())) continue
  if (!/^## Code/m.test(body)) continue

  // locate ## Code section extents
  const lines = body.split('\n')
  let codeIdx = -1
  let nextIdx = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '## Code') codeIdx = i
    else if (codeIdx >= 0 && /^## /.test(lines[i])) { nextIdx = i; break }
  }
  if (codeIdx < 0) continue
  const before = lines.slice(0, codeIdx)
  const codeLines = lines.slice(codeIdx + 1, nextIdx)
  const after = lines.slice(nextIdx)

  if (codeLines.some(l => l.includes('::code-group'))) continue // already wrapped

  // strip blank lines at both ends of the section, split blocks vs captions
  while (codeLines.length && codeLines[0].trim() === '') codeLines.shift()
  while (codeLines.length && codeLines[codeLines.length - 1].trim() === '') codeLines.pop()

  // group: blank line, then contiguous non-blank runs — but blank lines
  // INSIDE a fenced block do NOT split runs (fence-state aware)
  const runs = []
  let cur = []
  let inFence = false
  for (const l of codeLines) {
    const opensFence = /^```/.test(l.trim())
    if (opensFence) inFence = !inFence // fence open then close
    if (l.trim() === '' && !inFence) { if (cur.length) runs.push(cur); cur = [] }
    else cur.push(l)
  }
  if (cur.length) runs.push(cur)
  if (runs.length === 0) continue

  // caption runs (a "::note" callout) vs block runs (start with ```)
  // merge blocks with their following caption into sections
  const isCallout = (l) => /^::(note|tip|warning|caution|callout)\b/.test(l.trim())
  const sections = []
  for (const run of runs) {
    if (run[0].startsWith('```')) sections.push({ block: run, captions: [] })
    else if (sections.length) sections[sections.length - 1].captions.push(...run)
    else sections.push({ block: null, captions: [...run] }) // stray prose before first block
  }

  const out = ['', '::code-group']
  for (const s of sections) {
    if (!s.block) continue
    // pluralize any [primitive] / [idiom] fence labels
    const block = s.block.map(l =>
      l.replace(/\[(idiom)\]/i, '[idioms]').replace(/\[(primitive)\]/i, '[primitives]'))
    if (out.length > 2) out.push('') // blank line between tabs
    out.push(...block)
  }
  // trailing captions (callouts) after the last block go OUTSIDE the group
  const lastCaptions = sections[sections.length - 1]?.captions ?? []
  out.push('::')
  for (const c of lastCaptions) out.push('', c)

  const newCode = [...before, '## Code', ...out, ...after]
  let result = newCode.join('\n')

  // pluralize caption tags in the rest of the body
  for (const [re, rep] of TAG_MAP) result = result.replace(re, rep)

  result = `${fmMatch[0]}${result}`
  writeFileSync(join(LANG_DIR, f), result, 'utf8')
  changed.push(f)
}

console.log(`wrapped ${changed.length} file(s) in ::code-group:`)
console.log(changed.map(c => `  content/languages/${c}`).join('\n'))