import * as React from "react";
import {
  ActivityIndicator, Animated, Image, Pressable, Switch as RNSwitch, Text as RNText, TextInput, View,
  type StyleProp, type TextStyle, type ViewStyle,
} from "react-native";
import { usePixTheme } from "./theme";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

// ---------- Text ----------
export type TextVariant = "h1" | "h2" | "h3" | "h4" | "body" | "small" | "meta" | "label" | "mono";
export interface TextProps { variant?: TextVariant; tone?: "primary" | "secondary" | "tertiary" | "inverse" | "accent" | "danger"; children?: React.ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }
export function Text({ variant = "body", tone = "primary", children, style, numberOfLines }: TextProps) {
  const t = usePixTheme();
  const c = { primary: t.color.fg1, secondary: t.color.fg2, tertiary: t.color.fg3, inverse: t.color["fg-inverse"], accent: t.color["accent-fg"], danger: t.color["red-700"] }[tone];
  const v: Record<TextVariant, TextStyle> = {
    h1: { fontSize: t.fontSize["text-4xl"], fontWeight: "700", letterSpacing: -0.7 },
    h2: { fontSize: t.fontSize["text-3xl"], fontWeight: "700", letterSpacing: -0.45 },
    h3: { fontSize: t.fontSize["text-2xl"], fontWeight: "600", letterSpacing: -0.24 },
    h4: { fontSize: t.fontSize["text-xl"], fontWeight: "600" },
    body: { fontSize: t.fontSize["text-base"], lineHeight: t.fontSize["text-base"] * 1.5 },
    small: { fontSize: t.fontSize["text-sm"], lineHeight: t.fontSize["text-sm"] * 1.5 },
    meta: { fontSize: t.fontSize["text-xs"] },
    label: { fontSize: t.fontSize["text-xs"], fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.7 },
    mono: { fontSize: t.fontSize["text-sm"], fontFamily: t.fontFamily.mono },
  };
  const toneFor = variant === "meta" || variant === "label" ? (tone === "primary" ? t.color.fg3 : c) : c;
  return <RNText numberOfLines={numberOfLines} style={[{ color: toneFor, fontFamily: variant === "mono" ? t.fontFamily.mono : undefined }, v[variant], style]}>{children}</RNText>;
}

// ---------- Stack ----------
export interface StackProps { direction?: "row" | "col"; gap?: number; align?: ViewStyle["alignItems"]; justify?: ViewStyle["justifyContent"]; wrap?: boolean; children?: React.ReactNode; style?: StyleProp<ViewStyle> }
export function Stack({ direction = "col", gap = 12, align, justify, wrap, children, style }: StackProps) {
  return <View style={[{ flexDirection: direction === "row" ? "row" : "column", gap, alignItems: align, justifyContent: justify, flexWrap: wrap ? "wrap" : "nowrap" }, style]}>{children}</View>;
}

// ---------- Button ----------
export type ButtonVariant = "primary" | "filled" | "secondary" | "outline" | "destructive" | "ghost";
export interface ButtonProps { variant?: ButtonVariant; size?: "sm" | "md" | "lg"; loading?: boolean; disabled?: boolean; onPress?: () => void; children?: React.ReactNode; accessibilityLabel?: string; style?: StyleProp<ViewStyle> }
export function Button({ variant = "primary", size = "md", loading, disabled, onPress, children, accessibilityLabel, style }: ButtonProps) {
  const t = usePixTheme();
  const k = t.color;
  const map: Record<ButtonVariant, { bg: string; fg: string; border: string; pressed: string }> = {
    primary: { bg: k["zinc-900"], fg: k["fg-inverse"], border: k["zinc-900"], pressed: k["zinc-800"] },
    filled: { bg: k["emerald-500"], fg: "#ffffff", border: k["emerald-500"], pressed: k["emerald-600"] },
    secondary: { bg: k["zinc-100"], fg: k["zinc-900"], border: k["zinc-100"], pressed: k["zinc-200"] },
    outline: { bg: k.surface, fg: k.fg1, border: k.border, pressed: k["bg-subtle"] },
    destructive: { bg: k["red-600"], fg: "#ffffff", border: k["red-600"], pressed: k["red-700"] },
    ghost: { bg: "transparent", fg: k.fg2, border: "transparent", pressed: k["bg-muted"] },
  };
  const m = map[variant];
  const pad = { sm: [6, 12, 13], md: [9, 16, 14], lg: [11, 20, 15] }[size];
  const inert = disabled || loading;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled: !!inert, busy: !!loading }} disabled={inert} onPress={onPress}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 44, paddingVertical: pad[0], paddingHorizontal: pad[1], borderRadius: 3, borderWidth: 1, borderColor: m.border, backgroundColor: pressed ? m.pressed : m.bg, opacity: inert ? 0.5 : 1 }, style]}>
      {loading && <ActivityIndicator size="small" color={m.fg} />}
      {typeof children === "string" ? <RNText style={{ color: m.fg, fontSize: pad[2], fontWeight: "600" }}>{children}</RNText> : children}
    </Pressable>
  );
}

