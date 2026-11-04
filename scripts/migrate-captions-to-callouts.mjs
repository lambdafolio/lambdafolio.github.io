// Migrate the "Caption:" convention to Nuxt UI callouts.
//
// A caption becomes:
//   ::note
//   <prose without the "Caption:" prefix>
//   ::
// placed AFTER the ::code-group. A callout INSIDE a group is swallowed as a
// tab slot by ProseCodeGroup, which corrupts the tab strip (verified: the
// tabs become "primitives, 1, 2, 3" instead of the slot labels).
//
// Rules:
//  - The "Caption:" prefix and any slot tag ("abstractions: ...") are dropped;
//    the tab labels already carry the slot.
//  - Captions that sit BETWEEN blocks inside a group are hoisted out and
//    merged into ONE concluding note (per-block captions are unreachable
//    once the group is closed).
//  - A group missing its "::" closer is repaired - a latent bug that leaked
//    prose into the tab strip (goose rendered 9 tabs, clu 6).
//  - A standalone block (no ::code-group) keeps its shape: the note goes
//    directly after the last block.
//
// The section is rebuilt from parsed BLOCKS (fenced code + caption runs),
// not by line surgery, so an unclosed group and a caption in any position
// are both handled.
//
// Usage: node scripts/migrate-captions-to-callouts.mjs [--dry]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const DRY = process.argv.includes('--dry')

const files = []
for (const dir of ['content/languages', 'content/paradigms']) {
  for (const f of readdirSync(join(ROOT, dir)).filter(f => f.endsWith('.md')).sort()) {
    files.push(join(dir, f))
  }
}

const SLOT = '(primitives|combinations|abstractions|idioms|primitive|combination|abstraction|idiom)'

/** Strip the "Caption:" prefix and a leading slot tag from a caption run. */
function captionToProse(lines) {
  const text = lines
    .map(l => l.replace(/^\s*Caption:\s*/, '').trim())
    .join('\n')
    .trim()
  return text.replace(new RegExp('^' + SLOT + '\\s*[:\\-\\u2013]\\s*', 'i'), '')
}

/**
 * Turn one caption run into prose. The slot tag is dropped (the tab labels
 * carry it) and the sentences are rewrapped so several runs do not run
 * together mid-sentence.
 *
 * Wrapping must not split an inline code span (`` `/ 'e` ``) — those are
 * atomic tokens, so the wrapper works on runs of text and code spans rather
 * than on whitespace.
 */
