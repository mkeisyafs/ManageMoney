import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Delete, Globe, X, Calendar } from "lucide-react-native";

interface NumberPadProps {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
  onDone: () => void;
  onClose?: () => void;
}

export default function NumberPad({
  onNumberPress,
  onDelete,
  onDone,
  onClose,
}: NumberPadProps) {
  const { colors } = useTheme();

  const buttons = [
    ["1", "2", "3", "delete"],
    ["4", "5", "6", "-"],
    ["7", "8", "9", "calendar"],
    ["0", ",", "done"],
  ];

  const renderButton = (key: string, rowIndex: number, colIndex: number) => {
    const isDelete = key === "delete";
    const isDone = key === "done";
    const isCalendar = key === "calendar";
    const isMinus = key === "-";

    if (isDone) {
      return (
        <TouchableOpacity
          key={key}
          style={[
            styles.button,
            styles.doneButton,
            { backgroundColor: colors.expense },
          ]}
          onPress={onDone}
        >
          <Text style={styles.doneText}>Selesai</Text>
        </TouchableOpacity>
      );
    }

    if (isDelete) {
      return (
        <TouchableOpacity
          key={key}
          style={[styles.button, { backgroundColor: colors.card }]}
          onPress={onDelete}
        >
          <Delete size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (isCalendar) {
      return (
        <TouchableOpacity
          key={key}
          style={[styles.button, { backgroundColor: colors.card }]}
        >
          <Calendar size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }

    if (isMinus) {
      return (
        <TouchableOpacity
          key={key}
          style={[styles.button, { backgroundColor: colors.card }]}
          onPress={() => onNumberPress("-")}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={key}
        style={[styles.button, { backgroundColor: colors.card }]}
        onPress={() => onNumberPress(key)}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>{key}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderTopColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Globe size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={styles.headerIcon} onPress={onClose}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Number Grid */}
      <View style={styles.grid}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key, colIndex) => renderButton(key, rowIndex, colIndex))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  headerIcons: {
    flexDirection: "row",
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  grid: {
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  button: {
    flex: 1,
    height: 56,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "500",
  },
  doneButton: {
    flex: 2,
  },
  doneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
