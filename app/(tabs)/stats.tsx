import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Phase 5 stub — Month selector, By Purpose/Category/Vendor sub-tabs not
 * built yet. Exists so the tab bar has a valid route instead of 404ing.
 */
export default function Stats() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 border-b border-border">
        <Text className="font-sans-semibold text-[20px] text-ink">Statistics</Text>
      </View>
      <EmptyState
        icon="bar-chart"
        title="Statistics — coming in Phase 5"
        subtitle="Month selector, By Purpose / Category / Vendor views."
      />
    </SafeAreaView>
  );
}
