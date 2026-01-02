import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency, formatRelativeDate } from "@/utils/formatters";

type FilterType = "all" | "income" | "expense" | "transfer";

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  const { settings } = useSettings();
  const { getCategoryById } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !searchQuery || t.note?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "income", label: "📥 Masuk" },
    { key: "expense", label: "📤 Keluar" },
    { key: "transfer", label: "🔄 Transfer" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Transaksi</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="🔍 Cari transaksi..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filterType === filter.key ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setFilterType(filter.key)}
          >
            <Text
              style={{
                color: filterType === filter.key ? "#fff" : colors.text,
                fontWeight: "500",
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView style={styles.list}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery
                ? "Tidak ada transaksi yang cocok"
                : "Belum ada transaksi"}
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => {
            const category = transaction.categoryId
              ? getCategoryById(transaction.categoryId)
              : null;
            return (
              <TouchableOpacity
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  { backgroundColor: colors.card },
                ]}
                onPress={() => router.push(`/transaction/${transaction.id}`)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: category?.color || colors.primary },
                  ]}
                >
                  <Text style={styles.categoryIcon}>
                    {category?.icon || "💰"}
                  </Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text
                    style={[styles.transactionNote, { color: colors.text }]}
                  >
                    {transaction.note || category?.name || transaction.type}
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
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
});
