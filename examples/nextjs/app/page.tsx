"use client";

import { useEffect, useState } from "react";
import { Button, AIResponse, PromptInput } from "@pix-ui/react";

export default function Page() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <Button variant="outline" onClick={() => setDark((d) => !d)}>
        Toggle theme
      </Button>
      <AIResponse model="gpt-5" text="Both runs skipped the certificate read." thinking={"Filtered 42 runs"} />
      <PromptInput placeholder="Ask a follow-up…" />
    </main>
  );
}
