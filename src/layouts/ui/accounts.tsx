"use client";

import * as React from "react";

import { useTranslations } from "next-intl";

import { useAccounts } from "@/hooks";

import { Card, CardContent, Button, Input, Select, Modal, Badge, useToast } from "@/components";

import type { Account } from "@/types";

interface FormData {
  name: string;
  type: Account["type"];
  balance: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

interface EmptyStateProps {
  onCreateClick: () => void;
}

const ACCOUNT_TYPE_CONFIG: Record<Account["type"], { label: string; icon: string; color: string }> = {
  CASH: { label: "Cash", icon: "💵", color: "#10B981" },
  BANK: { label: "Bank Account", icon: "🏦", color: "#3B82F6" },
  EWALLET: { label: "E-Wallet", icon: "📱", color: "#8B5CF6" },
  CREDIT_CARD: { label: "Credit Card", icon: "💳", color: "#F59E0B" },
};

const COLOR_PALETTE = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#6366F1", "#84CC16", "#F97316"];

const ICON_SUGGESTIONS = ["💵", "🏦", "💳", "📱", "💰", "💸", "🏧", "💎", "🪙", "💴"];

const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit, onDelete }) => {
  const t = useTranslations("accountsPage");
  const accountConfig = ACCOUNT_TYPE_CONFIG[account.type];
  const balance = Number(account.balance);
  const isNegative = balance < 0;

  return (
    <Card variant="elevated" className="transition-all duration-300 hover:shadow-xl group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center text-3xl transition-transform w-14 h-14 rounded-2xl group-hover:scale-110" style={{ backgroundColor: account.color + "20" }}>
            {account.icon || accountConfig.icon}
          </div>
          {account.isDefault && (
            <Badge variant="info" size="sm">
              ⭐ {t("default")}
            </Badge>
          )}
        </div>

        <h3 className="mb-2 text-xl font-bold truncate text-primary-900" title={account.name}>
          {account.name}
        </h3>

        <Badge variant="outline" size="sm" className="mb-4">
          {accountConfig.icon} {t(`types.${account.type.toLowerCase()}`)}
        </Badge>

        <div className="mb-4">
          <p className={`text-3xl font-bold ${isNegative ? "text-red-600" : "text-primary-900"}`}>Rp {Math.abs(balance).toLocaleString("id-ID")}</p>
          {isNegative && <p className="mt-1 text-xs text-red-600">⚠️ {t("negativeBalance")}</p>}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(account)}>
            ✏️ {t("editButton")}
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(account.id)} aria-label={t("deleteButton")}>
            🗑️
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  const t = useTranslations("accountsPage");

  return (
    <Card className="col-span-full">
      <CardContent className="pt-6">
        <div className="py-16 text-center">
          <div className="mb-4 text-6xl">💰</div>
          <h3 className="mb-2 text-xl font-bold text-primary-900">{t("empty.title")}</h3>
          <p className="max-w-md mx-auto mb-6 text-primary-600">{t("empty.description")}</p>
          <Button variant="primary" onClick={onCreateClick} size="lg">
            + {t("empty.action")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Accounts: React.FC = () => {
  const t = useTranslations("accountsPage");
  const { accounts, createAccount, isCreating, deleteAccount, updateAccount, isUpdating, isDeleting } = useAccounts();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState<boolean>(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    type: "CASH",
    balance: "",
    color: "#10B981",
    icon: "💵",
    isDefault: false,
  });

  const summary = React.useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    const positiveBalance = accounts.filter((acc) => Number(acc.balance) > 0).reduce((sum, acc) => sum + Number(acc.balance), 0);
    const negativeBalance = accounts.filter((acc) => Number(acc.balance) < 0).reduce((sum, acc) => sum + Number(acc.balance), 0);

    const accountsByType = accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1;
      return acc;
    }, {} as Record<Account["type"], number>);

    return {
      total: accounts.length,
      totalBalance,
      positiveBalance,
      negativeBalance,
      accountsByType,
    };
  }, [accounts]);

  const resetForm = React.useCallback((): void => {
    setFormData({
      name: "",
      type: "CASH",
      balance: "",
      color: "#10B981",
      icon: "💵",
      isDefault: false,
    });
  }, []);

  const openCreateModal = React.useCallback((): void => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const closeCreateModal = React.useCallback((): void => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const openUpdateModal = React.useCallback((account: Account): void => {
    setSelectedAccount(account.id);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      color: account.color || "",
      icon: account.icon || "",
      isDefault: account.isDefault,
    });
    setIsUpdateModalOpen(true);
  }, []);

  const closeUpdateModal = React.useCallback((): void => {
    setIsUpdateModalOpen(false);
    setSelectedAccount(null);
    resetForm();
  }, [resetForm]);

  const handleCreate = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();

      if (!formData.name.trim() || !formData.balance) {
        addToast({ message: t("validation.required"), type: "error" });
        return;
      }

      if (formData.name.length > 50) {
        addToast({ message: t("validation.nameTooLong"), type: "error" });
        return;
      }

      const balance = parseFloat(formData.balance);

      if (isNaN(balance)) {
        addToast({ message: t("validation.invalidBalance"), type: "error" });
        return;
      }

      const isDuplicate = accounts.some((acc) => acc.name.toLowerCase() === formData.name.trim().toLowerCase());

      if (isDuplicate) {
        addToast({ message: t("validation.duplicate"), type: "error" });
        return;
      }

      createAccount(
        {
          ...formData,
          name: formData.name.trim(),
          balance,
        },
        {
          onSuccess: () => {
            addToast({ message: t("success.created"), type: "success" });
            closeCreateModal();
          },
          onError: (error: Error) => {
            addToast({ message: error.message || t("error.create"), type: "error" });
          },
        }
      );
    },
    [formData, accounts, createAccount, addToast, closeCreateModal, t]
  );

  const handleUpdate = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();

      if (!selectedAccount || !formData.name.trim() || !formData.balance) {
        addToast({ message: t("validation.required"), type: "error" });
        return;
      }

      const balance = parseFloat(formData.balance);

      if (isNaN(balance)) {
        addToast({ message: t("validation.invalidBalance"), type: "error" });
        return;
      }

      const isDuplicate = accounts.some((acc) => acc.name.toLowerCase() === formData.name.trim().toLowerCase() && acc.id !== selectedAccount);

      if (isDuplicate) {
        addToast({ message: t("validation.duplicate"), type: "error" });
        return;
      }

      updateAccount(
        {
          id: selectedAccount,
          data: {
            ...formData,
            name: formData.name.trim(),
            balance,
          },
        },
        {
          onSuccess: () => {
            addToast({ message: t("success.updated"), type: "success" });
            closeUpdateModal();
          },
          onError: (error: Error) => {
            addToast({ message: error.message || t("error.update"), type: "error" });
          },
        }
      );
    },
    [selectedAccount, formData, accounts, updateAccount, addToast, closeUpdateModal, t]
  );

  const handleDeleteClick = React.useCallback((id: string): void => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = React.useCallback((): void => {
    if (!deleteId) return;

    deleteAccount(deleteId, {
      onSuccess: () => {
        addToast({ message: t("success.deleted"), type: "success" });
        setDeleteId(null);
      },
      onError: (error: Error) => {
        addToast({
          message: error.message || t("error.delete"),
          type: "error",
        });
        setDeleteId(null);
      },
    });
  }, [deleteId, deleteAccount, addToast, t]);

  const handleFormChange = React.useCallback((field: keyof FormData, value: string | boolean): void => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "type" && typeof value === "string") {
        const config = ACCOUNT_TYPE_CONFIG[value as Account["type"]];
        updated.icon = config.icon;
        updated.color = config.color;
      }

      return updated;
    });
  }, []);

  const accountTypeOptions = React.useMemo(
    () =>
      Object.entries(ACCOUNT_TYPE_CONFIG).map(([value, config]) => ({
        value,
        label: `${config.icon} ${t(`types.${value.toLowerCase()}`)}`,
      })),
    [t]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">{t("title")}</h1>
          <p className="mt-1 text-primary-600">{t("subtitle")}</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="w-full sm:w-auto">
          + {t("addButton")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card variant="elevated" className="bg-linier-to-br from-primary-500 to-primary-600">
          <CardContent className="pt-6">
            <div className="text-center text-primary-900">
              <p className="mb-2 text-sm opacity-90">💰 {t("summary.totalBalance")}</p>
              <p className="text-4xl font-bold">Rp {summary.totalBalance.toLocaleString("id-ID")}</p>
              <p className="mt-2 text-xs opacity-75">
                {summary.total} {summary.total === 1 ? t("summary.account") : t("summary.accounts")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary-600">📈 {t("summary.assets")}</span>
                <span className="font-bold text-green-600">Rp {summary.positiveBalance.toLocaleString("id-ID")}</span>
              </div>
              {summary.negativeBalance < 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-600">📉 {t("summary.liabilities")}</span>
                  <span className="font-bold text-red-600">Rp {Math.abs(summary.negativeBalance).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium text-primary-900">{t("summary.netWorth")}</span>
                <span className={`font-bold ${summary.totalBalance >= 0 ? "text-primary-900" : "text-red-600"}`}>Rp {summary.totalBalance.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {accounts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 text-sm font-medium text-primary-900">{t("distribution")}</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([type, config]) => {
                const count = summary.accountsByType[type as Account["type"]] || 0;
                return (
                  <div key={type} className="p-3 text-center rounded-lg bg-primary-50">
                    <div className="mb-1 text-2xl">{config.icon}</div>
                    <p className="text-xs text-primary-600">{t(`types.${type.toLowerCase()}`)}</p>
                    <p className="text-lg font-bold text-primary-900">{count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-xl font-bold text-primary-900">{t("yourAccounts", { count: accounts.length })}</h2>
        {accounts.length === 0 ? (
          <EmptyState onCreateClick={openCreateModal} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} onEdit={openUpdateModal} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeCreateModal} title={`➕ ${t("modal.addTitle")}`} size="md">
        <div className="space-y-4">
          <div className="p-3 border rounded-lg bg-primary-50 border-primary-200">
            <p className="text-sm font-medium text-primary-700">💡 {t("modal.hint")}</p>
          </div>

          <Input
            type="text"
            label={`${t("modal.name")} *`}
            placeholder={t("modal.namePlaceholder")}
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            maxLength={50}
            required
          />

          <Select label={`${t("modal.type")} *`} options={accountTypeOptions} value={formData.type} onChange={(e) => handleFormChange("type", e.target.value)} />

          <Input
            type="number"
            label={`${t("modal.balance")} *`}
            placeholder={t("modal.balancePlaceholder")}
            value={formData.balance}
            onChange={(e) => handleFormChange("balance", e.target.value)}
            icon={<span className="text-primary-600">Rp</span>}
            step="1000"
            required
          />

          <div className="space-y-2">
            <Input label={`${t("modal.icon")} *`} type="text" placeholder="📁" value={formData.icon} onChange={(e) => handleFormChange("icon", e.target.value)} maxLength={4} />
            <p className="text-xs text-primary-600">{t("modal.quickSelect")}:</p>
            <div className="flex flex-wrap gap-2">
              {ICON_SUGGESTIONS.map((emoji) => (
                <button key={emoji} type="button" className="p-1 text-2xl transition-transform hover:scale-125" onClick={() => handleFormChange("icon", emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Input label={`${t("modal.color")} *`} type="color" value={formData.color} onChange={(e) => handleFormChange("color", e.target.value)} />
            <div className="flex flex-wrap justify-center flex-1 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${formData.color === color ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleFormChange("color", color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleFormChange("isDefault", e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isDefault" className="flex-1 text-sm font-medium text-primary-900">
              {t("modal.setDefault")}
              <span className="block mt-1 text-xs text-primary-600">{t("modal.defaultHint")}</span>
            </label>
          </div>

          <div className="p-4 border rounded-lg bg-linier-to-br from-primary-50 to-neutral border-primary-200">
            <p className="mb-3 text-sm font-medium text-primary-700">{t("modal.preview")}:</p>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl" style={{ backgroundColor: formData.color + "20" }}>
                {formData.icon || "💰"}
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary-900">{formData.name || t("modal.accountNameLabel")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" size="sm">
                    {t(`types.${formData.type.toLowerCase()}`)}
                  </Badge>
                  {formData.isDefault && (
                    <Badge variant="info" size="sm">
                      {t("default")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={closeCreateModal} disabled={isCreating}>
              {t("modal.cancel")}
            </Button>
            <Button onClick={handleCreate} variant="primary" isLoading={isCreating}>
              {t("modal.create")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isUpdateModalOpen} onClose={closeUpdateModal} title={`✏️ ${t("modal.updateTitle")}`} size="md">
        <div className="space-y-4">
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <p className="text-sm font-medium text-blue-700">ℹ️ {t("modal.updateHint")}</p>
          </div>

          <Input
            type="text"
            label={`${t("modal.name")} *`}
            placeholder={t("modal.namePlaceholder")}
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            maxLength={50}
            required
          />

          <Select label={`${t("modal.type")} *`} options={accountTypeOptions} value={formData.type} onChange={(e) => handleFormChange("type", e.target.value)} />

          <Input
            type="number"
            label={`${t("modal.currentBalance")} *`}
            placeholder={t("modal.currentBalancePlaceholder")}
            value={formData.balance}
            onChange={(e) => handleFormChange("balance", e.target.value)}
            icon={<span className="text-primary-600">Rp</span>}
            step="1000"
            required
          />

          <div>
            <label className="block mb-2 text-sm font-medium text-primary-900">{t("modal.icon")}</label>
            <Input type="text" placeholder="💰" value={formData.icon} onChange={(e) => handleFormChange("icon", e.target.value)} maxLength={4} />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-primary-900">{t("modal.color")}</label>
            <Input type="color" value={formData.color} onChange={(e) => handleFormChange("color", e.target.value)} className="w-20 h-10" />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral">
            <input
              type="checkbox"
              id="isDefaultUpdate"
              checked={formData.isDefault}
              onChange={(e) => handleFormChange("isDefault", e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isDefaultUpdate" className="text-sm font-medium text-primary-900">
              {t("modal.setDefault")}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={closeUpdateModal} disabled={isUpdating}>
              {t("modal.cancel")}
            </Button>
            <Button onClick={handleUpdate} variant="primary" isLoading={isUpdating}>
              {t("modal.update")}
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
