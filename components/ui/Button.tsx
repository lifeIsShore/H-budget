import { Pressable, Text, ActivityIndicator, PressableProps } from "react-native";
import { touchTarget } from "@/theme/tokens";

type Variant = "primary" | "positive" | "negative" | "outline" | "ghost" | "muted";

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const fillClasses: Record<Variant, string> = {
  primary: "bg-brand",
  positive: "bg-positive",
  negative: "bg-negative",
  outline: "bg-transparent border border-brand",
  ghost: "bg-transparent",
  muted: "bg-transparent",
};

const textClasses: Record<Variant, string> = {
  primary: "text-surface",
  positive: "text-surface",
  negative: "text-surface",
  outline: "text-brand",
  ghost: "text-negative",
  muted: "text-ink-muted",
};

/**
 * All states covered: default, pressed (opacity), loading (spinner
 * replaces label), disabled (faint fill + faint text, no color implying
 * an action is still available).
 */
export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true,
  className,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={{ height: touchTarget.actionButton }}
      className={`
        ${fullWidth ? "w-full" : ""}
        rounded-button items-center justify-center flex-row gap-2 px-4
        ${isDisabled ? "bg-surface-alt border border-border" : fillClasses[variant]}
        active:opacity-80
        ${className ?? ""}
      `}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" || variant === "muted"
              ? "#22211F"
              : "#FAF9F6"
          }
        />
      ) : (
        <Text
          className={`font-sans-medium text-[15px] ${
            isDisabled ? "text-ink-faint" : textClasses[variant]
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
