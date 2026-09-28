import { DataTable } from "@pix-ui/react";

export default function Example() {
  return (
    <DataTable
      caption="Recent transactions"
      columns={[
        { key: "vendor", label: "Vendor", strong: true },
        { key: "amount", label: "Amount", numeric: true, align: "right" },
        { key: "status", label: "Status" },
      ]}
      rows={[
        { vendor: "Acme Corp", amount: 4200, status: "Matched" },
        { vendor: "Globex", amount: 1180, status: "Pending" },
        { vendor: "Initech", amount: 950, status: "Matched" },
      ]}
    />
  );
}
