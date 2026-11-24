export const html = `<div class="pix-field" style="max-width:360px">
  <label class="pix-field__label" for="run-name">Run name<span class="pix-field__required" aria-hidden="true">*</span></label>
  <input class="pix-input" id="run-name" required maxlength="40" value="Nightly evaluation" aria-describedby="run-name-count" />
  <div class="pix-field__meta">
    <span class="pix-field__hint">Shown in traces and exports.</span>
    <span class="pix-field__count" id="run-name-count">18/40</span>
  </div>
</div>`;
export const angular = `<!-- component template -->
<div class="pix-field">
  <label class="pix-field__label" for="run-name">Run name<span class="pix-field__required" aria-hidden="true">*</span></label>
  <input class="pix-input" id="run-name" required maxlength="40" [(ngModel)]="name" aria-describedby="run-name-hint run-name-count" />
  <div class="pix-field__meta">
    <span class="pix-field__hint" id="run-name-hint">Shown in traces and exports.</span>
    <span class="pix-field__count" id="run-name-count" [class.pix-field__count--limit]="name.length >= 40">{{ name.length }}/40</span>
  </div>
</div>`;
