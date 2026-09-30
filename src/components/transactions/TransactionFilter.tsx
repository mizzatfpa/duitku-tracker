"use client";

// Milik Fikri — kontrol filter riwayat transaksi (SRS-FR-030, INTEGRATION_CONTRACT §5.2).
//
// Komponen ini murni presentational + callback: ia tidak memanggil server sendiri
// dan tidak melakukan navigasi. Setiap perubahan filter hanya meneruskan objek
// filter baru lewat `onFilterChange`, lalu parent (useTransactionAjax) yang memicu
// server action asinkron. Inilah inti alur zero-reload.
//
// Kontrak props dikunci di INTEGRATION_CONTRACT §5.2 supaya integrasi ke dashboard
// (Orang 4) tidak perlu penyesuaian.

import { useEffect, useId, useRef, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";

import type { FilterType } from "@/lib/transactions/filter";
import { CATEGORY_SUGGESTIONS } from "./validation";

export interface TransactionFilterProps {
  activeType: FilterType;
  selectedCategory?: string;
  searchQuery?: string;
  onFilterChange: (filters: {
    type: FilterType;
    category?: string;
    searchQuery?: string;
  }) => void;
  disabled?: boolean;
  /** Saran kategori untuk datalist. Default memakai CATEGORY_SUGGESTIONS. */
  categoryOptions?: readonly string[];
  /** Menunda pemanggilan onFilterChange agar tidak satu request per ketikan. */
  debounceMs?: number;
}

interface TypeOption {
  value: FilterType;
  label: string;
  /** Polek warna status di dalam pill aktif; design system tetap ungu. */
  accent: string;
}

const TYPE_OPTIONS: readonly TypeOption[] = [
  { value: "ALL", label: "Semua", accent: "bg-primary-500" },
  { value: "INCOME", label: "Pemasukan", accent: "bg-green-500" },
  { value: "EXPENSE", label: "Pengeluaran", accent: "bg-red-500" },
];

const DEFAULT_DEBOUNCE_MS = 300;

const fieldClass =
  "h-11 w-full rounded-xl border border-app-border bg-surface pl-9 pr-9 text-sm text-app-text shadow-sm transition placeholder:text-app-muted hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600";

/** Input native (type/category) dan input pencarian tidak bisa berbagi id yang sama. */
const nativeFieldClass =
  "h-11 w-full rounded-xl border border-app-border bg-surface px-3.5 text-sm text-app-text shadow-sm transition placeholder:text-app-muted hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-600";

const clearButtonClass =
  "absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-app-muted transition hover:bg-primary-100 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-primary-300";

export default function TransactionFilter({
  activeType,
  selectedCategory = "",
  searchQuery = "",
  onFilterChange,
  disabled = false,
  categoryOptions = CATEGORY_SUGGESTIONS,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: TransactionFilterProps) {
  const baseId = useId();
  const searchId = `${baseId}-search`;
  const categoryId = `${baseId}-category`;
  const groupId = `${baseId}-type`;

  // Kolom pencarian punya nilai lokal supaya ketikan tetap mulus; yang dikirim ke
  // parent baru setelah idle debounceMs agar tidak membanjiri server action.
  const [searchValue, setSearchValue] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pola "adjust state saat prop berubah" (dokumentasi React): menyelaraskan nilai
  // lokal dengan `searchQuery` dari parent saat parent mengembalikan state,
  // tanpa efek samping di dalam useEffect.
  const [syncedQuery, setSyncedQuery] = useState(searchQuery);
  if (searchQuery !== syncedQuery) {
    setSyncedQuery(searchQuery);
    setSearchValue(searchQuery);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function emit(nextType: FilterType, nextCategory: string, nextQuery: string) {
    if (disabled) return;
    const filters: { type: FilterType; category?: string; searchQuery?: string } = {
      type: nextType,
    };
    if (nextCategory.trim() !== "") filters.category = nextCategory.trim();
    if (nextQuery.trim() !== "") filters.searchQuery = nextQuery.trim();
    onFilterChange(filters);
  }

  function handleTypeChange(type: FilterType) {
    // Klik tab yang sedang aktif dipakai sebagai tombol "reset" jenis.
    const nextType = type === activeType ? "ALL" : type;
    emit(nextType, selectedCategory, searchValue);
  }

  function handleCategoryChange(value: string) {
    emit(activeType, value, searchValue);
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      emit(activeType, selectedCategory, value);
    }, debounceMs);
  }

  function handleClearAll() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setSearchValue("");
    emit("ALL", "", "");
  }

  const hasActiveFilter =
    activeType !== "ALL" || selectedCategory.trim() !== "" || searchValue.trim() !== "";

  return (
    <section
      aria-label="Filter riwayat transaksi"
      className="rounded-3xl border border-app-border bg-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-4 flex items-center gap-2 text-app-text dark:text-zinc-100">
        <ListFilter className="h-4 w-4 text-primary-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Filter transaksi</h2>
      </div>

      <div
        role="radiogroup"
        aria-label="Jenis transaksi"
        className="grid grid-cols-3 gap-2"
      >
        {TYPE_OPTIONS.map((option) => {
          const selected = activeType === option.value;
          return (
            <label
              key={option.value}
              className={`relative flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-2 text-sm font-medium transition focus-within:ring-2 focus-within:ring-primary-500/25 ${
                disabled ? "cursor-not-allowed opacity-60" : ""
              } ${
                selected
                  ? "border-primary-500 bg-primary-500 text-white shadow-[0_8px_24px_rgba(139,92,246,0.25)] hover:bg-primary-700"
                  : "border-app-border bg-surface text-app-muted hover:border-primary-300 hover:text-primary-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-primary-500 dark:hover:text-primary-300"
              }`}
            >
              <input
                type="radio"
                name={groupId}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => handleTypeChange(option.value)}
                className="sr-only"
              />
              {selected ? (
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${option.accent} ring-2 ring-white/70`}
                />
              ) : null}
              {option.label}
            </label>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Cari transaksi
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted"
          />
          <input
            id={searchId}
            name="searchQuery"
            type="search"
            autoComplete="off"
            placeholder="Cari kategori atau catatan…"
            value={searchValue}
            disabled={disabled}
            onChange={(event) => handleSearchChange(event.target.value)}
            className={fieldClass}
          />
          {searchValue !== "" ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleSearchChange("")}
              className={clearButtonClass}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Bersihkan pencarian</span>
            </button>
          ) : null}
        </div>

        <div>
          <label htmlFor={categoryId} className="sr-only">
            Filter kategori
          </label>
          <input
            id={categoryId}
            name="category"
            type="text"
            list={`${baseId}-category-options`}
            autoComplete="off"
            placeholder="Semua kategori"
            value={selectedCategory}
            disabled={disabled}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className={nativeFieldClass}
          />
          <datalist id={`${baseId}-category-options`}>
            {categoryOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
      </div>

      {hasActiveFilter ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={disabled}
            onClick={handleClearAll}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary-100 px-3 text-xs font-medium text-primary-700 transition hover:bg-primary-300/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Reset filter
          </button>
        </div>
      ) : null}
    </section>
  );
}
