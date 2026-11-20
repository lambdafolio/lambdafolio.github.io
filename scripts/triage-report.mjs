/**
 * Turn a parsed proposal into a verdict, a comment, and a label set.
 *
 * This is the deterministic half of triage (plan §5.2 step 1). It reads the JSON
 * that `scripts/parse-submission.mjs` wrote, re-runs every check against the real
 * corpus, and emits a single JSON object the workflow can consume:
 *
 *   { verdict, labels[], comment, findings[] }
 *
 * Everything here is testable in isolation — no network, no model, no GitHub —
 * which is the point: the rule that decides whether a stranger's request becomes
 * a row should be readable and runnable from a shell.
 *
 * Usage:
 *   node scripts/triage-report.mjs --proposal proposal.json --out verdict.json
 *   node scripts/triage-report.mjs --proposal proposal.json      # prints
 */
import { readFileSync, writeFileSync } from 'node:fs'
import {
  checkCorrection, checkNewEntry, verdictFor, loadCorpus, resolveEntry
} from './lib/triage-checks.mjs'
import { needsSlugOverride } from './lib/slugify.mjs'

/**
 * Labels for a verdict.
 *
 * Two kinds, deliberately separated:
 *   - state: exactly one of queued / needs-info / needs-curator / duplicate /
 *     declined. This is what the intake skill dispatches on.
 *   - provenance: leads-only / has-primary-source, plus slug-override-needed.
 *     These describe *cost*, not state — a lead is still queueable.
 *
 * Provenance labels are attached only to `queued`. On a duplicate or a
 * needs-curator row they read as "this is actionable, just expensive", which is
 * the opposite of the state label sitting next to them.
 */
function labelsFor(verdict, findings, extra = []) {
  const labels = [verdict]
  if (verdict === 'queued') {
    for (const code of ['leads-only', 'has-primary-source']) {
      if (findings.some(f => f.code === code)) labels.push(code)
    }
  }
  labels.push(...extra)
  return [...new Set(labels)]
}

function buildReport(proposal) {
  const corpus = loadCorpus()

  // `declined` is reserved for "this is not a language". It is a curator
  // judgement, not something a parser or a checklist can reach — so it is never
  // produced here. The workflow labels it by hand, or the skill does.
  if (proposal.kind === 'unclear') {
    return {
      verdict: 'needs-info',
      labels: ['needs-info'],
      findings: [],
      comment: [
        "I could not tell what this is asking for, so I have not guessed.",
        '',
        'Any of these works:',
        '- a language name — `Kitten`',
        '- a link to its site or specification — `https://kittenlang.org`',
        '- a correction naming the field — `c++ has no gc`',
        '',
        'Reply with one of those and I will re-read it.'
      ].join('\n')
    }
  }

  if (proposal.kind === 'correction') {
    const resolved = proposal.entry ? resolveEntry(corpus, proposal.entry) : null
    if (!resolved) {
      return {
        verdict: 'needs-info',
        labels: ['needs-info'],
        findings: [],
        comment: [
          'I read this as a correction, but I could not match it to an entry.',
          '',
          proposal.entry
            ? `\`${proposal.entry}\` is not a row I can find.`
            : 'I could not find which language you mean.',
          '',
          'Name the language as it appears on the site and I will try again — or, if it is not here yet, describe it as a new entry.'
        ].join('\n')
      }
    }

    const { findings } = checkCorrection({
      entry: proposal.entry,
      field: proposal.field,
      proposed: proposal.proposed,
      sources: proposal.sources
    })

    // A `#` in a proposed *name* has no generic slug rule, so adding the override
    // is a schema decision — label it rather than deriving something wrong.
    const slugWarning = proposal.field === 'name' && typeof proposal.proposed === 'string'
      ? needsSlugOverride(proposal.proposed)
      : false
    const verdict = verdictFor(findings, { needsCurator: slugWarning })
    const extra = slugWarning ? ['slug-override-needed'] : []

    return {
      verdict,
      labels: labelsFor(verdict, findings, extra),
      findings,
      comment: renderCorrectionEcho(proposal, findings, resolved)
    }
  }

  // New entry.
  const { findings, slug } = checkNewEntry({
    name: proposal.name,
    sources: proposal.sources
  })
  const slugWarning = proposal.name ? needsSlugOverride(proposal.name) : false
  const verdict = verdictFor(findings)
  const extra = slugWarning ? ['slug-override-needed'] : []

  return {
    verdict,
    labels: labelsFor(verdict, findings, extra),
    findings,
    comment: renderNewEntryEcho(proposal, findings, slug)
  }
}

function renderChecks(findings) {
  if (!findings.length) return []
  const icon = { error: '✗', warning: '!', info: '✓' }
  return ['', '**Checks**', ...findings.map(f => `- ${icon[f.severity] ?? '·'} ${f.message}`)]
}

function renderCorrectionEcho(proposal, findings, resolved) {
  const lines = [
    `I read this as a **correction** to [${resolved.name}](/languages/${resolved.slug}). Is that right?`,
    ''
  ]
  if (proposal.field) lines.push(`- **Field** — \`${proposal.field}\``)
  if (proposal.proposed != null) {
    const shown = Array.isArray(proposal.proposed) ? proposal.proposed : [proposal.proposed]
    lines.push(`- **Proposed** — ${shown.map(v => `\`${v}\``).join(', ')}`)
  }
  if (proposal.sources?.length) {
    lines.push(`- **Source** — ${proposal.sources.join(' ')}`)
  }
  if (proposal.rationale) lines.push('', `> ${proposal.rationale}`)

  lines.push(...renderChecks(findings))

  const blocking = findings.some(f => f.severity === 'error')
  lines.push(
    '',
    blocking
      ? 'I cannot queue this as written. Reply with what is missing above and I will re-read it.'
      : 'Reply **yes** to queue it, or correct me in a sentence. Nothing is applied until you confirm.'
  )
  return lines.join('\n')
}

function renderNewEntryEcho(proposal, findings, slug) {
  const lines = ['I read this as a request for a **new entry**. Is that right?', '']
  if (proposal.name) lines.push(`- **Language** — ${proposal.name}`)
  if (slug) lines.push(`- **Row would live at** — \`/languages/${slug}\``)
  if (proposal.aliases?.length) lines.push(`- **Also known as** — ${proposal.aliases.join(', ')}`)
  if (proposal.sources?.length) lines.push(`- **Source** — ${proposal.sources.join(' ')}`)
  if (proposal.rationale) lines.push('', `> ${proposal.rationale}`)

  lines.push(...renderChecks(findings))

  const blocking = findings.some(f => f.severity === 'error')
  lines.push(
    '',
    blocking
      ? 'I cannot queue this as written. Reply with what is missing above and I will re-read it.'
      : 'Reply **yes** to queue it, or correct me in a sentence. Nothing is applied until you confirm.'
  )
  return lines.join('\n')
}

// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2)
  const get = flag => {
    const i = args.indexOf(flag)
    return i === -1 ? null : args[i + 1]
  }
  const inPath = get('--proposal')
  if (!inPath) {
    console.error('usage: node scripts/triage-report.mjs --proposal <file.json> [--out <file.json>]')
    process.exit(2)
  }

  const proposal = JSON.parse(readFileSync(inPath, 'utf8'))
  const report = buildReport(proposal)
  const json = JSON.stringify(report, null, 2)

  const outPath = get('--out')
  if (outPath) {
    writeFileSync(outPath, json)
  } else {
    console.log(json)
  }
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  main()
}

export { buildReport }