// ---------- Badge ----------
export interface BadgeProps { tone?: Tone | "outline"; dot?: boolean; children?: React.ReactNode; style?: StyleProp<ViewStyle> }
export function Badge({ tone = "neutral", dot, children, style }: BadgeProps) {
  const k = usePixTheme().color;
  const tones = {
    neutral: [k["bg-muted"], k.fg2], accent: [k["accent-bg"], k["accent-fg"]], success: [k["accent-bg"], k["accent-fg"]],
    warning: [k["amber-50"], k["amber-700"]], danger: [k["red-50"], k["red-700"]], info: [k["blue-50"], k["blue-700"]], outline: [k.surface, k.fg2],
  } as const;
  const [bg, fg] = tones[tone];
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: bg, borderWidth: tone === "outline" ? 1 : 0, borderColor: k.border }, style]}>
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fg }} />}
      <RNText style={{ color: fg, fontSize: 11, fontWeight: "600" }}>{children}</RNText>
    </View>
  );
}

// ---------- Card & MetricCard ----------
export function Card({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = usePixTheme();
  return <View style={[{ backgroundColor: t.color.surface, borderWidth: 1, borderColor: t.color.border, borderRadius: t.radius["radius-md"], padding: t.space["space-4"] }, style]}>{children}</View>;
}

export interface MetricCardProps { label: string; value: React.ReactNode; delta?: string; deltaType?: "up" | "down" | "neutral"; hint?: string; progress?: number; style?: StyleProp<ViewStyle> }
export function MetricCard({ label, value, delta, deltaType = "neutral", hint, progress, style }: MetricCardProps) {
  const k = usePixTheme().color;
  const dc = deltaType === "up" ? k["emerald-600"] : deltaType === "down" ? k["red-600"] : k.fg3;
  return (
    <View style={[{ backgroundColor: k.surface, borderWidth: 1, borderColor: k.border, borderRadius: 16, padding: 20 }, style]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="label">{label}</Text>{hint ? <Text variant="meta">{hint}</Text> : null}
      </View>
      <RNText style={{ fontSize: 30, fontWeight: "700", letterSpacing: -0.6, color: k.fg1, marginTop: 8 }}>{value}</RNText>
      {progress != null && <View style={{ marginTop: 10, height: 3, backgroundColor: k["bg-muted"], borderRadius: 2, overflow: "hidden" }}><View style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, height: 3, backgroundColor: k["emerald-500"] }} /></View>}
      {delta ? <RNText style={{ fontSize: 12, fontWeight: "600", marginTop: 4, color: dc }}>{deltaType === "up" ? "▲ " : deltaType === "down" ? "▼ " : ""}{delta}</RNText> : null}
    </View>
  );
}

// ---------- Callout ----------
export interface CalloutProps { tone?: "info" | "note" | "warn" | "truth" | "claim"; title?: string; children?: React.ReactNode; style?: StyleProp<ViewStyle> }
export function Callout({ tone = "info", title, children, style }: CalloutProps) {
  const k = usePixTheme().color;
  const m = {
    info: [k["blue-50"], k["blue-100"], k["blue-800"]], note: [k["bg-subtle"], k.border, k.fg1], warn: [k["amber-50"], k["amber-200"], k["amber-800"]],
    truth: [k["truth-bg"], k["emerald-200"], k["emerald-800"]], claim: [k["claim-bg"], k["red-200"], k["red-700"]],
  }[tone];
  return (
    <View accessibilityRole={tone === "claim" || tone === "warn" ? "alert" : undefined} style={[{ backgroundColor: m[0], borderColor: m[1], borderWidth: 1, borderRadius: 4, paddingVertical: 12, paddingHorizontal: 14 }, style]}>
      {title ? <RNText style={{ color: m[2], fontWeight: "600", fontSize: 13, marginBottom: 2 }}>{title}</RNText> : null}
      {typeof children === "string" ? <RNText style={{ color: m[2], fontSize: 13, lineHeight: 20 }}>{children}</RNText> : children}
    </View>
  );
}

