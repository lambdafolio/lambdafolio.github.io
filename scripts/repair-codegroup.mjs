import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANG_DIR = join(ROOT, 'content', 'languages')
const files = readdirSync(LANG_DIR).filter(f => f.endsWith('.md')).sort()
const fixed = []
const FENCE = /^```/

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
  const code = lines.slice(si + 1, ni).filter(l => l.trim() !== '::code-group')

  const byIndex = code
  let changed = false
  const out = []
  let inFence = false
  for (let i = 0; i < byIndex.length; i++) {
    const l = byIndex[i]
    const t = l.trim()
    if (FENCE.test(t)) inFence = !inFence
    // a '::' is a stray when another fence line occurs strictly after it in
    // the section (the genuine group closer has no fence after it)
    if (t === '::') {
      const laterFence = byIndex.slice(i + 1).some(x => FENCE.test(x.trim()))
      if (laterFence) { changed = true; continue }
    }
    if (t === '' && inFence) {
      const prev = out[out.length - 1]
      if (prev !== undefined && prev.trim() === '') { changed = true; continue }
    }
    if (t === '' && !inFence) {
      const prev = out[out.length - 1] ?? ''
      const next = byIndex[i + 1]?.trim() ?? ''
      const prose = (s) => s && !/^(#|```|::)/.test(s)
      if (prose(prev) && prose(next)) { changed = true; continue }
      // a caption is now a callout ("::note" ... "::"), so the line after
      // the group's closer is prose again - drop the blank between them
      if (prev.trim() === '::' && /^::(note|tip|warning|caution|callout)\b/.test(next)) { changed = true; continue }
    }
    out.push(l)
  }

  const newCode = [...out]
  if (newCode.length && newCode[newCode.length - 1].trim() !== '') newCode.push('')

  if (changed) {
    const newBody = [...lines.slice(0, si + 1), ...newCode, ...lines.slice(ni)]
    writeFileSync(join(LANG_DIR, f), `---\n${fm}\n---\n${newBody.join('\n')}`, 'utf8')
    fixed.push(f)
  }
}
console.log(fixed.length ? `fixed:\n${fixed.map(x => '  ' + x).join('\n')}` : 'nothing to fix')