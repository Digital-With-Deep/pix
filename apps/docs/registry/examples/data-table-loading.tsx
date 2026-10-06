import { DataTable } from "@pix-ui/react";

export default function Example() {
  return (
    <DataTable
      loading
      caption="Vendor payouts"
      skeletonRows={5}
      columns={[
        { key: "id", label: "ID" },
        { key: "vendor", label: "Vendor", strong: true },
        { key: "amount", label: "Amount", numeric: true, align: "right" },
        { key: "status", label: "Status", align: "center" },
      ]}
      rows={[]}
    />
  );
}
