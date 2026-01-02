import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { saveAccount } from "@/services/storage/mmkv";
import { ACCOUNT_TYPE_CONFIG, COLOR_OPTIONS } from "@/constants/defaults";
import { AccountType } from "@/types";

export default function NewAccountScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [color, setColor] = useState(ACCOUNT_TYPE_CONFIG.cash.defaultColor);
  const [initialBalance, setInitialBalance] = useState("");

  const formatBalance = (text: string) => {
    const numbers = text.replace(/[^\d]/g, "");
    if (numbers) setInitialBalance(parseInt(numbers).toLocaleString("id-ID"));
    else setInitialBalance("");
  };

  const handleSave = () => {
    if (!name.trim()) return Alert.alert("Error", "Masukkan nama akun");

    const balance = initialBalance
      ? parseFloat(initialBalance.replace(/[^\d]/g, ""))
      : 0;
    const config = ACCOUNT_TYPE_CONFIG[type];

    saveAccount({
      name: name.trim(),
      type,
      icon: config.icon,
      color,
      isLiability: config.isLiabilityDefault,
      initialBalance: balance,
    });

    router.back();
  };

  const accountTypes: AccountType[] = [
    "cash",
    "bank",
    "ewallet",
    "investment",
    "credit",
    "loan",
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Akun Baru</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            Simpan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Nama Akun</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="contoh: Dompet, BCA, GoPay"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Tipe Akun</Text>
          <View style={styles.typesGrid}>
            {accountTypes.map((t) => {
              const config = ACCOUNT_TYPE_CONFIG[t];
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        type === t ? colors.primary + "20" : colors.background,
                      borderColor: type === t ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text style={styles.typeIcon}>{config.icon}</Text>
                  <Text style={{ color: colors.text, fontSize: 12 }}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Warna</Text>
          <View style={styles.colorsGrid}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorButton,
                  {
                    backgroundColor: c,
                    borderWidth: color === c ? 3 : 0,
                    borderColor: colors.text,
                  },
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Saldo Awal (Opsional)
          </Text>
          <View
            style={[
              styles.amountInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.textSecondary }}>Rp</Text>
            <TextInput
              style={{
                flex: 1,
                marginLeft: 8,
                color: colors.text,
                fontSize: 18,
              }}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={initialBalance}
              onChangeText={formatBalance}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "600" },
  content: { flex: 1 },
  section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  input: { padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  typesGrid: { flexDirection: "row", flexWrap: "wrap" },
  typeButton: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeIcon: { fontSize: 24, marginBottom: 4 },
  colorsGrid: { flexDirection: "row", flexWrap: "wrap" },
  colorButton: { width: 40, height: 40, borderRadius: 20 },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
