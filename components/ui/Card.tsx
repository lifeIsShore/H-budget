import { View, ViewProps } from "react-native";

/**
 * Hairline border, no shadow — see docs/DESIGN_SYSTEM.md: cards read as
 * printed cards on paper, not floating chips. Shadow is reserved for
 * sheets/dialogs only.
 */
export function Card({ className, ...rest }: ViewProps) {
  return (
    <View
      className={`bg-surface rounded-card border border-border p-4 ${className ?? ""}`}
      {...rest}
    />
  );
}
