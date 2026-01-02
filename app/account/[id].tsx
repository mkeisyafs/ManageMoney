import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { deleteAccount } from "@/services/storage/mmkv";
import { formatCurrency, formatRelativeDate } from "@/utils/formatters";

export default function AccountDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accounts, balances, getAccountById } = useAccounts();
  const { transactions } = useTransactions();
  const { settings } = useSettings();

  const account = getAccountById(id);

  if (!account) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Akun tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const balance = balances.get(account.id) || 0;
  const accountTransactions = transactions
    .filter((t) => t.accountId === account.id || t.toAccountId === account.id)
    .slice(0, 10);

  const handleDelete = () => {
    Alert.alert(
      "Hapus Akun?",
      "Akun dan semua transaksi terkait akan dihapus.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteAccount(id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Detail Akun</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Account Card */}
        <View style={[styles.accountCard, { backgroundColor: account.color }]}>
          <Text style={styles.accountIcon}>{account.icon}</Text>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountType}>{account.type}</Text>
          <Text style={styles.accountBalance}>
            {formatCurrency(balance, settings.currency)}
          </Text>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transaksi Terbaru
          </Text>
          {accountTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: colors.textSecondary }}>
                Belum ada transaksi
              </Text>
            </View>
          ) : (
            accountTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => router.push(`/transaction/${transaction.id}`)}
              >
                <View style={styles.transactionInfo}>
                  <Text
                    style={[styles.transactionNote, { color: colors.text }]}
                  >
                    {transaction.note || transaction.type}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {formatRelativeDate(transaction.date)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontWeight: "600",
                    color:
                      transaction.type === "income"
                        ? colors.income
                        : transaction.type === "expense"
                        ? colors.expense
                        : colors.primary,
                  }}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount, settings.currency)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: colors.expense + "20" },
          ]}
          onPress={handleDelete}
        >
          <Text style={{ color: colors.expense, fontWeight: "600" }}>
            🗑️ Hapus Akun
          </Text>
        </TouchableOpacity>
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
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  accountCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  accountIcon: { fontSize: 48, marginBottom: 12 },
  accountName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  accountType: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 16,
  },
  accountBalance: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  section: { margin: 16, padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  emptyState: { alignItems: "center", paddingVertical: 24 },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionInfo: { flex: 1 },
  transactionNote: { fontSize: 14, fontWeight: "500", marginBottom: 2 },
  deleteButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
