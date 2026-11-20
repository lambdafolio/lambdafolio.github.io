# UI mockups — suggestion intake

Static SVG mockups of the interface described in
`docs/suggestion-intake-plan.md`. They are design references, not shipped
assets: nothing in `app/` imports them, and they live under `docs/` so the
prerender route discovery in `nuxt.config.ts` never sees them.

| file | screen | contract it illustrates |
| --- | --- | --- |
| `01-suggest-entry.svg` | `/suggest` — one-box intake | one textarea, nothing required; the same shapes the skill accepts (§5.1) |
| `02-confirm-parse.svg` | the bot's echo on the issue | parse is a proposal, confirmed in one word before anything is queued (§5.2) |
| `03-entry-page.svg` | an existing entry, with the new affordances | per-row challenge links + the Maintain rail (§11) |
| `04-backlog.svg` | `/backlog` — derived queue | the ranking from §8, queues A–D |

## Conventions

Mockups use the site's real dark-theme tokens from
`app/assets/css/main.css` (`--ui-background: #000`, `--ui-text: #ccc`,
`--link-color: lightblue`) rather than generic grays, so a mockup and the built
page are comparable side by side.

Two colour pairs are semantic and should survive into implementation:

| meaning | stroke / fill | text |
| --- | --- | --- |
| passed / primary source | `#2f6b48` on `#1d3a2a` | `#8fd9ab` |
| warning / leads only | `#6b5a2f` on `#3a3320` | `#e0c07f` |
| track 2 / needs curator | `#6b3747` on `#33202a` | `#e39aae` |

## Deliberate omissions

- **No structured fields on intake.** A name, a URL, or one sentence is the
  whole form; kind, entry, field, and value are derived by the parser and then
  echoed back for confirmation. Asking for them up front asks the submitter to
  know things only the parser can work out.
- **No file upload, no image field.** Track-2 assets come from a curator who
  opened the PDF, never from a submission (§5.1).
- **No login, no account.** Reading is public; posting uses a GitHub account,
  because the issue thread is the queue and the audit trail.
- **No status a human must maintain.** The backlog ordering is derived from
  corpus state; there is no "in progress" column to forget to update.
