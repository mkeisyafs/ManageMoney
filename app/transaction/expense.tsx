import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft,
  Star,
  RefreshCw,
  Camera,
  Delete,
  Globe,
  X,
  Calendar,
  ChevronRight,
} from "lucide-react-native";

type TransactionType = "income" | "expense" | "transfer";

export default function ExpenseScreen() {
  const { colors } = useTheme();
  const { accounts } = useAccounts();
  const { expenseCategories, incomeCategories } = useCategories();
  const { addTransaction } = useTransactionContext();

  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [showNumberPad, setShowNumberPad] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showToAccountModal, setShowToAccountModal] = useState(false);

  // Initialize default values when data is loaded
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
      if (accounts.length > 1) {
        setToAccountId(accounts[1].id);
      }
    }
  }, [accounts]);

  useEffect(() => {
    if (
      expenseCategories.length > 0 &&
      !categoryId &&
      transactionType === "expense"
    ) {
      setCategoryId(expenseCategories[0].id);
    }
    if (
      incomeCategories.length > 0 &&
      !categoryId &&
      transactionType === "income"
    ) {
      setCategoryId(incomeCategories[0].id);
    }
  }, [expenseCategories, incomeCategories, transactionType]);

  const currentDate = new Date();
  const formattedDate = format(currentDate, "dd/MM/yy (EEE)", {
    locale: idLocale,
  });
  const formattedTime = format(currentDate, "HH.mm");

  const categories =
    transactionType === "income" ? incomeCategories : expenseCategories;
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const selectedToAccount = accounts.find((a) => a.id === toAccountId);

  // Dynamic color based on transaction type
  const typeColor = useMemo(() => {
    switch (transactionType) {
      case "income":
        return colors.income;
      case "expense":
        return colors.expense;
      case "transfer":
        return "#2196F3";
      default:
        return colors.expense;
    }
  }, [transactionType, colors]);

  const handleNumberPress = (num: string) => {
    if (num === ",") {
      if (!amount.includes(",")) {
        setAmount((prev) => prev + num);
      }
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const formatDisplayAmount = (text: string) => {
    const numbers = text.replace(/[^0-9,]/g, "");
    if (!numbers) return "Rp 0";
    const parts = numbers.split(",");
    const integerPart = parts[0]
      ? parseInt(parts[0]).toLocaleString("id-ID")
      : "0";
    if (parts.length > 1) {
      return "Rp " + integerPart + "," + parts[1].slice(0, 2);
    }
    return "Rp " + integerPart;
  };

  const handleSave = () => {
    const amountNum = parseFloat(
      amount.replace(/\./g, "").replace(",", ".") || "0"
    );

    if (amountNum <= 0) {
      Alert.alert("Error", "Masukkan jumlah yang valid");
      return;
    }
    if (!accountId) {
      Alert.alert("Error", "Pilih akun sumber");
      return;
    }
    if (!categoryId && transactionType !== "transfer") {
      Alert.alert("Error", "Pilih kategori");
      return;
    }
    if (transactionType === "transfer" && !toAccountId) {
      Alert.alert("Error", "Pilih akun tujuan");
      return;
    }
    if (transactionType === "transfer" && accountId === toAccountId) {
      Alert.alert("Error", "Akun sumber dan tujuan tidak boleh sama");
      return;
    }

    try {
      const result = addTransaction({
        type: transactionType,
        amount: amountNum,
        accountId,
        toAccountId: transactionType === "transfer" ? toAccountId : undefined,
        categoryId: transactionType !== "transfer" ? categoryId : undefined,
        note: note.trim() || description.trim() || undefined,
      });

      console.log("Transaction saved:", result);

      // Navigate back immediately (Alert.alert doesn't work well on web)
      router.back();
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", "Gagal menyimpan transaksi");
    }
  };

  const typeTabs: { key: TransactionType; label: string }[] = [
    { key: "income", label: "Pendapatan" },
    { key: "expense", label: "Pengeluaran" },
    { key: "transfer", label: "Transfer" },
  ];

  const numberButtons = [
    ["1", "2", "3", "delete"],
    ["4", "5", "6", "-"],
    ["7", "8", "9", "calendar"],
    ["0", ",", "done"],
  ];

  const renderNumberButton = (key: string) => {
    if (key === "delete") {
      return (
        <TouchableOpacity
          key={key}
          style={[styles.numButton, { backgroundColor: colors.card }]}
          onPress={handleDelete}
        >
          <Delete size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }
    if (key === "calendar") {
      return (
        <TouchableOpacity
          key={key}
          style={[styles.numButton, { backgroundColor: colors.card }]}
        >
          <Calendar size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }
    if (key === "done") {
      return (
        <TouchableOpacity
          key={key}
          style={[
            styles.numButton,
            styles.doneButton,
            { backgroundColor: typeColor },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.doneText}>Selesai</Text>
        </TouchableOpacity>
      );
    }
    if (key === "-") {
      return (
        <TouchableOpacity
          key={key}
          style={[styles.numButton, { backgroundColor: colors.card }]}
          onPress={() => handleNumberPress("-")}
        >
          <Text style={[styles.numButtonText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        key={key}
        style={[styles.numButton, { backgroundColor: colors.card }]}
        onPress={() => handleNumberPress(key)}
      >
        <Text style={[styles.numButtonText, { color: colors.text }]}>
          {key}
        </Text>
      </TouchableOpacity>
    );
  };

  // Category Modal
  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Pilih Kategori
            </Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor:
                      categoryId === item.id ? typeColor + "30" : colors.card,
                    borderColor:
                      categoryId === item.id ? typeColor : colors.border,
                  },
                ]}
                onPress={() => {
                  setCategoryId(item.id);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text
                  style={[styles.categoryName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Account Modal
  const renderAccountModal = () => (
    <Modal
      visible={showAccountModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAccountModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Pilih Akun
            </Text>
            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.accountItem,
                  {
                    backgroundColor:
                      accountId === item.id ? typeColor + "30" : colors.card,
                    borderColor:
                      accountId === item.id ? typeColor : colors.border,
                  },
                ]}
                onPress={() => {
                  setAccountId(item.id);
                  setShowAccountModal(false);
                }}
              >
                <Text style={styles.accountIcon}>{item.icon}</Text>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.accountType,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.type}
                  </Text>
                </View>
                {accountId === item.id && (
                  <View
                    style={[styles.checkmark, { backgroundColor: typeColor }]}
                  >
                    <Text style={{ color: "#fff" }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // To Account Modal (for transfers)
  const renderToAccountModal = () => (
    <Modal
      visible={showToAccountModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowToAccountModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Pilih Akun Tujuan
            </Text>
            <TouchableOpacity onPress={() => setShowToAccountModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={accounts.filter((a) => a.id !== accountId)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.accountItem,
                  {
                    backgroundColor:
                      toAccountId === item.id ? typeColor + "30" : colors.card,
                    borderColor:
                      toAccountId === item.id ? typeColor : colors.border,
                  },
                ]}
                onPress={() => {
                  setToAccountId(item.id);
                  setShowToAccountModal(false);
                }}
              >
                <Text style={styles.accountIcon}>{item.icon}</Text>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.accountType,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.type}
                  </Text>
                </View>
                {toAccountId === item.id && (
                  <View
                    style={[styles.checkmark, { backgroundColor: typeColor }]}
                  >
                    <Text style={{ color: "#fff" }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {renderCategoryModal()}
      {renderAccountModal()}
      {renderToAccountModal()}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {transactionType === "income"
            ? "Pendapatan"
            : transactionType === "expense"
            ? "Pengeluaran"
            : "Transfer"}
        </Text>
        <TouchableOpacity>
          <Star size={24} color={colors.text} />
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
                  transactionType === tab.key
                    ? tab.key === "income"
                      ? colors.income
                      : tab.key === "expense"
                      ? colors.expense
                      : "#2196F3"
                    : "transparent",
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
        {/* Date Row */}
        <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Tanggal
          </Text>
          <View style={styles.formValue}>
            <Text style={[styles.formValueText, { color: colors.text }]}>
              {formattedDate}
            </Text>
            <Text
              style={[
                styles.formValueText,
                { color: colors.text, marginLeft: 16 },
              ]}
            >
              {formattedTime}
            </Text>
          </View>
          <TouchableOpacity style={styles.recurringButton}>
            <RefreshCw size={16} color={colors.textSecondary} />
            <Text
              style={[styles.recurringText, { color: colors.textSecondary }]}
            >
              Berulang/cicil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Row */}
        <TouchableOpacity
          style={[styles.formRow, { borderBottomColor: typeColor }]}
          onPress={() => setShowNumberPad(true)}
        >
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
          <Text style={[styles.amountText, { color: typeColor }]}>
            {formatDisplayAmount(amount)}
          </Text>
        </TouchableOpacity>

        {/* Category Row - Only show for income/expense */}
        {transactionType !== "transfer" && (
          <TouchableOpacity
            style={[styles.formRow, { borderBottomColor: colors.border }]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
              Kategori
            </Text>
            <View style={styles.formValue}>
              {selectedCategory ? (
                <>
                  <Text style={{ marginRight: 8 }}>
                    {selectedCategory.icon}
                  </Text>
                  <Text style={[styles.formValueText, { color: colors.text }]}>
                    {selectedCategory.name}
                  </Text>
                </>
              ) : (
                <Text
                  style={[
                    styles.formValueText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Pilih kategori
                </Text>
              )}
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Account Row */}
        <TouchableOpacity
          style={[styles.formRow, { borderBottomColor: colors.border }]}
          onPress={() => setShowAccountModal(true)}
        >
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            {transactionType === "transfer" ? "Dari" : "Aset"}
          </Text>
          <View style={styles.formValue}>
            {selectedAccount ? (
              <>
                <Text style={{ marginRight: 8 }}>{selectedAccount.icon}</Text>
                <Text style={[styles.formValueText, { color: colors.text }]}>
                  {selectedAccount.name}
                </Text>
              </>
            ) : (
              <Text
                style={[styles.formValueText, { color: colors.textSecondary }]}
              >
                Pilih akun
              </Text>
            )}
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* To Account Row - Only show for transfer */}
        {transactionType === "transfer" && (
          <TouchableOpacity
            style={[styles.formRow, { borderBottomColor: colors.border }]}
            onPress={() => setShowToAccountModal(true)}
          >
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
              Ke
            </Text>
            <View style={styles.formValue}>
              {selectedToAccount ? (
                <>
                  <Text style={{ marginRight: 8 }}>
                    {selectedToAccount.icon}
                  </Text>
                  <Text style={[styles.formValueText, { color: colors.text }]}>
                    {selectedToAccount.name}
                  </Text>
                </>
              ) : (
                <Text
                  style={[
                    styles.formValueText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Pilih akun tujuan
                </Text>
              )}
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Note Row */}
        <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Catatan
          </Text>
          <TextInput
            style={[styles.noteInput, { color: colors.text }]}
            placeholder="Tambahkan catatan..."
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            onFocus={() => setShowNumberPad(false)}
          />
        </View>

        {/* Description Row */}
        <View style={[styles.descriptionRow, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.descriptionInput, { color: colors.text }]}
            placeholder="Deskripsi"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            onFocus={() => setShowNumberPad(false)}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: typeColor }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Menyimpan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.card }]}
            onPress={() => {
              handleSave();
              // Reset form for next entry
              setAmount("");
              setNote("");
              setDescription("");
            }}
          >
            <Text style={[styles.continueButtonText, { color: colors.text }]}>
              Lanjut
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Number Pad */}
      {showNumberPad && (
        <View
          style={[styles.numberPad, { backgroundColor: colors.background }]}
        >
          <View
            style={[styles.numPadHeader, { borderTopColor: colors.border }]}
          >
            <Text style={[styles.numPadLabel, { color: colors.text }]}>
              Total
            </Text>
            <View style={styles.numPadIcons}>
              <TouchableOpacity style={styles.numPadIcon}>
                <Globe size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.numPadIcon}
                onPress={() => setShowNumberPad(false)}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.numPadGrid}>
            {numberButtons.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.numPadRow}>
                {row.map((key) => renderNumberButton(key))}
              </View>
            ))}
          </View>
        </View>
      )}
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
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  typeTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  typeTabText: { fontSize: 14, fontWeight: "500" },
  content: { flex: 1 },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  formLabel: { width: 70, fontSize: 14 },
  formValue: { flex: 1, flexDirection: "row", alignItems: "center" },
  formValueText: { fontSize: 14 },
  amountText: { flex: 1, fontSize: 18, fontWeight: "600" },
  noteInput: { flex: 1, fontSize: 14, padding: 0 },
  recurringButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  recurringText: { fontSize: 11, marginLeft: 4 },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  descriptionInput: { flex: 1, fontSize: 14 },
  cameraButton: { marginLeft: 12 },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  continueButtonText: { fontSize: 16, fontWeight: "500" },
  numberPad: { paddingBottom: 8 },
  numPadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  numPadLabel: { fontSize: 14, fontWeight: "500" },
  numPadIcons: { flexDirection: "row" },
  numPadIcon: { padding: 8, marginLeft: 8 },
  numPadGrid: { paddingHorizontal: 8 },
  numPadRow: { flexDirection: "row", marginBottom: 4 },
  numButton: {
    flex: 1,
    height: 56,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  numButtonText: { fontSize: 24, fontWeight: "500" },
  doneButton: { flex: 2 },
  doneText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  categoryItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    margin: 4,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
    maxWidth: "31%",
  },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryName: { fontSize: 12, textAlign: "center" },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  accountIcon: { fontSize: 28, marginRight: 12 },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 16, fontWeight: "500" },
  accountType: { fontSize: 12, marginTop: 2 },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
