"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { useTranslations } from "next-intl";

import Link from "next/link";

import { apiClient } from "@/utils";

import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Skeleton } from "@/components";

import type { ApiResponse, DashboardCharts, DashboardSummary, Transaction } from "@/types";

interface SummaryCardProps {
  title: string;
  amount: number;
  change: number;
  icon: string;
  type: "income" | "expense" | "balance";
}

interface TransactionItemProps {
  transaction: Transaction;
}

interface BudgetProgressProps {
  budget: {
    category: string;
    spent: number;
    budget: number;
    percentage: number;
    icon?: string;
  };
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, change, icon, type }) => {
  const t = useTranslations("dashboardPage");
  const isPositive = type === "expense" ? change <= 0 : change >= 0;
  const colorClass = type === "income" ? "text-green-600" : type === "expense" ? "text-red-600" : "text-primary-900";

  return (
    <Card variant="elevated" className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="text-primary-600">{title}</span>
          <span className="text-3xl">{icon}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-4xl font-bold ${colorClass} mb-2`}>Rp {amount?.toLocaleString("id-ID") || 0}</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? "↗" : "↘"} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-primary-600">{t("vsLastMonth")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const t = useTranslations("dashboardPage");
  const isIncome = transaction.type === "INCOME";

  return (
    <div className="flex items-center justify-between p-4 transition-all rounded-lg bg-neutral hover:bg-neutral-100 hover:shadow-md group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`flex items-center justify-center w-12 h-12 text-2xl rounded-full ${isIncome ? "bg-green-100" : "bg-red-100"} transition-transform group-hover:scale-110`}>
          {transaction.category?.icon || "💰"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-primary-900 truncate">{transaction.description}</h4>
          <p className="text-sm text-primary-600">{transaction.category?.name || t("uncategorized")}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className={`text-xl font-bold ${isIncome ? "text-green-600" : "text-red-600"}`}>
          {isIncome ? "+" : "-"}Rp {transaction.amount?.toLocaleString("id-ID")}
        </p>
        <Badge variant={isIncome ? "success" : "error"} size="sm" className="mt-1">
          {isIncome ? `💰 ${t("income")}` : `💳 ${t("expense")}`}
        </Badge>
      </div>
    </div>
  );
};

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budget }) => {
  const t = useTranslations("dashboardPage");

  const status = useMemo(() => {
    if (budget.percentage >= 100) return { color: "bg-red-500", label: t("budgetStatus.overBudget"), textColor: "text-red-600" };
    if (budget.percentage >= 80) return { color: "bg-yellow-500", label: t("budgetStatus.nearLimit"), textColor: "text-yellow-600" };
    return { color: "bg-green-500", label: t("budgetStatus.onTrack"), textColor: "text-green-600" };
  }, [budget.percentage, t]);

  return (
    <div className="p-4 rounded-lg bg-neutral hover:bg-neutral-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{budget.icon || "📊"}</span>
          <span className="font-semibold text-primary-900">{budget.category}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-primary-900">Rp {budget.spent?.toLocaleString("id-ID")}</p>
          <p className="text-xs text-primary-600">
            {t("of")} Rp {budget.budget?.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
      <div className="relative w-full h-3 overflow-hidden rounded-full bg-primary-100">
        <div className={`h-full rounded-full transition-all duration-500 ${status.color}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
        <span className="text-xs text-primary-600">
          {budget.percentage?.toFixed(1)}% {t("used")}
        </span>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}> = ({ icon, title, description, actionLabel, actionHref }) => (
  <div className="py-16 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-primary-900 mb-2">{title}</h3>
    <p className="text-primary-600 mb-6 max-w-md mx-auto">{description}</p>
    {actionLabel && actionHref && (
      <Link href={actionHref}>
        <Button variant="primary" size="lg">
          {actionLabel}
        </Button>
      </Link>
    )}
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="w-64 h-8" />
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40" />
      ))}
    </div>
    <Skeleton className="h-96" />
    <Skeleton className="h-96" />
  </div>
);

export const Dashboard: React.FC = () => {
  const t = useTranslations("dashboardPage");

  const { data: summary, isLoading: summaryLoading } = useQuery<ApiResponse<DashboardSummary>>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiClient.get("/dashboard/summary"),
  });

  const { data: charts, isLoading: chartsLoading } = useQuery<ApiResponse<DashboardCharts>>({
    queryKey: ["dashboard", "charts"],
    queryFn: () => apiClient.get("/dashboard/charts"),
  });

  const isLoading = summaryLoading || chartsLoading;
  const currentMonth = summary?.data?.currentMonth;
  const changes = summary?.data?.changes;
  const recentTransactions = summary?.data?.recentTransactions || [];
  const budgetProgress = charts?.data?.budgetProgress || [];

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">{t("title")}</h1>
          <p className="mt-1 text-primary-600">{t("welcome", { month: currentMonthName })}</p>
        </div>
        <Link href="/admin/dashboard/transactions">
          <Button variant="primary" className="w-full sm:w-auto">
            + {t("addTransaction")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard title={t("totalIncome")} amount={currentMonth?.income || 0} change={changes?.income || 0} icon="💰" type="income" />
        <SummaryCard title={t("totalExpenses")} amount={currentMonth?.expense || 0} change={changes?.expense || 0} icon="💳" type="expense" />
        <SummaryCard title={t("netBalance")} amount={currentMonth?.balance || 0} change={changes?.balance || 0} icon="📊" type="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">📝 {t("recentTransactions")}</CardTitle>
              <Link href="/admin/dashboard/transactions">
                <Button variant="ghost" size="sm">
                  {t("viewAll")} →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon="📝"
                title={t("empty.transactions.title")}
                description={t("empty.transactions.description")}
                actionLabel={`+ ${t("addTransaction")}`}
                actionHref="/admin/dashboard/transactions"
              />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {recentTransactions.slice(0, 5).map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">🎯 {t("budgetProgress")}</CardTitle>
              <Link href="/admin/dashboard/budgets">
                <Button variant="ghost" size="sm">
                  {t("manage")} →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {budgetProgress.length === 0 ? (
              <EmptyState
                icon="🎯"
                title={t("empty.budgets.title")}
                description={t("empty.budgets.description")}
                actionLabel={`+ ${t("empty.budgets.action")}`}
                actionHref="/admin/dashboard/budgets"
              />
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {budgetProgress.map((budget, index) => (
                  <BudgetProgress key={index} budget={budget} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📈 {t("quickAction")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/dashboard/transactions" className="block">
              <div className="p-4 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">💳</span>
                  <div>
                    <p className="font-semibold text-primary-900">{t("quickActions.transactions.title")}</p>
                    <p className="text-xs text-primary-600">{t("quickActions.transactions.subtitle")}</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/dashboard/budgets" className="block">
              <div className="p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🎯</span>
                  <div>
                    <p className="font-semibold text-green-900">{t("quickActions.budgets.title")}</p>
                    <p className="text-xs text-green-600">{t("quickActions.budgets.subtitle")}</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/dashboard/goals" className="block">
              <div className="p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">🏆</span>
                  <div>
                    <p className="font-semibold text-blue-900">{t("quickActions.goals.title")}</p>
                    <p className="text-xs text-blue-600">{t("quickActions.goals.subtitle")}</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/dashboard/reports" className="block">
              <div className="p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
                  <div>
                    <p className="font-semibold text-purple-900">{t("quickActions.reports.title")}</p>
                    <p className="text-xs text-purple-600">{t("quickActions.reports.subtitle")}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
