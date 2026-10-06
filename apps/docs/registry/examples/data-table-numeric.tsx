import { DataTable } from "@pix-ui/react";

export default function Example() {
  return (
    <DataTable
      caption="Vendor payouts"
      columns={[
        {
          key: "id",
          label: "ID",
          render: (row) => (
            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "var(--fg3, #71717a)" }}>
              {row.id}
            </span>
          ),
        },
        { key: "vendor", label: "Vendor", strong: true },
        { key: "amount", label: "Amount", numeric: true, align: "right", sortable: true },
        { key: "status", label: "Status", align: "center" },
      ]}
      rows={[
        { id: "TXN-48217", vendor: "Acme Corp", amount: 4820.0, status: "Matched" },
        { id: "TXN-48223", vendor: "Globex", amount: 1240.5, status: "Pending" },
        { id: "TXN-48231", vendor: "Initech", amount: 980.0, status: "Matched" },
        { id: "TXN-48244", vendor: "Umbrella Logistics", amount: 15200.0, status: "Review" },
        { id: "TXN-48256", vendor: "Soylent Supply Co", amount: 326.75, status: "Matched" },
      ]}
      initialSort={{ key: "amount", dir: "desc" }}
    />
  );
}
