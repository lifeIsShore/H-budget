import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Wraps the native Android date dialog behind a styled row consistent with
 * the rest of the input system (bg-surface-alt, border, rounded-input).
 * Used by Quick-Add (single date) and the Filter Sheet (date range, two
 * instances). `maxDate` defaults to today — transactions can't be
 * backdated into the future.
 */
export function DatePickerField({
  label,
  value,
  onChange,
  maxDate,
  minDate,
  placeholder = "Select date",
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
  placeholder?: string;
}) {
  const [showPicker, setShowPicker] = useState(false);

  function formatDate(d: Date) {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <View className="flex-1">
      {label ? (
        <Text className="font-sans text-[12.5px] text-ink-muted mb-1.5">{label}</Text>
      ) : null}
      <Pressable
        onPress={() => setShowPicker(true)}
        className="flex-row items-center justify-between bg-surface-alt border border-border rounded-input px-3 active:opacity-70"
        style={{ height: 48 }}
      >
        <Text className={`font-sans text-[13.5px] ${value ? "text-ink" : "text-ink-faint"}`}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <MaterialIcons name="calendar-today" size={16} color="#6B6659" />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          maximumDate={maxDate}
          minimumDate={minDate}
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === "ios" && event.type !== "dismissed");
            if (event.type !== "dismissed" && selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}
