import { Skeleton } from "@pix-ui/react";

export default function Example() {
  return (
    <Skeleton label="Loading profile">
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: 220 }}>
        <Skeleton variant="circle" height={36} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" lines={2} />
        </div>
      </div>
    </Skeleton>
  );
}
