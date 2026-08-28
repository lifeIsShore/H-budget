import { useEffect, useRef } from "react";
import { Animated, View, ViewProps } from "react-native";

/**
 * Shape-matched loading placeholder — used instead of a spinner wherever
 * the eventual content has a known layout (list rows, cards), per
 * anti-generic-ui skill guidance to prefer skeletons over generic spinners.
 */
export function Skeleton({ className, style, ...rest }: ViewProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ opacity }, style]}
      className={`bg-surface-alt rounded-card ${className ?? ""}`}
      {...rest}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View className="px-4 pt-4 gap-3">
      <Skeleton className="h-[148px] w-full" />
      <View className="flex-row gap-3">
        <Skeleton className="h-[92px] flex-1" />
        <Skeleton className="h-[92px] flex-1" />
      </View>
      <Skeleton className="h-[64px] w-full" />
      <Skeleton className="h-[64px] w-full" />
      <Skeleton className="h-[64px] w-full" />
    </View>
  );
}
