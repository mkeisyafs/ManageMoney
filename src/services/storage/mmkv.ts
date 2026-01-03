import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Account,
  Transaction,
  Category,
  Budget,
  RecurringTransaction,
  AppSettings,
  CreateAccountDTO,
  CreateTransactionDTO,
  CreateCategoryDTO,
  CreateBudgetDTO,
  CreateRecurringTransactionDTO,
} from "@/types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@/constants/defaults";

// Simple UUID generator (no external dependency needed)
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Storage keys
const KEYS = {
  ACCOUNTS: "accounts",
  TRANSACTIONS: "transactions",
  CATEGORIES: "categories",
  BUDGETS: "budgets",
  RECURRING: "recurring_transactions",
  SETTINGS: "settings",
  INITIALIZED: "initialized",
};

// In-memory cache for synchronous access
let cache: {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  settings: AppSettings;
  initialized: boolean;
} = {
  accounts: [],
  transactions: [],
  categories: [],
  budgets: [],
  recurring: [],
  settings: DEFAULT_SETTINGS,
  initialized: false,
};

// ==================== CACHE SYNC ====================
export async function loadCache(): Promise<void> {
  const [
    accounts,
    transactions,
    categories,
    budgets,
    recurring,
    settings,
    initialized,
  ] = await Promise.all([
    AsyncStorage.getItem(KEYS.ACCOUNTS),
    AsyncStorage.getItem(KEYS.TRANSACTIONS),
    AsyncStorage.getItem(KEYS.CATEGORIES),
    AsyncStorage.getItem(KEYS.BUDGETS),
    AsyncStorage.getItem(KEYS.RECURRING),
    AsyncStorage.getItem(KEYS.SETTINGS),
    AsyncStorage.getItem(KEYS.INITIALIZED),
  ]);

  cache = {
    accounts: accounts ? JSON.parse(accounts) : [],
    transactions: transactions ? JSON.parse(transactions) : [],
    categories: categories ? JSON.parse(categories) : [],
    budgets: budgets ? JSON.parse(budgets) : [],
    recurring: recurring ? JSON.parse(recurring) : [],
    settings: settings ? JSON.parse(settings) : DEFAULT_SETTINGS,
    initialized: initialized === "true",
  };
}

async function saveToStorage(key: string, data: any): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

function now(): string {
  return new Date().toISOString();
}

// ==================== INITIALIZATION ====================
export function isInitialized(): boolean {
  return cache.initialized;
}

