import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
  Platform,
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
import {
  Moon,
  Lock,
  Fingerprint,
  Download,
  Upload,
  Trash2,
  Tag,
  PiggyBank,
  RefreshCw,
  Info,
  ChevronRight,
  FileDown,
} from "lucide-react-native";

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
    if (Platform.OS === "web") {
      // Web: use window.confirm
      const mode = window.confirm(
        "Pilih mode import:\n\nOK = Gabung (Merge)\nCancel = Ganti Semua (Replace)\n\nAtau tutup dialog ini untuk batal."
      );

      const selectedMode = mode ? "merge" : "replace";
      const confirmReplace = mode
        ? true
        : window.confirm("PERHATIAN: Semua data akan diganti. Lanjutkan?");

      if (!confirmReplace && !mode) return;

      try {
        const result = await importFromFile(selectedMode);
        if (result.success) {
          window.alert(`Sukses! ${result.imported} item berhasil diimpor.`);
        } else {
          window.alert(`Error: ${result.errors.join(", ")}`);
        }
      } catch (error) {
        window.alert("Gagal mengimpor data");
      }
    } else {
      // Native: use Alert.alert
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
    }
  };

  const handleClearData = async () => {
    if (Platform.OS === "web") {
      // Web: use window.confirm
      const confirmed = window.confirm(
        "⚠️ HAPUS SEMUA DATA?\n\nSemua akun, transaksi, dan pengaturan akan dihapus.\nTindakan ini TIDAK BISA dibatalkan!\n\nKlik OK untuk menghapus."
      );

      if (confirmed) {
        await clearAllData();
        window.alert("Sukses! Semua data telah dihapus.");
        window.location.reload();
      }
    } else {
      // Native: use Alert.alert
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
            },
          },
        ]
      );
    }
  };

  const handlePinLock = () => {
    if (isPinEnabled) {
      Alert.alert(
        "PIN Lock Aktif",
        "PIN Lock saat ini aktif. Fitur ini mengamankan aplikasi dengan PIN 6 digit.",
        [
          { text: "OK" },
          {
            text: "Nonaktifkan",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Info",
                "Fitur menonaktifkan PIN akan tersedia di versi berikutnya"
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Aktifkan PIN Lock?",
        "PIN Lock akan mengamankan aplikasi dengan PIN 6 digit setiap kali dibuka.",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Aktifkan",
            onPress: () => {
              Alert.alert(
                "Info",
                "Fitur PIN Lock akan tersedia di versi berikutnya"
              );
            },
          },
        ]
      );
    }
  };

  const handleBiometric = () => {
    if (isBiometricAvailable) {
      Alert.alert(
        "Biometrik",
        "Gunakan sidik jari atau Face ID untuk membuka aplikasi dengan cepat.",
        [
          { text: "OK" },
          {
            text: settings.biometricEnabled ? "Nonaktifkan" : "Aktifkan",
            onPress: () => {
              Alert.alert(
                "Info",
                "Fitur biometrik akan tersedia di versi berikutnya"
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Biometrik Tidak Tersedia",
        "Perangkat ini tidak mendukung autentikasi biometrik atau belum dikonfigurasi."
      );
    }
  };

  const SettingItem = ({
    Icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger,
  }: {
    Icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View
        style={[
          styles.settingIconBg,
          { backgroundColor: danger ? colors.expense + "20" : colors.card },
        ]}
      >
        <Icon
          size={20}
          color={danger ? colors.expense : colors.textSecondary}
        />
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
          <Text
            style={[styles.settingSubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement ||
        (onPress && <ChevronRight size={20} color={colors.textSecondary} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Lainnya
        </Text>
      </View>

      <ScrollView style={styles.list}>
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          TAMPILAN
        </Text>
        <SettingItem
          Icon={Moon}
          title="Mode Gelap"
          subtitle={isDark ? "Aktif" : "Nonaktif"}
          onPress={toggleTheme}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />

        {/* Security Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          KEAMANAN
        </Text>
        <SettingItem
          Icon={Lock}
          title="PIN Lock"
          subtitle={isPinEnabled ? "Aktif" : "Tidak aktif"}
          onPress={handlePinLock}
        />
        <SettingItem
          Icon={Fingerprint}
          title="Biometrik"
          subtitle={isBiometricAvailable ? "Tersedia" : "Tidak tersedia"}
          onPress={handleBiometric}
        />

        {/* Manage Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          KELOLA
        </Text>
        <SettingItem
          Icon={Tag}
          title="Kategori"
          subtitle="Kelola kategori transaksi"
          onPress={() => router.push("/category")}
        />
        <SettingItem
          Icon={PiggyBank}
          title="Anggaran"
          subtitle="Atur batas pengeluaran"
          onPress={() => router.push("/budget")}
        />
        <SettingItem
          Icon={RefreshCw}
          title="Transaksi Berulang"
          subtitle="Kelola pembayaran otomatis"
          onPress={() => router.push("/recurring")}
        />

        {/* Data Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          DATA
        </Text>
        <SettingItem
          Icon={Download}
          title="Ekspor JSON"
          subtitle="Backup semua data"
          onPress={handleExportJSON}
        />
        <SettingItem
          Icon={FileDown}
          title="Ekspor CSV"
          subtitle="Untuk spreadsheet"
          onPress={handleExportCSV}
        />
        <SettingItem
          Icon={Upload}
          title="Impor Data"
          subtitle="Dari file JSON"
          onPress={handleImport}
        />
        <SettingItem
          Icon={Trash2}
          title="Hapus Semua Data"
          subtitle="Reset aplikasi"
          onPress={handleClearData}
          danger
        />

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          TENTANG
        </Text>
        <SettingItem
          Icon={Info}
          title="Versi Aplikasi"
          subtitle={APP_VERSION}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  list: { flex: 1 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: "500" },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  bottomPadding: { height: 24 },
});
