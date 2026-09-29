import "@pix-ui/react/styles.css";
import { createRoot } from "react-dom/client";
import { Button, MetricCard } from "@pix-ui/react";

createRoot(document.getElementById("root")!).render(
  <main style={{ maxWidth: 640, margin: "40px auto" }}>
    <MetricCard label="Runs" value="1,284" />
    <Button variant="filled">Run evaluation</Button>
  </main>,
);
