import {
  Account,
  Transaction,
  Category,
  Budget,
  BudgetProgress,
  FinancialSummary,
  CategoryBreakdown,
  TrendDataPoint,
  GroupedTransactions,
} from "@/types";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  format,
  parseISO,
  eachDayOfInterval,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";

// ==================== BALANCE CALCULATIONS ====================

/**
 * Calculate account balance from all transactions
 * - Income to account: +amount
 * - Expense from account: -amount
 * - Transfer from account: -amount
 * - Transfer to account: +amount
 */
export function calculateAccountBalance(
  accountId: string,
  transactions: Transaction[]
): number {
  return transactions.reduce((balance, t) => {
    if (t.type === "income" && t.accountId === accountId) {
      return balance + t.amount;
    }
    if (t.type === "expense" && t.accountId === accountId) {
      return balance - t.amount;
    }
    if (t.type === "transfer") {
      if (t.accountId === accountId) {
        return balance - t.amount;
      }
      if (t.toAccountId === accountId) {
        return balance + t.amount;
      }
    }
    return balance;
  }, 0);
}

/**
 * Calculate all account balances at once
 */
export function calculateAllBalances(
  accounts: Account[],
  transactions: Transaction[]
): Map<string, number> {
  const balances = new Map<string, number>();
  accounts.forEach((account) => {
    balances.set(account.id, calculateAccountBalance(account.id, transactions));
  });
  return balances;
}

// ==================== NET WORTH CALCULATIONS ====================

/**
 * Calculate total assets (sum of balances where isLiability = false)
 */
export function calculateTotalAssets(
  accounts: Account[],
  transactions: Transaction[]
): number {
  const balances = calculateAllBalances(accounts, transactions);
  return accounts
    .filter((acc) => !acc.isLiability)
    .reduce((total, acc) => {
      const balance = balances.get(acc.id) ?? 0;
      return total + Math.max(0, balance);
    }, 0);
}

/**
 * Calculate total liabilities (sum of abs(balances) where isLiability = true)
 */
export function calculateTotalLiabilities(
  accounts: Account[],
  transactions: Transaction[]
): number {
  const balances = calculateAllBalances(accounts, transactions);
  return accounts
    .filter((acc) => acc.isLiability)
    .reduce((total, acc) => {
      const balance = balances.get(acc.id) ?? 0;
      return total + Math.abs(balance);
    }, 0);
}

/**
 * Calculate net worth = Assets - Liabilities
 */
export function calculateNetWorth(
  accounts: Account[],
  transactions: Transaction[]
): number {
  const assets = calculateTotalAssets(accounts, transactions);
  const liabilities = calculateTotalLiabilities(accounts, transactions);
  return assets - liabilities;
}

// ==================== PERIOD CALCULATIONS ====================

/**
 * Get transactions within a date range
 */
export function getTransactionsInRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((t) => {
    const date = parseISO(t.date);
    return isWithinInterval(date, {
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    });
  });
}

/**
 * Calculate income/expense for a period
 */
export function calculatePeriodSummary(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): { income: number; expense: number; net: number } {
  const filtered = getTransactionsInRange(transactions, startDate, endDate);

  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expense, net: income - expense };
}

/**
 * Get today's summary
 */
export function getTodaySummary(transactions: Transaction[]): {
  income: number;
  expense: number;
} {
  const today = new Date();
  const { income, expense } = calculatePeriodSummary(
    transactions,
    startOfDay(today),
    endOfDay(today)
  );
  return { income, expense };
}

/**
 * Get this month's summary
 */
export function getMonthSummary(transactions: Transaction[]): {
  income: number;
  expense: number;
} {
  const now = new Date();
  const { income, expense } = calculatePeriodSummary(
    transactions,
    startOfMonth(now),
    endOfMonth(now)
  );
  return { income, expense };
}

/**
 * Get this week's summary
 */
