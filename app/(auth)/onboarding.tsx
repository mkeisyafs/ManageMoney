import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import { useAccounts } from "@/hooks/useAccounts";
import { saveAccount } from "@/services/storage/mmkv";
import { ACCOUNT_TYPE_CONFIG } from "@/constants/defaults";
import { AccountType } from "@/types";

const ONBOARDING_STEPS = [
  {
    title: "Selamat Datang! 👋",
    description:
      "ManageMoney membantu Anda mengelola keuangan dengan mudah dan aman.",
  },
  {
    title: "Semua Offline 📱",
    description:
      "Data Anda tersimpan di perangkat. Tidak perlu internet, tidak perlu akun.",
  },
  {
    title: "Mari Mulai! 🚀",
    description: "Buat akun pertama Anda untuk mulai melacak keuangan.",
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { updateSettings } = useSettings();
  const [step, setStep] = useState(0);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("cash");
  const [initialBalance, setInitialBalance] = useState("");

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    if (!accountName.trim()) return;

    const balance = initialBalance
      ? parseFloat(initialBalance.replace(/[^\d]/g, ""))
      : 0;
    const config = ACCOUNT_TYPE_CONFIG[accountType];

    saveAccount({
      name: accountName.trim(),
      type: accountType,
      icon: config.icon,
      color: config.defaultColor,
      isLiability: config.isLiabilityDefault,
      initialBalance: balance,
    });

    updateSettings({ onboardingCompleted: true });
    router.replace("/(tabs)");
  };

  const formatBalance = (text: string) => {
    const numbers = text.replace(/[^\d]/g, "");
    if (numbers) {
      const formatted = parseInt(numbers).toLocaleString("id-ID");
      setInitialBalance(formatted);
    } else {
      setInitialBalance("");
    }
  };

  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const currentStep = ONBOARDING_STEPS[step];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress */}
          <View style={styles.progressContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index <= step ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.emoji}>
              {step === 0 ? "👋" : step === 1 ? "📱" : "🚀"}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {currentStep.title}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {currentStep.description}
            </Text>
          </View>

          {/* Account Setup Form */}
          {isLastStep && (
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Nama Akun
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="contoh: Dompet, BCA, GoPay"
                placeholderTextColor={colors.textSecondary}
                value={accountName}
                onChangeText={setAccountName}
              />

              <Text
                style={[
                  styles.formLabel,
                  { color: colors.text, marginTop: 16 },
                ]}
              >
                Tipe Akun
              </Text>
              <View style={styles.typeContainer}>
                {(["cash", "bank", "ewallet"] as AccountType[]).map((type) => {
                  const config = ACCOUNT_TYPE_CONFIG[type];
                  const isSelected = accountType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: isSelected
                            ? colors.primary + "20"
                            : colors.background,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => setAccountType(type)}
                    >
                      <Text style={styles.typeIcon}>{config.icon}</Text>
                      <Text style={{ color: colors.text }}>{config.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.formLabel,
                  { color: colors.text, marginTop: 16 },
                ]}
              >
                Saldo Awal (Opsional)
              </Text>
              <View
                style={[
                  styles.balanceInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ color: colors.textSecondary, marginRight: 8 }}>
                  Rp
                </Text>
                <TextInput
                  style={[styles.flex, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={initialBalance}
                  onChangeText={formatBalance}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Buttons */}
        <View style={styles.footer}>
          {isLastStep ? (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: accountName.trim()
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={handleComplete}
              disabled={!accountName.trim()}
            >
              <Text style={styles.buttonText}>Mulai Sekarang 🎉</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Lanjut</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 48,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    alignItems: "center",
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  balanceInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  footer: {
    padding: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
