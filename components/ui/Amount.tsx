import { Text, TextProps } from "react-native";

type Props = TextProps & {
  value: number;
  currency?: string;
  size?: "hero" | "row";
  signed?: boolean;
};

/**
 * Renders money in the tabular-mono ledger face — the app's signature
 * type treatment (see docs/DESIGN_SYSTEM.md). Always used for amounts
 * instead of the default sans, so figures line up like a printed statement.
 */
export function Amount({
  value,
  currency = "EUR",
  size = "row",
  signed = true,
  className,
  ...rest
}: Props) {
  const isNegative = value < 0;
  const sign = signed ? (isNegative ? "-" : "+") : "";
  const formatted = Math.abs(value).toLocaleString("en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const colorClass = !signed
    ? "text-ink"
    : isNegative
      ? "text-negative"
      : "text-positive";

  const sizeClass = size === "hero" ? "text-[34px]" : "text-[15px]";

  return (
    <Text
      className={`font-mono ${sizeClass} ${colorClass} ${className ?? ""}`}
      {...rest}
    >
      {sign}
      {currency} {formatted}
    </Text>
  );
}
