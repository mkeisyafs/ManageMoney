import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";
import { deleteAccount } from "@/services/storage/mmkv";
import { formatCurrency, formatRelativeDate } from "@/utils/formatters";
import { AccountType } from "@/types";
import {
  ChevronLeft,
  Trash2,
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  TrendingUp,
  Bitcoin,
  Receipt,
  CircleDollarSign,
  RefreshCw,
  LucideIcon,
} from "lucide-react-native";

// Helper function to get icon by account type
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

// Helper function to get account type label in Indonesian
function getAccountTypeLabel(type: AccountType): string {
  switch (type) {
    case "cash":
      return "Tunai";
    case "bank":
      return "Bank";
    case "ewallet":
      return "E-Wallet";
    case "credit_card":
      return "Kartu Kredit";
    case "investment":
      return "Investasi";
    case "crypto":
      return "Cryptocurrency";
    case "loan":
      return "Pinjaman";
    default:
      return "Lainnya";
  }
}

export default function AccountDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { balances, getAccountById, refresh: refreshAccounts } = useAccounts();
  const {
    transactions,
    addTransaction,
    refresh: refreshTransactions,
  } = useTransactions();
  const { categories } = useCategories();
  const { settings } = useSettings();

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [newBalance, setNewBalance] = useState("");

  const account = getAccountById(id);

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/accounts");
    }
  }, []);

  if (!account) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Akun tidak ditemukan</Text>
          <TouchableOpacity
            style={[styles.backBtn, { marginTop: 16 }]}
            onPress={handleGoBack}
          >
            <Text style={{ color: colors.primary }}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const balance = balances.get(account.id) || 0;
  const accountTransactions = transactions
    .filter((t) => t.accountId === account.id || t.toAccountId === account.id)
    .slice(0, 10);

  const AccountIcon = getAccountIcon(account.type);

  const handleDelete = () => {
    Alert.alert(
      "Hapus Akun?",
      "Akun dan semua transaksi terkait akan dihapus.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteAccount(id);
            handleGoBack();
          },
        },
      ]
    );
  };

  const handleAdjustBalance = () => {
    const newBalanceNum = parseFloat(newBalance.replace(/[^0-9.-]/g, ""));
    if (isNaN(newBalanceNum)) {
      Alert.alert("Error", "Masukkan angka yang valid");
      return;
    }

    const difference = newBalanceNum - balance;
    if (difference === 0) {
      setAdjustModalVisible(false);
      setNewBalance("");
      return;
    }

    // Find "Penyesuaian" category
    const adjustmentType = difference > 0 ? "income" : "expense";
    const adjustmentCategory = categories.find(
      (c) => c.name === "Penyesuaian" && c.type === adjustmentType
    );

    // Create adjustment transaction
    addTransaction({
      type: adjustmentType,
      amount: Math.abs(difference),
      accountId: account.id,
      categoryId: adjustmentCategory?.id,
      note: "Penyesuaian saldo",
      date: new Date().toISOString(),
    });

    // Immediately refresh data
    setTimeout(() => {
      refreshAccounts();
      refreshTransactions();
    }, 100);

    setAdjustModalVisible(false);
    setNewBalance("");
  };

  const openAdjustModal = () => {
    setNewBalance(balance.toString());
    setAdjustModalVisible(true);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Detail Akun
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Info Card */}
        <View
          style={[
            styles.accountCard,
            { backgroundColor: account.color || colors.primary },
          ]}
        >
          <View style={styles.iconWrapper}>
            <AccountIcon size={28} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountType}>
            {getAccountTypeLabel(account.type)}
          </Text>
          <Text style={styles.balance}>
            {formatCurrency(balance, settings.currency)}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.adjustBtn, { backgroundColor: colors.card }]}
          onPress={openAdjustModal}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color={colors.primary} />
          <Text style={[styles.adjustBtnText, { color: colors.text }]}>
            Sesuaikan Saldo
          </Text>
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transaksi Terbaru
          </Text>
          {accountTransactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada transaksi
            </Text>
          ) : (
            accountTransactions.map((tx, i) => (
              <TouchableOpacity
                key={tx.id}
                style={[
                  styles.txItem,
                  i < accountTransactions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => router.push(`/transaction/${tx.id}`)}
              >
                <View style={styles.txInfo}>
                  <Text style={[styles.txNote, { color: colors.text }]}>
                    {tx.note || tx.type}
                  </Text>
                  <Text
                    style={[styles.txDate, { color: colors.textSecondary }]}
                  >
                    {formatRelativeDate(tx.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    {
                      color:
                        tx.type === "income"
                          ? colors.income
                          : tx.type === "expense"
                          ? colors.expense
                          : colors.primary,
                    },
                  ]}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount, settings.currency)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: colors.expense }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color={colors.expense} />
          <Text style={[styles.deleteBtnText, { color: colors.expense }]}>
            Hapus Akun
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Adjust Balance Modal */}
      <Modal
        visible={adjustModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAdjustModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalBox, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Sesuaikan Saldo
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Saldo saat ini: {formatCurrency(balance, settings.currency)}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={newBalance}
              onChangeText={setNewBalance}
              keyboardType="numeric"
              placeholder="Saldo baru"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: colors.background },
                ]}
                onPress={() => setAdjustModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleAdjustBalance}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  backBtn: { padding: 8 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  content: { flex: 1 },
  accountCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  accountName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  accountType: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 12,
  },
  balance: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  adjustBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  adjustBtnText: { fontSize: 15, fontWeight: "500" },
  section: { margin: 16, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  emptyText: { fontSize: 13, textAlign: "center", paddingVertical: 16 },
  txItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  txInfo: { flex: 1 },
  txNote: { fontSize: 14, fontWeight: "500" },
  txDate: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "600" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  deleteBtnText: { fontSize: 14, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: { width: "100%", maxWidth: 320, borderRadius: 14, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: "600", marginBottom: 6 },
  modalSub: { fontSize: 13, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
});
