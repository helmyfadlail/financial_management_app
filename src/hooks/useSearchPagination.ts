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

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [inputValue, setInputValue] = React.useState<string>("");
  const [selectedType, setSelectedType] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");

  const currentPage = Number(searchParams.get(pageParamName)) || defaultPage;

  // Debounce timer ref
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize from URL params
  React.useEffect(() => {
    const queryFromUrl = searchParams.get(searchParamName) || "";
    const typeFromUrl = searchParams.get(typeParamName) || "";
    const categoryFromUrl = searchParams.get(categoryParamName) || "";

    setSearchQuery(queryFromUrl);
    setInputValue(queryFromUrl);
    setSelectedType(typeFromUrl);
    setSelectedCategory(categoryFromUrl);
  }, [searchParams, searchParamName, typeParamName, categoryParamName]);

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
    [searchParams, pathname, router]
  );

  const handleSearch = React.useCallback(() => {
    updateSearchParams({
      [searchParamName]: inputValue,
      [pageParamName]: String(defaultPage),
    });
    setSearchQuery(inputValue);
  }, [inputValue, defaultPage, searchParamName, pageParamName, updateSearchParams]);

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      updateSearchParams({
        [pageParamName]: String(newPage),
      });
    },
    [pageParamName, updateSearchParams]
  );

  const handleTypeChange = React.useCallback(
    (type: string) => {
      updateSearchParams({
        [typeParamName]: type,
        [pageParamName]: String(defaultPage),
      });
      setSelectedType(type);
    },
    [typeParamName, pageParamName, defaultPage, updateSearchParams]
  );

  const handleCategoryChange = React.useCallback(
    (category: string) => {
      updateSearchParams({
        [categoryParamName]: category,
        [pageParamName]: String(defaultPage),
      });
      setSelectedCategory(category);
    },
    [categoryParamName, pageParamName, defaultPage, updateSearchParams]
  );

  const resetFilters = React.useCallback(() => {
    setInputValue("");
    setSearchQuery("");
    setSelectedType("");
    setSelectedCategory("");
    router.push(pathname);
  }, [pathname, router]);

  // Auto-search with debounce when input changes
  React.useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (inputValue !== searchQuery) {
        handleSearch();
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, searchQuery, debounceMs, handleSearch]);

  return {
    searchQuery,
    inputValue,
    setInputValue,
    handleSearch,
    currentPage,
    handlePageChange,
    selectedType,
    handleTypeChange,
    selectedCategory,
    handleCategoryChange,
    resetFilters,
  };
};
