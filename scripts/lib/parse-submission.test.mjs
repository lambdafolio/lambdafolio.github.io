/**
 * Assertions for scripts/parse-submission.mjs — the model-facing half.
 *
 * This file exists because its absence shipped a real defect: `normalise()` had
 * `entry: null` hardcoded and never read `src.entry`, so every correction arrived
 * with a null entry and triage answered `needs-info` for all of them. The triage
 * suite could not catch it — it consumes a hand-written proposal — and no type
 * checker could either, because `null` is a legal value for that field.
 *
 * Two kinds of assertion here:
 *   - pure logic (normalise, missingKeys, prompts) — no network
 *   - `--live` behaviour, gated on OLLAMA_API_KEY, which proves the *model*
 *     obeys the shape it is given. Offline CI skips those.
 *
 * Run with `npm run test:parser`.
 */
import assert from 'node:assert/strict'
import {
  PROPOSAL_KEYS, normalise, missingKeys, requestProposal,
  systemPrompt, responseSkeleton, repairPrompt
} from '../parse-submission.mjs'
import { checkNewEntry, loadCorpus } from './triage-checks.mjs'

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

/** A model response in exactly the shape the prompt asks for. */
const FULL = {
  kind: 'correction',
  entry: 'languages/cplusplus',
  field: 'memory',
  proposed: 'manual',
  name: 'C++',
  aliases: null,
  sources: ['https://en.cppreference.com/w/cpp'],
  rationale: 'Disputes the memory value.'
}

console.log('normalise: every key survives')

it('reads entry, not just field — the regression this file exists for', () => {
  const p = normalise(FULL, corpus)
  // The shipped bug: entry was hardcoded null, so resolution never ran.
  assert.equal(p.entry, 'languages/cplusplus')
})

it('passes through every scalar', () => {
  const p = normalise(FULL, corpus)
  assert.equal(p.kind, 'correction')
  assert.equal(p.field, 'memory')
  // `memory` is a list field, so a scalar is wrapped — see the coercion block.
  assert.deepEqual(p.proposed, ['manual'])
  assert.equal(p.name, 'C++')
  assert.equal(p.rationale, 'Disputes the memory value.')
})

it('filters non-http sources', () => {
  const p = normalise({ ...FULL, sources: ['https://ok.example', 'ftp://no.example', 'not a url'] }, corpus)
  assert.deepEqual(p.sources, ['https://ok.example'])
})

it('coerces an unknown kind to unclear rather than trusting it', () => {
  assert.equal(normalise({ ...FULL, kind: 'opinion' }, corpus).kind, 'unclear')
})

it('survives a non-object response', () => {
  for (const bad of [null, [], 'text', 42]) {
    const p = normalise(bad, corpus)
    assert.equal(p.kind, 'unclear')
    assert.equal(p.entry, null)
  }
})

console.log('normalise: resolution and reclassification')

it('resolves a bare slug the model returned', () => {
  assert.equal(normalise({ ...FULL, entry: 'cplusplus' }, corpus).entry, 'languages/cplusplus')
})

it('resolves a language name', () => {
  assert.equal(normalise({ ...FULL, entry: 'C++' }, corpus).entry, 'languages/cplusplus')
})

it('drops an entry slug that is not in the corpus', () => {
  assert.equal(normalise({ ...FULL, entry: 'languages/zzqx-nope' }, corpus).entry, null)
})

it('keeps a new-entry naming an existing language as new-entry, for triage to answer', () => {
  // This used to become a *fieldless correction*, which is self-contradictory:
  // a correction needs a field, so triage could only reply "I could not tell
  // which field this corrects" to a request that had been unambiguous. The
  // right answer is triage's `duplicate` verdict, and it needs the request to
  // stay a new-entry carrying a `name` for `checkNewEntry` to match against.
  const p = normalise({ ...FULL, kind: 'new-entry', entry: null, name: 'C++', field: null }, corpus)
  assert.equal(p.kind, 'new-entry')
  assert.equal(p.name, 'C++')
})

it('the duplicate answer comes from triage, not from the parser', () => {
  const p = normalise({ ...FULL, kind: 'new-entry', entry: null, name: 'C++', field: null }, corpus)
  const { findings } = checkNewEntry({ name: p.name, sources: p.sources })
  assert.ok(findings.some(f => f.code === 'duplicate'))
})

it('leaves a genuinely new name as new-entry', () => {
  const p = normalise({ ...FULL, kind: 'new-entry', entry: null, name: 'Zzqx Fresh', field: null }, corpus)
  assert.equal(p.kind, 'new-entry')
  assert.equal(p.entry, null)
})

