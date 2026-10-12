# @pix-ui/react

## 0.1.1

### Patch Changes

- df95706: Add a subtle hover background to interactive rows and options, and keep underline tabs flat under custom radii.

  - `DataTable` rows, `RadioGroup` options, and `MultiSelect` option cards/listbox rows now show a mode-aware `--bg-muted` wash on hover (excluded on disabled items; selected/checked states unchanged).
  - `Tabs` underline buttons carry a `data-pix-tab` marker so consumers that apply a global radius override can exclude them — rounding a tab button curves its underline indicator.
