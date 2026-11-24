---
"@pix-ui/react": minor
"@pix-ui/react-native": minor
---

Add the trust loop components: what an agent plans, what its answer rests on, how far to trust it, and what it did.

- `PlanView` shows an agent's plan before it acts, with **Proceed**, **Edit plan** and **Do it myself**, then live progress with a pulsing marker on the current step (off under reduced motion) and a summary line when it finishes or fails.
- `InlineCitation` is a numbered source marker inside answer text; hover or focus shows the source's title, state and snippet in a tooltip.
- `SourcePanel` lists the sources with each one's state in words: verified in the truth colour, contradicted in the claim colour, unverified neutral. `activeId` highlights the source a citation points to, controlled or uncontrolled.
- `ConfidenceBadge` states confident, low confidence, needs review or check failed, with an optional score, scope and reason, inline or standalone. Also in `@pix-ui/react-native`.
- `ActionHistory` lists agent actions with Undo and the time left while each undo window is open, then "Locked", and filters by agent and status.
- `AutonomySetting` is a per-task radiogroup from "Suggest only" to "Act on its own", with a plain-language summary of the chosen level.
