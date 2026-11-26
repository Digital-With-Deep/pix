// Unit tests for the basic catalog inputs and containers in the PIX catalog. Run after `pnpm build` (they import
// @pix-ui/react from dist).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { Button, Checkbox, DateField, MultiSelect, RadioGroup, Select, Slider, TextField, Textarea } from "@pix-ui/react";
import { A2UISurface, PIX_CATALOG_ID, createA2UIProcessor, pixCatalog, pixFunctions, renderA2UISurface, safeImageSrc } from "../src/index.js";
import { bookingStream, FORM } from "./fixtures/booking-stream.js";

const h = React.createElement;

/** Depth-first search of an unrendered element tree for elements whose props pass `pred`. */
function findWhere(node, pred, out = []) {
  if (Array.isArray(node)) { node.forEach((n) => findWhere(n, pred, out)); return out; }
  if (!node || typeof node !== "object" || !node.props) return out;
  if (pred(node)) out.push(node);
  findWhere(node.props.children, pred, out);
  return out;
}
const findAll = (node, type) => findWhere(node, (n) => n.type === type);

function setup(messages = bookingStream, surfaceId = FORM) {
  const errors = [];
  const processor = createA2UIProcessor({ catalogIds: [PIX_CATALOG_ID], onError: (m) => errors.push(m.error) });
  processor.process(messages);
  const actions = [];
  const tree = () => renderA2UISurface({ surface: processor.getSurface(surfaceId), processor, onAction: (m) => actions.push(m) });
  /** Each input host with the PIX field it renders for its current value, wired to the host's data model writer. */
  const fields = () => findWhere(tree(), (n) => typeof n.props.render === "function" && n.props.checks !== undefined).map((host) => ({
    host, field: host.props.render(host.props.value, host.props.write, undefined),
  }));
  const model = () => processor.getSurface(surfaceId).dataModel;
  return { processor, errors, actions, tree, fields, model };
}
const byLabel = (list, label) => {
  const found = list.find((f) => f.field.props.label === label);
  assert.ok(found, `field ${label}`);
  return found;
};
const surface = (components, dataModel = {}) => [{ version: "1.0", createSurface: { surfaceId: "s", catalogId: PIX_CATALOG_ID, dataModel, components } }];

test("catalog: declares the basic catalog inputs, containers and validation functions", () => {
  const { components, functions, $defs } = pixCatalog;
  for (const name of ["TextField", "CheckBox", "ChoicePicker", "Slider", "DateTimeInput"]) {
    const def = components[name];
    assert.ok(def, name);
    assert.deepEqual(def.allOf[0], { $ref: "common_types.json#/$defs/Checkable" }, `${name} takes @checks`);
    assert.deepEqual(def.allOf[1].properties.component, { const: name });
  }
  assert.deepEqual(components.TextField.allOf[1].properties.variant.enum, ["shortText", "longText", "number", "obscured"]);
  assert.deepEqual(components.TextField.allOf[1].required, ["component", "label", "value"]);
  assert.deepEqual(components.CheckBox.allOf[1].required, ["component", "label", "value"]);
  assert.deepEqual(components.ChoicePicker.allOf[1].required, ["component", "options", "value"]);
  assert.equal(components.ChoicePicker.allOf[1].properties.value.$ref, "common_types.json#/$defs/DynamicStringList");
  assert.deepEqual(components.ChoicePicker.allOf[1].properties.variant.enum, ["multipleSelection", "mutuallyExclusive"]);
  assert.deepEqual(components.Slider.allOf[1].required, ["component", "value", "max"]);
  assert.deepEqual(components.DateTimeInput.allOf[1].required, ["component", "value"]);
  assert.deepEqual(components.Image.properties.fit.enum, ["contain", "cover", "fill", "none", "scaleDown"]);
  assert.deepEqual(components.Image.properties.variant.enum, ["icon", "avatar", "smallFeature", "mediumFeature", "largeFeature", "header"]);
  assert.equal(components.Tabs.properties.tabs.items.$ref, "#/$defs/TabItem");
  assert.deepEqual($defs.TabItem.required, ["title", "child"]);
  assert.deepEqual($defs.ChoiceOption.required, ["label", "value"]);
  assert.deepEqual(components.Modal.required, ["component", "trigger", "content"]);
  assert.deepEqual(components.List.properties.direction.enum, ["vertical", "horizontal"]);
  for (const f of ["regex", "length", "numeric", "email"]) assert.equal(functions[f].returnType, "validationResult", f);
  assert.deepEqual(functions.regex.properties.args.required, ["value", "pattern"]);
});

