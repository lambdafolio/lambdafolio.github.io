/**
 * Decide what a reply on a suggestion issue means (plan §5.2 step 1).
 *
 * The one-box intake trades required fields for a confirmation round-trip: the
 * bot restates what it understood and the submitter replies. That reply is the
 * only thing standing between a misparse and a wrong row, so the decision gets
 * its own script rather than a regex buried in a workflow `run:` block.
 *
 * Three outcomes:
 *
 *   confirm   an affirmative reply ("yes", "correct", "yep") — the issue
 *             becomes `queued`
 *   reparse   anything else, treated as a correction to the echo — the proposal
 *             is recomputed from the original text plus the reply
 *   ignore    an empty or boilerplate reply that says nothing either way
 *
 * Deliberately conservative: "no", "wrong" and specific corrections all land in
 * `reparse`, never in `confirm`. A false `confirm` queues a misparse; a false
 * `reparse` costs one more round-trip. The asymmetry decides the bias.
 *
 * Usage:
 *   node scripts/confirm-submission.mjs --reply "yes"
 *   node scripts/confirm-submission.mjs --reply "no, it's the memory field" --json
 */
import { resolve } from 'node:path'

/**
 * Affirmatives, anchored at the start and required to be the *whole* reply (or
 * followed only by punctuation/thanks). Anchoring matters: "yes but it's Rust"
 * must not confirm, because it carries a correction.
 */
const AFFIRMATIVE = /^\s*(?:yes|yeah|yep|yup|y|correct|right|exactly|confirmed|confirm|that'?s right|looks good|lgtm)\s*(?:thanks|thank you)?[\s.!]*$/i

/**
 * Phrases that make a reply a correction even if it opens with an affirmative:
 * a negation, a field name, or a "should be" construction.
 */
const CORRECTIVE = /\b(no|nope|not|wrong|actually|should be|instead|i meant|rather|except|but)\b/i

/** Strip quoted lines (the echo's own text) so a reply-to-quote is not confused for content. */
function stripQuotes(text) {
  return String(text ?? '')
    .split('\n')
    .filter(line => !line.trimStart().startsWith('>'))
    .join('\n')
    .trim()
}

export function classifyReply(rawReply) {
  const reply = stripQuotes(rawReply)

  if (!reply) {
    return {
      action: 'ignore',
      reason: 'The reply was empty once quoted text was removed — nothing to act on.'
    }
  }

  // A corrective phrase outranks an affirmative opener. "yes but memory, not
  // typing" confirms nothing; it corrects.
  if (CORRECTIVE.test(reply)) {
    return {
      action: 'reparse',
      reason: 'The reply contains a correction, so the request is re-read rather than queued.'
    }
  }

  if (AFFIRMATIVE.test(reply)) {
    return {
      action: 'confirm',
      reason: 'Confirmed.'
    }
  }

  // Anything else is treated as a correction in prose. That is the safe default:
  // an unrecognised reply that confirmed would queue a possibly-wrong parse.
  return {
    action: 'reparse',
    reason: 'The reply is not a plain confirmation, so it is treated as a correction.'
  }
}

/**
 * Compose the text to re-parse when a reply corrects the echo.
 *
 * The original submission is kept verbatim, and the reply is appended as a
 * clearly-labelled clarification, because the parser needs both: the original
 * may carry a URL the reply does not repeat.
 */
export function composeReparseText(issueBody, reply) {
  const body = String(issueBody ?? '').trim()
  const clarification = stripQuotes(reply)
  if (!clarification) return body
  return [
    body,
    '',
    '---',
    'Clarification from the submitter:',
    clarification
  ].join('\n').trim()
}

function main() {
  const args = process.argv.slice(2)
  const get = flag => {
    const i = args.indexOf(flag)
    return i === -1 ? null : args[i + 1]
  }

  const reply = get('--reply')
  if (reply == null) {
    console.error('usage: node scripts/confirm-submission.mjs --reply "<text>" [--body "<issue body>"] [--json]')
    process.exit(2)
  }

  const result = classifyReply(reply)
  const body = get('--body')

  if (args.includes('--json')) {
    const out = { ...result }
    if (result.action === 'reparse' && body != null) {
      out.reparseText = composeReparseText(body, reply)
    }
    console.log(JSON.stringify(out, null, 2))
    return
  }

  console.log(`${result.action}: ${result.reason}`)
  if (result.action === 'reparse' && body != null) {
    console.log('\ntext to re-parse:\n')
    console.log(composeReparseText(body, reply))
  }
}

if (import.meta.url === `file://${resolve(process.argv[1] ?? '')}`) {
  main()
}

export { AFFIRMATIVE, CORRECTIVE }
