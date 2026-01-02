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
import { useCategories } from "@/hooks/useCategories";
import { saveBudget } from "@/services/storage/mmkv";
import { BudgetPeriod } from "@/types";

export default function NewBudgetScreen() {
  const { colors } = useTheme();
  const { expenseCategories } = useCategories();
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");

  const formatAmount = (text: string) => {
    const numbers = text.replace(/[^\d]/g, "");
    if (numbers) setAmount(parseInt(numbers).toLocaleString("id-ID"));
    else setAmount("");
  };

  const handleSave = () => {
    const amountNum = parseFloat(amount.replace(/[^\d]/g, "") || "0");
    if (amountNum <= 0) return Alert.alert("Error", "Masukkan jumlah anggaran");
    if (!categoryId) return Alert.alert("Error", "Pilih kategori");

    saveBudget({ categoryId, amount: amountNum, period });
    router.back();
  };

  const periods: { key: BudgetPeriod; label: string }[] = [
    { key: "weekly", label: "Mingguan" },
    { key: "monthly", label: "Bulanan" },
    { key: "yearly", label: "Tahunan" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Anggaran Baru
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            Simpan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
          <View style={styles.categoriesGrid}>
            {expenseCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      categoryId === cat.id
                        ? cat.color + "20"
                        : colors.background,
                    borderColor:
                      categoryId === cat.id ? cat.color : colors.border,
                  },
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 11,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            Jumlah Anggaran
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
                fontSize: 24,
                fontWeight: "bold",
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
          <Text style={[styles.label, { color: colors.text }]}>Periode</Text>
          <View style={styles.periodRow}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor:
                      period === p.key ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setPeriod(p.key)}
              >
                <Text
                  style={{ color: period === p.key ? "#fff" : colors.text }}
                >
                  {p.label}
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
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap" },
  categoryButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: "30%",
  },
  categoryIcon: { fontSize: 24, marginBottom: 4 },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  periodRow: { flexDirection: "row" },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
});
