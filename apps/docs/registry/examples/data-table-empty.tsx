import { DataTable } from "@pix-ui/react";

export default function Example() {
  return (
    <DataTable
      caption="Transactions"
      columns={[
        { key: "vendor", label: "Vendor", strong: true },
        { key: "amount", label: "Amount", numeric: true, align: "right" },
        { key: "status", label: "Status" },
      ]}
      rows={[]}
      emptyMessage="No transactions in this date range."
    />
  );
}
