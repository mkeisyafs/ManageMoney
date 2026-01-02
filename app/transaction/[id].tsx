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
import { useSettings } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { getTransactionById, deleteTransaction } from "@/services/storage/mmkv";
import { formatCurrency, formatDate, formatTime } from "@/utils/formatters";

export default function TransactionDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings } = useSettings();
  const { getCategoryById } = useCategories();
  const { getAccountById } = useAccounts();

  const transaction = getTransactionById(id);

  if (!transaction) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Transaksi tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = transaction.categoryId
    ? getCategoryById(transaction.categoryId)
    : null;
  const account = getAccountById(transaction.accountId);
  const toAccount = transaction.toAccountId
    ? getAccountById(transaction.toAccountId)
    : null;

  const handleDelete = () => {
    Alert.alert("Hapus Transaksi?", "Transaksi ini akan dihapus permanen.", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          deleteTransaction(id);
          router.back();
        },
      },
    ]);
  };

  const typeColor =
    transaction.type === "income"
      ? colors.income
      : transaction.type === "expense"
      ? colors.expense
      : colors.primary;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Detail Transaksi
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Amount Card */}
        <View
          style={[styles.amountCard, { backgroundColor: typeColor + "20" }]}
        >
          <Text style={styles.categoryIcon}>{category?.icon || "💰"}</Text>
          <Text style={[styles.amount, { color: typeColor }]}>
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount, settings.currency)}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeText}>
              {transaction.type === "income"
                ? "Pemasukan"
                : transaction.type === "expense"
                ? "Pengeluaran"
                : "Transfer"}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary }}>Kategori</Text>
            <Text style={{ color: colors.text, fontWeight: "500" }}>
              {category?.icon} {category?.name || "-"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary }}>Akun</Text>
            <Text style={{ color: colors.text, fontWeight: "500" }}>
              {account?.icon} {account?.name || "-"}
            </Text>
          </View>
          {toAccount && (
            <View style={styles.detailRow}>
              <Text style={{ color: colors.textSecondary }}>Ke Akun</Text>
              <Text style={{ color: colors.text, fontWeight: "500" }}>
                {toAccount.icon} {toAccount.name}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary }}>Tanggal</Text>
            <Text style={{ color: colors.text, fontWeight: "500" }}>
              {formatDate(transaction.date)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={{ color: colors.textSecondary }}>Waktu</Text>
            <Text style={{ color: colors.text, fontWeight: "500" }}>
              {formatTime(transaction.date)}
            </Text>
          </View>
          {transaction.note && (
            <View style={styles.detailRow}>
              <Text style={{ color: colors.textSecondary }}>Catatan</Text>
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "500",
                  flex: 1,
                  textAlign: "right",
                }}
              >
                {transaction.note}
              </Text>
            </View>
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
            🗑️ Hapus Transaksi
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
  content: { padding: 16 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  amountCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  categoryIcon: { fontSize: 48, marginBottom: 16 },
  amount: { fontSize: 32, fontWeight: "bold" },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  typeText: { color: "#fff", fontWeight: "600" },
  detailsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  deleteButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
