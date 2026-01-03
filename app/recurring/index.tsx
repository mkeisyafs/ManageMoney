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
import { useRecurring } from "@/hooks/useRecurring";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency } from "@/utils/formatters";

export default function RecurringScreen() {
  const { colors } = useTheme();
  const { recurring, toggleEnabled } = useRecurring();
  const { settings } = useSettings();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Transaksi Berulang
        </Text>
        <TouchableOpacity onPress={() => router.push("/recurring/new")}>
          <Text style={{ fontSize: 18, color: colors.primary }}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {recurring.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔄</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Belum ada transaksi berulang
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Buat transaksi berulang untuk pembayaran rutin
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/recurring/new")}
            >
              <Text style={styles.addButtonText}>+ Buat Baru</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recurring.map((item) => (
            <View
              key={item.id}
              style={[styles.item, { backgroundColor: colors.card }]}
            >
              <View style={styles.itemContent}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.note ||
                    (item.type === "income"
                      ? "Pemasukan Rutin"
                      : item.type === "expense"
                      ? "Pengeluaran Rutin"
                      : "Transfer Rutin")}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {formatCurrency(item.amount, settings.currency)} •{" "}
                  {item.frequency}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  {
                    backgroundColor: item.isEnabled
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => toggleEnabled(item.id)}
              >
                <Text style={{ color: "#fff" }}>
                  {item.isEnabled ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemContent: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "500", marginBottom: 4 },
  toggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
});
