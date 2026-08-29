import { createContext, useCallback, useContext, useRef, useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastOptions = {
  actionLabel?: string;
  onAction?: () => void;
  tone?: "default" | "negative";
  durationMs?: number;
};

type ToastState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone: "default" | "negative";
};

type ToastContextValue = {
  show: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Global Toast/Snackbar — Phase 8. One instance mounted at the root
 * (see app/_layout.tsx); any screen calls useToast().show(...) instead of
 * building its own local confirmation strip. Auto-dismisses after 3s by
 * default; supports an action label (e.g. "UNDO") per
 * 05_UI_UX_Specification.md's delete-with-undo pattern.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({
        message,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
        tone: options?.tone ?? "default",
      });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timerRef.current = setTimeout(hide, options?.durationMs ?? 3000);
    },
    [hide, opacity],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={{
            opacity,
            position: "absolute",
            left: 16,
            right: 16,
            bottom: insets.bottom + 16,
          }}
        >
          <View
            className={`rounded-card px-4 flex-row items-center ${
              toast.tone === "negative" ? "bg-negative" : "bg-brand"
            }`}
            style={{ minHeight: 48 }}
          >
            <Text className="font-sans-medium text-[13px] text-surface flex-1" numberOfLines={2}>
              {toast.message}
            </Text>
            {toast.actionLabel && (
              <Pressable
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                hitSlop={8}
                className="ml-3"
              >
                <Text className="font-sans-semibold text-[12.5px] text-accent">
                  {toast.actionLabel.toUpperCase()}
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
