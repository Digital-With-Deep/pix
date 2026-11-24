import * as React from "react";
import { FieldBase, FieldSkeleton } from "../../internal/field.jsx";

/** A multi-line text input with label, hint, error and an optional character count. Controlled (`value`) or uncontrolled (`defaultValue`). */
export function Textarea(props) {
  const { loading, type, ...rest } = props;
  if (loading) return <FieldSkeleton label={rest.label != null && rest.label !== ""} height={Math.max(2, rest.rows || 4) * 21 + 18} style={rest.style} />;
  return <FieldBase {...rest} multiline />;
}
