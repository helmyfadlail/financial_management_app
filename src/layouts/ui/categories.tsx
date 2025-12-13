"use client";

import * as React from "react";

import { useTranslations } from "next-intl";

import { Card, CardContent, Button, Input, Select, Modal, Badge, useToast } from "@/components";

import { useCategories } from "@/hooks";

import type { Category } from "@/types";

interface FormData {
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  isDefault: boolean;
}

type FilterType = "ALL" | "INCOME" | "EXPENSE";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

interface EmptyStateProps {
  type: FilterType;
  onCreateClick: () => void;
}

const COLOR_PALETTE = ["#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#14B8A6", "#F97316", "#84CC16"];

const EMOJI_SUGGESTIONS = {
  INCOME: ["💰", "💵", "💸", "💳", "🏆", "📈", "💼", "🎁"],
  EXPENSE: ["🛒", "🍔", "🏠", "🚗", "⚡", "🎮", "👕", "📱", "✈️", "🏥", "📚", "🎬"],
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  const t = useTranslations("categoriesPage");
  const isIncome = category.type === "INCOME";

  return (
    <Card variant="elevated" className="transition-all duration-300 hover:shadow-xl group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center text-3xl transition-transform w-14 h-14 rounded-2xl group-hover:scale-110" style={{ backgroundColor: category.color + "20" }}>
            {category.icon}
          </div>
          {category.isDefault && (
            <Badge variant="info" size="sm">
              🔒 {t("default")}
            </Badge>
          )}
        </div>

        <h3 className="mb-2 text-lg font-bold truncate text-primary-900" title={category.name}>
          {category.name}
        </h3>

        <Badge variant={isIncome ? "success" : "error"} size="sm" className="mb-4">
          {isIncome ? `💰 ${t("income")}` : `💳 ${t("expense")}`}
        </Badge>

        <div className="flex gap-2">
          {!category.isDefault ? (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(category)}>
                ✏️ {t("editButton")}
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(category.id)} aria-label={t("deleteButton")}>
                🗑️
              </Button>
            </>
          ) : (
            <div className="flex-1 p-2 text-xs text-center rounded-lg text-primary-600 bg-primary-50">{t("cannotModify")}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState: React.FC<EmptyStateProps> = ({ type, onCreateClick }) => {
  const t = useTranslations("categoriesPage");

  const message = React.useMemo(() => {
    switch (type) {
      case "INCOME":
        return {
          icon: "💰",
          title: t("empty.income.title"),
          description: t("empty.income.description"),
        };
      case "EXPENSE":
        return {
          icon: "💳",
          title: t("empty.expense.title"),
          description: t("empty.expense.description"),
        };
      default:
        return {
          icon: "📁",
          title: t("empty.all.title"),
          description: t("empty.all.description"),
        };
    }
  }, [type, t]);

  return (
    <Card className="col-span-full">
      <CardContent className="pt-6">
        <div className="py-16 text-center">
          <div className="mb-4 text-6xl">{message.icon}</div>
          <h3 className="mb-2 text-xl font-bold text-primary-900">{message.title}</h3>
          <p className="max-w-md mx-auto mb-6 text-primary-600">{message.description}</p>
          <Button variant="primary" onClick={onCreateClick} size="lg">
            + {t("createButton")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const Categories: React.FC = () => {
  const t = useTranslations("categoriesPage");
  const { categories, createCategory, isCreating, updateCategory, deleteCategory, isDeleting } = useCategories();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [filterType, setFilterType] = React.useState<FilterType>("ALL");

  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    type: "EXPENSE",
    icon: "📁",
    color: "#8B5CF6",
    isDefault: false,
  });

  const { incomeCategories, expenseCategories, stats } = React.useMemo(() => {
    const filtered = categories.filter((cat) => {
      if (filterType === "ALL") return true;
      return cat.type === filterType;
    });

    const income = filtered.filter((c) => c.type === "INCOME");
    const expense = filtered.filter((c) => c.type === "EXPENSE");

    const stats = {
      total: categories.length,
      income: categories.filter((c) => c.type === "INCOME").length,
      expense: categories.filter((c) => c.type === "EXPENSE").length,
      custom: categories.filter((c) => !c.isDefault).length,
    };

    return {
      incomeCategories: income,
      expenseCategories: expense,
      stats,
    };
  }, [categories, filterType]);

  const resetForm = React.useCallback((): void => {
    setFormData({
      name: "",
      type: "EXPENSE",
      icon: "📁",
      color: "#8B5CF6",
      isDefault: false,
    });
  }, []);

  const openModal = React.useCallback((): void => {
    resetForm();
    setEditingCategory(null);
    setIsModalOpen(true);
  }, [resetForm]);

  const closeModal = React.useCallback((): void => {
    setIsModalOpen(false);
    setEditingCategory(null);
    resetForm();
  }, [resetForm]);

  const handleCreate = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();

      if (!formData.name.trim()) {
        addToast({ message: t("validation.required"), type: "error" });
        return;
      }

      if (formData.name.length > 50) {
        addToast({ message: t("validation.nameTooLong"), type: "error" });
        return;
      }

      const isDuplicate = categories.some((cat) => cat.name.toLowerCase() === formData.name.trim().toLowerCase() && cat.type === formData.type && cat.id !== editingCategory?.id);

      if (isDuplicate) {
        addToast({
          message: t("validation.duplicate", { type: t(formData.type.toLowerCase()) }),
          type: "error",
        });
        return;
      }

      if (editingCategory) {
        updateCategory(
          {
            id: editingCategory.id,
            data: { ...formData, name: formData.name.trim() },
          },
          {
            onSuccess: () => {
              addToast({ message: t("success.updated"), type: "success" });
              closeModal();
            },
            onError: (error: Error) => {
              addToast({ message: error.message || t("error.update"), type: "error" });
            },
          }
        );
      } else {
        createCategory(
          { ...formData, name: formData.name.trim() },
          {
            onSuccess: () => {
              addToast({ message: t("success.created"), type: "success" });
              closeModal();
            },
            onError: (error: Error) => {
              addToast({ message: error.message || t("error.create"), type: "error" });
            },
          }
        );
      }
    },
    [formData, editingCategory, categories, createCategory, updateCategory, addToast, closeModal, t]
  );

  const handleEdit = React.useCallback((category: Category): void => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || "📁",
      color: category.color || "#8B5CF6",
      isDefault: category.isDefault || false,
    });
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((id: string): void => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = React.useCallback((): void => {
    if (!deleteId) return;

    deleteCategory(deleteId, {
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
  }, [deleteId, deleteCategory, addToast, t]);

  const handleFormChange = React.useCallback((field: keyof FormData, value: string | boolean): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFilterChange = React.useCallback((type: FilterType): void => {
    setFilterType(type);
  }, []);

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

      {categories.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
                <p className="mt-1 text-sm text-primary-600">{t("stats.total")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.income}</p>
                <p className="mt-1 text-sm text-primary-600">{t("income")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.expense}</p>
                <p className="mt-1 text-sm text-primary-600">{t("expense")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-900">{stats.custom}</p>
                <p className="mt-1 text-sm text-primary-600">{t("stats.custom")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button variant={filterType === "ALL" ? "primary" : "outline"} onClick={() => handleFilterChange("ALL")} size="sm">
              📁 {t("filter.all")} ({stats.total})
            </Button>
            <Button variant={filterType === "INCOME" ? "primary" : "outline"} onClick={() => handleFilterChange("INCOME")} size="sm">
              💰 {t("income")} ({stats.income})
            </Button>
            <Button variant={filterType === "EXPENSE" ? "primary" : "outline"} onClick={() => handleFilterChange("EXPENSE")} size="sm">
              💳 {t("expense")} ({stats.expense})
            </Button>
          </div>
        </CardContent>
      </Card>

      {(filterType === "ALL" || filterType === "INCOME") && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary-900">💰 {t("incomeCategories", { count: incomeCategories.length })}</h2>
          </div>
          {incomeCategories.length === 0 ? (
            <EmptyState type="INCOME" onCreateClick={openModal} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {incomeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} onEdit={handleEdit} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}
        </div>
      )}

      {(filterType === "ALL" || filterType === "EXPENSE") && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary-900">💳 {t("expenseCategories", { count: expenseCategories.length })}</h2>
          </div>
          {expenseCategories.length === 0 ? (
            <EmptyState type="EXPENSE" onCreateClick={openModal} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {expenseCategories.map((category) => (
                <CategoryCard key={category.id} category={category} onEdit={handleEdit} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCategory ? `✏️ ${t("modal.editTitle")}` : `➕ ${t("modal.addTitle")}`} size="md">
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

          <Select
            label={`${t("modal.type")} *`}
            options={[
              { value: "INCOME", label: `💰 ${t("income")}` },
              { value: "EXPENSE", label: `💳 ${t("expense")}` },
            ]}
            value={formData.type}
            onChange={(e) => handleFormChange("type", e.target.value)}
            disabled={!!editingCategory}
          />

          <div className="space-y-2">
            <Input label={`${t("modal.icon")} *`} type="text" placeholder="📁" value={formData.icon} onChange={(e) => handleFormChange("icon", e.target.value)} maxLength={4} />
            <p className="text-xs text-primary-600">{t("modal.quickSelect")}:</p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_SUGGESTIONS[formData.type].map((emoji) => (
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
              id="isDefaultCategory"
              checked={formData.isDefault}
              onChange={(e) => handleFormChange("isDefault", e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isDefaultCategory" className="flex-1 text-sm font-medium text-primary-900">
              {t("modal.setDefault")}
              <span className="block mt-1 text-xs text-primary-600">{t("modal.defaultHint")}</span>
            </label>
          </div>

          <div className="p-4 border rounded-lg bg-linier-to-br from-primary-50 to-neutral border-primary-200">
            <p className="mb-3 text-sm font-medium text-primary-700">{t("modal.preview")}:</p>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-xl" style={{ backgroundColor: formData.color + "20" }}>
                {formData.icon || "📁"}
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary-900">{formData.name || t("modal.categoryNameLabel")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={formData.type === "INCOME" ? "success" : "error"} size="sm">
                    {formData.type === "INCOME" ? `💰 ${t("income")}` : `💳 ${t("expense")}`}
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
            <Button type="button" variant="ghost" onClick={closeModal} disabled={isCreating}>
              {t("modal.cancel")}
            </Button>
            <Button onClick={handleCreate} variant="primary" isLoading={isCreating}>
              {editingCategory ? t("modal.update") : t("modal.create")} {t("modal.categoryLabel")}
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
