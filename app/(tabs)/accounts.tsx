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
import { useAccounts } from "@/hooks/useAccounts";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency } from "@/utils/formatters";
import { Account, AccountType } from "@/types";
import {
  Plus,
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  TrendingUp,
  Bitcoin,
  Receipt,
  CircleDollarSign,
  LucideIcon,
} from "lucide-react-native";

// Helper function to get Lucide icon by account type
function getAccountIcon(type: AccountType): LucideIcon {
  switch (type) {
    case "cash":
      return Wallet;
    case "bank":
      return Building2;
    case "ewallet":
      return Smartphone;
    case "credit_card":
      return CreditCard;
    case "investment":
      return TrendingUp;
    case "crypto":
      return Bitcoin;
    case "loan":
      return Receipt;
    default:
      return CircleDollarSign;
  }
}

type ViewTab = "aset" | "liabilitas";

export default function AccountsScreen() {
  const { colors } = useTheme();
  const {
    balances,
    totalAssets,
    totalLiabilities,
    netWorth,
    assetAccounts,
    liabilityAccounts,
  } = useAccounts();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<ViewTab>("aset");

  const assetsWithBalance = assetAccounts.map((account) => ({
    ...account,
    balance: balances.get(account.id) || 0,
  }));

  const liabilitiesWithBalance = liabilityAccounts.map((account) => ({
    ...account,
    balance: balances.get(account.id) || 0,
  }));

  const accounts =
    activeTab === "aset" ? assetsWithBalance : liabilitiesWithBalance;
  const total = activeTab === "aset" ? totalAssets : totalLiabilities;

  const tabs: { key: ViewTab; label: string; count: number }[] = [
    { key: "aset", label: "Aset", count: assetsWithBalance.length },
    {
      key: "liabilitas",
      label: "Liabilitas",
      count: liabilitiesWithBalance.length,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Aset</Text>
        <TouchableOpacity onPress={() => router.push("/account/new")}>
          <Plus size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Summary Row */}
      <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total Aset
          </Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>
            {formatCurrency(totalAssets, settings.currency).replace("Rp", "")}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Liabilitas
          </Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>
            {formatCurrency(totalLiabilities, settings.currency).replace(
              "Rp",
              ""
            )}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Net Worth
          </Text>
          <Text
            style={[
              styles.summaryValue,
              { color: netWorth >= 0 ? colors.income : colors.expense },
            ]}
          >
            {formatCurrency(netWorth, settings.currency).replace("Rp", "")}
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
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account List */}
      <ScrollView style={styles.list}>
        {accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada {activeTab}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/account/new")}
            >
              <Text style={styles.addButtonText}>+ Tambah Akun</Text>
            </TouchableOpacity>
          </View>
        ) : (
          accounts.map((account: Account & { balance: number }) => {
            const AccountIcon = getAccountIcon(account.type);
            const typeLabel =
              account.type === "cash"
                ? "Tunai"
                : account.type === "bank"
                ? "Bank"
                : account.type === "ewallet"
                ? "E-Wallet"
                : account.type === "credit_card"
                ? "Kartu Kredit"
                : account.type === "investment"
                ? "Investasi"
                : account.type === "crypto"
                ? "Cryptocurrency"
                : account.type === "loan"
                ? "Pinjaman"
                : "Lainnya";
            return (
              <TouchableOpacity
                key={account.id}
                style={styles.accountItem}
                onPress={() => router.push(`/account/${account.id}`)}
              >
                <View
                  style={[
                    styles.accountIconBg,
                    { backgroundColor: account.color || colors.primary },
                  ]}
                >
                  <AccountIcon size={22} color="#fff" strokeWidth={1.5} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {account.name}
                  </Text>
                  <Text
                    style={[
                      styles.accountType,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {typeLabel}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.accountBalance,
                    {
                      color:
                        activeTab === "aset" ? colors.income : colors.expense,
                    },
                  ]}
                >
                  Rp {account.balance.toLocaleString("id-ID")}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* Total */}
        {accounts.length > 0 && (
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Total {activeTab === "aset" ? "Aset" : "Liabilitas"}
            </Text>
            <Text
              style={[
                styles.totalValue,
                {
                  color: activeTab === "aset" ? colors.income : colors.expense,
                },
              ]}
            >
              Rp {total.toLocaleString("id-ID")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
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
  emptyText: { fontSize: 14, marginBottom: 16 },
  addButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  accountIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountIcon: { fontSize: 20 },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: "500" },
  accountType: { fontSize: 12, marginTop: 2 },
  accountBalance: { fontSize: 15, fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 14, fontWeight: "500" },
  totalValue: { fontSize: 16, fontWeight: "600" },
});
