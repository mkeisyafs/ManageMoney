import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

export default function LockScreen() {
  const { colors } = useTheme();
  const { verifyPin, authenticateWithBiometric, isBiometricEnabled } =
    useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isBiometricEnabled) {
      handleBiometric();
    }
  }, [isBiometricEnabled]);

  const handleBiometric = async () => {
    const result = await authenticateWithBiometric();
    if (result) {
      router.replace("/(tabs)");
    }
  };

  const handlePress = async (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");

    if (newPin.length >= 4) {
      const isValid = await verifyPin(newPin);
      if (isValid) {
        router.replace("/(tabs)");
      } else {
        setPin("");
        setError("PIN salah");
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={[styles.title, { color: colors.text }]}>Masukkan PIN</Text>

        {/* PIN Dots */}
        <View style={styles.pinDots}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    pin.length > i ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.expense }]}>{error}</Text>
        ) : null}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {digits.map((digit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.key,
              { backgroundColor: digit ? colors.card : "transparent" },
            ]}
            onPress={() => {
              if (digit === "⌫") handleDelete();
              else if (digit) handlePress(digit);
            }}
            disabled={!digit}
          >
            <Text style={[styles.keyText, { color: colors.text }]}>
              {digit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Biometric Button */}
      {isBiometricEnabled && (
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometric}
        >
          <Text style={styles.biometricIcon}>👆</Text>
          <Text style={{ color: colors.primary }}>Gunakan Biometrik</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  icon: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 32 },
  pinDots: { flexDirection: "row", marginBottom: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, marginHorizontal: 8 },
  error: { fontSize: 14, marginTop: 8 },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 48,
    paddingBottom: 32,
  },
  key: {
    width: "33.33%",
    aspectRatio: 1.5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    marginBottom: 8,
  },
  keyText: { fontSize: 28, fontWeight: "500" },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 32,
  },
  biometricIcon: { fontSize: 24, marginRight: 8 },
});
