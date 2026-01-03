import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  parseISO,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";

interface CategoryAnalysisItem {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

type ViewTab = "pengeluaran" | "pendapatan";

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  const { expenseCategories, incomeCategories } = useCategories();
  const { settings } = useSettings();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<ViewTab>("pengeluaran");

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

  // Calculate category analysis
  const categoryAnalysis: CategoryAnalysisItem[] = useMemo(() => {
    const categories =
      activeTab === "pengeluaran" ? expenseCategories : incomeCategories;
    const type = activeTab === "pengeluaran" ? "expense" : "income";
    const total =
      activeTab === "pengeluaran" ? summary.expense : summary.income;

    return categories
      .map((cat) => {
        const amount = monthTransactions
          .filter((t) => t.type === type && t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          icon: cat.icon,
          color: cat.color,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        };
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [
    monthTransactions,
    activeTab,
    expenseCategories,
    incomeCategories,
    summary,
  ]);

  const formatMonthYear = (date: Date) => {
    return format(date, "MMM yyyy", { locale: idLocale });
  };

  const tabs: { key: ViewTab; label: string }[] = [
    { key: "pengeluaran", label: "Pengeluaran" },
    { key: "pendapatan", label: "Pendapatan" },
  ];

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
      </View>

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

      {/* View Tabs */}
      <View style={styles.tabsContainer}>
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
      </View>

      {/* Category List */}
      <ScrollView style={styles.list}>
        {categoryAnalysis.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada data {activeTab} bulan ini
            </Text>
          </View>
        ) : (
          categoryAnalysis.map((item) => (
            <View key={item.categoryId} style={styles.categoryItem}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryIconBg,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                </View>
              </View>
              <View style={styles.categoryMiddle}>
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {item.categoryName}
                </Text>
                <View
                  style={[
                    styles.progressBg,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: item.color,
                        width: `${Math.min(item.percentage, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.categoryRight}>
                <Text style={[styles.categoryAmount, { color: colors.text }]}>
                  Rp {item.amount.toLocaleString("id-ID")}
                </Text>
                <Text
                  style={[
                    styles.categoryPercent,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatPercentage(item.percentage, 1)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  monthNavButton: { padding: 8 },
  monthText: { fontSize: 16, fontWeight: "600", marginHorizontal: 16 },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 13, fontWeight: "600" },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: "500" },
  list: { flex: 1, padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 14 },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  categoryLeft: { marginRight: 12 },
  categoryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: { fontSize: 18 },
  categoryMiddle: { flex: 1, marginRight: 12 },
  categoryName: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  progressBg: { height: 6, borderRadius: 3 },
  progressBar: { height: 6, borderRadius: 3 },
  categoryRight: { alignItems: "flex-end" },
  categoryAmount: { fontSize: 14, fontWeight: "500" },
  categoryPercent: { fontSize: 12, marginTop: 2 },
});
