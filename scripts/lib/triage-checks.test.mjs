/**
 * Assertions for the triage checks.
 *
 * Run with `npm run test:triage`. These are the rules that decide whether a
 * stranger's request becomes a row, so they get real assertions rather than
 * "looks right in the PR".
 */
import assert from 'node:assert/strict'
import {
  resolveEntry, checkCorrection, checkNewEntry, checkSources,
  verdictFor, isLeadHost, isDigestUrl, classifySource, loadCorpus
} from './triage-checks.mjs'
import { slugify, needsSlugOverride } from './slugify.mjs'

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
const codes = findings => findings.map(f => f.code)

/**
 * A name that is certainly absent from the corpus.
 *
 * The fixtures in this file must not depend on a real language *not* existing:
 * `Kitten` was hypothetical when these assertions were written and became a real
 * row when the PLDB batch landed, which broke two tests that had nothing to do
 * with the change. A suffixed nonsense name cannot drift like that.
 */
const ABSENT = 'Zzqx Testlang'
const ABSENT_SLUG = 'zzqx-testlang'

console.log('slug parity with app/utils/slugify.ts')
it('applies explicit overrides', () => {
  assert.equal(slugify('C#'), 'csharp')
  assert.equal(slugify('SML#'), 'smlsharp')
})
it('maps + and & and Greek', () => {
  assert.equal(slugify('C++'), 'cplusplus')
  // `&` -> `and` with no separators: the substitution happens before the
  // non-alphanumeric collapse, so `AT&T` -> `atandt`, not `at-and-t`. This is the
  // same rule that makes `R&D` -> `randd`; the corpus relies on it being applied
  // verbatim, so the test pins the real behaviour rather than an intuition.
  assert.equal(slugify('AT&T'), 'atandt')
  assert.equal(slugify('π'), 'pi')
})
it('keeps the Go! bang legible', () => {
  // Without the `!` -> `-bang` entry this collapses onto `go` (the board game).
  assert.equal(slugify('Go!'), 'go-bang')
})
it('flags a # name that has no override', () => {
  assert.equal(needsSlugOverride('SML#'), false)
  assert.equal(needsSlugOverride('Hypothetical#'), true)
})

console.log('host classification')
it('treats wikipedia and forums as leads', () => {
  assert.equal(isLeadHost('https://en.wikipedia.org/wiki/C%2B%2B'), true)
  assert.equal(isLeadHost('https://news.ycombinator.com/item?id=1'), true)
  assert.equal(isLeadHost('https://www.reddit.com/r/programming'), true)
})
it('treats project sites and repos as primary', () => {
  assert.equal(isLeadHost('https://kittenlang.org'), false)
  assert.equal(isLeadHost('https://github.com/foo/bar'), false)
  assert.equal(isLeadHost('https://en.cppreference.com/w/cpp'), false)
})
it('does not treat a lookalike domain as wikipedia', () => {
  assert.equal(isLeadHost('https://wikipedia.org.evil.example/x'), false)
})
it('ignores a malformed URL rather than throwing', () => {
  assert.equal(isLeadHost('not a url'), false)
})

console.log('entry resolution')
it('resolves an explicit collection/slug', () => {
  const hit = resolveEntry(corpus, 'languages/cplusplus')
  assert.ok(hit, 'expected cplusplus to resolve')
  assert.equal(hit.slug, 'cplusplus')
})
it('resolves a bare name case-insensitively', () => {
  assert.ok(resolveEntry(corpus, 'c++'))
  assert.ok(resolveEntry(corpus, 'C++'))
})
it('resolves a slug the user typed', () => {
  assert.ok(resolveEntry(corpus, 'cplusplus'))
})
it('returns null for a language that is not here', () => {
  // A wrong "yes" here would let a correction target a non-existent row.
  assert.equal(resolveEntry(corpus, ABSENT), null)
})

