import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCategories } from "@/hooks/useCategories";

type TabType = "expense" | "income";

export default function CategoryScreen() {
  const { colors } = useTheme();
  const { expenseCategories, incomeCategories } = useCategories();
  const [tab, setTab] = useState<TabType>("expense");

  const categories = tab === "expense" ? expenseCategories : incomeCategories;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Kategori</Text>
        <TouchableOpacity onPress={() => router.push("/category/new")}>
          <Text style={{ fontSize: 18, color: colors.primary }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: tab === "expense" ? colors.primary : colors.card,
            },
          ]}
          onPress={() => setTab("expense")}
        >
          <Text
            style={{
              color: tab === "expense" ? "#fff" : colors.text,
              fontWeight: "500",
            }}
          >
            📤 Pengeluaran ({expenseCategories.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: tab === "income" ? colors.primary : colors.card,
            },
          ]}
          onPress={() => setTab("income")}
        >
          <Text
            style={{
              color: tab === "income" ? "#fff" : colors.text,
              fontWeight: "500",
            }}
          >
            📥 Pemasukan ({incomeCategories.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {categories.map((category) => (
          <View
            key={category.id}
            style={[styles.item, { backgroundColor: colors.card }]}
          >
            <View
              style={[styles.iconWrapper, { backgroundColor: category.color }]}
            >
              <Text style={styles.icon}>{category.icon}</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {category.name}
              </Text>
              {category.isDefault && (
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Default
                </Text>
              )}
            </View>
          </View>
        ))}
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
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center" },
  list: { flex: 1, padding: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  itemContent: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "500" },
});