// ---------- Avatar ----------
export interface AvatarProps { name?: string; src?: string; size?: "sm" | "md" | "lg"; square?: boolean; style?: StyleProp<ViewStyle> }
export function Avatar({ name = "", src, size = "md", square, style }: AvatarProps) {
  const k = usePixTheme().color;
  const d = { sm: 24, md: 32, lg: 40 }[size];
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
  return (
    <View accessibilityLabel={name} style={[{ width: d, height: d, borderRadius: square ? 3 : d / 2, backgroundColor: k["bg-muted"], alignItems: "center", justifyContent: "center", overflow: "hidden" }, style]}>
      {src ? <Image source={{ uri: src }} style={{ width: d, height: d }} /> : <RNText style={{ color: k.fg2, fontWeight: "600", fontSize: d * 0.38 }}>{initials}</RNText>}
    </View>
  );
}

// ---------- Switch ----------
export interface SwitchProps { value: boolean; onValueChange?: (v: boolean) => void; label?: string; description?: string; disabled?: boolean }
export function Switch({ value, onValueChange, label, description, disabled }: SwitchProps) {
  const k = usePixTheme().color;
  const control = <RNSwitch value={value} onValueChange={onValueChange} disabled={disabled} trackColor={{ false: k["zinc-300"], true: k["emerald-600"] }} thumbColor="#ffffff" ios_backgroundColor={k["zinc-300"]} accessibilityLabel={label} />;
  if (!label) return control;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 12 }}>
      <View style={{ flex: 1 }}><Text variant="small" style={{ fontWeight: "500", color: k.fg1 }}>{label}</Text>{description ? <Text variant="meta">{description}</Text> : null}</View>
      {control}
    </View>
  );
}

// ---------- TextField ----------
export interface TextFieldProps { label?: string; hint?: string; error?: string; value?: string; onChangeText?: (v: string) => void; placeholder?: string; multiline?: boolean; secureTextEntry?: boolean; style?: StyleProp<ViewStyle> }
export function TextField({ label, hint, error, value, onChangeText, placeholder, multiline, secureTextEntry, style }: TextFieldProps) {
  const k = usePixTheme().color;
  const [focus, setFocus] = React.useState(false);
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? <Text variant="small" style={{ fontWeight: "500", color: k.fg1 }}>{label}</Text> : null}
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={k["fg-muted"]} multiline={multiline} secureTextEntry={secureTextEntry}
        accessibilityLabel={label} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ minHeight: 44, color: k.fg1, fontSize: 15, backgroundColor: k.surface, borderWidth: 1, borderRadius: 3, paddingHorizontal: 10, paddingVertical: 8, borderColor: error ? k["red-500"] : focus ? k.accent : k.border }} />
      {error ? <RNText style={{ color: k["red-700"], fontSize: 12, fontWeight: "500" }}>{error}</RNText> : hint ? <Text variant="meta">{hint}</Text> : null}
    </View>
  );
}

// ---------- Skeleton ----------
export function Skeleton({ width = "100%", height = 12, radius = 3, style }: { width?: number | `${number}%`; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const k = usePixTheme().color;
  const o = React.useRef(new Animated.Value(0.5)).current;
  React.useEffect(() => {
    const a = Animated.loop(Animated.sequence([Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(o, { toValue: 0.5, duration: 700, useNativeDriver: true })]));
    a.start(); return () => a.stop();
  }, [o]);
  return <Animated.View accessibilityLabel="Loading" style={[{ width, height, borderRadius: radius, backgroundColor: k["bg-muted"], opacity: o }, style]} />;
}

// ---------- AI: ThinkingTrace, AIResponse, PromptInput ----------
export interface ThinkingTraceProps { steps: string | string[]; label?: string; defaultOpen?: boolean }
export function ThinkingTrace({ steps, label = "Show thinking", defaultOpen = false }: ThinkingTraceProps) {
  const t = usePixTheme();
  const [open, setOpen] = React.useState(defaultOpen);
  const list = Array.isArray(steps) ? steps : steps.split("\n").filter(Boolean);
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} hitSlop={8}>
        <Text variant="meta" style={{ fontWeight: "600" }}>{open ? "▾ " : "▸ "}{label} · {list.length} steps</Text>
      </Pressable>
      {open && <View style={{ borderLeftWidth: 2, borderLeftColor: t.color.border, paddingLeft: 12, marginTop: 6, gap: 4 }}>
        {list.map((s, i) => <RNText key={i} style={{ fontFamily: t.fontFamily.mono, fontSize: 12, lineHeight: 18, color: t.color.fg3 }}>{s}</RNText>)}
      </View>}
    </View>
  );
}

