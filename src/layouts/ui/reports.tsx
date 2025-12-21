"use client";

import * as React from "react";

import { useTranslations } from "next-intl";

import { apiClient } from "@/utils";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle, Select, Skeleton, useCurrency } from "@/components";

import type { ApiResponse, MonthlyReport, YearlyReport } from "@/types";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: "green" | "red" | "blue" | "primary";
  subtitle?: string;
}

interface CategoryBarProps {
  category: {
    name: string;
    total: number;
    icon?: string;
  };
  totalExpense: number;
}

interface MonthBreakdownProps {
  month: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  };
}

const YEAR_OPTIONS = [
  { value: "2023", label: "2023" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const COLOR_CLASSES = {
  green: "text-green-600",
  red: "text-red-600",
  blue: "text-blue-600",
  primary: "text-primary-900",
};

const GRADIENT_CLASSES = {
  green: "bg-gradient-to-br from-green-500 to-green-600",
  red: "bg-gradient-to-br from-red-500 to-red-600",
  blue: "bg-gradient-to-br from-blue-500 to-blue-600",
  primary: "bg-gradient-to-br from-primary-500 to-primary-600",
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = "primary", subtitle }) => {
  const isGradient = ["green", "red", "blue"].includes(color);

  return (
    <Card variant="elevated" className={isGradient ? GRADIENT_CLASSES[color as keyof typeof GRADIENT_CLASSES] : ""}>
      <CardContent className="pt-6">
        <div className={isGradient ? "text-white" : ""}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${isGradient ? "opacity-90" : "text-primary-600"}`}>{label}</p>
            <span className="text-2xl">{icon}</span>
          </div>
          <p className={`text-3xl font-bold ${isGradient ? "" : COLOR_CLASSES[color]}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-1 ${isGradient ? "opacity-75" : "text-primary-600"}`}>{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const CategoryBar: React.FC<CategoryBarProps> = ({ category, totalExpense }) => {
  const t = useTranslations("reportsPage");
  const { format } = useCurrency();
  const percentage = totalExpense > 0 ? ((category.total / totalExpense) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-4 transition-colors rounded-lg bg-neutral hover:bg-neutral-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <span className="text-2xl shrink-0">{category.icon || "📊"}</span>
          <span className="font-medium truncate text-primary-900">{category.name}</span>
        </div>
        <div className="ml-4 text-right shrink-0">
          <p className="text-lg font-bold text-red-600">{format(category.total)}</p>
          <p className="text-xs text-primary-600">
            {percentage}% {t("ofTotal")}
          </p>
        </div>
      </div>
      <div className="w-full h-3 overflow-hidden rounded-full bg-primary-100">
        <div className="h-full transition-all duration-500 rounded-full bg-linier-to-r from-red-500 to-red-600" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const MonthBreakdown: React.FC<MonthBreakdownProps> = ({ month }) => {
  const t = useTranslations("reportsPage");
  const { format } = useCurrency();

  return (
    <div className="flex items-center justify-between p-4 transition-colors rounded-lg bg-neutral hover:bg-neutral-100">
      <div className="flex items-center gap-2">
        <span className="text-xl">📅</span>
        <span className="font-semibold text-primary-900 min-w-[100px]">{month.month}</span>
      </div>
      <div className="flex gap-6 text-sm">
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">+{format(month.income)}</p>
          <p className="text-xs text-primary-600">{t("income")}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-red-600">-{format(month.expense)}</p>
          <p className="text-xs text-primary-600">{t("expense")}</p>
        </div>
        <div className="text-right">
          <p className={`font-bold text-lg ${month.balance >= 0 ? "text-primary-900" : "text-red-600"}`}>{format(month.balance)}</p>
          <p className="text-xs text-primary-600">{t("balance")}</p>
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  const t = useTranslations("reportsPage");

  return (
    <div className="py-16 text-center">
      <div className="mb-4 text-6xl">📊</div>
      <h3 className="mb-2 text-xl font-bold text-primary-900">{t("empty.title")}</h3>
      <p className="max-w-md mx-auto text-primary-600">{message}</p>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="w-64 h-8" />
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export const Reports: React.FC = () => {
  const t = useTranslations("reportsPage");
  const { format } = useCurrency();
  const now = React.useMemo(() => new Date(), []);
  const [reportType, setReportType] = React.useState<"monthly" | "yearly">("monthly");
  const [selectedMonth, setSelectedMonth] = React.useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number>(now.getFullYear());

  const monthOptions = React.useMemo(
    () => [
      { value: "1", label: t("months.january") },
      { value: "2", label: t("months.february") },
      { value: "3", label: t("months.march") },
      { value: "4", label: t("months.april") },
      { value: "5", label: t("months.may") },
      { value: "6", label: t("months.june") },
      { value: "7", label: t("months.july") },
      { value: "8", label: t("months.august") },
      { value: "9", label: t("months.september") },
      { value: "10", label: t("months.october") },
      { value: "11", label: t("months.november") },
      { value: "12", label: t("months.december") },
    ],
    [t]
  );

  const { data: monthlyReport, isLoading: monthlyLoading } = useQuery<ApiResponse<MonthlyReport>>({
    queryKey: ["reports", "monthly", selectedMonth, selectedYear],
    queryFn: () => apiClient.get("/reports/monthly", { params: { month: selectedMonth, year: selectedYear } }),
    enabled: reportType === "monthly",
  });

  const { data: yearlyReport, isLoading: yearlyLoading } = useQuery<ApiResponse<YearlyReport>>({
    queryKey: ["reports", "yearly", selectedYear],
    queryFn: () => apiClient.get("/reports/yearly", { params: { year: selectedYear } }),
    enabled: reportType === "yearly",
  });

  const isLoading = reportType === "monthly" ? monthlyLoading : yearlyLoading;
  const monthlyData = monthlyReport?.data;
  const yearlyData = yearlyReport?.data;

  const selectedMonthName = React.useMemo(() => monthOptions.find((m) => m.value === selectedMonth.toString())?.label || "", [selectedMonth, monthOptions]);

  const handleReportTypeChange = React.useCallback((value: string) => {
    setReportType(value as "monthly" | "yearly");
  }, []);

  const handleMonthChange = React.useCallback((value: string) => {
    setSelectedMonth(parseInt(value));
  }, []);

  const handleYearChange = React.useCallback((value: string) => {
    setSelectedYear(parseInt(value));
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">{t("title")}</h1>
          <p className="mt-1 text-primary-600">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-primary-600">
          <span className="px-3 py-1 font-medium rounded-full bg-primary-100">{reportType === "monthly" ? `📅 ${selectedMonthName} ${selectedYear}` : `📆 ${selectedYear}`}</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label={t("filter.reportType")}
              options={[
                { value: "monthly", label: `📅 ${t("filter.monthlyReport")}` },
                { value: "yearly", label: `📆 ${t("filter.yearlyReport")}` },
              ]}
              value={reportType}
              onChange={(e) => handleReportTypeChange(e.target.value)}
            />

            {reportType === "monthly" && <Select label={t("filter.month")} options={monthOptions} value={selectedMonth.toString()} onChange={(e) => handleMonthChange(e.target.value)} />}

            <Select label={t("filter.year")} options={YEAR_OPTIONS} value={selectedYear.toString()} onChange={(e) => handleYearChange(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {reportType === "monthly" && monthlyData && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("stats.totalIncome")} value={format(monthlyData.summary.income)} icon="💰" color="green" />
            <StatCard label={t("stats.totalExpense")} value={format(monthlyData.summary.expense)} icon="💳" color="red" />
            <StatCard label={t("stats.netBalance")} value={format(monthlyData.summary.balance)} icon="📊" color="blue" />
            <StatCard
              label={t("stats.savingsRate")}
              value={`${(monthlyData.summary.savingsRate || 0).toFixed(1)}%`}
              icon="🎯"
              color="primary"
              subtitle={monthlyData.summary.savingsRate >= 20 ? t("stats.greatJob") : t("stats.keepImproving")}
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">📈 {t("topCategories")}</CardTitle>
                <span className="text-sm text-primary-600">
                  {monthlyData.topCategories?.length || 0} {t("categoriesCount")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!monthlyData.topCategories || monthlyData.topCategories.length === 0 ? (
                <EmptyState message={t("empty.monthly")} />
              ) : (
                <div className="space-y-3">
                  {monthlyData.topCategories.map((category, index) => (
                    <CategoryBar key={index} category={category} totalExpense={monthlyData.summary.expense} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard label={t("stats.transactionCount")} value={monthlyData.summary.transactionCount || 0} icon="🔢" color="primary" />
            <StatCard label={t("stats.dailyAvgExpense")} value={format(monthlyData.summary.avgDailyExpense)} icon="📅" color="primary" />
            <StatCard label={t("stats.largestTransaction")} value={format(monthlyData.summary.largestTransaction)} icon="💎" color="primary" />
          </div>
        </>
      )}

      {reportType === "yearly" && yearlyData && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t("stats.totalIncome")} value={format(yearlyData.summary.totalIncome)} icon="💰" color="green" />
            <StatCard label={t("stats.totalExpense")} value={format(yearlyData.summary.totalExpense)} icon="💳" color="red" />
            <StatCard label={t("stats.yearlyBalance")} value={format(yearlyData.summary.yearlyBalance)} icon="📊" color="blue" />
            <StatCard
              label={t("stats.savingsRate")}
              value={`${(yearlyData.summary.savingsRate || 0).toFixed(1)}%`}
              icon="🎯"
              color="primary"
              subtitle={yearlyData.summary.savingsRate >= 20 ? t("stats.excellent") : t("stats.roomToImprove")}
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">📈 {t("topCategories")}</CardTitle>
                <span className="text-sm text-primary-600">
                  {yearlyData.topCategories?.length || 0} {t("categoriesCount")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!yearlyData.topCategories || yearlyData.topCategories.length === 0 ? (
                <EmptyState message={t("empty.yearly")} />
              ) : (
                <div className="space-y-3">
                  {yearlyData.topCategories.map((category, index) => (
                    <CategoryBar key={index} category={category} totalExpense={yearlyData.summary.totalExpense} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">📆 {t("monthlyBreakdown")}</CardTitle>
                <span className="text-sm text-primary-600">
                  {yearlyData.monthlyBreakdown?.length || 0} {t("monthsCount")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {!yearlyData.monthlyBreakdown || yearlyData.monthlyBreakdown.length === 0 ? (
                <EmptyState message={t("empty.breakdown")} />
              ) : (
                <div className="space-y-3">
                  {yearlyData.monthlyBreakdown.map((month, index) => (
                    <MonthBreakdown key={index} month={month} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard label={t("stats.totalTransactions")} value={yearlyData.summary.transactionCount || 0} icon="🔢" color="primary" />
            <StatCard label={t("stats.avgMonthlyIncome")} value={format(yearlyData.summary.avgMonthlyIncome)} icon="💰" color="primary" />
            <StatCard label={t("stats.avgMonthlyExpense")} value={format(yearlyData.summary.avgMonthlyExpense)} icon="💳" color="primary" />
          </div>
        </>
      )}
    </div>
  );
};
