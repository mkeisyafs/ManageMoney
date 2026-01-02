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
import { saveCategory } from "@/services/storage/mmkv";
import { ICON_OPTIONS, COLOR_OPTIONS } from "@/constants/defaults";
import { TransactionType } from "@/types";

export default function NewCategoryScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  const handleSave = () => {
    if (!name.trim()) return Alert.alert("Error", "Masukkan nama kategori");

    saveCategory({ name: name.trim(), type, icon, color });
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: colors.text }}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Kategori Baru
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            Simpan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Nama</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Nama kategori"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Tipe</Text>
          <View style={styles.typeRow}>
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      type === t ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setType(t)}
              >
                <Text style={{ color: type === t ? "#fff" : colors.text }}>
                  {t === "expense" ? "📤 Pengeluaran" : "📥 Pemasukan"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
          <View style={styles.iconsGrid}>
            {ICON_OPTIONS.slice(0, 20).map((i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.iconButton,
                  {
                    backgroundColor:
                      icon === i ? colors.primary + "20" : colors.background,
                    borderColor: icon === i ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIcon(i)}
              >
                <Text style={styles.iconText}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Warna</Text>
          <View style={styles.colorsGrid}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorButton,
                  {
                    backgroundColor: c,
                    borderWidth: color === c ? 3 : 0,
                    borderColor: colors.text,
                  },
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
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
  title: { fontSize: 18, fontWeight: "600" },
  content: { flex: 1 },
  section: { margin: 16, marginTop: 0, padding: 16, borderRadius: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  input: { padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  typeRow: { flexDirection: "row" },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  iconsGrid: { flexDirection: "row", flexWrap: "wrap" },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconText: { fontSize: 24 },
  colorsGrid: { flexDirection: "row", flexWrap: "wrap" },
  colorButton: { width: 40, height: 40, borderRadius: 20 },
});
