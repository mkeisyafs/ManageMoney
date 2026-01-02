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
import { useBudgets } from "@/hooks/useBudgets";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

export default function BudgetScreen() {
  const { colors } = useTheme();
  const { budgetsWithProgress } = useBudgets();
  const { settings } = useSettings();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Anggaran</Text>
        <TouchableOpacity onPress={() => router.push("/budget/new")}>
          <Text style={{ fontSize: 18, color: colors.primary }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {budgetsWithProgress.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Belum ada anggaran
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Buat anggaran untuk mengontrol pengeluaran
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/budget/new")}
            >
              <Text style={styles.addButtonText}>+ Buat Anggaran</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgetsWithProgress.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = percentage > 100;
            return (
              <View
                key={budget.id}
                style={[styles.item, { backgroundColor: colors.card }]}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.categoryIcon}>{budget.categoryIcon}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {budget.categoryName}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {budget.period}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: isOverBudget ? colors.expense : colors.text,
                      fontWeight: "600",
                    }}
                  >
                    {formatPercentage(Math.min(percentage, 100))}
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
                        backgroundColor: isOverBudget
                          ? colors.expense
                          : colors.primary,
                        width: `${Math.min(percentage, 100)}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.budgetDetails}>
                  <Text style={{ color: colors.textSecondary }}>
                    {formatCurrency(budget.spent, settings.currency)}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    dari {formatCurrency(budget.amount, settings.currency)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
  list: { flex: 1, padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  addButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  item: { padding: 16, borderRadius: 12, marginBottom: 12 },
  itemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  categoryIcon: { fontSize: 28, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "500" },
  progressBg: { height: 8, borderRadius: 4, marginBottom: 8 },
  progressBar: { height: 8, borderRadius: 4 },
  budgetDetails: { flexDirection: "row", justifyContent: "space-between" },
});
