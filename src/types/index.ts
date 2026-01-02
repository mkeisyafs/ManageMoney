// ==================== ACCOUNT ====================
export type AccountType =
  | "bank"
  | "cash"
  | "ewallet"
  | "crypto"
  | "investment"
  | "credit_card"
  | "loan"
  | "other";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency?: string;
  icon?: string;
  color?: string;
  isLiability: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  currency?: string;
  icon?: string;
  color?: string;
  isLiability?: boolean;
  initialBalance?: number;
}

// ==================== TRANSACTION ====================
export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  note?: string;
  isRecurringGenerated?: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  date?: string;
  note?: string;
}

// ==================== CATEGORY ====================
export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface CreateCategoryDTO {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

// ==================== BUDGET ====================
export type BudgetPeriod = "monthly" | "weekly";

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
}

export interface CreateBudgetDTO {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate?: string;
}

// ==================== RECURRING TRANSACTION ====================
export type RecurringFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly";

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  isEnabled: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionDTO {
  type: TransactionType;
  amount: number;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  note?: string;
}

// ==================== APP SETTINGS ====================
export type ThemeMode = "light" | "dark" | "system";
export type Language = "en" | "id";

export interface AppSettings {
  theme: ThemeMode;
  currency: string;
  language: Language;
  pinEnabled: boolean;
  pinHash?: string;
  biometricEnabled: boolean;
  onboardingCompleted: boolean;
  lastOpenedAt?: string;
}

// ==================== EXPORT/IMPORT ====================
export interface ExportData {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  settings: AppSettings;
  exportedAt: string;
  version: string;
  appName: string;
}

// ==================== CALCULATED TYPES ====================
export interface BudgetProgress {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
}

export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface TrendDataPoint {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

// ==================== FILTER TYPES ====================
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  searchQuery?: string;
}

// ==================== UTILITY TYPES ====================
export interface GroupedTransactions {
  date: string;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}
