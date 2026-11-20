/**
 * Assertions for scripts/triage-report.mjs and scripts/confirm-submission.mjs.
 *
 * The other test file pins the *checks* (is this vocabulary value legal, is this
 * entry a duplicate). This one pins the *contract*: what state a given proposal
 * produces, what labels travel with it, and what a reply means. That is the seam
 * between the workflow and the scripts, and it is where two of the review's
 * blocking findings lived — a clean parse was being labelled `queued`, and
 * `confirm-needed` was searched for by the expiry job but never applied.
 *
 * Run with `npm run test:triage`.
 */
import assert from 'node:assert/strict'
import { buildReport } from '../triage-report.mjs'
import { classifyReply, composeReparseText } from '../confirm-submission.mjs'
import { loadCorpus } from './triage-checks.mjs'

let pass = 0
function it(name, fn) {
  try {
    fn()
    pass++
    console.log(`  ok    ${name}`)
  } catch (err) {
    console.error(`  FAIL  ${name}`)
    console.error(`        ${err.message}`)
    process.exitCode = 1
  }
}

const corpus = loadCorpus()

/** A real entry with a known scalar, and one with a known list. */
const SCALAR_ENTRY = 'languages/typescript'
const SCALAR_VALUE = 'static'
const LIST_ENTRY = 'languages/agentscript'
const LIST_VALUE = ['agent-based']

const PRIMARY = 'https://www.typescriptlang.org/docs/'

console.log('report contract: state')

it('a clean correction parks at confirm-needed, never queued', () => {
  const r = buildReport({
    kind: 'correction', entry: SCALAR_ENTRY, field: 'typing',
    proposed: 'gradual', sources: [PRIMARY]
  })
  // The single most important assertion in this file: `queued` means a human
  // agreed with the echo, and no human has yet.
  assert.equal(r.verdict, 'queued')
  assert.equal(r.state, 'confirm-needed')
  assert.deepEqual(r.labels, ['confirm-needed', 'has-primary-source'])
})

it('a lead-only request still parks at confirm-needed with the cost label', () => {
  const r = buildReport({
    kind: 'correction', entry: SCALAR_ENTRY, field: 'typing',
    proposed: 'gradual', sources: ['https://en.wikipedia.org/wiki/TypeScript']
  })
  assert.equal(r.state, 'confirm-needed')
  assert.deepEqual(r.labels, ['confirm-needed', 'leads-only'])
})

it('a duplicate never reaches confirm-needed', () => {
  const r = buildReport({ kind: 'new-entry', name: 'C++', sources: ['https://isocpp.org'] })
  assert.equal(r.state, 'duplicate')
  assert.deepEqual(r.labels, ['duplicate'])
})

it('an out-of-vocabulary value needs a curator', () => {
  const r = buildReport({
    kind: 'correction', entry: SCALAR_ENTRY, field: 'typing',
    proposed: 'telepathic', sources: [PRIMARY]
  })
  assert.equal(r.state, 'needs-curator')
  assert.deepEqual(r.labels, ['needs-curator'])
})

it('an unmatched entry is needs-info', () => {
  const r = buildReport({
    kind: 'correction', entry: 'languages/zzqx-absent', field: 'typing',
    proposed: 'static', sources: [PRIMARY]
  })
  assert.equal(r.state, 'needs-info')
})

it('an unclear submission is needs-info and says so', () => {
  const r = buildReport({ kind: 'unclear' })
  assert.equal(r.state, 'needs-info')
  assert.match(r.comment, /could not tell what this is asking for/i)
})

it('every report has a state', () => {
  const proposals = [
    { kind: 'unclear' },
    { kind: 'correction', entry: 'languages/nope', field: 'typing', proposed: 'x' },
    { kind: 'correction', entry: SCALAR_ENTRY, field: 'typing', proposed: 'gradual', sources: [PRIMARY] },
    { kind: 'new-entry', name: 'Zzqx Fresh', sources: ['https://example.org'] },
    { kind: 'new-entry', name: 'C++', sources: ['https://isocpp.org'] }
  ]
  for (const p of proposals) {
    const r = buildReport(p)
    assert.ok(typeof r.state === 'string' && r.state.length > 0, `missing state for ${JSON.stringify(p.kind)}`)
  }
})

console.log('report contract: baseline')

it('a correction records what the entry currently says', () => {
  const r = buildReport({
    kind: 'correction', entry: SCALAR_ENTRY, field: 'typing',
    proposed: 'gradual', sources: [PRIMARY]
  })
  assert.deepEqual(r.baseline, { field: 'typing', value: SCALAR_VALUE })
})

it('an absent field records null, so a first write is not mistaken for a no-op', () => {
  const r = buildReport({
    kind: 'correction', entry: 'languages/cplusplus', field: 'memory',
    proposed: ['gc'], sources: ['https://en.cppreference.com/w/cpp']
  })
  assert.deepEqual(r.baseline, { field: 'memory', value: null })
})

