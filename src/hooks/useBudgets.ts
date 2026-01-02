import { useState, useEffect, useCallback, useMemo } from "react";
import { Budget, BudgetProgress, CreateBudgetDTO } from "@/types";
import {
  getBudgets,
  saveBudget,
  updateBudget,
  deleteBudget,
  getCategories,
  getTransactions,
} from "@/services/storage/mmkv";
import { getAllBudgetProgress } from "@/services/finance/calculations";

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudgets = useCallback(() => {
    setIsLoading(true);
    const data = getBudgets();
    setBudgets(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const addBudget = useCallback((data: CreateBudgetDTO) => {
    const newBudget = saveBudget(data);
    setBudgets((prev) => {
      // Replace if exists for same category
      const exists = prev.find((b) => b.categoryId === data.categoryId);
      if (exists) {
        return prev.map((b) =>
          b.categoryId === data.categoryId ? newBudget : b
        );
      }
      return [...prev, newBudget];
    });
    return newBudget;
  }, []);

  const editBudget = useCallback((id: string, updates: Partial<Budget>) => {
    const updated = updateBudget(id, updates);
    if (updated) {
      setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
    }
    return updated;
  }, []);

  const removeBudget = useCallback((id: string) => {
    const success = deleteBudget(id);
    if (success) {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
    return success;
  }, []);

  const budgetProgress = useMemo(() => {
    const categories = getCategories();
    const transactions = getTransactions();
    return getAllBudgetProgress(budgets, categories, transactions);
  }, [budgets]);

  const overBudgetCategories = useMemo(
    () => budgetProgress.filter((p) => p.isOverBudget),
    [budgetProgress]
  );

  const nearLimitCategories = useMemo(
    () => budgetProgress.filter((p) => p.isNearLimit),
    [budgetProgress]
  );

  const getBudgetForCategory = useCallback(
    (categoryId: string) => budgets.find((b) => b.categoryId === categoryId),
    [budgets]
  );

  const getProgressForCategory = useCallback(
    (categoryId: string) =>
      budgetProgress.find((p) => p.category.id === categoryId),
    [budgetProgress]
  );

  const refresh = useCallback(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgets,
    isLoading,
    addBudget,
    updateBudget: editBudget,
    deleteBudget: removeBudget,
    budgetProgress,
    overBudgetCategories,
    nearLimitCategories,
    getBudgetForCategory,
    getProgressForCategory,
    refresh,
  };
}