console.log('normalise: kind is reconciled against the payload')

// The exact shape the model returned for a bare name ("Datalog"), which is a
// language that already has a row. `field: null` and `kind: "correction"` cannot
// both be true, so the label has to yield to the evidence.
const bareName = {
  ...FULL,
  kind: 'correction',
  entry: 'languages/datalog',
  field: null,
  proposed: null,
  name: 'Datalog',
  rationale: 'The submission requests an entry for the language Datalog.'
}

it('a correction with no field is not a correction', () => {
  const p = normalise(bareName, corpus)
  assert.notEqual(p.kind, 'correction')
})

it('a fieldless correction that names a language becomes new-entry', () => {
  // It must stay a *request about that language* so triage can run the duplicate
  // check against `name`. Labeling it a correction produced "I read this as a
  // correction to Datalog" followed by "I could not tell which field this
  // corrects" — a self-contradicting reply to an unambiguous request.
  const p = normalise(bareName, corpus)
  assert.equal(p.kind, 'new-entry')
  assert.equal(p.name, 'Datalog')
})

it('a fieldless correction keeps the entry it pointed at', () => {
  // Clearing `entry` would hide which row the submitter was talking about.
  assert.equal(normalise(bareName, corpus).entry, 'languages/datalog')
})

it('recovers the language name when the model gave only an entry path', () => {
  // Without a name the duplicate check has nothing to match on, so the request
  // would be treated as net-new.
  const p = normalise({ ...bareName, name: null }, corpus)
  assert.equal(p.name, 'Datalog')
})

it('a fieldless correction with no entry and no name is unclear', () => {
  const p = normalise({ ...bareName, entry: null, name: null }, corpus)
  assert.equal(p.kind, 'unclear')
})

it('a correction that does name a field survives untouched', () => {
  const p = normalise({ ...FULL, kind: 'correction', entry: 'languages/datalog', field: 'paradigms', proposed: ['logic'] }, corpus)
  assert.equal(p.kind, 'correction')
  assert.equal(p.field, 'paradigms')
})

it('a new-entry with no name and no entry is unclear', () => {
  const p = normalise({ ...FULL, kind: 'new-entry', entry: null, name: null }, corpus)
  assert.equal(p.kind, 'unclear')
})

it('a new-entry with no name but a resolvable entry becomes a correction', () => {
  const p = normalise({ ...FULL, kind: 'new-entry', entry: 'languages/datalog', name: null }, corpus)
  assert.equal(p.kind, 'correction')
})

console.log('missingKeys: shape validation')

it('accepts a complete response', () => {
  assert.deepEqual(missingKeys(FULL), [])
})

it('reports every absent key, not just the first', () => {
  const missing = missingKeys({ kind: 'correction', field: 'memory' })
  assert.ok(missing.includes('entry'))
  assert.ok(missing.includes('sources'))
  assert.ok(missing.includes('rationale'))
  assert.ok(!missing.includes('kind'))
})

it('rejects a bad kind', () => {
  assert.ok(missingKeys({ ...FULL, kind: 'maybe' }).includes('kind'))
})

it('rejects a non-array aliases or sources', () => {
  assert.ok(missingKeys({ ...FULL, aliases: 'x' }).includes('aliases'))
  assert.ok(missingKeys({ ...FULL, sources: 'https://x' }).includes('sources'))
})

it('treats null as present, but an absent key as missing', () => {
  // This distinction is the whole reason the repair pass can act: "the model said
  // none" is usable, "the model said nothing" means it ignored the shape.
  assert.deepEqual(missingKeys({ ...FULL, aliases: null, name: null }), [])
  const withoutName = { ...FULL }
  delete withoutName.name
  assert.deepEqual(missingKeys(withoutName), ['name'])
})

it('reports all keys for a non-object', () => {
  assert.deepEqual(missingKeys('text'), PROPOSAL_KEYS)
})

console.log('normalise: cardinality coercion')

it('wraps a scalar into a list for a list field', () => {
  // `memory` is a list field; a model that answers "manual" has the right fact in
  // the wrong shape. Failing the request would punish the submitter for the
  // model's pluralisation, so it is wrapped rather than rejected.
  const p = normalise({ ...FULL, field: 'memory', proposed: 'manual' }, corpus)
  assert.deepEqual(p.proposed, ['manual'])
})

it('leaves a list alone for a list field', () => {
  const p = normalise({ ...FULL, field: 'memory', proposed: ['manual', 'gc'] }, corpus)
  assert.deepEqual(p.proposed, ['manual', 'gc'])
})

