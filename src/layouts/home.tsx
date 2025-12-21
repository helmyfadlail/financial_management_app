"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuickTransactions } from "@/hooks";
import { Card, CardContent, Button, Input, Select, Badge, useToast, useCurrency } from "@/components";
import type { Account, Category } from "@/types";

interface FormData {
  categoryId: string;
  accountId: string;
  amount: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string;
  date: string;
}

const INITIAL_FORM_DATA: FormData = {
  amount: "",
  type: "EXPENSE",
  description: "",
  date: new Date().toISOString().split("T")[0],
  categoryId: "",
  accountId: "",
};

export const Home: React.FC = () => {
  const { addToast } = useToast();
  const { format } = useCurrency();

  const router = useRouter();
  const { createTransaction, searchEmail, isCreating, isSearchingEmail } = useQuickTransactions();

  const [email, setEmail] = React.useState<string>("");
  const [emailVerified, setEmailVerified] = React.useState<boolean>(false);

  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_DATA);

  const getFilteredCategories = React.useCallback((type: FormData["type"]) => categories.filter((c) => c.type === type), [categories]);

  const getDefaultCategory = React.useCallback(
    (type: FormData["type"]) => {
      const filtered = getFilteredCategories(type);
      return filtered.find((c) => c.isDefault) || filtered[0];
    },
    [getFilteredCategories]
  );

  const getDefaultAccount = React.useCallback(() => {
    return accounts.find((a) => a.isDefault) || accounts[0];
  }, [accounts]);

  React.useEffect(() => {
    if (emailVerified && categories.length > 0 && accounts.length > 0) {
      const defaultCategory = getDefaultCategory(formData.type);
      const defaultAccount = getDefaultAccount();

      setFormData((prev) => ({
        ...prev,
        categoryId: defaultCategory?.id || "",
        accountId: defaultAccount?.id || "",
      }));
    }
  }, [emailVerified, categories, accounts, formData.type, getDefaultCategory, getDefaultAccount]);

  const categoryOptions = React.useMemo(() => {
    return getFilteredCategories(formData.type).map((c) => ({
      value: c.id,
      label: `${c.icon} ${c.name}`,
    }));
  }, [formData.type, getFilteredCategories]);

  const accountOptions = React.useMemo(() => {
    return accounts.map((a) => ({
      value: a.id,
      label: `${a.icon} ${a.name}`,
    }));
  }, [accounts]);

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "Please enter your email address";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validateForm = (): string | null => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return "Please enter a valid amount greater than 0";
    }
    if (!formData.categoryId) {
      return "Please select a category";
    }
    if (!formData.accountId) {
      return "Please select an account";
    }
    if (!formData.description.trim()) {
      return "Please add a description";
    }
    return null;
  };

  const handleEmailSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      addToast({ message: validationError, type: "error" });
      return;
    }

    searchEmail(email, {
      onSuccess: (data) => {
        setCategories(data.data.categories);
        setAccounts(data.data.accounts);
        setEmailVerified(true);
        addToast({ message: "Email verified! Ready to record transactions.", type: "success" });
      },
      onError: (error: Error) => {
        addToast({ message: error.message || "Failed to verify email. Please try again.", type: "error" });
        setEmailVerified(false);
      },
    });
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "type") {
        const defaultCategory = getDefaultCategory(value as FormData["type"]);
        if (defaultCategory) {
          updated.categoryId = defaultCategory.id;
        }
      }

      return updated;
    });
  };

  const handleTransactionSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      addToast({ message: validationError, type: "error" });
      return;
    }

    createTransaction(
      {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        categoryId: formData.categoryId,
        accountId: formData.accountId,
      },
      {
        onSuccess: () => {
          addToast({ message: "Transaction recorded! 🎉", type: "success" });
          setFormData(INITIAL_FORM_DATA);
        },
        onError: (error: Error) => {
          addToast({ message: error.message || "Failed to record transaction", type: "error" });
        },
      }
    );
  };

  const getTransactionColor = (type: FormData["type"]) => {
    switch (type) {
      case "INCOME":
        return { bg: "bg-green-100", text: "text-green-600", badge: "success" as const };
      case "TRANSFER":
        return { bg: "bg-blue-100", text: "text-blue-600", badge: "info" as const };
      default:
        return { bg: "bg-red-100", text: "text-red-600", badge: "error" as const };
    }
  };

  const getTransactionPrefix = (type: FormData["type"]) => {
    switch (type) {
      case "INCOME":
        return "+";
      case "TRANSFER":
        return "→";
      default:
        return "-";
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const selectedAccount = accounts.find((a) => a.id === formData.accountId);
  const transactionColor = getTransactionColor(formData.type);
  const showPreview = formData.amount && formData.description;

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8 bg-to-br from-primary-50 to-neutral">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-3 text-5xl sm:text-6xl">⚡</div>
          <h1 className="text-3xl font-bold sm:text-4xl text-primary-900">Quick Transaction</h1>
          <p className="px-4 mt-2 text-base sm:text-lg text-primary-600">Record your transactions instantly, no login required</p>
        </div>

        {/* How it works */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3 p-3 border rounded-lg sm:p-4 bg-primary-50 border-primary-200">
              <span className="hidden text-xl sm:block sm:text-2xl shrink-0">💡</span>
              <div className="flex-1 min-w-0">
                <p className="mb-2 text-sm font-medium sm:text-base text-primary-900">How it works:</p>
                <ul className="space-y-1 text-xs sm:text-sm text-primary-700">
                  <li>✓ Record transactions without creating an account</li>
                  <li>✓ Transactions saved locally on your device</li>
                  <li>✓ Perfect for quick expense tracking on the go</li>
                  <li>✓ Sign up later to sync and access advanced features</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            {/* Email Search Section - Hidden after verification */}
            {!emailVerified && (
              <div className="space-y-4">
                <Input type="email" label="Email Address *" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSearchingEmail} />
                <Button variant="primary" className="w-full" size="lg" isLoading={isSearchingEmail} onClick={handleEmailSubmit}>
                  {isSearchingEmail ? "Verifying..." : "Verify Email"}
                </Button>
              </div>
            )}

            {/* Transaction Form - Shown after verification */}
            {emailVerified && (
              <>
                <div className="flex items-center justify-between p-3 mb-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✓</span>
                    <span className="text-sm font-medium text-green-900">{email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEmailVerified(false);
                      setEmail("");
                      setFormData(INITIAL_FORM_DATA);
                      setAccounts([]);
                      setCategories([]);
                    }}
                    className="text-xs text-green-700 hover:text-green-900"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Select
                      label="Type *"
                      options={[
                        { value: "EXPENSE", label: "💳 Expense" },
                        { value: "INCOME", label: "💰 Income" },
                        { value: "TRANSFER", label: "🔄 Transfer" },
                      ]}
                      value={formData.type}
                      onChange={(e) => handleFieldChange("type", e.target.value)}
                    />

                    <Input
                      type="number"
                      label="Amount *"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => handleFieldChange("amount", e.target.value)}
                      icon={<span className="text-primary-600">Rp</span>}
                      required
                    />
                  </div>

                  <Select label="Account *" options={accountOptions} value={formData.accountId} onChange={(e) => handleFieldChange("accountId", e.target.value)} required />

                  <Select label="Category *" options={categoryOptions} value={formData.categoryId} onChange={(e) => handleFieldChange("categoryId", e.target.value)} required />

                  <Input type="date" label="Date *" value={formData.date} onChange={(e) => handleFieldChange("date", e.target.value)} max={new Date().toISOString().split("T")[0]} required />

                  <Input
                    type="text"
                    label="Description *"
                    placeholder="e.g., Lunch at restaurant, Salary payment"
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    maxLength={200}
                    required
                  />

                  {/* Preview */}
                  {showPreview && (
                    <div className="p-3 border rounded-lg sm:p-4 bg-to-br from-primary-50 to-neutral border-primary-200">
                      <p className="mb-3 text-xs font-medium sm:text-sm text-primary-700">Preview:</p>
                      <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3">
                          <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-lg sm:text-xl rounded-full shrink-0 ${transactionColor.bg}`}>
                            {selectedCategory?.icon || "💰"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate sm:text-base text-primary-900">{formData.description}</p>
                            <p className="text-xs truncate text-primary-600">
                              {selectedCategory?.name} • {selectedAccount?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-bold text-sm sm:text-base ${transactionColor.text}`}>
                            {getTransactionPrefix(formData.type)}
                            {format(formData.amount || "0")}
                          </p>
                          <Badge variant={transactionColor.badge} size="sm">
                            {formData.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleTransactionSubmit} variant="primary" className="w-full" size="lg" isLoading={isCreating}>
                    ⚡ Record Transaction
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CTA Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="p-6 text-center border-2 border-dashed rounded-lg border-primary-300 bg-primary-50">
              <div className="mb-3 text-4xl">🚀</div>
              <h3 className="mb-2 text-xl font-bold text-primary-900">Ready for More?</h3>
              <p className="mb-4 text-primary-600">Create a free account to sync your data, set budgets, and access powerful analytics</p>
              <div className="flex justify-center gap-3">
                <Button variant="primary" size="lg" onClick={() => router.push("/register")}>
                  Sign Up Free
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
                  Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