function runToProse(lines) {
  const text = captionToProse(lines).replace(/\s+/g, ' ').trim()
  // capitalize the first letter when a tag was stripped off the front
  const body = text.charAt(0).toUpperCase() + text.slice(1)
  // split into tokens, keeping inline code spans intact
  const tokens = body.match(/`[^`]*`|\S+/g) ?? []
  const out = []
  let line = ''
  for (const t of tokens) {
    if (line && (line + ' ' + t).length > 78) { out.push(line); line = t }
    else line = line ? line + ' ' + t : t
  }
  if (line) out.push(line)
  // continuation lines of a list item are indented by two spaces
  return out.map((l, i) => (i === 0 ? l : '  ' + l)).join('\n')
}

/**
 * Parse the Code section into an ordered list of items:
 *   { kind: 'block', lines }   a fenced code block
 *   { kind: 'caption', lines }  a caption run (with its wrapped continuations)
 *   { kind: 'other', lines }    anything else (blank lines, '::', prose)
 */
function parseItems(section) {
  const items = []
  let i = 0
  while (i < section.length) {
    const line = section[i]
    const t = line.trim()
    if (/^```/.test(t)) {
      const block = [line]
      i++
      while (i < section.length && !/^```/.test(section[i].trim())) { block.push(section[i]); i++ }
      if (i < section.length) { block.push(section[i]); i++ }
      items.push({ kind: 'block', lines: block })
      continue
    }
    if (t.startsWith('Caption:')) {
      const cap = [line]
      i++
      // wrapped continuation lines belong to the caption
      while (i < section.length) {
        const nt = section[i].trim()
        if (!nt || /^```/.test(nt) || nt === '::' || nt === '::code-group' || nt.startsWith('Caption:')) break
        cap.push(section[i]); i++
      }
      items.push({ kind: 'caption', lines: cap })
      continue
    }
    // a run of other lines
    const other = []
    while (i < section.length) {
      const nt = section[i].trim()
      if (/^```/.test(nt) || nt.startsWith('Caption:')) break
      other.push(section[i]); i++
    }
    items.push({ kind: 'other', lines: other })
  }
  return items
}

function migrate(body) {
  const lines = body.split('\n')
  const ci = lines.findIndex(l => l.trim() === '## Code')
  if (ci < 0) return { body, changed: false, notes: ['no ## Code section'] }
  let ni = lines.length
  for (let i = ci + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i].trim())) { ni = i; break }
  }
  const section = lines.slice(ci + 1, ni)
  const items = parseItems(section)
  if (!items.some(it => it.kind === 'caption')) {
    return { body, changed: false, notes: ['no captions'] }
  }

  const eol = lines[ci].endsWith('\r') ? '\r' : ''
  const notes = []

  // --- does the section use a code-group? ------------------------------
  const hasGroup = items.some(it => it.kind === 'other' && it.lines.some(l => l.trim() === '::code-group'))

  let out = []
  const captionRuns = [] // prose per caption run, in document order

  if (hasGroup) {
    // locate the group span in the item list
    const openIdx = items.findIndex(it => it.kind === 'other' && it.lines.some(l => l.trim() === '::code-group'))
    const lastBlockIdx = items.map((it, i) => (it.kind === 'block' ? i : -1)).filter(i => i >= 0).pop()
    const closeIdx = items.findIndex((it, i) => i > lastBlockIdx && it.kind === 'other' && it.lines.some(l => l.trim() === '::'))
    const groupEnd = closeIdx >= 0 ? closeIdx : items.length
    const wasClosed = closeIdx >= 0
    if (!wasClosed) notes.push('repaired unclosed ::code-group')

    // items before the group
    for (let i = 0; i < openIdx; i++) {
      if (items[i].kind === 'caption') { captionRuns.push(runToProse(items[i].lines)); continue }
      out.push(...items[i].lines)
    }

    // the group opener (keep any lines of the 'other' item around it)
    const opener = items[openIdx].lines
    const openLine = opener.find(l => l.trim() === '::code-group')
    // a blank line separates the "## Code" heading from the group opener
    // (MD022); `out` starts empty because the heading was sliced off.
    if (out.length === 0 || out[out.length - 1].trim() !== '') out.push('')
    out.push(openLine)
    // any extra lines in the opener item before the open marker
    const oi = opener.indexOf(openLine)
    out.push(...opener.slice(0, oi))

    // group contents: blocks (and their in-group captions are hoisted)
    let inGroupCaptions = 0
    let blockNo = 0
    for (let i = openIdx + 1; i < groupEnd; i++) {
      const it = items[i]
      if (it.kind === 'caption') { captionRuns.push(runToProse(it.lines)); inGroupCaptions++; continue }
      if (it.kind === 'other') {
        // drop a stray closer inside the span (we emit our own)
        const kept = it.lines.filter(l => l.trim() !== '::')
        if (kept.length) out.push(...kept)
        continue
      }
      // a block with no tab label would render as an unnamed tab; give it
      // the next slot name so every tab in the strip carries a label.
      const first = it.lines[0]
      if (!/\[[^\]]*\]/.test(first)) {
        const SLOT_NAMES = ['primitives', 'combinations', 'abstractions', 'idioms']
        const label = SLOT_NAMES[Math.min(blockNo, SLOT_NAMES.length - 1)]
        it.lines = [first.replace(/^(\s*```[\w+-]*)/, `$1 [${label}]`), ...it.lines.slice(1)]
        notes.push(`labeled an unnamed code block as [${label}]`)
      }
      blockNo++
      out.push(...it.lines)
    }
    if (inGroupCaptions) notes.push(inGroupCaptions + ' per-block caption(s) merged into the concluding note')

    // a blank line separates the last fence from the group's closer (MD031)
    if (out.length && out[out.length - 1].trim() !== '') out.push('')
    out.push('::' + eol)

    // items after the group: captions are hoisted, the rest is kept
    for (let i = wasClosed ? groupEnd + 1 : groupEnd; i < items.length; i++) {
      const it = items[i]
      if (it.kind === 'caption') { captionRuns.push(runToProse(it.lines)); continue }
      out.push(...it.lines)
    }
  } else {
    // Standalone block form: the contract wants EVERY prose entry wrapped in
    // a ::code-group, so wrap the blocks and label them by slot. The slot
    // name comes from the caption that followed the block (it carried the
    // tag); a block with no such caption gets the next free slot name.
    const SLOT_NAMES = ['primitives', 'combinations', 'abstractions', 'idioms']
    const used = new Set()
    // a caption's slot tag, if it had one
    const slotOf = (lines) => {
      const t = lines.map(l => l.replace(/^\s*Caption:\s*/, '')).join(' ')
      const m = t.match(new RegExp('^(' + SLOT + ')\\s*[:\\-\\u2013]', 'i'))
      return m ? m[1].toLowerCase() : null
    }
    const kept = []
    for (const it of items) {
      if (it.kind === 'caption') { captionRuns.push(runToProse(it.lines)); kept.push(it); continue }
      kept.push(it)
    }
    // label each block from the caption that follows it
    const blocks = kept.filter(it => it.kind === 'block')
    for (let i = 0; i < blocks.length; i++) {
      const it = blocks[i]
      const first = it.lines[0]
      if (/\[[^\]]*\]/.test(first)) continue
      // find the next caption after this block
      const bi = kept.indexOf(it)
      let tag = null
      for (let j = bi + 1; j < kept.length; j++) {
        if (kept[j].kind === 'caption') { tag = slotOf(kept[j].lines); break }
        if (kept[j].kind === 'block') break
      }
      if (!tag) {
        const free = SLOT_NAMES.find(s => !used.has(s))
        tag = free || 'abstractions'
      }
      used.add(tag)
      it.lines = [first.replace(/^(\s*```[\w+-]*)/, `$1 [${tag}]`), ...it.lines.slice(1)]
      notes.push(`labeled an unnamed code block as [${tag}]`)
    }
    // rebuild: a blank line, then the opener, a blank, the blocks, closer
    out = []
    out.push('')
    out.push('::code-group' + eol)
    let firstBlock = true
    for (const it of kept) {
      if (it.kind !== 'block') continue
      if (firstBlock) out.push('')
      else out.push('')
      firstBlock = false
      out.push(...it.lines)
    }
    out.push('', '::' + eol)
  }

  // each caption run becomes one paragraph of the note. A callout's slot
  // is `mdc-unwrap="p"`, so two plain paragraphs would concatenate with no
  // separator — a markdown list renders as separate items instead.
  // (markdownlint wants the list surrounded by blank lines: MD032.)
  const paragraphs = captionRuns.filter(Boolean)
  const prose = paragraphs.length > 1
    ? '\n' + paragraphs.map(p => `- ${p.split('\n').join('\n  ')}`).join('\n') + '\n'
    : paragraphs.join('\n')
  if (!prose.trim()) return { body, changed: false, notes: ['empty caption prose'] }

  // collapse blank-line runs left behind by the removed captions
  const collapsed = []
  for (const l of out) {
    if (l.trim() === '' && collapsed.length && collapsed[collapsed.length - 1].trim() === '') continue
    collapsed.push(l)
  }
  out = collapsed

  // the note replaces the trailing blank run and is placed after the code
  while (out.length && out[out.length - 1].trim() === '') out.pop()
  out.push('', '::note', ...prose.split('\n'), '::', '')

  const newBody = [...lines.slice(0, ci + 1), ...out, ...lines.slice(ni)]
  return { body: newBody.join('\n'), changed: true, notes }
}

let changedCount = 0
for (const rel of files) {
  const path = join(ROOT, rel)
  const raw = readFileSync(path, 'utf8')
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) continue
  const body = raw.slice(m[0].length)
  if (!/^Caption:/m.test(body)) continue

  const res = migrate(body)
  if (!res.changed) {
    console.log(`skip    ${rel}  (${res.notes.join('; ')})`)
    continue
  }
  changedCount++
  console.log(`migrate ${rel}  ${res.notes.join('; ')}`)
  if (!DRY) writeFileSync(path, raw.slice(0, m[0].length) + res.body, 'utf8')
}
console.log(`\n${changedCount} file(s) ${DRY ? 'would be ' : ''}migrated`)
