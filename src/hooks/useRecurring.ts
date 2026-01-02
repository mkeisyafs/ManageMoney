import { useState, useEffect, useCallback } from "react";
import {
  RecurringTransaction,
  CreateRecurringTransactionDTO,
  Transaction,
} from "@/types";
import {
  getRecurringTransactions,
  saveRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  saveTransaction,
} from "@/services/storage/mmkv";
import {
  processRecurringTransactions,
  getUpcomingOccurrences,
} from "@/services/finance/recurring";

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecurring = useCallback(() => {
    setIsLoading(true);
    const data = getRecurringTransactions();
    setRecurring(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRecurring();
  }, [loadRecurring]);

  const addRecurring = useCallback((data: CreateRecurringTransactionDTO) => {
    const newRecurring = saveRecurringTransaction(data);
    setRecurring((prev) => [...prev, newRecurring]);
    return newRecurring;
  }, []);

  const editRecurring = useCallback(
    (id: string, updates: Partial<RecurringTransaction>) => {
      const updated = updateRecurringTransaction(id, updates);
      if (updated) {
        setRecurring((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
      return updated;
    },
    []
  );

  const removeRecurring = useCallback((id: string) => {
    const success = deleteRecurringTransaction(id);
    if (success) {
      setRecurring((prev) => prev.filter((r) => r.id !== id));
    }
    return success;
  }, []);

  const toggleEnabled = useCallback(
    (id: string) => {
      const item = recurring.find((r) => r.id === id);
      if (item) {
        return editRecurring(id, { isEnabled: !item.isEnabled });
      }
      return null;
    },
    [recurring, editRecurring]
  );

  /**
   * Process all recurring transactions and generate new transactions
   * Returns the number of transactions generated
   */
  const processAll = useCallback((): number => {
    const enabledRecurring = recurring.filter((r) => r.isEnabled);
    const { newTransactions, updatedRecurring } = processRecurringTransactions(
      enabledRecurring,
      new Date()
    );

    // Save new transactions
    newTransactions.forEach((t) => {
      saveTransaction({
        type: t.type,
        amount: t.amount,
        categoryId: t.categoryId,
        accountId: t.accountId,
        toAccountId: t.toAccountId,
        date: t.date,
        note: t.note,
      });
    });

    // Update recurring records with lastProcessed
    updatedRecurring.forEach((r) => {
      updateRecurringTransaction(r.id, {
        lastProcessed: r.lastProcessed,
      });
    });

    // Refresh state
    loadRecurring();

    return newTransactions.length;
  }, [recurring, loadRecurring]);

  const getUpcoming = useCallback(
    (id: string, count: number = 5) => {
      const item = recurring.find((r) => r.id === id);
      if (!item) return [];
      return getUpcomingOccurrences(item, count);
    },
    [recurring]
  );

  const enabledRecurring = recurring.filter((r) => r.isEnabled);
  const disabledRecurring = recurring.filter((r) => !r.isEnabled);

  const refresh = useCallback(() => {
    loadRecurring();
  }, [loadRecurring]);

  return {
    recurring,
    isLoading,
    addRecurring,
    updateRecurring: editRecurring,
    deleteRecurring: removeRecurring,
    toggleEnabled,
    processAll,
    getUpcoming,
    enabledRecurring,
    disabledRecurring,
    refresh,
  };
}
