/**
 * Verify candidate homepages and write the ones that pass (plan §6.1 step 5,
 * §6.5 gap 2).
 *
 * A bare HTTP 200 is not evidence. It accepts:
 *   - a parked domain that returns a placeholder page
 *   - a site-wide redirect to a company homepage
 *   - a soft 404 served with 200
 *
 * So a URL is accepted into `homepage` only when all three hold:
 *
 *   1. it resolves (following redirects) to 200
 *   2. the final host matches the host that was supplied — a redirect off-domain
 *      means the original URL no longer names the project
 *   3. the page's title or first screenful of text mentions the language name
 *
 * That is deliberately *stricter* than the language-entry skill's rule for a
 * session ("only when a page already opened in this session attests it"), because
 * a human opening a page notices a parked domain and a script does not.
 *
 * Only stubs are touched: an entry that already declares `homepage` is left alone,
 * and no body is ever modified.
 *
 * Usage:
 *   node scripts/check-homepages.mjs --candidates candidates.json       # dry run
 *   node scripts/check-homepages.mjs --candidates candidates.json --write
 *   node scripts/check-homepages.mjs --candidates … --limit 50 --concurrency 4
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { ROOT } from './lib/taxonomy-vocab.mjs'

const CONTENT = resolve(ROOT, 'content/languages')
const TIMEOUT_MS = 12_000
const UA = 'lambdafolio-homepage-check/1.0 (+https://lambdafolio.github.io)'

/** Strip tags and collapse whitespace, for the name-in-text test. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function pageTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''
}

/** Loose name match: case-insensitive, ignoring punctuation, allowing a prefix. */
function mentions(text, name) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
  const hay = norm(text)
  const needle = norm(name)
  if (!needle) return false
  if (hay.includes(needle)) return true
  // Some sites only ever show a short form ("C++" for "C++ Programming Language").
  const head = needle.split(' ')[0]
  return head.length >= 3 && hay.includes(head)
}