export function getWeekSummary(transactions: Transaction[]): {
  income: number;
  expense: number;
} {
  const now = new Date();
  const { income, expense } = calculatePeriodSummary(
    transactions,
    startOfWeek(now, { weekStartsOn: 1 }),
    endOfWeek(now, { weekStartsOn: 1 })
  );
  return { income, expense };
}

// ==================== CATEGORY ANALYSIS ====================

/**
 * Group transactions by category
 */
export function groupByCategory(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdown[] {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const grouped = new Map<string, { amount: number; count: number }>();
  let total = 0;

  transactions.forEach((t) => {
    if (!t.categoryId || t.type === "transfer") return;

    const existing = grouped.get(t.categoryId) ?? { amount: 0, count: 0 };
    grouped.set(t.categoryId, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
    total += t.amount;
  });

  const result: CategoryBreakdown[] = [];
  grouped.forEach((data, categoryId) => {
    const category = categoryMap.get(categoryId);
    if (category) {
      result.push({
        category,
        amount: data.amount,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        transactionCount: data.count,
      });
    }
  });

  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Get expense breakdown by category
 */
export function getExpenseBreakdown(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.type === "expense");
  return groupByCategory(expenses, categories);
}

/**
 * Get income breakdown by category
 */
export function getIncomeBreakdown(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdown[] {
  const income = transactions.filter((t) => t.type === "income");
  return groupByCategory(income, categories);
}

/**
 * Get top spending categories
 */
export function getTopCategories(
  transactions: Transaction[],
  categories: Category[],
  limit: number = 5
): CategoryBreakdown[] {
  return getExpenseBreakdown(transactions, categories).slice(0, limit);
}

// ==================== TREND ANALYSIS ====================

/**
 * Get daily trend data for charts
 */
export function getDailyTrend(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): TrendDataPoint[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  let runningBalance = 0;

  return days.map((day) => {
    const dayTransactions = getTransactionsInRange(transactions, day, day);

    const income = dayTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = dayTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    runningBalance += income - expense;

    return {
      date: format(day, "yyyy-MM-dd"),
      income,
      expense,
      balance: runningBalance,
    };
  });
}

/**
 * Get monthly trend data
 */
export function getMonthlyTrend(
  transactions: Transaction[],
  months: number = 6
): TrendDataPoint[] {
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, months - 1));
  const endDate = endOfMonth(now);

  const monthsList = eachMonthOfInterval({ start: startDate, end: endDate });
  let runningBalance = 0;

  return monthsList.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthTransactions = getTransactionsInRange(
      transactions,
      monthStart,
      monthEnd
    );

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    runningBalance += income - expense;

    return {
      date: format(month, "yyyy-MM"),
      income,
      expense,
      balance: runningBalance,
    };
  });
}

// ==================== BUDGET CALCULATIONS ====================

/**
 * Calculate budget progress for a category
 */
export function calculateBudgetProgress(
  budget: Budget,
  category: Category,
  transactions: Transaction[]
): BudgetProgress {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (budget.period === "monthly") {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  } else {
    startDate = startOfWeek(now, { weekStartsOn: 1 });
    endDate = endOfWeek(now, { weekStartsOn: 1 });
  }

  const periodTransactions = getTransactionsInRange(
    transactions,
    startDate,
    endDate
  );
  const categoryTransactions = periodTransactions.filter(
    (t) => t.categoryId === budget.categoryId && t.type === "expense"
  );

  const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = Math.max(0, budget.amount - spent);
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

  return {
    budget,
    category,
    spent,
    remaining,
    percentage,
    isOverBudget: spent > budget.amount,
    isNearLimit: percentage >= 80 && percentage < 100,
  };
}

/**
 * Get all budget progress
 */
export function getAllBudgetProgress(
  budgets: Budget[],
  categories: Category[],
  transactions: Transaction[]
): BudgetProgress[] {
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  return budgets
    .map((budget) => {
      const category = categoryMap.get(budget.categoryId);
      if (!category) return null;
      return calculateBudgetProgress(budget, category, transactions);
    })
    .filter((p): p is BudgetProgress => p !== null);
}

