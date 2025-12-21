export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSetting {
  id: string;
  key: string;
  value: string;
  icon: string;
  type: "boolean" | "string" | "number" | "object" | "array";
  category: "general" | "notifications" | "appearance" | "security" | "privacy" | "billing";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description?: string;
  date: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
  account: Account;
  category: Category;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: "CASH" | "BANK" | "EWALLET" | "CREDIT_CARD";
  balance: number;
  color?: string;
  icon?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface QuickTransactionData {
  email: string;
  categoryId: string;
  accountId: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description?: string;
  date: string;
  attachment?: string;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER" | "";
  accountId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionType {
  income: number;
  expense: number;
  balance: number;
}

export interface DashboardSummary {
  currentMonth: TransactionType;
  previousMonth: TransactionType;
  changes: TransactionType;
  totalBalance: number;
  recentTransactions: Transaction[];
}

export interface DashboardCharts {
  monthlyData: TransactionType[];
  categoryData: { name: string; value: number; color: string }[];
  budgetProgress: { category: string; budget: number; spent: number; percentage: number }[];
}

export interface TopCategory {
  name: string;
  total: number;
}

export interface SpendingTrend {
  date: string;
  amount: number;
}

export interface MonthlyReport {
  summary: {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
    avgDailyExpense: number;
    largestTransaction: number;
    transactionCount: number;
  };
  topCategories: TopCategory[];
  spendingTrend: SpendingTrend[];
  transactions: Transaction[];
}

export interface MonthlyBreakdown {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface YearlyReport {
  summary: {
    totalIncome: number;
    totalExpense: number;
    yearlyBalance: number;
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
    savingsRate: number;
    transactionCount: number;
  };
  monthlyBreakdown: MonthlyBreakdown[];
  topCategories: TopCategory[];
}
