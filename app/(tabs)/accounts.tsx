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
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency } from "@/utils/formatters";
import { Account } from "@/types";

export default function AccountsScreen() {
  const { colors } = useTheme();
  const {
    accounts,
    balances,
    totalAssets,
    totalLiabilities,
    netWorth,
    assetAccounts,
    liabilityAccounts,
  } = useAccounts();
  const { settings } = useSettings();

  // Create accounts with balance for display
  const assetsWithBalance = assetAccounts.map((account) => ({
    ...account,
    balance: balances.get(account.id) || 0,
  }));

  const liabilitiesWithBalance = liabilityAccounts.map((account) => ({
    ...account,
    balance: balances.get(account.id) || 0,
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Akun Saya</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/account/new")}
          >
            <Text style={styles.addButtonText}>+ Tambah Akun</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>Total Kekayaan Bersih</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(netWorth, settings.currency)}
          </Text>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>📈 Total Aset</Text>
              <Text style={styles.summaryItemValue}>
                {formatCurrency(totalAssets, settings.currency)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>📉 Total Liabilitas</Text>
              <Text style={styles.summaryItemValue}>
                {formatCurrency(totalLiabilities, settings.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Assets Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Aset ({assetsWithBalance.length})
          </Text>
          {assetsWithBalance.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.textSecondary }}>
                Belum ada akun aset
              </Text>
            </View>
          ) : (
            assetsWithBalance.map((account: Account & { balance: number }) => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountItem, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/account/${account.id}`)}
              >
                <View
                  style={[
                    styles.accountIcon,
                    { backgroundColor: account.color },
                  ]}
                >
                  <Text style={styles.iconText}>{account.icon}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {account.type}
                  </Text>
                </View>
                <Text style={[styles.accountBalance, { color: colors.income }]}>
                  {formatCurrency(account.balance, settings.currency)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Liabilities Section */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liabilitas ({liabilitiesWithBalance.length})
          </Text>
          {liabilitiesWithBalance.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.textSecondary }}>
                Belum ada akun liabilitas
              </Text>
            </View>
          ) : (
            liabilitiesWithBalance.map(
              (account: Account & { balance: number }) => (
                <TouchableOpacity
                  key={account.id}
                  style={[styles.accountItem, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/account/${account.id}`)}
                >
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: account.color },
                    ]}
                  >
                    <Text style={styles.iconText}>{account.icon}</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: colors.text }]}>
                      {account.name}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {account.type}
                    </Text>
                  </View>
                  <Text
                    style={[styles.accountBalance, { color: colors.expense }]}
                  >
                    {formatCurrency(account.balance, settings.currency)}
                  </Text>
                </TouchableOpacity>
              )
            )
          )}
        </View>
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
  title: { fontSize: 28, fontWeight: "bold" },
  addButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  summaryCard: { margin: 16, marginTop: 0, padding: 20, borderRadius: 20 },
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  summaryValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },
  summaryDetails: { flexDirection: "row", marginTop: 20 },
  summaryItem: { flex: 1 },
  summaryItemLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  summaryItemValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  emptyCard: { padding: 24, borderRadius: 12, alignItems: "center" },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 24 },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 16, fontWeight: "500" },
  accountBalance: { fontSize: 16, fontWeight: "600" },
});
