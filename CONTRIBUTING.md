# Contributing

Two ways to help, and the first one needs no account and no tooling.

## Suggest an entry or a correction

Use the form at <https://lambdafolio.github.io/suggest>. One box: a language
name, a link, or a sentence. A bot replies with what it understood — the entry,
the field, the proposed value, and the source — and asks you to confirm.

Reply `yes` and it queues. Reply with a correction and it re-reads you. Nothing
is applied until you confirm, and a misreading costs you one word.

You can also open an issue on GitHub directly; both paths land in the same
queue.

### What makes a request easy to accept

- **A primary source.** The project site, the specification, the manual, the
  repository, or vendor documentation. That is what makes a fact citable.
- **The language's own name**, as its source spells it. Alternate or former
  names are welcome — several corpus entries were renamed (`Oak` → Java,
  `Mocha` → JavaScript), and a duplicate reached by a different spelling is
  caught by name and by slug.
- **A field, if you are correcting something.** "c++ has no gc" is enough; you
  do not need to know that the field is called `memory`. If you do know, say so.

### What will be declined

- **Tools, libraries, frameworks, and data formats.** This corpus holds
  languages, notations, standards, and dialects. A notation *is* in scope — the
  corpus has Jacquard card chains, weaving drafts, and talim numerals. A JSON
  library is not.
- **A link and nothing else**, when it is a forum thread, a wiki page, or a
  social post. Those are recorded as *leads* rather than rejected — a lead is a
  real starting point — but the entry still needs a primary source before any
  fact can be written.
- **A prose rewrite.** "This section is wrong" is a research request, not a
  correction. Corrections are one field on one row; prose is drafted from
  verified facts.

Submissions are public. Do not send anything you would not want quoted back in
an issue thread — because that is exactly what happens.

## Editing the corpus directly

The repository is public and pull requests are welcome. Read
[README.md](./README.md) for the frontmatter contract, the prose skeleton, and
the lint gates, or
[.github/skills/language-entry/](./.github/skills/language-entry/) for the full
authoring procedure.

Run the gates before opening a PR:

```sh
npm run lint:all
npx nuxi typecheck
```

Both run in CI on every pull request, so a green local run means a green PR.

## Licensing of contributions

**Code** — contributions to the application, scripts, and workflows are
licensed under the [MIT License](./LICENSE).

**Content** — the prose in `content/` is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). By submitting
prose you agree to license it on those terms.

**Facts are not copyrightable, and this license does not claim them.** The
frontmatter is a compilation of facts about languages — a release year, a
memory model, a list of paradigms. Facts and short phrases are not protected by
copyright in most jurisdictions, so the content license governs the *prose* and
the *selection and arrangement* of the corpus, not the individual data points.
Nothing here restricts describing, citing, or building on a fact you found on
this site.

## Reporting a problem with a submitted request

Every submission is triaged by a bot and labelled. If a request looks wrong,
malicious, or was declined unfairly, say so in the issue thread — one reply is
enough to reopen a declined request with a stronger source. Do not open a new
issue to duplicate it.
