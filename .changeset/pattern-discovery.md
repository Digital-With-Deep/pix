---
"@pix-ui/react": minor
---

Add the pattern discovery components: recurring problems an agent finds in traces, and how a person reviews, acts on and configures them.

- `PatternList` is the triage list: severity, impact counted in traces, users or sessions, a trend, last seen and status, with search, severity and status filters, grouping, and closed and duplicate patterns hidden until asked for.
- `PatternDetail` shows one finding in full: summary, a suggested fix labelled as confirmed or a hypothesis, impact over time with counts or percentages, a per-model comparison that flags over-represented models, example traces with the passage that matters highlighted and the reason behind it, and code references. Status, severity and categories are editable with an optional reason, and a rating says whether the finding was useful. "Copy as prompt" copies a Markdown brief for a coding agent; `patternPrompt` builds it without the button.
- `PatternRuleEditor` edits a discovery rule: trace scope, concerns to watch for, custom instructions and a look-back window from 3 hours to 30 days, with Run now and the last run's coverage, results and gaps. `nearestPatternLookBack` snaps any value to a listed window.
- `PatternAlertSettings` sets where pattern alerts go (one Slack channel alongside webhooks and PagerDuty), the lowest severity that sends one, whether informational patterns alert, and a Slack mention that asks an agent or teammate to investigate. Webhook URLs and integration keys are never rendered in full. `patternAlerts` applies the same rule in your own code.
