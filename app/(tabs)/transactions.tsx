import { useState, useMemo } from "react";
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
import { useTransactionContext } from "@/contexts/TransactionContext";
import { useSettings } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO, addMonths, subMonths, isSameMonth } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Search,
  SlidersHorizontal,
  Plus,
  Utensils,
  Car,
  Smartphone,
  Coins,
} from "lucide-react-native";
import { Transaction } from "@/types";

type ViewTab = "harian" | "kalender" | "bulanan" | "tutup" | "memo";

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactionContext();
  const { settings } = useSettings();
  const { getCategoryById } = useCategories();
  const { accounts } = useAccounts();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ViewTab>("harian");

  // Filter transactions for current month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = parseISO(t.date);
      return isSameMonth(txDate, currentMonth);
    });
  }, [transactions, currentMonth]);

  // Calculate monthly summary
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    monthTransactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
    });
    return { income, expense, total: income - expense };
  }, [monthTransactions]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: {
      [key: string]: {
        date: Date;
        transactions: Transaction[];
        income: number;
        expense: number;
      };
    } = {};

    monthTransactions.forEach((t) => {
      const dateKey = t.date.split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: parseISO(t.date),
          transactions: [],
          income: 0,
          expense: 0,
        };
      }
      groups[dateKey].transactions.push(t);
      if (t.type === "income") groups[dateKey].income += t.amount;
      if (t.type === "expense") groups[dateKey].expense += t.amount;
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([_, group]) => group);
  }, [monthTransactions]);

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || "Akun";
  };

  const tabs: { key: ViewTab; label: string }[] = [
    { key: "harian", label: "Harian" },
    { key: "kalender", label: "Kalender" },
    { key: "bulanan", label: "Bulanan" },
    { key: "tutup", label: "Tutup buku" },
    { key: "memo", label: "Memo" },
  ];

  const formatMonthYear = (date: Date) => {
    return format(date, "MMM yyyy", { locale: idLocale });
  };

  const formatDayHeader = (date: Date) => {
    const day = format(date, "d");
    const dayName = format(date, "EEE", { locale: idLocale });
    const monthYear = format(date, "MM.yyyy");
    return { day, dayName, monthYear };
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Month Navigator */}
      <View style={[styles.monthNav, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>
          {formatMonthYear(currentMonth)}
        </Text>
        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.monthNavIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Star size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <SlidersHorizontal size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* View Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
              activeTab === tab.key && { borderBottomColor: colors.text },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab.key ? colors.text : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary Row */}
      <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Pendapatan
          </Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>
            {formatCurrency(summary.income, settings.currency).replace(
              "Rp",
              ""
            )}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Pengeluaran
          </Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>
            {formatCurrency(summary.expense, settings.currency).replace(
              "Rp",
              ""
            )}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
          <Text
            style={[
              styles.summaryValue,
              { color: summary.total >= 0 ? colors.income : colors.expense },
            ]}
          >
            {formatCurrency(summary.total, settings.currency).replace("Rp", "")}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.list}>
        {groupedTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada transaksi bulan ini
            </Text>
          </View>
        ) : (
          groupedTransactions.map((group, groupIndex) => {
            const { day, dayName, monthYear } = formatDayHeader(group.date);
            return (
              <View key={groupIndex}>
                {/* Date Header */}
                <View
                  style={[
                    styles.dateHeader,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.dateInfo}>
                    <Text style={[styles.dateDay, { color: colors.text }]}>
                      {day}
                    </Text>
                    <View
                      style={[
                        styles.dateBadge,
                        { backgroundColor: colors.card },
                      ]}
                    >
                      <Text
                        style={[styles.dateBadgeText, { color: colors.text }]}
                      >
                        {dayName}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.dateMonthYear,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {monthYear}
                    </Text>
                  </View>
                  <View style={styles.dateAmounts}>
                    <Text style={[styles.dateIncome, { color: colors.income }]}>
                      Rp {group.income.toLocaleString("id-ID")}
                    </Text>
                    <Text
                      style={[styles.dateExpense, { color: colors.expense }]}
                    >
                      Rp {group.expense.toLocaleString("id-ID")}
                    </Text>
                  </View>
                </View>

                {/* Transactions for this date */}
                {group.transactions.map((transaction) => {
                  const category = transaction.categoryId
                    ? getCategoryById(transaction.categoryId)
                    : null;
                  return (
                    <TouchableOpacity
                      key={transaction.id}
                      style={styles.transactionItem}
                      onPress={() =>
                        router.push(`/transaction/${transaction.id}`)
                      }
                    >
                      <View style={styles.transactionLeft}>
                        <Text
                          style={[
                            styles.categoryIcon,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {category?.icon || "💰"}
                        </Text>
                        <Text
                          style={[
                            styles.categoryLabel,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {category?.name || transaction.type}
                        </Text>
                      </View>
                      <View style={styles.transactionMiddle}>
                        <Text
                          style={[
                            styles.transactionNote,
                            { color: colors.text },
                          ]}
                        >
                          {transaction.note || category?.name || "Transaksi"}
                        </Text>
                        <Text
                          style={[
                            styles.transactionAccount,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {getAccountName(transaction.accountId)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color:
                              transaction.type === "income"
                                ? colors.income
                                : colors.expense,
                          },
                        ]}
                      >
                        Rp {transaction.amount.toLocaleString("id-ID")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.expense }]}
        onPress={() => router.push("/transaction/expense")}
      >
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  monthNavButton: { padding: 4 },
  monthText: { fontSize: 16, fontWeight: "600", marginHorizontal: 8 },
  monthNavIcons: { flexDirection: "row", marginLeft: "auto" },
  iconButton: { padding: 8, marginLeft: 8 },
  tabsContainer: { maxHeight: 44 },
  tabsContent: { paddingHorizontal: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: "500" },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 13, fontWeight: "600" },
  list: { flex: 1 },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 14 },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateInfo: { flexDirection: "row", alignItems: "center" },
  dateDay: { fontSize: 18, fontWeight: "bold", marginRight: 8 },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  dateBadgeText: { fontSize: 12 },
  dateMonthYear: { fontSize: 12 },
  dateAmounts: { flexDirection: "row" },
  dateIncome: { fontSize: 12, marginRight: 16 },
  dateExpense: { fontSize: 12 },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transactionLeft: { width: 80 },
  categoryIcon: { fontSize: 12, marginBottom: 2 },
  categoryLabel: { fontSize: 11 },
  transactionMiddle: { flex: 1, paddingHorizontal: 8 },
  transactionNote: { fontSize: 14, fontWeight: "500" },
  transactionAccount: { fontSize: 12, marginTop: 2 },
  transactionAmount: { fontSize: 14, fontWeight: "500" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