console.log('corrections')
it('accepts a legal vocabulary change with a primary source', () => {
  const { findings } = checkCorrection({
    entry: 'languages/cplusplus',
    field: 'memory',
    proposed: ['gc', 'manual'],
    sources: ['https://en.cppreference.com/w/cpp/language/objects']
  })
  assert.equal(verdictFor(findings), 'queued', `got ${verdictFor(findings)}: ${JSON.stringify(findings)}`)
})
it('rejects an unknown field', () => {
  const { findings } = checkCorrection({
    entry: 'languages/cplusplus', field: 'colour', proposed: 'blue',
    sources: ['https://en.cppreference.com/w/cpp']
  })
  assert.ok(codes(findings).includes('unknown-field'))
  assert.equal(verdictFor(findings), 'needs-info')
})
it('rejects an out-of-vocabulary value without coercing it', () => {
  const { findings } = checkCorrection({
    entry: 'languages/cplusplus', field: 'memory', proposed: ['telepathy'],
    sources: ['https://en.cppreference.com/w/cpp']
  })
  assert.ok(codes(findings).includes('unknown-value'))
  // A new term is a schema decision, so a curator decides — not the parser.
  assert.equal(verdictFor(findings), 'needs-curator')
})
it('rejects a scalar arriving as a list', () => {
  const { findings } = checkCorrection({
    entry: 'languages/cplusplus', field: 'typing', proposed: ['static'],
    sources: ['https://en.cppreference.com/w/cpp']
  })
  assert.ok(codes(findings).includes('shape-mismatch'))
})
it('rejects an implausible year', () => {
  const { findings } = checkCorrection({
    entry: 'languages/cplusplus', field: 'year', proposed: 12,
    sources: ['https://en.cppreference.com/w/cpp']
  })
  assert.ok(codes(findings).includes('bad-year'))
})
it('labels a correction whose only source is a lead', () => {
  const { findings } = checkCorrection({
    entry: 'languages/cplusplus', field: 'memory', proposed: ['manual'],
    sources: ['https://en.wikipedia.org/wiki/C%2B%2B']
  })
  assert.ok(codes(findings).includes('leads-only'))
  // A lead is not an error: it queues, with a label telling the curator it will
  // cost more than one fetch.
  assert.equal(verdictFor(findings), 'queued')
})

console.log('new entries')
it('accepts an absent name with a primary source', () => {
  const { findings, slug } = checkNewEntry({
    name: ABSENT, sources: ['https://example.org/spec']
  })
  assert.equal(slug, ABSENT_SLUG)
  assert.equal(verdictFor(findings), 'queued', JSON.stringify(findings))
})
it('rejects a name that already exists', () => {
  const { findings } = checkNewEntry({ name: 'C++', sources: ['https://isocpp.org'] })
  assert.ok(codes(findings).includes('duplicate'))
  assert.equal(verdictFor(findings), 'duplicate')
})
it('catches a duplicate reached through a different spelling', () => {
  const { findings } = checkNewEntry({ name: 'c++', sources: ['https://isocpp.org'] })
  assert.ok(codes(findings).includes('duplicate'))
})
it('rejects a non-ASCII name for a curator decision', () => {
  const { findings } = checkNewEntry({ name: 'Ć', sources: ['https://example.org'] })
  assert.ok(codes(findings).includes('non-ascii-name'))
  assert.equal(verdictFor(findings), 'needs-curator')
})
it('rejects a punctuation-only name', () => {
  const { findings } = checkNewEntry({ name: '><>', sources: ['https://example.org'] })
  assert.ok(codes(findings).includes('empty-slug'))
})
it('queues an entrant with no source, with a warning', () => {
  const { findings } = checkNewEntry({ name: 'Zzqx Unsourced', sources: [] })
  assert.ok(codes(findings).includes('no-source'))
  assert.equal(verdictFor(findings), 'queued')
})

console.log('source checks')
it('reports a bad protocol', () => {
  const findings = checkSources(['ftp://example.org/x'])
  assert.ok(codes(findings).includes('bad-url'))
})
it('counts multiple primaries', () => {
  const findings = checkSources(['https://a.example', 'https://b.example'])
  assert.ok(findings.some(f => f.code === 'has-primary-source' && f.message.startsWith('2 primary')))
})

console.log('digests: a list of leads, not a source')

