import { Pressable, Text } from "react-native";
import { touchTarget } from "@/theme/tokens";

type Props = {
  label: string;
  selected?: boolean;
  dashed?: boolean;
  tone?: "neutral" | "warning";
  onPress?: () => void;
};

export function Chip({ label, selected = false, dashed = false, tone = "neutral", onPress }: Props) {
  const selectedFill = tone === "warning" ? "bg-warning-subtle border-warning" : "bg-brand-subtle border-brand";
  const selectedText = tone === "warning" ? "text-warning" : "text-brand";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{ minHeight: touchTarget.chip }}
      className={`
        px-3.5 rounded-full items-center justify-center border
        ${selected ? selectedFill : "bg-surface-alt border-border"}
        ${dashed && !selected ? "border-dashed" : ""}
        active:opacity-70
      `}
    >
      <Text className={`font-sans-medium text-[13px] ${selected ? selectedText : "text-ink-muted"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