export interface AIResponseProps {
  status?: "generating" | "done" | "error";
  text?: string; children?: React.ReactNode; thinking?: string | string[];
  model?: string; duration?: string; tokens?: string; stage?: string; error?: string;
  citations?: (string | { label: string; note?: string })[];
  onRetry?: () => void; onStop?: () => void; onCopy?: () => void;
  style?: StyleProp<ViewStyle>;
}
export function AIResponse({ status = "done", text, children, thinking, model, duration, tokens, stage = "Thinking…", error, citations, onRetry, onStop, onCopy, style }: AIResponseProps) {
  const t = usePixTheme();
  const k = t.color;
  const meta = [model, duration, tokens].filter(Boolean).join(" · ");
  return (
    <View accessibilityLiveRegion="polite" style={[{ backgroundColor: k.surface, borderWidth: 1, borderColor: status === "error" ? k["red-200"] : k.border, borderRadius: 4, padding: 14, gap: 10 }, style]}>
      {meta ? <RNText style={{ fontFamily: t.fontFamily.mono, fontSize: 11, color: k.fg3 }}>{meta}</RNText> : null}
      {status === "generating" && <View style={{ gap: 8 }}>
        <Text variant="meta">{stage}</Text><Skeleton width="92%" /><Skeleton width="78%" /><Skeleton width="64%" />
        {onStop && <Button variant="outline" size="sm" onPress={onStop} style={{ alignSelf: "flex-start" }}>Stop</Button>}
      </View>}
      {status === "error" && <View style={{ gap: 8 }}>
        <RNText style={{ color: k["red-700"], fontSize: 14 }}>{error ?? "The response failed."}</RNText>
        {onRetry && <Button variant="outline" size="sm" onPress={onRetry} style={{ alignSelf: "flex-start" }}>Retry</Button>}
      </View>}
      {status === "done" && <>
        {thinking ? <ThinkingTrace steps={thinking} /> : null}
        {children ?? <RNText selectable style={{ color: k.fg1, fontSize: 15, lineHeight: 23 }}>{text}</RNText>}
        {citations?.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {citations.map((c, i) => { const l = typeof c === "string" ? c : c.label; return (
            <View key={i} style={{ flexDirection: "row", gap: 4, borderWidth: 1, borderColor: k.border, backgroundColor: k["bg-subtle"], borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 }}>
              <RNText style={{ fontFamily: t.fontFamily.mono, fontSize: 11, color: k.fg3 }}>{i + 1}</RNText>
              <RNText style={{ fontFamily: t.fontFamily.mono, fontSize: 11, color: k.fg2 }}>{l}</RNText>
            </View>); })}
        </View> : null}
        {(onCopy || onRetry) && <View style={{ flexDirection: "row", gap: 4 }}>
          {onCopy && <Button variant="ghost" size="sm" onPress={onCopy}>Copy</Button>}
          {onRetry && <Button variant="ghost" size="sm" onPress={onRetry}>Regenerate</Button>}
        </View>}
      </>}
    </View>
  );
}

export interface PromptInputProps { value?: string; onChangeText?: (v: string) => void; onSubmit?: (v: string) => void; placeholder?: string; hint?: string; busy?: boolean; style?: StyleProp<ViewStyle> }
export function PromptInput({ value, onChangeText, onSubmit, placeholder = "Ask anything…", hint, busy, style }: PromptInputProps) {
  const k = usePixTheme().color;
  const [local, setLocal] = React.useState("");
  const v = value ?? local;
  const set = onChangeText ?? setLocal;
  const [focus, setFocus] = React.useState(false);
  const send = () => { if (!v.trim() || busy) return; onSubmit?.(v); if (value === undefined) setLocal(""); };
  return (
    <View style={[{ backgroundColor: k.surface, borderWidth: 1, borderColor: focus ? k.accent : k.border, borderRadius: 6, padding: 10, gap: 8 }, style]}>
      <TextInput value={v} onChangeText={set} placeholder={placeholder} placeholderTextColor={k["fg-muted"]} multiline accessibilityLabel={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ minHeight: 44, color: k.fg1, fontSize: 15, textAlignVertical: "top" }} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {hint ? <Text variant="meta" style={{ flex: 1 }}>{hint}</Text> : <View style={{ flex: 1 }} />}
        <Button size="sm" onPress={send} loading={busy} disabled={!v.trim()} accessibilityLabel="Send">Send</Button>
      </View>
    </View>
  );
}