it('a list baseline round-trips', () => {
  const r = buildReport({
    kind: 'correction', entry: LIST_ENTRY, field: 'paradigms',
    proposed: ['agent-based', 'imperative'], sources: ['https://example.org']
  })
  assert.deepEqual(r.baseline, { field: 'paradigms', value: LIST_VALUE })
})

console.log('report contract: no-op')

it('proposing the value already present is reported as a no-op', () => {
  const r = buildReport({
    kind: 'correction', entry: SCALAR_ENTRY, field: 'typing',
    proposed: SCALAR_VALUE, sources: [PRIMARY]
  })
  assert.ok(r.findings.some(f => f.code === 'no-op'))
})

it('proposing a different value is not a no-op', () => {
  const r = buildReport({
    kind: 'correction', entry: SCALAR_ENTRY, field: 'typing',
    proposed: 'gradual', sources: [PRIMARY]
  })
  assert.ok(!r.findings.some(f => f.code === 'no-op'))
})

console.log('reply classification')

it('accepts plain affirmatives', () => {
  for (const reply of ['yes', 'Yes', 'YES!', 'yep', 'correct', 'right', 'lgtm', 'yes thanks']) {
    assert.equal(classifyReply(reply).action, 'confirm', `"${reply}" should confirm`)
  }
})

it('treats a correction as a reparse even when it opens affirmatively', () => {
  // The trap: "yes but ..." carries a correction and must not confirm.
  for (const reply of ['no', 'no, it is the memory field', 'yes but it is Rust', 'wrong', 'it should be gradual']) {
    assert.equal(classifyReply(reply).action, 'reparse', `"${reply}" should reparse`)
  }
})

it('ignores an empty reply', () => {
  for (const reply of ['', '   ', '\n\n']) {
    assert.equal(classifyReply(reply).action, 'ignore', `"${reply}" should be ignored`)
  }
})

it('ignores a reply that is only quoted echo text', () => {
  // Replying *to* the bot's comment quotes it; that is not a reply.
  assert.equal(classifyReply('> I read this as a correction\n').action, 'ignore')
})

it('a quoted echo plus a bare yes still confirms', () => {
  assert.equal(classifyReply('> I read this as a correction\nyes').action, 'confirm')
})

it('composes the original plus the clarification', () => {
  const text = composeReparseText('c++ has no gc', 'actually it is the typing field')
  assert.match(text, /c\+\+ has no gc/)
  assert.match(text, /typing field/)
  // The original must come first: it may carry a URL the reply does not repeat.
  assert.ok(text.indexOf('c++ has no gc') < text.indexOf('typing field'))
})

console.log('workflow label contract')

it('every state label the expiry job searches for is one triage can apply', async () => {
  // `confirm-needed` was searched for by expire.yml while nothing ever applied it,
  // so half the expiry rule was unreachable. This assertion is what would have
  // caught that: the producer and the consumer must agree on the vocabulary.
  const fs = await import('node:fs')
  const expire = fs.readFileSync(
    new URL('../../.github/workflows/expire.yml', import.meta.url), 'utf8'
  )
  const triage = fs.readFileSync(
    new URL('../../.github/workflows/triage.yml', import.meta.url), 'utf8'
  )
  const labels = fs.readFileSync(
    new URL('../../.github/workflows/labels.yml', import.meta.url), 'utf8'
  )

  const searched = [...expire.matchAll(/'([a-z-]+)'/g)]
    .map(m => m[1])
    .filter(n => /^(confirm-needed|needs-info|queued|needs-curator|expired|stale)$/.test(n))

  for (const label of new Set(searched)) {
    if (label === 'expired' || label === 'stale') continue // produced by expire itself
    assert.ok(
      triage.includes(`'${label}'`),
      `expire.yml searches for "${label}" but triage.yml never applies it`
    )
    assert.ok(
      labels.includes(`'${label}'`),
      `"${label}" is not provisioned by labels.yml, so GitHub would drop it silently`
    )
  }
})

it('every label triage applies is provisioned by labels.yml', async () => {
  const fs = await import('node:fs')
  const triage = fs.readFileSync(new URL('../../.github/workflows/triage.yml', import.meta.url), 'utf8')
  const labels = fs.readFileSync(new URL('../../.github/workflows/labels.yml', import.meta.url), 'utf8')

  // Labels triage applies: the `owned` list plus the verdict labels.
  const owned = triage.match(/const owned = \[([\s\S]*?)\]/)?.[1] ?? ''
  const applied = [...owned.matchAll(/'([a-z-]+)'/g)].map(m => m[1])
  applied.push('queued', 'suggestion', 'confirm-needed')

  for (const label of new Set(applied)) {
    assert.ok(labels.includes(`'${label}'`), `"${label}" would be dropped — add it to labels.yml`)
  }
})

console.log(`\n${pass} assertion(s) passed`)
