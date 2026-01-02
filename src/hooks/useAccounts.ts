import { useState, useEffect, useCallback, useMemo } from "react";
import { Account, CreateAccountDTO } from "@/types";
import {
  getAccounts,
  getAccountById,
  saveAccount,
  updateAccount,
  deleteAccount,
  getTransactions,
} from "@/services/storage/mmkv";
import {
  calculateAccountBalance,
  calculateAllBalances,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
} from "@/services/finance/calculations";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(() => {
    setIsLoading(true);
    const data = getAccounts();
    setAccounts(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const transactions = useMemo(() => getTransactions(), [accounts]);

  const addAccount = useCallback((data: CreateAccountDTO) => {
    const newAccount = saveAccount(data);
    setAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  }, []);

  const editAccount = useCallback((id: string, updates: Partial<Account>) => {
    const updated = updateAccount(id, updates);
    if (updated) {
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? updated : acc)));
    }
    return updated;
  }, []);

  const removeAccount = useCallback((id: string) => {
    const success = deleteAccount(id);
    if (success) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    }
    return success;
  }, []);

  const getBalance = useCallback(
    (accountId: string) => {
      return calculateAccountBalance(accountId, transactions);
    },
    [transactions]
  );

  const balances = useMemo(
    () => calculateAllBalances(accounts, transactions),
    [accounts, transactions]
  );

  const totalAssets = useMemo(
    () => calculateTotalAssets(accounts, transactions),
    [accounts, transactions]
  );

  const totalLiabilities = useMemo(
    () => calculateTotalLiabilities(accounts, transactions),
    [accounts, transactions]
  );

  const netWorth = useMemo(
    () => calculateNetWorth(accounts, transactions),
    [accounts, transactions]
  );

  const assetAccounts = useMemo(
    () => accounts.filter((acc) => !acc.isLiability),
    [accounts]
  );

  const liabilityAccounts = useMemo(
    () => accounts.filter((acc) => acc.isLiability),
    [accounts]
  );

  const refresh = useCallback(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    isLoading,
    addAccount,
    updateAccount: editAccount,
    deleteAccount: removeAccount,
    getBalance,
    balances,
    totalAssets,
    totalLiabilities,
    netWorth,
    assetAccounts,
    liabilityAccounts,
    getAccountById: (id: string) => accounts.find((a) => a.id === id),
    refresh,
  };
}
