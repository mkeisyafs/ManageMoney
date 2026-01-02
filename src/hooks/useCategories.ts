import { useState, useEffect, useCallback, useMemo } from "react";
import { Category, CreateCategoryDTO } from "@/types";
import {
  getCategories,
  getCategoriesByType,
  saveCategory,
  updateCategory,
  deleteCategory,
} from "@/services/storage/mmkv";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(() => {
    setIsLoading(true);
    const data = getCategories();
    setCategories(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback((data: CreateCategoryDTO) => {
    const newCategory = saveCategory(data);
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const editCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updated = updateCategory(id, updates);
    if (updated) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat))
      );
    }
    return updated;
  }, []);

  const removeCategory = useCallback((id: string) => {
    const success = deleteCategory(id);
    if (success) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
    return success;
  }, []);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories]
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  const refresh = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory: editCategory,
    deleteCategory: removeCategory,
    expenseCategories,
    incomeCategories,
    getCategoryById,
    refresh,
  };
}
