import { Skeleton } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
      <div style={{ width: 120 }}>
        <Skeleton variant="block" height={64} label="Loading block" />
      </div>
      <div style={{ width: 160 }}>
        <Skeleton variant="text" lines={3} label="Loading text" />
      </div>
      <Skeleton variant="circle" height={40} label="Loading avatar" />
    </div>
  );
}
