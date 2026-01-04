import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Transaction, TransactionFilters, CreateTransactionDTO } from "@/types";
import {
  getTransactions,
  saveTransaction as saveTransactionToStorage,
  updateTransaction as updateTransactionInStorage,
  deleteTransaction as deleteTransactionFromStorage,
} from "@/services/storage/mmkv";
import {
  getTodaySummary,
  getMonthSummary,
  getTransactionsInRange,
  groupTransactionsByDate,
} from "@/services/finance/calculations";
import { parseISO } from "date-fns";

interface TransactionContextType {
  transactions: Transaction[];
  allTransactions: Transaction[];
  isLoading: boolean;
  filters: TransactionFilters;
  addTransaction: (data: CreateTransactionDTO) => Transaction;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>
  ) => Transaction | null;
  deleteTransaction: (id: string) => boolean;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  refresh: () => void;
  todaySummary: { income: number; expense: number; total: number };
  monthSummary: { income: number; expense: number; total: number };
  groupedByDate: Array<{
    date: string;
    transactions: Transaction[];
    totalIncome: number;
    totalExpense: number;
  }>;
  recentTransactions: Transaction[];
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filters, setFiltersState] = useState<TransactionFilters>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(() => {
    setIsLoading(true);
    const data = getTransactions();
    console.log("Loaded transactions:", data.length);
    setAllTransactions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Apply filters
  const transactions = React.useMemo(() => {
    let filtered = [...allTransactions];

    // Date range filter
    if (filters.startDate && filters.endDate) {
      filtered = getTransactionsInRange(
        filtered,
        parseISO(filters.startDate),
        parseISO(filters.endDate)
      );
    }

    // Account filter
    if (filters.accountId) {
      filtered = filtered.filter(
        (t) =>
          t.accountId === filters.accountId ||
          t.toAccountId === filters.accountId
      );
    }

    // Category filter
    if (filters.categoryId) {
      filtered = filtered.filter((t) => t.categoryId === filters.categoryId);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((t) => t.note?.toLowerCase().includes(query));
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
  }, [allTransactions, filters]);

  const addTransaction = useCallback((data: CreateTransactionDTO) => {
    const newTransaction = saveTransactionToStorage(data);
    console.log("Transaction added:", newTransaction);
    setAllTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      const updated = updateTransactionInStorage(id, updates);
      if (updated) {
        setAllTransactions((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
      return updated;
    },
    []
  );

  const deleteTransactionFn = useCallback((id: string) => {
    const success = deleteTransactionFromStorage(id);
    if (success) {
      setAllTransactions((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  }, []);

  const setFilters = useCallback((newFilters: TransactionFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const refresh = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Computed values
  const todaySummary = React.useMemo(() => {
    const summary = getTodaySummary(allTransactions);
    return { ...summary, total: summary.income - summary.expense };
  }, [allTransactions]);

  const monthSummary = React.useMemo(() => {
    const summary = getMonthSummary(allTransactions);
    return { ...summary, total: summary.income - summary.expense };
  }, [allTransactions]);

  const groupedByDate = React.useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  const recentTransactions = React.useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const value: TransactionContextType = {
    transactions,
    allTransactions,
    isLoading,
    filters,
    addTransaction,
    updateTransaction,
    deleteTransaction: deleteTransactionFn,
    setFilters,
    clearFilters,
    refresh,
    todaySummary,
    monthSummary,
    groupedByDate,
    recentTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
}
