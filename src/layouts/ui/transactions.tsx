"use client";

import * as React from "react";

import { useTranslations } from "next-intl";

import { useTransactions, useCategories, useAccounts, useSearchPagination } from "@/hooks";

import { Card, CardContent, Button, Input, Select, Badge, Modal, Skeleton, useToast, useCurrency } from "@/components";

import type { Transaction, TransactionFilter, TransactionType } from "@/types";

interface FormData {
  accountId: string;
  toAccountId: string;
  categoryId: string;
  amount: string;
  type: TransactionType;
  description: string;
  date: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

interface EmptyStateProps {
  onCreateClick: () => void;
}

const INITIAL_FORM_DATA: FormData = {
  accountId: "",
  toAccountId: "",
  categoryId: "",
  amount: "",
  type: "EXPENSE",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

const TYPE_CONFIG: Record<TransactionType, { color: string; bg: string; icon: string; prefix: string }> = {
  INCOME: { color: "text-green-600", bg: "bg-green-100", icon: "💰", prefix: "+" },
  EXPENSE: { color: "text-red-600", bg: "bg-red-100", icon: "💳", prefix: "-" },
  TRANSFER: { color: "text-blue-600", bg: "bg-blue-100", icon: "🔄", prefix: "⇄" },
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete, isDeleting }) => {
  const t = useTranslations("transactionsPage");
  const { format } = useCurrency();

  const config = TYPE_CONFIG[transaction.type as TransactionType] ?? TYPE_CONFIG.EXPENSE;
  const isTransfer = transaction.type === "TRANSFER";

  const formattedDate = React.useMemo(
    () =>
      new Date(transaction.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [transaction.date],
  );

  const badgeVariant = transaction.type === "INCOME" ? "success" : transaction.type === "TRANSFER" ? "info" : "error";

  const badgeLabel = transaction.type === "INCOME" ? `${config.icon} ${t("income")}` : transaction.type === "TRANSFER" ? `${config.icon} ${t("transfer")}` : `${config.icon} ${t("expense")}`;

  return (
    <div className="flex items-center justify-between p-4 transition-all rounded-lg bg-neutral hover:bg-neutral-200 hover:shadow-md group">
      <div className="flex items-center flex-1 min-w-0 gap-4">
        <div className={`flex items-center justify-center w-12 h-12 text-2xl rounded-full ${config.bg} transition-transform group-hover:scale-110`}>
          {isTransfer ? "🔄" : (transaction.category?.icon ?? "💰")}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate text-primary-900" title={transaction.description}>
            {transaction.description || t("noDescription")}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-primary-600">
            {!isTransfer && transaction.category && (
              <>
                <span className="flex items-center gap-1">
                  {transaction.category.icon} {transaction.category.name}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              {transaction.account?.icon} {transaction.account?.name}
            </span>
            {isTransfer && transaction.toAccount && (
              <>
                <span>→</span>
                <span className="flex items-center gap-1">
                  {transaction.toAccount.icon} {transaction.toAccount.name}
                </span>
              </>
            )}
            <span>•</span>
            <span>📅 {formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className={`text-xl font-bold ${config.color}`}>
            {config.prefix} {format(transaction.amount)}
          </p>
          <Badge variant={badgeVariant} size="sm" className="mt-1">
            {badgeLabel}
          </Badge>
        </div>
        <Button variant="danger" size="sm" onClick={() => onDelete(transaction.id)} disabled={isDeleting} aria-label={t("deleteButton")}>
          🗑️
        </Button>
      </div>
    </div>
  );
};

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  const t = useTranslations("transactionsPage");
  return (
    <div className="py-16 text-center">
      <div className="mb-4 text-6xl">📝</div>
      <h3 className="mb-2 text-xl font-bold text-primary-900">{t("empty.title")}</h3>
      <p className="max-w-md mx-auto mb-6 text-primary-600">{t("empty.description")}</p>
      <Button variant="primary" onClick={onCreateClick} size="lg">
        + {t("empty.action")}
      </Button>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="w-64 h-8" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  </div>
);

export const Transactions: React.FC = () => {
  const t = useTranslations("transactionsPage");
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { format } = useCurrency();
  const { addToast } = useToast();
  const { createTransaction, isCreating } = useTransactions();

  const { searchQuery, inputValue, setInputValue, currentPage, handlePageChange, selectedType, handleTypeChange, selectedCategory, handleCategoryChange, resetFilters } = useSearchPagination({
    defaultPage: 1,
    debounceMs: 800,
  });

  const { transactions, pagination, isLoading, deleteTransaction, isDeleting } = useTransactions({
    type: selectedType as TransactionFilter["type"],
    categoryId: selectedCategory,
    search: searchQuery,
    page: currentPage,
    limit: 20,
  });

  const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_DATA);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const getFilteredCategories = React.useCallback(
    (type: TransactionType) => {
      if (type === "TRANSFER") return [];
      return categories.filter((c) => c.type === type);
    },
    [categories],
  );

  const getDefaultCategory = React.useCallback(
    (type: TransactionType) => {
      const filtered = getFilteredCategories(type);
      return filtered.find((c) => c.isDefault) ?? filtered[0] ?? null;
    },
    [getFilteredCategories],
  );

  const categoryOptions = React.useMemo<SelectOption[]>(() => getFilteredCategories(formData.type).map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })), [formData.type, getFilteredCategories]);

  const accountOptions = React.useMemo<SelectOption[]>(() => accounts.map((a) => ({ value: a.id, label: `${a.icon} ${a.name}` })), [accounts]);

  const toAccountOptions = React.useMemo<SelectOption[]>(
    () => accounts.filter((a) => a.id !== formData.accountId).map((a) => ({ value: a.id, label: `${a.icon} ${a.name}` })),
    [accounts, formData.accountId],
  );

  const resetForm = React.useCallback(() => setFormData(INITIAL_FORM_DATA), []);

  const openModal = React.useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleChangeForm = React.useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        if (field === "type") {
          const newType = value as TransactionType;
          updated.toAccountId = "";

          if (newType === "TRANSFER") {
            updated.categoryId = "";
          } else {
            const defaultCat = getDefaultCategory(newType);
            updated.categoryId = defaultCat?.id ?? "";
          }
        }

        if (field === "accountId" && updated.toAccountId === value) updated.toAccountId = "";

        return updated;
      });
    },
    [getDefaultCategory],
  );

  const handleSubmitForm = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        addToast({ message: t("validation.amount"), type: "error" });
        return;
      }

      if (!formData.accountId) {
        addToast({ message: t("validation.account"), type: "error" });
        return;
      }

      if (formData.type === "TRANSFER" && formData.toAccountId && formData.toAccountId === formData.accountId) {
        addToast({ message: t("validation.sameAccount"), type: "error" });
        return;
      }

      if (formData.type !== "TRANSFER" && !formData.categoryId) {
        addToast({ message: t("validation.category"), type: "error" });
        return;
      }

      if (!formData.description.trim()) {
        addToast({ message: t("validation.description"), type: "error" });
        return;
      }

      const payload =
        formData.type === "TRANSFER"
          ? {
              type: formData.type,
              accountId: formData.accountId,
              toAccountId: formData.toAccountId || undefined,
              amount: parseFloat(formData.amount),
              description: formData.description.trim(),
              date: new Date(formData.date).toISOString(),
            }
          : {
              type: formData.type,
              accountId: formData.accountId,
              categoryId: formData.categoryId,
              amount: parseFloat(formData.amount),
              description: formData.description.trim(),
              date: new Date(formData.date).toISOString(),
            };

      createTransaction(payload, {
        onSuccess: () => {
          addToast({ message: t("success.created"), type: "success" });
          closeModal();
        },
        onError: (error: Error) => {
          addToast({ message: error.message || t("error.create"), type: "error" });
        },
      });
    },
    [formData, createTransaction, addToast, closeModal, t],
  );

  const handleDeleteClick = React.useCallback((id: string) => setDeleteId(id), []);

  const handleDeleteConfirm = React.useCallback(() => {
    if (!deleteId) return;
    deleteTransaction(deleteId, {
      onSuccess: () => {
        addToast({ message: t("success.deleted"), type: "success" });
        setDeleteId(null);
      },
      onError: (error: Error) => {
        addToast({ message: error.message || t("error.delete"), type: "error" });
        setDeleteId(null);
      },
    });
  }, [deleteId, deleteTransaction, addToast, t]);

  const hasActiveFilters = React.useMemo(() => selectedType || selectedCategory || searchQuery, [selectedType, selectedCategory, searchQuery]);

  const previewConfig = TYPE_CONFIG[formData.type];

  const previewSubtitle = React.useMemo(() => {
    if (formData.type === "TRANSFER") {
      const from = accounts.find((a) => a.id === formData.accountId)?.name ?? "—";
      const to = formData.toAccountId ? accounts.find((a) => a.id === formData.toAccountId)?.name : null;
      return to ? `${from} → ${to}` : from;
    }
    return categories.find((c) => c.id === formData.categoryId)?.name ?? t("modal.categoryLabel");
  }, [formData, accounts, categories, t]);

  const previewIcon = React.useMemo(() => {
    if (formData.type === "TRANSFER") return "🔄";
    return categories.find((c) => c.id === formData.categoryId)?.icon ?? "💰";
  }, [formData.type, formData.categoryId, categories]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">{t("title")}</h1>
          <p className="mt-1 text-primary-600">{t("subtitle")}</p>
        </div>
        <Button variant="primary" onClick={openModal} className="w-full sm:w-auto">
          + {t("addButton")}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-primary-900">{t("filter.title")}</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  🔄 {t("filter.clear")}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                label={t("filter.type")}
                options={[
                  { value: "", label: t("filter.allTypes") },
                  { value: "INCOME", label: `💰 ${t("income")}` },
                  { value: "EXPENSE", label: `💳 ${t("expense")}` },
                  { value: "TRANSFER", label: `🔄 ${t("transfer")}` },
                ]}
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
              />
              <Select
                label={t("filter.category")}
                options={[{ value: "", label: t("filter.allCategories") }, ...categoryOptions]}
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              />
              <Input label={t("filter.search")} placeholder={t("filter.searchPlaceholder")} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedType && (
                  <Badge variant="default" size="sm">
                    {t("filter.type")}: {selectedType}
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="default" size="sm">
                    {t("filter.category")}: {categories.find((c) => c.id === selectedCategory)?.name}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="default" size="sm">
                    {t("filter.search")}: &quot;{searchQuery}&quot;
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary-900">{transactions.length > 0 ? `${t("listTitle")} (${transactions.length})` : t("listTitle")}</h2>
            {pagination && (
              <p className="text-sm text-primary-600">
                {t("pagination.showing", {
                  start: (pagination.page - 1) * 20 + 1,
                  end: Math.min(pagination.page * 20, pagination.total),
                  total: pagination.total,
                })}
              </p>
            )}
          </div>

          {transactions.length === 0 ? (
            <EmptyState onCreateClick={openModal} />
          ) : (
            <>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} onDelete={handleDeleteClick} isDeleting={isDeleting} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 mt-6 border-t">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    ← {t("pagination.previous")}
                  </Button>
                  <span className="px-2 text-sm text-primary-600">
                    {t("pagination.page")} <strong>{pagination.page}</strong> {t("pagination.of")} <strong>{pagination.totalPages}</strong>
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>
                    {t("pagination.next")} →
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={`➕ ${t("modal.addTitle")}`} size="lg">
        <div className="space-y-4">
          <div className="p-3 border rounded-lg bg-primary-50 border-primary-200">
            <p className="text-sm font-medium text-primary-700">💡 {t("modal.hint")}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label={`${t("modal.type")} *`}
              options={[
                { value: "EXPENSE", label: `💳 ${t("expense")}` },
                { value: "INCOME", label: `💰 ${t("income")}` },
                { value: "TRANSFER", label: `🔄 ${t("transfer")}` },
              ]}
              value={formData.type}
              onChange={(e) => handleChangeForm("type", e.target.value)}
            />
            <Input
              type="number"
              label={`${t("modal.amount")} *`}
              placeholder={t("modal.amountPlaceholder")}
              value={formData.amount}
              onChange={(e) => handleChangeForm("amount", e.target.value)}
              icon={<span className="text-primary-600">Rp</span>}
              min="1"
              step="1000"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label={`${formData.type === "TRANSFER" ? t("modal.fromAccount") : t("modal.account")} *`}
              options={[{ value: "", label: t("modal.selected", { type: t("modal.account") }) }, ...accountOptions]}
              value={formData.accountId}
              onChange={(e) => handleChangeForm("accountId", e.target.value)}
              required
            />

            {formData.type === "TRANSFER" ? (
              <Select
                label={t("modal.toAccount")}
                options={[{ value: "", label: t("modal.toAccountOptional") }, ...toAccountOptions]}
                value={formData.toAccountId}
                onChange={(e) => handleChangeForm("toAccountId", e.target.value)}
              />
            ) : (
              <Select
                label={`${t("modal.category")} *`}
                options={[{ value: "", label: t("modal.selected", { type: t("modal.category") }) }, ...categoryOptions]}
                value={formData.categoryId}
                onChange={(e) => handleChangeForm("categoryId", e.target.value)}
                required
              />
            )}
          </div>

          <Input type="date" label={`${t("modal.date")} *`} value={formData.date} onChange={(e) => handleChangeForm("date", e.target.value)} max={new Date().toISOString().split("T")[0]} required />

          <Input
            type="text"
            label={`${t("modal.description")} *`}
            placeholder={t("modal.descriptionPlaceholder")}
            value={formData.description}
            onChange={(e) => handleChangeForm("description", e.target.value)}
            maxLength={200}
            required
          />

          {formData.amount && formData.description && (
            <div className="p-4 border rounded-lg bg-linear-to-br from-primary-50 to-neutral border-primary-200">
              <p className="mb-3 text-sm font-medium text-primary-700">{t("modal.preview")}:</p>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 text-xl rounded-full ${previewConfig.bg}`}>{previewIcon}</div>
                  <div>
                    <p className="font-medium text-primary-900">{formData.description}</p>
                    <p className="text-xs text-primary-600">{previewSubtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${previewConfig.color}`}>
                    {previewConfig.prefix} {format(formData.amount)}
                  </p>
                  <Badge variant={formData.type === "INCOME" ? "success" : formData.type === "TRANSFER" ? "info" : "error"} size="sm">
                    {formData.type}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isCreating}>
              {t("modal.cancel")}
            </Button>
            <Button onClick={handleSubmitForm} variant="primary" isLoading={isCreating}>
              {t("modal.create")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title={t("deleteModal.title")} size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="mb-1 font-medium text-red-900">{t("deleteModal.confirm")}</p>
              <p className="text-sm text-red-700">{t("deleteModal.warning")}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              {t("deleteModal.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} isLoading={isDeleting}>
              {t("deleteModal.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
