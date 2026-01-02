import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { saveTransaction } from "@/services/storage/mmkv";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ChevronLeft,
  Star,
  RefreshCw,
  Camera,
  ChevronRight,
  Delete,
  Globe,
  X,
  Calendar,
} from "lucide-react-native";

type TransactionType = "income" | "expense" | "transfer";

export default function ExpenseScreen() {
  const { colors } = useTheme();
  const { accounts } = useAccounts();
  const { expenseCategories, incomeCategories } = useCategories();
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "");
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [showNumberPad, setShowNumberPad] = useState(true);

  const currentDate = new Date();
  const formattedDate = format(currentDate, "dd/MM/yy (EEE)", {
    locale: idLocale,
  });
  const formattedTime = format(currentDate, "HH.mm");

  const categories =
    transactionType === "income" ? incomeCategories : expenseCategories;
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleNumberPress = (num: string) => {
    if (num === ",") {
      if (!amount.includes(",")) {
        setAmount((prev) => prev + num);
      }
    } else if (num === "-") {
      // Handle minus/calculator
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const formatDisplayAmount = (text: string) => {
    const numbers = text.replace(/[^0-9,]/g, "");
    const parts = numbers.split(",");
    const integerPart = parts[0]
      ? parseInt(parts[0]).toLocaleString("id-ID")
      : "";
    if (parts.length > 1) {
      return integerPart + "," + parts[1].slice(0, 2);
    }
    return integerPart;
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

    saveTransaction({
      type: transactionType,
      amount: amountNum,
      accountId,
      categoryId: transactionType !== "transfer" ? categoryId : undefined,
      note: note.trim() || undefined,
    });

    router.back();
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
            { backgroundColor: colors.expense },
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Pengeluaran
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
                  transactionType === tab.key ? colors.expense : "transparent",
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
                {
                  color: transactionType === tab.key ? "#fff" : colors.text,
                },
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
        <View style={[styles.formRow, { borderBottomColor: colors.expense }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
          <Text style={[styles.amountText, { color: colors.expense }]}>
            {formatDisplayAmount(amount) || "0"}
          </Text>
        </View>

        {/* Category Row */}
        <TouchableOpacity
          style={[styles.formRow, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Kategori
          </Text>
          <View style={styles.formValue}>
            {selectedCategory && (
              <>
                <Text style={styles.categoryIcon}>{selectedCategory.icon}</Text>
                <Text style={[styles.formValueText, { color: colors.text }]}>
                  {selectedCategory.name}
                </Text>
              </>
            )}
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Account Row */}
        <TouchableOpacity
          style={[styles.formRow, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Aset
          </Text>
          <View style={styles.formValue}>
            {selectedAccount && (
              <>
                <Text style={styles.categoryIcon}>{selectedAccount.icon}</Text>
                <Text style={[styles.formValueText, { color: colors.text }]}>
                  {selectedAccount.name}
                </Text>
              </>
            )}
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Note Row */}
        <View style={[styles.formRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Catatan
          </Text>
          <TextInput
            style={[styles.noteInput, { color: colors.text }]}
            placeholder=""
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
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
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.expense }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Menyimpan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.card }]}
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
  categoryIcon: { fontSize: 16, marginRight: 8 },
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
});
