import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatRelativeDate } from "@/utils/formatters";
import { Account } from "@/types";

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { accounts, balances, totalAssets, totalLiabilities, netWorth } =
    useAccounts();
  const { transactions, todaySummary, monthSummary } = useTransactions();
  const { settings } = useSettings();

  const recentTransactions = transactions.slice(0, 5);

  // Create accounts with balance for display
  const accountsWithBalance = accounts.map((account) => ({
    ...account,
    balance: balances.get(account.id) || 0,
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Selamat datang! 👋
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Net Worth Card */}
        <View
          style={[styles.netWorthCard, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.netWorthLabel}>Total Kekayaan Bersih</Text>
          <Text style={styles.netWorthValue}>
            {formatCurrency(netWorth, settings.currency)}
          </Text>
          <View style={styles.netWorthDetails}>
            <View style={styles.netWorthItem}>
              <Text style={styles.netWorthItemLabel}>Aset</Text>
              <Text style={styles.netWorthItemValue}>
                {formatCurrency(totalAssets, settings.currency)}
              </Text>
            </View>
            <View
              style={[
                styles.divider,
                { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            />
            <View style={styles.netWorthItem}>
              <Text style={styles.netWorthItemLabel}>Liabilitas</Text>
              <Text style={styles.netWorthItemValue}>
                {formatCurrency(totalLiabilities, settings.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statIcon}>📥</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pemasukan Bulan Ini
            </Text>
            <Text style={[styles.statValue, { color: colors.income }]}>
              {formatCurrency(monthSummary.income, settings.currency)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={styles.statIcon}>📤</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pengeluaran Bulan Ini
            </Text>
            <Text style={[styles.statValue, { color: colors.expense }]}>
              {formatCurrency(monthSummary.expense, settings.currency)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Aksi Cepat
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.income + "20" },
              ]}
              onPress={() => router.push("/transaction/income")}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={[styles.actionLabel, { color: colors.income }]}>
                Pemasukan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.expense + "20" },
              ]}
              onPress={() => router.push("/transaction/expense")}
            >
              <Text style={styles.actionIcon}>💸</Text>
              <Text style={[styles.actionLabel, { color: colors.expense }]}>
                Pengeluaran
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + "20" },
              ]}
              onPress={() => router.push("/transaction/transfer")}
            >
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={[styles.actionLabel, { color: colors.primary }]}>
                Transfer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Transaksi Terbaru
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text style={{ color: colors.primary }}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={{ color: colors.textSecondary }}>
                Belum ada transaksi
              </Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
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

        {/* Accounts Overview */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, marginBottom: 24 },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Akun Saya
            </Text>
            <TouchableOpacity onPress={() => router.push("/account/new")}>
              <Text style={{ color: colors.primary }}>+ Tambah</Text>
            </TouchableOpacity>
          </View>
          {accountsWithBalance.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={{ color: colors.textSecondary }}>
                Belum ada akun
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.accountsList}>
                {accountsWithBalance
                  .slice(0, 5)
                  .map((account: Account & { balance: number }) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountCard,
                        { backgroundColor: account.color },
                      ]}
                      onPress={() => router.push(`/account/${account.id}`)}
                    >
                      <Text style={styles.accountIcon}>{account.icon}</Text>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountBalance}>
                        {formatCurrency(account.balance, settings.currency)}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  greeting: { fontSize: 24, fontWeight: "bold" },
  date: { fontSize: 14, marginTop: 4 },
  netWorthCard: { margin: 16, marginTop: 0, padding: 20, borderRadius: 20 },
  netWorthLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  netWorthValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },
  netWorthDetails: { flexDirection: "row", marginTop: 20 },
  netWorthItem: { flex: 1 },
  netWorthItemLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  netWorthItemValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  divider: { width: 1, marginHorizontal: 16 },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: "center" },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statLabel: { fontSize: 12, textAlign: "center", marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: "600" },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  quickActions: { flexDirection: "row" },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionInfo: { flex: 1 },
  transactionNote: { fontSize: 14, fontWeight: "500" },
  accountsList: { flexDirection: "row" },
  accountCard: { width: 140, padding: 16, borderRadius: 16 },
  accountIcon: { fontSize: 28, marginBottom: 8 },
  accountName: { color: "#fff", fontSize: 14, fontWeight: "500" },
  accountBalance: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
});
