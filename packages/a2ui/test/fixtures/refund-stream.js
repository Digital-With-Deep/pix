// A recorded, fictional A2UI v1.0 message stream: a support agent looks up an order, streams an answer and asks a
// person to approve a refund. All names, ids and amounts are made up.
import { PIX_CATALOG_ID } from "../../src/catalog.js";

export const SURFACE = "refund_review";

export const refundStream = [
  {
    version: "1.0",
    createSurface: {
      surfaceId: SURFACE,
      catalogId: PIX_CATALOG_ID,
      sendDataModel: true,
      dataModel: {
        order: { id: "ORD-20417", customer: "Rowan Ellis", total: 184.5 },
        answer: { status: "generating", text: "" },
        approval: { status: "pending" },
      },
      components: [
        { id: "root", component: "Column", children: ["header", "metrics", "lookup", "answer", "lines"] },
        { id: "header", component: "Text", variant: "heading", text: { "@call": "formatString", args: { value: "Refund review for ${/order/id}" } } },
      ],
    },
  },
  {
    version: "1.0",
    updateComponents: {
      surfaceId: SURFACE,
      components: [
        { id: "metrics", component: "Grid", min: 160, children: ["total_metric"] },
        { id: "total_metric", component: "MetricCard", label: "Order total", value: { "@call": "formatCurrency", args: { value: { "@path": "/order/total" }, currency: "USD" } }, hint: "Today" },
        {
          id: "lookup",
          component: "ToolCall",
          name: "orders.lookup",
          status: "approval",
          input: { orderId: "ORD-20417" },
          output: { status: "delivered", damaged: true },
          duration: "310ms",
          child: "refund_approval",
        },
        {
          id: "refund_approval",
          component: "ApprovalCard",
          title: "Issue a refund",
          summary: "Refund the full order to the original payment method.",
          agent: "support-agent",
          target: { "@path": "/order/id" },
          reason: "The customer reported the parcel arrived damaged and sent photos.",
          risk: "high",
          reversible: false,
          changes: [{ field: "Refund amount", key: "amount", before: null, after: "$184.50" }],
          evidence: [{ label: "ticket 5531", href: "https://support.example.com/tickets/5531" }, { label: "bad link", href: "javascript:alert(1)" }],
          status: { "@path": "/approval/status" },
          approveAction: { event: { name: "refund.approve", userMessage: "Approved the refund", context: { orderId: { "@path": "/order/id" }, amount: { "@path": "/order/total" } } } },
          rejectAction: { event: { name: "refund.reject", context: { orderId: { "@path": "/order/id" } } } },
          editAction: { event: { name: "refund.edit", context: { orderId: { "@path": "/order/id" } } } },
        },
        { id: "answer", component: "AIResponse", status: { "@path": "/answer/status" }, text: { "@path": "/answer/text" }, model: "support-agent" },
        { id: "lines", component: "Column", gap: 4, children: { componentId: "line_item", path: "/order/lines" } },
        { id: "line_item", component: "Text", text: { "@call": "formatString", args: { value: "${@index(offset: 1)}. ${name} x${qty}" } } },
      ],
    },
  },
  { version: "1.0", updateDataModel: { surfaceId: SURFACE, path: "/answer/status", value: "streaming" } },
  { version: "1.0", updateDataModel: { surfaceId: SURFACE, path: "/answer/text", value: "The parcel was marked **damaged** on delivery." } },
  { version: "1.0", updateDataModel: { surfaceId: SURFACE, path: "/answer/status", value: "done" } },
  { version: "1.0", updateDataModel: { surfaceId: SURFACE, path: "/order/lines", value: [{ name: "Ceramic mug", qty: 2 }, { name: "Linen towel", qty: 1 }] } },
];
