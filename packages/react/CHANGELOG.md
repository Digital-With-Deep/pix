# @pix-ui/react

## 0.2.0

### Minor Changes

- de11087: Add the `Sidebar` component — an app navigation rail with icon rows, section headings, active state, badges, and nested groups that expand into **smoothly animated submenus** (grid-template-rows 0fr→1fr, honoring the global reduced-motion rule). `header` and `footer` are free slots for the brand, a search field and the account area; selection is controlled or uncontrolled.

### Patch Changes

- df95706: Add a subtle hover background to interactive rows and options, and keep underline tabs flat under custom radii.

  - `DataTable` rows, `RadioGroup` options, and `MultiSelect` option cards/listbox rows now show a mode-aware `--bg-muted` wash on hover (excluded on disabled items; selected/checked states unchanged).
  - `Tabs` underline buttons carry a `data-pix-tab` marker so consumers that apply a global radius override can exclude them — rounding a tab button curves its underline indicator.
