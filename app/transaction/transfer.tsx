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
import { useTransactionContext } from "@/contexts/TransactionContext";

export default function TransferScreen() {
  const { colors } = useTheme();
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactionContext();
  const [amount, setAmount] = useState("");
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || "");
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
    if (!fromAccountId) {
      Alert.alert("Error", "Pilih akun sumber");
      return;
    }
    if (!toAccountId) {
      Alert.alert("Error", "Pilih akun tujuan");
      return;
    }
    if (fromAccountId === toAccountId) {
      Alert.alert("Error", "Akun sumber dan tujuan tidak boleh sama");
      return;
    }

    addTransaction({
      type: "transfer",
      amount: amountNum,
      accountId: fromAccountId,
      toAccountId,
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
          <Text style={[styles.title, { color: colors.text }]}>Transfer</Text>
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
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Text style={{ color: colors.primary, fontSize: 16 }}>Jumlah</Text>
          <View style={styles.amountRow}>
            <Text style={{ color: colors.primary, fontSize: 24 }}>Rp</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.primary }]}
              placeholder="0"
              placeholderTextColor={colors.primary + "80"}
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
                        fromAccountId === account.id
                          ? colors.expense + "20"
                          : colors.background,
                      borderColor:
                        fromAccountId === account.id
                          ? colors.expense
                          : colors.border,
                    },
                  ]}
                  onPress={() => setFromAccountId(account.id)}
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
            Ke Akun
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
                        toAccountId === account.id
                          ? colors.income + "20"
                          : colors.background,
                      borderColor:
                        toAccountId === account.id
                          ? colors.income
                          : colors.border,
                    },
                  ]}
                  onPress={() => setToAccountId(account.id)}
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
  noteInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
