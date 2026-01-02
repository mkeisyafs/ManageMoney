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
import { saveTransaction } from "@/services/storage/mmkv";

export default function ExpenseScreen() {
  const { colors } = useTheme();
  const { accounts } = useAccounts();
  const { expenseCategories } = useCategories();
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "");
  const [note, setNote] = useState("");

  const formatAmount = (text: string) => {
    const numbers = text.replace(/[^\d]/g, "");
    if (numbers) {
      const formatted = parseInt(numbers).toLocaleString("id-ID");
      setAmount(formatted);
    } else {
      setAmount("");
    }
  };

  const handleSave = () => {
    const amountNum = parseFloat(amount.replace(/[^\d]/g, "") || "0");

    if (amountNum <= 0) {
      Alert.alert("Error", "Masukkan jumlah yang valid");
      return;
    }
    if (!accountId) {
      Alert.alert("Error", "Pilih akun sumber");
      return;
    }
    if (!categoryId) {
      Alert.alert("Error", "Pilih kategori");
      return;
    }

    saveTransaction({
      type: "expense",
      amount: amountNum,
      accountId,
      categoryId,
      note: note.trim() || undefined,
    });

    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 18, color: colors.text }}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Pengeluaran
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text
              style={{ fontSize: 16, color: colors.primary, fontWeight: "600" }}
            >
              Simpan
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.amountCard,
            { backgroundColor: colors.expense + "20" },
          ]}
        >
          <Text style={{ color: colors.expense, fontSize: 16 }}>Jumlah</Text>
          <View style={styles.amountRow}>
            <Text style={{ color: colors.expense, fontSize: 24 }}>Rp</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.expense }]}
              placeholder="0"
              placeholderTextColor={colors.expense + "80"}
              keyboardType="numeric"
              value={amount}
              onChangeText={formatAmount}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Dari Akun
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        accountId === account.id
                          ? colors.primary + "20"
                          : colors.background,
                      borderColor:
                        accountId === account.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setAccountId(account.id)}
                >
                  <Text style={styles.optionIcon}>{account.icon}</Text>
                  <Text style={{ color: colors.text, fontSize: 12 }}>
                    {account.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Kategori
          </Text>
          <View style={styles.categoriesGrid}>
            {expenseCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      categoryId === category.id
                        ? category.color + "20"
                        : colors.background,
                    borderColor:
                      categoryId === category.id
                        ? category.color
                        : colors.border,
                  },
                ]}
                onPress={() => setCategoryId(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[styles.categoryName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Catatan (Opsional)
          </Text>
          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Tambahkan catatan..."
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
          />
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
  amountCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  amountRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  amountInput: {
    fontSize: 40,
    fontWeight: "bold",
    marginLeft: 8,
    minWidth: 100,
  },
  section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  optionsRow: { flexDirection: "row" },
  optionButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
  },
  optionIcon: { fontSize: 24, marginBottom: 4 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap" },
  categoryButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: "30%",
  },
  categoryIcon: { fontSize: 24, marginBottom: 4 },
  categoryName: { fontSize: 11, textAlign: "center" },
  noteInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
