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
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { saveRecurringTransaction } from "@/services/storage/mmkv";
import { TransactionType, Frequency } from "@/types";
import { FREQUENCY_CONFIG } from "@/constants/defaults";

export default function NewRecurringScreen() {
  const { colors } = useTheme();
  const { accounts } = useAccounts();
  const { expenseCategories, incomeCategories } = useCategories();
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "");
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  const formatAmount = (text: string) => {
    const numbers = text.replace(/[^\d]/g, "");
    if (numbers) setAmount(parseInt(numbers).toLocaleString("id-ID"));
    else setAmount("");
  };

  const handleSave = () => {
    if (!name.trim()) return Alert.alert("Error", "Masukkan nama");
    const amountNum = parseFloat(amount.replace(/[^\d]/g, "") || "0");
    if (amountNum <= 0) return Alert.alert("Error", "Masukkan jumlah");
    if (!accountId) return Alert.alert("Error", "Pilih akun");
    if (!categoryId) return Alert.alert("Error", "Pilih kategori");

    saveRecurringTransaction({
      name: name.trim(),
      type,
      amount: amountNum,
      accountId,
      categoryId,
      frequency,
      startDate: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Transaksi Berulang Baru
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            Simpan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Nama</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="contoh: Listrik Bulanan"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Tipe</Text>
          <View style={styles.typeRow}>
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      type === t ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setType(t);
                  setCategoryId("");
                }}
              >
                <Text style={{ color: type === t ? "#fff" : colors.text }}>
                  {t === "expense" ? "📤 Pengeluaran" : "📥 Pemasukan"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Jumlah</Text>
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
              value={amount}
              onChangeText={formatAmount}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Frekuensi</Text>
          <View style={styles.freqRow}>
            {Object.entries(FREQUENCY_CONFIG).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.freqButton,
                  {
                    backgroundColor:
                      frequency === key ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFrequency(key as Frequency)}
              >
                <Text
                  style={{
                    color: frequency === key ? "#fff" : colors.text,
                    fontSize: 12,
                  }}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            ))}
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
  typeRow: { flexDirection: "row" },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  freqRow: { flexDirection: "row", flexWrap: "wrap" },
  freqButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
