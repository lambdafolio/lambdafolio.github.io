// Final conversion pass: for every prose-bearing entry whose Code section has
// fenced blocks but NO ::code-group wrapper, add the wrapper around the
// blocks (closer before the concluding caption). Also drop leftover caption
// tag prefixes (they live in tab labels now) and add tab labels per block:
//   1 block  -> [abstraction] only when the caption had no tag knowledge;
//   multiple -> assign slots by caption tag order, else primitives/...
// Simple rule: first block [primitives], last [idioms], middle blocks share
// [combination]/[abstraction] in order. Owner can refine per-file later.
//
// NOTE: captions are Nuxt UI callouts now ("::note" ... "::"), not
// "Caption:" lines — see scripts/migrate-captions-to-callouts.mjs. A callout
// must sit OUTSIDE the group: inside, ProseCodeGroup swallows it as a tab
// slot and the tab strip loses its labels.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANG_DIR = join(ROOT, 'content', 'languages')
const files = readdirSync(LANG_DIR).filter(f => f.endsWith('.md')).sort()
const FENCE = /^```/
const fixed = []

for (const f of files) {
  const raw = readFileSync(join(LANG_DIR, f), 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) continue
  const [, fm, body] = m
  if (!/^## Code/m.test(body)) continue
  const lines = body.split('\n')
  let si = -1, ni = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '## Code') si = i
    else if (si >= 0 && /^## /.test(lines[i])) { ni = i; break }
  }
  if (si < 0) continue
  const code = lines.slice(si + 1, ni)
  if (code.some(l => l.includes('::code-group'))) continue // already wrapped
  if (!code.some(l => FENCE.test(l))) continue

  // collect blocks + captions; strip stray '::' lines
  const sections = []
  let cur = null
  let inFence = false
  for (const l of code) {
    const t = l.trim()
    if (FENCE.test(t)) {
      if (!inFence) { cur = { block: [l], label: extractLabel(l), captions: [] }; sections.push(cur) }
      else { if (!cur) { cur = { block: [], label: null, captions: [] }; sections.push(cur) } cur.block.push(l) }
      inFence = !inFence
      continue
    }
    if (t === '::') continue
    if (cur) cur.captions.push(l)
  }
  if (sections.length === 0) continue

  // assign tab labels per block
  const n = sections.length
  const LABELS = n === 1
    ? ['abstraction']
    : n === 2 ? ['primitives', 'abstraction']
    : n === 3 ? ['primitives', 'combination', 'abstraction']
    : ['primitives', 'combination', 'abstraction', 'idioms']
  // but a slot tag on a caption wins
  sections.forEach((s, i) => {
    const cap = s.captions.join(' ')
    const tm = cap.match(/Caption: (\w+):/)
    s.label = tm ? pluralize(tm[1]) : LABELS[Math.min(i, LABELS.length - 1)]
  })

  const out = ['', '::code-group']
  sections.forEach((s, i) => {
    if (i > 0) out.push('')
    const block = s.block.map(l => {
      if (!FENCE.test(l.trim())) return l
      return l.trim().replace(/^(\`\`\`\w+)[^\n]*$/, `$1 [${s.label}]`)
    })
    out.push(...block)
  })
  out.push('::', '')
  // concluding caption (tag-free) from the last block's captions
  const lastCaps = sections[sections.length - 1].captions
    .map(c => c.replace(/^Caption:\s*\w+:\s*/i, 'Caption: ').trim())
    .filter(c => c.length)
  out.push(...lastCaps)

  const newCode = out
  if (newCode.length && newCode[newCode.length - 1].trim() !== '') newCode.push('')

  const newBody = [...lines.slice(0, si + 1), ...newCode, ...lines.slice(ni)]
  writeFileSync(join(LANG_DIR, f), `---\n${fm}\n---\n${newBody.join('\n')}`, 'utf8')
  fixed.push(`${f} (${sections.length} block${sections.length > 1 ? 's' : ''})`)
}

function extractLabel(line) {
  const mm = line.match(/\[([^\]]*)\]/)
  return mm ? mm[1].trim() : null
}
function pluralize(tag) {
  const t = tag.toLowerCase()
  if (t === 'primitive' || t === 'primitives') return 'primitives'
  if (t === 'idiom' || t === 'idioms') return 'idioms'
  return t
}
console.log(fixed.length ? `wrapped:\n${fixed.map(x => '  ' + x).join('\n')}` : 'nothing to wrap')