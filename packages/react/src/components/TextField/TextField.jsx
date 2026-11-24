import * as React from "react";
import { FieldBase, FieldSkeleton } from "../../internal/field.jsx";

/** A single-line text input with label, hint, error and an optional character count. Controlled (`value`) or uncontrolled (`defaultValue`). */
export function TextField(props) {
  const { loading, ...rest } = props;
  if (loading) return <FieldSkeleton label={rest.label != null && rest.label !== ""} height={38} style={rest.style} />;
  return <FieldBase {...rest} multiline={false} />;
}
