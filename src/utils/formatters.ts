import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isYesterday,
} from "date-fns";
import { id, enUS } from "date-fns/locale";
import { CURRENCY_CONFIG } from "@/constants/defaults";
import { Language } from "@/types";

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = "IDR",
  options?: { showSign?: boolean; compact?: boolean }
): string {
  const config =
    CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG] ??
    CURRENCY_CONFIG.IDR;

  if (options?.compact && Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    return `${config.symbol}${millions.toFixed(1)}M`;
  }

  if (options?.compact && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000;
    return `${config.symbol}${thousands.toFixed(0)}K`;
  }

  const formatted = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "IDR" ? 0 : 2,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(Math.abs(amount));

  if (options?.showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted.replace("-", "")}`;
  }

  return formatted;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for display
 */
export function formatDate(
  dateString: string,
  formatStr: string = "dd MMM yyyy",
  language: Language = "id"
): string {
  const date = parseISO(dateString);
  const locale = language === "id" ? id : enUS;
  return format(date, formatStr, { locale });
}

/**
 * Format date relative (e.g., "2 hours ago")
 */
export function formatRelativeDate(
  dateString: string,
  language: Language = "id"
): string {
  const date = parseISO(dateString);
  const locale = language === "id" ? id : enUS;
  return formatDistanceToNow(date, { addSuffix: true, locale });
}

/**
 * Format date for transaction list
 */
export function formatTransactionDate(
  dateString: string,
  language: Language = "id"
): string {
  const date = parseISO(dateString);
  const locale = language === "id" ? id : enUS;

  if (isToday(date)) {
    return language === "id" ? "Hari ini" : "Today";
  }

  if (isYesterday(date)) {
    return language === "id" ? "Kemarin" : "Yesterday";
  }

  return format(date, "EEEE, dd MMMM yyyy", { locale });
}

/**
 * Format time
 */
export function formatTime(dateString: string): string {
  return format(parseISO(dateString), "HH:mm");
}

/**
 * Format month and year
 */
export function formatMonthYear(
  dateString: string,
  language: Language = "id"
): string {
  const date = parseISO(dateString);
  const locale = language === "id" ? id : enUS;
  return format(date, "MMMM yyyy", { locale });
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(language: Language = "id"): string {
  const hour = new Date().getHours();

  if (language === "id") {
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  }

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, locale: string = "id-ID"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Get color for transaction type
 */
export function getTransactionColor(
  type: "income" | "expense" | "transfer"
): string {
  switch (type) {
    case "income":
      return "#4CAF50";
    case "expense":
      return "#F44336";
    case "transfer":
      return "#2196F3";
  }
}

/**
 * Get icon for transaction type
 */
export function getTransactionIcon(
  type: "income" | "expense" | "transfer"
): string {
  switch (type) {
    case "income":
      return "arrow-down-left";
    case "expense":
      return "arrow-up-right";
    case "transfer":
      return "arrow-left-right";
  }
}

/**
 * Get budget status color
 */
export function getBudgetStatusColor(percentage: number): string {
  if (percentage >= 100) return "#F44336"; // Red - over budget
  if (percentage >= 80) return "#FF9800"; // Orange - near limit
  if (percentage >= 50) return "#FFC107"; // Yellow - half way
  return "#4CAF50"; // Green - good
}

/**
 * Get budget status text
 */
export function getBudgetStatusText(
  percentage: number,
  language: Language = "id"
): string {
  if (language === "id") {
    if (percentage >= 100) return "Melebihi Anggaran";
    if (percentage >= 80) return "Hampir Penuh";
    if (percentage >= 50) return "Separuh Terpakai";
    return "Baik";
  }

  if (percentage >= 100) return "Over Budget";
  if (percentage >= 80) return "Near Limit";
  if (percentage >= 50) return "Half Used";
  return "On Track";
}