it('does not wrap a scalar field', () => {
  const p = normalise({ ...FULL, field: 'typing', proposed: 'gradual' }, corpus)
  assert.equal(p.proposed, 'gradual')
})

it('unwraps a one-element list for a scalar field', () => {
  const p = normalise({ ...FULL, field: 'typing', proposed: ['gradual'] }, corpus)
  assert.equal(p.proposed, 'gradual')
})

it('leaves an ambiguous multi-value list for a scalar field to triage', () => {
  // Choosing one would be a guess. triage's shape-mismatch finding reports it.
  const p = normalise({ ...FULL, field: 'typing', proposed: ['static', 'dynamic'] }, corpus)
  assert.deepEqual(p.proposed, ['static', 'dynamic'])
})

it('does not coerce when the field is unknown', () => {
  // No cardinality is known, so any change would be an invention.
  const p = normalise({ ...FULL, field: 'colour', proposed: 'blue' }, corpus)
  assert.equal(p.proposed, 'blue')
})

console.log('prompts')

it('the system prompt names every required key', () => {
  const s = systemPrompt()
  for (const key of PROPOSAL_KEYS) {
    assert.ok(s.includes(`"${key}"`), `system prompt omits ${key}`)
  }
})

it('the skeleton has exactly the required keys', () => {
  assert.deepEqual(Object.keys(responseSkeleton()), PROPOSAL_KEYS)
})

it('the repair prompt names the missing keys', () => {
  const r = repairPrompt({ kind: 'correction' }, ['entry', 'sources'])
  assert.match(r, /entry/)
  assert.match(r, /sources/)
  // It must show the target shape, not just complain.
  assert.match(r, /JSON object with exactly these eight keys/)
})

console.log('requestProposal: repair behaviour')

it('does not call the model twice when the first answer is complete', async () => {
  let calls = 0
  const call = async () => { calls++; return FULL }
  const r = await requestProposal({ system: 's', user: 'u', call })
  assert.equal(calls, 1)
  assert.equal(r.repaired, false)
  assert.deepEqual(r.missing, [])
})

it('repairs once when keys are missing', async () => {
  let calls = 0
  const call = async () => {
    calls++
    return calls === 1 ? { kind: 'correction' } : FULL
  }
  const r = await requestProposal({ system: 's', user: 'u', call })
  assert.equal(calls, 2)
  assert.equal(r.repaired, true)
  assert.deepEqual(r.missing, [])
})

it('makes at most two attempts, even when the repair also fails', async () => {
  let calls = 0
  const call = async () => { calls++; return { kind: 'correction' } }
  const r = await requestProposal({ system: 's', user: 'u', call })
  // A third attempt would rarely help and triples the cost of a request any
  // stranger can trigger.
  assert.equal(calls, 2)
  assert.deepEqual(r.missing.sort(), ['aliases', 'entry', 'field', 'name', 'proposed', 'rationale', 'sources'])
})

console.log()
console.log('live model check')

if (!process.env.OLLAMA_API_KEY) {
  console.log('  skip  OLLAMA_API_KEY not set — the live check proves the model obeys the prompt')
} else {
  const { default: nothing } = { default: null }
  const { execFileSync } = await import('node:child_process')
  const cases = [
    ['c++ has no gc, see https://en.cppreference.com/w/cpp', { kind: 'correction', field: 'memory' }],
    ['typescript typing should be gradual', { kind: 'correction', field: 'typing' }],
    ['I want to suggest Zzqx Lantern, https://example.org/spec', { kind: 'new-entry', name: 'Zzqx Lantern' }]
  ]
  for (const [text, expect] of cases) {
    try {
      const out = execFileSync('node', ['scripts/parse-submission.mjs', '--text', text, '--json'], {
        encoding: 'utf8', env: process.env
      })
      const p = JSON.parse(out)
      const ok = Object.entries(expect).every(([k, v]) => p[k] === v)
      if (!ok) {
        process.exitCode = 1
        console.error(`  FAIL  live: "${text}"`)
        console.error(`        expected ${JSON.stringify(expect)}, got ${JSON.stringify(p)}`)
      } else {
        pass++
        console.log(`  ok    live: "${text.slice(0, 40)}…"`)
      }
    } catch (err) {
      process.exitCode = 1
      console.error(`  FAIL  live: "${text}" → ${err.message.split('\n')[0]}`)
    }
  }
}

console.log(`\n${pass} assertion(s) passed`)
