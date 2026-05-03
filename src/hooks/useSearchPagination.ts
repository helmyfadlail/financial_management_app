"use client";

import * as React from "react";

import { useSearchParams } from "next/navigation";

import { useRouter, usePathname } from "@/i18n/navigation";

interface SearchPaginationOptions {
  defaultPage?: number;
  searchParamName?: string;
  pageParamName?: string;
  typeParamName?: string;
  categoryParamName?: string;
  debounceMs?: number;
}

interface SearchPaginationResult {
  searchQuery: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSearch: () => void;
  currentPage: number;
  handlePageChange: (newPage: number) => void;
  selectedType: string;
  handleTypeChange: (type: string) => void;
  selectedCategory: string;
  handleCategoryChange: (category: string) => void;
  resetFilters: () => void;
}

export const useSearchPagination = (options?: SearchPaginationOptions): SearchPaginationResult => {
  const { defaultPage = 1, searchParamName = "search", pageParamName = "page", typeParamName = "type", categoryParamName = "category", debounceMs = 500 } = options || {};

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentSearchQuery = searchParams.get(searchParamName) || "";
  const currentSelectedType = searchParams.get(typeParamName) || "";
  const currentSelectedCategory = searchParams.get(categoryParamName) || "";

  const [inputValue, setInputValue] = React.useState<string>(currentSearchQuery);
  const currentPage = Number(searchParams.get(pageParamName)) || defaultPage;

  // Debounce timer ref
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const updateSearchParams = React.useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      const newUrl = `${pathname}?${newParams.toString()}`;
      router.push(newUrl);
    },
    [searchParams, pathname, router],
  );

  const handleSearch = React.useCallback(() => {
    updateSearchParams({
      [searchParamName]: inputValue,
      [pageParamName]: String(defaultPage),
    });
  }, [inputValue, defaultPage, searchParamName, pageParamName, updateSearchParams]);

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      updateSearchParams({
        [pageParamName]: String(newPage),
      });
    },
    [pageParamName, updateSearchParams],
  );

  const handleTypeChange = React.useCallback(
    (type: string) => {
      updateSearchParams({
        [typeParamName]: type,
        [pageParamName]: String(defaultPage),
      });
    },
    [typeParamName, pageParamName, defaultPage, updateSearchParams],
  );

  const handleCategoryChange = React.useCallback(
    (category: string) => {
      updateSearchParams({
        [categoryParamName]: category,
        [pageParamName]: String(defaultPage),
      });
    },
    [categoryParamName, pageParamName, defaultPage, updateSearchParams],
  );

  const resetFilters = React.useCallback(() => {
    setInputValue("");
    router.push(pathname);
  }, [pathname, router]);

  // Auto-search with debounce when input changes
  React.useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (inputValue !== currentSearchQuery) {
        handleSearch();
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, currentSearchQuery, debounceMs, handleSearch]);

  return {
    searchQuery: currentSearchQuery,
    inputValue,
    setInputValue,
    handleSearch,
    currentPage,
    handlePageChange,
    selectedType: currentSelectedType,
    handleTypeChange,
    selectedCategory: currentSelectedCategory,
    handleCategoryChange,
    resetFilters,
  };
};