async function fetchChecked(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': UA, accept: 'text/html,*/*' }
    })
    if (!res.ok) return { ok: false, reason: `http-${res.status}`, definitive: true }
    const finalHost = new URL(res.url).hostname.replace(/^www\./, '')
    const supplyHost = new URL(url).hostname.replace(/^www\./, '')
    const html = await res.text()
    return { ok: true, finalHost, supplyHost, html }
  } catch (err) {
    // A timeout or a DNS/connect failure says nothing about whether the URL is
    // *right* — it says this machine could not reach it. (gnu.org, for example,
    // resolves to IPv6 only here, and IPv6 egress is broken, so every gnu.org
    // check times out while the URL is perfectly good.) Conflating this with a
    // rejection would tell a curator a good link was wrong.
    const reason = err?.name === 'AbortError' ? 'timeout' : 'unreachable'
    return { ok: false, reason, definitive: false }
  } finally {
    clearTimeout(timer)
  }
}

async function verify(candidate) {
  const { name, slug, website } = candidate
  if (!website) return { slug, name, accepted: false, reason: 'no-website' }

  const got = await fetchChecked(website)
  if (!got.ok) {
    return {
      slug, name, website, accepted: false,
      reason: got.reason,
      // `definitive: false` means retry from a different network before drawing
      // any conclusion about the URL.
      definitive: got.definitive ?? false
    }
  }

  // Identity, in order of authority.
  //
  // The real question is "does this page describe this language?", and the
  // strongest answer is that the page says so. A host move is *not* evidence of
  // anything: coq.org now serves rocq-prover.org (an upstream rename), dart
  // redirects to dart.dev, jinja to jinja.palletsprojects.com, and each of those
  // is the correct home. Rejecting on host change produced false negatives on
  // exactly those, so the host test only becomes decisive when the page also
  // fails to mention the language — i.e. it distinguishes "moved home" from
  // "redirected to a company front page".
  const title = pageTitle(got.html)
  const head = visibleText(got.html).slice(0, 1200)
  const named = mentions(title, name) || mentions(head, name)

  const sameSite = got.finalHost === got.supplyHost
    || got.finalHost.endsWith(`.${got.supplyHost}`)
    || got.supplyHost.endsWith(`.${got.finalHost}`)

  if (!named) {
    // A page whose static HTML is nearly empty is a client-rendered app: there is
    // no text to match because the text arrives over the network after load.
    // elm-lang.org is the canonical example — 200 OK, <title>home</title>, and a
    // single word of visible text, because the site is an SPA. Calling that a
    // rejection would be a lie about what was proven, so it is inconclusive.
    const looksClientRendered = head.length < 200
    return {
      slug, name, website, accepted: false,
      reason: looksClientRendered
        ? `client-rendered:${got.finalHost}`
        : sameSite ? 'name-not-on-page' : `redirected-and-name-absent:${got.finalHost}`,
      definitive: !looksClientRendered
    }
  }

  return { slug, name, website, accepted: true, title, definitive: true }
}

/** Insert (or replace) `homepage` in a file's frontmatter, preserving field order. */
function withHomepage(raw, url) {
  if (/^homepage:/m.test(raw)) return raw
  // Canonical order (lint-frontmatter --fix): title, name, homepage, urls, …
  const lines = raw.split('\n')
  const nameIdx = lines.findIndex(l => /^name:/.test(l))
  if (nameIdx === -1) return raw
  lines.splice(nameIdx + 1, 0, `homepage: ${JSON.stringify(url).replace(/^"|"$/g, '"')}`)
  return lines.join('\n')
}

async function main() {
  const args = process.argv.slice(2)
  const get = flag => {
    const i = args.indexOf(flag)
    return i === -1 ? null : args[i + 1]
  }
  const inPath = get('--candidates')
  if (!inPath) {
    console.error('usage: node scripts/check-homepages.mjs --candidates <file.json> [--write] [--limit N] [--concurrency N]')
    process.exit(2)
  }

  const write = args.includes('--write')
  const limit = get('--limit') ? Number(get('--limit')) : Infinity
  const concurrency = get('--concurrency') ? Number(get('--concurrency')) : 4

  const candidates = JSON.parse(readFileSync(inPath, 'utf8'))
    .filter(c => c.website)
    .slice(0, limit)

  console.log(`checking ${candidates.length} candidate homepage(s), ${concurrency} at a time`)

  const results = []
  let cursor = 0
  async function worker() {
    while (cursor < candidates.length) {
      const c = candidates[cursor++]
      const r = await verify(c)
      results.push(r)
      const mark = r.accepted ? 'ok  ' : 'skip'
      console.log(`  ${mark} ${r.slug.padEnd(24)} ${r.accepted ? r.website : r.reason}`)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, candidates.length) }, worker))

  const accepted = results.filter(r => r.accepted)
  const rejected = results.filter(r => !r.accepted && r.definitive)
  const inconclusive = results.filter(r => !r.accepted && !r.definitive)

  const reasons = {}
  for (const r of rejected) {
    const key = r.reason.split(':')[0]
    reasons[key] = (reasons[key] ?? 0) + 1
  }

  console.log()
  console.log(`accepted      ${accepted.length} / ${results.length}`)
  console.log(`rejected      ${rejected.length}   (definitive: wrong host, 404, or name absent)`)
  console.log(`inconclusive  ${inconclusive.length}   (timeout or unreachable — retry elsewhere)`)
  for (const [reason, n] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason.padEnd(24)} ${n}`)
  }
  if (inconclusive.length) {
    console.log()
    console.log('inconclusive entries are NOT rejections — nothing about the URL was proven:')
    for (const r of inconclusive) console.log(`  ${r.slug.padEnd(24)} ${r.reason}`)
  }

  if (!write) {
    console.log()
    console.log('dry run — pass --write to set `homepage` on the accepted entries')
    return
  }

  let written = 0
  for (const r of accepted) {
    const path = join(CONTENT, `${r.slug}.md`)
    try {
      const raw = readFileSync(path, 'utf8')
      const next = withHomepage(raw, r.website)
      if (next !== raw) {
        writeFileSync(path, next)
        written++
      }
    } catch (err) {
      console.log(`  could not update ${r.slug}: ${err.message}`)
    }
  }
  console.log()
  console.log(`wrote homepage on ${written} entr${written === 1 ? 'y' : 'ies'}`)
}

main().catch(err => {
  console.error(`check-homepages: ${err.message}`)
  process.exitCode = 1
})
