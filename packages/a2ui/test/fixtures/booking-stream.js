// A fictional A2UI v1.0 message stream that uses the basic catalog's inputs and containers: an agent asks a person to
// book a site visit. All names, addresses and values are made up.
import { PIX_CATALOG_ID } from "../../src/catalog.js";

export const FORM = "visit_booking";

const required = (path) => ({ "@call": "required", args: { value: { "@path": path } } });

export const bookingStream = [
  {
    version: "1.0",
    createSurface: {
      surfaceId: FORM,
      catalogId: PIX_CATALOG_ID,
      dataModel: {
        form: { name: "", email: "dana@example", notes: "", room: [], extras: ["parking"], guests: 4, date: "2026-12-04", start: "", agree: false },
        rooms: [{ id: "R-12", label: "Harbor room" }, { id: "R-14", label: "Garden room" }],
      },
      components: [
        { id: "root", component: "Column", children: ["title", "name", "email", "notes", "room", "extras", "guests", "date", "start", "agree", "more", "help", "photos", "submit"] },
        { id: "title", component: "Text", variant: "heading", text: "Book a site visit" },
        { id: "name", component: "TextField", label: "Full name", value: { "@path": "/form/name" }, "@checks": [{ condition: required("/form/name"), message: "Enter your name" }] },
        { id: "email", component: "TextField", label: "Email", value: { "@path": "/form/email" }, "@checks": [{ condition: { "@call": "email", args: { value: { "@path": "/form/email" } } }, message: "Enter a valid email address" }] },
        { id: "notes", component: "TextField", label: "Notes", variant: "longText", placeholder: "Anything we should know", value: { "@path": "/form/notes" } },
        { id: "room", component: "ChoicePicker", label: "Room", options: [{ label: "Harbor room", value: "R-12" }, { label: { "@path": "/rooms/1/label" }, value: "R-14" }], value: { "@path": "/form/room" } },
        { id: "extras", component: "ChoicePicker", label: "Extras", variant: "multipleSelection", options: [{ label: "Parking", value: "parking" }, { label: "Lunch", value: "lunch" }], value: { "@path": "/form/extras" } },
        { id: "guests", component: "Slider", label: "Guests", min: 1, max: 9, steps: 8, value: { "@path": "/form/guests" }, "@checks": [{ condition: { "@call": "numeric", args: { value: { "@path": "/form/guests" }, max: 6 } }, message: "Up to 6 guests per visit" }] },
        { id: "date", component: "DateTimeInput", label: "Visit date", enableDate: true, min: "2026-12-01", value: { "@path": "/form/date" } },
        { id: "start", component: "DateTimeInput", label: "Start time", enableTime: true, value: { "@path": "/form/start" } },
        { id: "agree", component: "CheckBox", label: "I agree to the visitor policy", value: { "@path": "/form/agree" } },
        { id: "more", component: "Tabs", tabs: [{ title: "Directions", child: "directions" }, { title: "Parking", child: "parking_info" }] },
        { id: "directions", component: "Text", text: "Enter from the north gate on Example Street." },
        { id: "parking_info", component: "Text", text: "Level 2 of the visitor garage." },
        { id: "help", component: "Modal", title: "Visitor policy", trigger: "help_button", content: "policy" },
        { id: "help_button", component: "Button", variant: "borderless", label: "Read the policy", action: { event: { name: "policy.open" } } },
        { id: "policy", component: "Markdown", text: "Visitors sign in at the front desk." },
        { id: "photos", component: "List", direction: "horizontal", children: { componentId: "photo", path: "/rooms" } },
        { id: "photo", component: "Image", url: "https://images.example.com/rooms/1.jpg", description: { "@path": "label" }, variant: "smallFeature", fit: "cover" },
        {
          id: "submit", component: "Button", label: "Book visit",
          action: { event: { name: "visit.book", context: { name: { "@path": "/form/name" }, room: { "@path": "/form/room" }, guests: { "@path": "/form/guests" }, date: { "@path": "/form/date" }, agree: { "@path": "/form/agree" } } } },
          "@checks": [
            { condition: required("/form/name"), message: "Enter your name" },
            { condition: { "@path": "/form/agree" }, message: "Agree to the visitor policy" },
          ],
        },
      ],
    },
  },
];
