"use client";
import * as React from "react";
import { Conversation } from "@pix-ui/react";

const answer = "Three invoices are open for **Northwind Supply**:\n\n| Invoice | Due | Amount |\n|:--|:--|--:|\n| INV-20811 | Nov 30 | $6,200.00 |\n| INV-20877 | Dec 4 | $9,980.00 |\n| INV-20931 | Dec 9 | $2,240.00 |\n\nThe first one is due in eight days.";

export default function Example() {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (n >= answer.length) return;
    const t = setTimeout(() => setN(n + 6), 30);
    return () => clearTimeout(t);
  }, [n]);
  return (
    <Conversation
      height={360}
      messages={[
        { id: "q", role: "user", author: "Sam", content: "What do we owe Northwind?" },
        { id: "a", role: "assistant", author: "Payables agent", content: answer.slice(0, n), streaming: n < answer.length },
      ]}
    />
  );
}
