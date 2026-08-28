import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <View className="items-center justify-center py-10 px-6">
      <MaterialIcons name={icon} size={28} color="#A39D8E" />
      <Text className="font-sans-medium text-[14px] text-ink-muted mt-3 text-center">
        {title}
      </Text>
      {subtitle ? (
        <Text className="font-sans text-[12.5px] text-ink-faint mt-1 text-center">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