test("validation functions", () => {
  const { regex, length, numeric, email } = pixFunctions;
  assert.equal(regex({ value: "ORD-20417", pattern: "^ORD-\\d+$" }).valid, true);
  assert.equal(regex({ value: "20417", pattern: "^ORD-" }).valid, false);
  assert.equal(length({ value: "abc", min: 2, max: 3 }).valid, true);
  assert.equal(length({ value: "abcd", max: 3 }).valid, false);
  assert.equal(numeric({ value: "7", min: 1, max: 6 }).valid, false);
  assert.equal(numeric({ value: 4, min: 1, max: 6 }).valid, true);
  assert.equal(numeric({ value: "", min: 1 }).valid, false);
  assert.equal(email({ value: "dana@example.com" }).valid, true);
  assert.equal(email({ value: "dana@example" }).valid, false);
});

test("renders the basic catalog inputs and containers with PIX components", () => {
  const { errors } = setup();
  assert.deepEqual(errors, []);
  const html = renderToString(h(A2UISurface, { messages: bookingStream }));
  assert.match(html, /Full name/);
  assert.match(html, /<textarea[^>]*placeholder="Anything we should know"/); // longText renders Textarea
  assert.match(html, /role="radiogroup"/); // a single choice in checkbox style renders RadioGroup
  assert.match(html, /Garden room/); // option labels resolve bindings
  assert.match(html, /type="range"[^>]*min="1" max="9" step="1"/); // eight steps between 1 and 9
  assert.match(html, /type="date"/);
  assert.match(html, /value="2026-12-04"/);
  assert.match(html, /type="time"/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /Directions/);
  assert.match(html, /north gate/); // the first tab's child
  assert.doesNotMatch(html, /visitor garage/); // only the selected tab renders
  assert.match(html, /Read the policy/); // the modal trigger; PIX Dialog renders into the page after mount
  assert.match(html, /role="list"/);
  assert.match(html, /<img[^>]*alt="Harbor room"/); // template items resolve relative paths
  assert.match(html, /<img[^>]*alt="Garden room"/);
});

test("validation messages show on the field once it holds a value, not on an untouched empty field", () => {
  const html = renderToString(h(A2UISurface, { messages: bookingStream }));
  assert.match(html, /Enter a valid email address/); // the prefilled value fails its check
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html, />Enter your name</); // empty and untouched (the submit button still lists it in its title)

  const { processor, fields } = setup();
  processor.setData(FORM, "/form/guests", 8);
  const guests = byLabel(fields(), "Guests");
  assert.deepEqual(guests.host.props.checks, { valid: false, messages: ["Up to 6 guests per visit"] });
  assert.match(renderToString(renderA2UISurface({ surface: processor.getSurface(FORM), processor })), /Up to 6 guests per visit/);
});

test("two-way binding: inputs write to the data model and the action context reads it", () => {
  const { fields, model, tree, actions } = setup();
  const list = fields();

  const name = byLabel(list, "Full name");
  assert.equal(name.field.type, TextField);
  assert.equal(name.field.props.type, "text");
  assert.equal(name.field.props.required, true); // a required check adds the marker
  name.field.props.onChange("Dana Reyes");
  assert.equal(model().form.name, "Dana Reyes");
  assert.equal(byLabel(fields(), "Full name").host.props.value, "Dana Reyes");

  assert.equal(byLabel(list, "Notes").field.type, Textarea);

  const room = byLabel(list, "Room");
  assert.equal(room.field.type, RadioGroup);
  assert.deepEqual(room.field.props.options, [{ value: "R-12", label: "Harbor room" }, { value: "R-14", label: "Garden room" }]);
  room.field.props.onChange("R-14");
  assert.deepEqual(model().form.room, ["R-14"]); // a single choice is still an array

  const extras = byLabel(list, "Extras");
  assert.equal(extras.field.type, MultiSelect);
  assert.equal(extras.field.props.variant, "tiles");
  assert.deepEqual(extras.field.props.value, ["parking"]);
  extras.field.props.onChange(["parking", "lunch"]);
  assert.deepEqual(model().form.extras, ["parking", "lunch"]);

  const guests = byLabel(list, "Guests");
  assert.equal(guests.field.type, Slider);
  assert.equal(guests.field.props.step, 1);
  guests.field.props.onChange(5);
  assert.equal(model().form.guests, 5);

  const date = byLabel(list, "Visit date");
  assert.equal(date.field.type, DateField);
  assert.equal(date.field.props.type, "date");
  assert.equal(date.field.props.min, "2026-12-01");
  date.field.props.onChange("2026-12-09");
  assert.equal(model().form.date, "2026-12-09");
  assert.equal(byLabel(list, "Start time").field.props.type, "time");

  const agree = byLabel(list, "I agree to the visitor policy");
  assert.equal(agree.field.type, Checkbox);
  assert.equal(agree.field.props.checked, false);

  // The submit button stays disabled until its checks pass, then sends what the person entered.
  let [submit] = findAll(tree(), Button).filter((b) => b.props.children === "Book visit");
  assert.equal(submit.props.disabled, true);
  assert.equal(submit.props.title, "Agree to the visitor policy");
  agree.field.props.onChange(true);
  assert.equal(model().form.agree, true);
  [submit] = findAll(tree(), Button).filter((b) => b.props.children === "Book visit");
  assert.equal(submit.props.disabled, false);
  submit.props.onClick();
  assert.deepEqual(actions[0].action.context, { name: "Dana Reyes", room: ["R-14"], guests: 5, date: "2026-12-09", agree: true });
});

