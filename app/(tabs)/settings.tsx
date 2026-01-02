import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { clearAllData } from "@/services/storage/mmkv";
import {
  exportAndShareJSON,
  exportAndShareCSV,
  importFromFile,
} from "@/services/finance/dataExport";
import { APP_VERSION } from "@/constants/defaults";

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { isPinEnabled, isBiometricAvailable } = useAuth();

  const handleExportJSON = async () => {
    try {
      await exportAndShareJSON();
    } catch (error) {
      Alert.alert("Error", "Gagal mengekspor data");
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportAndShareCSV();
    } catch (error) {
      Alert.alert("Error", "Gagal mengekspor data");
    }
  };

  const handleImport = async () => {
    Alert.alert("Import Data", "Pilih mode import:", [
      {
        text: "Gabung (Merge)",
        onPress: async () => {
          try {
            const result = await importFromFile("merge");
            if (result.success) {
              Alert.alert("Sukses", `Data berhasil diimpor`);
            }
          } catch (error) {
            Alert.alert("Error", "Gagal mengimpor data");
          }
        },
      },
      {
        text: "Ganti Semua (Replace)",
        onPress: async () => {
          try {
            const result = await importFromFile("replace");
            if (result.success) {
              Alert.alert("Sukses", "Data berhasil diganti");
            }
          } catch (error) {
            Alert.alert("Error", "Gagal mengimpor data");
          }
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      "⚠️ Hapus Semua Data?",
      "Semua akun, transaksi, dan pengaturan akan dihapus. Tidak bisa dibatalkan!",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Semua",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Sukses", "Semua data telah dihapus");
            router.replace("/(auth)/onboarding");
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            { color: danger ? colors.expense : colors.text },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Pengaturan</Text>
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader title="TAMPILAN" />
          <SettingItem
            icon="🌙"
            title="Mode Gelap"
            subtitle={isDark ? "Aktif" : "Nonaktif"}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            }
          />
        </View>

        {/* Security */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader title="KEAMANAN" />
          <SettingItem
            icon="🔐"
            title="PIN Lock"
            subtitle={isPinEnabled ? "Aktif" : "Tidak aktif"}
            onPress={() => {}}
          />
          <SettingItem
            icon="👆"
            title="Biometrik"
            subtitle={isBiometricAvailable ? "Tersedia" : "Tidak tersedia"}
            onPress={() => {}}
          />
        </View>

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader title="KELOLA DATA" />
          <SettingItem
            icon="📤"
            title="Ekspor JSON"
            subtitle="Backup semua data"
            onPress={handleExportJSON}
          />
          <SettingItem
            icon="📊"
            title="Ekspor CSV"
            subtitle="Untuk spreadsheet"
            onPress={handleExportCSV}
          />
          <SettingItem
            icon="📥"
            title="Impor Data"
            subtitle="Dari file JSON"
            onPress={handleImport}
          />
          <SettingItem
            icon="🗑️"
            title="Hapus Semua Data"
            subtitle="Reset aplikasi"
            onPress={handleClearData}
            danger
          />
        </View>

        {/* Manage */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionHeader title="KELOLA" />
          <SettingItem
            icon="🏷️"
            title="Kategori"
            subtitle="Kelola kategori pengeluaran & pemasukan"
            onPress={() => router.push("/category")}
          />
          <SettingItem
            icon="💰"
            title="Anggaran"
            subtitle="Atur batas pengeluaran per kategori"
            onPress={() => router.push("/budget")}
          />
          <SettingItem
            icon="🔄"
            title="Transaksi Berulang"
            subtitle="Kelola pembayaran otomatis"
            onPress={() => router.push("/recurring")}
          />
        </View>

        {/* About */}
        <View
          style={[
            styles.section,
            styles.lastSection,
            { backgroundColor: colors.card },
          ]}
        >
          <SectionHeader title="TENTANG" />
          <SettingItem
            icon="ℹ️"
            title="Versi Aplikasi"
            subtitle={APP_VERSION}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
});
