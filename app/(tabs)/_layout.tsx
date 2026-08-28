import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { touchTarget, iconSize } from "@/theme/tokens";

type IconName = keyof typeof MaterialIcons.glyphMap;

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <MaterialIcons
      name={name}
      size={iconSize.bottomNav}
      color={focused ? "#22211F" : "#A39D8E"}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22211F",
        tabBarInactiveTintColor: "#A39D8E",
        tabBarStyle: {
          height: touchTarget.bottomNavItem + 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E4E1D8",
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "IBMPlexSans_500Medium",
          fontSize: 10.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          title: "Ledger",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="receipt-long" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