// ==================== FINANCIAL SUMMARY ====================

/**
 * Get complete financial summary for dashboard
 */
export function getFinancialSummary(
  accounts: Account[],
  transactions: Transaction[]
): FinancialSummary {
  const todaySummary = getTodaySummary(transactions);
  const monthSummary = getMonthSummary(transactions);

  return {
    totalAssets: calculateTotalAssets(accounts, transactions),
    totalLiabilities: calculateTotalLiabilities(accounts, transactions),
    netWorth: calculateNetWorth(accounts, transactions),
    todayIncome: todaySummary.income,
    todayExpense: todaySummary.expense,
    monthIncome: monthSummary.income,
    monthExpense: monthSummary.expense,
  };
}

// ==================== GROUP TRANSACTIONS ====================

/**
 * Group transactions by date
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): GroupedTransactions[] {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach((t) => {
    const dateKey = format(parseISO(t.date), "yyyy-MM-dd");
    const existing = grouped.get(dateKey) ?? [];
    grouped.set(dateKey, [...existing, t]);
  });

  const result: GroupedTransactions[] = [];
  grouped.forEach((txns, date) => {
    const totalIncome = txns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = txns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    result.push({
      date,
      transactions: txns.sort(
        (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
      ),
      totalIncome,
      totalExpense,
    });
  });

  return result.sort((a, b) => b.date.localeCompare(a.date));
}

// ==================== INSIGHTS GENERATION ====================

/**
 * Generate insight texts for statistics screen
 */
export function generateInsights(
  transactions: Transaction[],
  categories: Category[],
  previousMonthTransactions?: Transaction[]
): string[] {
  const insights: string[] = [];
  const now = new Date();

  // Current month data
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthTxns = getTransactionsInRange(
    transactions,
    monthStart,
    monthEnd
  );
  const currentSummary = calculatePeriodSummary(
    transactions,
    monthStart,
    monthEnd
  );

  // Top expense category
  const expenseBreakdown = getExpenseBreakdown(currentMonthTxns, categories);
  if (expenseBreakdown.length > 0) {
    const top = expenseBreakdown[0];
    insights.push(
      `Your biggest expense this month is ${
        top.category.name
      } (${top.percentage.toFixed(0)}% of expenses)`
    );
  }

  // Month comparison
  if (previousMonthTransactions && previousMonthTransactions.length > 0) {
    const prevStart = startOfMonth(subMonths(now, 1));
    const prevEnd = endOfMonth(subMonths(now, 1));
    const prevSummary = calculatePeriodSummary(
      previousMonthTransactions,
      prevStart,
      prevEnd
    );

    const savingsDiff =
      currentSummary.income -
      currentSummary.expense -
      (prevSummary.income - prevSummary.expense);

    if (savingsDiff > 0) {
      insights.push(
        `You've saved ${formatAmount(savingsDiff)} more than last month! 🎉`
      );
    } else if (savingsDiff < 0) {
      insights.push(
        `Your savings decreased by ${formatAmount(
          Math.abs(savingsDiff)
        )} compared to last month`
      );
    }
  }

  // Spending rate
  const daysInMonth = endOfMonth(now).getDate();
  const currentDay = now.getDate();
  const projectedExpense = (currentSummary.expense / currentDay) * daysInMonth;

  if (currentSummary.income > 0 && projectedExpense > currentSummary.income) {
    insights.push("⚠️ At this rate, expenses may exceed income this month");
  }

  // Positive savings
  if (currentSummary.net > 0) {
    const savingsRate = (
      (currentSummary.net / currentSummary.income) *
      100
    ).toFixed(0);
    insights.push(`You're saving ${savingsRate}% of your income this month 💪`);
  }

  return insights;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
