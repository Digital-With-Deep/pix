# @pix-ui/react-native

React Native components for **PIX — Primitives for Intelligent eXperiences** (iOS, Android, Expo).

```sh
npm i @pix-ui/react-native @pix-ui/tokens
```

```tsx
import { PixProvider, AIResponse, PromptInput, Button, MetricCard } from "@pix-ui/react-native";

export default function App() {
  return (
    <PixProvider>{/* follows the device light/dark setting */}
      <MetricCard label="Pass rate" value="94.2%" delta="1.8 pts" deltaType="up" />
      <AIResponse model="gpt-5" duration="1.4s" text="Both runs skipped the certificate read." thinking={"Filtered 42 runs\nGrouped by missing tool call"} citations={["run #0042"]} />
      <PromptInput placeholder="Ask a follow-up…" onSubmit={(q) => console.log(q)} />
    </PixProvider>
  );
}
```

Components (v0.1): `PixProvider`, `usePixTheme`, `Text`, `Stack`, `Button`, `Badge`, `Card`, `MetricCard`, `Callout`, `Avatar`, `Switch`, `TextField`, `Skeleton`, `ThinkingTrace`, `AIResponse`, `PromptInput`. Raw tokens: `rnTokens`.

Parity with `@pix-ui/react` is tracked in the root README's component matrix.
