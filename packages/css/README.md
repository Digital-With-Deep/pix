# @pix-ui/css

Framework-agnostic CSS for **PIX — Primitives for Intelligent eXperiences**: tokens, element defaults and `pix-*` component classes. Works with Vue, Svelte, Angular, Astro, server templates or plain HTML.

```sh
npm i @pix-ui/css
```

```js
import "@pix-ui/css";                 // everything: tokens + base + components
// or pick parts:
import "@pix-ui/tokens/css";
import "@pix-ui/css/components.css";   // no element resets
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pix-ui/css/dist/pix.css">

<button class="pix-btn">Run evaluation</button>
<button class="pix-btn pix-btn--outline pix-btn--sm">Compare</button>
<span class="pix-badge pix-badge--success"><span class="pix-badge__dot"></span>Passed</span>
<div class="pix-callout pix-callout--claim"><span><b class="pix-callout__title">Model claim</b>Rate 0.10 applied.</span></div>
<div class="pix-prompt"><textarea rows="2" placeholder="Ask a follow-up…"></textarea><span class="pix-prompt__hint">Enter to send</span></div>
```

Dark mode: set `data-theme="dark"` (or class `dark`) on `<html>`. To follow the OS setting, import `@pix-ui/tokens/css/auto-dark` before `@pix-ui/css/base.css` and `components.css`.

Classes: `pix-btn` (`--filled --secondary --outline --destructive --ghost --sm --lg`), `pix-badge` (`--accent --success --warning --danger --info --outline`), `pix-card`, `pix-metric`, `pix-callout` (`--note --warn --truth --claim`), `pix-field`, `pix-input`, `pix-select`, `pix-textarea`, `pix-switch`, `pix-tabs`/`pix-tab`, `pix-avatar`, `pix-table`, `pix-skeleton`, `pix-ask`, `pix-response`, `pix-citation`, `pix-thinking`, `pix-prompt`, `pix-claim`/`pix-truth`/`pix-fault`, `pix-stack`, `pix-row`, `pix-grid`.
