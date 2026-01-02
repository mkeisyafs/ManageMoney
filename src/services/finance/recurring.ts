import { v4 as uuidv4 } from "uuid";
import { RecurringTransaction, Transaction, RecurringFrequency } from "@/types";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  parseISO,
  startOfDay,
  isBefore,
  isAfter,
  isEqual,
} from "date-fns";

/**
 * Calculate next occurrence date based on frequency
 */
export function getNextOccurrence(
  lastDate: Date,
  frequency: RecurringFrequency
): Date {
  switch (frequency) {
    case "daily":
      return addDays(lastDate, 1);
    case "weekly":
      return addWeeks(lastDate, 1);
    case "biweekly":
      return addWeeks(lastDate, 2);
    case "monthly":
      return addMonths(lastDate, 1);
    case "yearly":
      return addYears(lastDate, 1);
    default:
      return addMonths(lastDate, 1);
  }
}

/**
 * Get all occurrence dates between two dates
 */
export function getOccurrencesBetween(
  startDate: Date,
  endDate: Date,
  frequency: RecurringFrequency
): Date[] {
  const occurrences: Date[] = [];
  let current = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (isBefore(current, end) || isEqual(current, end)) {
    occurrences.push(current);
    current = getNextOccurrence(current, frequency);
  }

  return occurrences;
}

/**
 * Check if recurring transaction should be processed today
 */
export function shouldProcessToday(
  recurring: RecurringTransaction,
  today: Date
): boolean {
  if (!recurring.isEnabled) return false;

  const startDate = parseISO(recurring.startDate);
  if (isAfter(startDate, today)) return false;

  if (recurring.endDate) {
    const endDate = parseISO(recurring.endDate);
    if (isAfter(today, endDate)) return false;
  }

  return true;
}

/**
 * Process all enabled recurring transactions
 * Called when app is opened or on a scheduled interval
 */
export function processRecurringTransactions(
  recurringList: RecurringTransaction[],
  today: Date,
  maxOccurrences: number = 100
): {
  newTransactions: Transaction[];
  updatedRecurring: RecurringTransaction[];
} {
  const newTransactions: Transaction[] = [];
  const updatedRecurring: RecurringTransaction[] = [];
  const todayStart = startOfDay(today);

  for (const recurring of recurringList) {
    if (!shouldProcessToday(recurring, today)) {
      continue;
    }

    // Determine the starting point for processing
    const lastProcessed = recurring.lastProcessed
      ? parseISO(recurring.lastProcessed)
      : addDays(parseISO(recurring.startDate), -1); // Day before start to include start date

    // Get next occurrence after last processed
    let nextOccurrence = getNextOccurrence(lastProcessed, recurring.frequency);

    // If we haven't processed the start date yet
    if (!recurring.lastProcessed) {
      nextOccurrence = parseISO(recurring.startDate);
    }

    let occurrenceCount = 0;
    let lastGeneratedDate: Date | null = null;

    // Generate transactions for all occurrences up to today
    while (
      (isBefore(nextOccurrence, todayStart) ||
        isEqual(nextOccurrence, todayStart)) &&
      occurrenceCount < maxOccurrences
    ) {
      // Check end date if specified
      if (recurring.endDate) {
        const endDate = parseISO(recurring.endDate);
        if (isAfter(nextOccurrence, endDate)) {
          break;
        }
      }

      // Create transaction for this occurrence
      const transaction: Transaction = {
        id: uuidv4(),
        type: recurring.type,
        amount: recurring.amount,
        categoryId: recurring.categoryId,
        accountId: recurring.accountId,
        toAccountId: recurring.toAccountId,
        date: nextOccurrence.toISOString(),
        note: recurring.note,
        isRecurringGenerated: true,
        recurringId: recurring.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newTransactions.push(transaction);
      lastGeneratedDate = nextOccurrence;
      occurrenceCount++;

      // Move to next occurrence
      nextOccurrence = getNextOccurrence(nextOccurrence, recurring.frequency);
    }

    // Update the recurring transaction with last processed date
    if (lastGeneratedDate) {
      updatedRecurring.push({
        ...recurring,
        lastProcessed: lastGeneratedDate.toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return { newTransactions, updatedRecurring };
}

/**
 * Get upcoming occurrences for a recurring transaction
 */
export function getUpcomingOccurrences(
  recurring: RecurringTransaction,
  count: number = 5
): Date[] {
  if (!recurring.isEnabled) return [];

  const lastProcessed = recurring.lastProcessed
    ? parseISO(recurring.lastProcessed)
    : parseISO(recurring.startDate);

  const occurrences: Date[] = [];
  let nextDate = getNextOccurrence(lastProcessed, recurring.frequency);

  for (let i = 0; i < count; i++) {
    if (recurring.endDate && isAfter(nextDate, parseISO(recurring.endDate))) {
      break;
    }
    occurrences.push(nextDate);
    nextDate = getNextOccurrence(nextDate, recurring.frequency);
  }

  return occurrences;
}

/**
 * Calculate total expected amount for recurring transactions in a period
 */
export function calculateRecurringTotal(
  recurringList: RecurringTransaction[],
  startDate: Date,
  endDate: Date,
  type?: "income" | "expense" | "transfer"
): number {
  let total = 0;

  for (const recurring of recurringList) {
    if (!recurring.isEnabled) continue;
    if (type && recurring.type !== type) continue;

    const occurrences = getOccurrencesBetween(
      startDate,
      endDate,
      recurring.frequency
    ).filter((date) => {
      const start = parseISO(recurring.startDate);
      const end = recurring.endDate ? parseISO(recurring.endDate) : null;

      return (
        (isAfter(date, start) || isEqual(date, start)) &&
        (!end || isBefore(date, end) || isEqual(date, end))
      );
    });

    total += recurring.amount * occurrences.length;
  }

  return total;
}
