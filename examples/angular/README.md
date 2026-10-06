# PIX + Angular starter

A minimal Angular standalone-component app demonstrating `@pix-ui/css` (installed from npm), the framework-agnostic PIX stylesheet. No React or Angular-specific PIX package is required — just class names.

`node_modules/@pix-ui/css/dist/pix.css` is registered in `angular.json` under `projects.pix-example-angular.architect.build.options.styles`, and the template uses `pix-*` classes directly (`pix-btn`, `pix-btn--filled`, `pix-callout`, `pix-callout--truth`, …).

## Run it

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Build

```bash
npm run build
```

Output is written to `dist/pix-example-angular`.

## Learn more

See the full component and class reference at [github.com/Digital-With-Deep/pix](https://github.com/Digital-With-Deep/pix).
