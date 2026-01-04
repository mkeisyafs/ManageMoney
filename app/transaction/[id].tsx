import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { getTransactionById } from "@/services/storage/mmkv";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft,
  Trash2,
  Check,
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
import { AccountType, TransactionType } from "@/types";

// Get icon by account type
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

export default function TransactionEditScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accounts } = useAccounts();
  const { expenseCategories, incomeCategories } = useCategories();
  const { updateTransaction, deleteTransaction, transactions } =
    useTransactionContext();

  // Find transaction from context (shared state)
  const transaction =
    transactions.find((t) => t.id === id) || getTransactionById(id);

  const [transactionType, setTransactionType] = useState<TransactionType>(
    transaction?.type || "expense"
  );
  const [rawAmount, setRawAmount] = useState(
    transaction?.amount.toString() || ""
  );
  const [accountId, setAccountId] = useState(transaction?.accountId || "");
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || "");
  const [note, setNote] = useState(transaction?.note || "");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // Format number as Rupiah currency
  const formatDisplayAmount = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (!numbers) return "";
    const num = parseInt(numbers, 10);
    return "Rp " + num.toLocaleString("id-ID");
  };

  const handleAmountChange = (text: string) => {
    // Only keep numbers
    const numbers = text.replace(/[^0-9]/g, "");
    setRawAmount(numbers);
  };

  const displayAmount = formatDisplayAmount(rawAmount);

  const categories =
    transactionType === "income" ? incomeCategories : expenseCategories;

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/transactions");
    }
  }, []);

  if (!transaction) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Transaksi tidak ditemukan</Text>
          <TouchableOpacity style={{ marginTop: 16 }} onPress={handleGoBack}>
            <Text style={{ color: colors.primary }}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const transactionDate = parseISO(transaction.date);
  const formattedDate = format(transactionDate, "dd MMM yyyy", {
    locale: idLocale,
  });
  const formattedTime = format(transactionDate, "HH:mm");

  const handleSave = () => {
    const amountNum = parseFloat(rawAmount || "0");
    if (amountNum <= 0) {
      Alert.alert("Error", "Masukkan jumlah yang valid");
      return;
    }
    if (!accountId) {
      Alert.alert("Error", "Pilih akun");
      return;
    }
    if (!categoryId && transactionType !== "transfer") {
      Alert.alert("Error", "Pilih kategori");
      return;
    }

    updateTransaction(id, {
      type: transactionType,
      amount: amountNum,
      accountId,
      categoryId: transactionType !== "transfer" ? categoryId : undefined,
      note: note.trim() || undefined,
    });

    handleGoBack();
  };

  const handleDelete = () => {
    // For web, use confirm instead of Alert
    if (Platform.OS === "web") {
      if (
        window.confirm("Hapus Transaksi? Transaksi ini akan dihapus permanen.")
      ) {
        deleteTransaction(id);
        handleGoBack();
      }
    } else {
      Alert.alert("Hapus Transaksi?", "Transaksi ini akan dihapus permanen.", [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteTransaction(id);
            handleGoBack();
          },
        },
      ]);
    }
  };

  const typeColor =
    transactionType === "income"
      ? colors.income
      : transactionType === "expense"
      ? colors.expense
      : colors.primary;

  const typeTabs: { key: TransactionType; label: string }[] = [
    { key: "income", label: "Pemasukan" },
    { key: "expense", label: "Pengeluaran" },
    { key: "transfer", label: "Transfer" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleGoBack}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Edit Transaksi
        </Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleSave}>
          <Check size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Type Tabs */}
      <View style={styles.typeTabs}>
        {typeTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.typeTab,
              {
                backgroundColor:
                  transactionType === tab.key ? typeColor : "transparent",
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setTransactionType(tab.key);
              if (tab.key === "income") {
                setCategoryId(incomeCategories[0]?.id || "");
              } else if (tab.key === "expense") {
                setCategoryId(expenseCategories[0]?.id || "");
              }
            }}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: transactionType === tab.key ? "#fff" : colors.text },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Date Row (Read-only) */}
        <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Tanggal
          </Text>
          <Text style={[styles.formValueText, { color: colors.text }]}>
            {formattedDate} • {formattedTime}
          </Text>
        </View>

        {/* Amount Row */}
        <View style={[styles.formRow, { borderBottomColor: typeColor }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Jumlah
          </Text>
          <TextInput
            style={[styles.amountInput, { color: typeColor }]}
            value={displayAmount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="Rp 0"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Category Row */}
        {transactionType !== "transfer" && (
          <>
            <TouchableOpacity
              style={[styles.formRow, { borderBottomColor: colors.border }]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                Kategori
              </Text>
              <Text style={[styles.formValueText, { color: colors.text }]}>
                {selectedCategory?.icon} {selectedCategory?.name || "Pilih"}
              </Text>
            </TouchableOpacity>

            {showCategoryPicker && (
              <View
                style={[styles.pickerGrid, { backgroundColor: colors.card }]}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pickerItem,
                      categoryId === cat.id && {
                        backgroundColor: typeColor + "20",
                      },
                    ]}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.pickerIcon}>{cat.icon}</Text>
                    <Text
                      style={[styles.pickerText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Account Row */}
        <TouchableOpacity
          style={[styles.formRow, { borderBottomColor: colors.border }]}
          onPress={() => setShowAccountPicker(!showAccountPicker)}
        >
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Akun
          </Text>
          <View style={styles.accountValue}>
            {selectedAccount && (
              <>
                {(() => {
                  const AccIcon = getAccountIcon(selectedAccount.type);
                  return (
                    <View
                      style={[
                        styles.accountIcon,
                        { backgroundColor: selectedAccount.color },
                      ]}
                    >
                      <AccIcon size={14} color="#fff" />
                    </View>
                  );
                })()}
                <Text style={[styles.formValueText, { color: colors.text }]}>
                  {selectedAccount.name}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {showAccountPicker && (
          <View style={[styles.pickerList, { backgroundColor: colors.card }]}>
            {accounts.map((acc) => {
              const AccIcon = getAccountIcon(acc.type);
              return (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.accountPickerItem,
                    accountId === acc.id && {
                      backgroundColor: colors.primary + "20",
                    },
                  ]}
                  onPress={() => {
                    setAccountId(acc.id);
                    setShowAccountPicker(false);
                  }}
                >
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: acc.color || colors.primary },
                    ]}
                  >
                    <AccIcon size={16} color="#fff" />
                  </View>
                  <Text
                    style={[styles.accountPickerText, { color: colors.text }]}
                  >
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Note Row */}
        <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Catatan
          </Text>
          <TextInput
            style={[styles.noteInput, { color: colors.text }]}
            value={note}
            onChangeText={setNote}
            placeholder="Tambah catatan..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: colors.expense }]}
          onPress={handleDelete}
        >
          <Trash2 size={16} color={colors.expense} />
          <Text style={[styles.deleteBtnText, { color: colors.expense }]}>
            Hapus Transaksi
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: typeColor }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  typeTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  typeTabText: { fontSize: 13, fontWeight: "500" },
  content: { flex: 1 },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  formLabel: { width: 80, fontSize: 14 },
  formValueText: { fontSize: 14, fontWeight: "500" },
  amountInput: { flex: 1, fontSize: 20, fontWeight: "600", padding: 0 },
  noteInput: { flex: 1, fontSize: 14, padding: 0 },
  accountValue: { flex: 1, flexDirection: "row", alignItems: "center" },
  accountIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  pickerItem: {
    width: "25%",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  pickerIcon: { fontSize: 24, marginBottom: 4 },
  pickerText: { fontSize: 11, textAlign: "center" },
  pickerList: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  accountPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  accountPickerText: { fontSize: 14, fontWeight: "500" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  deleteBtnText: { fontSize: 14, fontWeight: "500" },
  footer: { padding: 16 },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
