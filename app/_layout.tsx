import "../global.css";
import { useFonts } from "expo-font";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import { IBMPlexMono_500Medium } from "@expo-google-fonts/ibm-plex-mono";
import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/components/ToastProvider";
import { useDb } from "@/hooks/useDb";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_500Medium,
  });
  const { dbReady } = useDb();

  // Wait for both fonts and SQLite before rendering anything. The DB init
  // runs the schema migration and seeds defaults on first launch — must
  // complete before any screen can query data.
  if (!fontsLoaded || !dbReady) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#22211F" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="dark" backgroundColor="#FAF9F6" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="quick-add"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="filter"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="transaction/[id]"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
          </Stack>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
