/**
 * Checks for the derived backlog (app/utils/backlog.ts).
 *
 * Run with: node --experimental-strip-types scripts/check-backlog.mts
 *
 * The backlog is pure logic over corpus rows, so it is testable directly. Two
 * classes of mistake are worth guarding, because both produce a plausible
 * table: a wrong queue assignment (which reorders all the work) and a wrong
 * missing-field list (which tells a writer there is nothing to do).
 */
import assert from 'node:assert/strict'
import {
  backlogRows, missingFields, queueCounts, queueFor, sourceCount,
  type BacklogEntry
} from '../app/utils/backlog.ts'

/** A body that is exactly the scaffold seed — i.e. a stub. */
const STUB_BODY = { value: [['p', {}, 'TODO: Write the wiki article for ', ['strong', {}, 'X'], '.']] }
/** A body with one real paragraph. */
const PROSE_BODY = { value: [['p', {}, 'A real sentence about the language.']] }

const proseRich: BacklogEntry = {
  name: 'Rich',
  path: '/languages/rich',
  body: PROSE_BODY,
  homepage: 'https://rich.example',
  year: 1995,
  paradigms: ['functional'],
  family: 'ml',
  typing: 'static',
  memory: ['gc'],
  execution: ['native']
}

const proseSparse: BacklogEntry = {
  name: 'Sparse',
  path: '/languages/sparse',
  body: PROSE_BODY,
  homepage: 'https://sparse.example'
}

const stubHomepage: BacklogEntry = {
  name: 'StubHome',
  path: '/languages/stubhome',
  body: STUB_BODY,
  homepage: 'https://stubhome.example'
}

const stubNoHomepage: BacklogEntry = {
  name: 'StubBare',
  path: '/languages/stubbare',
  body: STUB_BODY
}

let passed = 0
function ok(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok    ${name}`)
  } catch (err) {
    console.error(`  FAIL  ${name}`)
    throw err
  }
}

console.log('missing fields')

ok('a complete prose row is missing nothing', () => {
  assert.deepEqual(missingFields(proseRich), [])
})

ok('a stub with only a homepage is missing everything else', () => {
  assert.deepEqual(missingFields(stubHomepage), [
    'year', 'paradigms', 'family', 'typing', 'memory', 'execution'
  ])
})

ok('a bare stub is missing the homepage too, and it leads the list', () => {
  assert.deepEqual(missingFields(stubNoHomepage), [
    'homepage', 'year', 'paradigms', 'family', 'typing', 'memory', 'execution'
  ])
})

ok('an empty array counts as missing, not as present', () => {
  const entry: BacklogEntry = { name: 'E', path: '/e', body: PROSE_BODY, memory: [] }
  assert.ok(missingFields(entry).includes('memory'))
})

ok('a null year counts as missing', () => {
  const entry: BacklogEntry = { name: 'E', path: '/e', body: PROSE_BODY, year: null }
  assert.ok(missingFields(entry).includes('year'))
})

ok('year 0 would count as present (falsy-value trap)', () => {
  // Schema floors the year at 1943, so this cannot occur — but testing it
  // pins the intent: a numeric check, not a truthiness check.
  const entry: BacklogEntry = { name: 'E', path: '/e', body: PROSE_BODY, year: 0 }
  assert.ok(!missingFields(entry).includes('year'))
})

console.log('sources')

ok('homepage, urls and references are all counted, deduplicated', () => {
  const entry: BacklogEntry = {
    name: 'E',
    path: '/e',
    body: PROSE_BODY,
    homepage: 'https://a.example',
    urls: ['https://a.example', 'https://b.example'],
    references: [{ url: 'https://c.example', title: 'C' }]
  }
  assert.equal(sourceCount(entry), 3)
})

ok('an entry with no source counts zero', () => {
  assert.equal(sourceCount(stubNoHomepage), 0)
})

console.log('queue assignment')

ok('prose goes to queue A regardless of its facts', () => {
  assert.equal(queueFor(proseRich), 'A')
  assert.equal(queueFor(proseSparse), 'A')
})

ok('a stub with a homepage goes to queue B', () => {
  assert.equal(queueFor(stubHomepage), 'B')
})

ok('a stub without a homepage goes to queue C', () => {
  assert.equal(queueFor(stubNoHomepage), 'C')
})

ok('the scaffold seed does not count as prose — the regression this guards', () => {
  // If hasRenderableBody ever again treats the seed as content, every stub
  // silently moves to queue A and the table claims 729 readable entries.
  assert.equal(queueFor(stubHomepage), 'B')
})

console.log('ranking')

ok('queues are ordered A then B then C', () => {
  const rows = backlogRows([stubNoHomepage, stubHomepage, proseSparse, proseRich])
  assert.deepEqual(rows.map(r => r.queue), ['A', 'A', 'B', 'C'])
})

ok('within a queue, the most incomplete entry sorts first', () => {
  const rows = backlogRows([proseRich, proseSparse, stubHomepage, stubNoHomepage])
  const a = rows.filter(r => r.queue === 'A')
  assert.deepEqual(a.map(r => r.name), ['Sparse', 'Rich'])
})

ok('prose outranks stubs because the QUEUE orders it, not a hidden weight', () => {
  // Before the score was removed this held numerically (prose x3); now it holds
  // structurally. Asserting it either way pins the behaviour that matters.
  const rows = backlogRows([stubHomepage, proseSparse])
  assert.ok(rows.findIndex(r => r.name === 'Sparse') < rows.findIndex(r => r.name === 'StubHome'))
})

ok('equally incomplete rows fall back to name, so the order is stable', () => {
  const x: BacklogEntry = { name: 'Zeta', path: '/z', body: STUB_BODY }
  const y: BacklogEntry = { name: 'Alpha', path: '/a', body: STUB_BODY }
  assert.deepEqual(backlogRows([x, y]).map(r => r.name), ['Alpha', 'Zeta'])
})

ok('rows expose no score field — the redundant column stays gone', () => {
  // The score reduced to `k x missingCount` with `k` encoding only the queue,
  // so it restated two visible columns. If it is ever added back it must come
  // with a real signal (demand from the GitHub API), not the PLDB rank term,
  // which is permanently zero now that PLDB is retired.
  const [row] = backlogRows([stubHomepage])
  assert.equal('score' in row!, false)
})

ok('every row carries a next step from its queue', () => {
  const rows = backlogRows([proseSparse, stubHomepage, stubNoHomepage])
  for (const row of rows) assert.ok(row.nextStep.length > 0, `${row.name} has no next step`)
})

ok('the ranking is stable across repeated runs', () => {
  const input = [stubNoHomepage, proseRich, stubHomepage, proseSparse]
  const first = backlogRows(input).map(r => r.name)
  const second = backlogRows(input).map(r => r.name)
  assert.deepEqual(first, second)
})

console.log('queue counts')

ok('counts cover all three queues and sum to the input size', () => {
  const rows = backlogRows([proseRich, proseSparse, stubHomepage, stubNoHomepage])
  const counts = queueCounts(rows)
  assert.equal(counts.length, 3)
  assert.equal(counts.reduce((n, c) => n + c.count, 0), 4)
  assert.deepEqual(counts.map(c => c.id), ['A', 'B', 'C'])
})

ok('an empty queue still appears, with zero', () => {
  const counts = queueCounts(backlogRows([stubHomepage]))
  assert.equal(counts.find(c => c.id === 'A')!.count, 0)
  assert.equal(counts.find(c => c.id === 'C')!.count, 0)
})

console.log(`\n${passed} assertion(s) passed`)
