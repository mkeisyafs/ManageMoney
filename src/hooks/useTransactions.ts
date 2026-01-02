import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Transaction,
  TransactionFilters,
  CreateTransactionDTO,
  GroupedTransactions,
} from "@/types";
import {
  getTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/services/storage/mmkv";
import {
  getTodaySummary,
  getMonthSummary,
  getTransactionsInRange,
  groupTransactionsByDate,
} from "@/services/finance/calculations";
import { parseISO, startOfMonth, endOfMonth } from "date-fns";

export function useTransactions(initialFilters?: TransactionFilters) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(
    initialFilters ?? {}
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(() => {
    setIsLoading(true);
    const data = getTransactions();
    setAllTransactions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Apply filters
  const transactions = useMemo(() => {
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
    const newTransaction = saveTransaction(data);
    setAllTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const editTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      const updated = updateTransaction(id, updates);
      if (updated) {
        setAllTransactions((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
      return updated;
    },
    []
  );

  const removeTransaction = useCallback((id: string) => {
    const success = deleteTransaction(id);
    if (success) {
      setAllTransactions((prev) => prev.filter((t) => t.id !== id));
    }
    return success;
  }, []);

  // Filter setters
  const setDateRange = useCallback((start: Date, end: Date) => {
    setFilters((prev) => ({
      ...prev,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }));
  }, []);

  const setAccountFilter = useCallback((accountId: string | null) => {
    setFilters((prev) => ({
      ...prev,
      accountId: accountId ?? undefined,
    }));
  }, []);

  const setCategoryFilter = useCallback((categoryId: string | null) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId ?? undefined,
    }));
  }, []);

  const setTypeFilter = useCallback((type: Transaction["type"] | null) => {
    setFilters((prev) => ({
      ...prev,
      type: type ?? undefined,
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query || undefined,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Computed values
  const todaySummary = useMemo(
    () => getTodaySummary(allTransactions),
    [allTransactions]
  );

  const monthSummary = useMemo(
    () => getMonthSummary(allTransactions),
    [allTransactions]
  );

  const groupedByDate = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const refresh = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    allTransactions,
    isLoading,
    filters,
    addTransaction,
    updateTransaction: editTransaction,
    deleteTransaction: removeTransaction,
    setDateRange,
    setAccountFilter,
    setCategoryFilter,
    setTypeFilter,
    setSearchQuery,
    clearFilters,
    todaySummary,
    monthSummary,
    groupedByDate,
    recentTransactions,
    refresh,
  };
}