it('classifies the catalogs that appear in TODO.md', () => {
  // Every one of these is in the Misc section of TODO.md as a lead source, and
  // every one would otherwise have been accepted as a primary citation.
  for (const url of [
    'https://rosettacode.org/wiki/Category:Programming_Languages',
    'https://esolangs.org/wiki/Language_list',
    'https://www.levenez.com/lang/',
    'https://99-bottles-of-beer.net/abc.html',
    'https://gcemetery.co/',
    'http://hopl.info/',
    'http://plzoo.andrej.com/'
  ]) {
    assert.equal(classifySource(url), 'digest', `${url} should be a digest`)
  }
})

it('a wiki list is a digest, a wiki article is a lead', () => {
  // The distinction that makes this classification worth having: same host,
  // different shape. `List of programming languages` names hundreds of subjects;
  // `C++` names one.
  assert.equal(classifySource('https://en.wikipedia.org/wiki/List_of_programming_languages'), 'digest')
  assert.equal(classifySource('https://en.wikipedia.org/wiki/Category:Programming_languages'), 'digest')
  assert.equal(classifySource('https://en.wikipedia.org/wiki/C%2B%2B'), 'lead')
})

it('does not mistake a changelog for a language index', () => {
  // Path patterns must stay narrow: `list-of-versions` is a release history on a
  // primary site, not a catalogue of languages.
  assert.equal(classifySource('https://example.org/list-of-versions'), 'primary')
  assert.equal(classifySource('https://www.gnu.org/software/bash/'), 'primary')
  assert.equal(classifySource('https://github.com/foo/bar'), 'primary')
})

it('a language page on an index host is primary, not a digest', () => {
  // The false positive this classification must avoid: `cow.md` cites
  // `esolangs.org/wiki/COW` as its homepage, and `rosettacode.org/wiki/<Lang>`
  // is a page about one language. Host-only matching called both of them lists,
  // which would have suppressed valid citations.
  assert.equal(classifySource('https://esolangs.org/wiki/COW'), 'primary')
  assert.equal(classifySource('https://rosettacode.org/wiki/C%2B%2B'), 'primary')
})

it('a digest with a name is not reported as a primary source', () => {
  const findings = checkSources(
    ['https://rosettacode.org/wiki/Category:Programming_Languages'],
    { named: true }
  )
  assert.ok(codes(findings).includes('digest'))
  // The defect this replaces: the digest used to satisfy `has-primary-source`.
  assert.ok(!codes(findings).includes('has-primary-source'))
})

it('a digest alone never yields a primary-source label', () => {
  const r = checkNewEntry({
    name: ABSENT,
    sources: ['https://rosettacode.org/wiki/Category:Programming_Languages']
  })
  assert.ok(!r.findings.some(f => f.code === 'has-primary-source'))
  assert.ok(r.findings.some(f => f.code === 'digest'))
})

it('a digest with no name asks which language, rather than for a link', () => {
  const r = checkNewEntry({
    name: null,
    sources: ['https://rosettacode.org/wiki/Category:Programming_Languages']
  })
  const missing = r.findings.find(f => f.code === 'missing-name')
  assert.ok(missing, 'expected a missing-name finding')
  // The old message said "send a name or a link" to someone who had sent a link.
  assert.match(missing.message, /index of many languages/i)
  assert.doesNotMatch(missing.message, /send a name or a link/i)
})

it('a named digest says it cannot be the citation', () => {
  const findings = checkSources(
    ['https://rosettacode.org/wiki/Category:Programming_Languages'],
    { named: true }
  )
  const digest = findings.find(f => f.code === 'digest')
  assert.match(digest.message, /cannot be the source/i)
  // And it must not repeat the question the submitter already answered.
  assert.doesNotMatch(digest.message, /say which language/i)
})

it('a digest plus a lead reports both without claiming a primary', () => {
  const findings = checkSources(
    [
      'https://rosettacode.org/wiki/Category:Programming_Languages',
      'https://news.ycombinator.com/item?id=1'
    ],
    { named: true }
  )
  assert.ok(codes(findings).includes('digest'))
  assert.ok(codes(findings).includes('leads-only'))
  assert.ok(!codes(findings).includes('has-primary-source'))
})

console.log(`\n${pass} assertion(s) passed`)
