import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Phase 6 stub — Account/Customization/Data & Backup/About sections and
 * Manage Purposes/Categories sub-screens not built yet. Exists so the tab
 * bar has a valid route instead of 404ing.
 */
export default function Settings() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <Text className="font-sans-semibold text-[20px] text-ink">Settings</Text>
      </View>
      <EmptyState
        icon="settings"
        title="Settings — coming in Phase 6"
        subtitle="Opening balance, currency, purposes/categories, backup & restore."
      />
    </SafeAreaView>
  );
}
