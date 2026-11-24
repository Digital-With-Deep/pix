import { Markdown } from "@pix-ui/react";

export default function Example() {
  return (
    <Markdown text={`### Reconciliation summary

The October close matched **1,204 of 1,210** lines. Six need a look:

1. Four are timing differences that clear on Nov 3.
2. Two are duplicate postings to \`GL-2100\`.
   - Both came from the same import batch.

> Nothing here blocks the close.

| Account | Difference |
|:--|--:|
| GL-2100 | $2,480.00 |
| GL-4400 | $0.00 |

See the [close checklist](#) for the next steps.`} />
  );
}