test("text field variants, choice picker styles and date-time modes map to the right PIX fields", () => {
  const { fields } = setup(surface([
    { id: "root", component: "Column", children: ["code", "pin", "count", "tags", "tag", "plan", "when", "day"] },
    { id: "code", component: "TextField", label: "Code", value: "A-1" },
    { id: "pin", component: "TextField", label: "PIN", variant: "obscured", value: { "@path": "/pin" } },
    { id: "count", component: "TextField", label: "Count", variant: "number", value: { "@path": "/count" } },
    { id: "tags", component: "ChoicePicker", label: "Tags", variant: "multipleSelection", filterable: true, options: [{ label: "A", value: "a" }], value: { "@path": "/tags" } },
    { id: "tag", component: "ChoicePicker", label: "Tag", variant: "multipleSelection", displayStyle: "dropdown", options: [{ label: "A", value: "a" }], value: { "@path": "/tags" } },
    { id: "plan", component: "ChoicePicker", label: "Plan", filterable: true, options: [{ label: "Basic", value: "basic" }], value: { "@path": "/plan" } },
    { id: "when", component: "DateTimeInput", label: "When", enableDate: true, enableTime: true, value: { "@path": "/when" } },
    { id: "day", component: "DateTimeInput", label: "Day", value: { "@path": "/day" } },
  ], { pin: "", count: "3", tags: [], plan: ["basic"], when: "2026-12-04T09:30:00Z", day: "" }), "s");
  const list = fields();
  const code = byLabel(list, "Code");
  assert.equal(code.host.props.bound, false); // a literal value is held locally
  assert.equal(byLabel(list, "PIN").field.props.type, "password");
  assert.equal(byLabel(list, "Count").field.props.type, "number");
  assert.equal(byLabel(list, "Count").field.props.value, "3");
  const tags = byLabel(list, "Tags");
  assert.equal(tags.field.props.variant, "dropdown");
  assert.equal(tags.field.props.searchable, true);
  assert.equal(byLabel(list, "Tag").field.props.searchable, false);
  const plan = byLabel(list, "Plan");
  assert.equal(plan.field.type, Select);
  assert.equal(plan.field.props.value, "basic");
  assert.equal(byLabel(list, "When").field.props.type, "datetime");
  assert.equal(byLabel(list, "When").field.props.value, "2026-12-04T09:30:00Z"); // DateField shows it in local time
  assert.equal(byLabel(list, "Day").field.props.type, "date"); // neither flag set: a date picker
});

test("tabs, modal, list and image", () => {
  const { tree } = setup();
  const t = tree();
  const tabs = findWhere(t, (n) => Array.isArray(n.props.titles) && Array.isArray(n.props.panels))[0];
  assert.deepEqual(tabs.props.titles, ["Directions", "Parking"]);
  assert.equal(tabs.props.panels.length, 2);
  const modal = findWhere(t, (n) => n.props.trigger !== undefined && n.props.content !== undefined && n.props.title === "Visitor policy")[0];
  assert.ok(modal, "Modal host");
  const html = renderToString(modal);
  assert.match(html, /Read the policy/);
  assert.doesNotMatch(html, /front desk/); // closed until the trigger is pressed

  const items = renderToString(h(A2UISurface, { messages: surface([
    { id: "root", component: "List", children: ["a", "b", "c"] },
    { id: "a", component: "Image", url: "javascript:alert(1)", description: "Unsafe" },
    { id: "b", component: "Image", url: "data:image/svg+xml;base64,PHN2Zz4=", description: "Vector" },
    { id: "c", component: "Image", url: "/img/plan.png", description: "Floor plan", variant: "header" },
  ]) }));
  assert.doesNotMatch(items, /Unsafe|Vector|javascript:/);
  assert.match(items, /<img[^>]*src="\/img\/plan\.png"[^>]*alt="Floor plan"/);
  assert.match(items, /object-fit:cover/);
  assert.equal((items.match(/role="listitem"/g) || []).length, 1); // images that render nothing leave no empty item

  assert.equal(safeImageSrc("https://images.example.com/a.png"), "https://images.example.com/a.png");
  assert.equal(safeImageSrc("data:image/png;base64,iVBORw0KGgo="), "data:image/png;base64,iVBORw0KGgo=");
  assert.equal(safeImageSrc("mailto:a@example.com"), undefined);
});
