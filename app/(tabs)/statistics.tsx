import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from "date-fns";

type PeriodType = "week" | "month" | "lastMonth";

interface CategoryAnalysisItem {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const { transactions, monthSummary } = useTransactions();
  const { categories, expenseCategories } = useCategories();
  const { settings } = useSettings();
  const [period, setPeriod] = useState<PeriodType>("month");

  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "week":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "lastMonth":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      break;
    case "month":
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
  }

  // Filter transactions by period
  const periodTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= startDate && tDate <= endDate;
  });

  // Calculate period summary
  const periodSummary = periodTransactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else if (t.type === "expense") acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
  const netFlow = periodSummary.income - periodSummary.expense;

  // Calculate category analysis for expenses
  const categoryAnalysis: CategoryAnalysisItem[] = expenseCategories
    .map((cat) => {
      const amount = periodTransactions
        .filter((t) => t.type === "expense" && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        icon: cat.icon,
        color: cat.color,
        amount,
        percentage:
          periodSummary.expense > 0
            ? (amount / periodSummary.expense) * 100
            : 0,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Generate simple insights
  const insights: string[] = [];
  if (netFlow > 0) {
    insights.push(
      `💰 Anda berhasil menabung ${formatCurrency(
        netFlow,
        settings.currency
      )} bulan ini!`
    );
  } else if (netFlow < 0) {
    insights.push(
      `⚠️ Pengeluaran melebihi pemasukan sebesar ${formatCurrency(
        Math.abs(netFlow),
        settings.currency
      )}`
    );
  }
  if (categoryAnalysis.length > 0) {
    insights.push(
      `📊 Pengeluaran terbesar: ${
        categoryAnalysis[0].categoryName
      } (${formatPercentage(categoryAnalysis[0].percentage)})`
    );
  }

  const periods: { key: PeriodType; label: string }[] = [
    { key: "week", label: "Minggu Ini" },
    { key: "month", label: "Bulan Ini" },
    { key: "lastMonth", label: "Bulan Lalu" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Statistik</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodButton,
                {
                  backgroundColor:
                    period === p.key ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setPeriod(p.key)}
            >
              <Text
                style={{
                  color: period === p.key ? "#fff" : colors.text,
                  fontWeight: "500",
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Pemasukan
            </Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              {formatCurrency(periodSummary.income, settings.currency)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Pengeluaran
            </Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              {formatCurrency(periodSummary.expense, settings.currency)}
            </Text>
          </View>
        </View>

        {/* Net */}
        <View style={[styles.netCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.netLabel, { color: colors.textSecondary }]}>
            Selisih Bersih
          </Text>
          <Text
            style={[
              styles.netValue,
              { color: netFlow >= 0 ? colors.income : colors.expense },
            ]}
          >
            {netFlow >= 0 ? "+" : ""}
            {formatCurrency(netFlow, settings.currency)}
          </Text>
        </View>

        {/* Category Breakdown */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pengeluaran per Kategori
          </Text>
          {categoryAnalysis.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={{ color: colors.textSecondary }}>
                Belum ada data pengeluaran
              </Text>
            </View>
          ) : (
            categoryAnalysis.slice(0, 5).map((item: CategoryAnalysisItem) => (
              <View key={item.categoryId} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{item.icon}</Text>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {item.categoryName}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text, fontWeight: "500" }}>
                    {formatPercentage(item.percentage)}
                  </Text>
                </View>
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
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {formatCurrency(item.amount, settings.currency)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Insights */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, marginBottom: 24 },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💡 Insight
          </Text>
          {insights.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              Tambahkan lebih banyak transaksi untuk melihat insight
            </Text>
          ) : (
            insights.slice(0, 3).map((insight: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.insightItem,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={{ color: colors.text }}>{insight}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  title: { fontSize: 28, fontWeight: "bold" },
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: "bold" },
  netCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  netLabel: { fontSize: 12 },
  netValue: { fontSize: 24, fontWeight: "bold", marginTop: 4 },
  section: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  emptyState: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  categoryItem: { marginBottom: 16 },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryInfo: { flexDirection: "row", alignItems: "center" },
  categoryIcon: { fontSize: 20 },
  categoryName: { fontSize: 14, fontWeight: "500" },
  progressBg: { height: 8, borderRadius: 4 },
  progressBar: { height: 8, borderRadius: 4 },
  insightItem: { padding: 12, borderRadius: 8, marginBottom: 8 },
});
