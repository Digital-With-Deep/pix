# @pix-ui/tokens

Design tokens for **PIX — Primitives for Intelligent eXperiences**. One source file (`src/pix.tokens.json`), generated for every platform.

```sh
npm i @pix-ui/tokens
```

| Platform | Import / file |
| --- | --- |
| CSS custom properties | `@pix-ui/tokens/css` (light on `:root`, dark on `[data-theme="dark"]` or `.dark`) |
| CSS, follows OS dark mode | `@pix-ui/tokens/css/auto-dark` |
| SCSS variables | `@pix-ui/tokens/scss` → `$pix-accent`, `$pix-dark-accent` … |
| JS / TS objects | `import { tokens, cssVar } from "@pix-ui/tokens"` |
| React Native (unitless numbers) | `import { rnTokens } from "@pix-ui/tokens/react-native"` |
| Raw JSON | `@pix-ui/tokens/json` |
| iOS (UIKit + SwiftUI, dynamic dark mode) | `dist/ios/PixTokens.swift` → `PixColor.accent`, `Color.Pix.accent`, `PixSpace.s4` |
| Android XML | `dist/android/values{,-night}/pix_colors.xml`, `values/pix_dimens.xml` → `@color/pix_accent` |
| Jetpack Compose | `dist/compose/PixTokens.kt` → `PixLightColors.accent`, `PixSpace.s4` |
| Flutter | `dist/flutter/pix_tokens.dart` → `PixColors.light.accent`, `PixSpace.s4` |

Native files are plain source: copy them into your app (or add a build step that copies from `node_modules/@pix-ui/tokens/dist`).

## Changing tokens

Edit `src/pix.tokens.json`, then `npm run build`. Colour values may be hex, `rgb()`/`rgba()`, or an alias `{other-token}`; a colour with `{ "light": …, "dark": … }` differs per theme, a plain string applies to both.
