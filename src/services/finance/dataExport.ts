import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { format } from "date-fns";
import { ExportData } from "@/types";
import { APP_NAME, APP_VERSION } from "@/constants/defaults";
import {
  getAllData,
  setAllData,
  getAccounts,
  getTransactions,
  getCategories,
  getBudgets,
  getRecurringTransactions,
  saveTransaction,
  saveAccount,
  saveCategory,
  saveBudget,
  saveRecurringTransaction,
} from "@/services/storage/mmkv";

/**
 * Export all data to JSON format
 */
export function exportToJSON(): ExportData {
  const data = getAllData();
  return {
    ...data,
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    appName: APP_NAME,
  };
}

/**
 * Export transactions to CSV format
 */
export function exportTransactionsToCSV(): string {
  const transactions = getTransactions();
  const accounts = getAccounts();
  const categories = getCategories();

  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    "Date",
    "Type",
    "Amount",
    "Category",
    "Account",
    "To Account",
    "Note",
  ].join(",");

  const rows = transactions.map((t) => {
    return [
      format(new Date(t.date), "yyyy-MM-dd HH:mm:ss"),
      t.type,
      t.amount.toString(),
      t.categoryId ? categoryMap.get(t.categoryId) ?? "" : "",
      accountMap.get(t.accountId) ?? "",
      t.toAccountId ? accountMap.get(t.toAccountId) ?? "" : "",
      `"${(t.note ?? "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Validate export data structure
 */
export function validateExportData(data: unknown): data is ExportData {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  return (
    Array.isArray(obj.accounts) &&
    Array.isArray(obj.transactions) &&
    Array.isArray(obj.categories) &&
    Array.isArray(obj.budgets) &&
    Array.isArray(obj.recurringTransactions) &&
    typeof obj.settings === "object" &&
    typeof obj.version === "string" &&
    typeof obj.appName === "string"
  );
}

/**
 * Import data from JSON
 */
export function importFromJSON(
  data: ExportData,
  mode: "merge" | "replace"
): { success: boolean; imported: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;

  try {
    if (mode === "replace") {
      setAllData({
        accounts: data.accounts,
        transactions: data.transactions,
        categories: data.categories,
        budgets: data.budgets,
        recurringTransactions: data.recurringTransactions,
        settings: data.settings,
      });
      imported =
        data.accounts.length +
        data.transactions.length +
        data.categories.length +
        data.budgets.length +
        data.recurringTransactions.length;
    } else {
      const existingAccounts = new Set(getAccounts().map((a) => a.id));
      const existingTransactions = new Set(getTransactions().map((t) => t.id));
      const existingCategories = new Set(getCategories().map((c) => c.id));
      const existingBudgets = new Set(getBudgets().map((b) => b.id));
      const existingRecurring = new Set(
        getRecurringTransactions().map((r) => r.id)
      );

      for (const account of data.accounts) {
        if (!existingAccounts.has(account.id)) {
          saveAccount({
            name: account.name,
            type: account.type,
            currency: account.currency,
            icon: account.icon,
            color: account.color,
            isLiability: account.isLiability,
          });
          imported++;
        }
      }

      for (const category of data.categories) {
        if (!existingCategories.has(category.id)) {
          saveCategory({
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
          });
          imported++;
        }
      }

      for (const transaction of data.transactions) {
        if (!existingTransactions.has(transaction.id)) {
          saveTransaction({
            type: transaction.type,
            amount: transaction.amount,
            categoryId: transaction.categoryId,
            accountId: transaction.accountId,
            toAccountId: transaction.toAccountId,
            date: transaction.date,
            note: transaction.note,
          });
          imported++;
        }
      }

      for (const budget of data.budgets) {
        if (!existingBudgets.has(budget.id)) {
          saveBudget({
            categoryId: budget.categoryId,
            amount: budget.amount,
            period: budget.period,
            startDate: budget.startDate,
          });
          imported++;
        }
      }

      for (const recurring of data.recurringTransactions) {
        if (!existingRecurring.has(recurring.id)) {
          saveRecurringTransaction({
            type: recurring.type,
            amount: recurring.amount,
            categoryId: recurring.categoryId,
            accountId: recurring.accountId,
            toAccountId: recurring.toAccountId,
            frequency: recurring.frequency,
            startDate: recurring.startDate,
            endDate: recurring.endDate,
            note: recurring.note,
          });
          imported++;
        }
      }
    }

    return { success: true, imported, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unknown error");
    return { success: false, imported, errors };
  }
}

/**
 * Download file in browser (Web)
 */
function downloadFileWeb(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file from input in browser (Web)
 */
function readFileWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}

/**
 * Save file to device and open share sheet (Native)
 */
async function saveToFileNative(
  content: string,
  filename: string,
  mimeType: string
): Promise<void> {
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: `Export ${filename}`,
    });
  }
}

/**
 * Pick and read file from device (Native)
 */
async function pickAndReadFileNative(): Promise<string | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return content;
  } catch (error) {
    console.error("Error picking file:", error);
    return null;
  }
}

/**
 * Export and share JSON data
 */
export async function exportAndShareJSON(): Promise<void> {
  const data = exportToJSON();
  const content = JSON.stringify(data, null, 2);
  const filename = `ManageMoney_backup_${format(
    new Date(),
    "yyyyMMdd_HHmmss"
  )}.json`;

  if (Platform.OS === "web") {
    downloadFileWeb(content, filename, "application/json");
  } else {
    await saveToFileNative(content, filename, "application/json");
  }
}

/**
 * Export and share CSV data
 */
export async function exportAndShareCSV(): Promise<void> {
  const content = exportTransactionsToCSV();
  const filename = `ManageMoney_transactions_${format(
    new Date(),
    "yyyyMMdd_HHmmss"
  )}.csv`;

  if (Platform.OS === "web") {
    downloadFileWeb(content, filename, "text/csv");
  } else {
    await saveToFileNative(content, filename, "text/csv");
  }
}

/**
 * Import data from picked file
 */
export async function importFromFile(
  mode: "merge" | "replace"
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  let content: string | null = null;

  if (Platform.OS === "web") {
    content = await readFileWeb();
  } else {
    content = await pickAndReadFileNative();
  }

  if (!content) {
    return { success: false, imported: 0, errors: ["No file selected"] };
  }

  try {
    const data = JSON.parse(content);

    if (!validateExportData(data)) {
      return { success: false, imported: 0, errors: ["Invalid file format"] };
    }

    return importFromJSON(data, mode);
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [error instanceof Error ? error.message : "Failed to parse file"],
    };
  }
}
