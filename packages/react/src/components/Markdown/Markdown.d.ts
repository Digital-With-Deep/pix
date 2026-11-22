import type React from "react";
export interface MarkdownProps {
  /** Markdown source. Takes precedence over a string `children`. */
  text?: string;
  /** Markdown source as a string child. */
  children?: string;
  /** Set while text is still arriving: unfinished trailing markers are held back and an open code fence renders as code. @default false */
  streaming?: boolean;
  style?: React.CSSProperties;
}
/**
 * Renders model output written in Markdown: headings, paragraphs, emphasis, strikethrough, inline and fenced code,
 * links (http, https, mailto and relative only), lists, blockquotes, tables and rules. Builds React elements directly,
 * never raw HTML, so model text cannot inject markup.
 */
export declare function Markdown(props: MarkdownProps): React.JSX.Element;
