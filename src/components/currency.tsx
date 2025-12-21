"use client";

import * as React from "react";

import { useSettings } from "@/hooks";

import { CURRENCY_OPTIONS } from "@/static";

interface CurrencyContextType {
  currency: string;
  rates: Record<string, number> | null;
  isLoading: boolean;
  format: (amount: number | string, fromCurrency?: string) => string;
}

const getCurrencySymbol = (currency: string): string => {
  const option = CURRENCY_OPTIONS.find((opt) => opt.value === currency);
  return option?.symbol || currency;
};

const ZERO_DECIMAL_CURRENCIES = new Set(["IDR", "JPY", "KRW"]);
const DEFAULT_CURRENCY = "IDR";
const BASE_CURRENCY = "IDR";

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notifications, isLoading: isSettingsLoading, exchangeRates, isLoadingRates } = useSettings();
  const [currency, setCurrency] = React.useState<string>(DEFAULT_CURRENCY);

  const symbol = React.useMemo(() => getCurrencySymbol(currency), [currency]);

  React.useEffect(() => {
    if (notifications) {
      const currencyValue = notifications.find((n) => n.key === "currency")?.value;
      if (currencyValue && typeof currencyValue === "string") {
        setCurrency(currencyValue);
      }
    }
  }, [notifications]);

  const format = React.useCallback(
    (amount: number | string, fromCurrency: string = BASE_CURRENCY): string => {
      const num = typeof amount === "string" ? parseFloat(amount) : amount;
      if (isNaN(num) || num === null || num === undefined) {
        return `${symbol} 0`;
      }

      let convertedAmount = num;
      if (fromCurrency !== currency && exchangeRates) {
        if (fromCurrency === BASE_CURRENCY) {
          const rate = exchangeRates[currency];
          if (rate) convertedAmount = num * rate;
        } else if (currency === BASE_CURRENCY) {
          const rate = exchangeRates[fromCurrency];
          if (rate) convertedAmount = num / rate;
        } else {
          const fromRate = exchangeRates[fromCurrency];
          const toRate = exchangeRates[currency];
          if (fromRate && toRate) convertedAmount = (num / fromRate) * toRate;
        }
      }

      const decimals = ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;

      const localeMap: Record<string, string> = {
        USD: "en-US",
        EUR: "de-DE",
        JPY: "ja-JP",
        GBP: "en-GB",
        AUD: "en-AU",
        CAD: "en-CA",
        CHF: "de-CH",
        CNY: "zh-CN",
        IDR: "id-ID",
        HKD: "zh-HK",
      };

      const locale = localeMap[currency] || "en-US";
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(convertedAmount);

      return `${symbol} ${formatted}`;
    },
    [currency, symbol, exchangeRates]
  );

  const value: CurrencyContextType = React.useMemo(
    () => ({
      currency,
      rates: exchangeRates,
      isLoading: isSettingsLoading || isLoadingRates,
      format,
    }),
    [currency, exchangeRates, isSettingsLoading, isLoadingRates, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextType => {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