export async function initializeDefaultData(): Promise<void> {
  if (cache.initialized) return;

  // Initialize default categories
  const categories: Category[] = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
      ...cat,
      id: generateId(),
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((cat) => ({
      ...cat,
      id: generateId(),
    })),
  ];

  // Initialize default accounts
  const defaultAccounts: Account[] = [
    {
      id: generateId(),
      name: "Tunai",
      type: "cash",
      currency: "IDR",
      icon: "💵",
      color: "#4CAF50",
      isLiability: false,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      name: "Bank",
      type: "bank",
      currency: "IDR",
      icon: "🏦",
      color: "#1976D2",
      isLiability: false,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      name: "Kartu",
      type: "credit_card",
      currency: "IDR",
      icon: "💳",
      color: "#F44336",
      isLiability: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  // Set onboardingCompleted to true by default
  const defaultSettings = { ...DEFAULT_SETTINGS, onboardingCompleted: true };

  cache.categories = categories;
  cache.settings = defaultSettings;
  cache.accounts = defaultAccounts;
  cache.transactions = [];
  cache.budgets = [];
  cache.recurring = [];
  cache.initialized = true;

  await Promise.all([
    saveToStorage(KEYS.CATEGORIES, categories),
    saveToStorage(KEYS.SETTINGS, defaultSettings),
    saveToStorage(KEYS.ACCOUNTS, defaultAccounts),
    saveToStorage(KEYS.TRANSACTIONS, []),
    saveToStorage(KEYS.BUDGETS, []),
    saveToStorage(KEYS.RECURRING, []),
    AsyncStorage.setItem(KEYS.INITIALIZED, "true"),
  ]);
}

// ==================== ACCOUNTS ====================
export function getAccounts(): Account[] {
  return cache.accounts;
}

export function getAccountById(id: string): Account | undefined {
  return cache.accounts.find((acc) => acc.id === id);
}

export function saveAccount(data: CreateAccountDTO): Account {
  const newAccount: Account = {
    id: generateId(),
    name: data.name,
    type: data.type,
    currency: data.currency,
    icon: data.icon,
    color: data.color,
    isLiability: data.isLiability ?? false,
    createdAt: now(),
    updatedAt: now(),
  };
  cache.accounts.push(newAccount);
  saveToStorage(KEYS.ACCOUNTS, cache.accounts);

  // If initial balance provided, create initial transaction
  if (data.initialBalance && data.initialBalance !== 0) {
    const adjustmentCategory = cache.categories.find(
      (c) => c.name === "Other Income" || c.name === "Other"
    );

    saveTransaction({
      type: data.initialBalance > 0 ? "income" : "expense",
      amount: Math.abs(data.initialBalance),
      categoryId: adjustmentCategory?.id,
      accountId: newAccount.id,
      note: "Initial balance",
    });
  }

  return newAccount;
}

export function updateAccount(
  id: string,
  updates: Partial<Account>
): Account | null {
  const index = cache.accounts.findIndex((acc) => acc.id === id);
  if (index === -1) return null;

  cache.accounts[index] = {
    ...cache.accounts[index],
    ...updates,
    id,
    updatedAt: now(),
  };
  saveToStorage(KEYS.ACCOUNTS, cache.accounts);
  return cache.accounts[index];
}

export function deleteAccount(id: string): boolean {
  const initialLength = cache.accounts.length;
  cache.accounts = cache.accounts.filter((acc) => acc.id !== id);
  if (cache.accounts.length === initialLength) return false;

  // Also delete related transactions
  cache.transactions = cache.transactions.filter(
    (t) => t.accountId !== id && t.toAccountId !== id
  );

  saveToStorage(KEYS.ACCOUNTS, cache.accounts);
  saveToStorage(KEYS.TRANSACTIONS, cache.transactions);

  return true;
}

// ==================== TRANSACTIONS ====================
export function getTransactions(): Transaction[] {
  return cache.transactions;
}

export function getTransactionById(id: string): Transaction | undefined {
  return cache.transactions.find((t) => t.id === id);
}

export function getTransactionsByAccountId(accountId: string): Transaction[] {
  return cache.transactions.filter(
    (t) => t.accountId === accountId || t.toAccountId === accountId
  );
}

export function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Transaction[] {
  return cache.transactions.filter(
    (t) => t.date >= startDate && t.date <= endDate
  );
}

export function saveTransaction(data: CreateTransactionDTO): Transaction {
  const newTransaction: Transaction = {
    id: generateId(),
    type: data.type,
    amount: data.amount,
    categoryId: data.categoryId,
    accountId: data.accountId,
    toAccountId: data.toAccountId,
    date: data.date ?? now(),
    note: data.note,
    createdAt: now(),
    updatedAt: now(),
  };
  cache.transactions.push(newTransaction);
  saveToStorage(KEYS.TRANSACTIONS, cache.transactions);
  return newTransaction;
}

export function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Transaction | null {
  const index = cache.transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  cache.transactions[index] = {
    ...cache.transactions[index],
    ...updates,
    id,
    updatedAt: now(),
  };
  saveToStorage(KEYS.TRANSACTIONS, cache.transactions);
  return cache.transactions[index];
}

export function deleteTransaction(id: string): boolean {
  const initialLength = cache.transactions.length;
  cache.transactions = cache.transactions.filter((t) => t.id !== id);
  if (cache.transactions.length === initialLength) return false;

  saveToStorage(KEYS.TRANSACTIONS, cache.transactions);
  return true;
}

// ==================== CATEGORIES ====================
export function getCategories(): Category[] {
  return cache.categories;
}

export function getCategoryById(id: string): Category | undefined {
  return cache.categories.find((c) => c.id === id);
}

export function getCategoriesByType(type: "income" | "expense"): Category[] {
  return cache.categories.filter((c) => c.type === type);
}

export function saveCategory(data: CreateCategoryDTO): Category {
  const newCategory: Category = {
    id: generateId(),
    ...data,
    isDefault: false,
  };
  cache.categories.push(newCategory);
  saveToStorage(KEYS.CATEGORIES, cache.categories);
  return newCategory;
}

export function updateCategory(
  id: string,
  updates: Partial<Category>
): Category | null {
  const index = cache.categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  cache.categories[index] = {
    ...cache.categories[index],
    ...updates,
    id,
  };
  saveToStorage(KEYS.CATEGORIES, cache.categories);
  return cache.categories[index];
}

export function deleteCategory(id: string): boolean {
  const category = cache.categories.find((c) => c.id === id);
  if (category?.isDefault) return false;

  const initialLength = cache.categories.length;
  cache.categories = cache.categories.filter((c) => c.id !== id);
  if (cache.categories.length === initialLength) return false;

  saveToStorage(KEYS.CATEGORIES, cache.categories);
  return true;
}

// ==================== BUDGETS ====================
export function getBudgets(): Budget[] {
  return cache.budgets;
}

export function getBudgetById(id: string): Budget | undefined {
  return cache.budgets.find((b) => b.id === id);
}

export function getBudgetByCategoryId(categoryId: string): Budget | undefined {
  return cache.budgets.find((b) => b.categoryId === categoryId);
}

export function saveBudget(data: CreateBudgetDTO): Budget {
  const existing = cache.budgets.find((b) => b.categoryId === data.categoryId);
  if (existing) {
    return updateBudget(existing.id, {
      amount: data.amount,
      period: data.period,
    }) as Budget;
  }

  const newBudget: Budget = {
    id: generateId(),
    categoryId: data.categoryId,
    amount: data.amount,
    period: data.period,
    startDate: data.startDate ?? now(),
  };
  cache.budgets.push(newBudget);
  saveToStorage(KEYS.BUDGETS, cache.budgets);
  return newBudget;
}

export function updateBudget(
  id: string,
  updates: Partial<Budget>
): Budget | null {
  const index = cache.budgets.findIndex((b) => b.id === id);
  if (index === -1) return null;

  cache.budgets[index] = {
    ...cache.budgets[index],
    ...updates,
    id,
  };
  saveToStorage(KEYS.BUDGETS, cache.budgets);
  return cache.budgets[index];
}

export function deleteBudget(id: string): boolean {
  const initialLength = cache.budgets.length;
  cache.budgets = cache.budgets.filter((b) => b.id !== id);
  if (cache.budgets.length === initialLength) return false;

  saveToStorage(KEYS.BUDGETS, cache.budgets);
  return true;
}

// ==================== RECURRING TRANSACTIONS ====================
export function getRecurringTransactions(): RecurringTransaction[] {
  return cache.recurring;
}

export function getRecurringTransactionById(
  id: string
): RecurringTransaction | undefined {
  return cache.recurring.find((r) => r.id === id);
}

export function getEnabledRecurringTransactions(): RecurringTransaction[] {
  return cache.recurring.filter((r) => r.isEnabled);
}

export function saveRecurringTransaction(
  data: CreateRecurringTransactionDTO
): RecurringTransaction {
  const newRecurring: RecurringTransaction = {
    id: generateId(),
    ...data,
    isEnabled: true,
    createdAt: now(),
    updatedAt: now(),
  };
  cache.recurring.push(newRecurring);
  saveToStorage(KEYS.RECURRING, cache.recurring);
  return newRecurring;
}

export function updateRecurringTransaction(
  id: string,
  updates: Partial<RecurringTransaction>
): RecurringTransaction | null {
  const index = cache.recurring.findIndex((r) => r.id === id);
  if (index === -1) return null;

  cache.recurring[index] = {
    ...cache.recurring[index],
    ...updates,
    id,
    updatedAt: now(),
  };
  saveToStorage(KEYS.RECURRING, cache.recurring);
  return cache.recurring[index];
}

export function deleteRecurringTransaction(id: string): boolean {
  const initialLength = cache.recurring.length;
  cache.recurring = cache.recurring.filter((r) => r.id !== id);
  if (cache.recurring.length === initialLength) return false;

  saveToStorage(KEYS.RECURRING, cache.recurring);
  return true;
}

// ==================== SETTINGS ====================
export function getSettings(): AppSettings {
  return cache.settings;
}

export function saveSettings(settings: AppSettings): void {
  cache.settings = settings;
  saveToStorage(KEYS.SETTINGS, settings);
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  cache.settings = { ...cache.settings, ...updates };
  saveToStorage(KEYS.SETTINGS, cache.settings);
  return cache.settings;
}

// ==================== BULK OPERATIONS ====================
export async function clearAllData(): Promise<void> {
  cache = {
    accounts: [],
    transactions: [],
    categories: [],
    budgets: [],
    recurring: [],
    settings: DEFAULT_SETTINGS,
    initialized: false,
  };

  await Promise.all([
    AsyncStorage.removeItem(KEYS.ACCOUNTS),
    AsyncStorage.removeItem(KEYS.TRANSACTIONS),
    AsyncStorage.removeItem(KEYS.CATEGORIES),
    AsyncStorage.removeItem(KEYS.BUDGETS),
    AsyncStorage.removeItem(KEYS.RECURRING),
    AsyncStorage.removeItem(KEYS.SETTINGS),
    AsyncStorage.removeItem(KEYS.INITIALIZED),
  ]);
}

export function getAllData() {
  return {
    accounts: cache.accounts,
    transactions: cache.transactions,
    categories: cache.categories,
    budgets: cache.budgets,
    recurringTransactions: cache.recurring,
    settings: cache.settings,
  };
}

export async function setAllData(data: {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  settings: AppSettings;
}): Promise<void> {
  cache.accounts = data.accounts;
  cache.transactions = data.transactions;
  cache.categories = data.categories;
  cache.budgets = data.budgets;
  cache.recurring = data.recurringTransactions;
  cache.settings = data.settings;
  cache.initialized = true;

  await Promise.all([
    saveToStorage(KEYS.ACCOUNTS, data.accounts),
    saveToStorage(KEYS.TRANSACTIONS, data.transactions),
    saveToStorage(KEYS.CATEGORIES, data.categories),
    saveToStorage(KEYS.BUDGETS, data.budgets),
    saveToStorage(KEYS.RECURRING, data.recurringTransactions),
    saveToStorage(KEYS.SETTINGS, data.settings),
    AsyncStorage.setItem(KEYS.INITIALIZED, "true"),
  ]);
}

// Legacy export for compatibility
export const storage = {
  getString: (key: string) => null,
  set: () => {},
  delete: () => {},
  getBoolean: () => false,
};
