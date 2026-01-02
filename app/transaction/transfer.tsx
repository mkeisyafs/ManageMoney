import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccounts } from "@/hooks/useAccounts";
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

export default function TransferScreen() {
  const { colors } = useTheme();
  const { accounts } = useAccounts();
  const [transactionType, setTransactionType] =
    useState<TransactionType>("transfer");
  const [amount, setAmount] = useState("");
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(
    accounts[1]?.id || accounts[0]?.id || ""
  );
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [showNumberPad, setShowNumberPad] = useState(true);

  const currentDate = new Date();
  const formattedDate = format(currentDate, "dd/MM/yy (EEE)", {
    locale: idLocale,
  });
  const formattedTime = format(currentDate, "HH.mm");

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

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
    if (!fromAccountId || !toAccountId) {
      Alert.alert("Error", "Pilih akun sumber dan tujuan");
      return;
    }
    if (fromAccountId === toAccountId) {
      Alert.alert("Error", "Akun sumber dan tujuan tidak boleh sama");
      return;
    }

    saveTransaction({
      type: "transfer",
      amount: amountNum,
      accountId: fromAccountId,
      toAccountId,
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
            { backgroundColor: colors.primary },
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
          Transfer
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
                  transactionType === tab.key ? colors.primary : "transparent",
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              if (tab.key === "income") {
                router.replace("/transaction/income");
              } else if (tab.key === "expense") {
                router.replace("/transaction/expense");
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
        <View style={[styles.formRow, { borderBottomColor: colors.primary }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
          <Text style={[styles.amountText, { color: colors.primary }]}>
            {formatDisplayAmount(amount) || "0"}
          </Text>
        </View>

        {/* From Account Row */}
        <TouchableOpacity
          style={[styles.formRow, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Dari
          </Text>
          <View style={styles.formValue}>
            {fromAccount && (
              <>
                <Text style={styles.categoryIcon}>{fromAccount.icon}</Text>
                <Text style={[styles.formValueText, { color: colors.text }]}>
                  {fromAccount.name}
                </Text>
              </>
            )}
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* To Account Row */}
        <TouchableOpacity
          style={[styles.formRow, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
            Ke
          </Text>
          <View style={styles.formValue}>
            {toAccount && (
              <>
                <Text style={styles.categoryIcon}>{toAccount.icon}</Text>
                <Text style={[styles.formValueText, { color: colors.text }]}>
                  {toAccount.name}
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
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
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
