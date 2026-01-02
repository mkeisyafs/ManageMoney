import { Category, AppSettings } from "@/types";

// ==================== DEFAULT EXPENSE CATEGORIES ====================
export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, "id">[] = [
  {
    name: "Food & Dining",
    type: "expense",
    icon: "🍔",
    color: "#FF6B6B",
    isDefault: true,
  },
  {
    name: "Transportation",
    type: "expense",
    icon: "🚗",
    color: "#4ECDC4",
    isDefault: true,
  },
  {
    name: "Shopping",
    type: "expense",
    icon: "🛍️",
    color: "#9B59B6",
    isDefault: true,
  },
  {
    name: "Entertainment",
    type: "expense",
    icon: "🎬",
    color: "#F39C12",
    isDefault: true,
  },
  {
    name: "Bills & Utilities",
    type: "expense",
    icon: "💡",
    color: "#3498DB",
    isDefault: true,
  },
  {
    name: "Health",
    type: "expense",
    icon: "🏥",
    color: "#E74C3C",
    isDefault: true,
  },
  {
    name: "Education",
    type: "expense",
    icon: "📚",
    color: "#1ABC9C",
    isDefault: true,
  },
  {
    name: "Personal Care",
    type: "expense",
    icon: "💅",
    color: "#E91E63",
    isDefault: true,
  },
  {
    name: "Home",
    type: "expense",
    icon: "🏠",
    color: "#795548",
    isDefault: true,
  },
  {
    name: "Travel",
    type: "expense",
    icon: "✈️",
    color: "#00BCD4",
    isDefault: true,
  },
  {
    name: "Gifts",
    type: "expense",
    icon: "🎁",
    color: "#FF4081",
    isDefault: true,
  },
  {
    name: "Other",
    type: "expense",
    icon: "📦",
    color: "#607D8B",
    isDefault: true,
  },
];

// ==================== DEFAULT INCOME CATEGORIES ====================
export const DEFAULT_INCOME_CATEGORIES: Omit<Category, "id">[] = [
  {
    name: "Salary",
    type: "income",
    icon: "💰",
    color: "#27AE60",
    isDefault: true,
  },
  {
    name: "Freelance",
    type: "income",
    icon: "💼",
    color: "#2ECC71",
    isDefault: true,
  },
  {
    name: "Investments",
    type: "income",
    icon: "📈",
    color: "#16A085",
    isDefault: true,
  },
  {
    name: "Gifts Received",
    type: "income",
    icon: "🎁",
    color: "#1ABC9C",
    isDefault: true,
  },
  {
    name: "Refunds",
    type: "income",
    icon: "💵",
    color: "#2980B9",
    isDefault: true,
  },
  {
    name: "Other Income",
    type: "income",
    icon: "💸",
    color: "#3498DB",
    isDefault: true,
  },
];

// ==================== DEFAULT SETTINGS ====================
export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  currency: "IDR",
  language: "id",
  pinEnabled: false,
  biometricEnabled: false,
  onboardingCompleted: false,
};

// ==================== ACCOUNT TYPE CONFIG ====================
export const ACCOUNT_TYPE_CONFIG = {
  bank: {
    label: "Bank Account",
    icon: "🏦",
    defaultColor: "#1976D2",
    isLiabilityDefault: false,
  },
  cash: {
    label: "Cash",
    icon: "💵",
    defaultColor: "#4CAF50",
    isLiabilityDefault: false,
  },
  ewallet: {
    label: "E-Wallet",
    icon: "📱",
    defaultColor: "#00BCD4",
    isLiabilityDefault: false,
  },
  crypto: {
    label: "Cryptocurrency",
    icon: "₿",
    defaultColor: "#FF9800",
    isLiabilityDefault: false,
  },
  investment: {
    label: "Investment",
    icon: "📈",
    defaultColor: "#9C27B0",
    isLiabilityDefault: false,
  },
  credit_card: {
    label: "Credit Card",
    icon: "💳",
    defaultColor: "#F44336",
    isLiabilityDefault: true,
  },
  loan: {
    label: "Loan",
    icon: "🏠",
    defaultColor: "#795548",
    isLiabilityDefault: true,
  },
  other: {
    label: "Other",
    icon: "💼",
    defaultColor: "#607D8B",
    isLiabilityDefault: false,
  },
} as const;

// ==================== RECURRING FREQUENCY CONFIG ====================
export const FREQUENCY_CONFIG = {
  daily: { label: "Daily", labelId: "Harian" },
  weekly: { label: "Weekly", labelId: "Mingguan" },
  biweekly: { label: "Bi-weekly", labelId: "Dua Mingguan" },
  monthly: { label: "Monthly", labelId: "Bulanan" },
  yearly: { label: "Yearly", labelId: "Tahunan" },
} as const;

// ==================== CURRENCY SYMBOLS ====================
export const CURRENCY_CONFIG = {
  IDR: { symbol: "Rp", name: "Indonesian Rupiah", locale: "id-ID" },
  USD: { symbol: "$", name: "US Dollar", locale: "en-US" },
  EUR: { symbol: "€", name: "Euro", locale: "de-DE" },
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB" },
  JPY: { symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  SGD: { symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  MYR: { symbol: "RM", name: "Malaysian Ringgit", locale: "ms-MY" },
} as const;

// ==================== ICON OPTIONS ====================
export const ICON_OPTIONS = [
  "💰",
  "💵",
  "💳",
  "🏦",
  "💼",
  "📱",
  "₿",
  "📈",
  "📉",
  "🍔",
  "🍕",
  "☕",
  "🍺",
  "🛒",
  "🛍️",
  "👕",
  "👗",
  "👟",
  "🚗",
  "🚌",
  "🚇",
  "✈️",
  "⛽",
  "🚕",
  "🏍️",
  "🚲",
  "🏠",
  "🏢",
  "💡",
  "📺",
  "📱",
  "💻",
  "🔌",
  "🛋️",
  "🎬",
  "🎮",
  "🎵",
  "📚",
  "🎨",
  "🏀",
  "⚽",
  "🎾",
  "🏥",
  "💊",
  "🩺",
  "🧘",
  "💪",
  "💅",
  "💈",
  "🛁",
  "🎁",
  "💝",
  "🎂",
  "🎉",
  "✨",
  "⭐",
  "❤️",
  "🔥",
  "📦",
  "🔧",
  "🛠️",
  "📝",
  "📋",
  "🗂️",
  "📊",
  "💎",
];

// ==================== COLOR OPTIONS ====================
export const COLOR_OPTIONS = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B",
  "#000000",
];

// ==================== APP VERSION ====================
export const APP_VERSION = "1.0.0";
export const APP_NAME = "ManageMoney";
